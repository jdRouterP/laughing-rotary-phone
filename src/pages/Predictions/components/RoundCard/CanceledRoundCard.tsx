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
import { useIsDarkMode } from 'state/user/hooks'
// import { CardBGImage, CardNoise } from 'components/earn/styled'

interface CanceledRoundCardProps {
  round: Round
}

const CardHeaderBlock = styled.div`
  text-align: center;
  margin-top: 25px;
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
  border: ${({darkMode}) => darkMode ? '' : '1px solid #C3C5CB'};
  width: 100%;
  overflow: hidden;
  position: relative;
  background: ${({ theme }) => theme.bg9};
  // border: 1px solid #575A68;
  box-sizing: border-box;
  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
  order-radius: 15px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
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
    z-index: 1;
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
    padding: 59px;
    display:grid;
    place-items: center;
`
const EntryTitle = styled.div`
    font-size: 16px;
    font-weight: bold;
    color: 
`

const CanceledRoundCard: React.FC<CanceledRoundCardProps> = ({ round }) => {
  const { t } = useTranslation()
  const interval = useGetTotalinterval()
  const { isRefundable, setIsRefundable } = useIsRefundable(round.epoch)
  const { epoch, startAt } = round
  const estimatedEndTime = startAt + interval

  const darkMode = useIsDarkMode()

  const handleSuccess = async () => {
    setIsRefundable(false)
  }

  // const EntryTimer = styled.div`
  //     font-size: 30px;
  //     font-weight: bold;
  // `


  return (
    <Wrapper showBackground={false} bgColor={'grey'} darkMode={darkMode}>
      {/* <CardBGImage desaturate /> */}
      {/* <CardNoise /> */}
      <CardHeader
        status="canceled"
        icon={<BlockIcon mr="4px" width="21px" color='#CED0D9' />}
        title={t('Canceled')}
        epoch={round.epoch}
        blockTime={estimatedEndTime}
      />
      <ContentWrapper>
        <CardHeaderBlock>
          <h3 style={{ fontWeight: "normal", color: "text2" }}>BULL</h3>
        </CardHeaderBlock>
        <Content>
          <EntryTitle style={{color: darkMode ? '#FFFFFF' : "#ff007a"}}>
            {t('Round Canceled')}
          </EntryTitle>
          {isRefundable && <ReclaimPositionButton epoch={epoch} onSuccess={handleSuccess} width="100%" my="8px" />}
          <LinkExternal href="https://docs.dfyn.network/" external>
            {t('Learn More')}
          </LinkExternal>
        </Content>
        <CardFooterBlock>
          <h3 style={{ fontWeight: "normal", color: "text2" }}>BEAR</h3>
        </CardFooterBlock>
      </ContentWrapper>
    </Wrapper>
  )
}

export default CanceledRoundCard
