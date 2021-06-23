import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useCountUp } from 'react-countup'
import { CardBody, Flex, PlayCircleOutlineIcon, Skeleton, Text, TooltipText, useTooltip } from '@pancakeswap/uikit'
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
import { useBlockNumber } from 'state/application/hooks'

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
  const { lockPrice, lockBlock, totalAmount } = round
  const currentBlock = useBlockNumber() ?? 0
  const totalInterval = useGetinterval()
  const price = useGetLastOraclePrice()
  const isBull = price.gt(lockPrice)
  const priceColor = isBull ? 'success' : 'failure'
  const estimatedEndBlock = lockBlock + totalInterval
  const priceDifference = price.minus(lockPrice).toNumber()
  const { countUp, update } = useCountUp({
    start: 0,
    end: price.toNumber(),
    duration: 1,
    decimals: 3,
  })
  const { targetRef, tooltip, tooltipVisible } = useTooltip(t('Last price from Chainlink Oracle'), {
    placement: 'bottom',
  })

  useEffect(() => {
    update(price.toNumber())
  }, [price, update])

  if (round.failed) {
    return <CanceledRoundCard round={round} />
  }

  if (currentBlock > estimatedEndBlock) {
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
          blockNumber={estimatedEndBlock}
        />
        <BlockProgress variant="flat" scale="sm" startBlock={lockBlock} endBlock={estimatedEndBlock} />
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
              <div ref={targetRef}>
                <TooltipText bold color={priceColor} fontSize="24px" style={{ minHeight: '36px' }}>
                  {price.gt(0) ? `$${countUp}` : <Skeleton height="36px" width="94px" />}
                </TooltipText>
              </div>
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
      {tooltipVisible && tooltip}
    </GradientBorder>
  )
}

export default LiveRoundCard
