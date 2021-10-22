import { CustomInputLPToMaticConversion, CustomInputToMaticConversion } from 'state/blend/reducer';
import { CustomInputLPToMaticStruct } from './reducer';
import { Currency, CurrencyAmount, Pair, Trade } from '@dfyn/sdk'
import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export const selectCurrency = createAction<{ field: Field; currency: Currency; indexOfInput: number | undefined }>('blend/selectCurrency')
export const typeInput = createAction<{ typedValue: string; indexOfInput: number | undefined }>('blend/typeInput')
export const addInput = createAction('blend/addInput')
export const removeInput = createAction<{ indexOfInput: number; selectedCurrency: Currency | undefined }>('blend/removeInput')

export const switchCurrencies = createAction<void>('swap/switchCurrencies')
export const replaceSwapState =
  createAction<{
    inputCurrencyId: Currency
    outputCurrencyId: Currency
  }>('blend/replaceSwapState')
export const setRecipient = createAction<{ recipient: string | null }>('blend/setRecipient')
export const inputCurrencyTrade = createAction<{ tradeValue: Trade | null }>('blend/inputCurrencyTrade')
export const setOutputAmount = createAction<{ outputTokenAmount: number, totalMaticValue: number }>('blend/setOutputAmount')
export const setTotalMatic = createAction<{ totalMaticAmount: CurrencyAmount }>('blend/totalMatic')
export const setLatestUpdatedTokenId = createAction<{ latestUpdatedTokenId: string | null }>('blend/setLatestUpdatedTokenId')
export const setInputToMaticConversion = createAction<{ updatedInputToMaticConversion: Trade | null, nativeCurrency?: CurrencyAmount | null, usdcValue: number | null }>('/blend/setInputToMaticConversion')
export const setInputLPToMaticConversion = createAction<{ updatedInputLPToMaticConversion: CustomInputLPToMaticStruct }>('/blend/setInputLPToMaticConversion')
export const setMaticToMaticConversion = createAction<{ updatedMaticToMaticConversion: Trade | null }>('/blend/setMaticToMaticConversion')
export const setSelectedInputLPToken = createAction<{ lpTokenPair: Pair | null }>('/blend/setSelectedInputLPToken')
export const resetToInitialState = createAction('blend/resetToInitialState')
export const setAllTokens = createAction<{  inputToMaticConversion: (CustomInputToMaticConversion | null), inputLPToMaticConversion: (CustomInputLPToMaticConversion | null)}>('blend/setAllTokens')