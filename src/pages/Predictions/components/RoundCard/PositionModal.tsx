import React, { useState, useCallback, useMemo } from 'react'
// import useIsArgentWallet from '../../hooks/useIsArgentWallet'
// import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from 'components/Modal'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components'
import { RowBetween, RowFlat } from 'components/Row'
import { TYPE, CloseIcon } from '../../../../theme'
import { ButtonError, ButtonLight } from 'components/Button'
import PositionTag from '../PositionTag'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { Currency, CurrencyAmount, JSBI } from '@dfyn/sdk'
// import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../../../utils/maxAmountSpend'
import { usePredictionContract } from '../../../../hooks/useContract'
// import { splitSignature } from 'ethers/lib/utils'
// import { wrappedCurrencyAmount } from '../../utils/wrappedCurrency'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import useDerivedBettingInfo from '../../hooks/useDerivedBettingInfo'
import { BetPosition } from 'state/prediction/types'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useGetMinBetAmount } from 'state/hook'
import { useActiveWeb3React } from 'hooks'
import { BIG_INT_ZERO } from 'utils/bigNumber'
import { useWalletModalToggle } from 'state/application/hooks'

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

interface SetPositionModalProps {
  isOpen: boolean
  onDismiss: () => void
  togglePosition: () => void
  position: BetPosition
  onSuccess: (decimalValue: string, hash: string) => Promise<void>
}

export default function StakingModal({ isOpen, position, togglePosition, onDismiss, onSuccess }: SetPositionModalProps) {

  const [typedValue, setTypedValue] = useState('')
  const { account, chainId } = useActiveWeb3React()
  let balance = useCurrencyBalance(account ?? undefined, Currency.getNativeCurrency(chainId ?? 137))
  const dust = JSBI.BigInt("10000000000000000"); //TODO
  const minBetAmountBalance = useGetMinBetAmount()
  const predictionsContract = usePredictionContract()

  const maxBalance = useMemo(() => {
    if (balance === undefined) {
      return new CurrencyAmount(Currency.getNativeCurrency(chainId ?? 137), BIG_INT_ZERO);
    }
    let dustToken = new CurrencyAmount(Currency.getNativeCurrency(chainId ?? 137), dust);
    return balance.greaterThan(dust) ? balance.subtract(dustToken) : balance
  }, [balance, dust, chainId])

  // track and parse user input

  const { parsedAmount, error } = useDerivedBettingInfo(typedValue, Currency.getNativeCurrency(chainId ?? 137), balance, minBetAmountBalance)

  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])
  // used for max input button
  const maxAmountInput = maxAmountSpend(maxBalance, chainId);
  const atMaxAmount = Boolean(maxAmountInput && balance?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])


  const toggleWalletModal = useWalletModalToggle()


  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setTypedValue('')
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  // const isArgentWallet = useIsArgentWallet()
  // const tokenContract = useTokenContract(stakingInfo?.rewardToken.address)
  async function handleEnterPosition() {
    if (!account) {
      toggleWalletModal()
    } else if (predictionsContract && parsedAmount) {
      setAttempting(true)
      const betMethod = position === BetPosition.BULL ? 'betBull' : 'betBear'
      console.log("bet ", parsedAmount.raw.toString(16), parsedAmount.toSignificant(3));
      predictionsContract?.[betMethod]({ value: `0x${parsedAmount.raw.toString(16)}`, gasLimit: 450000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Placed Bet!`
          })
          setAttempting(false)
          if (onSuccess) {
            onSuccess(parsedAmount.toSignificant(3), response.hash)
          }
        })
        .catch((error: any) => {
          setAttempting(false)
          console.error(error)
        })
    } else {
      setAttempting(false)
      throw new Error('Attempting to stake without approval or a signature. Please contact support.')
    }
  }


  //TODO: get reward token from contract
  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <RowFlat>
              <TYPE.mediumHeader>Set Position</TYPE.mediumHeader>
              <PositionTag betPosition={position} onClick={togglePosition}>
                {position === BetPosition.BULL ? 'BULL' : 'BEAR'}
              </PositionTag>
            </RowFlat>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={Currency.getNativeCurrency(chainId ?? 137)}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={'Available to bet: '}
            id="bet-token"
          />

          <RowBetween>
            {account ? <ButtonError
              disabled={!!error}
              error={!!error && !!parsedAmount}
              onClick={handleEnterPosition}
            >
              {error ?? 'Place Bet'}
            </ButtonError> : <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>}
          </RowBetween>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Depositing MATIC</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} MATIC</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Deposited {parsedAmount?.toSignificant(4)} MATIC</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
