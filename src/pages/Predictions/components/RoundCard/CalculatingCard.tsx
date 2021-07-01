import React from 'react'
import { Flex, WaitIcon, TooltipText, Text, useTooltip, InfoIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round } from 'state/prediction/types'
import { useGetTotalinterval } from 'state/hook'
import CardHeader from './CardHeader'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise } from 'components/earn/styled'

interface CalculatingCardProps {
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
      <Wrapper showBackground={false} bgColor={'grey'}>
        <CardBGImage desaturate />
        <CardNoise />
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
