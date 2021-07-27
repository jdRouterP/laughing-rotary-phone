import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useCountUp } from 'react-countup'
import { useGetLastOraclePrice } from 'state/hook'
import QuestionHelper from 'components/QuestionHelper'
// import CurrencyLogo from 'components/CurrencyLogo'
// import { WMATIC } from '../../../constants'

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
    margin-right: 15px;
    border: 1px solid ${({ theme }) => theme.text6};

    ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 260px;
    margin-bottom: 10px;
    padding: 0px;
  `};
`
const PriceFeed = styled.div`
    display: flex;
    align-items: flex-start;
    border-radius: 10px;
    padding: 13px 13px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        padding: 5px 5px;
  `};
`

const TradingPair = styled.div`
    font-size: 24px;
    font-weight: 600;
    margin-right: 10px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;
    font-weight: 500;
    margin-right: 5px;
  `};
`

const CurrentPrice = styled.div`
    font-size: 12px;
    margin-top: 7px;
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
                {/* <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={} /> */}
                <TradingPair>
                    MATIC/USD
                </TradingPair>
                <CurrentPrice>
                    {`$${countUp}`}
                </CurrentPrice>
                <QuestionHelper text="Prediction Market is in BETA, use at your own risk!" />
            </PriceFeed>
        </Wrapper>
    )
}

export default TokenUSDPrice