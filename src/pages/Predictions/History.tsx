import React, { useEffect, useState } from 'react'
import { Flex } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { fetchHistory, setHistoryPaneState } from 'state/prediction/reducer'
import { getUnclaimedWinningBets } from 'state/prediction/hooks'
import { HistoryFilter } from 'state/prediction/types'
import { useDispatch } from 'react-redux'
import {
  useGetCurrentEpoch,
  useGetHistoryByAccount,
  useGetHistoryFilter,
  useGetIsFetchingHistory,
  useIsHistoryPaneOpen,
} from 'state/hook'
import { Header, HistoryTabs } from './components/History'
import RoundsTab from './components/History/RoundsTab'
import PnlTab from './components/History/PnlTab/PnlTab'
import Modal from 'components/Modal'
import { TYPE } from 'theme'

// const StyledHistory = styled.div`
//   background-color: 'white'
//   display: flex;
//   flex-direction: column;
//   height: 100%;
// `

const BetWrapper = styled.div`
  margin: 0px auto;
  width: 90%;
  // background-color: ${({ theme }) => theme.bg7};
  border-radius: 10px;
  flex: 1;
  height: 100%;
  overflow-y: auto;
  position: relative;
`

const SpinnerWrapper = styled.div`
  align-items: center;
  display: flex;
  left: 0;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
`

const History = () => {
  const { account } = useWeb3React()
  const dispatch = useDispatch()
  const isHistoryPaneOpen = useIsHistoryPaneOpen()
  const isFetchingHistory = useGetIsFetchingHistory()
  const historyFilter = useGetHistoryFilter()
  const currentEpoch = useGetCurrentEpoch()
  const { t } = useTranslation()
  const bets = useGetHistoryByAccount(account) ?? []
  const [activeTab, setActiveTab] = useState(HistoryTabs.ROUNDS)

  useEffect(() => {
    if (account && isHistoryPaneOpen) {
      dispatch(fetchHistory({ account }))
    }
  }, [account, currentEpoch, isHistoryPaneOpen, dispatch])

  // Currently the api cannot filter by unclaimed AND won so we do it here
  // when the user has selected Uncollected only include positions they won
  const results = historyFilter === HistoryFilter.UNCOLLECTED ? getUnclaimedWinningBets(bets) : bets
  const hasBetHistory = results && results.length > 0

  let activeTabComponent = null
  switch (activeTab) {
    case HistoryTabs.PNL:
      activeTabComponent = <PnlTab hasBetHistory={hasBetHistory} bets={results} />
      break
    case HistoryTabs.ROUNDS:
    default:
      activeTabComponent = <RoundsTab hasBetHistory={hasBetHistory} bets={results} />
      break
  }

  if (!account) {
    activeTabComponent = (
      <Flex justifyContent="center" alignItems="center" flexDirection="column" mt="32px">
        <TYPE.main mt="8px">{t('Connect your wallet to view your prediction history')}</TYPE.main>
      </Flex>
    )
  }
  const handleClick = () => {
    dispatch(setHistoryPaneState(!isHistoryPaneOpen))
  }
  return (
    <Modal flexdirection='column' minHeight={70} isOpen={isHistoryPaneOpen} onDismiss={handleClick}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <BetWrapper>
        {isFetchingHistory ? (
          <SpinnerWrapper>
            <TYPE.main>Loading...</TYPE.main>
          </SpinnerWrapper>
        ) : (
          activeTabComponent
        )}
      </BetWrapper>
    </Modal>
  )
}

export default History
