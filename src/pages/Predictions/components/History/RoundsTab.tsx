import React from 'react'
import { orderBy } from 'lodash'
// import { Box } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Bet } from 'state/prediction/types'
import HistoricalBet from './HistoricalBet'
import { TYPE } from 'theme'

interface RoundsTabProps {
  hasBetHistory: boolean
  bets: Bet[]
}

const RoundsTab: React.FC<RoundsTabProps> = ({ hasBetHistory, bets }) => {
  const { t } = useTranslation()
  return hasBetHistory ? (
    <>
      {orderBy(bets, ['round.epoch'], ['desc']).map((bet) => (
        <HistoricalBet key={bet.id} bet={bet} />
      ))}
    </>
  ) : (
    <div>
      <TYPE.largeHeader textAlign="center" >
        {t('No prediction history available')}
      </TYPE.largeHeader>
      <TYPE.main as="p" textAlign="center">
        {t(
          'If you are sure you should see history here, make sure you’re connected to the correct wallet and try again.',
        )}
      </TYPE.main>
    </div>
  )
}

export default RoundsTab
