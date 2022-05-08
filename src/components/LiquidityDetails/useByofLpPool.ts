//@ts-nocheck
import axios from 'axios'
import { useActiveWeb3React } from 'hooks'
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
    LF = '4'
}
export default function useByofLpDetails():{
    lpByofDetails: {
      stakingRewardAddress: string
      tokens: [Token, Token]
      totalSupply: TokenAmount
      stakedAmount: TokenAmount
      stakingToken: string
      rewardToken0: Token
      rewardToken1: Token | undefined
      rewardToken0RewardRate: TokenAmount
      rewardToken1RewardRate: TokenAmount | undefined
      startTime: number
      periodFinish: number
      type: {
        typeOf: string,
        url: string
      }
      rewardsDuration: number
    }[]
    farmsDataArray: []
} {
    const {account, chainId} = useActiveWeb3React()
    const[farmsData, setFarmsData] = useState({})
    
    useEffect(() => {
      const fetchData = async () => {
        const query = `{
          users(where:{id: "${account?.toLowerCase()}"}){
           id
            staked{
              id
              amount
              farm{
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
            }
          }
        }`;
        const res = await axios({
          url: "https://api.thegraph.com/subgraphs/name/jds-23/byof-first",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            query
          },
        })
        setFarmsData(res)
      }
      if(account){
        fetchData()
      }
    }, [account])
    const value1 = Object.values(farmsData)
    const farmsArray = value1[0]?.data?.users[0]?.staked
    const  currenctEpoch = Math.floor(new Date().getTime()/1000)
    const allTokens = useAllTokens()

    //  getting all the tokens pairs
    const trackedTokenPairs = useTrackedTokenPairs()
    const tokenPairsWithLiquidityTokens = useMemo(
      () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
      [trackedTokenPairs]
    )
    const lpByofDetails: {
      stakingRewardAddress: string
      tokens: [Token, Token]
      totalSupply: TokenAmount
      stakedAmount: TokenAmount
      stakingToken: string
      rewardToken0: Token
      rewardToken1: Token | undefined
      rewardToken0RewardRate: TokenAmount
      rewardToken1RewardRate: TokenAmount | undefined
      startTime: number
      periodFinish: number
      type: {
        typeOf: string,
        url: string
      }
      rewardsDuration: number
    }[] = []
    const farmsDataArray = chainId === 137 && farmsArray?.map((i: any) =>{
        const bothTokens: [Token, Token] = tokenPairsWithLiquidityTokens.filter(j => j.liquidityToken.address === utils.getAddress(i.farm.stakingToken)).map(k => k.tokens)[0]
        const dummyPair = new Pair(new TokenAmount(bothTokens[0] , '0'), new TokenAmount(bothTokens[1], '0'))
        i.farm.totalSupply = BigNumber.from(i.farm.totalSupply)
        i.amount = BigNumber.from(i.amount)
        i.farm.rewardToken0RewardRate = BigNumber.from(i.farm.rewardToken0RewardRate)
        i.farm.rewardToken1RewardRate = BigNumber.from(i.farm.rewardToken1RewardRate)
        if(i.farm.type && i.farm.periodFinish){
          if(i.farm.type === FarmStrategy.ECF && i.farm.periodFinish > currenctEpoch) i.farm.type = "custom-eco-farms"
          else if(i.farm.type === FarmStrategy.DF && i.farm.periodFinish > currenctEpoch) i.farm.type = "custom-dual-farms"
          else if(i.farm.type === FarmStrategy.PF && i.farm.periodFinish > currenctEpoch) i.farm.type = "custom-popular-farms"
          else if(i.farm.type === FarmStrategy.LF && i.farm.periodFinish > currenctEpoch) i.farm.type = "custom-launch-farms"
          else if(i.farm.type === FarmStrategy.ECF && i.farm.periodFinish < currenctEpoch) i.farm.type = "custom-eco-farms/archived"
          else if(i.farm.type === FarmStrategy.DF && i.farm.periodFinish < currenctEpoch) i.farm.type = "custom-dual-farms/archived"
          else if(i.farm.type === FarmStrategy.PF && i.farm.periodFinish < currenctEpoch) i.farm.type = "custom-popular-farms/archived"
          else if(i.farm.type === FarmStrategy.LF && i.farm.periodFinish < currenctEpoch) i.farm.type = "custom-launch-farms/archived"
        }
        let farms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            totalSupply: TokenAmount
            stakedAmount: TokenAmount
            stakingToken: string
            rewardToken0: Token
            rewardToken1: Token | undefined
            rewardToken0RewardRate: TokenAmount
            rewardToken1RewardRate: TokenAmount | undefined
            startTime: number
            periodFinish: number
            type: {
              typeOf: string,
              url: string
            }
            rewardsDuration: number
        }={ 
            stakingRewardAddress: utils.getAddress(i.farm.id),
            tokens: [bothTokens[0], bothTokens[1]],
            totalSupply: new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(i.farm.totalSupply)),
            stakedAmount: new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(i.amount)),
            stakingToken: i.farm.stakingToken,
            rewardToken0: allTokens[utils.getAddress(i.farm.rewardToken0)],
            rewardToken1: isZero(i.farm.rewardToken1) ? undefined : allTokens[utils.getAddress(i.farm.rewardToken1)],
            rewardToken0RewardRate: new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(i.farm.rewardToken0RewardRate)),
            rewardToken1RewardRate: new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(i.farm.rewardToken1RewardRate)),
            startTime: Number(i.farm.startTime),
            periodFinish: Number(i.farm.periodFinish),
            type: {
              typeOf: i.farm.type === "custom-eco-farms" ? "Ecosystem Farms" : i.farm.type === "custom-dual-farms" ? "Dual Farms" : i.farm.type === "custom-popular-farms" ? "Popular Farms" : i.farm.type === "custom-launch-farms" ? "Launch Farms"
              : i.farm.type === "custom-eco-farms/archived" ? "Ecosystem Farms" : i.farm.type === "custom-dual-farms/archived" ? "Dual Farms" : i.farm.type === "custom-popular-farms/archived" ? "Popular Farms" : "Launch Farms",
              url: i.farm.type
            },
            rewardsDuration: Number(i.farm.rewardsDuration)
        }
        lpByofDetails.push(farms)
        return farms
    })
    return {
      farmsDataArray,
      lpByofDetails
    }
}
