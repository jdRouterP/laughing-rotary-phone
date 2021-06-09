import React from 'react'
import styled from 'styled-components'
import ProgressBar from './ProgressBar'

interface Props {
    totalTime: number
}

const Wrapper = styled.div`
    margin: 0 20px;
`
const TitleWrapper = styled.div`
    width: 320px;
    height: 80px;
    border: 1px solid blue;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

`
const Title = styled.div`
    font-size:16px;
    font-weight:600;
    padding: 20px;
    display:flex;
    justify-content: space-between;
`

const ContentWrapper = styled.div`
    width: 320px;
    height: 340px;
    border: 1px solid red;
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const Content = styled.div`
    width: 280px;
    height: 170px;
    border: 1px solid pink;
    border-radius: 12px;
    padding: 20px 15px;
    display:flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 20px 0;
`

const ClosedPrice = styled.div`
    font-size: 12px;
    font-weight: bold;
`

const PriceWrapper = styled.div`
    display:flex;
    justify-content: space-between;
    margin: 15px 0;
`

const Price = styled.div`
    font-size: 24px;
    font-weight: bold;
`

const PriceChange = styled.div`
    font-size: 16px;
    font-weight: 400px;
    background-color: rgb(237, 75, 158);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 0 5px;
    height: 24px;
`
const LockedPrice = styled.div`
    font-size: 16px;
    font-weight: 400px;
    display:flex;
    justify-content: space-between;
`

const PrizePool = styled.div`
    font-size: 16px;
    font-weight: bold;
    display:flex;
    justify-content: space-between;
`

const Payout = styled.div`
    display: grid;
    place-items: center;
`

const PayoutAmount = styled.div`
    font-size: 16px;
    font-weight: bold;
`

const PayoutLabel = styled.div`
    font-size: 20px;
    font-weight: bold;
`

const LiveCard = ({ totalTime }: Props) => {
    return (
        <Wrapper>
            <TitleWrapper>
                <Title>
                    <span>
                        LIVE
                    </span>
                    <span style={{ fontWeight: 400 }}>
                        #6969
                    </span>
                </Title>
                <ProgressBar totalTime={totalTime} />
            </TitleWrapper>
            <ContentWrapper>
                <Payout>
                    <PayoutLabel>
                        UP
                    </PayoutLabel>
                    <PayoutAmount>
                        <span>1.24x{' '}</span>
                        <span>Payout</span>
                    </PayoutAmount>
                </Payout>
                <Content>
                    <ClosedPrice>
                        Last Price
                    </ClosedPrice>
                    <PriceWrapper>
                        <Price>
                            $343.23
                        </Price>
                        <PriceChange>
                            $-0.57
                        </PriceChange>
                    </PriceWrapper>
                    <LockedPrice>
                        <span>
                            Locked Price:
                        </span>
                        <span>
                            $342.446
                        </span>
                    </LockedPrice>
                    <PrizePool>
                        <span>
                            Prize Pool:
                        </span>
                        <span>
                            36.630 BNB
                        </span>
                    </PrizePool>
                </Content>
                <Payout>
                    <PayoutAmount>
                        <span>1.24x{' '}</span>
                        <span>Payout</span>
                    </PayoutAmount>
                    <PayoutLabel>
                        DOWN
                    </PayoutLabel>
                </Payout>
            </ContentWrapper>
        </Wrapper>
    )
}

export default LiveCard
