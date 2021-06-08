// import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WETH, Pair } from '@uniswap/sdk'
import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@uniswap/sdk'
import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { ROUTE, UNI, ETHER, USDC, DFYN, WBTC, USDT, DAI, WMATIC, UNI_TOKEN, AAVE, LUNA, UST } from '../../constants'
import { STAKING_REWARDS_FLORA_FARMS_INTERFACE } from '../../constants/abis/staking-rewards-flora-farms'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { usePair } from 'data/Reserves'

export const STAKING_GENESIS = 1621956600

export const REWARDS_DURATION_DAYS = 30

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    baseToken?: Token
    startTime?: number
    stakingRewardAddress: string
  }[]
} = {
  [ChainId.MATIC]: [
    {
      tokens: [LUNA, DFYN],
      baseToken: DFYN,
      startTime: 1623164400,
      stakingRewardAddress: '0xB5583E039E4C9b627F6258bD823fd884668afE02'
    },
    {
      tokens: [UST, USDT],
      baseToken: USDT,
      startTime: 1623164400,
      stakingRewardAddress: '0x4B47d7299Ac443827d4468265A725750475dE9E6'
    },
    {
      tokens: [DFYN, USDC],
      baseToken: USDC,
      startTime: 1621956600,
      stakingRewardAddress: '0x24a5256589126a0eb73a1a011e22C1c838890Ced'
    },
    {
      tokens: [DFYN, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0xE4F8C4722Aa44bFf5c99ba64c0bC39C6d883CcB6'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0x370737D328cf8DfD830fFFf51Dd9c972345e6Fee'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      startTime: 1621956600,
      stakingRewardAddress: '0xf786Ba582AbbE846B35E6e7089a25B761eA54113'
    },
    {
      tokens: [DAI, USDT],
      baseToken: USDT,
      startTime: 1621956600,
      stakingRewardAddress: '0x32B73E973057d309d22EC98B50a8311C0F583Ad3'
    },
    {
      tokens: [ETHER, USDC],
      baseToken: USDC,
      startTime: 1621956600,
      stakingRewardAddress: '0x694351F6dAfe5F2e92857e6a3C0578b68A8C1435'
    },
    {
      tokens: [ROUTE, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0xf162a26aCc064B88a0150a36d7B38996723E94D7'
    },
    {
      tokens: [WMATIC, DFYN],
      baseToken: DFYN,
      startTime: 1621956600,
      stakingRewardAddress: '0x376920095Ae17e12BC114D4E33D30DFda83f8EfB'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0x0BADA377367f4937bdf6A17FdaeeB0b798051c91'
    },
    {
      tokens: [UNI_TOKEN, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0x3cA3f35b081CD7c47990e0Ef5Eed763b54F22874'
    },
    {
      tokens: [AAVE, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0x80dF5A040E045817AB75A4214e29Dc95D83f1118'
    },
  ]
}
interface UserVestingInfo {
  hasOptForVesting: boolean
  hasSetConfig: boolean
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
  userVestingInfo: UserVestingInfo
  tokens: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  // Total vested unclaimed amount
  unclaimedAmount: BigNumber
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  // total vested amount
  totalVestedAmount: TokenAmount
  // when the period ends
  periodFinish: Date | undefined
  // size of split window
  splitWindow: Date | undefined
  //
  totalEarnedReward: TokenAmount | undefined
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
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const [, dfynUsdcPair] = usePair(USDC, DFYN);
  const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))
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

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'earned', accountArg)
  const claimedSplits = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'claimedSplits', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalSupply')
  const hasClaimed = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'hasClaimed', accountArg)
  const totalEarnedReward = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalEarnedReward', accountArg)
  const totalVestedAmount = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalVestedRewardForUser', accountArg)
  const userVestingInfo = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'getUserVestingInfo', accountArg)

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )
  const splitWindow = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'splitWindow',
    undefined,
    NEVER_RELOAD
  )
  const splits = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'splits',
    undefined,
    NEVER_RELOAD
  )
  const vesting = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'vestingPeriod',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const totalVestedAmountState = totalVestedAmount[index]
      const claimedSplitsState = claimedSplits[index]
      const hasClaimedPartialState = hasClaimed[index]
      const totalEarnedRewardState = totalEarnedReward[index]
      const userVestingInfoState = userVestingInfo[index]
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
        !userVestingInfoState?.loading &&
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
          userVestingInfoState?.error ||
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

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState?.result?.[0] ?? 0))
        const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(rewardRateState?.result?.[0] ?? 0))
        const totalVestedAmount = new TokenAmount(uni, JSBI.BigInt(totalVestedAmountState?.result?.[0] ?? 0))
        const totalEarnedReward = new TokenAmount(uni, JSBI.BigInt(totalEarnedRewardState?.result?.[0] ?? 0))
        const userClaimedSplit = claimedSplitsState?.result?.[0]?.toNumber() ?? 0;
        const splits = splitsState?.result?.[0]?.toNumber() ?? 0
        const hasClaimedPartial = hasClaimedPartialState?.result?.[0] ?? false
        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            uni,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

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
          type: { typeOf: 'Popular Farms', url: 'popular-farms' },
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          startTime: info[index].startTime ?? 0,
          tokens: info[index].tokens,
          userVestingInfo: { hasSetConfig: userVestingInfoState?.result?.[0].hasSetConfig, hasOptForVesting: userVestingInfoState?.result?.[0].hasOptForVesting },
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          splitWindow: splitWindowStateMs > 0 ? new Date(splitWindowStateMs) : undefined,
          vestingPeriod: vestingPeriodMs > 0 ? new Date(periodFinishMs + vestingPeriodMs) : undefined, //vesting period after period ends
          earnedAmount: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          unclaimedAmount: unclaimedAmount,
          totalVestedAmount: totalVestedAmount,
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          claimedSplits: userClaimedSplit,
          totalEarnedReward,
          ableToClaim,
          dfynPrice,
          hasClaimedPartial,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          unlockAt: unlockAt > 0 ? new Date(unlockAt * 1000) : undefined,
          vestingActive,
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
    totalEarnedReward,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    claimedSplits,
    totalVestedAmount,
    splitWindow,
    splits,
    hasClaimed,
    vesting,
    uni
  ])
}

export function useTotalFloraUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!uni) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
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