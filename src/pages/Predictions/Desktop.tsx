//@ts-nocheck
import React, { useRef } from 'react'
import styled from 'styled-components'
// import {  Button } from '@pancakeswap/uikit'
import { useGetPredictionsStatus, useIsHistoryPaneOpen } from 'state/hook'
import { PredictionStatus } from 'state/prediction/types'
// import TradingView from './components/TradingView'
import { ErrorNotification, PauseNotification } from './components/Notification'
import History from './History'
import Positions from './Positions'


// const ExpandChartButton = styled(Button)`
//   background-color: ${({ theme }) => theme.card.background};
//   border-bottom-left-radius: 0;
//   border-bottom-right-radius: 0;
//   bottom: 12px;
//   color: ${({ theme }) => theme.colors.text};
//   display: none;
//   left: 32px;
//   position: absolute;
//   z-index: 50;

//   &:hover:not(:disabled):not(.pancake-button--disabled):not(.pancake-button--disabled):not(:active) {
//     background-color: ${({ theme }) => theme.card.background};
//     opacity: 1;
//   }


// `
// ${({ theme }) => theme.mediaWidth.upToLarge} {
//   display: inline-flex;
// }
const SplitWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 12px 0;
  flex: 1;
  overflow: hidden;
`

// const ChartPane = styled.div`
//   overflow: hidden;
//   position: relative;
// `

const HistoryPane = styled.div<{ isHistoryPaneOpen: boolean }>`
  flex: none;
  overflow: hidden;
  transition: width 200ms ease-in-out;
  width: ${({ isHistoryPaneOpen }) => (isHistoryPaneOpen ? '384px' : 0)};
`

const StyledDesktop = styled.div`
  display: flex;
   height: 100%;


`
// ${({ theme }) => theme.mediaWidth.upToLarge} {
//   display: flex;
//   height: 100%;
// }

const PositionPane = styled.div`
  align-items: center;
  display: flex;
  max-width: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  & > div {
    flex: 1;
    overflow: hidden;
  }
`

// const Gutter = styled.div`
// background: ${({ theme }) => theme.advancedBG};
//   cursor: row-resize;
//   height: 12px;
//   position: relative;

//   &:before {
//     background-color: ${({ theme }) => theme.bg3};
//     border-radius: 8px;
//     content: '';
//     height: 4px;
//     left: 50%;
//     margin-left: -32px;
//     position: absolute;
//     top: 4px;
//     width: 64px;
//   }
// `

const Desktop: React.FC = () => {
  const splitWrapperRef = useRef<HTMLDivElement>()
  // const chartRef = useRef<HTMLDivElement>()
  // const gutterRef = useRef<HTMLDivElement>()
  const isHistoryPaneOpen = useIsHistoryPaneOpen()
  const status = useGetPredictionsStatus()

  // const toggleChartPane = () => {
  //   const newChartPaneState = !isChartPaneOpen

  //   // if (newChartPaneState) {
  //   //   splitWrapperRef.current.style.transition = 'grid-template-rows 150ms'
  //   //   splitWrapperRef.current.style.gridTemplateRows = GRID_TEMPLATE_ROW

  //   //   // Purely comedic: We only want to animate if we are clicking the open chart button
  //   //   // If we keep the transition on the resizing becomes very choppy
  //   //   delay(() => {
  //   //     splitWrapperRef.current.style.transition = ''
  //   //   }, 150)
  //   // }


  return (
    <>
      <StyledDesktop>
        <SplitWrapper ref={splitWrapperRef}>
          <PositionPane>
            {status === PredictionStatus.ERROR && <ErrorNotification />}
            {status === PredictionStatus.PAUSED && <PauseNotification />}
            {status === PredictionStatus.LIVE && (
              <>
                <Positions />
              </>
            )}
          </PositionPane>
          {/* <Gutter ref={gutterRef} /> */}
          {/* <ChartPane ref={chartRef}>
            <TradingView />
          </ChartPane> */}
        </SplitWrapper>
        <HistoryPane isHistoryPaneOpen={isHistoryPaneOpen}>
          <History />
        </HistoryPane>
      </StyledDesktop>
    </>
  )
}

export default Desktop
