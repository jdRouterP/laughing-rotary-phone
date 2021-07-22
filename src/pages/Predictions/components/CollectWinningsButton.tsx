import React from 'react'
import { ButtonProps } from '@pancakeswap/uikit'
import { ButtonPrimary } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
import { usePredictionContract } from 'hooks/useContract'
import { useDispatch } from 'react-redux'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { markBetAsCollected } from 'state/prediction/reducer'
import { useWalletModalToggle } from 'state/application/hooks'

interface CollectWinningsButtonProps extends ButtonProps {
  payout: number
  roundId: string
  epoch: number
  hasClaimed: boolean
  onSuccess?: () => Promise<void>
}

const CollectWinningsButton: React.FC<CollectWinningsButtonProps> = ({
  payout,
  roundId,
  epoch,
  hasClaimed,
  onSuccess,
  children,
}) => {
  // const [onPresentCollectWinningsModal] = useModal(
  //   <CollectRoundWinningsModal payout={payout} roundId={roundId} epoch={epoch} onSuccess={onSuccess} />,
  //   false,
  // )
  const { account } = useActiveWeb3React()
  const predictionsContract = usePredictionContract()
  const addTransaction = useTransactionAdder()
  const dispatch = useDispatch()

  // const [attempting, setAttempting] = useState<boolean>(false)
  // const [hash, setHash] = useState<string | undefined>()
  // const wrappedOnDismiss = useCallback(() => {
  //   setHash(undefined)
  //   setAttempting(false)
  //   onDismiss()
  // }, [onDismiss])
  const toggleWalletModal = useWalletModalToggle()

  const handleClick = async () => {

    if (!account) {
      toggleWalletModal()
    } else if (predictionsContract) {
      // setAttempting(true)
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
          // setAttempting(false)
        })
        .catch((error: any) => {
          // setAttempting(false)
          // onDismiss && onDismiss()
          console.error(error)
        })
    }
  }

  return (
    <ButtonPrimary padding={"12px"}
      width={"30%"} onClick={handleClick} disabled={hasClaimed}>
      {children}
    </ButtonPrimary>
  )
}

export default CollectWinningsButton
