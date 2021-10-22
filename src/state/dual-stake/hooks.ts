import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@dfyn/sdk'
import { useMemo } from 'react'
import { UNI, ROUTE, REWARD_TOKENS, EMPTY, DFYN, USDC, ZEE, AURORA, BOOTY, ROYA, SX, EZ, UFARM, NWC, mRTK, XUSD, XDO, FRM, CHART, RVF, NORD, RAZOR, PBR, EMON } from '../../constants'
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
    version: string
  }[]
} = {
  [ChainId.MATIC]: [
    //v6
    {
      tokens: [ROUTE, DFYN],
      rewardTokens: [ROUTE, DFYN],
      baseToken: DFYN,
      start: 1634916600000,
      stakingRewardAddress: '0xa0d35c593235bA61151F0BAD89A4fB70AA5dad9f',
      version: 'v6'
    },
    {
      tokens: [EMON, USDC],
      rewardTokens: [EMON, DFYN],
      baseToken: USDC,
      start: 1634916600000,
      stakingRewardAddress: '0x0b07E945522B523d126BE9CfA8ee1B07B01C93Aa',
      version: 'v6'
    },
    //v5
    {
      tokens: [PBR, DFYN],
      rewardTokens: [PBR, DFYN],
      baseToken: DFYN,
      start: 1634562000000,
      stakingRewardAddress: '0x5B2CE8dDE5B99D974EC557B53e864f9EBb80FA66',
      version: 'v5'
    },
    {
      tokens: [RAZOR, DFYN],
      rewardTokens: [RAZOR, DFYN],
      baseToken: DFYN,
      start: 1633609800000,
      stakingRewardAddress: '0xE869f84DD77BD4b38C8Bb41CeB872a4e074039a4',
      version: 'v5'
    },
    //v4
    {
      tokens: [NORD, DFYN],
      rewardTokens: [NORD, DFYN],
      baseToken: DFYN,
      start: 1633015800000,
      stakingRewardAddress: '0x7c47Cc6F788bdac8FD647696A53e0C0165cA006e',
      version: 'v4'
    },

    {
      tokens: [RAZOR, DFYN],
      rewardTokens: [RAZOR, DFYN],
      baseToken: DFYN,
      start: 1631021400000,
      stakingRewardAddress: '0x00148Bd87C72fBE3E882a530F74aA74A2f1F463F',
      version: 'v4'
    },
    //v3

    // {
    //   tokens: [SING, DFYN],
    //   rewardTokens: [SING, DFYN],
    //   baseToken: DFYN,
    //   start: 1630330200000,
    //   stakingRewardAddress: '0x0351F770017974A137554fF889Ff6daE6b4762e3',
    //   version: 'v3'
    // },

  ]
}

