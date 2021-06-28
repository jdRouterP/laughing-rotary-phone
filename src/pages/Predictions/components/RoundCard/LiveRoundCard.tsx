import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useCountUp } from 'react-countup'
import { CardBody, Flex, PlayCircleOutlineIcon, Skeleton, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round, BetPosition } from 'state/prediction/types'
import { useGetinterval, useGetLastOraclePrice } from 'state/hook'
import BlockProgress from 'components/BlockProgress'
import { formatUsd } from '../../helpers'
import PositionTag from '../PositionTag'
import { RoundResultBox, LockPriceRow, PrizePoolRow } from '../RoundResult'
import MultiplierArrow from './MultiplierArrow'
import Card from './Card'
import CardHeader from './CardHeader'
import CanceledRoundCard from './CanceledRoundCard'
import CalculatingCard from './CalculatingCard'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { MouseoverTooltip } from 'components/Tooltip'
interface LiveRoundCardProps {
  round: Round
  betAmount?: number
  hasEnteredUp: boolean
  hasEnteredDown: boolean
  bullMultiplier: number
  bearMultiplier: number
}

const GradientBorder = styled.div`
  background: linear-gradient(180deg, #53dee9 0%, #7645d9 100%);
  border-radius: 16px;
  padding: 1px;
`

const GradientCard = styled(Card)`
  background: #64d789;
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
  const priceColor = isBull ? 'success' : 'failure'
  console.log(priceColor)
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
    <GradientBorder>
      <GradientCard>
        <CardHeader
          status="live"
          icon={<PlayCircleOutlineIcon mr="4px" width="24px" color="secondary" />}
          title={t('Live')}
          epoch={round.epoch}
          blockTime={estimatedEndTime}
        />
        <BlockProgress variant="flat" scale="sm" startBlock={lockAt} endBlock={estimatedEndTime} />
        <CardBody p="16px">
          <MultiplierArrow
            betAmount={betAmount}
            multiplier={bullMultiplier}
            hasEntered={hasEnteredUp}
            isActive={isBull}
          />
          <RoundResultBox betPosition={isBull ? BetPosition.BULL : BetPosition.BEAR}>
            <Text color="textSubtle" fontSize="12px" bold textTransform="uppercase" mb="8px">
              {t('Last Price')}
            </Text>
            <Flex alignItems="center" justifyContent="space-between" mb="16px" height="36px">
              <MouseoverTooltip text={'Last price from Chainlink Oracle'} placement='bottom'>
                {price > 0 ? `$${countUp}` : <Skeleton height="36px" width="94px" />}
              </MouseoverTooltip>
              <PositionTag betPosition={isBull ? BetPosition.BULL : BetPosition.BEAR}>
                {formatUsd(priceDifference)}
              </PositionTag>
            </Flex>
            {lockPrice && <LockPriceRow lockPrice={lockPrice} />}
            <PrizePoolRow totalAmount={totalAmount} />
          </RoundResultBox>
          <MultiplierArrow
            betAmount={betAmount}
            multiplier={bearMultiplier}
            betPosition={BetPosition.BEAR}
            hasEntered={hasEnteredDown}
            isActive={!isBull}
          />
        </CardBody>
      </GradientCard>
    </GradientBorder>
  )
}

export default LiveRoundCard
