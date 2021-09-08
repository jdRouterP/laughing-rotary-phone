//@ts-nocheck
import { request, gql } from 'graphql-request'
import {  GRAPH_API_DFYN_V5, GRAPH_API_PREDICTION } from '../../constants'
import { Bet, BetPosition, Market, PredictionStatus, Round, RoundData } from './types'
// import PREDICTION_MARKET_ABI  from '../../constants/abis/prediction-contract.json'

import {
  BetResponse,
  getRoundBaseFields,
  getBetBaseFields,
  getUserBaseFields,
  RoundResponse,
  MarketResponse,
} from './queries'
import { usePredictionContract } from 'hooks/useContract'
import { ChainId, Currency, Token } from '@dfyn/sdk'
import { useActiveWeb3React } from 'hooks'
import { useMemo } from 'react'

export enum Result {
  WIN = 'win',
  LOSE = 'lose',
  CANCELED = 'canceled',
  LIVE = 'live',
}

export const numberOrNull = (value: string) => {
  if (value === null) {
    return null
  }

  const valueNum = Number(value)
  return Number.isNaN(valueNum) ? null : valueNum
}

export const makeFutureRoundResponse = (epoch: number, startBlock: number): RoundResponse => {

  return {
    id: epoch.toString(),
    epoch: epoch.toString(),
    startBlock: startBlock.toString(),
    failed: null,
    startAt: null,
    lockAt: null,
    lockBlock: null,
    lockPrice: null,
    endBlock: null,
    closePrice: null,
    totalBets: '0',
    totalAmount: '0',
    bearBets: '0',
    bullBets: '0',
    bearAmount: '0',
    bullAmount: '0',
    position: null,
    bets: [],
  }
}

export const transformBetResponse = (betResponse: BetResponse): Bet => {
  const bet = {
    id: betResponse.id,
    hash: betResponse.hash,
    amount: betResponse.amount ? parseFloat(betResponse.amount) : 0,
    position: betResponse.position === 'Bull' ? BetPosition.BULL : BetPosition.BEAR,
    claimed: betResponse.claimed,
    claimedHash: betResponse.claimedHash,
    user: {
      id: betResponse.user.id,
      address: betResponse.user.address,
      block: numberOrNull(betResponse.user.block),
      totalBets: numberOrNull(betResponse.user.totalBets),
      totalBNB: numberOrNull(betResponse.user.totalBNB),
    },
  } as Bet

  if (betResponse.round) {
    bet.round = transformRoundResponse(betResponse.round)
  }

  return bet
}

export const transformRoundResponse = (roundResponse: RoundResponse): Round => {
  const {
    id,
    epoch,
    failed,
    startBlock,
    startAt,
    lockAt,
    lockBlock,
    lockPrice,
    endBlock,
    closePrice,
    totalBets,
    totalAmount,
    bullBets,
    bearBets,
    bearAmount,
    bullAmount,
    position,
    bets = [],
  } = roundResponse

  const getRoundPosition = (positionResponse: string) => {
    if (positionResponse === 'Bull') {
      return BetPosition.BULL
    }

    if (positionResponse === 'Bear') {
      return BetPosition.BEAR
    }

    return null
  }

  return {
    id,
    failed,
    epoch: numberOrNull(epoch),
    startBlock: numberOrNull(startBlock),
    startAt: numberOrNull(startAt),
    lockAt: numberOrNull(lockAt),
    lockBlock: numberOrNull(lockBlock),
    lockPrice: lockPrice ? parseFloat(lockPrice) : null,
    endBlock: numberOrNull(endBlock),
    closePrice: closePrice ? parseFloat(closePrice) : null,
    totalBets: numberOrNull(totalBets),
    totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
    bullBets: numberOrNull(bullBets),
    bearBets: numberOrNull(bearBets),
    bearAmount: numberOrNull(bearAmount),
    bullAmount: numberOrNull(bullAmount),
    position: getRoundPosition(position),
    bets: bets.map(transformBetResponse),
  }
}