export const INACTIVE_STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    rewardTokens: [Token, Token]
    baseToken?: Token
    start: number
    stakingRewardAddress: string
    version: string
  }[]
} = {
  [ChainId.MATIC]: [
    {
      tokens: [ROUTE, DFYN],
      rewardTokens: [ROUTE, DFYN],
      baseToken: DFYN,
      start: 1632315600000,
      stakingRewardAddress: '0xe194f2cB4da23B1FB26B41Eb818d25d9FC7367f2',
      version: 'v4'
    },
    {
      tokens: [ROUTE, DFYN],
      rewardTokens: [ROUTE, DFYN],
      baseToken: DFYN,
      start: 1629723600000,
      stakingRewardAddress: '0xEdBB73C0ccD3F00cD75c2749b0df40A1BE394EE2',
      version: 'v3'
    },
    {
      tokens: [NORD, DFYN],
      rewardTokens: [NORD, DFYN],
      baseToken: DFYN,
      start: 1630330200000,
      stakingRewardAddress: '0xD5C27Cc3b43e7a5A16fAb6852e3dc9cD9F00606B',
      version: 'v3'
    },
    //v2
    {
      tokens: [CHART, DFYN],
      rewardTokens: [DFYN, CHART],
      baseToken: DFYN,
      start: 1627993800000,
      stakingRewardAddress: '0x925616a980CA726A428476e8c74d737D568390F6',
      version: 'v2'
    },
    {
      tokens: [XUSD, DFYN],
      rewardTokens: [DFYN, XDO],
      baseToken: DFYN,
      start: 1624980600000,
      stakingRewardAddress: '0xc6Cface612849C1D378Fbfe8Bdf49D01bbf569Bb',
      version: 'v1'
    },
    {
      tokens: [RVF, DFYN],
      rewardTokens: [DFYN, RVF],
      baseToken: DFYN,
      start: 1627993800000,
      stakingRewardAddress: '0x153E36832263BcAcEc552Eb53537680E54B5737F',
      version: 'v2'
    },
    {
      tokens: [FRM, DFYN],
      rewardTokens: [DFYN, FRM],
      baseToken: DFYN,
      start: 1626183000000,
      stakingRewardAddress: '0x038CDc7A25FEF0c7b3abD5C2a47071ba202Bbaf6',
      version: 'v1'
    },
    {
      tokens: [ROUTE, DFYN],
      rewardTokens: [ROUTE, DFYN],
      baseToken: DFYN,
      start: 1627142400000,
      stakingRewardAddress: '0xD98CA02cc836004534EAF88726027D82b4653aed',
      version: 'v2'
    },
    {
      tokens: [ROUTE, DFYN],
      rewardTokens: [ROUTE, DFYN],
      baseToken: DFYN,
      start: 1622033000000,
      stakingRewardAddress: '0xf997c8e2e7e7387C8fd9120280ad9B3db31A5381',
      version: 'v1'
    },
    {
      tokens: [EZ, DFYN],
      rewardTokens: [DFYN, EZ],
      baseToken: DFYN,
      start: 1624552200000,
      stakingRewardAddress: '0xA8453cFae7EC47e7099115789258226C5cb75534',
      version: 'v1'
    },
    {
      tokens: [UFARM, DFYN],
      rewardTokens: [DFYN, UFARM],
      baseToken: DFYN,
      start: 1624552200000,
      stakingRewardAddress: '0x7ba448d0b438723fFffDB3b842AA72e6EB7588C5',
      version: 'v1'
    },
    {
      tokens: [NWC, DFYN],
      rewardTokens: [DFYN, NWC],
      baseToken: DFYN,
      start: 1624552200000,
      stakingRewardAddress: '0x91174CBa63E8A2A1755ba473820183e4e64a3Dc8',
      version: 'v1'
    },
    {
      tokens: [mRTK, DFYN],
      rewardTokens: [DFYN, mRTK],
      baseToken: DFYN,
      start: 1624552200000,
      stakingRewardAddress: '0x5190430648eD5E8879665c36e0CE8Bd76f1449B8',
      version: 'v1'
    },
    {
      tokens: [SX, DFYN],
      rewardTokens: [DFYN, SX],
      baseToken: DFYN,
      start: 1623947400000,
      stakingRewardAddress: '0x9a9592279B61A875BEc036091D96cc4093B374C0',
      version: 'v1'
    },
    {
      tokens: [BOOTY, DFYN],
      rewardTokens: [DFYN, BOOTY],
      baseToken: DFYN,
      start: 1623762000000,
      stakingRewardAddress: '0x2980acaa5cBcA993B3868ef54B88CE328bCA06f7',
      version: 'v1'
    },
    {
      tokens: [ROYA, DFYN],
      rewardTokens: [DFYN, ROYA],
      baseToken: DFYN,
      start: 1623762000000,
      stakingRewardAddress: '0x32c449fcA14954b3848378c01C5439d525c2f0b2',
      version: 'v1'
    },
    {
      tokens: [ZEE, DFYN],
      rewardTokens: [DFYN, ZEE],
      baseToken: DFYN,
      start: 1622133000000,
      stakingRewardAddress: '0xfB75d80e141b91535dA513370D4Dd33D0E19d308',
      version: 'v1'
    },
    {
      tokens: [AURORA, DFYN],
      rewardTokens: [DFYN, AURORA],
      baseToken: DFYN,
      start: 1622478600000,
      stakingRewardAddress: '0x4Dd06f2D7746330C279Fdfa7a75407165eb1D845',
      version: 'v1'
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
  version: string
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
export function useStakingInfo(pairToFilterBy?: Pair | null, version: string = 'v1'): StakingInfo[] {
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
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]) && version === stakingRewardInfo.version
        ) ?? []
        : [],
    [chainId, pairToFilterBy, version]
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
          version: info[index].version,
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

export function useInactiveStakingInfo(pairToFilterBy?: Pair | null, version: string = 'v1'): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? INACTIVE_STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]) && version === stakingRewardInfo.version
        ) ?? []
        : [],
    [chainId, pairToFilterBy, version]
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
          type: { typeOf: 'Archived Dual Farms', url: 'dual-farms/archived' },
          rewardAddresses,
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          version: info[index].version,
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
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const activeStakingInfos = useStakingInfo()
  const inactiveStakingInfos = useInactiveStakingInfo();
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