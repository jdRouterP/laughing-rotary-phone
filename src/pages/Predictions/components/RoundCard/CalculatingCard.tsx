import React from 'react'
import { Flex, WaitIcon, TooltipText, Text, useTooltip, InfoIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round } from 'state/prediction/types'
import { useGetTotalinterval } from 'state/hook'
import CardHeader from './CardHeader'
import styled from 'styled-components'

interface CalculatingCardProps {
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

const CalculatingCard: React.FC<CalculatingCardProps> = ({ round }) => {
  const { t } = useTranslation()
  const interval = useGetTotalinterval()
  const estimatedEndTime = round.startAt + interval
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This round’s closing transaction has been submitted to the blockchain, and is awaiting confirmation.'),
    { placement: 'bottom' },
  )

  return (
    <>
      <Wrapper>
        <CardHeader
          status="calculating"
          icon={<WaitIcon mr="4px" width="21px" />}
          title={t('Calculating')}
          epoch={round.epoch}
          blockTime={estimatedEndTime}
        />
        <ContentWrapper>
          <Payout>
            <PayoutLabel>
              UP
            </PayoutLabel>
          </Payout>
          {/* <RoundResultBox>
            <Flex alignItems="center" justifyContent="center" flexDirection="column">
              <Text>Loading..</Text>
              <Flex mt="8px" ref={targetRef}>
                <TooltipText>{t('Calculating')}</TooltipText>
                <InfoIcon ml="4px" />
              </Flex>
            </Flex>
          </RoundResultBox> */}
          <Content>
            <Flex alignItems="center" justifyContent="center" flexDirection="column">
              <Text>Loading..</Text>
              <Flex mt="8px" ref={targetRef}>
                <TooltipText>{t('Calculating')}</TooltipText>
                <InfoIcon ml="4px" />
              </Flex>
            </Flex>
          </Content>
          <Payout>
            <PayoutLabel>
              DOWN
            </PayoutLabel>
          </Payout>
        </ContentWrapper>
      </Wrapper>
      {tooltipVisible && tooltip}
    </>
  )
}

export default CalculatingCard
