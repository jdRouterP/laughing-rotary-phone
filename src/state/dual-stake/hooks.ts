import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@dfyn/sdk'
import { useMemo } from 'react'
import { UNI, ROUTE, REWARD_TOKENS, EMPTY, DFYN, USDC, ZEE, AURORA, BOOTY, ROYA, SX, EZ, UFARM, NWC, mRTK, XUSD, XDO } from '../../constants'
import { STAKING_REWARDS_DUAL_FARMS_INTERFACE } from '../../constants/abis/staking-rewards-dual-farms'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { usePairsWithBaseToken } from 'data/Reserves'


export const STAKING_GENESIS = 1622124960

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    rewardTokens: [Token, Token]
    baseToken?: Token
    start: number
    stakingRewardAddress: string
  }[]
} = {
  [ChainId.MATIC]: [
    {
      tokens: [XUSD, DFYN],
      rewardTokens: [DFYN, XDO],
      baseToken: DFYN,
      start: 1624980600000,
      stakingRewardAddress: '0xc6Cface612849C1D378Fbfe8Bdf49D01bbf569Bb'
    },
    {
      tokens: [ROUTE, DFYN],
      rewardTokens: [ROUTE, DFYN],
      baseToken: DFYN,
      start: 1622033000000,
      stakingRewardAddress: '0xf997c8e2e7e7387C8fd9120280ad9B3db31A5381'
    },
    {
      tokens: [EZ, DFYN],
      rewardTokens: [DFYN, EZ],
      baseToken: DFYN,
      start: 1624552200000,
      stakingRewardAddress: '0xA8453cFae7EC47e7099115789258226C5cb75534'
    },
    {
      tokens: [UFARM, DFYN],
      rewardTokens: [DFYN, UFARM],
      baseToken: DFYN,
      start: 1624552200000,
      stakingRewardAddress: '0x7ba448d0b438723fFffDB3b842AA72e6EB7588C5'
    },
    {
      tokens: [NWC, DFYN],
      rewardTokens: [DFYN, NWC],
      baseToken: DFYN,
      start: 1624552200000,
      stakingRewardAddress: '0x91174CBa63E8A2A1755ba473820183e4e64a3Dc8'
    },
    {
      tokens: [mRTK, DFYN],
      rewardTokens: [DFYN, mRTK],
      baseToken: DFYN,
      start: 1624552200000,
      stakingRewardAddress: '0x5190430648eD5E8879665c36e0CE8Bd76f1449B8'
    },
    {
      tokens: [SX, DFYN],
      rewardTokens: [DFYN, SX],
      baseToken: DFYN,
      start: 1623947400000,
      stakingRewardAddress: '0x9a9592279B61A875BEc036091D96cc4093B374C0'
    },
    {
      tokens: [BOOTY, DFYN],
      rewardTokens: [DFYN, BOOTY],
      baseToken: DFYN,
      start: 1623762000000,
      stakingRewardAddress: '0x2980acaa5cBcA993B3868ef54B88CE328bCA06f7'
    },
    {
      tokens: [ROYA, DFYN],
      rewardTokens: [DFYN, ROYA],
      baseToken: DFYN,
      start: 1623762000000,
      stakingRewardAddress: '0x32c449fcA14954b3848378c01C5439d525c2f0b2'
    },
    {
      tokens: [ZEE, DFYN],
      rewardTokens: [DFYN, ZEE],
      baseToken: DFYN,
      start: 1622133000000,
      stakingRewardAddress: '0xfB75d80e141b91535dA513370D4Dd33D0E19d308'
    },
    {
      tokens: [AURORA, DFYN],
      rewardTokens: [DFYN, AURORA],
      baseToken: DFYN,
      start: 1622478600000,
      stakingRewardAddress: '0x4Dd06f2D7746330C279Fdfa7a75407165eb1D845'
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
  tokenOnePrice: Number
  tokenTwoPrice: Number
  start: number
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
  const start = useMemo(() => info.map(({ start }) => start), [info])
  const accountArg = useMemo(() => [account ?? undefined], [account])
  const values = usePairsWithBaseToken(USDC, bothRewardToken);


  //get price of tokens 
  let tokenPrices: any = [];
  const getCorrectToken = (value: Pair | null) => {
    if (value)
      return value.token0.symbol === "USDC" ? value.priceOf(value.token1) : value.priceOf(value.token0);
    else
      return null;
  }
  for (let i = 0; i < values.length; i += 2) {
    let [, usdPair] = values[i];
    let price = getCorrectToken(usdPair);
    let [, usdPair2] = values[i + 1]
    let price2 = getCorrectToken(usdPair2);

    tokenPrices.push([Number(price?.toSignificant(6)), Number(price2?.toSignificant(6))])
  }
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
      const startTime = start[index]
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
          start: startTime,
          tokenOnePrice: tokenPrices[index][0] ?? 0,
          tokenTwoPrice: tokenPrices[index][1] ?? 0,
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
    uni,
    bothRewardToken,
    start,
    tokenPrices
  ])
}

const getTokenByAddress = (address: string) => {
  const token = REWARD_TOKENS.filter(token => token.address?.toLowerCase() === address?.toLowerCase())
  if (token.length) {
    return token[0]
  } else {
    return EMPTY;
  }
}

export function useTotalDualFarmUniEarned(): TokenAmount | undefined {

  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!DFYN) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => {
          const index = stakingInfo?.rewardAddresses.indexOf(DFYN)
          const amount = index === 0 ? stakingInfo?.earnedAmount : stakingInfo.earnedAmountTwo
          return accumulator.add(amount)
        },
        new TokenAmount(DFYN, '0')
      ) ?? new TokenAmount(DFYN, '0')
    )
  }, [stakingInfos])
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