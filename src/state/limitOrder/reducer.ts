import { createReducer } from "@reduxjs/toolkit";
import { Field, selectCurrency, setLimitOrders, orderStatusType, setLimitOrder, switchCurrencies, typeInput } from "./actions";

export interface LimitOrderState {
  readonly independentField: Field;
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly typedValue: string
  readonly limitOrders: any[]
  readonly orderStatus: string
}

const initialState: LimitOrderState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: "",
  },
  [Field.OUTPUT]: {
    currencyId: "",
  },
  limitOrders: [],
  orderStatus: 'open'
}

export default createReducer<LimitOrderState>(initialState, (builder) =>
  builder
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        independentField:
          state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      };
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      };
    })
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT;
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField:
            state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        };
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId: currencyId },
        };
      }
    })
    .addCase(setLimitOrders, (state,  { payload: { orders } }) => {
      return {
        ...state,
        limitOrders: orders
      }
    })
    .addCase(setLimitOrder, (state,  { payload: { order } }) => {
      return {
        ...state,
        limitOrders: [...state.limitOrders, order]
      }
    })
    .addCase(orderStatusType, (state, { payload: { status }}) => {
      return {
        ...state,
        orderStatus: status
      }
    })
);
