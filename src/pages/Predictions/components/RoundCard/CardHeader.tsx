import React, { ReactElement } from 'react'
import { Flex, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { Break } from 'components/earn/styled'

type Status = 'expired' | 'live' | 'next' | 'upcoming' | 'canceled' | 'calculating'

interface CardHeaderProps {
  status: Status
  title: string
  epoch: number
  blockTime: number
  icon?: ReactElement
}

// const getBackgroundColor = (theme: DefaultTheme, status: Status) => {
//   switch (status) {
//     case 'calculating':
//       return 'blue'
//     case 'live':
//       return 'transparent'
//     case 'canceled':
//       return 'pink'
//     case 'next':
//       return 'blue'
//     case 'upcoming':
//       return '#1C738C'
//     case 'expired':
//     default:
//       return 'yellow'
//   }
// }

type FallbackColor = 'text' | 'textSubtle'

const getTextColorByStatus = (status: Status, fallback: FallbackColor) => {
  switch (status) {
    case 'expired':
      return '#e6e6e6'
    case 'next':
      return 'white'
    case 'live':
      return 'white'
    case 'upcoming':
      return 'white'
    case 'canceled':
    case 'calculating':
      return 'text'
    default:
      return fallback
  }
}

const getRoundIDColorByStatus = (status: Status, fallback: FallbackColor) => {
  switch (status) {
    case 'expired':
      return '#4d4d4d'
    case 'next':
    case 'live':
    case 'upcoming':
    case 'canceled':
    case 'calculating':
      return 'white'
    default:
      return fallback
  }
}

const StyledCardHeader = styled.div<{ status: Status }>`
  align-items: center;
  border-radius: 16px 0px 0 0;
  display: flex;
  justify-content: space-between;
  padding: ${({ status }) => (status === 'live' ? '16px' : '8px')};
`

const Round = styled.div`
  justify-self: center;
`

const CardHeader: React.FC<CardHeaderProps> = ({ status, title, epoch, icon }) => {
  const textColor = getTextColorByStatus(status, 'text')
  const roundIDColor = getRoundIDColorByStatus(status, 'text')
  const isLive = status === 'live'

  return (
    <>
      <StyledCardHeader status={status}>
        <Round>
          <Text fontSize={isLive ? '14px' : '12px'} color={roundIDColor} textAlign="center">
            {`Round: ${epoch}`}
          </Text>
        </Round>
        <Flex alignItems="center">
          {icon}
          <Text color={textColor} bold={isLive} textTransform={isLive ? 'uppercase' : 'capitalize'} lineHeight="21px">
            {title}
          </Text>
        </Flex>
      </StyledCardHeader>
      <Break />
    </>
  )
}

export default CardHeader
