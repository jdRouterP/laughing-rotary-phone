import { Currency, Pair } from '@dfyn/sdk'
import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT1 = 'INPUT1',
  INPUT2 = 'INPUT2',
  OUTPUT = 'OUTPUT'
}

export const selectCurrency = createAction<{ field: Field; currency: Currency; indexOfInput: number| undefined}>('farmForm/selectCurrency')
export const typeInput = createAction<{  typedValue: string; indexOfInput: number| undefined}>('farmForm/typeInput')
export const addInput = createAction('farmForm/addInput')
export const resetToInitialState = createAction('farm/resetToInitialState')
export const setSelectedInputLPToken = createAction<{ lpTokenPair: Pair | null }>('/blend/setSelectedInputLPToken')
export const removeInput = createAction<{indexOfInput: number; selectedCurrency: Currency | undefined}>('farmForm/removeInput')

