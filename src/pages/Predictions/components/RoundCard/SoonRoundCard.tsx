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
// import { CardBGImage, CardNoise } from 'components/earn/styled'

interface SoonRoundCardProps {
  round: Round
}


const CardHeaderBlock = styled.div`
  text-align: center;
  margin-top: 30px;
  width: 206px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
  border-radius: 10px 10px 0px 0px; 
`
const CardFooterBlock = styled.div`
  text-align: center; 
  margin-bottom: 23px;
  width: 206px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
  border-radius: 0px 0px 10px 10px;
`

const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme }) => theme.bg9};
  // border: 1px solid #575A68;
  box-sizing: border-box;
  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}

    

`

const ContentWrapper = styled.div`
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const Content = styled.div`
    width: 250px;
    border: 1px solid #575A68;
    box-sizing: border-box;
    border-radius: 10px;
    padding: 56px;
    display:grid;
    place-items: center;
`

const EntryTitle = styled.div`
    font-size: 16px;
    font-weight: bold;
    color: ${({ theme }) => theme.text2};
`
const EntryTimer = styled.div`
    font-size: 30px;
    font-weight: bold;
    color: ${({ theme }) => theme.text2};
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
      {/* <CardBGImage desaturate />
      <CardNoise /> */}
      <CardHeader
        status="upcoming"
        icon={<WaitIcon mr="4px" width="21px" color='#CED0D9' />}
        title={t('Later')}
        epoch={round.epoch}
        blockTime={estimatedEndTime}
      />
      <ContentWrapper>
        <CardHeaderBlock>
          <h3 style={{ fontWeight: "normal", color: "text2" }}>BULL</h3>
        </CardHeaderBlock>
        <Content>
          <EntryTitle>
            Entry Starting in
          </EntryTitle>
          <EntryTimer>
            {`~${countdown}`}
          </EntryTimer>
        </Content>
        <CardFooterBlock>
          <h3 style={{ fontWeight: "normal", color: "text2" }}>BEAR</h3>
        </CardFooterBlock>
      </ContentWrapper>
    </Wrapper>
  )
}

export default SoonRoundCard
