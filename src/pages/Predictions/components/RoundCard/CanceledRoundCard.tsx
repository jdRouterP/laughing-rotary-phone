import React from 'react'
import { BlockIcon, LinkExternal } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round } from 'state/prediction/types'
import { useGetTotalinterval } from 'state/hook'
import ReclaimPositionButton from '../ReclaimPositionButton'
import useIsRefundable from '../../hooks/useIsRefundable'
import CardHeader from './CardHeader'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise } from 'components/earn/styled'

interface CanceledRoundCardProps {
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

    opacity: 0.7;
    transition: opacity 300ms;
  
    &:hover {
      opacity: 1;
    }
`

const ContentWrapper = styled.div`
    height: 320px;
    z-index: 1;
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

const CanceledRoundCard: React.FC<CanceledRoundCardProps> = ({ round }) => {
  const { t } = useTranslation()
  const interval = useGetTotalinterval()
  const { isRefundable, setIsRefundable } = useIsRefundable(round.epoch)
  const { epoch, startAt } = round
  const estimatedEndTime = startAt + interval

  const handleSuccess = async () => {
    setIsRefundable(false)
  }

  // const EntryTimer = styled.div`
  //     font-size: 30px;
  //     font-weight: bold;
  // `


  return (
    <Wrapper showBackground={false} bgColor={'grey'}>
      <CardBGImage desaturate />
      <CardNoise />
      <CardHeader
        status="canceled"
        icon={<BlockIcon mr="4px" width="21px" />}
        title={t('Canceled')}
        epoch={round.epoch}
        blockTime={estimatedEndTime}
      />
      <ContentWrapper>
        <Content>
          <EntryTitle>
            {t('Round Canceled')}
          </EntryTitle>
          {isRefundable && <ReclaimPositionButton epoch={epoch} onSuccess={handleSuccess} width="100%" my="8px" />}
          <LinkExternal href="https://docs.dfyn.network/" external>
            {t('Learn More')}
          </LinkExternal>
        </Content>
      </ContentWrapper>
    </Wrapper>
  )
}

export default CanceledRoundCard
