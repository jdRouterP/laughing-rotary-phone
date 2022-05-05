import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount } from '@dfyn/sdk'
import { useMemo } from 'react'
import { CNW, DFYN, MATRIX, NIOX, OAI, ROUTE, SAFLE, UNI } from '../../constants'
import { VAULT_INTERFACE } from '../../constants/abis/vault'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'

export const STAKING_GENESIS = 1621161818

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    vaultName: string
    vaultAddress: string
    vaultToken: Token
    multiplier: number
    startedOn: number
  }[]
} = {
  [ChainId.MATIC]: [
    {
      vaultName: 'DFYN 6-month vault',
      vaultAddress: '0x384249f6b345b5feab453558b1ca1713f953bf8e',
      vaultToken: DFYN,
      multiplier: 2,
      startedOn: 1651758517
    },
    {
      vaultName: 'CNW 6-month vault',
      vaultAddress: '0x356fE56801Fdb5bb44f63023F4Ac3e26588A3723',
      vaultToken: CNW,
      multiplier: 2,
      startedOn: 1651510936
    },
    {
      vaultName: 'SAFLE 6-month vault',
      vaultAddress: '0x3b02672eBc09e432c17d9fAA641981aA5c5E2107',
      vaultToken: SAFLE,
      multiplier: 2,
      startedOn: 1644243400
    },
    {
      vaultName: 'NIOX 6-month vault',
      vaultAddress: '0xA1eB5Fb7c1b2d7b49c79ad1E3A0476205915Fd90',
      vaultToken: NIOX,
      multiplier: 2,
      startedOn: 1639063800
    },
    {
      vaultName: 'OAI 6-month vault',
      vaultAddress: '0xCeD679434814068f73C7bE8815884fDd2B15D655',
      vaultToken: OAI,
      multiplier: 2,
      startedOn: 1638388000
    },
    {
      vaultName: 'MATRIX 6-month vault',
      vaultAddress: '0x8b7862622443208B26c4E7B4476413cd9891F450',
      vaultToken: MATRIX,
      multiplier: 2,
      startedOn: 1634216400
    },
    {
      vaultName: 'DFYN 6-month vault',
      vaultAddress: '0x18045175FFd884fe85C3f19187e25BCfbC022514',
      vaultToken: DFYN,
      multiplier: 2,
      startedOn: 1629721800
    },
    {
      vaultName: 'DFYN 4-month vault',
      vaultAddress: '0x07E3f04903aBd6506A6E41246Da7d39dA0D6a8CA',
      vaultToken: DFYN,
      multiplier: 3,
      startedOn: 1629721800
    },
    {
      vaultName: 'ROUTE 6-month vault',
      vaultAddress: '0x3f820e5b1BC0Aa2E3FFAC70731e319316Bc47D91',
      vaultToken: ROUTE,
      multiplier: 2,
      startedOn: 1627991691
    },
    {
      vaultName: 'DFYN 6-month vault',
      vaultAddress: '0xc5574645F618EE9A3b5d8c4f69b1983D7D226290',
      vaultToken: DFYN,
      multiplier: 2,
      startedOn: 1627137000
    },
    {
      vaultName: 'DFYN 4-month vault',
      vaultAddress: '0x7C5B1B6ec97E9b57B75ea8C6B72C0dDaCCfecB54',
      vaultToken: DFYN,
      multiplier: 3,
      startedOn: 1627137000
    },
    {
      vaultName: 'DFYN 6-month vault',
      vaultAddress: '0x864208438F598d4a857AE4B586FB49b0BA855af9',
      vaultToken: DFYN,
      multiplier: 2,
      startedOn: 1624535769
    },
    {
      vaultName: 'DFYN 4-month vault',
      vaultAddress: '0x8b016E4f714451f3aFF88B82Ec9dfAe13D664d42',
      vaultToken: DFYN,
      multiplier: 3,
      startedOn: 1624535769
    },
    {
      vaultName: 'DFYN 6-month vault',
      vaultAddress: '0x21D5815d9654074192A2F6A6230406A6bB4201BE',
      vaultToken: DFYN,
      multiplier: 2,
      startedOn: 1621941297
    },
    {
      vaultName: 'DFYN 4-month vault',
      vaultAddress: '0x5179E3460Bb13A9CEc85419d477A487C4780c92c',
      vaultToken: DFYN,
      multiplier: 3,
      startedOn: 1621941297
    },
    {
      vaultName: 'CNW 6-month vault',
      vaultAddress: '0x356fE56801Fdb5bb44f63023F4Ac3e26588A3723',
      vaultToken: CNW,
      multiplier: 2,
      startedOn: 1651510936
    },
  ]
}

export interface StakingInfo {
  // the address of the reward contract
  vaultAddress: string
  vaultToken: Token
  vaultName: string
  startedOn: number
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
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
export function useStakingInfo(vaultToFilterBy?: string | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
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
  const balances = useMultipleContractSingleData(rewardsAddresses, VAULT_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, VAULT_INTERFACE, 'earned', accountArg)
  const userVaultInfo = useMultipleContractSingleData(rewardsAddresses, VAULT_INTERFACE, 'getUserVaultInfo', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, VAULT_INTERFACE, 'totalDeposits')


  const vesting = useMultipleContractSingleData(
    rewardsAddresses,
    VAULT_INTERFACE,
    'vestingPeriod',
    undefined,
    NEVER_RELOAD
  )
  const vaultLimit = useMultipleContractSingleData(
    rewardsAddresses,
    VAULT_INTERFACE,
    'vaultLimit',
    undefined,
    NEVER_RELOAD
  )
  const interestRate = useMultipleContractSingleData(
    rewardsAddresses,
    VAULT_INTERFACE,
    'interestRate',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
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
          claimedAmount: userVaultInfoState?.result?.[0].claimedAmount ?? 0,
          totalEarned: userVaultInfoState?.result?.[0].totalEarned ?? 0
        }
        const stakedAmount = new TokenAmount(info[index].vaultToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(info[index].vaultToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const interestRate = interestRateState.result?.[0].toNumber()
        const vaultLimit = new TokenAmount(info[index].vaultToken, JSBI.BigInt(vaultLimitState.result?.[0]))
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
          vaultToken: info[index].vaultToken,
          multiplier: info[index].multiplier,
          startedOn: info[index].startedOn,
          periodFinish: periodFinishSeconds > 0 ? periodFinishSeconds : undefined,
          earnedAmount: new TokenAmount(info[index].vaultToken, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
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
    uni,
    interestRate,
    userVaultInfo,
    vaultLimit,
    vesting
  ])
}

export function useTotalVaultUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!uni) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => {
          if (stakingInfo.vaultToken === uni) {

            return accumulator.add(stakingInfo.earnedAmount)
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