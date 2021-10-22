import { Currency, CurrencyAmount, Pair, Trade, Token } from '@dfyn/sdk'
import { createReducer } from '@reduxjs/toolkit'
import {
  addInput,
  Field,
  removeInput,
  selectCurrency,
  typeInput,
  setRecipient,
  setOutputAmount,
  inputCurrencyTrade,
  setTotalMatic,
  setLatestUpdatedTokenId,
  setInputToMaticConversion,
  setMaticToMaticConversion,
  setSelectedInputLPToken,
  setInputLPToMaticConversion,
  resetToInitialState,
  setAllTokens,
  replaceSwapState
} from './actions'
import _get from 'lodash.get'
import { WritableDraft } from 'immer/dist/internal'

export interface CustomInputToMaticConversion {
  [address: string]: {
    inputToken: Currency | null
    inputValue: string
    maticConversion: Trade | null
  }
}

export interface CustomInputLPToMaticStruct {
  readonly inputLPToken: Token | Currency | null
  readonly inputLPValue: string
  readonly maticConversion: (Trade | null)[]
  readonly usdcValue: number
}


export interface CustomInputLPToMaticConversion {
  [address: string]: CustomInputLPToMaticStruct
}

export interface CustomMaticToMaticConversion {
  [address: string]: {
    readonly inputNative: Currency | null
    readonly inputNativeValue: string
    readonly inputNativeTradePath: string[]
  }
}


export interface BlendState {
  readonly independentField: Field
  readonly numberOfInput: number
  readonly typedValues: string[]
  readonly [Field.INPUT]: (Currency | null)[]
  readonly [Field.OUTPUT]: Currency | undefined | null
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly outputTokenToMatic: {
    outputTokenAmount: number,
    totalMaticValue: number
  }
  readonly tradeAmountValue: (Trade | null)[]
  readonly totalMaticAmountValue: CurrencyAmount | null
  readonly latestUpdatedTokenId: string | null
  inputToMaticConversion: (CustomInputToMaticConversion | null)
  inputLPToMaticConversion: (CustomInputLPToMaticConversion | null)
  maticToMaticConversion: (CustomMaticToMaticConversion | null)
  lpTokenPairs: (Pair | null)[]
}


const initialState: BlendState = {
  independentField: Field.INPUT,
  numberOfInput: 1,
  typedValues: [''],
  [Field.INPUT]: [null],
  [Field.OUTPUT]: null,
  recipient: null,
  outputTokenToMatic: { outputTokenAmount: 0, totalMaticValue: 0 },
  tradeAmountValue: [null],
  totalMaticAmountValue: null,
  latestUpdatedTokenId: null,
  inputToMaticConversion: {},
  maticToMaticConversion: {},
  lpTokenPairs: [],
  inputLPToMaticConversion: {}
}

