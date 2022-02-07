import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { STAKING_REWARDS_INFO, useStakingInfo } from '../../state/dual-stake/hooks'
import { TYPE, ExternalLink, StyledInternalLink } from '../../theme'
import PoolCard from '../../components/dualFarms/PoolCard'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/dualFarms/styled'
// import { Countdown } from './Countdown'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { JSBI } from '@dfyn/sdk'
import { BIG_INT_ZERO } from '../../constants'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from 'components/SearchModal/styleds'
import { ButtonPink } from 'components/Button'
import { useStakingDualFarmInfo } from 'state/custom-dual-farm-stake/hooks'
import useCustomFarmInfo from 'state/custom-farm/hook'
import PoolCardDualFarm from 'components/customdualfarms/PoolCard'


const TopSectionHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px;
  grid-gap: 0px;
  align-items: center;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 134px;
  `};
`

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

export default function DualFarms() {
  const { chainId } = useActiveWeb3React()

  const {dualFarms} = useCustomFarmInfo()
  // staking info for connected account
  const stakingInfos = useStakingInfo();
  const stakingDualFarmInfos = useStakingDualFarmInfo();

  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingInfosWithBalance = stakingInfos?.filter((s) => JSBI.greaterThan(s.stakedAmount.raw, BIG_INT_ZERO))

  const activeFarms = stakingInfos?.filter((s) => s.active);

  const stakingInfosWithRewards = stakingInfos?.filter((s) => JSBI.greaterThan(s.earnedAmount.raw, BIG_INT_ZERO))

  const stakingFarms = [...new Set([...stakingInfosWithBalance, ...activeFarms, ...stakingInfosWithRewards])]


  // toggle copy if rewards are inactive
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)

  // for custom Dual farms
  const stakingDualFarmInfosWithBalance = stakingDualFarmInfos?.filter((s) => JSBI.greaterThan(s.stakedAmount.raw, BIG_INT_ZERO))

  const activeDualFarmFarms = stakingDualFarmInfos?.filter((s) => s.active);

  const stakingDualFarmInfosWithRewards = stakingDualFarmInfos?.filter((s) => JSBI.greaterThan(s.earnedAmount.raw, BIG_INT_ZERO))

  const stakingDualFarmFarms = [...new Set([...stakingDualFarmInfosWithBalance, ...activeDualFarmFarms, ...stakingDualFarmInfosWithRewards])]


  // toggle copy if rewards are inactive
  const stakingDualFarmRewardsExist = Boolean(typeof chainId === 'number' && (dualFarms?.length ?? 0) > 0)
  const [searchItem, setSearchItem] = useState('')

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <DataCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <TopSectionHeader>
                <RowBetween>
                  <TYPE.white fontWeight={600}>Dual Farms</TYPE.white>
                </RowBetween>
                <StyledInternalLink to={`/dual-farms/archived`} style={{ width: '100%', color: '#ff007a' }}>
                  <ButtonPink padding="8px" borderRadius="8px">
                    Archived Pools
                  </ButtonPink>
                </StyledInternalLink>
              </TopSectionHeader>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  Dual Farming pools allow users to stake LP tokens and earn rewards in 2 different tokens.
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
        <DataRow style={{ alignItems: 'baseline' }}>
          <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Participating pools</TYPE.mediumHeader>
        </DataRow>

        <SearchInput
          type="text"
          placeholder="Search by name, symbol, address"
          onChange={(e) => {
            setSearchItem(e.target.value)
          }} />

        <PoolSection>
          {stakingRewardsExist && stakingDualFarmRewardsExist && stakingInfos?.length === 0 && stakingDualFarmInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingRewardsExist && !stakingDualFarmRewardsExist ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : stakingFarms?.length === 0 && stakingDualFarmFarms?.length === 0 ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : 
            <>
              {
                stakingFarms?.filter(stakingInfos => {
                if (searchItem === '') return stakingInfos
                //for symbol
                else if (stakingInfos?.tokens[0].symbol?.toLowerCase().includes(searchItem.toLowerCase())
                  || stakingInfos?.tokens[1].symbol?.toLowerCase().includes(searchItem.toLowerCase())
                ) return stakingInfos

                //for name
                else if (stakingInfos?.tokens[0].name?.toLowerCase().includes(searchItem.toLowerCase())
                  || stakingInfos?.tokens[1].name?.toLowerCase().includes(searchItem.toLowerCase())
                ) return stakingInfos

                //for address
                else if (stakingInfos?.tokens[0].address?.toLowerCase().includes(searchItem.toLowerCase())
                  || stakingInfos?.tokens[1].address?.toLowerCase().includes(searchItem.toLowerCase())
                ) return stakingInfos

                //Other case
                else return ""
                })?.map(stakingInfo => {
                  // need to sort by added liquidity here
                  return <PoolCard key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} isInactive={false} />
                })
              }
              {
                stakingDualFarmFarms?.filter(stakingInfos => {
                  if (searchItem === '') return stakingInfos
                  //for symbol
                  else if (stakingInfos?.tokens[0].symbol?.toLowerCase().includes(searchItem.toLowerCase())
                    || stakingInfos?.tokens[1].symbol?.toLowerCase().includes(searchItem.toLowerCase())
                  ) return stakingInfos
  
                  //for name
                  else if (stakingInfos?.tokens[0].name?.toLowerCase().includes(searchItem.toLowerCase())
                    || stakingInfos?.tokens[1].name?.toLowerCase().includes(searchItem.toLowerCase())
                  ) return stakingInfos
  
                  //for address
                  else if (stakingInfos?.tokens[0].address?.toLowerCase().includes(searchItem.toLowerCase())
                    || stakingInfos?.tokens[1].address?.toLowerCase().includes(searchItem.toLowerCase())
                  ) return stakingInfos
  
                  //Other case
                  else return ""
                  })?.map(stakingInfo => {
                    // need to sort by added liquidity here
                    return <PoolCardDualFarm key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} isInactive={false} />
                  })
              }
            </>
          }
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}