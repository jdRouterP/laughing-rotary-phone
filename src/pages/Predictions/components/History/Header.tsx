import React from 'react'
import { useWeb3React } from '@web3-react/core'
import {
  Box,
  Radio,
  Flex,
  ButtonMenu,
  ButtonMenuItem,
} from '@pancakeswap/uikit'
import { useDispatch } from 'react-redux'
import { HistoryFilter } from 'state/prediction/types'
import { setHistoryFilter, setHistoryPaneState, fetchHistory } from 'state/prediction/reducer'
import { useGetHistoryFilter, useGetIsFetchingHistory } from 'state/hook'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { TYPE, CloseIcon } from 'theme'

const Filter = styled.label`
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  margin-right: 16px;
`

const StyledHeader = styled(Box)`
  flex: none;
  padding: 18px;
`

const ButtonMenuContainer = styled.div`
  width: 100%;
  margin-bottom: 15px;
  & > div {
    width: 100%;
  }

  & button {
    width: 100%;
  }
`

const getClaimParam = (historyFilter: HistoryFilter) => {
  switch (historyFilter) {
    case HistoryFilter.COLLECTED:
      return true
    case HistoryFilter.UNCOLLECTED:
      return false
    case HistoryFilter.ALL:
    default:
      return undefined
  }
}

interface HeaderProps {
  activeTab: HistoryTabs
  setActiveTab: (value: HistoryTabs) => void
}

export enum HistoryTabs {
  ROUNDS,
  PNL,
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const historyFilter = useGetHistoryFilter()
  const isFetchingHistory = useGetIsFetchingHistory()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { account } = useWeb3React()

  const handleClick = () => {
    dispatch(setHistoryPaneState(false))
  }

  const handleChange = (newFilter: HistoryFilter) => async () => {
    if (newFilter !== historyFilter && account) {
      dispatch(fetchHistory({ account, claimed: getClaimParam(newFilter) }))
      dispatch(setHistoryFilter(newFilter))
    }
  }

  const switchTab = async (tabIndex: number) => {
    setActiveTab(tabIndex)
    await handleChange(HistoryFilter.ALL)()
  }

  return (
    <StyledHeader>
      <Flex alignItems="center" justifyContent="space-between" mb="16px">
        <TYPE.mediumHeader>
          {t('History')}
        </TYPE.mediumHeader>
        <CloseIcon onClick={handleClick} />
      </Flex>
      <ButtonMenuContainer>
        <ButtonMenu activeIndex={activeTab} scale="sm" variant="subtle" onItemClick={switchTab}>
          <ButtonMenuItem>{t('Rounds')}</ButtonMenuItem>
          <ButtonMenuItem>{t('PNL')}</ButtonMenuItem>
        </ButtonMenu>
      </ButtonMenuContainer>
      {activeTab === HistoryTabs.ROUNDS && (
        <>
          <TYPE.main color="textSubtle" fontSize="16px" mb="10px">
            {t('Filter')}
          </TYPE.main>
          <Flex alignItems="center">
            <Filter>
              <Radio
                scale="sm"
                checked={historyFilter === HistoryFilter.ALL}
                disabled={isFetchingHistory || !account}
                onChange={handleChange(HistoryFilter.ALL)}
              />
              <TYPE.main color="textSubtle" ml="4px">{t('All')}</TYPE.main>
            </Filter>
            <Filter>
              <Radio
                scale="sm"
                checked={historyFilter === HistoryFilter.COLLECTED}
                disabled={isFetchingHistory || !account}
                onChange={handleChange(HistoryFilter.COLLECTED)}
              />
              <TYPE.main color="textSubtle" ml="4px">{t('Collected')}</TYPE.main>
            </Filter>
            <Filter>
              <Radio
                scale="sm"
                checked={historyFilter === HistoryFilter.UNCOLLECTED}
                disabled={isFetchingHistory || !account}
                onChange={handleChange(HistoryFilter.UNCOLLECTED)}
              />
              <TYPE.main color="textSubtle" ml="4px">{t('Uncollected')}</TYPE.main>
            </Filter>
          </Flex>
        </>
      )}
    </StyledHeader>
  )
}

export default Header
