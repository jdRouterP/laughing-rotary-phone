import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { AutoRenewIcon } from '@pancakeswap/uikit'
import { useDispatch } from 'react-redux'
import { setHistoryPaneState } from 'state/prediction/reducer'
import { useGetIsFetchingHistory, useGetPredictionsStatus, useIsHistoryPaneOpen } from 'state/hook'
import styled from 'styled-components'
import { getBetHistory } from 'state/prediction/hooks'
import { User } from 'react-feather'



const NotificationIcon = styled.div`
  position: absolute;
  top: -0px;
  right: -3px;
  padding: 5px 5px;
  border-radius: 50%;
  background: red;
  color: white;
`

export const StyledMenuButton = styled.button`
  position: relative;
  border: none;
  background-color: transparent;
  width: 55px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  
  ${({ theme }) => theme.mediaWidth.upToSmall`
      position: relative;
      man-width: 55px;
      height: 55px;
      padding: 0px;
      margin-left: 5px;
  `};

  :hover:not(:disabled),
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
  const isHistoryPaneOpen = useIsHistoryPaneOpen()
  const [show, setShow] = useState(false)
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  const predictionStatus = useGetPredictionsStatus()

  const handleClick = () => {
    dispatch(setHistoryPaneState(true))
  }

  useEffect(() => {
    let isCancelled = false

    const getBets = async () => {

      if (account && isHistoryPaneOpen) {

        const bets = await getBetHistory({ user: account.toLowerCase(), claimed: false })

        if (!isCancelled) {
          // Filter out bets that were not winners
          const winnerBets = bets.filter((bet) => {
            return bet.position === bet?.round?.position || bet?.round?.failed
          })
          setShow(winnerBets.length > 0)
        }

      }
    }

    getBets();

    return () => {

      isCancelled = true
    }
  }, [account, predictionStatus, setShow, isHistoryPaneOpen])

  return (
    <StyledMenuButton onClick={handleClick} disabled={!account}>
      {show ? <NotificationIcon /> : ''}

      {isFetchingHistory ? <AutoRenewIcon spin color="white" /> : <User width="24px" color="white" />}
    </StyledMenuButton>
  )
}

export default HistoryButton
