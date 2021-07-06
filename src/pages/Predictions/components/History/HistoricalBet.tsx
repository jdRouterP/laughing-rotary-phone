import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import {
  Box,
  ChevronDownIcon,
  ChevronUpIcon,
  Flex,
  IconButton,
  PlayCircleOutlineIcon,
  WaitIcon,
} from '@pancakeswap/uikit'
import styled from 'styled-components'
import { Bet, PredictionStatus } from 'state/prediction/types'
import { useBetCanClaim, useGetCurrentEpoch, useGetPredictionsStatus } from 'state/hook'
import { getRoundResult, Result } from 'state/prediction/hooks'
import { useTranslation } from 'react-i18next'
import { formatToken, getPayout } from '../../helpers'
import CollectWinningsButton from '../CollectWinningsButton'
import ReclaimPositionButton from '../ReclaimPositionButton'
import BetDetails from './BetDetails'
import { TYPE } from 'theme'

interface BetProps {
  bet: Bet
}

const StyledBet = styled(Flex).attrs({ alignItems: 'center', p: '16px' })`
  cursor: pointer;
`

const YourResult = styled(Box)`
  flex: 1;
`

const HistoricalBet: React.FC<BetProps> = ({ bet }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { amount, round } = bet

  const { t } = useTranslation()
  const { account } = useWeb3React()
  const currentEpoch = useGetCurrentEpoch()
  const status = useGetPredictionsStatus()

  const toggleOpen = () => setIsOpen(!isOpen)

  const getRoundColor = (result: Result) => {
    switch (result) {
      case Result.WIN:
        return 'success'
      case Result.LOSE:
        return 'failure'
      case Result.CANCELED:
        return 'textDisabled'
      default:
        return 'text'
    }
  }

  const getRoundPrefix = (result: Result) => {
    if (result === Result.LOSE) {
      return '-'
    }

    if (result === Result.WIN) {
      return '+'
    }

    return ''
  }

  const roundResult = getRoundResult(bet, currentEpoch)
  const resultTextColor = getRoundColor(roundResult)
  const resultTextPrefix = getRoundPrefix(roundResult)
  const isOpenRound = round.epoch === currentEpoch
  const isLiveRound = status === PredictionStatus.LIVE && round.epoch === currentEpoch - 1
  const canClaim = useBetCanClaim(account ?? '', bet.round.id)

  // Winners get the payout, otherwise the claim what they put it if it was canceled
  const payout = roundResult === Result.WIN ? getPayout(bet) : amount

  const renderBetLabel = () => {
    if (isOpenRound) {
      return (
        <Flex alignItems="center">
          <WaitIcon color="primary" mr="6px" width="24px" />
          <TYPE.white color="primary" fontWeight={500}>
            {t('Starting Soon')}
          </TYPE.white>
        </Flex>
      )
    }

    if (isLiveRound) {
      return (
        <Flex alignItems="center">
          <PlayCircleOutlineIcon color="secondary" mr="6px" width="24px" />
          <TYPE.white color="secondary" fontWeight={500}>
            {t('Live Now')}
          </TYPE.white>
        </Flex>
      )
    }

    return (
      <>
        <TYPE.white fontSize="12px" color="textSubtle">
          {t('Your Result')}
        </TYPE.white>
        <TYPE.white fontWeight={500} color={resultTextColor} lineHeight={1}>
          {roundResult === Result.CANCELED ? t('Canceled') : `${resultTextPrefix}${formatToken(payout)}`}
        </TYPE.white>
      </>
    )
  }

  return (
    <>
      <StyledBet onClick={toggleOpen} role="button">
        <Box width="48px">
          <TYPE.white textAlign="center">
            <TYPE.white fontSize="12px" color="textSubtle">
              {t('Round')}
            </TYPE.white>
            <TYPE.white fontWeight={500} lineHeight={1}>
              {round.epoch.toLocaleString()}
            </TYPE.white>
          </TYPE.white>
        </Box>
        <YourResult px="24px">{renderBetLabel()}</YourResult>
        {roundResult === Result.WIN && canClaim && (
          <CollectWinningsButton
            hasClaimed={!canClaim}
            roundId={bet.round.id}
            epoch={bet.round.epoch}
            payout={payout}
            scale="sm"
            mr="8px"
          >
            {t('Collect')}
          </CollectWinningsButton>
        )}
        {roundResult === Result.CANCELED && canClaim && (
          <ReclaimPositionButton epoch={bet.round.epoch} scale="sm" mr="8px">
            {t('Reclaim')}
          </ReclaimPositionButton>
        )}
        {!isOpenRound && !isLiveRound && (
          <IconButton variant="text" scale="sm">
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </IconButton>
        )}
      </StyledBet>
      {isOpen && <BetDetails bet={bet} result={getRoundResult(bet, currentEpoch)} />}
    </>
  )
}

export default HistoricalBet
