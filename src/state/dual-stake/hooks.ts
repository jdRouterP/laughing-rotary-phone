import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@uniswap/sdk'
import { useMemo } from 'react'
import { UNI, ROUTE, REWARD_TOKENS, EMPTY, DFYN, USDC, ZEE } from '../../constants'
import { STAKING_REWARDS_DUAL_FARMS_INTERFACE } from '../../constants/abis/staking-rewards-dual-farms'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { usePair } from 'data/Reserves'

export const STAKING_GENESIS = 1622124960

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    rewardTokens: [Token, Token]
    baseToken?: Token
    stakingRewardAddress: string
  }[]
} = {
  [ChainId.MATIC]: [
    {
      tokens: [ROUTE, DFYN],
      rewardTokens: [ROUTE, DFYN],
      baseToken: DFYN,
      stakingRewardAddress: '0xf997c8e2e7e7387C8fd9120280ad9B3db31A5381'
    },
    {
      tokens: [DFYN, ZEE],
      rewardTokens: [DFYN, ZEE],
      baseToken: DFYN,
      stakingRewardAddress: '0xfB75d80e141b91535dA513370D4Dd33D0E19d308'
    }
  ]
}

interface TypeOfpools {
  typeOf: string
  url: string
}
export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  type: TypeOfpools
  baseToken: any
  tokens: [Token, Token]
  rewardAddresses: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  earnedAmountTwo: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  totalRewardRateTwo: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  rewardRateTwo: TokenAmount
  dfynPrice: Number
  routePrice: Number
  // when the period ends
  periodFinish: Date | undefined
  // if pool is active
  active: boolean
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    rewardToken: Token,
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const [, dfynUsdcPair] = usePair(USDC, DFYN);
  const [, routeUsdcPair] = usePair(USDC, ROUTE);
  const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))
  const routePrice = Number(routeUsdcPair?.priceOf(ROUTE)?.toSignificant(6))
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1])
        ) ?? []
        : [],
    [chainId, pairToFilterBy]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const stakingRewardAddress = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const bothRewardToken = useMemo(() => info.map(({ rewardTokens }) => rewardTokens), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(stakingRewardAddress, STAKING_REWARDS_DUAL_FARMS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(stakingRewardAddress, STAKING_REWARDS_DUAL_FARMS_INTERFACE, 'bothTokensEarned', accountArg)
  const totalSupplies = useMultipleContractSingleData(stakingRewardAddress, STAKING_REWARDS_DUAL_FARMS_INTERFACE, 'totalSupply')

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    stakingRewardAddress,
    STAKING_REWARDS_DUAL_FARMS_INTERFACE,
    'bothTokensRewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    stakingRewardAddress,
    STAKING_REWARDS_DUAL_FARMS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return stakingRewardAddress.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const rewardAddresses = bothRewardToken[index]
      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error
        ) {

          console.error('Failed to load staking rewards info')
          return memo
        }

        const getTokenByAddress = (address: string) => {
          const token = REWARD_TOKENS.filter(token => token.address?.toLowerCase() === address?.toLowerCase())
          if (token.length) {
            return token[0]
          } else {
            return EMPTY;
          }
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        // check for account, if no account set to 0
        const rewardTokenOne = getTokenByAddress(rewardRateState.result?.[0][0])
        const rewardTokenTwo = getTokenByAddress(rewardRateState.result?.[0][1])
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const rewardRateTokenOne = new TokenAmount(rewardTokenOne, JSBI.BigInt(rewardRateState.result?.[1][0]))
        const rewardRateTokenTwo = new TokenAmount(rewardTokenTwo, JSBI.BigInt(rewardRateState.result?.[1][1]))
        const getHypotheticalRewardRate = (
          rewardToken: Token,
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            rewardToken,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(rewardTokenOne, stakedAmount, totalStakedAmount, rewardRateTokenOne)
        const individualRewardRateTwo = getHypotheticalRewardRate(rewardTokenTwo, stakedAmount, totalStakedAmount, rewardRateTokenTwo)

        const periodFinishSeconds = periodFinishState.result?.[0]?.toNumber()
        const periodFinishMs = periodFinishSeconds * 1000
        // compare period end timestamp vs current block timestamp (in seconds)
        const active =
          periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp.toNumber() : true

        memo.push({
          type: { typeOf: 'Dual Farms', url: 'dual-farms' },
          rewardAddresses,
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          tokens: info[index].tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(rewardTokenOne, JSBI.BigInt(earnedAmountState?.result?.[1][0] ?? 0)),
          earnedAmountTwo: new TokenAmount(rewardTokenTwo, JSBI.BigInt(earnedAmountState?.result?.[1][1] ?? 0)),
          rewardRate: individualRewardRate,
          rewardRateTwo: individualRewardRateTwo,
          totalRewardRate: rewardRateTokenOne,
          totalRewardRateTwo: rewardRateTokenTwo,
          stakedAmount: stakedAmount,
          dfynPrice,
          routePrice,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          active
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    stakingRewardAddress,
    totalSupplies,
    uni
  ])
}

export function useTotalDualFarmUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!uni) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmountTwo),
        new TokenAmount(uni, '0')
      ) ?? new TokenAmount(uni, '0')
    )
  }, [stakingInfos, uni])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

  const parsedAmount = parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}