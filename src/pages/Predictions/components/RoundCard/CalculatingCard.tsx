import React from 'react'
import { Flex, WaitIcon, useTooltip, InfoIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round } from 'state/prediction/types'
import { useGetTotalinterval } from 'state/hook'
import CardHeader from './CardHeader'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { useIsDarkMode } from 'state/user/hooks'
import { TYPE } from 'theme'
// import { CardBGImage, CardNoise } from 'components/earn/styled'

interface CalculatingCardProps {
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

const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any; darkMode: boolean }>`
  border-radius: 12px;
  border: ${({ darkMode }) => darkMode ? '' : '1px solid #C3C5CB'};
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
  padding: 56px;
  display:grid;
  place-items: center;
`


const CalculatingCard: React.FC<CalculatingCardProps> = ({ round }) => {
  const { t } = useTranslation()
  const interval = useGetTotalinterval()
  const estimatedEndTime = round.startAt + interval
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This round???s closing transaction has been submitted to the blockchain, and is awaiting confirmation.'),
    { placement: 'bottom' },
  )

  const darkMode = useIsDarkMode()

  return (
    <>
      <Wrapper showBackground={false} bgColor={'grey'} darkMode={darkMode}>
        {/* <CardBGImage desaturate />
        <CardNoise /> */}
        <CardHeader
          status="calculating"
          icon={<WaitIcon mr="4px" width="21px" color="#CED0D9" />}
          title={t('Calculating')}
          epoch={round.epoch}
          blockTime={estimatedEndTime}
        />
        <ContentWrapper>
          <CardHeaderBlock>
            <h3 style={{ fontWeight: "normal", color: "text2" }}>BULL</h3>
          </CardHeaderBlock>
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
              <TYPE.main style={{ color: "text2" }}>Loading..</TYPE.main>
              <Flex mt="8px" ref={targetRef}>
                <TYPE.main style={{ color: darkMode ? '#FFFFFF' : "#ff007a" }}>{t('Calculating')}</TYPE.main>
                <InfoIcon ml="4px" />
              </Flex>
            </Flex>
          </Content>
          <CardFooterBlock>
            <h3 style={{ fontWeight: "normal", color: "text2" }}>BEAR</h3>
          </CardFooterBlock>
        </ContentWrapper>
      </Wrapper>
      {tooltipVisible && tooltip}
    </>
  )
}

export default CalculatingCard
