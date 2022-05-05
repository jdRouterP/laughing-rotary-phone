import axios from 'axios'
import { useAllTokens } from 'hooks/Tokens'
import { useEffect, useMemo, useState } from 'react'
import { BigNumber, utils } from 'ethers'
import { JSBI, Pair, Token, TokenAmount } from '@dfyn/sdk'
import isZero from 'utils/isZero'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
enum FarmStrategy {
  ECF = '1',
  DF = '2',
  PF = '3',
  LF = '4',
}
export default function useAllByofFarmsPools(): {
  allByofFarmsDetails: {
    stakingRewardAddress: string
    tokens: [Token, Token]
    totalSupply: TokenAmount
    stakingToken: string
    rewardToken0: Token
    rewardToken1: Token | undefined
    rewardToken0RewardRate: TokenAmount
    rewardToken1RewardRate: TokenAmount | undefined
    startTime: number
    periodFinish: number
    type: {
      typeOf: string
      url: string
    }
    rewardsDuration: number
  }[]
  // farmsDataArray: []
} {
  const [farmsData, setFarmsData] = useState<undefined | any[]>()

  useEffect(() => {
    const fetchData = async () => {
      const query = `{
          farms {
            id
            totalSupply
            stakingToken
            rewardToken0
            rewardToken1
            rewardToken0RewardRate
            rewardToken1RewardRate
            startTime
            periodFinish
            type
            rewardsDuration
          }
        }`
      const res = await axios({
        url: 'https://api.thegraph.com/subgraphs/name/jds-23/dfyn-byof-polygon',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          query,
        },
      })
      console.log(res)
      setFarmsData(res?.data?.data?.farms)
    }
    fetchData()
  }, [])
  // const value1: any = Object.values(farmsData)
  // const farmsArray: any[] = []
  const allTokens = useAllTokens()

  //  getting all the tokens pairs
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  // const allByofFarmsDetails: {
  //   stakingRewardAddress: string
  //   tokens: [Token, Token]
  //   totalSupply: TokenAmount
  //   stakingToken: string
  //   rewardToken0: Token
  //   rewardToken1: Token | undefined
  //   rewardToken0RewardRate: TokenAmount
  //   rewardToken1RewardRate: TokenAmount | undefined
  //   startTime: number
  //   periodFinish: number
  //   type: {
  //     typeOf: string
  //     url: string
  //   }
  //   rewardsDuration: number
  // }[] = []
  const allByofFarmsDetails: {
    stakingRewardAddress: string
    tokens: [Token, Token]
    totalSupply: TokenAmount
    stakingToken: string
    rewardToken0: Token
    rewardToken1: Token | undefined
    rewardToken0RewardRate: TokenAmount
    rewardToken1RewardRate: TokenAmount | undefined
    startTime: number
    periodFinish: number
    type: {
      typeOf: string
      url: string
    }
    rewardsDuration: number
  }[] = useMemo(() => {
    return farmsData
      ? farmsData?.map((i: any) => {
          const currenctEpoch = Math.floor(new Date().getTime() / 1000)
          const bothTokens: [Token, Token] = tokenPairsWithLiquidityTokens
            .filter((j) => j.liquidityToken.address === utils.getAddress(i.stakingToken))
            .map((k) => k.tokens)[0]
          const dummyPair = new Pair(new TokenAmount(bothTokens[0], '0'), new TokenAmount(bothTokens[1], '0'))
          i.totalSupply = BigNumber.from(i.totalSupply)
          i.rewardToken0RewardRate = BigNumber.from(i.rewardToken0RewardRate)
          i.rewardToken1RewardRate = BigNumber.from(i.rewardToken1RewardRate)
          if (i.type && i.periodFinish) {
            if (i.type === FarmStrategy.ECF && i.periodFinish > currenctEpoch) i.type = 'custom-eco-farms'
            else if (i.type === FarmStrategy.DF && i.periodFinish > currenctEpoch) i.type = 'custom-dual-farms'
            else if (i.type === FarmStrategy.PF && i.periodFinish > currenctEpoch) i.type = 'custom-popular-farms'
            else if (i.type === FarmStrategy.LF && i.periodFinish > currenctEpoch) i.type = 'custom-launch-farms'
            else if (i.type === FarmStrategy.ECF && i.periodFinish < currenctEpoch) i.type = 'custom-eco-farms/archived'
            else if (i.type === FarmStrategy.DF && i.periodFinish < currenctEpoch) i.type = 'custom-dual-farms/archived'
            else if (i.type === FarmStrategy.PF && i.periodFinish < currenctEpoch)
              i.type = 'custom-popular-farms/archived'
            else if (i.type === FarmStrategy.LF && i.periodFinish < currenctEpoch)
              i.type = 'custom-launch-farms/archived'
          }
          let farms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            totalSupply: TokenAmount
            stakingToken: string
            rewardToken0: Token
            rewardToken1: Token | undefined
            rewardToken0RewardRate: TokenAmount
            rewardToken1RewardRate: TokenAmount | undefined
            startTime: number
            periodFinish: number
            type: {
              typeOf: string
              url: string
            }
            rewardsDuration: number
          } = {
            stakingRewardAddress: utils.getAddress(i.id),
            tokens: [bothTokens[0], bothTokens[1]],
            totalSupply: new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(i.totalSupply)),
            stakingToken: i.stakingToken,
            rewardToken0: allTokens[utils.getAddress(i.rewardToken0)],
            rewardToken1: isZero(i.rewardToken1) ? undefined : allTokens[utils.getAddress(i.rewardToken1)],
            rewardToken0RewardRate: new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(i.rewardToken0RewardRate)),
            rewardToken1RewardRate: new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(i.rewardToken1RewardRate)),
            startTime: Number(i.startTime),
            periodFinish: Number(i.periodFinish),
            type: {
              typeOf:
                i.type === 'custom-eco-farms'
                  ? 'Ecosystem Farms'
                  : i.type === 'custom-dual-farms'
                  ? 'Dual Farms'
                  : i.type === 'custom-popular-farms'
                  ? 'Popular Farms'
                  : i.type === 'custom-launch-farms'
                  ? 'Launch Farms'
                  : i.type === 'custom-eco-farms/archived'
                  ? 'Ecosystem Farms'
                  : i.type === 'custom-dual-farms/archived'
                  ? 'Dual Farms'
                  : i.type === 'custom-popular-farms/archived'
                  ? 'Popular Farms'
                  : 'Launch Farms',
              url: i.type,
            },
            rewardsDuration: Number(i.rewardsDuration),
          }
          // allByofFarmsDetails.push(farms)
          return farms
        })
      : []
  }, [allTokens, farmsData, tokenPairsWithLiquidityTokens])

  return {
    // farmsDataArray,
    allByofFarmsDetails,
  }
}
