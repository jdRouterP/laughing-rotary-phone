import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('swap/selectCurrency')
export const switchCurrencies = createAction<void>('swap/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('swap/typeInput')
export const setLimitOrders = createAction<{ orders: any[] }>('swap/setLimitOrders')
export const setLimitOrder = createAction<{ order: any }>('swap/setLimitOrder')
export const orderStatusType = createAction<{ status: string }>('swap/orderStatus')