export default createReducer<BlendState>(initialState, (builder) => (
  builder.addCase(resetToInitialState, () => {
    return {
      ...initialState
    }
  })
  .addCase(replaceSwapState, (state, {payload: {inputCurrencyId, outputCurrencyId}}) => {
      return{
        ...state,
        [Field.INPUT]: [inputCurrencyId],
        [Field.OUTPUT]: outputCurrencyId
      }
  })
    .addCase(selectCurrency, (state, { payload: { field, currency, indexOfInput } }) => {
      if (field === Field.OUTPUT) {
        return {
          ...state,
          [field]: currency,
        }
      } else {
        const changedInputCurrency = state[Field.INPUT].map((item, index) => {
          if (indexOfInput === index) {
            return currency
          } else return item
        })
        return {
          ...state,
          [Field.INPUT]: changedInputCurrency,
        }
      }
    }))
  .addCase(typeInput, (state, { payload: { typedValue, indexOfInput } }) => {
    if (indexOfInput === undefined || indexOfInput >= state.numberOfInput) {
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
  .addCase(addInput, (state) => {
    return {
      ...state,
      numberOfInput: state.numberOfInput + 1,
      typedValues: [...state.typedValues, ''],
      [Field.INPUT]: [
        ...state[Field.INPUT],
        null,
      ],
    }
  })
  .addCase(removeInput, (state, { payload: { indexOfInput, selectedCurrency } }) => {
    if (indexOfInput === undefined || indexOfInput >= state.numberOfInput) {
      console.log('No Input found of Index - ' + indexOfInput)
      return {
        ...state,
      }
    }
    const typedValuesWithDeletedInput: string[] = state.typedValues.filter((item, index) => {
      return index !== indexOfInput
    })
    const inputCurrencyWithDeletedInput: (Currency | null)[] = state[Field.INPUT].filter((item, index) => {
      return index !== indexOfInput
    })
    let inputToMaticConversion = { ...state.inputToMaticConversion } || {}
    const tokenToBeRemoved = _get(selectedCurrency, 'address', selectedCurrency?.symbol)

    delete inputToMaticConversion[tokenToBeRemoved]
    return {
      ...state,
      numberOfInput: state.numberOfInput - 1,
      typedValues: typedValuesWithDeletedInput,
      [Field.INPUT]: inputCurrencyWithDeletedInput,
      inputToMaticConversion
    }
  })
  .addCase(setOutputAmount, (state, { payload: { outputTokenAmount, totalMaticValue } }) => {
    if (!outputTokenAmount) return { ...state }

    return {
      ...state,
      outputTokenToMatic: { outputTokenAmount, totalMaticValue }
    }
  })
  .addCase(setRecipient, (state, { payload: { recipient } }) => {
    state.recipient = recipient
  })
  .addCase(inputCurrencyTrade, (state, { payload: { tradeValue } }) => {
    if (!tradeValue) return { ...state }
    return {
      ...state,
      tradeAmountValue: [tradeValue]
    }
  })
  .addCase(setTotalMatic, (state, { payload: { totalMaticAmount } }) => {
    if (!totalMaticAmount) return { ...state }
    return {
      ...state,
      totalMaticAmountValue: totalMaticAmount
    }
  })
  .addCase(setLatestUpdatedTokenId, (state, { payload: { latestUpdatedTokenId } }) => {
    if (!latestUpdatedTokenId) return { ...state }
    return {
      ...state,
      latestUpdatedTokenId: latestUpdatedTokenId
    }
  })
  .addCase(setInputToMaticConversion, (state, { payload: { updatedInputToMaticConversion, nativeCurrency, usdcValue } }) => {
    if (!updatedInputToMaticConversion && !nativeCurrency) return { ...state }
    const { [Field.INPUT]: inputCurrencyIds, maticToMaticConversion, latestUpdatedTokenId } = state
    const selectedInputCurrency = inputCurrencyIds.find(curr => _get(curr, 'address', curr?.symbol) === latestUpdatedTokenId)
    const t = {
      inputToken: selectedInputCurrency || null,
      inputValue: _get(updatedInputToMaticConversion, 'inputAmount', 0).toFixed(4),
      maticConversion: updatedInputToMaticConversion,
      usdcValue
    }

    let inputMaticUpdatedList: WritableDraft<CustomInputToMaticConversion> = {}
    inputCurrencyIds.forEach(curr => {
      const addr = _get(curr, 'address', curr?.symbol)
      if (state && state.inputToMaticConversion)
        inputMaticUpdatedList[addr] = Object.assign({}, state.inputToMaticConversion[addr])
    })

    const currentAddress: string = _get(selectedInputCurrency, 'address', selectedInputCurrency?.symbol)
    inputMaticUpdatedList[currentAddress] = t
    let isNativeSelected = false
    if (inputCurrencyIds.find(x => x?.symbol === Object.keys(maticToMaticConversion || {})[0])) {
      isNativeSelected = true
    }
    return {
      ...state,
      inputToMaticConversion: inputMaticUpdatedList,
      maticToMaticConversion: isNativeSelected ? maticToMaticConversion : null
    }
  })
  .addCase(setMaticToMaticConversion, (state, { payload: { updatedMaticToMaticConversion } }) => {
    if (!updatedMaticToMaticConversion) return { ...state }
    const selectedInputCurrency = updatedMaticToMaticConversion.inputAmount.currency

    const v = {
      inputNative: selectedInputCurrency || null,
      inputNativeValue: updatedMaticToMaticConversion.inputAmount.toFixed(4),
      inputNativeTradePath: updatedMaticToMaticConversion.route.path.map(x=>x.address)
    }

    const currentAddress: string = selectedInputCurrency.symbol ?? ''

    return {
      ...state,
      maticToMaticConversion: {
        ...state.maticToMaticConversion,
        [currentAddress]: v
      }
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
  .addCase(setInputLPToMaticConversion, (state, { payload: { updatedInputLPToMaticConversion } }) => {
    const currentAddress: string = _get(updatedInputLPToMaticConversion, 'inputLPToken.address', '')
    const { [Field.INPUT]: inputCurrencyIds } = state

    let inputLPToMaticConversionUpdatedList: WritableDraft<CustomInputLPToMaticConversion> = {}

    inputCurrencyIds.forEach(curr => {
      const addr = _get(curr, 'address', curr?.symbol)
      if (state && state.inputLPToMaticConversion && !_get(state, `inputLPToMaticConversion.${addr}`, null))
        inputLPToMaticConversionUpdatedList[addr] = Object.assign({}, state.inputLPToMaticConversion[addr])
    })

    inputLPToMaticConversionUpdatedList[currentAddress] = updatedInputLPToMaticConversion

    return {
      ...state,
      inputLPToMaticConversion: inputLPToMaticConversionUpdatedList
    }
  })
  .addCase(setAllTokens, (state, { payload: { inputToMaticConversion, inputLPToMaticConversion}})=>{
    return {
      ...state,
      inputToMaticConversion, inputLPToMaticConversion
    }
  })
)
