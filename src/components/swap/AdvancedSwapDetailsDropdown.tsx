import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useLastTruthy } from '../../hooks/useLast'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'
import Banner from './Banner'

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  padding-top: calc(16px + 2rem);
  padding-bottom: 16px;
  margin-top: -2rem;
  width: 100%;
  max-width: 400px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.advancedBG};
  z-index: -1;

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
`

const BannerWrapper = styled.div<{ show: boolean, showValue: number }>`
  transform: ${({ showValue, show }) => showValue === 0 ? 'translateY(-10%)' : (show ? 'translateY(5%)' : 'translateY(-90%)')};
  transition: transform 300ms ease-in-out;
`

export default function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
  const lastTrade = useLastTruthy(trade)
  const [showValue, setShowValue] = useState(-1)
  useEffect(() => {
    setShowValue(x => x+1)
  }, [trade])
  return (
    <>
      <AdvancedDetailsFooter show={Boolean(trade)}>
        <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
      </AdvancedDetailsFooter>
      <BannerWrapper show={Boolean(trade)} showValue={showValue}>
        <Banner />
      </BannerWrapper>
      
    </>
  )
}
