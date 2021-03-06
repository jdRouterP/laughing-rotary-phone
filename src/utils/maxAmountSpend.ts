import { CurrencyAmount, ChainId, Currency, JSBI } from '@dfyn/sdk'
import { MIN_ETH } from '../constants'

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(currencyAmount?: CurrencyAmount, chainId = ChainId.MATIC): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency === Currency.getNativeCurrency(chainId)) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      return new CurrencyAmount(currencyAmount.currency, JSBI.subtract(currencyAmount.raw, MIN_ETH))
    } else {
      return new CurrencyAmount(currencyAmount.currency, JSBI.BigInt(0))
    }
  }
  return currencyAmount
}
