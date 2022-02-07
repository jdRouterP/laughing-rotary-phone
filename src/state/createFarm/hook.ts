import { Currency } from "@dfyn/sdk"
import { useCallback } from "react"
import {  useSelector } from "react-redux"
import {  AppState } from "state"
import { useAppDispatch } from "state/hook"
import { addInput, Field, removeInput, resetToInitialState, selectCurrency, typeInput } from "./action"

export function useFarmFormState(): AppState['farmForm'] {
    return useSelector<AppState, AppState['farmForm']>(state => state.farmForm)
  }
  
  export function useFarmFormActionHandlers(): {
    onCurrencySelection: (field: Field, currency: Currency, indexOfInput: number | undefined) => void
    onUserInput: (typedValue: string, indexOfInput: number | undefined) => void
    addInputBox: () => void
    removeInputBox: (indexOfInput: number, selectedCurrency: Currency | undefined) => void
    onResetToInitialState: () => void
  } {
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

  const removeInputBox = useCallback(
    (indexOfInput: number, selectedCurrency: Currency | undefined) => {
      dispatch(removeInput({ indexOfInput, selectedCurrency }))
    },
    [dispatch]
  )
  const onResetToInitialState = useCallback(() => {
    dispatch(resetToInitialState())
  }, [dispatch])
  
    return {
      onCurrencySelection,
      onUserInput,
      addInputBox,
      removeInputBox,
      onResetToInitialState
    }
  }

  export function useDerivedFarmFormInfo(): {
    inputCurrency1: Currency | undefined | null
    inputCurrency2: Currency | undefined | null
    outputCurrencyArr: (Currency | undefined)[]
  }{
  
    const {
      // typedValues,
      [Field.INPUT1]: inputCurrency1,
      [Field.INPUT2]: inputCurrency2,
      [Field.OUTPUT]: outputCurrencyIdArr,
    } = useFarmFormState()
  
    // const inputCurrencyArr = convertIdToCurrency(inputCurrencyIdArr.map((item) => item.currencyId))
    const outputCurrencyArr = outputCurrencyIdArr.map((item) => (item === null)? undefined:item)
  
    return {
      inputCurrency1,
      inputCurrency2,
      outputCurrencyArr,
    }
  }