import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { CardBody, PlayCircleOutlineIcon, Button, useTooltip, ArrowUpIcon, ArrowDownIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { BetPosition, Round } from 'state/prediction/types'
import { useGetinterval } from 'state/hook'
import { markPositionAsEntered } from 'state/prediction/reducer'
import CardFlip from '../CardFlip'
import { formatToken } from '../../helpers'
import { RoundResultBox, PrizePoolRow } from '../RoundResult'
import MultiplierArrow from './MultiplierArrow'
import Card from './Card'
import CardHeader from './CardHeader'
import SetPositionCard from './SetPositionCard'
import { ChainId, JSBI, TokenAmount, WETH } from '@uniswap/sdk'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'

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

  const handleSuccess = async (chainId: ChainId, decimalValue: JSBI | number | string, hash: string) => {
    // Optimistically set the user bet so we see the entered position immediately.
    if (!!!account) return
    let decimalValueBN: JSBI;
    if (!(decimalValue instanceof JSBI)) {
      decimalValueBN = JSBI.BigInt(decimalValue);
    }
    else {
      decimalValueBN = decimalValue;
    }
    dispatch(
      markPositionAsEntered({
        account,
        roundId: round.id,
        bet: {
          hash,
          round,
          position,
          amount: parseFloat(new TokenAmount(WETH[chainId ?? 137], decimalValueBN).toSignificant(6)),
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

  const getPositionEnteredIcon = () => {
    return position === BetPosition.BULL ? <ArrowUpIcon color="currentColor" /> : <ArrowDownIcon color="currentColor" />
  }

  return (
    <CardFlip isFlipped={isSettingPosition} height="404px">
      <Card>
        <CardHeader
          status="next"
          epoch={round.epoch}
          blockTime={estimatedLockTime}
          icon={<PlayCircleOutlineIcon color="white" mr="4px" width="21px" />}
          title={t('Next')}
        />
        <CardBody p="16px">
          <MultiplierArrow betAmount={betAmount} multiplier={bullMultiplier} hasEntered={hasEnteredUp} />
          <RoundResultBox isNext={canEnterPosition} isLive={!canEnterPosition}>
            {canEnterPosition ? (
              <>
                <PrizePoolRow totalAmount={round.totalAmount} mb="8px" />
                <Button
                  variant="success"
                  width="100%"
                  onClick={() => handleSetPosition(BetPosition.BULL)}
                  mb="4px"
                  disabled={!canEnterPosition || isBufferPhase}
                >
                  {t('Enter UP')}
                </Button>
                <Button
                  variant="danger"
                  width="100%"
                  onClick={() => handleSetPosition(BetPosition.BEAR)}
                  disabled={!canEnterPosition || isBufferPhase}
                >
                  {t('Enter DOWN')}
                </Button>
              </>
            ) : (
              <>
                <div ref={targetRef}>
                  <Button disabled startIcon={getPositionEnteredIcon()} width="100%" mb="8px">
                    {t('%position% Entered', { position: positionDisplay })}
                  </Button>
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
        </CardBody>
      </Card>
      <SetPositionCard
        onBack={handleBack}
        onSuccess={handleSuccess}
        position={position}
        togglePosition={togglePosition}
      />
    </CardFlip>
  )
}

export default OpenRoundCard
