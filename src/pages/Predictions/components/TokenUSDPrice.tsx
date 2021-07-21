import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useCountUp } from 'react-countup'
import { useGetLastOraclePrice } from 'state/hook'

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    position: relative;

    border: none;
    background-color: transparent;
    margin: 0;
    padding: 0;
    background-color: ${({ theme }) => theme.bg3};
    margin-left: 8px;
    padding: 0.15rem 0.5rem;
    border-radius: 0.5rem;
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
    margin-top: 5px;
`

const TokenUSDPrice: React.FC = () => {

    const price = useGetLastOraclePrice()
    const { countUp, update } = useCountUp({
        start: 0,
        end: price,
        duration: 1,
        decimals: 3,
    })

    useEffect(() => {
        let isMounted = true;
        if (isMounted) update(price)
        return () => { isMounted = false };
    }, [price, update])


    return (
        <Wrapper>
            <PriceFeed>
                <TradingPair>
                    MATIC/USD
                </TradingPair>
                <CurrentPrice>
                    {`$${countUp}`}
                </CurrentPrice>
            </PriceFeed>
        </Wrapper>
    )
}

export default TokenUSDPrice