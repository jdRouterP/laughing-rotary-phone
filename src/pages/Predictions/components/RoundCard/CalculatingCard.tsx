import React from 'react'
import { Flex, WaitIcon, TooltipText, Text, useTooltip, InfoIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round } from 'state/prediction/types'
import { useGetTotalinterval } from 'state/hook'
import CardHeader from './CardHeader'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
// import { CardBGImage, CardNoise } from 'components/earn/styled'

interface CalculatingCardProps {
  round: Round
}

const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: linear-gradient(180deg, #2D3646 0%, #2C2F35 216.76%);
  border: 1px solid #575A68;
  box-sizing: border-box;
  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
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
    padding: 50px;
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
        {/* <CardBGImage desaturate />
        <CardNoise /> */}
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
              BULL
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
              BEAR
            </PayoutLabel>
          </Payout>
        </ContentWrapper>
      </Wrapper>
      {tooltipVisible && tooltip}
    </>
  )
}

export default CalculatingCard
