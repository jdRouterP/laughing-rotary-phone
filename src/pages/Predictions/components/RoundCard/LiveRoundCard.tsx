import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useCountUp } from 'react-countup'
import { Flex, PlayCircleOutlineIcon, Skeleton } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round, BetPosition } from 'state/prediction/types'
import { useGetinterval, useGetLastOraclePrice } from 'state/hook'
// import BlockProgress from 'components/BlockProgress'
import { formatUsd } from '../../helpers'
import PositionTag from '../PositionTag'
import { RoundResultBox, LockPriceRow, PrizePoolRow } from '../RoundResult'
import MultiplierArrow from './MultiplierArrow'
import CardHeader from './CardHeader'
import CanceledRoundCard from './CanceledRoundCard'
import CalculatingCard from './CalculatingCard'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { MouseoverTooltip } from 'components/Tooltip'
import { AutoColumn } from 'components/Column'
// import { CardBGImage, CardNoise } from 'components/earn/styled'
import { TYPE } from 'theme'

interface LiveRoundCardProps {
  round: Round
  betAmount?: number
  hasEnteredUp: boolean
  hasEnteredDown: boolean
  bullMultiplier: number
  bearMultiplier: number
}


const CardHeaderBlock = styled.div<{ isPositionUp: boolean}>`
  opacity: 0.5;
  margin-top: 23px;
  width: 206px;
  padding-top: 30px;
  padding-bottom: 41px;
  background: ${({isPositionUp}) => isPositionUp ? '#29a329' : 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));'};
  border-radius: 10px 10px 0px 0px; 
`
const CardFooterBlock = styled.div<{isPositionUp: boolean}>`
  opacity: 0.5;
  margin-bottom: 23px;
  width: 206px;
  padding-top: 37px;
  padding-bottom: 30px;
  background: ${({isPositionUp}) => isPositionUp ? 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))' : '#ff471a'};
  border-radius: 0px 0px 10px 10px;
`

// const GradientBorder = styled.div`
//   background: linear-gradient(180deg, #53dee9 0%, #7645d9 100%);
//   border-radius: 16px;
//   padding: 1px;
// `

// const GradientCard = styled(Card)`
//   background: #64d789;
// `

const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: linear-gradient(180deg, #2D3646 0%, #2C2F35 100%);
  /* Shadow */
  box-shadow: 0px 0px 34px rgba(0, 0, 0, 0.15);
  border-radius: 15px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}

`

const ContentWrapper = styled.div`
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
`


const LiveRoundCard: React.FC<LiveRoundCardProps> = ({
  round,
  betAmount,
  hasEnteredUp,
  hasEnteredDown,
  bullMultiplier,
  bearMultiplier,
}) => {
  const { t } = useTranslation()
  const { lockPrice, lockAt, totalAmount } = round
  const currentTimestamp = useCurrentBlockTimestamp()
  const totalInterval = useGetinterval()
  const price = useGetLastOraclePrice()
  const isBull = price > lockPrice;
  const priceColor = isBull ? '#29a329' : '#ff471a'
  const estimatedEndTime = lockAt + totalInterval
  const priceDifference = price - lockPrice
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

  if (round.failed) {
    return <CanceledRoundCard round={round} />
  }

  if (currentTimestamp && (currentTimestamp.toNumber() > estimatedEndTime)) {
    return <CalculatingCard round={round} />
  }

  return (
    <Wrapper showBackground={hasEnteredUp || hasEnteredDown} bgColor={priceColor}>
      {/* <CardBGImage desaturate />
      <CardNoise /> */}
      <CardHeader
        status="live"
        icon={<PlayCircleOutlineIcon mr="4px" width="24px" color="secondary" />}
        title={t('Live')}
        epoch={round.epoch}
        blockTime={estimatedEndTime}
      />
      <ContentWrapper>
      <CardHeaderBlock isPositionUp={isBull}>
        <MultiplierArrow
          betAmount={betAmount}
          multiplier={bullMultiplier}
          hasEntered={hasEnteredUp}
          isActive={isBull}
        />
      </CardHeaderBlock>
      <RoundResultBox round={round} betPosition={isBull ? BetPosition.BULL : BetPosition.BEAR}>
        <TYPE.white fontSize="14px" mb="8px" fontWeight="600">
          {t('LAST PRICE')}
        </TYPE.white>
        <Flex alignItems="center" justifyContent="space-between" mb="16px" height="36px">
          <MouseoverTooltip text={'Last price from Chainlink Oracle'} placement='bottom'>
            <TYPE.white color={isBull ? '#29a329' : '#ff471a'} fontWeight={500} fontSize="24px">
              {price > 0 ? `$${countUp}` : <Skeleton height="36px" width="94px" />}
            </TYPE.white>
          </MouseoverTooltip>
          <PositionTag betPosition={isBull ? BetPosition.BULL : BetPosition.BEAR}>
            {formatUsd(priceDifference)}
          </PositionTag>
        </Flex>
        {lockPrice && <LockPriceRow lockPrice={lockPrice} />}
        <PrizePoolRow totalAmount={totalAmount} />
      </RoundResultBox>
      <CardFooterBlock isPositionUp={isBull}>
        <MultiplierArrow
          betAmount={betAmount}
          multiplier={bearMultiplier}
          betPosition={BetPosition.BEAR}
          hasEntered={hasEnteredDown}
          isActive={!isBull}
        />
      </CardFooterBlock>
        
      </ContentWrapper>

    </Wrapper>
  )
}

export default LiveRoundCard
