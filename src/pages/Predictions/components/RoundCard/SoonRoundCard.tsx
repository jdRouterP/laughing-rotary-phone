import React from 'react'
import { WaitIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round } from 'state/prediction/types'
import { useGetCurrentEpoch, useGetTotalinterval } from 'state/hook'
import { formatRoundTime } from '../../helpers'
import useRoundCountdown from '../../hooks/useRoundCountdown'
import CardHeader from './CardHeader'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise } from 'components/earn/styled'

interface SoonRoundCardProps {
  round: Round
}

const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${showBackground ? theme.black : theme.bg5} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}

    

`

const ContentWrapper = styled.div`
    height: 320px;
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const Content = styled.div`
    width: 250px;
    height: 120px;
    border: 3px solid white;
    border-radius: 12px;
    padding: 20px 15px;
    display:grid;
    place-items: center;
    margin: 20px 0;
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
    <Wrapper showBackground={false} bgColor={"#2989A5"}>
      <CardBGImage desaturate />
      <CardNoise />
      <CardHeader
        status="upcoming"
        icon={<WaitIcon mr="4px" width="21px" />}
        title={t('Later')}
        epoch={round.epoch}
        blockTime={estimatedEndTime}
      />
      <ContentWrapper>
        <Content>
          <EntryTitle>
            Entry Starting in
          </EntryTitle>
          <EntryTimer>
            {`~${countdown}`}
          </EntryTimer>
        </Content>
      </ContentWrapper>
    </Wrapper>
  )
}

export default SoonRoundCard
