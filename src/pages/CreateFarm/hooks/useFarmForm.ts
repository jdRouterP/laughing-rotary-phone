import { Currency, CurrencyAmount, JSBI } from "@dfyn/sdk";
import { useActiveWeb3React } from "hooks";
import { useFarmFormState } from "state/createFarm/hook";
import { tryParseAmount } from "state/swap/hooks";
import _get from 'lodash.get'


export function useFarmForm(
    selectedCurrencyBalances: (CurrencyAmount | undefined)[],
    outputCurrencyArr: (Currency | undefined)[]
    ):{
      parsedAmountArr: (CurrencyAmount | undefined)[]
  } {
    const { chainId } = useActiveWeb3React()

    const {
        typedValues,
      } = useFarmFormState()

    const parsedOutputArr = outputCurrencyArr.map((outputCurrency, i) =>
        tryParseAmount(typedValues[i], outputCurrency ?? undefined)
    )

    const parsedAmountArr = parsedOutputArr.map((i, j) => {
      let maxAmount: string | undefined;
      const isNativeAsset = Currency.getNativeCurrencySymbol(chainId) === outputCurrencyArr[j]?.symbol;
      const fetchToken: CurrencyAmount | undefined = selectedCurrencyBalances.find(asset => {
          if (!asset) return false;
          if(isNativeAsset && asset?.currency.symbol === outputCurrencyArr[j]?.symbol) return true;
          return _get(asset, 'token.address', '') === _get(outputCurrencyArr[j], 'address', 'NONE')
      })
      maxAmount = fetchToken?.toExact()
      const maxAmountValue: CurrencyAmount | undefined = tryParseAmount(maxAmount, outputCurrencyArr[j])
      return i && maxAmountValue && JSBI.lessThanOrEqual(i.raw, maxAmountValue.raw) ? i : undefined
    })

    return{
      parsedAmountArr
    }
  }