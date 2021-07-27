import React from 'react'
import styled from 'styled-components'
import { useTooltip } from '@pancakeswap/uikit'
import { formatToken } from '../../helpers'
import { PlayCircle } from 'react-feather'

interface EnteredTagProps {
  amount?: number
}

const StyledEnteredTag = styled.div`
color: #f8f8f2;
border-radius: 0.2rem;
padding: 4px 5px 5px;
white-space: nowrap;
  text-transform: uppercase;
`

const EnteredTag: React.FC<EnteredTagProps> = ({ amount }: EnteredTagProps) => {
  const { targetRef, tooltipVisible, tooltip } = useTooltip(
    <div style={{ whiteSpace: 'nowrap' }}>{`${formatToken(amount ?? 0)} MATIC`}</div>,
    { placement: 'bottom' },
  )

  return (
    <>
      <span ref={targetRef}>
        <StyledEnteredTag>{<PlayCircle />}</StyledEnteredTag>{' '}
      </span>{' '}
      {tooltipVisible && tooltip}
    </>
  )
}

export default EnteredTag
