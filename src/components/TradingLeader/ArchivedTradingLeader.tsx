import { ButtonPink } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from 'components/dualFarms/styled'
import Loader from 'components/Loader'
import Row from 'components/Row'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { StyledInternalLink, TYPE } from 'theme'
// import data from './trading-leaders.json'

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
    ${({theme}) => theme.mediaWidth.upToExtraSmall`
        grid-template-columns: 1fr 170px;
    `}
`

const LeaderBoard = styled.div`
    width: 100%;
`

const TableStyle = styled.table`
    border: 1px solid ${({ theme }) => theme.bg2};
    width: 100%;
    position: relative;
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
    overflow-x: auto;
`

const LoaderStyle = styled.div`
    width: 100%;
    position: absolute;
    text-align: center;
    margin-top: 30px;
`

const InternalContent = styled.div`
    background: ${({ theme }) => theme.bg1};
    padding: 20px;
    border-radius: 10px;
`
const TextHeader = styled.span`
    text-align: center;
    font-size: 25px;
    font-weight: 500;
    ${({theme}) => theme.mediaWidth.upToExtraSmall`
        font-size: 20px;
    `}
`

export default function ArchivedTradingLeader() {
    // const [tradingData, setTradingData] = useState(data)
    // console.log("tradingData::", );
    const [tradingInfo, setTradingInfo] = useState<any>({})
    const [tradingData, setTradingData] = useState([])
    const [loader, setLoader] = useState(true)
    const [errorHandle, setErrorHandle] = useState(undefined)
    const url = 'https://api.trading-competition.dfyn.network'

    useEffect(() => {
        fetch(`${url}/history`)
        .then(response => {
            if(response.ok){
                return response.json()
            }
            throw response
        })
        .then(data => {
            setTradingInfo(data)
        })
        .catch(error => {
            console.log("Error in fetching data", error);
        })
    }, [])

    useEffect(() => {
        fetch(`${url}/history/winners`)
        .then(response => {
            if(response.ok){
                return response.json()
            }
            throw response
        })
        .then(data => {
            setTradingData(data)
            setLoader(false)
        })
        .catch(error => {
            console.log("Error in fetching data", error);
            setErrorHandle(error)
        })
    }, [])
    
    return (
        <MainContent>
            <InternalContent>
                <Header>
                    <RowBetween1>
                        <TextHeader>Leaderboard</TextHeader>
                    </RowBetween1>
                    <StyledInternalLink to={`/trading-leaderboard`} style={{ width: '100%', color: '#ff007a', margin: 'auto 0'}}>
                        <ButtonPink padding="8px" borderRadius="8px">
                            Active Leaderboard
                        </ButtonPink>
                    </StyledInternalLink>
                </Header>
            </InternalContent>
            
            {Object.values(tradingData).map((i: any, j: any) => {
                return(
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
                                                <TYPE.white fontWeight={600} fontSize={"17px"}>Trading Competition {tradingInfo[j]?.version}</TYPE.white>
                                            </RowBetween>
                                        </TopSectionHeader>
                                        <TYPE.black fontSize={"15px"}>From: {tradingInfo[j]?.start_date ?? ''}</TYPE.black>
                                        <TYPE.black fontSize={"15px"}>To: {tradingInfo[j]?.end_date ?? ''}</TYPE.black>
                                        <TYPE.black fontSize={"15px"}>Pairs: {tradingInfo[j]?.pairs ?? ''}</TYPE.black>
                                        <TYPE.black fontSize={"15px"}>Prize Pool: {tradingInfo[j]?.prize_pool ?? ''}</TYPE.black>
                                        <TYPE.black fontSize={"15px"}>Trading Volume: {tradingInfo[j]?.trading_volume ?? ''}</TYPE.black>
                                    </AutoColumn>
                                </CardSection>
                                <CardBGImage />
                                <CardNoise />
                                </DataCard>
                            </TopSection>
                        </PageWrapper>
                        <TableContentStyle>
                            <TableHeader>
                                <TYPE.black fontSize={"20px"} textAlign={"center"}>LeaderBoard</TYPE.black>
                            </TableHeader>
                            <TableStyle>
                                <TheadStyle>
                                    <TrStyle>
                                        <ThStyle>Ranking</ThStyle>
                                        <ThStyle>Traders Address</ThStyle>
                                        {/* <ThStyle>Traded Amount(in USD)</ThStyle> */}
                                        <ThStyle>Prize Money</ThStyle>
                                    </TrStyle>
                                </TheadStyle>
                                {
                                    loader ?
                                        <LoaderStyle>
                                            <Loader size="50px" /> 
                                        </LoaderStyle>
                                    : !loader && i.size === 0 && !!errorHandle ? 
                                        <LoaderStyle>
                                            <span style={{fontSize: "20px"}}>No data found.</span> 
                                        </LoaderStyle>
                                    :
                                    <TbodyStyle>
                                        {
                                            i.map((k: any, m: any) => (
                                                <TrStyle key={i.from}>
                                                    <TdStyle>{m+1}{"."}</TdStyle>
                                                    <TdStyle>{k.from}</TdStyle>
                                                    <TdStyle>{'$'}{k.amountUSD.toFixed(6)}</TdStyle>
                                                </TrStyle>
                                        ))}
                                    </TbodyStyle>
                                }
                            </TableStyle>
                        </TableContentStyle>
                            
                    </LeaderBoard>
                )
            })}
            
        </MainContent>
    )
}
