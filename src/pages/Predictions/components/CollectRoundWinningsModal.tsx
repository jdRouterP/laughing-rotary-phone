import React, { useState } from 'react'
import styled from 'styled-components'
import {
  ModalContainer,
  ModalBody,
  ModalTitle,
  ModalHeader,
  InjectedModalProps,
  Button,
  AutoRenewIcon,
  TrophyGoldIcon,
  Text,
  Flex,
  Heading,
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

interface CollectRoundWinningsModalProps extends InjectedModalProps {
  payout: number
  roundId: string
  epoch: number
  onSuccess?: () => Promise<void>
}

const Modal = styled(ModalContainer)`
  overflow: visible;
`

const BunnyDecoration = styled.div`
  position: absolute;
  top: -116px; // line up bunny at the top of the modal
  left: 0px;
  text-align: center;
  width: 100%;
`

const CollectRoundWinningsModal: React.FC<CollectRoundWinningsModalProps> = ({
  payout,
  roundId,
  epoch,
  onDismiss,
  onSuccess,
}) => {
  const [isPendingTx, setIsPendingTx] = useState(false)
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
      <BunnyDecoration>
        <img src="/images/decorations/prize-bunny.png" alt="bunny decoration" height="124px" width="168px" />
      </BunnyDecoration>
      <ModalHeader>
        <ModalTitle>
          <Heading>{t('Collect Winnings')}</Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>
      <ModalBody p="24px">
        <TrophyGoldIcon width="96px" mx="auto" mb="24px" />
        <Flex alignItems="start" justifyContent="space-between" mb="24px">
          <Text>{t('Collecting')}</Text>
          <Box style={{ textAlign: 'right' }}>
            <Text>{`${formatToken(payout)} MATIC`}</Text>
            {/* <Text fontSize="12px" color="textSubtle">
              {`~$${formatToken(tokenusdPrice.times(payout).toNumber())}`}
            </Text> */}
          </Box>
        </Flex>
        <Button
          width="100%"
          mb="8px"
          onClick={handleClick}
          isLoading={isPendingTx}
          endIcon={isPendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
        >
          {t('Confirm')}
        </Button>
      </ModalBody>
    </Modal>
  )
}

export default CollectRoundWinningsModal
