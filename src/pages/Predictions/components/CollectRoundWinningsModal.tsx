import React, { useState } from 'react'
import styled from 'styled-components'
import {
  ModalContainer,
  ModalBody,
  ModalTitle,
  ModalHeader,
  InjectedModalProps,
  Flex,
  Box,
  ModalCloseButton,
} from '@pancakeswap/uikit'
import { TransactionResponse } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useDispatch } from 'react-redux'
import { markBetAsCollected } from 'state/prediction/reducer'
import { useTranslation } from 'react-i18next'
import { usePredictionContract } from 'hooks/useContract'
import { formatToken } from '../helpers'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TYPE } from 'theme'
import { ButtonPrimary } from 'components/Button'

interface CollectRoundWinningsModalProps extends InjectedModalProps {
  payout: number
  roundId: string
  epoch: number
  onSuccess?: () => Promise<void>
}

const Modal = styled(ModalContainer)`
  overflow: visible;
`

const CollectRoundWinningsModal: React.FC<CollectRoundWinningsModalProps> = ({
  payout,
  roundId,
  epoch,
  onDismiss,
  onSuccess,
}) => {
  const [, setIsPendingTx] = useState(false)
  const { account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const { t } = useTranslation()
  const [, setHash] = useState<string | undefined>()
  const predictionsContract = usePredictionContract()
  const dispatch = useDispatch()

  const handleClick = async () => {

    if (predictionsContract && account) {
      setIsPendingTx(true)
      await predictionsContract
        .claim(epoch, { gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          dispatch(markBetAsCollected({ account, roundId }))
          addTransaction(response, {
            summary: `Winnings collected!`
          })
          if (onSuccess) {
            await onSuccess()
          }
          setIsPendingTx(false)
          setHash(response.hash)
        })
        .catch((error: any) => {
          setIsPendingTx(false)
          onDismiss && onDismiss()
          console.error(error)
        })
    }
  }

  return (
    <Modal minWidth="288px" position="relative" mt="124px">
      <ModalHeader>
        <ModalTitle>
          <TYPE.mediumHeader>{t('Collect Winnings')}</TYPE.mediumHeader>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>
      <ModalBody p="24px">
        {/* <TrophyGoldIcon width="96px" mx="auto" mb="24px" /> */}
        <Flex alignItems="start" justifyContent="space-between" mb="24px">
          <TYPE.main>{t('Collecting')}</TYPE.main>
          <Box style={{ textAlign: 'right' }}>
            <TYPE.main>{`${formatToken(payout)} MATIC`}</TYPE.main>
            {/* <Text fontSize="12px" color="textSubtle">
              {`~$${formatToken(tokenusdPrice.times(payout).toNumber())}`}
            </Text> */}
          </Box>
        </Flex>
        <ButtonPrimary
          width="100%"
          onClick={handleClick}
        >
          {t('Confirm')}
        </ButtonPrimary>
      </ModalBody>
    </Modal>
  )
}

export default CollectRoundWinningsModal
