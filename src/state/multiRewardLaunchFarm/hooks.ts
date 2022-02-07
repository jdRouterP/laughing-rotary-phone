// import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WETH, Pair } from '@dfyn/sdk'
import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@dfyn/sdk'
import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { UNI, USDC, DFYN, WBTC, WMATIC, WETH_V2 } from '../../constants'
import { STAKING_MULTI_REWARDS_INTERFACE } from '../../constants/abis/staking-reward-multi-reward-launch-farm' //same as pre-staking
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { usePair, usePairsWithBaseToken } from 'data/Reserves'
import { useCombinedActiveList } from 'state/lists/hooks'

export const STAKING_GENESIS = 1630326588

export const REWARDS_DURATION_DAYS = 30

export const STAKING_MULTI_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    baseToken?: Token
    rewardToken: [Token, Token]
    startTime?: number
    version: string
    stakingRewardAddress: string
  }[]
} = {
  [ChainId.MATIC]: [
    {
      tokens: [WBTC, WMATIC],
      baseToken: WBTC,
      version: 'v1',
      rewardToken: [WETH_V2, DFYN],
      startTime: 1639576800,
      stakingRewardAddress: '0x6F1BcAF54BC824Db40198891A41bA84c845a5031'
    },
    {
      tokens: [USDC, WMATIC],
      baseToken: USDC,
      version: 'v1',
      rewardToken: [WETH_V2, DFYN],
      startTime: 1639576800,
      stakingRewardAddress: '0xE03dD6ac19Cad8aD420B6C8F3A6C334293bDD446'
    },
  ]
}

//INACTIVE POOLS
// TODO add staking rewards addresses here
export const INACTIVE_STAKING_MULTI_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    baseToken?: Token
    rewardToken: [Token, Token]
    startTime?: number
    version: string
    stakingRewardAddress: string
  }[]
} = {
  [ChainId.MATIC]: []
}
interface TypeOfpools {
  typeOf: string
  url: string
}
export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  baseToken: any
  startTime: number
  type: TypeOfpools
  version: string
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
  // Total vested unclaimed amount
  unclaimedAmount: BigNumber
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  rewardRateTwo: TokenAmount
  tokenOnePrice: Number
  tokenTwoPrice: Number
  // total vested amount
  totalVestedAmount: TokenAmount
  totalVestedAmountTwo: TokenAmount
  // when the period ends
  periodFinish: Date | undefined
  // size of split window
  splitWindow: Date | undefined
  //
  totalEarnedReward: TokenAmount | undefined
  totalEarnedRewardTwo: TokenAmount | undefined
  // number of days of vesting
  vestingPeriod: Date | undefined
  // next reward unlocked at for a user
  unlockAt: Date | undefined
  // user claimed till this split
  claimedSplits: number | undefined
  // check if user had claimed the current split reward
  ableToClaim: boolean | undefined
  // check if user claimed the non vested reward
  hasClaimedPartial: boolean | undefined
  // if pool is active
  active: boolean
  dfynPrice: Number

  // if vesting is active
  vestingActive: boolean
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    rewardToken: Token,
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount

}

