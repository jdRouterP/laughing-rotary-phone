import React from 'react'
import styled from 'styled-components'
import { Box, Flex, FlexProps } from '@pancakeswap/uikit'
import { formatToken, formatUsd } from 'pages/Predictions/helpers'
import { useTranslation } from 'react-i18next'
import { BetPosition, Round } from 'state/prediction/types'
import { TYPE } from 'theme'
import { RowBetween } from 'components/Row'
import { BoxProps } from 'rebass'

// PrizePoolRow
interface PrizePoolRowProps extends FlexProps {
  totalAmount: Round['totalAmount']
}

const getPrizePoolAmount = (totalAmount: PrizePoolRowProps['totalAmount']) => {
  if (!totalAmount) {
    return '0'
  }

  return formatToken(totalAmount)
}

//@ts-ignore
const Row = ({ children, ...props }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between" {...props}>
      {children}
    </Flex>
  )
}

export const PrizePoolRow: React.FC<PrizePoolRowProps> = ({ totalAmount, ...props }) => {
  const { t } = useTranslation()

  return (
    <RowBetween>
      <TYPE.white marginTop={"5px"} fontWeight={600} fontSize="15px">{t('Prize Pool')}:</TYPE.white>
      {' '}
      <TYPE.white marginTop={"5px"} fontWeight={600} fontSize="15px">{`${getPrizePoolAmount(totalAmount)} MATIC`}</TYPE.white>
    </RowBetween>
  )
}

// Payout Row
interface PayoutRowProps extends FlexProps {
  positionLabel: string
  multiplier: number
  amount: number
}

export const PayoutRow: React.FC<PayoutRowProps> = ({ positionLabel, multiplier, amount, ...props }) => {
  // const { t } = useTranslation()
  const formattedMultiplier = `${multiplier.toLocaleString(undefined, { maximumFractionDigits: 2 })}x`

  return (
    <Row height="18px" {...props}>
      <TYPE.white fontWeight={500}>
        {positionLabel}:
      </TYPE.white>
      <Flex alignItems="center">
        <TYPE.white fontWeight={500} lineHeight="18px">
          {`${formattedMultiplier} Payout`}
        </TYPE.white>
        <TYPE.white>|</TYPE.white>
        <TYPE.white fontWeight={500} fontSize="12px" lineHeight="18px">{`${formatToken(amount)} MATIC`}</TYPE.white>
      </Flex>
    </Row>
  )
}

// LockPriceRow
interface LockPriceRowProps extends FlexProps {
  lockPrice: Round['lockPrice']
}

export const LockPriceRow: React.FC<LockPriceRowProps> = ({ lockPrice, ...props }) => {
  const { t } = useTranslation()

  return (
    <Row {...props}>
      <TYPE.white fontWeight={500} fontSize="14px">{t('Locked Price')}:</TYPE.white>
      {' '}
      <TYPE.white fontWeight={500} fontSize="14px">{formatUsd(lockPrice)}</TYPE.white>
    </Row>
  )
}

// RoundResultBox
interface RoundResultBoxProps extends BoxProps{
  round: Round
  betPosition?: BetPosition
  isPositionUp?: boolean
  isNext?: boolean
  isLive?: boolean
  hasEntered?: boolean
}

// const getBackgroundColor = ({
//   theme,
//   betPosition,
//   isNext,
//   isLive,
//   hasEntered,
// }: RoundResultBoxProps & { theme: DefaultTheme }) => {
//   if (isNext) {
//     return 'linear-gradient(180deg, #53DEE9 0%, #7645D9 100%)'
//   }

//   if (hasEntered || isLive) {
//     return 'pink'
//   }

//   if (betPosition === BetPosition.BULL) {
//     return 'green'
//   }

//   if (betPosition === BetPosition.BEAR) {
//     return 'red'
//   }

//   return 'blue'
// }

const Background = styled(Box) <RoundResultBoxProps>`
  border-radius: 16px;
  border: 1px solid ${({isPositionUp}) => isPositionUp ? '#29a329' : '#ff471a'};
  // border-image-source: linear-gradient(90deg, #DD3679 100%, #665BBA 100%);
  padding: 2px;
`

const StyledRoundResultBox = styled.div`
  border-radius: 14px;
  padding: 20px 30px;
`

export const RoundResultBox: React.FC<RoundResultBoxProps> = ({
  round,
  isNext = false,
  hasEntered = false,
  isLive = false,
  children,
  ...props
}) => {
  const { lockPrice, closePrice } = round
  const betPosition = closePrice > lockPrice ? BetPosition.BULL : BetPosition.BEAR
  const isPositionUp = betPosition === BetPosition.BULL
  
  
  return (
    <Background isPositionUp={isPositionUp} isNext={isNext} hasEntered={true} isLive={isLive} {...props}>
      <StyledRoundResultBox>{children}</StyledRoundResultBox>
    </Background>
  )
}
