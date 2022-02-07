import { Currency, Pair } from '@dfyn/sdk'
import { createReducer } from '@reduxjs/toolkit'
import { addInput, Field, removeInput, resetToInitialState, selectCurrency, typeInput, setSelectedInputLPToken} from './action'
import _get from 'lodash.get'

export interface FarmFormState {
readonly numberOfRewardTokens: number
  readonly typedValues: string[]
  readonly [Field.INPUT1]: Currency | null | undefined
  readonly [Field.INPUT2]: Currency | null | undefined
  readonly [Field.OUTPUT]: (Currency | null)[]
  lpTokenPairs: (Pair | null)[]
}

const initialState: FarmFormState = {
    numberOfRewardTokens: 1,
    typedValues: [''],
    [Field.INPUT1]: null,
    [Field.INPUT2]: null,
    [Field.OUTPUT]: [null],
    lpTokenPairs: []
}

export default createReducer<FarmFormState>(initialState, builder =>
  builder.addCase(resetToInitialState, () => {
    return {
      ...initialState
    }
  })
  .addCase(selectCurrency, (state, { payload: { field, currency, indexOfInput } }) => {
    if (field === Field.INPUT1) {
      return {
        ...state,
        [field]: currency,
      }
    } if(field === Field.INPUT2){
      return {
        ...state,
        [field]: currency,
      }
    } else {
      const changedInputCurrency = state[Field.OUTPUT].map((item, index) => {
        if (indexOfInput === index) {
          return currency
        } else return item
      })
      return {
        ...state,
        [Field.OUTPUT]: changedInputCurrency,
      }
    }
  })
  .addCase(typeInput, (state, { payload: { typedValue, indexOfInput } }) => {
    if (indexOfInput === undefined || indexOfInput >= state.numberOfRewardTokens) {
      console.log('No Input found of Index - ' + indexOfInput)
      return {
        ...state,
      }
    }
    const changedTypedValues = state.typedValues.map((value, index) => {
      if (indexOfInput === index) {
        return typedValue
      } else return value
    })
    return {
      ...state,
      typedValues: [...changedTypedValues],
    }
  })
  .addCase(setSelectedInputLPToken, (state, { payload: { lpTokenPair } }) => {
    const liquidtyTokenAddress = _get(lpTokenPair, 'liquidityToken.address', null)
    if (!liquidtyTokenAddress) return { ...state }
    return {
      ...state,
      lpTokenPairs: {
        ...state.lpTokenPairs,
        [liquidtyTokenAddress]: lpTokenPair
      }
    }
  })
  .addCase(addInput, (state) => {
    return {
      ...state,
      numberOfRewardTokens: state.numberOfRewardTokens + 1,
      typedValues: [...state.typedValues, ''],
      [Field.OUTPUT]: [
        ...state[Field.OUTPUT],
        null,
      ],
    }
  })
  .addCase(removeInput, (state, { payload: { indexOfInput, selectedCurrency }})=>{
    if (indexOfInput === undefined || indexOfInput >= state.numberOfRewardTokens) {
      console.log('No Input found of Index - ' + indexOfInput)
      return {
        ...state,
      }
    }
    const typedValuesWithDeletedInput: string[] = state.typedValues.filter((item, index) => {
      return index !== indexOfInput
    })
    const inputCurrencyWithDeletedInput: (Currency | null)[] = state[Field.OUTPUT].filter((item, index) => {
      return index !== indexOfInput
    })
    return {
      ...state,
      numberOfRewardTokens: state.numberOfRewardTokens - 1,
      typedValues: typedValuesWithDeletedInput,
      [Field.OUTPUT]: inputCurrencyWithDeletedInput,
    }
  })
  )