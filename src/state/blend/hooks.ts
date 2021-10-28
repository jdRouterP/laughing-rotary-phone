import { Currency, Pair, Percent, TokenAmount, Trade, JSBI } from '@dfyn/sdk'
import { useCallback, useEffect, useRef, useState } from 'react'
// import { useConvertInputTokenToMatic } from '../../hooks/Tokens'
import { AppDispatch, AppState } from '../index'
import { addInput, Field, removeInput, selectCurrency, setRecipient, typeInput, setOutputAmount, setInputToMaticConversion, setInputLPToMaticConversion, resetToInitialState, setAllTokens, setLatestUpdatedTokenId, replaceSwapState } from './actions'
import { useActiveWeb3React } from 'hooks'
import { useAppDispatch } from 'state/hook'
import { useDispatch, useSelector } from 'react-redux'
import { queryParametersToSwapState, tryParseAmount } from 'state/swap/hooks'
import { useTradeExactIn } from 'hooks/Trades'
// import { parseUnits } from '@ethersproject/units'
import _get from 'lodash.get'
import _isEqual from 'lodash.isequal'
import { useTokenBalances } from 'state/wallet/hooks'
import { useTotalSupply } from 'data/TotalSupply'
import { CustomInputLPToMaticConversion, CustomInputToMaticConversion } from './reducer'
import { USDT } from '../../constants'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useAllTokens } from 'hooks/Tokens'
// import useUSDCPrice from 'utils/useUSDCPrice'

export function useBlendState(): AppState['blend'] {
  return useSelector<AppState, AppState['blend']>(state => state.blend)
}

