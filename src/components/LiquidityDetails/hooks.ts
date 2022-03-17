//@ts-nocheck
import { Pair, JSBI } from '@dfyn/sdk'
import { PairState, usePairs } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import {useMemo} from 'react'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { useStakingInfo as useFloraStakingInfo } from '../../state/flora-farms/hooks'
import { useStakingInfo as useDualStakingInfo } from '../../state/dual-stake/hooks'
import { StakingInfo, useStakingInfo as usePreStakingInfo } from '../../state/stake/hooks'
import { useStakingInfo as useVanillaStakingInfo } from '../../state/vanilla-stake/hooks'
import { useInactiveStakingInfo as useInactiveFloraStakingInfo } from '../../state/flora-farms/hooks'
import { useInactiveStakingInfo as useInactiveDualStakingInfo } from '../../state/dual-stake/hooks'
import { useInactiveStakingInfo as useInactivePreStakingInfo } from '../../state/stake/hooks'
import { useInactiveStakingInfo as useInactiveVanillaStakingInfo } from '../../state/vanilla-stake/hooks'
import { BIG_INT_ZERO } from '../../constants' 
import useByofLpDetails from './useByofLpPool'


export default function useGetLP(): {
    balances: (StakingInfo | StakingInfo | StakingInfo)[]
    v2PairsWithoutStakedAmount: Pair[]
    v2IsLoading: boolean
    stakingPairs: [PairState, Pair | null][]
    allV2PairsWithLiquidity: Pair[]

} {
    const {account} = useActiveWeb3React()
    const trackedTokenPairs = useTrackedTokenPairs()
    const tokenPairsWithLiquidityTokens = useMemo(
      () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
      [trackedTokenPairs]
    )
    const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
      tokenPairsWithLiquidityTokens
    ])
    
    //byofStaked Lp
    const {lpByofDetails} = useByofLpDetails()
    
    const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
      account ?? undefined,
      liquidityTokens
    )
    const liquidityTokensWithBalances = useMemo(
      () =>
        tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
          v2PairsBalances[liquidityToken.address]?.greaterThan('0')
        ),
      [tokenPairsWithLiquidityTokens, v2PairsBalances]
    )
    const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  
    const v2IsLoading =
      fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)
     
    const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))
  
    // show liquidity even if its deposited in rewards contract
    const vanillaStakingInfo = useVanillaStakingInfo()
    const vanillaStakingInfosWithBalance = vanillaStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const preStakingInfo = usePreStakingInfo()
    const preStakingsWithBalance = preStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const dualStakingInfo = useDualStakingInfo()
    const dualStakingInfosWithBalance = dualStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const floraStakingInfo = useFloraStakingInfo()
    const floraStakingInfosWithBalance = floraStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    // show liquidity even if its deposited in inactive rewards contract
    const inactiveVanillaStakingInfo = useInactiveVanillaStakingInfo()
    const inactiveVanillaStakingInfosWithBalance = inactiveVanillaStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const inactivePreStakingInfo = useInactivePreStakingInfo()
    const inactivePreStakingsWithBalance = inactivePreStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const inactiveDualStakingInfo = useInactiveDualStakingInfo()
    const inactiveDualStakingInfosWithBalance = inactiveDualStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const inactiveFloraStakingInfo = useInactiveFloraStakingInfo()
    const inactiveFloraStakingInfosWithBalance = inactiveFloraStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))

    // // show byof liquidity even if its deposited in rewards contract
    const byofVanillaStakingInfosWithBalance = lpByofDetails?.filter(i => i.type.url === "custom-eco-farms").filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const byofFloraStakingInfosWithBalance = lpByofDetails?.filter(i => i.type.url === "custom-popular-farms").filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const byofDualStakingInfosWithBalance = lpByofDetails?.filter(i => i.type.url === "custom-dual-farms").filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const byofPreStakingInfosWithBalance = lpByofDetails?.filter(i => i.type.url === "custom-launch-farms").filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const inactiveByofVanillaStakingInfosWithBalance = lpByofDetails?.filter(i => i.type.url === "custom-eco-farms/archived").filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const inactiveByofFloraStakingInfosWithBalance = lpByofDetails?.filter(i => i.type.url === "custom-popular-farms/archived").filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const inactiveByofDualStakingInfosWithBalance = lpByofDetails?.filter(i => i.type.url === "custom-dual-farms/archived").filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const inactiveByofPreStakingInfosWithBalance = lpByofDetails?.filter(i => i.type.url === "custom-launch-farms/archived").filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))

    //ORDER MATTERS
    let stakingPairs = [
      ...usePairs(vanillaStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(inactiveVanillaStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(preStakingsWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(inactivePreStakingsWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(dualStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(inactiveDualStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(floraStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(inactiveFloraStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(byofVanillaStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(byofFloraStakingInfosWithBalance?.map(stakingfInfo => stakingfInfo.tokens)),
      ...usePairs(byofDualStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(byofPreStakingInfosWithBalance?.map(stakingfInfo => stakingfInfo.tokens)),
      ...usePairs(inactiveByofVanillaStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(inactiveByofFloraStakingInfosWithBalance?.map(stakingfInfo => stakingfInfo.tokens)),
      ...usePairs(inactiveByofDualStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
      ...usePairs(inactiveByofPreStakingInfosWithBalance?.map(stakingfInfo => stakingfInfo.tokens))
    ]
    let balances = [
      ...vanillaStakingInfosWithBalance,
      ...inactiveVanillaStakingInfosWithBalance,
      ...preStakingsWithBalance,
      ...inactivePreStakingsWithBalance,
      ...dualStakingInfosWithBalance,
      ...inactiveDualStakingInfosWithBalance,
      ...floraStakingInfosWithBalance,
      ...inactiveFloraStakingInfosWithBalance,
      ...byofVanillaStakingInfosWithBalance,
      ...byofFloraStakingInfosWithBalance,
      ...byofDualStakingInfosWithBalance,
      ...byofPreStakingInfosWithBalance,
      ...inactiveByofVanillaStakingInfosWithBalance,
      ...inactiveByofFloraStakingInfosWithBalance,
      ...inactiveByofDualStakingInfosWithBalance,
      ...inactiveByofPreStakingInfosWithBalance,
    ];
    const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
      return (
        stakingPairs
          ?.map(stakingPair => stakingPair[1])
          .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
      )
    })
    return{
        balances,
        v2PairsWithoutStakedAmount,
        v2IsLoading,
        stakingPairs,
        allV2PairsWithLiquidity
    }
}
