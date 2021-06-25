import { Currency, ChainId, Token } from '@dfyn/sdk'

export function currencyId(currency: Currency, chainId = ChainId.MATIC): string {
  if (currency === Currency.getNativeCurrency(chainId)) return Currency.getNativeCurrencySymbol(chainId) || 'MATIC'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
