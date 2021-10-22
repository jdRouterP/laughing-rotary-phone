import { Currency, CurrencyAmount, JSBI } from "@dfyn/sdk"
import { useActiveWeb3React } from "hooks"
import _get from 'lodash.get'
import { useBlendState } from "state/blend/hooks"
import { tryParseAmount } from "state/swap/hooks"

function useBlend(
    selectedCurrencyBalances: (CurrencyAmount | undefined)[],
    inputCurrencyArr: (Currency | undefined)[]
): {
    parsedAmountArr: (CurrencyAmount | undefined)[]
    error?: string
} {
    const { chainId } = useActiveWeb3React()

    const {
        typedValues,
      } = useBlendState()

    const parsedInputArr = inputCurrencyArr.map((inputCurrency, i) =>
        tryParseAmount(typedValues[i], inputCurrency ?? undefined)
    )

    const parsedAmountArr = parsedInputArr.map((i, j) => {
        let maxAmount: string | undefined;
        const isNativeAsset = Currency.getNativeCurrencySymbol(chainId) === inputCurrencyArr[j]?.symbol;
        const fetchToken: CurrencyAmount | undefined = selectedCurrencyBalances.find(asset => {
            if (!asset) return false;
            if(isNativeAsset && asset?.currency.symbol === inputCurrencyArr[j]?.symbol) return true;
            return _get(asset, 'token.address', '') === _get(inputCurrencyArr[j], 'address', 'NONE')
        })
        maxAmount = fetchToken?.toExact()
        const maxAmountValue: CurrencyAmount | undefined = tryParseAmount(maxAmount, inputCurrencyArr[j])
        return i && maxAmountValue && JSBI.lessThanOrEqual(i.raw, maxAmountValue.raw) ? i : undefined
    })
        // parsedInput && userBalance  && JSBI.lessThanOrEqual(parsedInput.raw, userBalance.raw)
        //     ? parsedInput
        //     : undefined

    // let error: string | undefined
    // if (!account) {
    //     error = 'Connect Wallet'
    // }
    // if (!parsedAmount) {
    //     error = error ?? 'Enter an amount'
    // }

    return {
        parsedAmountArr
    }
}

export default useBlend;