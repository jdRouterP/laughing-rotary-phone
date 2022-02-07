import { Token } from '@dfyn/sdk'
import { useDfynByofContract } from 'hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { ethers } from 'ethers'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { useAllTokens } from 'hooks/Tokens'
import { useMemo } from 'react'

enum FarmStrategy {
    ECF = '1',
    DF = '2',
    PF = '3',
    MTF = '',
    LF = '4'
}
export default function useCustomFarmInfo(
): {
    ecoSystemFarms: {
        stakingRewardAddress: string
        tokens: [Token, Token]
        baseToken: Token
        startDate: number
        endDate: number
        rewardToken: Token
        rewardAmount: number
      }[]
      inactiveEcoSystemFarms: {
        stakingRewardAddress: string
        tokens: [Token, Token]
        baseToken: Token
        startDate: number
        endDate: number
        rewardToken: Token
        rewardAmount: number
      }[]
      dualFarms: {
        stakingRewardAddress: string
        tokens: [Token, Token]
        baseToken: Token
        startDate: number
        endDate: number
        rewardTokens: [Token, Token]
        rewardAmount: [number, number]
      }[]
      inactiveDualFarms: {
        stakingRewardAddress: string
        tokens: [Token, Token]
        baseToken: Token
        startDate: number
        endDate: number
        rewardTokens: [Token, Token]
        rewardAmount: [number, number]
    }[]
    floraFarms: {
        stakingRewardAddress: string
        tokens: [Token, Token]
        baseToken: Token
        startDate: number
        endDate: number
        rewardToken: Token[]
        rewardAmount: number[]
        burnRate: number
        vestingPeriod: number
        splits: number
        claim: number
    }[]
    inactiveFloraFarms: {
        stakingRewardAddress: string
        tokens: [Token, Token]
        baseToken: Token
        startDate: number
        endDate: number
        rewardToken: Token[]
        rewardAmount: number[]
        burnRate: number
        vestingPeriod: number
        splits: number
        claim: number
    }[]
    launchFarms: {
        stakingRewardAddress: string
        tokens: [Token, Token]
        baseToken: Token
        startDate: number
        endDate: number
        rewardToken: Token[]
        rewardAmount: number[]
        vestingPeriod: number
        splits: number
        claim: number
    }[]
    inactiveLaunchFarms: {
        stakingRewardAddress: string
        tokens: [Token, Token]
        baseToken: Token
        startDate: number
        endDate: number
        rewardToken: Token[]
        rewardAmount: number[]
        vestingPeriod: number
        splits: number
        claim: number
    }[]
    allFarms: []
} {
    const byofContractAddress = useDfynByofContract()

    //getting the all the farms from contract
    const value = useSingleCallResult(byofContractAddress, 'getDeployedfarms')

    //getting all the tokens pairs
    const trackedTokenPairs = useTrackedTokenPairs()
    const tokenPairsWithLiquidityTokens = useMemo(
        () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
        [trackedTokenPairs]
    )

    //getting all the tokens info on the basis of address
    const allTokens = useAllTokens()
    if(value.result){
        const farmsValue = value.result.map(i => i)
        const farmsArray = farmsValue[0]
        
        // const encodedEcoFarms = farmsArray.filter((i: any) => i[2] === "1").map((j: any) => j[1])
        // const encodedDualFarms = farmsArray.filter((i: any) => i[2] === "2").map((j:any) => j[1])
        const encodedPopularFarms = farmsArray.filter((i: any) => i[2] === "3").map((j: any) => j[1])
        const encodedLaunchFarms = farmsArray.filter((i: any) => i[2] === "4").map((j: any) => j[1])

        // console.log("EcoFarmsArr", ecoFarmsArr);
        // console.log("EcoFarmsArr", dualFarmsArr);
        // console.log("EcoFarmsArr", popularFarmsArr);
        

        // const encodedEcoFarms = ecoFarmsArr.map((i: any) => i[1])
        // const encodedDualFarms = dualFarmsArr.map((i: any) => i[1])
        // const encodedPopularFarms = popularFarmsArr.map((i: any) => i[1])
        
        // const decodedEcoFarms = encodedEcoFarms.map((i: any) => ethers.utils.defaultAbiCoder.decode(["address", "uint", "uint","address[]","uint[]"], i))
        // const decodedDualFarms = encodedDualFarms.map((i: any) => ethers.utils.defaultAbiCoder.decode(["address", "uint", "uint","address[]","uint[]"], i))
        const decodedPopularFarms = encodedPopularFarms.map((i: any) => ethers.utils.defaultAbiCoder.decode(["address", "uint", "uint","address[]","uint[]", "bytes"], i))
        const decodedPopularFarmsBytes = decodedPopularFarms.map((i: any) => ethers.utils.defaultAbiCoder.decode(["uint", "uint", "uint", "uint"], i[5]))
        const decodedLaunchFarms = encodedLaunchFarms.map((i: any) => ethers.utils.defaultAbiCoder.decode(["address", "uint", "uint","address[]","uint[]", "bytes"], i))
        const decodedLaunchFarmsBytes = decodedLaunchFarms.map((i: any) => ethers.utils.defaultAbiCoder.decode(["uint", "uint", "uint"], i[5]))
        // console.log("EcoFarms::}", decodedEcoFarms)
        // console.log("DualFarms::}", decodedDualFarms)
        // console.log("PopularFarms::}", decodedPopularFarms)
        // console.log("DecodedBytesofPopularFarms", decodedPopularFarmsBytes)
        // console.log("DecodedLaunchFarmsBytes:", decodedLaunchFarmsBytes)
        //decode the params getting from contract
        const encodedValues = farmsArray.map((i: any) => i[1])
        const decodeValues = encodedValues.map((i: any) => ethers.utils.defaultAbiCoder.decode(["address", "uint", "uint","address[]","uint[]"], i))
        const ecoSystemFarms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            baseToken: Token
            startDate: number
            endDate: number
            rewardToken: Token
            rewardAmount: number
        }[] = []
        const dualFarms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            baseToken: Token
            startDate: number
            endDate: number
            rewardTokens: [Token, Token]
            rewardAmount: [number, number]
        }[] = []
        const floraFarms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            baseToken: Token
            startDate: number
            endDate: number
            rewardToken: Token[]
            rewardAmount: number[]
            burnRate: number
            vestingPeriod: number
            splits: number
            claim: number
        }[] = []
        const launchFarms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            baseToken: Token
            startDate: number
            endDate: number
            rewardToken: Token[]
            rewardAmount: number[]
            vestingPeriod: number
            splits: number
            claim: number
        }[] = []
        const inactiveEcoSystemFarms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            baseToken: Token
            startDate: number
            endDate: number
            rewardToken: Token
            rewardAmount: number
        }[] = []
        const inactiveDualFarms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            baseToken: Token
            startDate: number
            endDate: number
            rewardTokens: [Token, Token]
            rewardAmount: [number, number]
        }[] = []
        const inactiveFloraFarms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            baseToken: Token
            startDate: number
            endDate: number
            rewardToken: Token[]
            rewardAmount: number[]
            burnRate: number
            vestingPeriod: number
            splits: number
            claim: number
        }[] = []
        const inactiveLaunchFarms: {
            stakingRewardAddress: string
            tokens: [Token, Token]
            baseToken: Token
            startDate: number
            endDate: number
            rewardToken: Token[]
            rewardAmount: number[]
            vestingPeriod: number
            splits: number
            claim: number
        }[] = []
        // const allEcoFarms = decodedEcoFarms.map((i: any, j: any) => {
        //     const endDateValue = new Date(decodedEcoFarms[j][2].toNumber())
        //     const  currenctEpoch = new Date()
        //     if(endDateValue > currenctEpoch){
        //         const farms: {
        //             stakingRewardAddress: string
        //             tokens: [Token, Token]
        //             baseToken: Token
        //             startDate: number
        //             endDate: number
        //             rewardToken: Token
        //             rewardAmount: number
        //             version: string
        //         } = {
        //             stakingRewardAddress: i[0],
        //             tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedEcoFarms[j][0]).map(j => j.tokens)[0],
        //             baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedEcoFarms[j][0]).map(j => j.tokens)[0][0],
        //             startDate: decodedEcoFarms[j][1].toString(),
        //             endDate: decodedEcoFarms[j][2].toString(),
        //             rewardToken: allTokens[decodedEcoFarms[j][3][0]],
        //             rewardAmount: decodedEcoFarms[j][4][0].toString(),
        //             version: 'v4'
        //         }
        //         ecoSystemFarms.push(farms)
        //         return farms
        //     }
        //     else{
        //         const farms: {
        //             stakingRewardAddress: string
        //             tokens: [Token, Token]
        //             baseToken: Token
        //             startDate: number
        //             endDate: number
        //             rewardToken: Token
        //             rewardAmount: number
        //             version: string
        //         } = {
        //             stakingRewardAddress: i[0],
        //             tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedEcoFarms[j][0]).map(j => j.tokens)[0],
        //             baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedEcoFarms[j][0]).map(j => j.tokens)[0][0],
        //             startDate: decodedEcoFarms[j][1].toString(),
        //             endDate: decodedEcoFarms[j][2].toString(),
        //             rewardToken: allTokens[decodedEcoFarms[j][3][0]],
        //             rewardAmount: decodedEcoFarms[j][4][0].toString(),
        //             version: 'v4'
        //         }
        //         inactiveEcoSystemFarms.push(farms)
        //         return farms
        //     }
        // })
        // const allDualFarms = decodedDualFarms.map((i: any, j: any) => {
        //     const endDateValue = new Date(decodedDualFarms[j][2].toNumber())
        //     const  currenctEpoch = new Date()
        //     if(endDateValue.getTime() > currenctEpoch.getTime()){
        //         const farms: {
        //             stakingRewardAddress: string
        //             tokens: [Token, Token]
        //             baseToken: Token
        //             startDate: number
        //             endDate: number
        //             rewardTokens: [Token, Token]
        //             rewardAmount: [number, number]
        //             version: string
        //         } = {
        //             stakingRewardAddress: i[0],
        //             tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedDualFarms[j][0]).map(j => j.tokens)[0],
        //             baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedDualFarms[j][0]).map(j => j.tokens)[0][0],
        //             startDate: decodedDualFarms[j][1].toString(),
        //             endDate: decodedDualFarms[j][2].toString(),
        //             rewardTokens: [allTokens[decodedDualFarms[j][3][0]], allTokens[decodedDualFarms[j][3][1]]],
        //             rewardAmount: decodedDualFarms[j][4].map((i: any) => i.toString()),
        //             version: 'v4'
        //         }
        //         dualFarms.push(farms)
        //         return farms
        //     }
        //     else{
        //         const farms: {
        //             stakingRewardAddress: string
        //             tokens: [Token, Token]
        //             baseToken: Token
        //             startDate: number
        //             endDate: number
        //             rewardTokens: [Token, Token]
        //             rewardAmount: [number, number]
        //             version: string
        //         } = {
        //             stakingRewardAddress: i[0],
        //             tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedDualFarms[j][0]).map(j => j.tokens)[0],
        //             baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedDualFarms[j][0]).map(j => j.tokens)[0][0],
        //             startDate: decodedDualFarms[j][1].toString(),
        //             endDate: decodedDualFarms[j][2].toString(),
        //             rewardTokens: [allTokens[decodedDualFarms[j][3][0]], allTokens[decodedDualFarms[j][3][1]]],
        //             rewardAmount: decodedDualFarms[j][4].map((i: any) => i.toString()),
        //             version: 'v4'
        //         }
        //         inactiveDualFarms.push(farms)
        //         return farms
        //     }
        // })

        // const allPopularFarms = decodedPopularFarms.map((i: any, j: any) => {
        //     const endDateValue = new Date(decodedPopularFarms[j][2].toNumber())
        //     const  currenctEpoch = new Date()
        //     if(endDateValue > currenctEpoch){
        //         const farms: {
        //             stakingRewardAddress: string
        //             tokens: [Token, Token]
        //             baseToken: Token
        //             startDate: number
        //             endDate: number
        //             rewardToken: Token
        //             rewardAmount: number
        //             burnRate: number
        //             vestingPeriod: number
        //             splits: number
        //             claim: number
        //             version: string
        //         } = {
        //             stakingRewardAddress: i[0],
        //             tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedPopularFarms[j][0]).map(j => j.tokens)[0],
        //             baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedPopularFarms[j][0]).map(j => j.tokens)[0][0],
        //             startDate: decodedPopularFarms[j][1].toString(),
        //             endDate: decodedPopularFarms[j][2].toString(),
        //             rewardToken: allTokens[decodedPopularFarms[j][3][0]],
        //             rewardAmount: decodedPopularFarms[j][4][0].toString(),
        //             burnRate: decodedPopularFarmsBytes[0][1].toNumber(),
        //             vestingPeriod: decodedPopularFarmsBytes[0][1].toNumber(),
        //             splits: decodedPopularFarmsBytes[0][2].toNumber(),
        //             claim: decodedPopularFarmsBytes[0][3].toNumber(),
        //             version: 'v4'
        //         }
        //         floraFarms.push(farms)
        //         return farms
        //     }
        //     else{
        //         const farms: {
        //             stakingRewardAddress: string
        //             tokens: [Token, Token]
        //             baseToken: Token
        //             startDate: number
        //             endDate: number
        //             rewardToken: Token
        //             rewardAmount: number
        //             burnRate: number
        //             vestingPeriod: number
        //             splits: number
        //             claim: number
        //             version: string
        //         } = {
        //             stakingRewardAddress: i[0],
        //             tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedPopularFarms[j][0]).map(j => j.tokens)[0],
        //             baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodedPopularFarms[j][0]).map(j => j.tokens)[0][0],
        //             startDate: decodedPopularFarms[j][1].toString(),
        //             endDate: decodedPopularFarms[j][2].toString(),
        //             rewardToken: allTokens[decodedPopularFarms[j][3][0]],
        //             rewardAmount: decodedPopularFarms[j][4][0].toString(),
        //             burnRate: decodedPopularFarmsBytes[0][1].toNumber(),
        //             vestingPeriod: decodedPopularFarmsBytes[0][1].toNumber(),
        //             splits: decodedPopularFarmsBytes[0][2].toNumber(),
        //             claim: decodedPopularFarmsBytes[0][3].toNumber(),
        //             version: 'v4'
        //         }    
        //         inactiveFloraFarms.push(farms)
        //         return farms
        //     }
        // })
        var flagPF = 0
        var flagLF = 0
        const allFarms = farmsArray.map((i: any, j: any) => {
            if(i[2] === FarmStrategy.ECF ){
                const endDateValue = decodeValues[j][2].toNumber()
                const  currenctEpoch = Math.floor(new Date().getTime()/1000)
                if(endDateValue > currenctEpoch){
                    const farms: {
                        stakingRewardAddress: string
                        tokens: [Token, Token]
                        baseToken: Token
                        startDate: number
                        endDate: number
                        rewardToken: Token
                        rewardAmount: number
                    } = {
                        stakingRewardAddress: i[0],
                        tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0],
                        baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0][0],
                        startDate: decodeValues[j][1].toString(),
                        endDate: decodeValues[j][2].toString(),
                        rewardToken: allTokens[decodeValues[j][3][0]],
                        rewardAmount: decodeValues[j][4][0].toString(),
                    }
                    ecoSystemFarms.push(farms)
                    return farms
                }
                else{
                    const farms: {
                        stakingRewardAddress: string
                        tokens: [Token, Token]
                        baseToken: Token
                        startDate: number
                        endDate: number
                        rewardToken: Token
                        rewardAmount: number
                    } = {
                        stakingRewardAddress: i[0],
                        tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0],
                        baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0][0],
                        startDate: decodeValues[j][1].toString(),
                        endDate: decodeValues[j][2].toString(),
                        rewardToken: allTokens[decodeValues[j][3][0]],
                        rewardAmount: decodeValues[j][4][0].toString(),
                    }
                    inactiveEcoSystemFarms.push(farms)
                    return farms
                }
            } 
            else if(i[2] === FarmStrategy.DF){
                const endDateValue = decodeValues[j][2].toNumber()
                const  currenctEpoch = Math.floor(new Date().getTime()/1000)
                if(endDateValue > currenctEpoch){
                    const farms: {
                        stakingRewardAddress: string
                        tokens: [Token, Token]
                        baseToken: Token
                        startDate: number
                        endDate: number
                        rewardTokens: [Token, Token]
                        rewardAmount: [number, number]
                    } = {
                        stakingRewardAddress: i[0],
                        tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0],
                        baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0][0],
                        startDate: decodeValues[j][1].toString(),
                        endDate: decodeValues[j][2].toString(),
                        rewardTokens: [allTokens[decodeValues[j][3][0]], allTokens[decodeValues[j][3][1]]],
                        rewardAmount: decodeValues[j][4].map((i: any) => i.toString()),
                    }
                    dualFarms.push(farms)
                    return farms
                }
                else{
                    const farms: {
                        stakingRewardAddress: string
                        tokens: [Token, Token]
                        baseToken: Token
                        startDate: number
                        endDate: number
                        rewardTokens: [Token, Token]
                        rewardAmount: [number, number]
                    } = {
                        stakingRewardAddress: i[0],
                        tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0],
                        baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0][0],
                        startDate: decodeValues[j][1].toString(),
                        endDate: decodeValues[j][2].toString(),
                        rewardTokens: [allTokens[decodeValues[j][3][0]], allTokens[decodeValues[j][3][1]]],
                        rewardAmount: decodeValues[j][4].map((i: any) => i.toString()),
                    }
                    inactiveDualFarms.push(farms)
                    return farms
                }
            }
            else if(i[2] === FarmStrategy.PF){
                const endDateValue = decodeValues[j][2].toNumber()
                const currenctEpoch = Math.floor(new Date().getTime()/1000)
                if(endDateValue > currenctEpoch){
                    const farms: {
                        stakingRewardAddress: string
                        tokens: [Token, Token]
                        baseToken: Token
                        startDate: number
                        endDate: number
                        rewardToken: Token[]
                        rewardAmount: number[]
                        burnRate: number
                        vestingPeriod: number
                        splits: number
                        claim: number
                    } = {
                        stakingRewardAddress: i[0],
                        tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0],
                        baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0][0],
                        startDate: decodeValues[j][1].toString(),
                        endDate: decodeValues[j][2].toString(),
                        rewardToken: decodeValues[j][3].map((i: any) => allTokens[i]),
                        rewardAmount: decodeValues[j][4].map((i: any) => i.toString()),
                        burnRate: decodedPopularFarmsBytes[flagPF][0] ? decodedPopularFarmsBytes[flagPF][0].toNumber() : 0,
                        vestingPeriod: decodedPopularFarmsBytes[flagPF][1].toNumber(),
                        splits: decodedPopularFarmsBytes[flagPF][2].toNumber(),
                        claim: decodedPopularFarmsBytes[flagPF][3].toNumber(),
                    }
                    floraFarms.push(farms)
                    flagPF  = flagPF+1;
                    return farms
                }
                else{
                    const farms: {
                        stakingRewardAddress: string
                        tokens: [Token, Token]
                        baseToken: Token
                        startDate: number
                        endDate: number
                        rewardToken: Token[]
                        rewardAmount: number[]
                        burnRate: number
                        vestingPeriod: number
                        splits: number
                        claim: number
                    } = {
                        stakingRewardAddress: i[0],
                        tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0],
                        baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0][0],
                        startDate: decodeValues[j][1].toString(),
                        endDate: decodeValues[j][2].toString(),
                        rewardToken: decodeValues[j][3].map((i: any) => allTokens[i]),
                        rewardAmount: decodeValues[j][4].map((i: any) => i.toString()),
                        burnRate: decodedPopularFarmsBytes[flagPF][0].toNumber(),
                        vestingPeriod: decodedPopularFarmsBytes[flagPF][1].toNumber(),
                        splits: decodedPopularFarmsBytes[flagPF][2].toNumber(),
                        claim: decodedPopularFarmsBytes[flagPF][3].toNumber(),
                    }
                    inactiveFloraFarms.push(farms)
                    flagPF  = flagPF+1;
                    return farms
                }
            }
            else{
                const endDateValue = decodeValues[j][2].toNumber()
                const currenctEpoch = Math.floor(new Date().getTime()/1000)
                if(endDateValue > currenctEpoch){
                    const farms: {
                        stakingRewardAddress: string
                        tokens: [Token, Token]
                        baseToken: Token
                        startDate: number
                        endDate: number
                        rewardToken: Token[]
                        rewardAmount: number[]
                        vestingPeriod: number
                        splits: number
                        claim: number
                    } = {
                        stakingRewardAddress: i[0],
                        tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0],
                        baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0][0],
                        startDate: decodeValues[j][1].toString(),
                        endDate: decodeValues[j][2].toString(),
                        rewardToken: decodeValues[j][3].map((i: any) => allTokens[i]),
                        rewardAmount: decodeValues[j][4].map((i: any) => i.toString()),
                        vestingPeriod: decodedLaunchFarmsBytes[flagLF][0].toNumber(),
                        splits: decodedLaunchFarmsBytes[flagLF][1].toNumber(),
                        claim: decodedLaunchFarmsBytes[flagLF][2].toNumber(),
                    }
                    launchFarms.push(farms)
                    flagLF=flagLF+1
                    return farms
                }
                else{
                    const farms: {
                        stakingRewardAddress: string
                        tokens: [Token, Token]
                        baseToken: Token
                        startDate: number
                        endDate: number
                        rewardToken: Token[]
                        rewardAmount: number[]
                        vestingPeriod: number
                        splits: number
                        claim: number
                    } = {
                        stakingRewardAddress: i[0],
                        tokens: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0],
                        baseToken: tokenPairsWithLiquidityTokens.filter(i => i.liquidityToken.address === decodeValues[j][0]).map(j => j.tokens)[0][0],
                        startDate: decodeValues[j][1].toString(),
                        endDate: decodeValues[j][2].toString(),
                        rewardToken: decodeValues[j][3].map((i: any) => allTokens[i]),
                        rewardAmount: decodeValues[j][4].map((i: any) => i.toString()),
                        vestingPeriod: decodedLaunchFarmsBytes[flagLF][0].toNumber(),
                        splits: decodedLaunchFarmsBytes[flagLF][1].toNumber(),
                        claim: decodedLaunchFarmsBytes[flagLF][2].toNumber(),
                    }
                    inactiveLaunchFarms.push(farms)
                    flagLF=flagLF+1
                    return farms
                }
            }
        })
        // console.log("All Farms", allFarms);
        // console.log("AllEcoFarms", allEcoFarms);
        // console.log("AllDualFarms", allDualFarms)
        // console.log("AllFloraFarms", allPopularFarms);
        
        // console.log("Dual Farms::", dualFarms)
        // console.log("Ecosystem::", ecoSystemFarms)
        return {
            ecoSystemFarms,
            dualFarms,
            floraFarms,
            launchFarms,
            inactiveDualFarms,
            inactiveEcoSystemFarms,
            inactiveFloraFarms,
            inactiveLaunchFarms,
            allFarms
        }
    }
    return{
        ecoSystemFarms: [],
        dualFarms: [],
        floraFarms: [],
        launchFarms: [],
        inactiveDualFarms: [],
        inactiveEcoSystemFarms: [],
        inactiveFloraFarms: [],
        inactiveLaunchFarms: [],
        allFarms: []
    }
}
