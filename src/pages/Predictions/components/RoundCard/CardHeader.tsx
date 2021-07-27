import React, { ReactElement } from 'react'
import { Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { useIsDarkMode } from 'state/user/hooks'

type Status = 'expired' | 'live' | 'next' | 'upcoming' | 'canceled' | 'calculating'

interface CardHeaderProps {
  status: Status
  title: string
  epoch: number
  blockTime: number
  icon?: ReactElement
}

const Break = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.text4};
  height: 1px;
`

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

type FallbackColor = 'text4'

const getTextColorByStatus = (status: Status, fallback: FallbackColor) => {
  switch (status) {
    case 'expired':
      return 'text4'
    case 'next':
      return '#DD3679'
    case 'live':
      return '#29a329'
    case 'upcoming':
      return 'text4'
    case 'canceled':
      return 'text4'
    case 'calculating':
      return 'text4'
    default:
      return fallback
  }
}

// const getRoundIDColorByStatus = (status: Status, fallback: FallbackColor) => {
//   switch (status) {
//     case 'expired':
//       return '#4d4d4d'
//     case 'next':
//     case 'live':
//     case 'upcoming':
//     case 'canceled':
//     case 'calculating':
//       return 'white'
//     default:
//       return fallback
//   }
// }

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

const CardHeader: React.FC<CardHeaderProps> = ({ status, title, epoch }) => {
  const textColor = getTextColorByStatus(status, 'text4')
  // const roundIDColor = getRoundIDColorByStatus(status, 'text')
  const isLive = status === 'live'

  const darkMode = useIsDarkMode()

  return (
    <>
      <StyledCardHeader status={status}>
        <Round>
          <TYPE.main fontSize={isLive ? '18px' : '16px'} textAlign="center" color={darkMode ? '#FFFFFF' : "#d2a826"}>
            {`Round: ${epoch}`}
          </TYPE.main>
        </Round>
        <Flex alignItems="center">
          <TYPE.main color={textColor} lineHeight="21px">
            {title}
          </TYPE.main>
        </Flex>
      </StyledCardHeader>
      <Break />
    </>
  )
}

export default CardHeader
