import React, { ReactNode, useContext, useState } from 'react'
import { ButtonProps } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { usePredictionContract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { ButtonPrimary } from 'components/Button'
import { AddressContext } from '../PredictionDesktop'

interface ReclaimPositionButtonProps extends ButtonProps {
  epoch: number
  onSuccess?: () => Promise<void>
  children?: ReactNode
}

const ReclaimPositionButton: React.FC<ReclaimPositionButtonProps> = ({ epoch, onSuccess, children, ...props }) => {
  const [, setIsPendingTx] = useState(false)
  const { t } = useTranslation()
  const addTransaction = useTransactionAdder()
  const AddressValue = useContext(AddressContext)
  const predictionsContract = usePredictionContract(AddressValue)

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
    <ButtonPrimary
      padding={"7px"}
      width={"30%"}
      onClick={handleReclaim}>
      {children || t('Reclaim Position')}
    </ButtonPrimary>
  )
}

export default ReclaimPositionButton
