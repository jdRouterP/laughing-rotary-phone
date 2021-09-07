//@ts-nocheck
import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/vault/styled'
import CurrencyLogo from 'components/CurrencyLogo'
import { DFYN, UNI, USDC, vDFYN } from 'constants/index'
import { Tab, TabPanel, Tabs } from './tabs/Tabs'
import { useTokenBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks'
import { useDfynChestInfo } from 'state/vDfyn/hooks'
import { usePair } from 'data/Reserves'
import { getVDFYNVolumeUSD } from 'state/prediction/hooks'
import isNumeric from 'utils/isNumeric'

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`
const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const TabsContainer = styled.div`
  display: flex;
  padding: 2px;
`;

const TabPanelContainer = styled.div`
  width: 100%;
`;

const ContentBody = styled.div`
    margin-top: 20px;
    max-width: 640px;
    width: 100%;
    background: ${({ theme }) => theme.bg1};
    border-radius: 10px;
`

const StyleStake = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    max-width: 640px;
    width: 100%;
`

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const _calculateAPR = async (totalSupply, ratio, cb) => {
    if (ratio === 0) ratio = 1;
    if (!totalSupply || totalSupply === 0) totalSupply = 1;
    else totalSupply = totalSupply.toSignificant(4);
    const [, dfynUsdcPair] = usePair(USDC, DFYN);
    const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6)) || 0
    const volumeUSD = await getVDFYNVolumeUSD() || 0;
    let apr = ((((volumeUSD * 0.05) / totalSupply) * 365) / (ratio * dfynPrice)) || 0
    apr = isNumeric(apr) ? apr : 0;
    cb(apr);
}

/*
    //debug
    console.log(`volumeUSD: ${JSON.stringify(volumeUSD)}`)
    console.log(`totalSupply: ${totalSupply}`)
    console.log(`ratio: ${ratio}`)
    console.log(`dfynPrice: ${dfynPrice}`)
    console.log(`eq1: ${(((volumeUSD * 0.05)/totalSupply) * 365)}`)
*/

export default function VDFYN() {

    const { account, chainId } = useActiveWeb3React()

    const uni = chainId ? UNI[chainId] : undefined
    const aggregateBalanceDfyn: TokenAmount | undefined = useTokenBalance(account ?? undefined, uni)
    const countUpValueDfyn = aggregateBalanceDfyn?.toFixed(4) ?? '0'

    const aggregateBalancevDfyn: TokenAmount | undefined = useTokenBalance(account ?? undefined, vDFYN)
    const countUpValuevDfyn = aggregateBalancevDfyn?.toFixed(4) ?? '0'
    const { totalSupply, ratio } = useDfynChestInfo();

    const [calculatedAPR, setCalculatedAPR] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    _calculateAPR(totalSupply, ratio, setCalculatedAPR)

    //@ts-nocheck
    const handleChange = (e, value) => {
        setActiveTab(value);
    };


    return (
        <>
            <PageWrapper gap="lg" justify="center">
                <TopSection gap="md">
                    <DataCard>
                        <CardBGImage />
                        <CardNoise />
                        <CardSection>
                            <AutoColumn gap="md">
                                <RowBetween>
                                    <TYPE.white fontWeight={600}>Maxmize yield by staking DFYN for vDFYN</TYPE.white>
                                </RowBetween>
                                <RowBetween>
                                    <TYPE.white fontSize={14}>
                                        For every swap on the exchange on every chain, 0.05% of the swap fees are distributed as DFYN proportional to your share of the DFYNBar. When your DFYN is staked into the DFYNBar, you receive vDFYN in return for voting rights and a fully composable token that can interact with other protocols. Your vDFYN is continuously compounding, when you unstake you will receive all the originally deposited DFYN and any additional from fees.
                                    </TYPE.white>
                                </RowBetween>{' '}
                                {/* <ExternalLink
                        style={{ color: 'white', textDecoration: 'underline' }}
                        href="https://dfyn-network.medium.com/introducing-dfyn-yield-farming-phase-2-7686281dd93"
                        target="_blank"
                    >
                        <TYPE.white fontSize={14}>Read more about Dfyn Farms Phase 2</TYPE.white>
                    </ExternalLink> */}
                            </AutoColumn>
                        </CardSection>
                        <CardBGImage />
                        <CardNoise />
                    </DataCard>
                </TopSection>
            </PageWrapper>
            <StyleStake>
                <DataRow style={{ gap: '24px' }}>
                    <PoolData>
                        <AutoColumn gap="sm">
                            <TYPE.body style={{ margin: 0 }}>Staking APR</TYPE.body>
                            <TYPE.body fontSize={24} fontWeight={500}>
                                {calculatedAPR.toFixed(2) || '-'} %
                            </TYPE.body>
                        </AutoColumn>
                    </PoolData>
                    <PoolData>
                        <AutoColumn gap="sm">
                            <TYPE.body style={{ margin: 0 }}>Balance vDFYN</TYPE.body>
                            <TYPE.body fontSize={24} fontWeight={500} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <CurrencyLogo currency={vDFYN} style={{ margin: 'auto 0' }} />
                                <span style={{ marginLeft: '5px' }}>{countUpValuevDfyn}</span>
                            </TYPE.body>
                        </AutoColumn>
                    </PoolData>
                    <PoolData>
                        <AutoColumn gap="sm">
                            <TYPE.body style={{ margin: 0 }}>Unstaked DFYN</TYPE.body>
                            <TYPE.body fontSize={24} fontWeight={500} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <CurrencyLogo currency={DFYN} style={{ margin: 'auto 0' }} />
                                <span style={{ marginLeft: '5px' }}>{countUpValueDfyn}</span>
                            </TYPE.body>
                        </AutoColumn>
                    </PoolData>
                </DataRow>
            </StyleStake>
            <ContentBody>
                <TabsContainer>
                    <Tabs selectedTab={activeTab} onChange={handleChange}>
                        <Tab label="Stake DFYN" value={0}></Tab>
                        <Tab label="Unstake vDFYN" value={1}></Tab>
                    </Tabs>
                </TabsContainer>
                <TabPanelContainer>
                    <TabPanel value={activeTab} selectedIndex={0} label="Stake DFYN" token={DFYN}></TabPanel>
                    <TabPanel value={activeTab} selectedIndex={1} label="Unstake vDFYN" token={vDFYN}></TabPanel>
                </TabPanelContainer>
            </ContentBody>
        </>
    )
}