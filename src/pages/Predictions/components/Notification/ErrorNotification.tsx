import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { setHistoryPaneState } from 'state/prediction/reducer'
import Notification from './Notification'
import { Button, TYPE } from 'theme'

const ErrorNotification = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const handleOpenHistory = () => {
    dispatch(setHistoryPaneState(true))
  }
  return (
    <Notification title={t('Error')}>
      <TYPE.body mb='10px'>
        {t('This page can’t be displayed right now due to an error. Please check back soon.')}
      </TYPE.body>
      <Button onClick={handleOpenHistory}>
        {t('Show History')}
      </Button>
    </Notification>
  )
}

export default ErrorNotification
