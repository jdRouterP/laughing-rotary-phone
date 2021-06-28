import React from 'react'
import { WaitIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round } from 'state/prediction/types'
import { useGetCurrentEpoch, useGetTotalinterval } from 'state/hook'
import { formatRoundTime } from '../../helpers'
import useRoundCountdown from '../../hooks/useRoundCountdown'
import CardHeader from './CardHeader'
import styled from 'styled-components'

interface SoonRoundCardProps {
  round: Round
}

const Wrapper = styled.div`
    margin: 0 20px;
`

const ContentWrapper = styled.div`
    width: 280px;
    height: 280px;
    border: 1px solid red;
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const Content = styled.div`
    width: 250px;
    height: 120px;
    border: 1px solid pink;
    border-radius: 12px;
    padding: 20px 15px;
    display:grid;
    place-items: center;
    margin: 20px 0;
`

const Payout = styled.div`
    display: grid;
    place-items: center;
`

const PayoutLabel = styled.div`
    font-size: 20px;
    font-weight: bold;
`

const EntryTitle = styled.div`
    font-size: 16px;
    font-weight: bold;
`
const EntryTimer = styled.div`
    font-size: 30px;
    font-weight: bold;
`

const SoonRoundCard: React.FC<SoonRoundCardProps> = ({ round }) => {
  const { t } = useTranslation()
  const interval = useGetTotalinterval()
  const currentEpoch = useGetCurrentEpoch()
  const estimatedEndTime = round.startAt + interval
  const seconds = useRoundCountdown(round.epoch - currentEpoch + 1)
  const countdown = formatRoundTime(seconds)

  return (
    <Wrapper>
      <CardHeader
        status="soon"
        icon={<WaitIcon mr="4px" width="21px" />}
        title={t('Later')}
        epoch={round.epoch}
        blockTime={estimatedEndTime}
      />
      <ContentWrapper>
        <Payout>
          <PayoutLabel>
            UP
          </PayoutLabel>
        </Payout>
        <Content>
          <EntryTitle>
            Entry Starting in
          </EntryTitle>
          <EntryTimer>
            {`~${countdown}`}
          </EntryTimer>
        </Content>
        <Payout>
          <PayoutLabel>
            DOWN
          </PayoutLabel>
        </Payout>
      </ContentWrapper>
    </Wrapper>
  )
}

export default SoonRoundCard
