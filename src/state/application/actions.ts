import { createAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

export type PopupContent =
  | {
    txn: {
      hash: string
      success: boolean
      summary?: string
    }
  }
  | {
    listUpdate: {
      listUrl: string
      oldList: TokenList
      newList: TokenList
      auto: boolean
    }
  }
  | {
    notify: {
      summary?: string
      success: boolean
    }
  }

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  FARMS_MENU,
  VAULT_MENU,
  DELEGATE,
  VOTE,
  NETWORK,
  APPS_MENU,
  BYOF_MYFARM_MENU,
  CUSTOM_FARM_MENU,
  PARTNERS_MENU
}

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup = createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>(
  'application/addPopup'
)
export const removePopup = createAction<{ key: string }>('application/removePopup')
