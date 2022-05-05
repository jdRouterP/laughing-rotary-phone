//@ts-nocheck
import React, { useState } from 'react'
import { TokenAmount } from '@dfyn/sdk'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE, ExternalLink } from '../../theme'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/vault/styled'
import CurrencyLogo from 'components/CurrencyLogo'
import { DFYN, UNI, USDC, vDFYN, VDFYN_MEDIUM_LINK } from 'constants/index'
import { Tab, TabPanel, Tabs } from './tabs/Tabs'
import { useTokenBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks'
import { useDfynChestInfo } from 'state/vDfyn/hooks'
import { usePair } from 'data/Reserves'
import { getVDFYNVolumeUSD } from 'state/prediction/hooks'
import isNumeric from 'utils/isNumeric'
import { MouseoverTooltip } from 'components/Tooltip'
import VDfynBoosterBG from '../../assets/svg/vdfyn-boosted.svg'

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
  padding: 0.5rem 0.7rem 1.2rem 0.7rem;
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

const MouseTooltip = styled.span`
    margin-left: 8px;
    margin-top: 4px;
    padding-bottom: 0px;
    padding-top: 1.5px;
    cursor: pointer;
    color: #27ae60;
    font-weight: 600;
    font-size: 12px;
`
const GreyText = styled.div`
    display: block;
    color: ${({ theme }) => theme.text1};
    font-size: 0.7rem;
    position: absolute;
    bottom: 0;
    text-align: center;
    left: 0;
    width: 92%;
    margin: 0;
    padding: 0;
`

let DFYN_TO_USDT_PRICE = 0;
const _getDFYNToUSDTPrice = async()=>{
    const [, dfynUsdcPair] = usePair(USDC, DFYN);
    if(DFYN_TO_USDT_PRICE > 0) return DFYN_TO_USDT_PRICE;
    const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6)) || 0;
    DFYN_TO_USDT_PRICE = dfynPrice;
    return dfynPrice;
}

const _calculateAPR = async (totalSupply: any, dfynBalance: any, cb: Function) => {
    if (dfynBalance === 0) dfynBalance = 1;
    if (!totalSupply || totalSupply === 0) totalSupply = 1;
    else totalSupply = totalSupply.toSignificant(4);
    try {
        const dfynPrice = await _getDFYNToUSDTPrice();
        const volumeUSD = await getVDFYNVolumeUSD() || 0;
        let apr = ((((volumeUSD * 0.05)) * 365) / (dfynBalance.toFixed(6) * dfynPrice)) || 0
        const bonus = 4444 * dfynPrice
        const boostedAPR = ((((bonus * 100)) * 365) / (dfynBalance.toFixed(6) * dfynPrice)) || 0
        const calculatedAPR = (parseFloat(apr.toFixed(2)) + parseFloat(boostedAPR.toFixed(2))).toFixed(2)
        apr = isNumeric(calculatedAPR) ? calculatedAPR : 0;
        cb(apr);
    } catch (err) {
        console.error(`Error staking APR calculation: ${err}`)
        cb(0)
    }
}


