import { Token, TokenAmount } from '@dfyn/sdk'
import { OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { SearchInput } from 'components/SearchModal/styleds'
import { useActiveWeb3React } from 'hooks'
import { useDfynByofContract } from 'hooks/useContract'
import ByofMenu from 'pages/MyFarms'
import React, { useEffect, useMemo, useState } from 'react'
import { useSingleCallResult } from 'state/multicall/hooks'
import styled from 'styled-components'
import useAllByofFarmsPools from './hooks/useAllByofFarmsPools'
import PoolCardAdminFarms from './PoolCardAdminFarms'

const Menu = styled.div`
  margin: auto 0;
  margin-bottom: 20px;
  width: 100%;
  max-width: 720px;
`
const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`


export default function MyFarms() {
  const { allByofFarmsDetails } = useAllByofFarmsPools()

  return (<MyFarmsBody allByofFarmsDetails={allByofFarmsDetails}/>)
}

export function MyFarmsBody({allByofFarmsDetails}:{allByofFarmsDetails: {
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
  rewardsDuration: number}[]}){
  const byofFactoryContract = useDfynByofContract()
  const { account } = useActiveWeb3React()
  const accountArg = useMemo(() => [account ?? undefined], [account])
  const farmsArray = useSingleCallResult(byofFactoryContract, 'getFarmsfromOwner', accountArg)
  const farmsArrayLowerCase = farmsArray?.result?._farms?.map((i: any) => i?.toLowerCase())
  const adminFarmsArray = allByofFarmsDetails?.filter((i: any) =>
    farmsArrayLowerCase?.includes(i?.stakingRewardAddress?.toLowerCase())
  )
  const currenctEpoch = Math.floor(new Date().getTime() / 1000)
  const liveFarmsArray = adminFarmsArray.filter((i: any) => i?.periodFinish > currenctEpoch)
  const [searchItem, setSearchItem] = useState('')
  const whiteListed = useSingleCallResult(byofFactoryContract, 'isWhitelisted', accountArg)

  const [loaderFlag, setLoaderFlag] = useState(true)  
  useEffect(() => {
    if(liveFarmsArray?.length !== 0){
      setLoaderFlag(false)
    } 
  }, [liveFarmsArray])
  return (
    <>
      {whiteListed.result && whiteListed.result[0] &&
        <Menu>
          <ByofMenu />
        </Menu>
      }
      <PageWrapper gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
          <SearchInput
            type="text"
            placeholder="Search by name, symbol, address"
            onChange={(e) => {
              setSearchItem(e.target.value)
            }}
          />
          <PoolSection>
            {liveFarmsArray?.length === 0 && loaderFlag ? (
              <Loader style={{ margin: 'auto' }} />
            ) : liveFarmsArray?.length === 0 ? (
              <OutlineCard>No active pools</OutlineCard>
            ) : (
              liveFarmsArray
                ?.filter((stakingInfos) => {
                  if (searchItem === '') return stakingInfos
                  //for symbol
                  else if (
                    stakingInfos?.tokens[0].symbol?.toLowerCase().includes(searchItem.toLowerCase()) ||
                    stakingInfos?.tokens[1].symbol?.toLowerCase().includes(searchItem.toLowerCase())
                  )
                    return stakingInfos
                  //for name
                  else if (
                    stakingInfos?.tokens[0].name?.toLowerCase().includes(searchItem.toLowerCase()) ||
                    stakingInfos?.tokens[1].name?.toLowerCase().includes(searchItem.toLowerCase())
                  )
                    return stakingInfos
                  //for address
                  else if (
                    stakingInfos?.tokens[0].address?.toLowerCase().includes(searchItem.toLowerCase()) ||
                    stakingInfos?.tokens[1].address?.toLowerCase().includes(searchItem.toLowerCase())
                  )
                    return stakingInfos
                  //Other case
                  else return ''
                })
                ?.map((stakingInfo) => {
                  // need to sort by added liquidity here
                  return <PoolCardAdminFarms farmsDetails={stakingInfo} key={stakingInfo.stakingRewardAddress} />
                })
            )}
          </PoolSection>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}
