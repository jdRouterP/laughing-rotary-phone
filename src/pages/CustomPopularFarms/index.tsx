import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { useStakingCustomFloraFarmInfo } from '../../state/custom-flora-farm-stake/hooks'
import useCustomFarmInfo from 'state/custom-farm/hook'
import PoolCard from 'components/customFloraFarms/PoolCard'
import { OutlineCard } from 'components/Card'
import Loader from 'components/Loader'
import { SearchInput } from 'components/SearchModal/styleds'
import { TYPE, StyledInternalLink } from '../../theme'
import { CardBGImage, CardNoise, CardSection, DataCard } from 'components/customFloraFarms/styled'
import JSBI from 'jsbi'
import { BIG_INT_ZERO } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { RowBetween } from '../../components/Row'
import { ButtonPink } from 'components/Button'
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

export default function CustomFloraFarms() {
  const { chainId } = useActiveWeb3React()

  const {floraFarms} = useCustomFarmInfo()
  
  // staking info for connected account
  const stakingInfos = useStakingCustomFloraFarmInfo()
  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingInfosWithBalance = stakingInfos?.filter((s) => JSBI.greaterThan(s.stakedAmount.raw, BIG_INT_ZERO))

  const activeFarms = stakingInfos?.filter((s) => s.active);

  const stakingInfosWithRewards = stakingInfos?.filter((s) => JSBI.greaterThan(s.earnedAmount[0].raw, BIG_INT_ZERO))

  const stakingFarms = [...new Set([...stakingInfosWithBalance, ...activeFarms, ...stakingInfosWithRewards])]

  // toggle copy if rewards are inactive
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (floraFarms.length ?? 0) > 0)
  const [searchItem, setSearchItem] = useState('')

  return (
    <>
      <Menu>
        {<CustomFarms farmsName={"Popular Farm"}/>}
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
                    <TYPE.white fontWeight={600}>Popular Farms</TYPE.white>
                  </RowBetween>
                  <StyledInternalLink to={`/custom-popular-farms/archived`} style={{ width: '100%', color: '#ff007a' }}>
                    <ButtonPink padding="8px" borderRadius="8px">
                      Archived Pools
                    </ButtonPink>
                  </StyledInternalLink>
                </TopSectionHeader>
                <RowBetween>
                  <TYPE.white fontSize={14}> Deposit your Liquidity Provider tokens to receive DFYN with insane APR.</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white fontSize={14}>
                    In this farming setup 25% of the DFYN token rewards can be claimed after farming ends. The remaining rewards will be released 25% every 2 months unless the user decides to claim all tokens instantly by agreeing to burn tokens.
                  </TYPE.white>


                </RowBetween>{' '}
                {/* <ExternalLink
                  style={{ color: 'white', textDecoration: 'underline' }}
                  href=""
                  target="_blank"
                >
                  <TYPE.white fontSize={14}>Read more about DFYN</TYPE.white>
                </ExternalLink> */}
              </AutoColumn>
            </CardSection>
            <CardBGImage />
            <CardNoise />
          </DataCard>
        </TopSection>

        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
          <DataRow style={{ alignItems: 'baseline' }}>
            <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Custom Popular Farms</TYPE.mediumHeader>
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