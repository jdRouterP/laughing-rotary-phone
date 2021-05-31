import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { useMemo } from 'react'
import { ROUTE, UNI } from '../../constants'
import { MULTI_TOKEN_VAULT_INTERFACE } from '../../constants/abis/multiTokenVault'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'

export const STAKING_GENESIS = 1621161818

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const MULTI_STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    vaultName: string
    vaultAddress: string
    multiplier: number
  }[]
} = {
  [ChainId.MATIC]: [
    {
      vaultName: 'New Route vault',
      vaultAddress: '0xCf575a274e91680C6d846EBAF248f661fe519d45',
      multiplier: 2
    },
  ]
}

export interface MultiStakingInfo {
  // the address of the reward contract
  vaultAddress: string
  vaultName: string
  rewardToken: Token
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  unlockedTokenAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  // rewardRate: TokenAmount
  interestRate: number
  vesting: number
  multiplier: number
  vaultLimit: TokenAmount
  userVaultInfo: any
  // when the period ends
  periodFinish: number | undefined
  // if pool is active
  active: boolean
  // calculates a hypothetical amount of token distributed to the active account per second.
  //   getHypotheticalRewardRate: (
  //     stakedAmount: TokenAmount,
  //     totalStakedAmount: TokenAmount,
  //     interestRate: any
  //   ) => TokenAmount
}

// gets the staking info from the network for the active chain id
export function useMultiStakingInfo(vaultToFilterBy?: string | null): MultiStakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? MULTI_STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
          vaultToFilterBy === undefined
            ? true
            : vaultToFilterBy === null
              ? false
              : vaultToFilterBy === stakingRewardInfo.vaultAddress
        ) ?? []
        : [],
    [chainId, vaultToFilterBy]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ vaultAddress }) => vaultAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, MULTI_TOKEN_VAULT_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, MULTI_TOKEN_VAULT_INTERFACE, 'earned', accountArg)
  const userVaultInfo = useMultipleContractSingleData(rewardsAddresses, MULTI_TOKEN_VAULT_INTERFACE, 'getUserVaultInfo', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, MULTI_TOKEN_VAULT_INTERFACE, 'totalDeposits')


  const vesting = useMultipleContractSingleData(
    rewardsAddresses,
    MULTI_TOKEN_VAULT_INTERFACE,
    'vestingPeriod',
    undefined,
    NEVER_RELOAD
  )
  const vaultLimit = useMultipleContractSingleData(
    rewardsAddresses,
    MULTI_TOKEN_VAULT_INTERFACE,
    'vaultLimit',
    undefined,
    NEVER_RELOAD
  )
  const interestRate = useMultipleContractSingleData(
    rewardsAddresses,
    MULTI_TOKEN_VAULT_INTERFACE,
    'interestRate',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<MultiStakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const userVaultInfoState = userVaultInfo[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const vestingState = vesting[index]
      const vaultLimitState = vaultLimit[index]
      const interestRateState = interestRate[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !userVaultInfoState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        vestingState &&
        !vestingState.loading &&
        vaultLimitState &&
        !vaultLimitState.loading &&
        interestRateState &&
        !interestRateState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          userVaultInfoState?.error ||
          totalSupplyState.error ||
          vestingState.error ||
          vaultLimitState.error ||
          interestRateState.error
        ) {

          console.error('Failed to load staking rewards info')
          return memo
        }
        // check for account, if no account set to 0
        const userVaultInfo = {
          amount: userVaultInfoState?.result?.[0].amount ?? 0,
          depositTime: userVaultInfoState?.result?.[0][userVaultInfoState?.result?.[0].length - 1]?.depositTime ?? 0,
          vestingPeriodEnds: userVaultInfoState?.result?.[0][userVaultInfoState?.result?.[0].length - 1]?.vestingPeriodEnds ?? 0,
          lastUpdated: userVaultInfoState?.result?.[0].lastUpdated ?? 0,
          totalUnlockedVestedAmount: userVaultInfoState?.result?.[0].totalUnlockedVestedAmount ?? 0,
          totalEarned: userVaultInfoState?.result?.[0].totalEarned ?? 0
        }
        const stakedAmount = new TokenAmount(ROUTE, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(ROUTE, JSBI.BigInt(totalSupplyState.result?.[0]))
        const interestRate = interestRateState.result?.[0].toNumber()
        const vaultLimit = new TokenAmount(ROUTE, JSBI.BigInt(vaultLimitState.result?.[0]))
        const vesting = vestingState.result?.[0].toNumber()

        // const getHypotheticalRewardRate = (
        //   stakedAmount: TokenAmount,
        //   totalStakedAmount: TokenAmount,
        //   interestRate: any
        // ): TokenAmount => {
        //   return new TokenAmount(
        //     uni,
        //     JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
        //       ? JSBI.divide(JSBI.multiply(interestRate, stakedAmount.raw), totalStakedAmount.raw)
        //       : JSBI.BigInt(0)
        //   )
        // }

        // const individualInterestRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, interestRate)
        // console.log(individualInterestRate);
        const periodFinishSeconds = parseInt(userVaultInfo?.vestingPeriodEnds)
        //const periodFinishMs = periodFinishSeconds * 1000
        // compare period end timestamp vs current block timestamp (in seconds)
        const active =
          periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp.toNumber() : true
        memo.push({
          vaultAddress: rewardsAddress,
          vaultName: info[index].vaultName,
          multiplier: info[index].multiplier,
          rewardToken: uni,
          periodFinish: periodFinishSeconds > 0 ? periodFinishSeconds : undefined,
          unlockedTokenAmount: new TokenAmount(ROUTE, JSBI.BigInt(earnedAmountState?.result?.unlockedVestedTokenAmount ?? 0)),
          earnedAmount: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.claimableRewardAmount ?? 0)),
          interestRate,
          vesting,
          vaultLimit,
          userVaultInfo,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          // getHypotheticalRewardRate,
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
    rewardsAddresses,
    totalSupplies,
    uni
  ])
}

export function useTotalVaultUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const stakingInfos = useMultiStakingInfo()

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