import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE, ExternalLink, StyledInternalLink } from '../../theme'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/dualFarms/styled'
import { SearchInput } from 'components/SearchModal/styleds'
import { ButtonPrimary } from 'components/Button'

const TopSectionHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.3fr;
  grid-gap: 0px;
  align-items: center;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 0.3fr;
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

export default function PreStakinfFarmsArchived() {
  const [searchItem, setSearchItem] = useState('')
  console.log("SearchItem:", searchItem);

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
                        <TYPE.white fontWeight={600}>Pre-Staking Farms</TYPE.white>
                    </RowBetween>
                    <StyledInternalLink to={`/dfyn`} style={{ width: '100%'}}>
                        <ButtonPrimary padding="8px" borderRadius="8px">
                            Active Farms
                        </ButtonPrimary>
                    </StyledInternalLink>
                </TopSectionHeader>
              <RowBetween>
                <TYPE.white fontSize={14}>
                    These are the archived Pre-Staking Farms. Details of your Liquidity.
                </TYPE.white>
              </RowBetween>{' '}
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                href="https://dfyn-network.medium.com/introducing-dfyn-yield-farming-phase-2-7686281dd93"
                target="_blank"
              >
                <TYPE.white fontSize={14}>Read more about Dfyn Farms Phase 2</TYPE.white>
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
          onChange={(e)=>{
          setSearchItem(e.target.value)
        }}/>

        <PoolSection>
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}