export default function VDFYN() {
    const { account, chainId } = useActiveWeb3React()

    const uni = chainId ? UNI[chainId] : undefined
    const aggregateBalanceDfyn: TokenAmount | undefined = useTokenBalance(account ?? undefined, uni)
    const countUpValueDfyn = aggregateBalanceDfyn?.toFixed(4) ?? '0'

    const aggregateBalancevDfyn: TokenAmount | undefined = useTokenBalance(account ?? undefined, vDFYN)
    const countUpValuevDfyn = aggregateBalancevDfyn?.toFixed(4) ?? '0'
    const { totalSupply, dfynBalance, ratioDfyn, ratioVDfyn } = useDfynChestInfo();
    const vdfynToDfynValue: Number = Number(ratioDfyn) * Number(aggregateBalancevDfyn?.toExact())
    const dfynToVDfynValue: Number = Number(ratioVDfyn) * Number(countUpValueDfyn)

    const [calculatedAPR, _setCalculatedAPR] = useState(0);
    const customSetCalculateAPR = (newAPR: number) => {
        if (!isNumeric(newAPR) || newAPR < 1) return;
        _setCalculatedAPR(newAPR);
    }
    _calculateAPR(totalSupply, dfynBalance ?? 0, customSetCalculateAPR)
    const [activeTab, setActiveTab] = useState(0);

    const handleChange = (e: any, value: any) => {
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
                                        Stake your DFYN and get vDFYN tokens. Every swap on Dfyn contributes 0.05% of the swap value to the vDFYN pool. This means that by staking DFYN in this pool you get vDFYN tokens, which are continuously accruing with the fees earned by Dfyn Exchange. vDFYN holders will also enjoy superior voting privileges in governance.
                                        Read more about vDFYN vault <ExternalLink style={{ color: 'white', textDecoration: 'underline', display: 'inline' }} href={VDFYN_MEDIUM_LINK} target="_blank"><TYPE.white style={{ display: 'inline'}} fontSize={14}>here</TYPE.white></ExternalLink>
                                    </TYPE.white>
                                </RowBetween>{' '}
                                {/* <ExternalLink
                        style={{ color: 'white', textDecoration: 'underline' }}
                        href="https://dfyn-network.medium.com/introducing-dfyn-yield-farming-phase-7-4480eebf0fba"
                        target="_blank"
                    >
                        <TYPE.white fontSize={14}>Read more about Dfyn Farms Phase 7</TYPE.white>
                    </ExternalLink> */}
                            </AutoColumn>
                        </CardSection>
                        <CardBGImage />
                        <CardNoise />
                    </DataCard>
                </TopSection>
            </PageWrapper>
            <StyleStake>
                <DataRow style={{ gap: '10px' }}>
                    <PoolData style={{background: `url(${VDfynBoosterBG})`, backgroundSize: 'cover', border: 'none', backgroundPosition: 'right' }}>
                        <AutoColumn gap="sm">
                            <TYPE.body style={{ marginLeft: '5px', textAlign: 'left' }}>
                                APR 
                            <MouseTooltip>
                                <MouseoverTooltip text="The booster APR is the extra APR you earn along with staking APR. Booster Rewards will be valid till 20 March 2022." placement="top">
                                    Boosted
                                </MouseoverTooltip>
                            </MouseTooltip>
                            </TYPE.body>
                            <TYPE.body fontSize={20} fontWeight={500} marginLeft={'5px'} textAlign={'left'}>
                                {calculatedAPR} %
                            </TYPE.body>
                        </AutoColumn>
                    </PoolData>
                    <PoolData style={{ backgroundSize: 'cover', border: 'none', backgroundPosition: 'right' }}>
                        <AutoColumn gap="sm">
                            <TYPE.body style={{ marginLeft: '5px', textAlign: 'left' }}>Balance vDFYN</TYPE.body>
                            <TYPE.body fontSize={24} fontWeight={500} style={{ display: 'flex', justifyContent: 'initial', marginLeft: '5px' }}>
                                <CurrencyLogo currency={vDFYN} style={{ margin: 'auto 0' }} />
                                <span style={{ marginLeft: '15px', fontSize: '20px' }}>{countUpValuevDfyn}</span>
                                {vdfynToDfynValue?<GreyText>≈{vdfynToDfynValue.toFixed(2)} DFYN</GreyText>:null}
                            
                            </TYPE.body>
                        </AutoColumn>
                    </PoolData>
                    <PoolData style={{ backgroundSize: 'cover', border: 'none', backgroundPosition: 'right' }}>
                        <AutoColumn gap="sm">
                            <TYPE.body style={{ marginLeft: '5px', textAlign: 'left' }}>Unstaked DFYN</TYPE.body>
                            <TYPE.body fontSize={24} fontWeight={500} style={{ display: 'flex', justifyContent: 'initial', marginLeft: '5px' }}>
                                <CurrencyLogo currency={DFYN} style={{ margin: 'auto 0' }} />
                                <span style={{ marginLeft: '15px', fontSize: '20px' }}>{countUpValueDfyn}</span>
                                {dfynToVDfynValue?<GreyText>≈{dfynToVDfynValue.toFixed(2)} vDFYN</GreyText>:null}
                            
                            </TYPE.body>
                        </AutoColumn>
                    </PoolData>
                </DataRow>
            </StyleStake>
            <ContentBody>
                <TabsContainer>
                    <Tabs selectedTab={activeTab} onChange={handleChange}>
                        <Tab label="Stake DFYN" value={0}></Tab>
                        <Tab label="Unstake DFYN" value={1}></Tab>
                    </Tabs>
                </TabsContainer>
                <TabPanelContainer>
                    <TabPanel value={activeTab} selectedIndex={0} label="Stake DFYN" token={DFYN}></TabPanel>
                    <TabPanel value={activeTab} selectedIndex={1} label="Enter vDFYN" token={vDFYN}></TabPanel>
                </TabPanelContainer>
            </ContentBody>
        </>
    )
}