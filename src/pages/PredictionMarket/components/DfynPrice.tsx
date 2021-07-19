import React from 'react'
import styled from 'styled-components'

interface Props {

}

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.bg4};
    padding: 10px 4px;
    border-radius: 15px;
    width: 220px;
`
const PriceFeed = styled.div`
    display: flex;
    align-items: flex-start;
`

const TradingPair = styled.div`
    font-size: 20px;
    font-weight: bold;
    margin-right: 10px;
`

const CurrentPrice = styled.div`
    font-size: 12px;
    margin-top: 1px;
`

const DfynPrice = (props: Props) => {
    return (
        <Wrapper>
            <PriceFeed>
                <TradingPair>
                    DFYN/USDT
                </TradingPair>
                <CurrentPrice>
                    $8.15
                </CurrentPrice>
            </PriceFeed>
        </Wrapper>
    )
}

export default DfynPrice