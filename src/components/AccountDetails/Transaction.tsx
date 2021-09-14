import React, {useCallback} from 'react'
import styled from 'styled-components'
import { CheckCircle, Trash, Triangle } from 'react-feather'

import { useActiveWeb3React } from '../../hooks'
import { getExplorerLink } from '../../utils'
import { ExternalLink } from '../../theme'
import { useAllTransactions } from '../../state/transactions/hooks'
import { RowFixed } from '../Row'
import Loader from '../Loader'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { clearCurrentTransactions } from 'state/transactions/actions'
import { MouseoverTooltip } from 'components/Tooltip'

const TransactionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`


const TransactionStatusText = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  :hover {
    text-decoration: underline;
  }
`

const TransactionState = styled(ExternalLink) <{ pending: boolean; success?: boolean }>`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  text-decoration: none !important;
  border-radius: 0.5rem;
  padding: 0.25rem 0rem;
  font-weight: 500;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.primary1};
`

const IconWrapper = styled.div<{ pending: boolean; success?: boolean }>`
  color: ${({ pending, success, theme }) => (pending ? theme.primary1 : success ? theme.green1 : theme.red1)};
`

export default function Transaction({ hash }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()
  const dispatch = useDispatch<AppDispatch>()

  const tx = allTransactions?.[hash]
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  const clearCurrentTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearCurrentTransactions({ chainId, hash }))
  }, [dispatch, chainId, hash])

  if (!chainId) return null

  return (
    <TransactionWrapper>
      <TransactionState href={getExplorerLink(chainId, hash, 'transaction')} pending={pending} success={success}>
        <RowFixed>
          <TransactionStatusText>{summary ?? hash} ↗</TransactionStatusText>
        </RowFixed>
        <IconWrapper pending={pending} success={success}>
          {pending ? <Loader /> : success ? <CheckCircle size="16" /> : <Triangle size="16" />}
        </IconWrapper>
      </TransactionState>
      <MouseoverTooltip text="Remove from recents">
        <Trash size="16" onClick={clearCurrentTransactionsCallback} style={{margin: "3px 0", marginLeft: "10px", color: 'white', cursor: "pointer"}}/>
      </MouseoverTooltip>
    </TransactionWrapper>
  )
}
