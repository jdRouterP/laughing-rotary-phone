import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE, ExternalLink, StyledInternalLink } from '../../theme'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/customLaunchFarms/styled'
import { SearchInput } from 'components/SearchModal/styleds'
import PoolCard from 'components/customLaunchFarms/PoolCard'
import Loader from 'components/Loader'
import { OutlineCard } from 'components/Card'
import { useInactiveStakingCustomLaunchFarmInfo } from 'state/custom-launch-farm-stake/hooks'
import { JSBI } from '@dfyn/sdk'
import { BIG_INT_ZERO } from '../../constants'
import { useActiveWeb3React } from 'hooks'
import { ButtonPink } from 'components/Button'
// import { useMultiInactiveStakingInfo } from 'state/custom-launch-farm-stake/hooks'
// import PoolMultiRewardCard from 'components/customLaunchFarms/PoolCard'
import useCustomFarmInfo from 'state/custom-farm/hook'
import CustomFarms from 'pages/CustomFarms'

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
const Menu = styled.div`
  margin: auto 0;
  margin-bottom: 10px;
  width: 100%;
  max-width: 640px;
`

export default function PreStakingFarmsArchived() {
  const { chainId } = useActiveWeb3React()
  const {inactiveLaunchFarms} = useCustomFarmInfo()
  // staking info for connected account
  const stakingInfos = useInactiveStakingCustomLaunchFarmInfo();

  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingInfosWithBalance = stakingInfos?.filter((s) => JSBI.greaterThan(s.stakedAmount.raw, BIG_INT_ZERO))

  const activeFarms = stakingInfos?.filter((s) => s.active);

  const stakingInfosWithRewards = stakingInfos?.filter((s) => JSBI.greaterThan(s.earnedAmount[0].raw, BIG_INT_ZERO))

  const stakingFarms = [...new Set([...stakingInfosWithBalance, ...activeFarms, ...stakingInfosWithRewards])]

  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (inactiveLaunchFarms.length ?? 0) > 0)

  
  const [searchItem, setSearchItem] = useState('')


  return (
    <>
      <Menu>
        <CustomFarms farmsName={"Launch Farm"}/>
      </Menu>
      <PageWrapper gap="lg" justify="center">
        <TopSection gap="md">
          <DataCard>
            <CardBGImage />
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <TopSectionHeader>
                  <RowBetween>
                    <TYPE.white fontWeight={600}>Launch pools</TYPE.white>
                  </RowBetween>
                  <StyledInternalLink to={`/custom-launch-farms`} style={{ width: '100%', color: '#ff007a' }}>
                    <ButtonPink padding="8px" borderRadius="8px">
                      Active Pools
                    </ButtonPink>
                  </StyledInternalLink>
                </TopSectionHeader>

                <RowBetween>
                  <TYPE.white fontSize={14}> Deposit your Liquidity Provider tokens to receive DFYN with insane APR.</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white fontSize={14}>
                    A total of 5.6M DFYN tokens will be distributed as rewards for this program. 20% of the DFYN token rewards can be claimed after two weeks from the starting date of the program. Remaining rewards will be released 20% every other month.
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
            <TYPE.mediumHeader fontSize={16} style={{ marginTop: '0.5rem' }}>Launch pools</TYPE.mediumHeader>
          </DataRow>

          <SearchInput
            type="text"
            placeholder="Search by name, symbol, address"
            onChange={(e) => {
              setSearchItem(e.target.value)
            }} />

          <PoolSection>
            {stakingRewardsExist && stakingInfos?.length === 0 ? (
              <Loader style={{ margin: 'auto' }} />
            ) : !stakingRewardsExist ? (
              <OutlineCard>No active pools</OutlineCard>
            ) : stakingFarms?.length === 0 ? (
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
              </>
            }
          </PoolSection>
        </AutoColumn>
      </PageWrapper>
    </>
    
  )
}