export const transformMarketResponse = (marketResponse: MarketResponse): Market => {
  if (marketResponse === null) {
    return {
      id: '0',
      paused: true,
      epoch: 0,
    }
  } else
    return {
      id: marketResponse.id,
      paused: marketResponse.paused,
      epoch: Number(marketResponse.epoch.epoch),
    }
}

export const makeRoundData = (rounds: Round[]): RoundData => {
  return rounds.reduce((accum, round) => {
    return {
      ...accum,
      [round.id]: round,
    }
  }, {})
}

export const getRoundResult = (bet: Bet, currentEpoch: number): Result => {
  const { round } = bet
  if (round.failed) {
    return Result.CANCELED
  }

  if (round.epoch >= currentEpoch - 1) {
    return Result.LIVE
  }
  const roundResultPosition = round.closePrice > round.lockPrice ? BetPosition.BULL : round.closePrice === round.lockPrice ? BetPosition.HOUSE : BetPosition.BEAR

  return bet.position === roundResultPosition ? Result.WIN : Result.LOSE
}

/**
 * Given a bet object, check if it is eligible to be claimed or refunded
 */
export const getCanClaim = (bet: Bet | BetResponse) => {
  return !bet.claimed && (bet.position === bet.round.position || bet.round.failed === true)
}

/**
 * Returns only bets where the user has won.
 * This is necessary because the API currently cannot distinguish between an uncliamed bet that has won or lost
 */
export const getUnclaimedWinningBets = (bets: Bet[] | BetResponse[]): Bet[] => {
  return bets.filter(getCanClaim)
}

/**
 * Gets static data from the contract
 */
export const useStaticPredictionsData = async (AddressValue: string | undefined) => {
  const contract = usePredictionContract(AddressValue);
  
  if (!contract) return;

  try {
    const currentEpoch = await contract.currentEpoch();
    const interval = await contract.interval();
    const minBetAmount = await contract.minBetAmount();
    const isPaused = await contract.paused();
    const buffer = await contract.buffer();
    const rewardRate = await contract.rewardRate();
    
    return {
      status: isPaused ? PredictionStatus.PAUSED : PredictionStatus.LIVE,
      currentEpoch: Number(currentEpoch),
      interval: Number(interval),
      buffer: Number(buffer),
      minBetAmount: minBetAmount.toNumber(),
      rewardRate: rewardRate.toNumber()
    }
  } catch (error) {
    console.log(error)
  }

}

export const getMarketData = async (API_INFO: string): Promise<{
  rounds: Round[]
  market: Market
}> => {

  const response = (await request(
    API_INFO,
    gql`
      query getMarketData {
        rounds(first: 5, orderBy: epoch, orderDirection: desc) {
          ${getRoundBaseFields()}
        }
        market(id: 1) {
          id
          paused
          epoch {
            epoch
          }
        }
      }
    `,
  )) as { rounds: RoundResponse[]; market: MarketResponse }

  return {
    rounds: response.rounds.map(transformRoundResponse),
    market: transformMarketResponse(response.market),
  }
}

// Fetch vDFYN volume for most recent day
export const getVDFYNVolumeUSD = async () => {
  const response = await request(
    GRAPH_API_DFYN_V5,
    gql`
      query getUniswapDayDatas {
        uniswapDayDatas(first: 1, skip: 1, orderBy: date, orderDirection: desc) {
          dailyVolumeUSD
          date
        }
      }
  `,
  )
  return response?.uniswapDayDatas[0]?.dailyVolumeUSD || 0
}

export const getRound = async (id: string) => {
  const response = await request(
    GRAPH_API_PREDICTION,
    gql`
      query getRound($id: ID!) {
        round(id: $id) {
          ${getRoundBaseFields()}
          bets {
           ${getBetBaseFields()}
            user {
             ${getUserBaseFields()}
            }
          }
        }
      }
  `,
    { id },
  )
  return response.round
}

type BetHistoryWhereClause = Record<string, string | number | boolean | string[]>

