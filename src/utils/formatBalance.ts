import { JSBI, Token, TokenAmount } from '@uniswap/sdk'

/**
 * Take a formatted amount, e.g. 15 BNB and convert it to full decimal value, e.g. 15000000000000000
 */
export const getDecimalAmount = (token: Token, amount: JSBI | string | number, decimals = 18) => {
  return new TokenAmount(token, JSBI.multiply(JSBI.BigInt(amount), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))))
}

export const formatNumber = (number: number, minPrecision = 2, maxPrecision = 2) => {
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  }
  return number.toLocaleString(undefined, options)
}
