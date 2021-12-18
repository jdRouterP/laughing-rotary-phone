import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { STAKING_REWARDS_INFO, useStakingInfo } from '../../state/launchFarms/hooks'
// import { TYPE, ExternalLink } from '../../theme'
import { ExternalLink, StyledInternalLink, TYPE } from '../../theme'
import PoolCard from '../../components/launchFarms/PoolCard'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/launchFarms/styled'
// import { Countdown } from './Countdown'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { JSBI } from '@dfyn/sdk'
import { BIG_INT_ZERO } from '../../constants'
import { OutlineCard } from '../../components/Card'
import { SearchInput } from 'components/SearchModal/styleds'
import { ButtonPink } from 'components/Button'
import { useMultiStakingInfo, STAKING_MULTI_REWARDS_INFO } from 'state/multiRewardLaunchFarm/hooks'
import PoolMultiRewardCard from 'components/multiRewardLaunchFarms/PoolCard'


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

export default function LaunchFarms() {
  const { chainId } = useActiveWeb3React()

  // staking info for connected account
  const stakingInfos = useStakingInfo()
  const stakingInfosMultiReward = useMultiStakingInfo()
  

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


  //staking cards with balance for multiReward Tokens Launch Farms

  const stakingInfosMultiRewardWithBalance = stakingInfosMultiReward?.filter((s) => JSBI.greaterThan(s.stakedAmount.raw, BIG_INT_ZERO))

  const stakingInfosMultiRewardActiveFarms = stakingInfosMultiReward?.filter((s) => s.active)

  const stakingInfosMultiRewardRewards = stakingInfosMultiReward?.filter((s) => JSBI.greaterThan(s.earnedAmount.raw, BIG_INT_ZERO))

  const stakingInfosMultiRewardFarms = [...new Set([...stakingInfosMultiRewardWithBalance, ...stakingInfosMultiRewardActiveFarms, ...stakingInfosMultiRewardRewards])]

  //toggle copy if multi rewards are inactive
  const stakingInfosMultiRewardRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_MULTI_REWARDS_INFO[chainId]?.length ?? 0) > 0)

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
                  <TYPE.white fontWeight={600}>Launch pools</TYPE.white>
                </RowBetween>
                <StyledInternalLink to={`/launch-farms/archived`} style={{ width: '100%', color: '#ff007a' }}>
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
          {stakingRewardsExist && stakingInfosMultiRewardRewardsExist && stakingInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingRewardsExist && !stakingInfosMultiRewardRewardsExist? (
            <OutlineCard>No active pools</OutlineCard>
          ) : stakingFarms?.length === 0 && stakingInfosMultiRewardFarms?.length === 0 ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : <>
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
                  stakingInfosMultiRewardFarms?.filter(stakingInfosMultiReward => {
                    if (searchItem === '') return stakingInfosMultiReward
                    //for symbol
                    else if (stakingInfosMultiReward?.tokens[0].symbol?.toLowerCase().includes(searchItem.toLowerCase())
                      || stakingInfosMultiReward?.tokens[1].symbol?.toLowerCase().includes(searchItem.toLowerCase())
                    ) return stakingInfosMultiReward

                    //for name
                    else if (stakingInfosMultiReward?.tokens[0].name?.toLowerCase().includes(searchItem.toLowerCase())
                      || stakingInfosMultiReward?.tokens[1].name?.toLowerCase().includes(searchItem.toLowerCase())
                    ) return stakingInfosMultiReward

                    //for address
                    else if (stakingInfosMultiReward?.tokens[0].address?.toLowerCase().includes(searchItem.toLowerCase())
                      || stakingInfosMultiReward?.tokens[1].address?.toLowerCase().includes(searchItem.toLowerCase())
                    ) return stakingInfosMultiReward

                    //Other case
                    else return ""
                    })?.map(stakingInfo => {
                    // need to sort by added liquidity here
                     return <PoolMultiRewardCard key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} isInactive={false} />
                    })
                  }
              </>
        }
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}