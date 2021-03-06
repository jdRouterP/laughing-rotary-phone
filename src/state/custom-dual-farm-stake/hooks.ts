import { CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@dfyn/sdk'
import { useMemo } from 'react'
import { UNI, DFYN, USDC } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { usePairsWithBaseToken } from 'data/Reserves'
import useCustomFarmInfo from 'state/custom-farm/hook'
import { BYOF_DUAL_FARM_INTERFACE } from 'constants/abis/dual-farm-byof'
import { useAllTokens } from 'hooks/Tokens'


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
  duration: Number
  rewardAmount: Number[]
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    rewardToken: Token,
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
}

// gets the staking info from the network for the active chain id
export function useStakingDualFarmInfo(pairToFilterBy?: string): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const {dualFarms} = useCustomFarmInfo()
  const allTokens = useAllTokens()

  const info = useMemo(
    () =>
      chainId
        ? dualFarms.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy === stakingRewardInfo.stakingRewardAddress
        ) ?? []
        : [],
    [chainId, pairToFilterBy, dualFarms]
  )
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()
  const uni = chainId ? UNI[chainId] : undefined

  const stakingRewardAddress = useMemo(() =>  info.map(({ stakingRewardAddress }) => stakingRewardAddress), [ info])
  const bothRewardToken = useMemo(() =>  info.map(({ rewardTokens }) => rewardTokens), [ info])
  const start = useMemo(() =>  info.map(({ startDate }) => startDate), [ info])
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
  const balances = useMultipleContractSingleData(stakingRewardAddress, BYOF_DUAL_FARM_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(stakingRewardAddress, BYOF_DUAL_FARM_INTERFACE, 'tokensEarned', accountArg)
  const totalSupplies = useMultipleContractSingleData(stakingRewardAddress, BYOF_DUAL_FARM_INTERFACE, 'totalSupply')
  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    stakingRewardAddress,
    BYOF_DUAL_FARM_INTERFACE,
    'tokensRewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    stakingRewardAddress,
    BYOF_DUAL_FARM_INTERFACE,
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
        const tokens =  info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))
        // check for account, if no account set to 0
        const rewardTokenOne = allTokens[rewardRateState.result?.[0][0]]
        const rewardTokenTwo = allTokens[rewardRateState.result?.[0][1]]
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
          type: { typeOf: 'Dual Farms', url: 'custom-dual-farms' },
          rewardAddresses,
          stakingRewardAddress: rewardsAddress,
          baseToken:  info[index].baseToken,
          tokens:  info[index].tokens,
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
          duration: (info[index].endDate - info[index].startDate)/86400,
          rewardAmount: info[index].rewardAmount,
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
    allTokens,
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

export function useInactiveStakingDualFarmInfo(pairToFilterBy?: string): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const {inactiveDualFarms} = useCustomFarmInfo()
  const allTokens = useAllTokens()
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? inactiveDualFarms.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy === stakingRewardInfo.stakingRewardAddress
        ) ?? []
        : [],
    [chainId, pairToFilterBy, inactiveDualFarms]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const stakingRewardAddress = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const bothRewardToken = useMemo(() => info.map(({ rewardTokens }) => rewardTokens), [info])
  const start = useMemo(() => info.map(({ startDate }) => startDate), [info])
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
  const balances = useMultipleContractSingleData(stakingRewardAddress, BYOF_DUAL_FARM_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(stakingRewardAddress, BYOF_DUAL_FARM_INTERFACE, 'tokensEarned', accountArg)
  const totalSupplies = useMultipleContractSingleData(stakingRewardAddress, BYOF_DUAL_FARM_INTERFACE, 'totalSupply')

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    stakingRewardAddress,
    BYOF_DUAL_FARM_INTERFACE,
    'tokensRewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    stakingRewardAddress,
    BYOF_DUAL_FARM_INTERFACE,
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
        const rewardTokenOne = allTokens[rewardRateState.result?.[0][0]]
        const rewardTokenTwo = allTokens[rewardRateState.result?.[0][1]]
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
          type: { typeOf: 'Dual Farms', url: 'custom-dual-farms/archived' },
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
          duration: (info[index].endDate - info[index].startDate)/86400,
          rewardAmount: info[index].rewardAmount,
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
    allTokens,
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

// const getTokenByAddress = (address: string) => {
//   const token = REWARD_TOKENS.filter(token => token.address?.toLowerCase() === address?.toLowerCase())
//   if (token.length) {
//     return token[0]
//   } else {
//     return EMPTY;
//   }
// }

export function useTotalCustomDualFarmUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const activeStakingInfos = useStakingDualFarmInfo()
  const inactiveStakingInfos = useInactiveStakingDualFarmInfo();
  const stakingInfos = activeStakingInfos.concat(inactiveStakingInfos);

  return useMemo(() => {
    if (!uni) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => {
          if (stakingInfo?.rewardAddresses.includes(DFYN)) {
            const index = stakingInfo?.rewardAddresses.indexOf(DFYN)
            const amount = index === 0 ? stakingInfo?.earnedAmount : stakingInfo.earnedAmountTwo
            return accumulator.add(amount)
          }
          return accumulator
        },
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