// import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WETH, Pair } from '@uniswap/sdk'
import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@uniswap/sdk'
import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { ROUTE, UNI, USDT, WMATIC, ETHER, WBTC, USDC, DAI, AAVE, UNI_TOKEN } from '../../constants'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'

export const STAKING_GENESIS = 1620736200

export const REWARDS_DURATION_DAYS = 14

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    baseToken?: Token
    stakingRewardAddress: string
  }[]
} = {
  [ChainId.MATIC]: [
    {
      tokens: [ROUTE, ETHER],
      baseToken: ETHER,
      stakingRewardAddress: '0x4d36f9dbE30cFc2536B1f29527D61AbA37fCB8A0'
    },
    {
      tokens: [AAVE, ETHER],
      baseToken: ETHER,
      stakingRewardAddress: '0xEfe569aa3d6598004f2ef1921f46E774398F7d0d'
    },
    {
      tokens: [UNI_TOKEN, ETHER],
      baseToken: ETHER,
      stakingRewardAddress: '0x18aE962a022DB2F33507659BD6196561083dBdB7'
    },
    {
      tokens: [ETHER, USDT],
      baseToken: USDT,
      stakingRewardAddress: '0x3d769770468e7C6B2C64Eee4ffA5868210C95a93'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      stakingRewardAddress: '0xdC28cE8Ccd1B9A3fDE0c136dd5992B6D06fd9fd1'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: ETHER,
      stakingRewardAddress: '0x5e0E8C763E9826d41C7ee631d6AC1203503024c3'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      stakingRewardAddress: '0x4ea90e9c3479ba7190a9509010dF7cA14e95f967'
    },
    {
      tokens: [DAI, USDT],
      baseToken: DAI,
      stakingRewardAddress: '0x84D0640Cd8c366BcA7Abc3492fa3CA99C8e32615'
    },
    {
      tokens: [ETHER, USDC],
      baseToken: USDC,
      stakingRewardAddress: '0x28Bf5111B86D41427c02DFB9E98E55E5BB57d692'
    }
  ]
}

export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  baseToken: any

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
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const claimedSplits = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'claimedSplits', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')
  const hasClaimed = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'hasClaimed', accountArg)
  const totalEarnedReward = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalEarnedReward', accountArg)
  const totalVestedAmount = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalVestedRewardForUser', accountArg)

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )
  const splitWindow = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'splitWindow',
    undefined,
    NEVER_RELOAD
  )
  const splits = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'splits',
    undefined,
    NEVER_RELOAD
  )
  const vesting = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
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
          !totalEarnedRewardState ||
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

        const userClaimedSplit = claimedSplitsState?.result?.[0]?.toNumber();
        const splits = splitsState?.result?.[0]?.toNumber() ?? 0
        const hasClaimedPartial = hasClaimedPartialState?.result?.[0];
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
        let unclaimedAmount = BigNumber.from(totalVestedAmountState?.result?.[0]).mul(unclaimedSplits).div(BigNumber.from(splits))
        unclaimedAmount = unclaimedAmount.div(BigNumber.from('1000000000000000000'))

        let ableToClaim = !vestingActive || (Math.floor(Date.now() / 1000) >= periodFinishSeconds &&
          (userClaimedSplit !== Math.floor(currentSplit) ? true : !hasClaimedPartial))


        memo.push({
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          tokens: info[index].tokens,
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

export function useTotalUniEarned(): TokenAmount | undefined {
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