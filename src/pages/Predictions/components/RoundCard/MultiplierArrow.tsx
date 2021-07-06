import React from 'react'
import styled from 'styled-components'
import { Box, Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { BetPosition } from 'state/prediction/types'
// import { RoundMultiplierDownArrow, RoundMultiplierUpArrow } from '../../RoundMultiplierArrows'
// import EnteredTag from './EnteredTag'
import { TYPE } from 'theme'

interface MultiplierArrowProps {
  betAmount?: number
  multiplier?: number
  hasEntered?: boolean
  betPosition?: BetPosition
  isDisabled?: boolean
  isActive?: boolean
}

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 0;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
`

// const EnteredTagWrapper = styled.div`
//   position: absolute;
//   z-index: 10;
// `

const getTextColor =
  (fallback = 'textSubtle') =>
    (isActive: boolean, isDisabled: boolean) => {
      if (isDisabled) {
        return 'textDisabled'
      }

      if (isActive) {
        return 'white'
      }

      return fallback
    }

const MultiplierArrow: React.FC<MultiplierArrowProps> = ({
  betAmount,
  multiplier,
  hasEntered = false,
  betPosition = BetPosition.BULL,
  isDisabled = false,
  isActive = false,
}) => {
  const { t } = useTranslation()
  const upColor = getTextColor('success')(isActive, isDisabled)
  const downColor = getTextColor('failure')(isActive, isDisabled)
  // const textColor = getTextColor()(isActive, isDisabled)
  const multiplierText = (
    <Box>
      <Flex justifyContent="center" height="14px">
        <Text fontSize="14px" color={"white"} bold lineHeight="14x">
          {multiplier !== undefined ? `${multiplier.toLocaleString(undefined, { maximumFractionDigits: 2 })}x` : '-'}
        </Text>
        <Text fontSize="14px" color={"white"} lineHeight="14x" ml="4px">
          {t('Payout')}
        </Text>
      </Flex>
    </Box>
  )

  // const getEnteredTag = (position: CSSProperties) => {
  //   if (!hasEntered) {
  //     return null
  //   }

  //   return (
  //     <EnteredTagWrapper style={position}>
  //       <EnteredTag amount={betAmount} />
  //     </EnteredTagWrapper>
  //   )
  // }

  if (betPosition === BetPosition.BEAR) {
    return (
      <Box position="relative">
        <Content>
          {!isDisabled && multiplierText}
          <TYPE.white fontSize="20px" margin="10px" color={downColor}>
            {t('BEAR')}
          </TYPE.white>
        </Content>

      </Box>
    )
  }

  return (
    <Box position="relative">
      <Content>
        <TYPE.white fontSize="20px" margin="10px" color={upColor}>
          {t('BULL')}
        </TYPE.white>
        {!isDisabled && multiplierText}
      </Content>

    </Box>
  )
}

export default MultiplierArrow