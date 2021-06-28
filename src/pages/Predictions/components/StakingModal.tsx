import React, { useState, useCallback } from 'react'
// import useIsArgentWallet from '../../hooks/useIsArgentWallet'
// import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from 'components/Modal'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components'
import { RowBetween } from 'components/Row'
import { TYPE, CloseIcon } from '../../../theme'
import { ButtonConfirmed, ButtonError } from 'components/Button'
import ProgressCircles from 'components/ProgressSteps'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { TokenAmount } from '@uniswap/sdk'
// import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../../utils/maxAmountSpend'
import { useVaultContract } from '../../../hooks/useContract'
import { useApproveCallback, ApprovalState } from '../../../hooks/useApproveCallback'
// import { splitSignature } from 'ethers/lib/utils'
import { StakingInfo, useDerivedStakeInfo } from '../../../state/vault/hooks'
// import { wrappedCurrencyAmount } from '../../utils/wrappedCurrency'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { WMATIC } from '../../../constants'

// const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
//   display: flex;
//   justify-content: space-between;
//   padding-right: 20px;
//   padding-left: 20px;

//   opacity: ${({ dim }) => (dim ? 0.5 : 1)};
// `

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
  userLiquidityUnstaked: TokenAmount | undefined
}

export default function StakingModal({ isOpen, onDismiss, stakingInfo, userLiquidityUnstaked }: StakingModalProps) {

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, stakingInfo.stakedAmount.token, userLiquidityUnstaked)
  // const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId)

  // let hypotheticalRewardRate: TokenAmount = new TokenAmount(stakingInfo.rewardRate.token, '0')
  // if (parsedAmountWrapped?.greaterThan('0')) {
  //   hypotheticalRewardRate = stakingInfo.getHypotheticalRewardRate(
  //     stakingInfo.stakedAmount.add(parsedAmountWrapped),
  //     stakingInfo.totalStakedAmount.add(parsedAmountWrapped),
  //     stakingInfo.interestRate
  //   )

  // }

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])


  // approval data for stake
  // const deadline = useTransactionDeadline()
  // const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, stakingInfo.vaultAddress)

  // const isArgentWallet = useIsArgentWallet()
  const vaultContract = useVaultContract(stakingInfo.vaultAddress)
  // const tokenContract = useTokenContract(stakingInfo?.rewardToken.address)
  async function onStake() {
    setAttempting(true)
    if (vaultContract && parsedAmount) {
      if (approval === ApprovalState.APPROVED) {
        console.log("stake ", parsedAmount.raw.toString(16));
        await vaultContract.stake(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Deposit Tokens`
          })
          setHash(response.hash)
        })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  //TODO: get reward token from contract
  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Set Position</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={WMATIC}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={'Available to bet: '}
            id="bet-token"
          />

          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={approveCallback}
              confirmed={approval === ApprovalState.APPROVED}
              disabled={approval !== ApprovalState.NOT_APPROVED}
            >
              Approve
            </ButtonConfirmed>
            <ButtonError
              disabled={!!error || (approval !== ApprovalState.APPROVED)}
              error={!!error && !!parsedAmount}
              onClick={onStake}
            >
              {error ?? 'Deposit'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Depositing DFYN Tokens</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} DFYN</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Deposited {parsedAmount?.toSignificant(4)} DFYN</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
