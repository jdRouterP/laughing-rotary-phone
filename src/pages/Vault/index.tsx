import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { STAKING_REWARDS_INFO, useStakingInfo } from '../../state/vault/hooks'
import { useMultiStakingInfo } from '../../state/multiTokenVault/hooks'
import { TYPE, ExternalLink } from '../../theme'
import PoolCard from '../../components/vault/PoolCard'
import MultiTokenPoolCard from '../../components/multiTokenVault/PoolCard'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/vault/styled'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from 'components/SearchModal/styleds'


const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
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

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
`};
`

export default function Vault() {
  const { chainId } = useActiveWeb3React()

  // staking info for connected account
  const stakingInfos = useStakingInfo()
  const multiStakingInfos = useMultiStakingInfo()
  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingInfosWithBalance = stakingInfos
  // toggle copy if rewards are inactive
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)
  const [searchItem, setSearchItem] = useState('')

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <DataCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Single Asset Vaults</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  Lock ROUTE/DFYN for a period of time and earn a fixed number of Dfyn tokens.
                </TYPE.white>
              </RowBetween>{' '}
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                href="https://dfyn-network.medium.com/introducing-dfyn-yield-farming-phase-7-4480eebf0fba"
                target="_blank"
              >
                <TYPE.white fontSize={14}>Read more about Dfyn Farms Phase 7</TYPE.white>
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </DataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        {/* <RowBetween>
          <TYPE.white fontSize={24} fontWeight={600}> Vaults are full now, check out our new Farms!</TYPE.white>
        </RowBetween> */}
        <DataRow style={{ alignItems: 'baseline' }}>
          <TYPE.mediumHeader fontSize={16} style={{ marginTop: '0.5rem' }}>Participating vaults</TYPE.mediumHeader>
          {/* <Countdown exactEnd={stakingInfos?.[0]?.periodFinish} /> */}
        </DataRow>
        <SearchInput 
          type="text" 
          placeholder="Search"  
          onChange={(e)=>{
          setSearchItem(e.target.value)
        }}/>

        <PoolSection>
          {stakingRewardsExist && stakingInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingRewardsExist ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : stakingInfos?.length !== 0 && stakingInfosWithBalance.length === 0 ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : (
            stakingInfosWithBalance?.filter(stakingInfos => {
              if(searchItem === '') return stakingInfos
              //for symbol
              else if(stakingInfos?.vaultName?.toLowerCase().includes(searchItem.toLowerCase()) 
              ) return stakingInfos
              //Other case
              else return ""
            })?.map(stakingInfo => {
              // need to sort by added liquidity here
              return <PoolCard key={stakingInfo.vaultAddress} stakingInfo={stakingInfo} />
            })
          )}
        </PoolSection>
        
        <PoolSection>
          {multiStakingInfos?.filter(stakingInfos => {
              if(searchItem === '') return stakingInfos
              //for symbol
              else if(stakingInfos?.vaultName?.toLowerCase().includes(searchItem.toLowerCase()) 
              ) return stakingInfos
              //Other case
              else return ""
            })?.map((multiStakingInfo) => <MultiTokenPoolCard key={multiStakingInfo.vaultAddress} multiStakingInfo={multiStakingInfo} />)}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}