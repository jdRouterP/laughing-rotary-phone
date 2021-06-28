import React from 'react'
import styled from 'styled-components'
import { Button } from 'theme'

interface Props {

}

const Wrapper = styled.div`
    width: 340px;
    margin: 20px 0;
`

const Content = styled.div`
    height: 280px;
    border: 1px solid pink;
    border-radius: 12px;
    padding: 20px 15px;
    display:flex;
    flex-direction: column;
    justify-content: space-between;
`

const ExplorerLink = styled.div`
    font-size: 14px;
    font-weight: bold;
    width:100%;
    display: grid;
    place-items: center;
    margin: 20px 0;
`

const DirectionWrapper = styled.div`
    margin: 10px 0;
    font-size: 16px;
    font-weight: 400px;
    display:flex;
    justify-content: space-between;
`

const PriceChange = styled.div`
    font-size: 16px;
    font-weight: 400px;
    background-color: ${({ theme }) => theme.green1};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 0 5px;
    height: 24px;
`

const ResultWrapper = styled(DirectionWrapper)`
    font-weight: bold;
`
const ResultValue = styled.div`
    display: grid;
`
const DollarValue = styled.span`
    font-size: 12px;
    font-weight: normal;
    margin-top: 5px;
    text-align: right;
`

const HeaderWrapper = styled(DirectionWrapper)`
    font-size: 18px;
    font-weight: bold;
    margin: 10px 0;
`

const WinWrapper = styled.div`
    color: ${({ theme }) => theme.yellow2}
`

const YourHistoryCard = (props: Props) => {
    return (
        <Wrapper>
            <HeaderWrapper>
                <span>
                    Your History
                </span>
                <WinWrapper>
                    WIN
                </WinWrapper>
            </HeaderWrapper>
            <Content>
                <Button>Already Collected</Button>
                <ExplorerLink>
                    View On PolygonScan
                </ExplorerLink>
                <DirectionWrapper>
                    <span>
                        Your Direction
                    </span>
                    <PriceChange>
                        UP
                    </PriceChange>
                </DirectionWrapper>
                <DirectionWrapper>
                    <span>
                        Your position
                    </span>
                    <span>
                        0.010 MATIC
                    </span>
                </DirectionWrapper>
                <ResultWrapper>
                    <span>
                        Your Result
                    </span>
                    <ResultValue>
                        <span>+0.017BNB</span>
                        <DollarValue>~$4554</DollarValue>
                    </ResultValue>
                </ResultWrapper>
            </Content>
        </Wrapper>
    )
}

export default YourHistoryCard
