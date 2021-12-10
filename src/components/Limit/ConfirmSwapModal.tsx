import { CurrencyAmount } from '@dfyn/sdk'
import React, { useCallback } from 'react'
import { Field } from 'state/swap/actions'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '../TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */


export default function ConfirmSwapModal({
  onAcceptChanges,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  inputAmount,
  outputAmount,
  marketPrice
}: {
  isOpen: boolean
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
  inputAmount: CurrencyAmount | undefined
  outputAmount: string
  marketPrice: string
}) {
  const {
    currencies
  } = useDerivedSwapInfo()
  const modalHeader = useCallback(() => {
    return (
      <SwapModalHeader
        recipient={recipient}
        onAcceptChanges={onAcceptChanges}
        inputAmount={inputAmount}
        outputAmount={outputAmount}
        marketPrice={marketPrice}
      />
    )
  }, [onAcceptChanges, recipient, inputAmount, outputAmount, marketPrice])

  const modalBottom = useCallback(() => {
    return (
      <SwapModalFooter
        onConfirm={onConfirm}
        swapErrorMessage={swapErrorMessage}
      />
    )
  }, [onConfirm, swapErrorMessage])


  // text to show while loading
  const pendingText = `Submitting order to swap ${inputAmount?.toExact()} ${currencies[Field.INPUT]?.symbol ?? 'MATIC'} for ${outputAmount} ${currencies[Field.OUTPUT]?.symbol ?? 'DFYN'}`

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Limit Order"
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={currencies[Field.OUTPUT]}
    />
  )
}