// gets the staking info from the network for the active chain id
export function useMultiStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const [, dfynUsdcPair] = usePair(USDC, DFYN);
  const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))
  const allTokens = useCombinedActiveList();
  const allTokensList = Object.values(allTokens[137]).map(i => i.token)
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_MULTI_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
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

  const stakingRewardAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])
  const bothRewardToken = useMemo(() => info.map(({ rewardToken }) => rewardToken), [info])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'tokensEarned', accountArg)
  const claimedSplits = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'claimedSplits', accountArg)
  const totalSupplies = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'totalSupply')
  const hasClaimed = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'hasClaimed', accountArg)
  const totalEarnedReward = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'totalEarnedRewards', accountArg)
  const totalVestedAmount = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'totalVestedRewards', accountArg)
  const values = usePairsWithBaseToken(USDC, bothRewardToken);

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
  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'tokensRewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )
  const splitWindow = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'splitWindow',
    undefined,
    NEVER_RELOAD
  )
  const splits = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'splits',
    undefined,
    NEVER_RELOAD
  )
  const vesting = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'vestingPeriod',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return stakingRewardAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const rewardAddresses = bothRewardToken[index]
      const totalVestedAmountState = totalVestedAmount[index]
      const claimedSplitsState = claimedSplits[index]
      const hasClaimedPartialState = hasClaimed[index]
      const totalEarnedRewardState = totalEarnedReward[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const splitWindowState = splitWindow[index]
      const splitsState = splits[index]
      const vestingState = vesting[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !claimedSplitsState?.loading &&
        !hasClaimedPartialState?.loading &&
        !totalVestedAmountState?.loading &&
        !totalEarnedRewardState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        splitWindowState &&
        !splitWindowState.loading &&
        splitsState &&
        !splitsState.loading &&
        vestingState &&
        !vestingState.loading

      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          claimedSplitsState?.error ||
          totalEarnedRewardState?.error ||
          hasClaimedPartialState?.error ||
          totalVestedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          splitWindowState.error ||
          splitsState.error ||
          vestingState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }
        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        // check for account, if no account set to 0

        const rewardTokenOne = allTokensList.filter(token => token.address.toLowerCase() === rewardRateState.result?.[0][0].toLowerCase())[0]
        const rewardTokenTwo = allTokensList.filter(token => token.address.toLowerCase() === rewardRateState.result?.[0][1].toLowerCase())[0]
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState?.result?.[0] ?? 0))
        const rewardRateTokenOne = new TokenAmount(rewardTokenOne, JSBI.BigInt(rewardRateState.result?.[1][0]))
        const rewardRateTokenTwo = new TokenAmount(rewardTokenTwo, JSBI.BigInt(rewardRateState.result?.[1][1]))

        // const totalRewardRate = new TokenAmount(info[index].rewardToken ?? uni, JSBI.BigInt(rewardRateState?.result?.[0] ?? 0))

        const totalVestedAmountOne = new TokenAmount(rewardTokenOne ?? uni, JSBI.BigInt(totalVestedAmountState?.result?.[1][0] ?? 0))
        const totalVestedAmountTwo = new TokenAmount(rewardTokenTwo ?? uni, JSBI.BigInt(totalVestedAmountState?.result?.[1][1] ?? 0))

        // const totalVestedAmount = new TokenAmount(info[index].rewardToken ?? uni, JSBI.BigInt(totalVestedAmountState?.result?.[0] ?? 0))


        // const totalEarnedReward = new TokenAmount(info[index].rewardToken ?? uni, JSBI.BigInt(totalEarnedRewardState?.result?.[0] ?? 0))

        const totalEarnedReward = new TokenAmount(rewardTokenOne ?? uni, JSBI.BigInt(totalEarnedRewardState?.result?.[1][0] ?? 0))
        const totalEarnedRewardTwo = new TokenAmount(rewardTokenTwo ?? uni, JSBI.BigInt(totalEarnedRewardState?.result?.[1][1] ?? 0))

        const userClaimedSplit = claimedSplitsState?.result?.[0]?.toNumber() ?? 0;
        const splits = splitsState?.result?.[0]?.toNumber() ?? 0
        const hasClaimedPartial = hasClaimedPartialState?.result?.[0] ?? false


        // const getHypotheticalRewardRate = (
        //   stakedAmount: TokenAmount,
        //   totalStakedAmount: TokenAmount,
        //   totalRewardRate: TokenAmount
        // ): TokenAmount => {
        //   return new TokenAmount(
        //     info[index].rewardToken ?? uni,
        //     JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
        //       ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
        //       : JSBI.BigInt(0)
        //   )
        // }

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

        // const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

        const periodFinishSeconds = periodFinishState.result?.[0]?.toNumber()
        const periodFinishMs = periodFinishSeconds * 1000

        const vestingPeriodSeconds = vestingState.result?.[0]?.toNumber()
        const vestingPeriodMs = vestingPeriodSeconds * 1000

        const splitWindowSeconds = splitWindowState.result?.[0]?.toNumber()
        const splitWindowStateMs = splitWindowSeconds * 1000



        // compare period end timestamp vs current block timestamp (in seconds)
        const active = periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp?.toNumber() : true

        // compare vesting end timestamp vs current block timestamp (in seconds)
        const vestingEndsSeconds = vestingPeriodSeconds + periodFinishSeconds;
        const vestingActive = vestingEndsSeconds && currentBlockTimestamp ? vestingEndsSeconds > currentBlockTimestamp?.toNumber() : true
        let currentSplit = Math.sign(Math.floor(Date.now() / 1000) - periodFinishSeconds) === -1 ? 0 : (Math.floor(Date.now() / 1000) - periodFinishSeconds) / splitWindowSeconds;

        currentSplit = currentSplit > splits ? splits : currentSplit;

        const unlockAt = active ? periodFinishSeconds : vestingActive ? (periodFinishSeconds + (Math.floor(currentSplit + 1) * splitWindowSeconds)) : vestingEndsSeconds;

        //const unclaimedAmount = JSBI.divide(JSBI.multiply(JSBI.BigInt(totalVestedAmountState?.result?.[0] ?? 0), JSBI.BigInt((Math.floor(currentSplit + 1) - userClaimedSplit))), splits);
        // totalvestedamount*(currentsplit-userclaimedlastsplit)/splits;
        const unclaimedSplits = BigNumber.from((Math.floor(currentSplit) - userClaimedSplit))

        //We are only take reward token unclaimed amount if it is necessary to have both reward token unclaimed amount we can do so by making another hook
        let unclaimedAmount = BigNumber.from(totalVestedAmountState?.result?.[1][0] ?? 0).mul(unclaimedSplits).div(BigNumber.from(splits))
        unclaimedAmount = unclaimedAmount.div(BigNumber.from('1000000000000000000'))
        let ableToClaim = !vestingActive || (Math.floor(Date.now() / 1000) >= periodFinishSeconds &&
          (userClaimedSplit !== Math.floor(currentSplit) ? true : !hasClaimedPartial))
        memo.push({
          type: { typeOf: 'Launch Farms', url: 'launch-farms' },
          rewardAddresses,
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          tokens: info[index].tokens,
          version: info[index].version,
          startTime: info[index].startTime ?? 0,
          //   rewardToken: info[index].rewardToken ?? uni,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          splitWindow: splitWindowStateMs > 0 ? new Date(splitWindowStateMs) : undefined,
          vestingPeriod: vestingPeriodMs > 0 ? new Date(periodFinishMs + vestingPeriodMs) : undefined, //vesting period after period ends
          //   earnedAmount: new TokenAmount(info[index].rewardToken ?? uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          earnedAmount: new TokenAmount(rewardTokenOne, JSBI.BigInt(earnedAmountState?.result?.[1][0] ?? 0)),
          earnedAmountTwo: new TokenAmount(rewardTokenTwo, JSBI.BigInt(earnedAmountState?.result?.[1][1] ?? 0)),
          unclaimedAmount: unclaimedAmount,
          totalVestedAmount: totalVestedAmountOne,
          totalVestedAmountTwo: totalVestedAmountTwo,
          //   rewardRate: individualRewardRate,
          rewardRate: individualRewardRate,
          rewardRateTwo: individualRewardRateTwo,
          totalRewardRate: rewardRateTokenOne,
          totalRewardRateTwo: rewardRateTokenTwo,
          //   totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          claimedSplits: userClaimedSplit,
          totalEarnedReward,
          totalEarnedRewardTwo,
          ableToClaim,
          dfynPrice,
          hasClaimedPartial,
          totalStakedAmount: totalStakedAmount,
          tokenOnePrice: tokenPrices[index][0] ?? 0,
          tokenTwoPrice: tokenPrices[index][1] ?? 0,
          getHypotheticalRewardRate,
          unlockAt: unlockAt > 0 ? new Date(unlockAt * 1000) : undefined,
          vestingActive,
          active,
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    totalEarnedReward,
    info,
    periodFinishes,
    rewardRates,
    stakingRewardAddresses,
    totalSupplies,
    claimedSplits,
    totalVestedAmount,
    splitWindow,
    splits,
    hasClaimed,
    vesting,
    uni,
    dfynPrice,
    bothRewardToken,
    tokenPrices,
    allTokensList
  ])
}

