import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { AutoRenewIcon, HistoryIcon } from '@pancakeswap/uikit'
import { useDispatch } from 'react-redux'
import { setHistoryPaneState } from 'state/prediction/reducer'
import { useGetIsFetchingHistory } from 'state/hook'
import styled from 'styled-components'

export const StyledMenuButton = styled.button`
  position: relative;

  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  width: 55px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`
const HistoryButton = () => {
  const isFetchingHistory = useGetIsFetchingHistory()
  const dispatch = useDispatch()
  const { account } = useWeb3React()

  const handleClick = () => {
    dispatch(setHistoryPaneState(true))
  }

  return (
    <StyledMenuButton onClick={handleClick} disabled={!account}>
      {isFetchingHistory ? <AutoRenewIcon spin color="white" /> : <HistoryIcon width="24px" color="white" />}
    </StyledMenuButton>
  )
}

export default HistoryButton
