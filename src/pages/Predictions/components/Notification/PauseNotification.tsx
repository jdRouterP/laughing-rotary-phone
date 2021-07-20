import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { setHistoryPaneState } from 'state/prediction/reducer'
import { Button, TYPE } from 'theme'
import Notification from './Notification'

const PauseNotification = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const handleOpenHistory = () => {
    dispatch(setHistoryPaneState(true))
  }

  return (
    <Notification title={t('Markets Paused')}>
      <div>
        <TYPE.body mb='10px' style={{ textAlign: 'start' }}>
          Prediction markets have been paused due to an error.
        </TYPE.body>
        <TYPE.italic style={{ textAlign: 'start' }}>
          All open positions have been cancelled. You can reclaim any funds entered into existing positions via the History tab on this page.
        </TYPE.italic>
      </div>
      <Button onClick={handleOpenHistory} style={{ marginTop: '15px' }}>
        {t('Show History')}
      </Button>
    </Notification>
  )
}

export default PauseNotification
