import React from 'react'
import styled from 'styled-components'

interface Props {

}

const Wrapper = styled.div`
    width: 340px;
    display: grid;
    margin: 20px 0;
`

const Content = styled.div`
    width: 100%;
    height: 220px;
    border: 1px solid pink;
    border-radius: 12px;
    padding: 20px 15px;
    display:flex;
    flex-direction: column;
    justify-content: space-between;
`

const RowWrapper = styled.div`
    margin: 2px 0;
    font-size: 16px;
    font-weight: 400px;
    display:flex;
    justify-content: space-between;
`


const Price = styled.div`
    font-size: 24px;
    font-weight: bold;
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

const PrizePoolWrapper = styled(RowWrapper)`
    font-weight: bold;
`

const ClosedPrice = styled.div`
    font-size: 12px;
`

const HeaderWrapper = styled(RowWrapper)`
    font-size: 18px;
    font-weight: bold;
    margin: 10px 0;
`

const RoundHistoryCard = (props: Props) => {
    return (
        <Wrapper>
            <HeaderWrapper>
                <span>
                    Round History
                </span>
                <span>

                </span>
            </HeaderWrapper>
            <Content>
                <ClosedPrice>CLOSED PRICE</ClosedPrice>
                <RowWrapper style={{ margin: '15px 0' }}>
                    <Price>
                        $343.23
                    </Price>
                    <PriceChange>
                        $-0.57
                    </PriceChange>
                </RowWrapper>
                <RowWrapper>
                    <span>
                        Locked Price:
                    </span>
                    <span>
                        $288.831
                    </span>
                </RowWrapper>
                <PrizePoolWrapper>
                    <span>
                        Prize Pool:
                    </span>
                    <span>30.700BNB</span>
                </PrizePoolWrapper>
                <RowWrapper>
                    <ClosedPrice>UP:</ClosedPrice>
                    <ClosedPrice>1.76x Payout | 17.118 MATIC</ClosedPrice>
                </RowWrapper>
                <RowWrapper>
                    <ClosedPrice>DOWN:</ClosedPrice>
                    <ClosedPrice>1.76x Payout | 17.118 MATIC</ClosedPrice>
                </RowWrapper>
            </Content>
        </Wrapper>
    )
}

export default RoundHistoryCard
