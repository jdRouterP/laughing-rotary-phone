import { Currency, CurrencyAmount, JSBI } from "@dfyn/sdk"
import { useActiveWeb3React } from "hooks"
import { tryParseAmount } from "state/swap/hooks"

function useStake(
    typedValue: string,
    currency: Currency,
    userBalance: CurrencyAmount | undefined,
): {
    parsedAmount?: CurrencyAmount
    error?: string
} {
    const { account } = useActiveWeb3React()

    const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, currency)

    const parsedAmount =
        parsedInput && userBalance  && JSBI.lessThanOrEqual(parsedInput.raw, userBalance.raw)
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

export default useStake;