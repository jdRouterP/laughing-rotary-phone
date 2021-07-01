import React from 'react'
import styled from 'styled-components'
import { useTooltip } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { formatToken } from '../../helpers'

interface EnteredTagProps {
  amount?: number
}

const StyledEnteredTag = styled.div`
background-color: #272822;
color: #f8f8f2;
border-radius: 0.2rem;
padding: 4px 5px 5px;
white-space: nowrap;
  text-transform: uppercase;
`

const EnteredTag: React.FC<EnteredTagProps> = ({ amount }: EnteredTagProps) => {
  const { t } = useTranslation()
  const { targetRef, tooltipVisible, tooltip } = useTooltip(
    <div style={{ whiteSpace: 'nowrap' }}>{`${formatToken(amount ?? 0)} MATIC`}</div>,
    { placement: 'bottom' },
  )

  return (
    <>
      <span ref={targetRef}>
        <StyledEnteredTag>{t('Entered')}</StyledEnteredTag>{' '}
      </span>{' '}
      {tooltipVisible && tooltip}
    </>
  )
}

export default EnteredTag
