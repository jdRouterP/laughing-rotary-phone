
import React, { useState } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { PlayCircleOutlineIcon, useTooltip } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
// import { useDispatch } from 'react-redux'
import { BetPosition, Round } from 'state/prediction/types'
import { useGetinterval } from 'state/hook'
// import { markPositionAsEntered } from 'state/prediction/reducer'
import { formatToken } from '../../helpers'
import { RoundResultBox, PrizePoolRow } from '../RoundResult'
import MultiplierArrow from './MultiplierArrow'
import CardHeader from './CardHeader'
import PositionModal from './PositionModal'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
// import { CardBGImage, CardNoise } from 'components/earn/styled'
import { AutoColumn } from 'components/Column'
import { ButtonBull, ButtonBear, ButtonError } from 'components/Button'
import { useIsDarkMode } from 'state/user/hooks'

interface OpenRoundCardProps {
  round: Round
  betAmount?: number
  hasEnteredUp: boolean
  hasEnteredDown: boolean
  bullMultiplier: number
  bearMultiplier: number
}

interface State {
  isSettingPosition: boolean
  position: BetPosition
}



const CardHeaderBlock = styled.div`
  margin-top: 23px;
  width: 206px;
  padding-top: 30px;
  padding-bottom: 41px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
  border-radius: 10px 10px 0px 0px; 
`
const CardFooterBlock = styled.div`
  margin-bottom: 23px;
  width: 206px;
  padding-top: 37px;
  padding-bottom: 30px;
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
  box-shadow: 0px 0px 24px rgb(0 0 0 / 10%);
  border-radius: 15px;
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;
  transition: z-index 600ms;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const ContentWrapper = styled.div`
    // height: 320px;
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    // justify-content: space-evenly;
`

const OpenRoundCard: React.FC<OpenRoundCardProps> = ({
  round,
  betAmount = 0,
  hasEnteredUp,
  hasEnteredDown,
  bullMultiplier,
  bearMultiplier,
}) => {
  const [state, setState] = useState<State>({
    isSettingPosition: false,
    position: BetPosition.BULL,
  })
  const { t } = useTranslation()
  const interval = useGetinterval()
  const { account } = useWeb3React()
  // const dispatch = useDispatch()
  const currentTimestamp = useCurrentBlockTimestamp()
  const { isSettingPosition, position } = state
  const isBufferPhase = currentTimestamp && currentTimestamp.toNumber() >= round.startAt + interval
  const positionDisplay = hasEnteredUp ? t('BULL').toUpperCase() : t('BEAR').toUpperCase()

  const { targetRef, tooltipVisible, tooltip } = useTooltip(
    <div style={{ whiteSpace: 'nowrap' }}>{`${formatToken(betAmount)} MATIC`}</div>,
    { placement: 'top' },
  )

  // Bettable rounds do not have an lockBlock set so we approximate it by adding the block interval
  // to the start block
  const estimatedLockTime = round.startAt + interval

  const getCanEnterPosition = () => {
    if (hasEnteredUp || hasEnteredDown) {
      return false
    }

    if (round.lockPrice !== null) {
      return false
    }

    return true
  }

  const canEnterPosition = getCanEnterPosition()

  const handleBack = () =>
    setState((prevState) => ({
      ...prevState,
      isSettingPosition: false,
    }))

  const handleSetPosition = (newPosition: BetPosition) => {
    setState((prevState) => ({
      ...prevState,
      isSettingPosition: true,
      position: newPosition,
    }))
  }

  const togglePosition = () => {
    setState((prevState) => ({
      ...prevState,
      position: prevState.position === BetPosition.BULL ? BetPosition.BEAR : BetPosition.BULL,
    }))
  }

  const handleSuccess = async (decimalValue: string, hash: string) => {
    // Optimistically set the user bet so we see the entered position immediately.
    if (!!!account) return
    // let decimalValueBN: JSBI;
    // if (!(decimalValue instanceof JSBI)) {
    //   decimalValueBN = JSBI.BigInt(decimalValue);
    // }
    // else {
    //   decimalValueBN = decimalValue;
    // }
    // dispatch(
    //   markPositionAsEntered({
    //     account,
    //     roundId: round.id,
    //     bet: {
    //       hash,
    //       round,
    //       position,
    //       amount: parseFloat(decimalValue),
    //       claimed: false,
    //       claimedHash: null,
    //     },
    //   }),
    // )

    handleBack()

    // toastSuccess(
    //   t('Success!'),
    //   t('%position% position entered', {
    //     position: positionDisplay,
    //   }),
    // )
  }

  // const getPositionEnteredIcon = () => {
  //   return position === BetPosition.BULL ? <ArrowUpIcon color="currentColor" /> : <ArrowDownIcon color="currentColor" />
  // }

  const darkMode = useIsDarkMode()
  
  return (
    <Wrapper showBackground={false} bgColor={'blue'} darkMode={darkMode}>
      {/* <CardBGImage desaturate />
      <CardNoise /> */}
      <CardHeader
        status="next"
        epoch={round.epoch}
        blockTime={estimatedLockTime}
        icon={<PlayCircleOutlineIcon color="#DD3679" mr="4px" width="21px" />}
        title={t('Next')}
      />
      <ContentWrapper>
        <CardHeaderBlock>
          <MultiplierArrow betAmount={betAmount} multiplier={bullMultiplier} hasEntered={hasEnteredUp} />
        </CardHeaderBlock>
        <RoundResultBox round={round} isNext={true} isLive={!canEnterPosition}>
          {canEnterPosition ? (
            <>
              <PrizePoolRow totalAmount={round.totalAmount} />
              <ButtonBull
                mt="8px"
                padding="10px"
                variant="success"
                width="200px"
                onClick={() => handleSetPosition(BetPosition.BULL)}
                mb="4px"
                disabled={!canEnterPosition || isBufferPhase}
              >
                {t('Bet BULL')}
              </ButtonBull>
              <ButtonBear
                padding="10px"
                variant="danger"
                width="200px"
                onClick={() => handleSetPosition(BetPosition.BEAR)}
                disabled={!canEnterPosition || isBufferPhase}
              >
                {t('Bet BEAR')}
              </ButtonBear>
            </>
          ) : (
            <>
              <div ref={targetRef}>
                <ButtonError disabled width="100%" mb="8px">
                  {`${positionDisplay} Entered`}
                </ButtonError>
              </div>
              <PrizePoolRow totalAmount={round.totalAmount} />
              {tooltipVisible && tooltip}
            </>
          )}
        </RoundResultBox>
        <CardFooterBlock>
          <MultiplierArrow
            betAmount={betAmount}
            multiplier={bearMultiplier}
            betPosition={BetPosition.BEAR}
            hasEntered={hasEnteredDown}
          />
        </CardFooterBlock>
      </ContentWrapper>

      <PositionModal
        isOpen={isSettingPosition}
        onDismiss={handleBack}
        onSuccess={handleSuccess}
        position={position}
        togglePosition={togglePosition}
      />
    </Wrapper>
  )
}

export default OpenRoundCard
