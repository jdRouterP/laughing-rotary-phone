import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { StyledInternalLink, TYPE } from 'theme'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise } from 'components/multiTokenVault/styled'
import { RowBetween } from 'components/Row'
// import { UNI_TOKEN, USDT } from '../constants/index'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Clock } from 'react-feather'
import { getMarketData, PredictionInfo } from 'state/prediction/hooks'
import { useInitialBlock } from 'state/hook'
import { UNI_TOKEN, USDT } from '../../../../constants'


interface PredictionMarketProps {
    price: string | number
    predictionValue: PredictionInfo
}

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: flex;
  flex-direction: column
`};
`

const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) =>
        `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${showBackground ? theme.black : theme.bg5} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  ${({ showBackground }) =>
        showBackground &&
        `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const TopSection = styled.div`
    display: grid;
    grid-template-columns: 48px 1fr 120px;
    grid-gap: 0px;
    align-items: center;
    padding: 1rem;
    z-index: 1;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
    `};
`

const PredictionMarket: React.FC<PredictionMarketProps> = ({ predictionValue, price }) => {
    const initialBlock = useInitialBlock()
    const [epoch, setEpoch] = useState(0)
    useEffect(() => {

        const fetchInitialData = async () => {
            const CurrentEpoch = await getMarketData(predictionValue.GRAPH_API_PREDICTION)
            setEpoch(CurrentEpoch.market.epoch - 1)
        }
        if (initialBlock > 0) {
            fetchInitialData()
        }
    }, [initialBlock, predictionValue.GRAPH_API_PREDICTION])



    const backgroundColor = useColor(UNI_TOKEN);

    return (
        <Wrapper showBackground={false} bgColor={backgroundColor}>
            <CardBGImage desaturate />
            <CardNoise />
            <TopSection>
                <DoubleCurrencyLogo currency0={predictionValue.currency} currency1={USDT} size={24} />
                <TYPE.white fontWeight={600} fontSize={24} style={{ marginLeft: '8px' }}>
                    {`${predictionValue?.currency.symbol ?? ""}`}-USD
                </TYPE.white>
                <StyledInternalLink to={`/prediction/${predictionValue.currency.symbol}/${predictionValue.candleSize}`} style={{ width: '100%' }}>
                    <ButtonPrimary padding="8px" borderRadius="8px">
                        Enter
                    </ButtonPrimary>
                </StyledInternalLink>
            </TopSection>

            <StatContainer>
                <RowBetween>
                    <Clock />
                    <TYPE.white>{`${predictionValue.candleSize}`} Minute Candle</TYPE.white>
                </RowBetween>
                <RowBetween>
                    <TYPE.white>Current Price</TYPE.white>
                    <TYPE.white>
                        {`$${price}`}
                    </TYPE.white>
                </RowBetween>
                <RowBetween>
                    <TYPE.white>Current Round</TYPE.white>
                    <TYPE.white>
                        {epoch === 0 ? 'Loading..' : epoch}
                    </TYPE.white>
                </RowBetween>
            </StatContainer>
        </Wrapper>
    )
}

export default PredictionMarket