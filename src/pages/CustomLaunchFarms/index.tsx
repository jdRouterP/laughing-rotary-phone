import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { useStakingCustomLaunchFarmInfo } from '../../state/custom-launch-farm-stake/hooks'
// import { TYPE, ExternalLink } from '../../theme'
import { ExternalLink, StyledInternalLink, TYPE } from '../../theme'
import PoolCard from '../../components/customLaunchFarms/PoolCard'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/customLaunchFarms/styled'
// import { Countdown } from './Countdown'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { JSBI } from '@dfyn/sdk'
import { BIG_INT_ZERO } from '../../constants'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from 'components/SearchModal/styleds'
import { ButtonPink } from 'components/Button'
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

export default function LaunchFarms() {
  const { chainId } = useActiveWeb3React()

  const {launchFarms} = useCustomFarmInfo()

  // staking info for connected account
  const stakingInfos = useStakingCustomLaunchFarmInfo()
  

  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingInfosWithBalance = stakingInfos?.filter((s) => JSBI.greaterThan(s.stakedAmount.raw, BIG_INT_ZERO))

  const activeFarms = stakingInfos?.filter((s) => s.active);

  const stakingInfosWithRewards = stakingInfos?.filter((s) => JSBI.greaterThan(s.earnedAmount[0].raw, BIG_INT_ZERO))

  const stakingFarms = [...new Set([...stakingInfosWithBalance, ...activeFarms, ...stakingInfosWithRewards])]

  // toggle copy if rewards are inactive
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (launchFarms?.length ?? 0) > 0)

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
                  <StyledInternalLink to={`/custom-launch-farms/archived`} style={{ width: '100%', color: '#ff007a' }}>
                    <ButtonPink padding="8px" borderRadius="8px">
                      Archived Pools
                    </ButtonPink>
                  </StyledInternalLink>
                </TopSectionHeader>

                {/* <RowBetween>
                  <TYPE.white fontSize={14}> Deposit your Liquidity Provider tokens to receive partner tokens.</TYPE.white>
                </RowBetween> */}
                <RowBetween>
                  <TYPE.white fontSize={14}>
                    Launch Farms allow users to stake liquidity in the farms created by Partner Projects of Dfyn and earn rewards in the Partner tokens.
                    <br />
                    <br />
                    In this farming setup 20% of the rewards can be claimed after farming ends. The remaining rewards will be released 20% every 2 months.
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
              ) : (
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
              )}
            </PoolSection>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}