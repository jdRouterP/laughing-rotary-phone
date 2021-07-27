import React from 'react'
import { BoxProps, Flex } from '@pancakeswap/uikit'
import { BetPosition, Round } from 'state/prediction/types'
import { useTranslation } from 'react-i18next'
import { formatUsd } from '../../helpers'
import PositionTag from '../PositionTag'
import { LockPriceRow, PrizePoolRow, RoundResultBox } from './styles'
import { TYPE } from 'theme'
import { useIsDarkMode } from 'state/user/hooks'

interface RoundResultProps extends BoxProps {
  round: Round
}

const RoundResult: React.FC<RoundResultProps> = ({ round, children, ...props }) => {
  const { lockPrice, closePrice, totalAmount } = round
  const betPosition = closePrice > lockPrice ? BetPosition.BULL : BetPosition.BEAR
  const isPositionUp = betPosition === BetPosition.BULL
  const { t } = useTranslation()
  const priceDifference = closePrice - lockPrice
  const darkMode = useIsDarkMode()

  return (
    <RoundResultBox round={round} betPosition={betPosition} {...props}>
      <TYPE.main fontSize="14px" fontWeight={600} mb="8px" color={darkMode ? '#FFFFFF' : "#ff007a"}>
        {t('CLOSED PRICE')}
      </TYPE.main>
      {round.failed ? (
        <TYPE.main fontSize="14px" fontWeight={600} mb="8px" color={darkMode ? '#FFFFFF' : "#ff007a"}>
          {t('CANCELLED')}
        </TYPE.main>
      ) : (
        <Flex alignItems="center" justifyContent="space-between" mb="16px">
          <TYPE.main color={isPositionUp ? '#29a329' : '#ff471a'} fontWeight={500} fontSize="24px">
            {formatUsd(closePrice)}
          </TYPE.main>
          <PositionTag betPosition={betPosition}>{formatUsd(priceDifference, 6)}</PositionTag>
        </Flex>
      )}
      {lockPrice && <LockPriceRow lockPrice={lockPrice} />}
      <PrizePoolRow totalAmount={totalAmount} />
      {children}
    </RoundResultBox>
  )
}

export default RoundResult
