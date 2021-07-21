import React, { ReactElement } from 'react'
import { Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { TYPE } from 'theme'

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
  const isLive = status === 'live'

  return (
    <>
      <StyledCardHeader status={status}>
        <Round>
          <TYPE.main fontSize={isLive ? '18px' : '16px'} textAlign="center">
            {`Round: ${epoch}`}
          </TYPE.main>
        </Round>
        <Flex alignItems="center">
          {icon}
          <TYPE.main color={'text4'} lineHeight="21px">
            {title}
          </TYPE.main>
        </Flex>
      </StyledCardHeader>
      <Break />
    </>
  )
}

export default CardHeader
