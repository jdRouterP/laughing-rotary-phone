import { CurrencyAmount, JSBI, Token } from '@dfyn/sdk'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ButtonConfirmed, ButtonError, ButtonLight } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { CardNoise } from 'components/earn/styled'
import Modal from 'components/Modal'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { RowBetween } from 'components/Row'
import { DFYN_CHEST } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useDfynChestContract } from 'hooks/useContract'
import useStake from 'pages/Predictions/hooks/useStake'
import React, { useCallback, useMemo, useState } from 'react'
import { useWalletModalToggle } from 'state/application/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useDfynChestInfo } from 'state/vDfyn/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { BIG_INT_ZERO } from 'utils/bigNumber'
import { maxAmountSpend } from 'utils/maxAmountSpend'

const InputRow = styled.div`
    width: 100%;
    align-items: center;
    border-radius: 10px;
    padding: 0.75rem 0 0.75rem 0;
`


const BodyStyle = styled.div`
    width: 100%;
`
const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const UNIAmount = styled.div`
  color: white;
  border-radius: 10px;
  margin: auto;
  padding: 4px 8px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

export default function InputComponent({ label, token }: { label: string, token: Token }) {
    const [isOpen, setIsOpen] = useState(false)
    const [typedValue, setTypedValue] = useState('')
    const { account, chainId } = useActiveWeb3React()
    let balance = useCurrencyBalance(account ?? undefined, token)
    let dfynChestInfo = useDfynChestInfo();

    const dust = JSBI.BigInt("10000000000000000"); //TODO

    const {
        parsedAmount,
        error: swapInputError
    } = useStake(typedValue, token, balance)

    const [approval, approveCallback] = useApproveCallback(parsedAmount, DFYN_CHEST)

    const maxBalance = useMemo(() => {
        if (balance === undefined) {
            return new CurrencyAmount(token, BIG_INT_ZERO);
        }
        let dustToken = new CurrencyAmount(token, dust);

        return balance.greaterThan(dust) ? balance.subtract(dustToken) : balance
    }, [balance, dust, token])


    const toggleWalletModal = useWalletModalToggle()

    const onUserInput = useCallback((typedValue: string) => {
        setTypedValue(typedValue)
    }, [])

    // used for max input button
    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(maxBalance, chainId)

    const atMaxAmount = Boolean(maxAmountInput && balance?.equalTo(maxAmountInput))
    const handleMax = useCallback(() => {
        maxAmountInput && onUserInput(maxAmountInput.toExact())
    }, [maxAmountInput, onUserInput])

    const dfynChestContract = useDfynChestContract()
    const [attempting, setAttempting] = useState<boolean>(false)
    const addTransaction = useTransactionAdder()
    const [hash, setHash] = useState<string | undefined>()
    const wrappedOnDismiss = useCallback(() => {
        setHash(undefined)
        setAttempting(false)
        setIsOpen(false)
    }, [])

    async function onStakeEnter() {
        setIsOpen(true)
        setAttempting(true)
        if (dfynChestContract && parsedAmount) {
            if (approval === ApprovalState.APPROVED) {

                await dfynChestContract.enter(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 }).then((response: TransactionResponse) => {
                    addTransaction(response, {
                        summary: `Deposit Tokens`
                    })
                    setHash(response.hash)
                })
                    .catch((error: any) => {
                        setAttempting(false)
                        setIsOpen(false)
                        console.log(error)
                    })
            } else {
                setAttempting(false)
                setIsOpen(false)
                throw new Error('Attempting to stake without approval or a signature. Please contact support.')
            }
        }
    }

    async function onStakeLeave() {
        setIsOpen(true)
        setAttempting(true)
        if (dfynChestContract && parsedAmount) {
            await dfynChestContract.leave(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 }).then((response: TransactionResponse) => {
                addTransaction(response, {
                    summary: `Deposit Tokens`
                })
                setHash(response.hash)
            })
                .catch((error: any) => {
                    setAttempting(false)
                    console.log(error)
                })
        }
    }

    return (
        <BodyStyle>
            <RowBetween>
                <TYPE.black>{label}</TYPE.black>
                <UNIWrapper>
                    <UNIAmount>
                        <TYPE.white padding="0 2px">
                            {`1 DFYN = ${dfynChestInfo?.DFYNtovDFYN.toSignificant(2) ?? '-'} vDFYN`}
                        </TYPE.white>
                    </UNIAmount>
                    <CardNoise />
                </UNIWrapper>
            </RowBetween>
            <InputRow>
                <CurrencyInputPanel
                    value={typedValue}
                    onUserInput={onUserInput}
                    onMax={handleMax}
                    showMaxButton={atMaxAmount}
                    currency={token}
                    label={''}
                    disableCurrencySelect={true}
                    customBalanceText={'Balance: '}
                    id="stake"
                />
                <RowBetween mt={"20px"}>
                    {account ?
                        (label === "Stake DFYN" ?
                            <>
                                <ButtonConfirmed
                                    mr="0.5rem"
                                    onClick={approveCallback}
                                    confirmed={approval === ApprovalState.APPROVED}
                                    disabled={approval !== ApprovalState.NOT_APPROVED}
                                >
                                    Approve
                                </ButtonConfirmed>
                                <ButtonError
                                    onClick={onStakeEnter}
                                    disabled={!!swapInputError || (approval !== ApprovalState.APPROVED)}
                                    error={!!swapInputError && !!parsedAmount}
                                >
                                    {swapInputError ?? 'Deposit'}
                                </ButtonError>
                            </>
                            :
                            <ButtonError
                                onClick={onStakeLeave}
                                disabled={!!swapInputError}
                                error={!!swapInputError && !!parsedAmount}
                            >
                                {swapInputError ?? 'Deposit'}
                            </ButtonError>
                        ) :
                        <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>}
                </RowBetween>
            </InputRow>
            <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
                {attempting && !hash && (
                    <LoadingView onDismiss={wrappedOnDismiss}>
                        <AutoColumn gap="12px" justify={'center'}>
                            <TYPE.largeHeader>Depositing {label === "Stake DFYN" ? "DFYN" : "vDFYN" ?? '-'} Tokens</TYPE.largeHeader>
                            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} {label === "Stake DFYN" ? "DFYN" : "vDFYN" ?? '-'}</TYPE.body>
                        </AutoColumn>
                    </LoadingView>
                )}
                {attempting && hash && (
                    <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
                        <AutoColumn gap="12px" justify={'center'}>
                            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
                            <TYPE.body fontSize={20}>Deposited {parsedAmount?.toSignificant(4)} {label === "Stake DFYN" ? "DFYN" : "vDFYN" ?? '-'}</TYPE.body>
                        </AutoColumn>
                    </SubmittedView>
                )}
            </Modal>
        </BodyStyle>

    )
}
