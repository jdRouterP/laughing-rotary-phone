import React from 'react'
import { BlockIcon, LinkExternal } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round } from 'state/prediction/types'
import { useGetTotalinterval } from 'state/hook'
import ReclaimPositionButton from '../ReclaimPositionButton'
import useIsRefundable from '../../hooks/useIsRefundable'
import CardHeader from './CardHeader'
import styled from 'styled-components'

interface CanceledRoundCardProps {
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
    <Wrapper>
      <CardHeader
        status="canceled"
        icon={<BlockIcon mr="4px" width="21px" />}
        title={t('Canceled')}
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
            {t('Round Canceled')}
          </EntryTitle>
          {isRefundable && <ReclaimPositionButton epoch={epoch} onSuccess={handleSuccess} width="100%" my="8px" />}
          <LinkExternal href="https://docs.pancakeswap.finance/products/prediction" external>
            {t('Learn More')}
          </LinkExternal>
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

export default CanceledRoundCard
