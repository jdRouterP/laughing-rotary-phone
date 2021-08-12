
import React, { useEffect, useRef, useState, useContext } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { CloseIcon, IconButton } from '@pancakeswap/uikit'
import { CSSTransition } from 'react-transition-group'
// import { useTranslation } from 'react-i18next'
import { getBetHistory } from 'state/prediction/hooks'
import { useGetPredictionsStatus, useIsHistoryPaneOpen } from 'state/hook'
import { useDispatch } from 'react-redux'
import { setHistoryPaneState } from 'state/prediction/reducer'
import { AutoColumn } from 'components/Column'
import { useActiveWeb3React } from 'hooks'
import { ButtonPrimary } from 'components/Button'
import { GraphContext } from '../PredictionDesktop'


/**
 * @see https://github.com/animate-css/animate.css/tree/main/source
 */
const bounceInKeyframe = keyframes`
  from,
  60%,
  75%,
  90%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  from {
    opacity: 0;
    transform: translate3d(0, 3000px, 0) scaleY(5);
  }

  60% {
    opacity: 1;
    transform: translate3d(0, -20px, 0) scaleY(0.9);
  }

  75% {
    transform: translate3d(0, 10px, 0) scaleY(0.95);
  }

  90% {
    transform: translate3d(0, -5px, 0) scaleY(0.985);
  }

  to {
    transform: translate3d(0, 0, 0);
  }
`

const bounceOutKeyframe = keyframes`
  20% {
    transform: translate3d(0, 10px, 0) scaleY(0.985);
  }

  40%,
  45% {
    opacity: 1;
    transform: translate3d(0, -20px, 0) scaleY(0.9);
  }

  to {
    opacity: 0;
    transform: translate3d(0, 2000px, 0) scaleY(3);
  }
`

const bounceInAnimation = css`
  animation: ${bounceInKeyframe} 1s;
`

const bounceOutAnimation = css`
  animation: ${bounceOutKeyframe} 1s;
`

const Wrapper = styled.div`
  align-items: center;
  bottom: 72px;
  color: #ffffff;
  display: flex;
  justify-content: center;
  left: 0;
  padding-left: 16px;
  padding-right: 16px;
  position: absolute;
  width: 100%;
  z-index: 50;

  &.popup-enter-active {
    ${bounceInAnimation}
  }

  &.popup-enter-done {
    bottom: 72px;
  }

  &.popup-exit-done {
    bottom: -2000px;
  }

  &.popup-exit-active {
    ${bounceOutAnimation}
  }


`

const Popup = styled(AutoColumn)`
background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #021d43 100%);
border-radius: 20px;
padding: 1.5rem;
overflow: hidden;
display: flex;
position: relative;
max-width: 360px;
box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);`

const CollectWinningsPopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const GraphValue = useContext(GraphContext)
  // const { t } = useTranslation()
  const ref = useRef(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const { account } = useActiveWeb3React()
  const predictionStatus = useGetPredictionsStatus()
  const isHistoryPaneOpen = useIsHistoryPaneOpen()
  const dispatch = useDispatch()

  const handleOpenHistory = () => {
    dispatch(setHistoryPaneState(true))
  }

  const handleClick = () => {
    setIsOpen(false)
    if (timer.current) clearInterval(timer.current)
  }

  // Check user's history for unclaimed winners
  useEffect(() => {
    let isCancelled = false
    if (account) {
      timer.current = setInterval(async () => {
        const bets = await getBetHistory(GraphValue, { user: account.toLowerCase(), claimed: false })

        if (!isCancelled) {
          // Filter out bets that were not winners
          const winnerBets = bets.filter((bet) => {
            return bet.position === bet?.round?.position
          })

          if (!isHistoryPaneOpen) {
            setIsOpen(winnerBets.length > 0)
          }
        }
      }, 30000)
    }

    return () => {
      timer.current && clearInterval(timer.current)
      isCancelled = true
    }
  }, [account, timer, predictionStatus, setIsOpen, isHistoryPaneOpen])

  // Any time the history pane is open make sure the popup closes
  useEffect(() => {
    if (isHistoryPaneOpen) {
      setIsOpen(false)
    }
  }, [isHistoryPaneOpen, setIsOpen])

  return (
    <CSSTransition in={isOpen} unmountOnExit nodeRef={ref} timeout={1000} classNames="popup">
      <Wrapper ref={ref}>
        <Popup>

          <ButtonPrimary onClick={handleOpenHistory}>
            {'Collect Winnings'}
          </ButtonPrimary>
          <IconButton variant="text" onClick={handleClick}>
            <CloseIcon color="primary" width="24px" />
          </IconButton>
        </Popup>
      </Wrapper>
    </CSSTransition>
  )
}

export default CollectWinningsPopup
