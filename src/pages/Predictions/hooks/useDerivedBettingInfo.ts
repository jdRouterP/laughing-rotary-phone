import { Currency, CurrencyAmount, JSBI } from "@dfyn/sdk"
import { useActiveWeb3React } from "hooks"
import { tryParseAmount } from "state/swap/hooks"

function useDerivedBettingInfo(
    typedValue: string,
    currency: Currency,
    userBalance: CurrencyAmount | undefined,
    minBetAmountBalance: CurrencyAmount | undefined
): {
    parsedAmount?: CurrencyAmount
    error?: string
} {
    const { account } = useActiveWeb3React()

    const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, currency)

    const parsedAmount =
        parsedInput && userBalance && minBetAmountBalance && JSBI.lessThanOrEqual(parsedInput.raw, userBalance.raw) && JSBI.greaterThanOrEqual(parsedInput.raw, minBetAmountBalance.raw)
            ? parsedInput
            : undefined

    let error: string | undefined
    if (!account) {
        error = 'Connect Wallet'
    }
    if (!parsedAmount) {
        error = error ?? 'Enter an amount'
    }

    return {
        parsedAmount,
        error
    }
}

export default useDerivedBettingInfo;