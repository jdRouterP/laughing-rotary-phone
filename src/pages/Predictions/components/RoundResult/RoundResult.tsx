import React from 'react'
import { BoxProps, Flex } from '@pancakeswap/uikit'
import { BetPosition, Round } from 'state/prediction/types'
import { useTranslation } from 'react-i18next'
import { formatUsd } from '../../helpers'
import PositionTag from '../PositionTag'
import { LockPriceRow, PrizePoolRow, RoundResultBox } from './styles'
import { TYPE } from 'theme'

interface RoundResultProps extends BoxProps {
  round: Round
}

const RoundResult: React.FC<RoundResultProps> = ({ round, children, ...props }) => {
  const { lockPrice, closePrice, totalAmount } = round
  const betPosition = closePrice > lockPrice ? BetPosition.BULL : BetPosition.BEAR
  const isPositionUp = betPosition === BetPosition.BULL
  const { t } = useTranslation()
  const priceDifference = closePrice - lockPrice

  return (
    <RoundResultBox betPosition={betPosition} {...props}>
      <TYPE.white fontSize="12px" fontWeight={900} mb="8px">
        {t('CLOSED PRICE')}
      </TYPE.white>
      {round.failed ? (
        <TYPE.white fontSize="12px" fontWeight={900} mb="8px">
          {t('CANCELLED')}
        </TYPE.white>
      ) : (
        <Flex alignItems="center" justifyContent="space-between" mb="16px">
          <TYPE.main color={isPositionUp ? '#29a329' : '#ff471a'} fontWeight={500} fontSize="24px">
            {formatUsd(closePrice)}
          </TYPE.main>
          <PositionTag betPosition={betPosition}>{formatUsd(priceDifference)}</PositionTag>
        </Flex>
      )}
      {lockPrice && <LockPriceRow lockPrice={lockPrice} />}
      <PrizePoolRow totalAmount={totalAmount} />
      {children}
    </RoundResultBox>
  )
}

export default RoundResult
