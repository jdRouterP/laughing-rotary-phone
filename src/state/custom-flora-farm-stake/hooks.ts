// import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WETH, Pair } from '@dfyn/sdk'
import { CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@dfyn/sdk'
import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { UNI, USDC, DFYN} from '../../constants'
import { BYOF_FLORA_FARM_INTERFACE } from '../../constants/abis/flora-farm-byof'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { usePair } from 'data/Reserves'
import useCustomFarmInfo from 'state/custom-farm/hook'
import { useCombinedActiveList } from 'state/lists/hooks'

export const STAKING_GENESIS = 1621956600

export const REWARDS_DURATION_DAYS = 30

// TODO add staking rewards addresses here

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
  burnRate: string
  tokens: [Token, Token]
  rewardToken: Token[]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount[]
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount[]
  // Total vested unclaimed amount
  unclaimedAmount: BigNumber
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount[]
  // total vested amount
  totalVestedAmount: TokenAmount[]
  // when the period ends
  periodFinish: Date | undefined
  // size of split window
  splitWindow: Date | undefined
  //
  totalEarnedRewardArr: (TokenAmount | undefined)[]
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
  //duration in days
  duration: Number
  // if pool is active
  active: boolean
  dfynPrice: Number
  claim: number
  splits: number
  rewardAmount: Number[]
  // if vesting is active
  vestingActive: boolean
  vestingPeriodDays: number
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    rewardToken: Token,
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
}

// gets the staking info from the network for the active chain id
export function useStakingCustomFloraFarmInfo(pairToFilterBy?: string): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const {floraFarms} = useCustomFarmInfo()
  const allTokens = useCombinedActiveList();
  const allTokensList = Object.values(allTokens[137]).map(i => i.token)
  const [, dfynUsdcPair] = usePair(USDC, DFYN);
  const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()
  const info = useMemo(
    () =>
      chainId
        ? floraFarms.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy === stakingRewardInfo.stakingRewardAddress
        ) ?? []
        : [],
    [chainId, pairToFilterBy, floraFarms]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const stakingRewardAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])
  

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'tokensEarned', accountArg)
  const claimedSplits = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'claimedSplits', accountArg)
  const totalSupplies = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'totalSupply')
  const hasClaimed = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'hasClaimed', accountArg)
  const totalEarnedReward = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'totalEarnedRewards', accountArg)
  const totalVestedAmount = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'totalVestedRewards', accountArg)
  const userVestingInfo = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'getUserVestingInfo', accountArg)

  // tokens per second, constants   
  const rewardRates = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
    'tokensRewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )
  const splitWindow = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
    'splitWindow',
    undefined,
    NEVER_RELOAD
  )
  const splits = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
    'splits',
    undefined,
    NEVER_RELOAD
  )
  const vesting = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
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
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState?.result?.[0] ?? 0))
        const rewardTokensArr = []
        const rewardRateTokenArr = []
        const totalVestedAmountArr = []
        const totalEarnedRewardArr = []
        const individualRewardRateArr = []
        const earnedAmountArr = []
        for(let i = 0; i < info[index].rewardToken.length; i++){
          const tokenArr = allTokensList.filter(token => token.address.toLowerCase() === (rewardRateState.result?.[0][i]).toLowerCase())[0]
          const rewardRateToken = new TokenAmount(tokenArr, JSBI.BigInt(rewardRateState.result?.[1][i]))
          const totalVestedAmount = new TokenAmount(tokenArr ?? uni, JSBI.BigInt(totalVestedAmountState?.result?.[1][i] ?? 0))
          const totalEarnedReward = new TokenAmount(tokenArr ?? uni, JSBI.BigInt(totalEarnedRewardState?.result?.[1][i] ?? 0))
          const individualRewardRate = getHypotheticalRewardRate(tokenArr, stakedAmount, totalStakedAmount, rewardRateToken)
          const earnedAmount = new TokenAmount(tokenArr, JSBI.BigInt(earnedAmountState?.result?.[1][i] ?? 0))
          rewardRateTokenArr.push(rewardRateToken)
          rewardTokensArr.push(tokenArr)
          totalVestedAmountArr.push(totalVestedAmount)
          totalEarnedRewardArr.push(totalEarnedReward)
          individualRewardRateArr.push(individualRewardRate)
          earnedAmountArr.push(earnedAmount)
        }
        
        // const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(rewardRateState?.result?.[0] ?? 0))
        // const totalVestedAmount = new TokenAmount(uni, JSBI.BigInt(totalVestedAmountState?.result?.[0] ?? 0))
        // const totalEarnedReward = new TokenAmount(uni, JSBI.BigInt(totalEarnedRewardState?.result?.[0] ?? 0))

        const userClaimedSplit = claimedSplitsState?.result?.[0]?.toNumber() ?? 0;
        const splits = splitsState?.result?.[0]?.toNumber() ?? 0
        const hasClaimedPartial = hasClaimedPartialState?.result?.[0] ?? false

        // const getHypotheticalRewardRate = (
        //   stakedAmount: TokenAmount,
        //   totalStakedAmount: TokenAmount,
        //   totalRewardRate: TokenAmount
        // ): TokenAmount => {
        //   return new TokenAmount(
        //     uni,
        //     JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
        //       ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
        //       : JSBI.BigInt(0)
        //   )
        // }

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
        const unclaimedSplits = BigNumber.from((Math.floor(currentSplit) - userClaimedSplit))

        let unclaimedAmount = BigNumber.from(totalVestedAmountState?.result?.[1][0] ?? 0).mul(unclaimedSplits).div(BigNumber.from(splits))
        unclaimedAmount = unclaimedAmount.div(BigNumber.from('1000000000000000000'))
        let ableToClaim = !vestingActive || (Math.floor(Date.now() / 1000) >= periodFinishSeconds &&
          (userClaimedSplit !== Math.floor(currentSplit) ? true : !hasClaimedPartial))
        memo.push({
          type: { typeOf: 'Popular Farms', url: 'custom-popular-farms' },
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          burnRate: info[index].burnRate.toString(),
          startTime: info[index].startDate ?? 0,
          rewardToken: info[index].rewardToken ?? uni,
          tokens: info[index].tokens,
          userVestingInfo: { hasSetConfig: userVestingInfoState?.result?.[0].hasSetConfig, hasOptForVesting: userVestingInfoState?.result?.[0].hasOptForVesting },
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          splitWindow: splitWindowStateMs > 0 ? new Date(splitWindowStateMs) : undefined,
          vestingPeriod: vestingPeriodMs > 0 ? new Date(periodFinishMs + vestingPeriodMs) : undefined, //vesting period after period ends
          earnedAmount: earnedAmountArr,
          unclaimedAmount: unclaimedAmount,
          totalVestedAmount: totalVestedAmountArr,
          rewardRate: individualRewardRateArr,
          totalRewardRate: rewardRateTokenArr,
          stakedAmount: stakedAmount,
          claimedSplits: userClaimedSplit,
          totalEarnedRewardArr,
          ableToClaim,
          dfynPrice,
          hasClaimedPartial,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          unlockAt: unlockAt > 0 ? new Date(unlockAt * 1000) : undefined,
          vestingActive,
          claim: info[index].claim,
          vestingPeriodDays: info[index].vestingPeriod,
          splits: splits,
          duration: (info[index].endDate - info[index].startDate)/86400,
          rewardAmount: info[index].rewardAmount,
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
    userVestingInfo,
    allTokensList
  ])
}

