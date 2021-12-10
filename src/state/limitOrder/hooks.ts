import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { useActiveWeb3React } from '../../hooks'
import { Field, selectCurrency, setLimitOrders, setLimitOrder, switchCurrencies, typeInput, orderStatusType } from './actions'
import { Currency, Token } from '@dfyn/sdk'

export function useLimitOrderState(): AppState['limitOrder'] {
    return useSelector<AppState, AppState['limitOrder']>(state => state.limitOrder)
}

export function useSwapActionHandlers(): {
    onCurrencySelection: (field: Field, currency: Currency) => void
    onSwitchTokens: () => void
    onUserInput: (field: Field, typedValue: string) => void
    onSetLimitOrders: (orders: any[]) => void
    onSetLimitOrder: (order: any) => void
    onOrderStatusType: (status: string) => void
  } {
    const { chainId } = useActiveWeb3React()
    const dispatch = useDispatch<AppDispatch>()
    const onCurrencySelection = useCallback(
      (field: Field, currency: Currency) => {
        dispatch(
          selectCurrency({
            field,
            currencyId:
              currency instanceof Token
                ? currency.address
                : currency === Currency.getNativeCurrency(chainId)
                  ? Currency.getNativeCurrencySymbol(chainId) || 'MATIC' : '',
          })
        )
      },
      [dispatch, chainId]
    )
  
    const onSwitchTokens = useCallback(() => {
      dispatch(switchCurrencies())
      
    }, [dispatch])

    const onSetLimitOrders = useCallback((orders: any[]) => {
      dispatch(setLimitOrders({ orders }))
      
    }, [dispatch])

    const onSetLimitOrder = useCallback((order: any) => {
      dispatch(setLimitOrder({ order }))
      
    }, [dispatch])
  
    const onUserInput = useCallback(
      (field: Field, typedValue: string) => {
        dispatch(typeInput({ field, typedValue }))
      },
      [dispatch]
    )

    const onOrderStatusType = useCallback(
      (status: string) => {
        dispatch(orderStatusType({ status }))
      },
      [dispatch]
    )
  
    return {
      onSwitchTokens,
      onCurrencySelection,
      onUserInput,
      onSetLimitOrders,
      onSetLimitOrder,
      onOrderStatusType
    }
  }