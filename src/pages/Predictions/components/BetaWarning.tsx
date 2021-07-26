import React from 'react'
import styled from 'styled-components'
import { useLocation } from 'react-router-dom';

import { AlertTriangle, X } from 'react-feather'

const PhishAlert = styled.div<{ isActive: any }>`
  width: 100%;
  padding: 6px 6px;
  background-color: ${({ theme }) => theme.blue1};
  color: white;
  font-size: 11px;
  justify-content: space-between;
  align-items: center;
  display: ${({ isActive }) => (isActive ? 'flex' : 'none')};
`

export const StyledClose = styled(X)`
  :hover {
    cursor: pointer;
  }
`

export default function BetaWarning() {
  const { pathname } = useLocation();
  const active = pathname === '/prediction'
  return (<PhishAlert isActive={active}>
    <div style={{ display: 'flex' }}>
      <AlertTriangle style={{ marginRight: 6 }} size={12} /> Prediction Market is in BETA, use at your own risk!
    </div>
  </PhishAlert>)


}
