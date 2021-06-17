import { ChainId, Currency, Token } from '@dfyn/sdk'

export function currencyId(currency: Currency, chainId = ChainId.MATIC): string {
  try {
    const { ethereum } = window;
    console.log(ethereum)
    if (currency === Currency.getNativeCurrency(chainId)) return Currency.getNativeCurrencySymbol(chainId) || 'MATIC'
    if (currency instanceof Token) return currency.address

    if (currency !== Currency.getNativeCurrency(chainId)) return Currency.getNativeCurrencySymbol(chainId) || 'MATIC'
    throw new Error('invalid currency')
  } catch (error) {
    debugger
  }
  return ''
}
