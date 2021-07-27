import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { useGetBetByRoundId, useGetCurrentEpoch, useGetRewardRate } from 'state/hook'
import { BetPosition, Round } from 'state/prediction/types'
import { getMultiplier } from '../../helpers'
import ExpiredRoundCard from './ExpiredRoundCard'
import LiveRoundCard from './LiveRoundCard'
import OpenRoundCard from './OpenRoundCard'
import SoonRoundCard from './SoonRoundCard'

interface RoundCardProps {
  round: Round
}

const RoundCard: React.FC<RoundCardProps> = ({ round }) => {
  const { id, epoch, lockPrice, closePrice, totalAmount, bullAmount, bearAmount } = round
  const currentEpoch = useGetCurrentEpoch()
  const { account } = useWeb3React()
  const rewardRate = useGetRewardRate()
  const bet = useGetBetByRoundId(account, id)
  const hasEntered = bet !== null
  const hasEnteredUp = hasEntered && bet?.position === BetPosition.BULL
  const hasEnteredDown = hasEntered && bet?.position === BetPosition.BEAR
  const bullMultiplier = getMultiplier(totalAmount, bullAmount, rewardRate)
  const bearMultiplier = getMultiplier(totalAmount, bearAmount, rewardRate)

  // Next (open) round
  if (epoch === currentEpoch && lockPrice === null) {
    return (
      <OpenRoundCard
        round={round}
        hasEnteredDown={hasEnteredDown}
        hasEnteredUp={hasEnteredUp}
        betAmount={bet?.amount}
        bullMultiplier={bullMultiplier}
        bearMultiplier={bearMultiplier}
      />
    )
  }

  // Live round
  if (closePrice === null && epoch === currentEpoch - 1) {
    return (
      <LiveRoundCard
        betAmount={bet?.amount}
        hasEnteredDown={hasEnteredDown}
        hasEnteredUp={hasEnteredUp}
        round={round}
        bullMultiplier={bullMultiplier}
        bearMultiplier={bearMultiplier}
      />
    )
  }

  // Fake future rounds
  if (epoch > currentEpoch) {
    return <SoonRoundCard round={round} />
  }

  // Past rounds
  return (
    <ExpiredRoundCard
      round={round}
      hasEnteredDown={hasEnteredDown}
      hasEnteredUp={hasEnteredUp}
      betAmount={bet?.amount}
      bullMultiplier={bullMultiplier}
      bearMultiplier={bearMultiplier}
    />
  )
}

export default RoundCard
