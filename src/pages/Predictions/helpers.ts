
import { JSBI } from '@dfyn/sdk'
import { Bet, BetPosition } from 'state/prediction/types'
import { formatNumber } from 'utils/formatBalance'
import getTimePeriods from 'utils/getTimePeriods'


export const formatUsd = (usd: number | JSBI, maxPrecision: number = 3) => {
  return `$${formatNumber(usd || 0, 3, maxPrecision)}`
}

export const formatToken = (token: number | string) => {
  const value = typeof token === "string" ? parseFloat(token) : token;
  return value ? formatNumber(value, 2, 5) : '0'
}

export const padTime = (num: number) => num.toString().padStart(2, '0')

export const formatRoundTime = (secondsBetweenBlocks: number) => {
  const { hours, minutes, seconds } = getTimePeriods(secondsBetweenBlocks)
  const minutesSeconds = `${padTime(minutes)}:${padTime(seconds)}`

  if (hours > 0) {
    return `${padTime(hours)}:${minutesSeconds}`
  }

  return minutesSeconds
}

export const getMultiplier = (total: number, amount: number, rewardRate = 1) => {
  if (total === 0 || amount === 0) {
    return 0
  }

  return (total / amount) * rewardRate
}

/**
 * Calculates the total payout given a bet
 */
export const getPayout = (bet: Bet, rewardRate = 1) => {
  if (!bet || !bet.round) {
    return 0
  }

  const { bullAmount, bearAmount, totalAmount } = bet.round
  const multiplier = getMultiplier(totalAmount, bet.position === BetPosition.BULL ? bullAmount : bearAmount, rewardRate)
  return bet.amount * multiplier
}


export const getNetPayout = (bet: Bet, rewardRate = 1): number => {
  if (!bet || !bet.round) {
    return 0
  }

  const payout = getPayout(bet, rewardRate)
  return payout
}

// TODO: Move this to the UI Kit
export const getBubbleGumBackground = () => {

  return 'linear-gradient(139.73deg, #E6FDFF 0%, #EFF4F5 46.87%, #F3EFFF 100%)'
}
