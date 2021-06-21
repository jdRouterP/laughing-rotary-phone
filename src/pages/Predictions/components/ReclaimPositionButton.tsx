import React, { ReactNode, useState } from 'react'
import { AutoRenewIcon, Button, ButtonProps } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { usePredictionContract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionResponse } from '@ethersproject/providers'

interface ReclaimPositionButtonProps extends ButtonProps {
  epoch: number
  onSuccess?: () => Promise<void>
  children?: ReactNode
}

const ReclaimPositionButton: React.FC<ReclaimPositionButtonProps> = ({ epoch, onSuccess, children, ...props }) => {
  const [isPendingTx, setIsPendingTx] = useState(false)
  const { t } = useTranslation()
  const addTransaction = useTransactionAdder()
  const predictionsContract = usePredictionContract()

  const handleReclaim = async () => {
    if (predictionsContract) {
      setIsPendingTx(true)
      await predictionsContract
        .claim(epoch, { gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Position reclaimed!`
          })
          if (onSuccess) {
            await onSuccess()
          }
          setIsPendingTx(false)
        })
        .catch((error: any) => {
          setIsPendingTx(false)
          console.error(error)
        })
    }
  }

  return (
    <Button
      onClick={handleReclaim}
      isLoading={isPendingTx}
      endIcon={isPendingTx ? <AutoRenewIcon spin color="white" /> : null}
      {...props}
    >
      {children || t('Reclaim Position')}
    </Button>
  )
}

export default ReclaimPositionButton
