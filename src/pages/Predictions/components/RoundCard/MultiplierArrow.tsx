import React from 'react'
import styled, { CSSProperties } from 'styled-components'
import { Box, Flex } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { BetPosition } from 'state/prediction/types'
// import { RoundMultiplierDownArrow, RoundMultiplierUpArrow } from '../../RoundMultiplierArrows'
import EnteredTag from './EnteredTag'
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

const EnteredTagWrapper = styled.div`
  position: absolute;
  z-index: 10;
`

// const getTextColor =
//   (fallback = 'textSubtle') =>
//     (isActive: boolean, isDisabled: boolean) => {
//       if (isDisabled) {
//         return 'textDisabled'
//       }

//       if (isActive) {
//         return 'white'
//       }

//       return fallback
//     }

const MultiplierArrow: React.FC<MultiplierArrowProps> = ({
  betAmount,
  multiplier,
  hasEntered = false,
  betPosition = BetPosition.BULL,
  isDisabled = false,
  isActive = false,
}) => {
  const { t } = useTranslation()
  // const upColor = getTextColor('success')(isActive, isDisabled)
  // const downColor = getTextColor('failure')(isActive, isDisabled)
  // const textColor = getTextColor()(isActive, isDisabled)
  const multiplierText = (
    <Box>
      <Flex justifyContent="center">
        <TYPE.main color={'text1'} fontSize="14px" lineHeight="14x">
          {multiplier !== undefined ? `${multiplier.toLocaleString(undefined, { maximumFractionDigits: 2 })}x` : '-'}
        </TYPE.main>
        <TYPE.main color={'text1'} fontSize="14px" lineHeight="14x" ml="4px">
          {t('Payout')}
        </TYPE.main>
      </Flex>
    </Box>
  )

  const getEnteredTag = (position: CSSProperties) => {
    if (!hasEntered) {
      return null
    }

    return (
      <EnteredTagWrapper style={position}>
        <EnteredTag amount={betAmount} />
      </EnteredTagWrapper>
    )
  }

  if (betPosition === BetPosition.BEAR) {
    return (
      <Box position="relative">
        {getEnteredTag({ bottom: "-35px", right: 0 })}
        <Content>
          {!isDisabled && multiplierText}
          <TYPE.main color={'text1'} fontSize="20px" margin="10px">
            {t('BEAR')}
          </TYPE.main>
        </Content>
      </Box>
    )
  }

  return (
    <Box position="relative">
      {getEnteredTag({ top: "-30px", left: 0 })}
      <Content>
        <TYPE.main color={'text1'} fontSize="20px" margin="10px">
          {t('BULL')}
        </TYPE.main>
        {!isDisabled && multiplierText}
      </Content>

    </Box>
  )
}

export default MultiplierArrow