export function useBlendActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency, indexOfInput: number | undefined) => void
  onUserInput: (typedValue: string, indexOfInput: number | undefined) => void
  onChangeRecipient: (recipient: string | null) => void
  addInputBox: () => void
  removeInputBox: (indexOfInput: number, selectedCurrency: Currency | undefined) => void
  onSetOutputAmount: (outputTokenAmount: number, totalMaticValue: number) => void
  onResetToInitialState: () => void
} {
  // const { chainId } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency, indexOfInput: number | undefined) => {
      dispatch(
        selectCurrency({
          field,
          currency,
          indexOfInput,
        })
      )
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (typedValue: string, indexOfInput: number | undefined) => {
      dispatch(typeInput({ typedValue, indexOfInput }))
    },
    [dispatch]
  )

  const addInputBox = useCallback(() => {
    dispatch(addInput())
  }, [dispatch])

  const onResetToInitialState = useCallback(() => {
    dispatch(resetToInitialState())
  }, [dispatch])

  const removeInputBox = useCallback(
    (indexOfInput: number, selectedCurrency: Currency | undefined) => {
      dispatch(removeInput({ indexOfInput, selectedCurrency }))
      dispatch(setInputToMaticConversion({ updatedInputToMaticConversion: null, usdcValue: null }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  const onSetOutputAmount = useCallback(
    (outputTokenAmount: number, totalMaticValue: number) => {
      dispatch(setOutputAmount({ outputTokenAmount, totalMaticValue }))
    },
    [dispatch]
  )

  return {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    addInputBox,
    removeInputBox,
    onSetOutputAmount,
    onResetToInitialState
  }
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedBlendInfo(): {
  inputCurrencyArr: (Currency | undefined)[]
  outputCurrency: Currency | null | undefined
} {

  const {
    // typedValues,
    [Field.INPUT]: inputCurrencyIdArr,
    [Field.OUTPUT]: outputCurrency,
  } = useBlendState()

  // const inputCurrencyArr = convertIdToCurrency(inputCurrencyIdArr.map((item) => item.currencyId))
  const inputCurrencyArr = inputCurrencyIdArr.map((item) => (item === null) ? undefined : item)

  return {
    inputCurrencyArr,
    outputCurrency,
  }
}

// export function identifyChangedObject(latestUpdatedToken: string){
//   const dispatch = useAppDispatch()

//   dispatch(setLatestUpdatedTokenId({ latestUpdatedTokenId: latestUpdatedToken }))
// }

function useDeepEffect(fn: any, deps: any) {
  const isFirst = useRef(true);
  const prevDeps = useRef(deps);

  useEffect(() => {
    const isFirstEffect = isFirst.current;
    const isSame = prevDeps.current.every((obj: any, index: any) =>
      _isEqual(obj, deps[index])
    );

    isFirst.current = false;
    prevDeps.current = deps;

    if (isFirstEffect || !isSame) {
      return fn();
    }
  }, [deps, fn]);
}

export function useInputToMaticToken(latestUpdatedTokenId: string | null): {
  inputCurrencyToMatic: (Trade | null)
} {
  const {
    typedValues,
    [Field.INPUT]: inputCurrencyIdArr,
    [Field.OUTPUT]: outputCurrency,
    lpTokenPairs
  } = useBlendState()
  const { account, chainId } = useActiveWeb3React();
  const nativeCurrency = Currency.getNativeCurrency(chainId)
  const selectedInputCurrencyIndex = inputCurrencyIdArr.findIndex(curr => _get(curr, 'address', curr?.symbol) === latestUpdatedTokenId)
  let selectedInputCurrency = inputCurrencyIdArr[selectedInputCurrencyIndex]
  let selectedInputTokenValue: string | undefined = typedValues[selectedInputCurrencyIndex]

  let selectedInputCurrency1 = undefined
  let selectedInputTokenValue1: any = null
  const selLPToken: Pair | null | undefined = _get(lpTokenPairs, `${latestUpdatedTokenId}`, null) //.find(x=>x?.liquidityToken.address === latestUpdatedTokenId)
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [selLPToken?.liquidityToken])
  const totalSupply = useTotalSupply(selLPToken?.liquidityToken)
  const inputLPValue = parseFloat(selectedInputTokenValue).toFixed(_get(selectedInputCurrency, 'decimals', 4))

  if (selLPToken && totalSupply) {
    const userLiquidity = relevantTokenBalances?.[selLPToken?.liquidityToken?.address ?? '']

    let percentToRemove = new Percent('0', '100')
    const liquidityValueA =
      userLiquidity && JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
        ? new TokenAmount(selLPToken.token0, selLPToken.getLiquidityValue(selLPToken.token0, totalSupply, userLiquidity, false).raw)
        : undefined

    const liquidityValueB =
      userLiquidity && JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
        ? new TokenAmount(selLPToken.token1, selLPToken.getLiquidityValue(selLPToken.token1, totalSupply, userLiquidity, false).raw)
        : undefined

    const independentAmount = tryParseAmount(selectedInputTokenValue, selLPToken?.liquidityToken)
    if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity))
      percentToRemove = new Percent(independentAmount.raw, userLiquidity?.raw)

    selectedInputCurrency = selLPToken.token0
    selectedInputTokenValue = liquidityValueA && new TokenAmount(selLPToken.token0, percentToRemove.multiply(liquidityValueA?.raw).quotient).toExact()

    selectedInputCurrency1 = selLPToken.token1
    selectedInputTokenValue1 = liquidityValueB && new TokenAmount(selLPToken.token1, percentToRemove.multiply(liquidityValueB?.raw).quotient).toExact()
  }
  // const convertToUSDC0 = parseFloat(useUSDCPrice(selectedInputCurrency || undefined)?.toSignificant() || '')*(parseFloat(selectedInputTokenValue || '0'))
  // const convertToUSDC1 = parseFloat(useUSDCPrice(selectedInputCurrency1 || undefined)?.toSignificant() || '')*(parseFloat(selectedInputTokenValue1 || '0'))
  // const usdcValue = (convertToUSDC0 || 0) + (convertToUSDC1 || 0)

  let parsedInput = tryParseAmount(selectedInputTokenValue, selectedInputCurrency || undefined)
  let identifyOutputCurrency = outputCurrency || nativeCurrency
  if (!outputCurrency && selectedInputCurrency?.symbol === nativeCurrency.symbol) {
    identifyOutputCurrency = USDT
  }
  const inputCurrencyToMatic: Trade | null = useTradeExactIn(parsedInput, identifyOutputCurrency)

  const parsedInput1 = tryParseAmount(selectedInputTokenValue1, selectedInputCurrency1 || undefined)
  const inputCurrencyToMatic1: Trade | null = useTradeExactIn(parsedInput1, identifyOutputCurrency)

  const dispatch = useDispatch<AppDispatch>()

  useDeepEffect(() => {
    if (selLPToken && selectedInputTokenValue && inputCurrencyToMatic) {
      dispatch(setInputLPToMaticConversion({
        updatedInputLPToMaticConversion: {
          inputLPToken: selLPToken.liquidityToken,
          inputLPValue,
          maticConversion: [inputCurrencyToMatic, inputCurrencyToMatic1],
          usdcValue: 0
        }
      }))
    }
    else if (!selLPToken && selectedInputCurrency !== undefined && inputCurrencyToMatic) {
      dispatch(setInputToMaticConversion({
        updatedInputToMaticConversion: inputCurrencyToMatic,
        usdcValue: 0
      }))
    }
  }, [inputCurrencyToMatic, dispatch, selectedInputCurrency, parsedInput, inputCurrencyToMatic1])


  return {
    inputCurrencyToMatic
  };
}

export function useGetOutputTokenAmount(): {
  outputTokenAmount: number
  totalMaticValue: number
} {
  // const { chainId } = useActiveWeb3React();
  // const nativeCurrency = Currency.getNativeCurrency(chainId)
  const {
    [Field.INPUT]: inputCurrencyIdArr,
    [Field.OUTPUT]: outputCurrency,
    latestUpdatedTokenId
  } = useBlendState()
  const dispatch = useDispatch<AppDispatch>()

  const { inputToMaticConversion, inputLPToMaticConversion } = useBlendState()
  let totalMaticValue = 0
  let totalLPMaticValue = 0

  const filterActiveLPToken: CustomInputLPToMaticConversion = {}
  const filterActiveTokens: CustomInputToMaticConversion = {}
  let newUpdatedlastTokenId = null

  if (inputToMaticConversion && Object.keys(inputToMaticConversion).length > 0 && outputCurrency) {
    const allSelectedItems = Object.values(inputToMaticConversion)
    const faultConversion = allSelectedItems.find(val => {
      const isNotEqual = _get(val, 'maticConversion.outputAmount.currency.address', val.maticConversion?.outputAmount.currency.symbol) !== _get(outputCurrency, 'address', outputCurrency?.symbol)
      return isNotEqual
    })
    newUpdatedlastTokenId = _get(faultConversion, 'inputToken.address', faultConversion?.inputToken?.symbol)
    if (_get(faultConversion, 'inputToken', null) && latestUpdatedTokenId !== newUpdatedlastTokenId) {
      dispatch(setLatestUpdatedTokenId({ latestUpdatedTokenId: newUpdatedlastTokenId }))
    }
  }
  if (!newUpdatedlastTokenId && inputLPToMaticConversion && Object.keys(inputLPToMaticConversion).length > 0 && outputCurrency) {
    const allSelectedItems = Object.values(inputLPToMaticConversion).filter(x=>!!Object.keys(x).length)
    const faultConversion = allSelectedItems.find(val => {

      const isNotEqual = _get(val.maticConversion, '[0].outputAmount.currency.address', val.maticConversion[0]?.outputAmount.currency.symbol) !== _get(outputCurrency, 'address', outputCurrency?.symbol)
      return isNotEqual
    })
    
    newUpdatedlastTokenId = _get(faultConversion, 'inputLPToken.address', faultConversion?.inputLPToken?.symbol)
    if (_get(faultConversion, 'inputLPToken', null) && latestUpdatedTokenId !== newUpdatedlastTokenId) {
      dispatch(setLatestUpdatedTokenId({ latestUpdatedTokenId: newUpdatedlastTokenId }))
    }
  }

  if (inputLPToMaticConversion) {
    Object.values(inputLPToMaticConversion).forEach(val => {
      const lpAddress = _get(val, 'inputLPToken.address', val.inputLPToken?.symbol)
      const isCurrencySelected = inputCurrencyIdArr.find(inp => _get(inp, 'address', inp?.symbol) === lpAddress)
      if (val && isCurrencySelected && val.maticConversion) {
        filterActiveLPToken[lpAddress] = val
        _get(val, 'maticConversion', []).forEach(tra => {
          totalLPMaticValue += parseFloat(_get(tra, 'outputAmount', 0).toFixed(6))
        })
      }
    })
  }
  Object.values(inputToMaticConversion || {}).forEach(val => {
    const tokenAddress = _get(val, 'inputToken.address', val.inputToken?.symbol)
    const isCurrencySelected = inputCurrencyIdArr.find(inp => _get(inp, 'address', inp?.symbol) === tokenAddress)

    if (val && isCurrencySelected && val.maticConversion) {
      filterActiveTokens[tokenAddress] = val
      totalMaticValue += parseFloat(_get(val, 'maticConversion.outputAmount', 0).toSignificant())
    }
  })
  totalMaticValue += totalLPMaticValue
  const outputTokenToMatic = totalMaticValue //useTradeExactIn(parsedAmount, outputCurrency || undefined);

  useDeepEffect(() => {
    dispatch(setOutputAmount({ outputTokenAmount: outputTokenToMatic, totalMaticValue }))
    dispatch(setAllTokens({ inputLPToMaticConversion: filterActiveLPToken, inputToMaticConversion: filterActiveTokens }))
  }, [dispatch, outputTokenToMatic, totalMaticValue])
  return {
    outputTokenAmount: outputTokenToMatic,
    totalMaticValue
  }
}


export function useDefaultsFromURLSearchFusion():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const allTokens = useAllTokens()
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs, chainId)

    dispatch(
      replaceSwapState({
        inputCurrencyId: Currency.getNativeCurrency(chainId),
        outputCurrencyId: allTokens[parsed[Field.OUTPUT].currencyId ?? '0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97'],
      })
    )
    dispatch(setLatestUpdatedTokenId({latestUpdatedTokenId: Currency.getNativeCurrency(chainId).symbol ?? 'MATIC'}))
    
    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })

    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId, parsedQs])
  
  return result
}