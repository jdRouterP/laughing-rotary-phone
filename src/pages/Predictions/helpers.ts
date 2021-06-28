
import { JSBI } from '@uniswap/sdk'
import { Bet, BetPosition } from 'state/prediction/types'
import { formatNumber } from 'utils/formatBalance'
import getTimePeriods from 'utils/getTimePeriods'


export const formatUsd = (usd: number | JSBI) => {
  return `$${formatNumber(usd || 0, 3, 3)}`
}

export const formatToken = (token: number | string) => {
  const value = typeof token === "string" ? parseFloat(token) : token;
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '0'
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

export const getMultiplier = (total: number, amount: number) => {
  if (total === 0 || amount === 0) {
    return 0
  }

  return total / amount
}

/**
 * Calculates the total payout given a bet
 */
export const getPayout = (bet: Bet | null) => {
  if (!bet || !bet.round) {
    return 0
  }

  const { bullAmount, bearAmount, totalAmount } = bet.round
  const multiplier = getMultiplier(totalAmount, bet.position === BetPosition.BULL ? bullAmount : bearAmount)
  return bet.amount * multiplier
}

// TODO: Move this to the UI Kit
export const getBubbleGumBackground = () => {

  return 'linear-gradient(139.73deg, #E6FDFF 0%, #EFF4F5 46.87%, #F3EFFF 100%)'
}