export const getBetHistory = async (
  GraphValue: string,
  where: BetHistoryWhereClause = {},
  first = 1000,
  skip = 0,
): Promise<BetResponse[]> => {
  const response = await request(
    GraphValue,
    gql`
      query getBetHistory($first: Int!, $skip: Int!, $where: Bet_filter) {
        bets(first: $first, skip: $skip, where: $where) {
          ${getBetBaseFields()}
          round {
            ${getRoundBaseFields()}
          }
          user {
            ${getUserBaseFields()}
          } 
        }
      }
    `,
    { first, skip, where },
  )
  return response.bets
}

export const getBet = async (betId: string, GraphValue: string): Promise<BetResponse> => {
  const response = await request(
    GraphValue,
    gql`
      query getBet($id: ID!) {
        bet(id: $id) {
          ${getBetBaseFields()}
          round {
            ${getRoundBaseFields()}
          }
          user {
            ${getUserBaseFields()}
          } 
        }
      }
  `,
    {
      id: betId.toLowerCase(),
    },
  )
  return response.bet
}


//Prediction market Pair
export const PREDICTION_INFO: {
  [chainId in ChainId]?: {
    id: number
    candleSize: string
    currency: Currency | Token
    GRAPH_API_PREDICTION: string
    prediction_address: string
  }[]
} = {
  [ChainId.MATIC]: [
    {
      id: 1,
      candleSize: "5",
      currency: Currency.getNativeCurrency(137),
      GRAPH_API_PREDICTION: 'https://api.thegraph.com/subgraphs/name/iamshashvat/matic-prediction',
      prediction_address: '0x150B4fD25c7c0c65301e86B599822f2feeCC29E7'
    },
    {
      id: 2,
      candleSize: "15",
      currency: Currency.getNativeCurrency(137),
      GRAPH_API_PREDICTION: 'https://api.thegraph.com/subgraphs/name/iamshashvat/matic-prediction-v2',
      prediction_address: '0xdc2cb17ec40832e502a9723541c1db96e85e7e5d'
    },
    {
      id: 3,
      candleSize: "60",
      currency: Currency.getNativeCurrency(137),
      GRAPH_API_PREDICTION: 'https://api.thegraph.com/subgraphs/name/iamshashvat/matic-prediction-v3',
      prediction_address: '0xd53a50878eeBb092Fd8E15eBBEf75335D1bB12E7'
    }
  ]
}

export interface PredictionInfo {
  id: number,
  candleSize: string,
  currency: Currency | Token
  GRAPH_API_PREDICTION: string
  prediction_address: string
  round: number | string
}
export function usePredictionInfo(currencyA?: string | null, candleSize: string = ''): PredictionInfo[] {
  const { chainId } = useActiveWeb3React()
  
  // const info = [...PREDICTION_INFO[chainId ?? 137]]
  const info = useMemo(
    ()=>
      chainId
      ? PREDICTION_INFO[chainId]?.filter(predictionInfos =>
        currencyA === undefined
        ? true
        : currencyA === null
          ? false
          : (predictionInfos.currency.symbol === currencyA && predictionInfos.candleSize === candleSize)
        ) ?? []
        : [] ,
      [chainId, currencyA, candleSize]
    )
  
  // async function round(){
  //   const rounds = await getMarketData(info[index].GRAPH_API_PREDICTION)
  // }
  // round()
  // console.log("Roundsss::", rounds);

  const predictionIds = useMemo(() => info.map(({ id }) => id), [info])
  return useMemo(() => {
    if (!chainId) return []
    return predictionIds.reduce<PredictionInfo[]>((memo, predictionIdss, index) => {
      memo.push({
        id: predictionIdss, 
        candleSize: info[index].candleSize,
        currency: info[index].currency,
        GRAPH_API_PREDICTION: info[index].GRAPH_API_PREDICTION,
        prediction_address: info[index].prediction_address
      })
    return memo
    }, [])
  }, [
    info,
    chainId,
    predictionIds,
  ])
}