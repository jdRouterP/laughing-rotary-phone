import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import {
  Box,
  Flex,
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
import { useIsDarkMode } from 'state/user/hooks'
import { ChevronUp, ChevronDown } from 'react-feather'

interface BetProps {
  bet: Bet
}


// const Line = styled.div`
//   width:100%;
//   margin-left: 16px;
//   border: 1px solid rgba(0, 0, 0, 0.1);
// `

// const LineStyled = styled.div`
//   max-width: 360px;
// `

const IconStyle = styled.div`
  margin-left: 12px;
`
const StyledBet = styled(Flex).attrs({ alignItems: 'center', p: '16px' })`
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 10px 10px 0px 0px;
  background: ${({theme}) => theme.bg7};
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
  const darkMode = useIsDarkMode()

  const renderBetLabel = () => {
    if (isOpenRound) {
      return (
        <Flex alignItems="center">
          <WaitIcon color="primary" mr="6px" width="24px" />
          <TYPE.main color="primary" fontWeight={500}>
            {t('Starting Soon')}
          </TYPE.main>
        </Flex>
      )
    }

    if (isLiveRound) {
      return (
        <Flex alignItems="center">
          <PlayCircleOutlineIcon color="secondary" mr="6px" width="24px" />
          <TYPE.main fontWeight={500}>
            {'Live Now'}
          </TYPE.main>
        </Flex>
      )
    }

    return (
      <>
        <TYPE.main fontSize="12px" mb="2px" color="textSubtle">
          {t('Your Result')}
        </TYPE.main>
        <TYPE.main fontWeight={500} color={resultTextColor} lineHeight={1}>
          {roundResult === Result.CANCELED ? t('Canceled') : `${resultTextPrefix}${formatToken(payout)}`}
        </TYPE.main>
      </>
    )
  }

  return (
    <>
      <StyledBet onClick={toggleOpen} role="button" mb="10px">
        <Box width="48px">

          <TYPE.main fontSize="12px" mb="2px">
            {'Round'}
          </TYPE.main>
          <TYPE.main fontWeight={500} lineHeight={1}>
            {round.epoch.toLocaleString()}
          </TYPE.main>

        </Box>
        <YourResult pl="50px" >{renderBetLabel()}</YourResult>
        {roundResult === Result.WIN && canClaim && (
          <CollectWinningsButton
            hasClaimed={!canClaim}
            roundId={bet.round.id}
            epoch={bet.round.epoch}
            payout={payout}
            scale="sm"
            width="30%"
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
          <IconStyle>
            {isOpen ? <ChevronUp size={20} color={darkMode ? "#FFFFFF" : "rgb(23, 24, 31)"} /> : <ChevronDown size={20} color={darkMode ? "#FFFFFF" : "rgb(23, 24, 31)"}/>}
          </IconStyle>
        )}
      </StyledBet>
      {/* <LineStyled>
        <Line />
      </LineStyled> */}
      {isOpen && <BetDetails bet={bet} result={getRoundResult(bet, currentEpoch)} />}
    </>
  )
}

export default HistoricalBet