export function useInactiveStakingCustomFloraFarmInfo(pairToFilterBy?: string): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const {inactiveFloraFarms} = useCustomFarmInfo()
  const allTokens = useCombinedActiveList();
  const allTokensList = Object.values(allTokens[137]).map(i => i.token)
  const [, dfynUsdcPair] = usePair(USDC, DFYN);
  const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()
  const info = useMemo(
    () =>
      chainId
        ? inactiveFloraFarms.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy === stakingRewardInfo.stakingRewardAddress
        ) ?? []
        : [],
    [chainId, pairToFilterBy, inactiveFloraFarms]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const stakingRewardAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])


  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'tokensEarned', accountArg)
  const claimedSplits = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'claimedSplits', accountArg)
  const totalSupplies = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'totalSupply')
  const hasClaimed = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'hasClaimed', accountArg)
  const totalEarnedReward = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'totalEarnedRewards', accountArg)
  const totalVestedAmount = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'totalVestedRewards', accountArg)
  const userVestingInfo = useMultipleContractSingleData(stakingRewardAddresses, BYOF_FLORA_FARM_INTERFACE, 'getUserVestingInfo', accountArg)
  
  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
    'tokensRewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )
  const splitWindow = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
    'splitWindow',
    undefined,
    NEVER_RELOAD
  )
  const splits = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
    'splits',
    undefined,
    NEVER_RELOAD
  )
  const vesting = useMultipleContractSingleData(
    stakingRewardAddresses,
    BYOF_FLORA_FARM_INTERFACE,
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
        // check for account, if no account set to 0

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState?.result?.[0] ?? 0))
        const rewardTokensArr = []
        const rewardRateTokenArr = []
        const totalVestedAmountArr = []
        const totalEarnedRewardArr = []
        const individualRewardRateArr = []
        const earnedAmountArr = []
        for(let i = 0; i < info[index].rewardToken.length; i++){
          const tokenArr = allTokensList.filter(token => token.address.toLowerCase() === (rewardRateState.result?.[0][i]).toLowerCase())[0]
          const rewardRateToken = new TokenAmount(tokenArr, JSBI.BigInt(rewardRateState.result?.[1][i]))
          const totalVestedAmount = new TokenAmount(tokenArr ?? uni, JSBI.BigInt(totalVestedAmountState?.result?.[1][i] ?? 0))
          const totalEarnedReward = new TokenAmount(tokenArr ?? uni, JSBI.BigInt(totalEarnedRewardState?.result?.[1][i] ?? 0))
          const individualRewardRate = getHypotheticalRewardRate(tokenArr, stakedAmount, totalStakedAmount, rewardRateToken)
          const earnedAmount = new TokenAmount(tokenArr, JSBI.BigInt(earnedAmountState?.result?.[1][i] ?? 0))
          rewardRateTokenArr.push(rewardRateToken)
          rewardTokensArr.push(tokenArr)
          totalVestedAmountArr.push(totalVestedAmount)
          totalEarnedRewardArr.push(totalEarnedReward)
          individualRewardRateArr.push(individualRewardRate)
          earnedAmountArr.push(earnedAmount)
        }

        const userClaimedSplit = claimedSplitsState?.result?.[0]?.toNumber() ?? 0;
        const splits = splitsState?.result?.[0]?.toNumber() ?? 0
        const hasClaimedPartial = hasClaimedPartialState?.result?.[0] ?? false
        // const getHypotheticalRewardRate = (
        //   stakedAmount: TokenAmount,
        //   totalStakedAmount: TokenAmount,
        //   totalRewardRate: TokenAmount
        // ): TokenAmount => {
        //   return new TokenAmount(
        //     uni,
        //     JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
        //       ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
        //       : JSBI.BigInt(0)
        //   )
        // }

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
        const unclaimedSplits = BigNumber.from((Math.floor(currentSplit) - userClaimedSplit))

        let unclaimedAmount = BigNumber.from(totalVestedAmountState?.result?.[1][0] ?? 0).mul(unclaimedSplits).div(BigNumber.from(splits))
        unclaimedAmount = unclaimedAmount.div(BigNumber.from('1000000000000000000'))

        let ableToClaim = !vestingActive || (Math.floor(Date.now() / 1000) >= periodFinishSeconds &&
          (userClaimedSplit !== Math.floor(currentSplit) ? true : !hasClaimedPartial))
        memo.push({
          type: { typeOf: 'Popular Farms', url: 'custom-popular-farms/archived' },
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          burnRate: info[index].burnRate.toString(),
          startTime: info[index].startDate ?? 0,
          rewardToken: info[index].rewardToken ?? uni,
          tokens: info[index].tokens,
          userVestingInfo: { hasSetConfig: userVestingInfoState?.result?.[0].hasSetConfig, hasOptForVesting: userVestingInfoState?.result?.[0].hasOptForVesting },
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          splitWindow: splitWindowStateMs > 0 ? new Date(splitWindowStateMs) : undefined,
          vestingPeriod: vestingPeriodMs > 0 ? new Date(periodFinishMs + vestingPeriodMs) : undefined, //vesting period after period ends
          earnedAmount: earnedAmountArr,
          unclaimedAmount: unclaimedAmount,
          totalVestedAmount: totalVestedAmountArr,
          rewardRate: individualRewardRateArr,
          totalRewardRate: rewardRateTokenArr,
          stakedAmount: stakedAmount,
          claimedSplits: userClaimedSplit,
          totalEarnedRewardArr,
          ableToClaim,
          dfynPrice,
          hasClaimedPartial,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          unlockAt: unlockAt > 0 ? new Date(unlockAt * 1000) : undefined,
          vestingActive,
          claim: info[index].claim,
          splits: splits,
          vestingPeriodDays: info[index].vestingPeriod,
          duration: (info[index].endDate - info[index].startDate)/86400,
          rewardAmount: info[index].rewardAmount,
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
    userVestingInfo,
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

export function useTotalFloraCustomUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const activeStakingInfos = useStakingCustomFloraFarmInfo()
  const inactiveStakingInfos = useInactiveStakingCustomFloraFarmInfo();
  const stakingInfos = activeStakingInfos.concat(inactiveStakingInfos);

  return useMemo(() => {
    if (!uni) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => {
            if (stakingInfo?.rewardToken.includes(DFYN)) {
                const index = stakingInfo?.rewardToken.indexOf(DFYN)
                const amount = index === 0 ? stakingInfo?.earnedAmount[0] : stakingInfo.earnedAmount.reduce((x, y) => x.add(y))
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