export function useMultiInactiveStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const [, dfynUsdcPair] = usePair(USDC, DFYN);
  const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))
  const allTokens = useCombinedActiveList();
  const allTokensList = Object.values(allTokens[137]).map(i => i.token)
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? INACTIVE_STAKING_MULTI_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
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

  const stakingRewardAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])
  const bothRewardToken = useMemo(() => info.map(({ rewardToken }) => rewardToken), [info])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'tokensEarned', accountArg)
  const claimedSplits = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'claimedSplits', accountArg)
  const totalSupplies = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'totalSupply')
  const hasClaimed = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'hasClaimed', accountArg)
  const totalEarnedReward = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'totalEarnedRewards', accountArg)
  const totalVestedAmount = useMultipleContractSingleData(stakingRewardAddresses, STAKING_MULTI_REWARDS_INTERFACE, 'totalVestedRewards', accountArg)
  const values = usePairsWithBaseToken(USDC, bothRewardToken);

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

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'tokensRewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )
  const splitWindow = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'splitWindow',
    undefined,
    NEVER_RELOAD
  )
  const splits = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'splits',
    undefined,
    NEVER_RELOAD
  )
  const vesting = useMultipleContractSingleData(
    stakingRewardAddresses,
    STAKING_MULTI_REWARDS_INTERFACE,
    'vestingPeriod',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return stakingRewardAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const rewardAddresses = bothRewardToken[index]
      const earnedAmountState = earnedAmounts[index]
      const totalVestedAmountState = totalVestedAmount[index]
      const claimedSplitsState = claimedSplits[index]
      const hasClaimedPartialState = hasClaimed[index]
      const totalEarnedRewardState = totalEarnedReward[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const splitWindowState = splitWindow[index]
      const splitsState = splits[index]
      const vestingState = vesting[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !claimedSplitsState?.loading &&
        !hasClaimedPartialState?.loading &&
        !totalVestedAmountState?.loading &&
        !totalEarnedRewardState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        splitWindowState &&
        !splitWindowState.loading &&
        splitsState &&
        !splitsState.loading &&
        vestingState &&
        !vestingState.loading

      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          claimedSplitsState?.error ||
          totalEarnedRewardState?.error ||
          hasClaimedPartialState?.error ||
          totalVestedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          splitWindowState.error ||
          splitsState.error ||
          vestingState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        // check for account, if no account set to 0

        const rewardTokenOne = allTokensList.filter(token => token.address.toLowerCase() === rewardRateState.result?.[0][0].toLowerCase())[0]
        const rewardTokenTwo = allTokensList.filter(token => token.address.toLowerCase() === rewardRateState.result?.[0][1].toLowerCase())[0]
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState?.result?.[0] ?? 0))
        const rewardRateTokenOne = new TokenAmount(rewardTokenOne, JSBI.BigInt(rewardRateState.result?.[1][0]))
        const rewardRateTokenTwo = new TokenAmount(rewardTokenTwo, JSBI.BigInt(rewardRateState.result?.[1][1]))


        const totalVestedAmountOne = new TokenAmount(rewardTokenOne ?? uni, JSBI.BigInt(totalVestedAmountState?.result?.[0] ?? 0))
        const totalVestedAmountTwo = new TokenAmount(rewardTokenTwo ?? uni, JSBI.BigInt(totalVestedAmountState?.result?.[1] ?? 0))

        const totalEarnedReward = new TokenAmount(rewardTokenOne ?? uni, JSBI.BigInt(totalEarnedRewardState?.result?.[0] ?? 0))
        const totalEarnedRewardTwo = new TokenAmount(rewardTokenTwo ?? uni, JSBI.BigInt(totalEarnedRewardState?.result?.[1] ?? 0))

        const userClaimedSplit = claimedSplitsState?.result?.[0]?.toNumber() ?? 0;
        const splits = splitsState?.result?.[0]?.toNumber() ?? 0
        const hasClaimedPartial = hasClaimedPartialState?.result?.[0] ?? false
        // const getHypotheticalRewardRate = (
        //   stakedAmount: TokenAmount,
        //   totalStakedAmount: TokenAmount,
        //   totalRewardRate: TokenAmount
        // ): TokenAmount => {
        //   return new TokenAmount(
        //     info[index].rewardToken ?? uni,
        //     JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
        //       ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
        //       : JSBI.BigInt(0)
        //   )
        // }

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

        const vestingPeriodSeconds = vestingState.result?.[0]?.toNumber()
        const vestingPeriodMs = vestingPeriodSeconds * 1000

        const splitWindowSeconds = splitWindowState.result?.[0]?.toNumber()
        const splitWindowStateMs = splitWindowSeconds * 1000



        // compare period end timestamp vs current block timestamp (in seconds)
        const active = periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp?.toNumber() : true

        // compare vesting end timestamp vs current block timestamp (in seconds)
        const vestingEndsSeconds = vestingPeriodSeconds + periodFinishSeconds;
        const vestingActive = vestingEndsSeconds && currentBlockTimestamp ? vestingEndsSeconds > currentBlockTimestamp?.toNumber() : true
        let currentSplit = Math.sign(Math.floor(Date.now() / 1000) - periodFinishSeconds) === -1 ? 0 : (Math.floor(Date.now() / 1000) - periodFinishSeconds) / splitWindowSeconds;

        currentSplit = currentSplit > splits ? splits : currentSplit;

        const unlockAt = active ? periodFinishSeconds : vestingActive ? (periodFinishSeconds + (Math.floor(currentSplit + 1) * splitWindowSeconds)) : vestingEndsSeconds;

        //const unclaimedAmount = JSBI.divide(JSBI.multiply(JSBI.BigInt(totalVestedAmountState?.result?.[0] ?? 0), JSBI.BigInt((Math.floor(currentSplit + 1) - userClaimedSplit))), splits);
        // totalvestedamount*(currentsplit-userclaimedlastsplit)/splits;
        const unclaimedSplits = BigNumber.from((Math.floor(currentSplit) - userClaimedSplit))

        let unclaimedAmount = BigNumber.from(totalVestedAmountState?.result?.[0] ?? 0).mul(unclaimedSplits).div(BigNumber.from(splits))
        unclaimedAmount = unclaimedAmount.div(BigNumber.from('1000000000000000000'))
        let ableToClaim = !vestingActive || (Math.floor(Date.now() / 1000) >= periodFinishSeconds &&
          (userClaimedSplit !== Math.floor(currentSplit) ? true : !hasClaimedPartial))
        memo.push({
          type: { typeOf: 'Launch Farms', url: 'launch-farms' },
          rewardAddresses,
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          tokens: info[index].tokens,
          version: info[index].version,
          startTime: info[index].startTime ?? 0,
          //   rewardToken: info[index].rewardToken ?? uni,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          splitWindow: splitWindowStateMs > 0 ? new Date(splitWindowStateMs) : undefined,
          vestingPeriod: vestingPeriodMs > 0 ? new Date(periodFinishMs + vestingPeriodMs) : undefined, //vesting period after period ends
          //   earnedAmount: new TokenAmount(info[index].rewardToken ?? uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          earnedAmount: new TokenAmount(rewardTokenOne, JSBI.BigInt(earnedAmountState?.result?.[1][0] ?? 0)),
          earnedAmountTwo: new TokenAmount(rewardTokenTwo, JSBI.BigInt(earnedAmountState?.result?.[1][1] ?? 0)),
          unclaimedAmount: unclaimedAmount,
          totalVestedAmount: totalVestedAmountOne,
          totalVestedAmountTwo: totalVestedAmountTwo,
          //   rewardRate: individualRewardRate,
          rewardRate: individualRewardRate,
          rewardRateTwo: individualRewardRateTwo,
          totalRewardRate: rewardRateTokenOne,
          totalRewardRateTwo: rewardRateTokenTwo,
          //   totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          claimedSplits: userClaimedSplit,
          totalEarnedReward,
          totalEarnedRewardTwo,
          ableToClaim,
          dfynPrice,
          hasClaimedPartial,
          totalStakedAmount: totalStakedAmount,
          tokenOnePrice: tokenPrices[index][0] ?? 0,
          tokenTwoPrice: tokenPrices[index][1] ?? 0,
          getHypotheticalRewardRate,
          unlockAt: unlockAt > 0 ? new Date(unlockAt * 1000) : undefined,
          vestingActive,
          active,
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    totalEarnedReward,
    info,
    periodFinishes,
    rewardRates,
    stakingRewardAddresses,
    totalSupplies,
    claimedSplits,
    totalVestedAmount,
    splitWindow,
    splits,
    hasClaimed,
    vesting,
    uni,
    dfynPrice,
    bothRewardToken,
    tokenPrices,
    allTokensList
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

export function useTotalUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const activeStakingInfos = useMultiStakingInfo()
  const inactiveStakingInfos = useMultiInactiveStakingInfo();
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