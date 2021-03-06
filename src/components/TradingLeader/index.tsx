import { Base } from 'components/Button'
// import { ButtonTab, ButtonTabItem } from 'components/ButtonTab'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from 'components/dualFarms/styled'
import Loader from 'components/Loader'
import Row from 'components/Row'
import { darken } from 'polished'
import React, {useState, useEffect} from 'react'
// import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ExternalLink, StyledInternalLink, TYPE } from 'theme'
import InternalExternalCohort from './InternalExternalCohort'

// const TRADING_LEADERBOARD_API = process.env.REACT_TRADING_LEADERBOARD_API;
// const TRADING_LEADERBOARD_INFO_API = process.env.REACT_TRADING_LEADERBOARD_INFO_API;

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
    margin-top: 20px;
    background: ${({ theme }) => theme.bg1};
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
        0px 24px 32px rgba(0, 0, 0, 0.01);
    border-radius: 10px;
    overflow-x: auto;
    min-height: 170px;
`

const TableStyle = styled.table`
    border: 1px solid ${({ theme }) => theme.bg2};
    width: 100%;
    border-collapse: collapse;
    position: relative;
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
    grid-template-columns: 1fr;
  `};
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
    ${({theme}) => theme.mediaWidth.upToExtraSmall`
        font-size: 20px;
    `}
`

const ButtonPink = styled(Base)`
  background-color: ${({ theme }) => theme.pink1};
  color: white;
  ${({theme}) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.pink1)};
    background-color: ${({ theme }) => darken(0.05, theme.pink1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.pink1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.pink1)};
    background-color: ${({ theme }) => darken(0.1, theme.pink1)};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.pink1};
    opacity: 50%;
    cursor: auto;
  }
`
export default function TradingLeader() {
    const [data1, setData1] = useState([])
    const [info, setInfo] = useState<any>({})
    const [loader, setLoader] = useState(true)
    const [errorHandle, setErrorHandle] = useState(undefined)
    const url = 'https://api.trading-competition.dfyn.network'
    useEffect(() => {
        fetch(`${url}/data/internal_cohort`)
        .then(response => {
            if(response.ok){
                return response.json()
            }
            throw response
        })
        .then(data => {
            setData1(data)
            setLoader(false)
        })
        .catch(error => {
            console.log("Error in fetching data", error);
            setErrorHandle(error)
        })
    }, [])
    useEffect(() => {
        fetch(`${url}/info/internal_cohort`)
        .then(response => {
            if(response.ok){
                return response.json()
            }
            throw response
        })
        .then(data => {
            setInfo(data)
        })
        .catch(error => {
            console.log("Error in fetching data", error);
        })
    }, [])
    
    // const [activeTab, setActiveTab] = useState(0)
    // const switchTab = async (tabIndex: number) => {
    //     setActiveTab(tabIndex)
    // }
    return (
        <MainContent>
            <InternalContent>
                <InternalExternalCohort />
                {/* <ButtonMenuContainer>
                    <ButtonTab activeIndex={activeTab} onItemClick={switchTab}>
                        <ButtonTabItem width="50%" mr="5px">{t('Internal Cohort')}</ButtonTabItem>
                        <ButtonTabItem width="50%" color='text8'>{t('External Cohort')}</ButtonTabItem>
                    </ButtonTab>
                </ButtonMenuContainer> */}
                <Header>
                    <RowBetween1>
                        <TextHeader>Leaderboard</TextHeader>
                    </RowBetween1>
                    <StyledInternalLink to={`/trading-leaderboard/archived`} style={{ width: '100%', color: '#ff007a', margin: 'auto 0'}}>
                        <ButtonPink padding="8px" borderRadius="8px">
                            Archived Leaderboard
                        </ButtonPink>
                    </StyledInternalLink>
                </Header>
            </InternalContent>
            <PageWrapper gap="lg" justify="center">
                <TopSection gap="md">
                    <DataCard>
                    <CardBGImage />
                    <CardNoise />
                    <CardSection>
                        <AutoColumn gap="md">
                            <TopSectionHeader>
                                <RowBetween>
                                    <TYPE.white fontWeight={600} fontSize={"17px"}>Trading Competition {info.version ?? ''}</TYPE.white>
                                </RowBetween>
                            </TopSectionHeader>
                            <TYPE.black fontSize={"15px"}>From: {info.from ?? ''}</TYPE.black>
                            <TYPE.black fontSize={"15px"}>To: {info.to ?? ''}</TYPE.black>
                            <TYPE.black fontSize={"15px"}>Pairs:  {info.pairs}</TYPE.black>
                            <TYPE.black fontSize={"15px"}>Prize Pool: {info.prize}</TYPE.black>
                            <ExternalLink
                                style={{ color: 'white', textDecoration: 'underline' }}
                                href={info.link}
                                target="_blank"
                            >
                                <TYPE.white fontSize={14}>Register Here For Trading Competition</TYPE.white>
                            </ExternalLink>
                            <TYPE.black fontSize={"14px"}>Note: Kindly turn off the gasless mode while executing trades for Trading Competition.</TYPE.black>
                        </AutoColumn>
                    </CardSection>
                    <CardBGImage />
                    <CardNoise />
                    </DataCard>
                </TopSection>
            </PageWrapper>
            <LeaderBoard>
                <TableStyle>
                    <TheadStyle>
                        <TrStyle>
                            <ThStyle>Ranking</ThStyle>
                            <ThStyle>Traders Address</ThStyle>
                            <ThStyle>Traded Amount(in USD)</ThStyle>
                        </TrStyle>
                    </TheadStyle>
                        {
                            loader ?
                            <LoaderStyle>
                                <Loader size="50px" /> 
                            </LoaderStyle>
                        : !loader && data1.length === 0 && !!errorHandle ? 
                        <LoaderStyle>
                            <span style={{fontSize: "20px"}}>No data found.</span> 
                        </LoaderStyle>
                        :
                        <TbodyStyle>{
                            data1.map((i: any, j: any) => (
                                <TrStyle key={i.from}>
                                    <TdStyle>{j+1}{"."}</TdStyle>
                                    <TdStyle>{i.from}</TdStyle>
                                    <TdStyle>{'$'}{i.amountUSD.toFixed(6)}</TdStyle>
                                </TrStyle>
                        ))}
                        </TbodyStyle>
                        }
                </TableStyle>
            </LeaderBoard>               
            
        </MainContent>
    )
}
