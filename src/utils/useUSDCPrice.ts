import { ChainId, Currency, currencyEquals, JSBI, Price, WETH } from '@dfyn/sdk'
import { useMemo } from 'react'
import { DAI, USDC, USDC_FANTOM, DAI_FANTOM } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { useActiveWeb3React } from '../hooks'
import { wrappedCurrency } from './wrappedCurrency'

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React()
  //TODO
  //TEMP
  let temp_dai = chainId === ChainId.MATIC ? DAI : DAI_FANTOM;
  let temp_usdc = chainId === ChainId.MATIC ? USDC : USDC_FANTOM;
  const wrapped = wrappedCurrency(currency, chainId)
  const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [
      [
        chainId && wrapped && currencyEquals(WETH[chainId], wrapped) ? undefined : currency,
        chainId ? WETH[chainId] : undefined
      ],
      [wrapped?.equals(temp_usdc) ? undefined : wrapped, chainId === ChainId.MATIC ? temp_usdc : temp_usdc],
      [wrapped?.equals(temp_dai) ? undefined : wrapped, chainId === ChainId.MATIC ? temp_dai : temp_dai],
      [chainId ? WETH[chainId] : undefined, chainId === ChainId.MATIC ? temp_usdc : temp_usdc]
    ],
    [chainId, currency, wrapped, temp_dai, temp_usdc]
  )
  const [[ethPairState, ethPair], [usdcPairState, usdcPair], [daiPairState, daiPair], [usdcEthPairState, usdcEthPair]] = usePairs(tokenPairs)

  return useMemo(() => {
    if (!currency || !wrapped || !chainId) {
      return undefined
    }
    // handle weth/eth
    if (wrapped.equals(WETH[chainId])) {
      if (usdcPair) {
        const price = usdcPair.priceOf(WETH[chainId])
        return new Price(currency, temp_usdc, price.denominator, price.numerator)
      } else {
        return undefined
      }
    }
    // handle usdc
    if (wrapped.equals(temp_usdc)) {
      return new Price(temp_usdc, temp_usdc, '1', '1')
    }
    if (wrapped.equals(temp_dai)) {
      return new Price(temp_dai, temp_dai, '1', '1')
    }

    const ethPairETHAmount = ethPair?.reserveOf(WETH[chainId])
    const ethPairETHUSDCValue: JSBI =
      ethPairETHAmount && usdcEthPair ? usdcEthPair.priceOf(WETH[chainId]).quote(ethPairETHAmount).raw : JSBI.BigInt(0)

    // all other tokens
    // first try the usdc pair
    if (usdcPairState === PairState.EXISTS && usdcPair && usdcPair.reserveOf(temp_usdc).greaterThan(ethPairETHUSDCValue)) {
      const price = usdcPair.priceOf(wrapped)
      return new Price(currency, temp_usdc, price.denominator, price.numerator)
    }
    if (daiPairState === PairState.EXISTS && daiPair && daiPair.reserveOf(temp_dai).greaterThan(ethPairETHUSDCValue)) {
      const price = daiPair.priceOf(wrapped)
      return new Price(currency, temp_dai, price.denominator, price.numerator)
    }
    if (ethPairState === PairState.EXISTS && ethPair && usdcEthPairState === PairState.EXISTS && usdcEthPair) {
      if (usdcEthPair.reserveOf(temp_usdc).greaterThan('0') && ethPair.reserveOf(WETH[chainId]).greaterThan('0')) {
        const ethUsdcPrice = usdcEthPair.priceOf(temp_usdc)
        const currencyEthPrice = ethPair.priceOf(WETH[chainId])
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert()
        return new Price(currency, temp_usdc, usdcPrice.denominator, usdcPrice.numerator)
      }
    }
    return undefined
  }, [chainId, currency, ethPair, ethPairState, usdcEthPair, usdcEthPairState, usdcPair, usdcPairState, wrapped, daiPair, daiPairState, temp_dai, temp_usdc])
}
