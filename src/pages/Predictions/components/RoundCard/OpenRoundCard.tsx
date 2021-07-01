import React, { useState } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { PlayCircleOutlineIcon, useTooltip, ArrowUpIcon, ArrowDownIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { BetPosition, Round } from 'state/prediction/types'
import { useGetinterval } from 'state/hook'
import { markPositionAsEntered } from 'state/prediction/reducer'
import { formatToken } from '../../helpers'
import { RoundResultBox, PrizePoolRow } from '../RoundResult'
import MultiplierArrow from './MultiplierArrow'
import CardHeader from './CardHeader'
import PositionModal from './PositionModal'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { CardBGImage, CardNoise } from 'components/earn/styled'
import { AutoColumn } from 'components/Column'
import { ButtonError } from 'components/Button'

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


const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${showBackground ? theme.black : theme.bg5} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;
  transition: z-index 600ms;
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
    justify-content: space-evenly;
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
  const dispatch = useDispatch()
  const currentTimestamp = useCurrentBlockTimestamp()
  const { isSettingPosition, position } = state
  const isBufferPhase = currentTimestamp && currentTimestamp.toNumber() >= round.startAt + interval
  const positionDisplay = position === BetPosition.BULL ? t('Up').toUpperCase() : t('Down').toUpperCase()
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
    dispatch(
      markPositionAsEntered({
        account,
        roundId: round.id,
        bet: {
          hash,
          round,
          position,
          amount: parseFloat(decimalValue),
          claimed: false,
          claimedHash: null,
        },
      }),
    )

    handleBack()

    // toastSuccess(
    //   t('Success!'),
    //   t('%position% position entered', {
    //     position: positionDisplay,
    //   }),
    // )
  }
  //@ts-ignore
  const getPositionEnteredIcon = () => {
    return position === BetPosition.BULL ? <ArrowUpIcon color="currentColor" /> : <ArrowDownIcon color="currentColor" />
  }

  return (
    <Wrapper showBackground={false} bgColor={'blue'} >
      <CardBGImage desaturate />
      <CardNoise />
      <CardHeader
        status="next"
        epoch={round.epoch}
        blockTime={estimatedLockTime}
        icon={<PlayCircleOutlineIcon color="white" mr="4px" width="21px" />}
        title={t('Next')}
      />
      <ContentWrapper>
        <MultiplierArrow betAmount={betAmount} multiplier={bullMultiplier} hasEntered={hasEnteredUp} />
        <RoundResultBox isNext={canEnterPosition} isLive={!canEnterPosition}>
          {canEnterPosition ? (
            <>
              <PrizePoolRow totalAmount={round.totalAmount} mb="8px" />
              <ButtonError
                variant="success"
                width="100%"
                onClick={() => handleSetPosition(BetPosition.BULL)}
                mb="4px"
                disabled={!canEnterPosition || isBufferPhase}
              >
                {t('Enter UP')}
              </ButtonError>
              <ButtonError
                variant="danger"
                width="100%"
                onClick={() => handleSetPosition(BetPosition.BEAR)}
                disabled={!canEnterPosition || isBufferPhase}
              >
                {t('Enter DOWN')}
              </ButtonError>
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
        <MultiplierArrow
          betAmount={betAmount}
          multiplier={bearMultiplier}
          betPosition={BetPosition.BEAR}
          hasEntered={hasEnteredDown}
        />
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
