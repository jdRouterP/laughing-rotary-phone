import React from 'react'
import { CardBody, Text, WaitIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round, BetPosition } from 'state/prediction/types'
import { useGetCurrentEpoch, useGetTotalinterval } from 'state/hook'
import { formatRoundTime } from '../../helpers'
import useRoundCountdown from '../../hooks/useRoundCountdown'
import { RoundResultBox } from '../RoundResult'
import MultiplierArrow from './MultiplierArrow'
import Card from './Card'
import CardHeader from './CardHeader'

interface SoonRoundCardProps {
  round: Round
}

const SoonRoundCard: React.FC<SoonRoundCardProps> = ({ round }) => {
  const { t } = useTranslation()
  const interval = useGetTotalinterval()
  const currentEpoch = useGetCurrentEpoch()
  const estimatedEndBlock = round.startBlock + interval
  const seconds = useRoundCountdown(round.epoch - currentEpoch + 1)
  const countdown = formatRoundTime(seconds)

  return (
    <Card>
      <CardHeader
        status="soon"
        icon={<WaitIcon mr="4px" width="21px" />}
        title={t('Later')}
        epoch={round.epoch}
        blockNumber={estimatedEndBlock}
      />
      <CardBody p="16px">
        <MultiplierArrow isDisabled />
        <RoundResultBox>
          <Text textAlign="center">
            <Text bold>{t('Entry starts')}</Text>
            <Text fontSize="24px" bold>
              {`~${countdown}`}
            </Text>
          </Text>
        </RoundResultBox>
        <MultiplierArrow betPosition={BetPosition.BEAR} isDisabled />
      </CardBody>
    </Card>
  )
}

export default SoonRoundCard
