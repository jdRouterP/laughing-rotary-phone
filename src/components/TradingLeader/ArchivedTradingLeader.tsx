import { ButtonPink } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from 'components/dualFarms/styled'
import Row from 'components/Row'
import React from 'react'
import styled from 'styled-components'
import { ExternalLink, StyledInternalLink, TYPE } from 'theme'
import data from './trading-leaders.json'

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 720px;
    width: 100%;
`

const Header = styled.div`
    display: grid;
    grid-template-columns: 1fr 200px;
    width: 100%;
    font-weight: 600;
`

const LeaderBoard = styled.div`
    width: 100%;
`

const TableStyle = styled.table`
    border: 1px solid ${({ theme }) => theme.bg2};
    width: 100%;
    border-collapse: collapse;
`
const TheadStyle = styled.thead`
`
const TrStyle = styled.tr`
    font-size: 14px;
`
const ThStyle = styled.th`
    border: 1px solid ${({ theme }) => theme.bg2};
    text-align: start;
    padding: 15px;
`
const TbodyStyle = styled.tbody`
    border: 1px solid ${({ theme }) => theme.bg2};
`
const TdStyle = styled.td`
    border: 1px solid ${({ theme }) => theme.bg2};
    padding: 15px;
`
const TableHeader = styled.div`
    padding: 20px;
`

const RowBetween = styled(Row)`
  justify-content: center;
`

const RowBetween1 = styled(Row)`
  justify-content: start;
`

const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
  margin-top: 40px;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const TopSectionHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 0px;
  align-items: center;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 134px;
  `};
`

const TableContentStyle = styled.div`
    margin-top: 20px;
    background: ${({ theme }) => theme.bg1};
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
        0px 24px 32px rgba(0, 0, 0, 0.01);
    border-radius: 10px;
`

export default function ArchivedTradingLeader() {
    // const [tradingData, setTradingData] = useState(data)
    // console.log("tradingData::", );
    
    return (
        <MainContent>
            <Header>
                <RowBetween1>
                    <TYPE.black fontSize={"25px"}>Trading Competition Leaderboard</TYPE.black>
                </RowBetween1>
                <StyledInternalLink to={`/trading-leaderboard`} style={{ width: '100%', color: '#ff007a', margin: 'auto 0'}}>
                  <ButtonPink padding="8px" borderRadius="8px">
                    Active Leaderboard
                  </ButtonPink>
                </StyledInternalLink>
            </Header>
            <LeaderBoard>
                <PageWrapper gap="lg" justify="center">
                    <TopSection gap="md">
                        <DataCard>
                        <CardBGImage />
                        <CardNoise />
                        <CardSection>
                            <AutoColumn gap="md">
                            <TopSectionHeader>
                                <RowBetween>
                                    <TYPE.white fontWeight={600} fontSize={"17px"}>Trading Competition V1</TYPE.white>
                                </RowBetween>
                            </TopSectionHeader>
                            <TYPE.black fontSize={"15px"}>From: Nov 25 2021 at 3:00 PM UTC</TYPE.black>
                            <TYPE.black fontSize={"15px"}>To: Dec 4 2021 at 3:00 PM UTC</TYPE.black>
                            <TYPE.black fontSize={"15px"}>Pairs:  ROUTE/ETH, DFYN/ETH, ROUTE/USDC, DFYN/USDC, ROUTE/USDT, DFYN/USDT</TYPE.black>
                            <TYPE.black fontSize={"15px"}>Prize Pool: 10,000 Dfyn + Fee rebate max 50K USD</TYPE.black>
                            <ExternalLink
                                style={{ color: 'white', textDecoration: 'underline' }}
                                href="https://dfyn-network.medium.com/presenting-first-trading-competition-on-dfyn-exchange-156892af8e2a"
                                target="_blank"
                            >
                                <TYPE.white fontSize={14}>Read more about Trading Competition</TYPE.white>
                            </ExternalLink>
                            </AutoColumn>
                        </CardSection>
                        <CardBGImage />
                        <CardNoise />
                        </DataCard>
                    </TopSection>
                </PageWrapper>
                <TableContentStyle>
                    <TableHeader>
                        <TYPE.black fontSize={"20px"} textAlign={"center"}>Trading Competition V1</TYPE.black>
                    </TableHeader>
                    <TableStyle>
                        <TheadStyle>
                            <TrStyle>
                                <ThStyle>Traders Address</ThStyle>
                                <ThStyle>Traded Amount(in USD)</ThStyle>
                                <ThStyle>Prize Money</ThStyle>
                            </TrStyle>
                        </TheadStyle>
                        <TbodyStyle>
                            {data.map((i: any) => (
                                <TrStyle>
                                    <TdStyle>{i.tradingAddress}</TdStyle>
                                    <TdStyle>{i.tradedAmount}</TdStyle>
                                    <TdStyle>{i.prizeMoney}</TdStyle>
                                </TrStyle>
                            ))}
                        </TbodyStyle>
                    </TableStyle>
                </TableContentStyle>
                    
            </LeaderBoard>
        </MainContent>
    )
}
