import { Currency, CurrencyAmount, JSBI } from '@dfyn/sdk'

/**
 * Take a formatted amount, e.g. 15 MATIC and convert it to full decimal value, e.g. 15000000000000000
 */
export const getDecimalAmount = (token: Currency, amount: JSBI | string | number, decimals = 18) => {
  return new CurrencyAmount(token, JSBI.multiply(JSBI.BigInt(amount), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))))
}

export const formatNumber = (number: number | JSBI, minPrecision = 2, maxPrecision = 2) => {
  if (number instanceof JSBI) JSBI.toNumber(number);
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  }
  return number.toLocaleString(undefined, options)
}
