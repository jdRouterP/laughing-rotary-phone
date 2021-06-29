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
        <TYPE.subHeader style={{ textAlign: 'center' }}>
          Prediction markets have been paused due to an error.
        </TYPE.subHeader>
        <TYPE.small style={{ textAlign: 'center' }}>
          All open positions have been cancelled.
        </TYPE.small>
        <TYPE.small style={{ textAlign: 'center' }}>
          You can reclaim any funds entered into existing positions via the History tab on this page.
        </TYPE.small>

      </div>
      <Button onClick={handleOpenHistory}>
        {t('Show History')}
      </Button>
    </Notification>
  )
}

export default PauseNotification
