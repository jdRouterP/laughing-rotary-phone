
import { CurrencyAmount, JSBI, Token } from '@dfyn/sdk'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ButtonConfirmed, ButtonError, ButtonLight } from 'components/Button'
import Column, { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import ProgressSteps from 'components/ProgressSteps'
// import { CardNoise } from 'components/earn/styled'
import Loader from 'components/Loader'
import Modal from 'components/Modal'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { DFYN_CHEST, vDFYN } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useDfynChestContract } from 'hooks/useContract'
import useStake from 'pages/Predictions/hooks/useStake'
import React, { useCallback, useMemo, useState, useContext } from 'react'
import { useWalletModalToggle } from 'state/application/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useDfynChestInfo } from 'state/vDfyn/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from 'theme'
import { BIG_INT_ZERO } from 'utils/bigNumber'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { tryParseAmount } from 'state/swap/hooks'
import { Text } from 'rebass'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import { CheckCircle } from 'react-feather'
import MetaMaskLogo from '../../assets/images/metamask.png'

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
`

const UNIAmount = styled.div`
  color: white;
  border-radius: 10px;
  margin: auto;
  font-size: 15px;
  padding: 4px 8px;
  font-weight: 500;
  border: 1px solid linear-gradient(91.39deg, rgba(255, 0, 122, 0.2) -3.42%, rgba(33, 144, 229, 0.2) 120.56%);;
  background-color: ${({ theme }) => theme.bg3};
  background: linear-gradient(91.39deg, rgba(255, 0, 122, 0.2) -3.42%, rgba(33, 144, 229, 0.2) 120.56%);
`

const StyleBalance = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0 0.75rem 0;
`

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

export default function InputComponent({ label, token }: { label: string, token: Token }) {
    const theme = useContext(ThemeContext)
    const [isOpen, setIsOpen] = useState(false)
    const [typedValue, setTypedValue] = useState('')
    const { account, chainId, library } = useActiveWeb3React()
    let balance = useCurrencyBalance(account ?? undefined, token)
    let dfynChestInfo = useDfynChestInfo();
    const staking = label === "Stake DFYN"
    const dust = JSBI.BigInt("10000000000000000"); //TODO

    const {
        parsedAmount,
        error: swapInputError
    } = useStake(typedValue, token, balance)

    const [approval, approveCallback] = useApproveCallback(parsedAmount, DFYN_CHEST)
    const [approvalSubmitted,] = useState<boolean>(false)
    const showApproveFlow =
        !swapInputError &&
        (approval === ApprovalState.NOT_APPROVED ||
            approval === ApprovalState.PENDING ||
            (approvalSubmitted && approval === ApprovalState.APPROVED))

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
        setTypedValue('')
    }, [])

    async function onStakeEnter() {
        setIsOpen(true)
        setAttempting(true)
        if (dfynChestContract && parsedAmount) {
            if (approval === ApprovalState.APPROVED) {

                await dfynChestContract.enter(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 }).then((response: TransactionResponse) => {
                    addTransaction(response, {
                        summary: `Deposited ${parsedAmount.toSignificant(3)} DFYN`
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
                    summary: `Deposited ${parsedAmount.toSignificant(3)} vDFYN & Unstaked DFYN`
                })
                setHash(response.hash)
            })
                .catch((error: any) => {
                    setAttempting(false)
                    setIsOpen(false)
                    console.log(error)
                })
        }
    }

    const {
        ratioDfyn,
        ratioVDfyn
    } = useDfynChestInfo()

    const value1: Number = Number(ratioDfyn) * Number(typedValue)
    const value2: Number = Number(ratioVDfyn) * Number(typedValue)
    // for Insufficeint Balance
    const inputAmount = useMemo(() => tryParseAmount(typedValue, token), [token, typedValue])
    const balanceValue = useMemo(() => {
        return inputAmount && balance && !balance.lessThan(inputAmount)
    }, [inputAmount, balance])


    //Currency add to the Metamask
    const { addToken, success } = useAddTokenToMetamask(vDFYN)

    return (
        <BodyStyle>
            <RowBetween>
                <TYPE.black>{label}</TYPE.black>
                <UNIWrapper>
                    <UNIAmount>
                        <TYPE.white padding="0 2px">
                            {`1 vDFYN = ${dfynChestInfo?.ratio.toFixed(4) ?? '-'} DFYN`}
                        </TYPE.white>
                    </UNIAmount>
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
                {typedValue && (label === "Stake DFYN" ?
                    <>
                        <StyleBalance>
                            <Text fontWeight={500} fontSize={14} color={theme.text2}>
                                 You Receive &nbsp;&nbsp;&nbsp;~{value2.toFixed(3)} vDFYN 
                            </Text>
                            <Text fontWeight={500} fontSize={14} color={theme.text2}>
                               
                            </Text>
                        </StyleBalance>  
                    </>
                    : 
                    <>
                        <StyleBalance>
                           
                            <Text fontWeight={500} fontSize={14} color={theme.text2}>
                                You Receive &nbsp;&nbsp;&nbsp;~{value1.toFixed(3)} DFYN
                            </Text>
                            <Text fontWeight={500} fontSize={14} color={theme.text2}>
                            </Text>
                        </StyleBalance>  
                    </>
                )
                }
                <RowBetween mt={"20px"}>
                    {account ?
                        (staking ?
                            <>
                                {showApproveFlow && <ButtonConfirmed
                                    mr="0.5rem"
                                    onClick={approveCallback}
                                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                    altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                                    confirmed={approval === ApprovalState.APPROVED}
                                >
                                    {approval === ApprovalState.PENDING ? (
                                        <AutoRow gap="6px" justify="center">
                                            Approving <Loader stroke="white" />
                                        </AutoRow>
                                    ) : (
                                        'Approve DFYN'
                                    )}
                                </ButtonConfirmed>}
                                <ButtonError
                                    onClick={onStakeEnter}
                                    disabled={!!swapInputError || (approval !== ApprovalState.APPROVED)}
                                    error={!!swapInputError && !!parsedAmount}
                                >
                                    {!balanceValue && balanceValue !== undefined ? 'Insufficient balance' : swapInputError ?? 'Deposit'}
                                </ButtonError>

                            </>
                            :
                            <ButtonError
                                onClick={onStakeLeave}
                                disabled={!!swapInputError}
                                error={!!swapInputError && !!parsedAmount}
                            >
                                {!balanceValue && balanceValue !== undefined ? 'Insufficient balance' : swapInputError ?? 'Unstake'}
                            </ButtonError>
                        ) :
                        <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>}
                </RowBetween>
                {showApproveFlow && label === 'Stake DFYN' && (
                    <Column style={{ marginTop: '1rem' }}>
                        <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                    </Column>
                )}
            </InputRow>
            <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
                {attempting && !hash && (
                    <LoadingView onDismiss={wrappedOnDismiss}>
                        <AutoColumn gap="12px" justify={'center'}>
                            <TYPE.largeHeader> {staking ? "Staking DFYN" : "Unstaking DFYN" ?? '-'} Tokens</TYPE.largeHeader>
                            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} {staking ? "DFYN" : "vDFYN" ?? '-'}</TYPE.body>
                        </AutoColumn>
                    </LoadingView>
                )}
                {attempting && hash && (
                    <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
                        <AutoColumn gap="12px" justify={'center'}>
                            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
                            <TYPE.body fontSize={20}>${parsedAmount?.toSignificant(4)} {staking ? `DFYN Staked` : `vDFYN Burnt` ?? '-'}</TYPE.body>
                            {label === "Stake DFYN" && library?.provider?.isMetaMask && (
                                <ButtonLight mt="12px" padding="6px 12px" width="fit-content" onClick={addToken}>
                                {!success ? (
                                    <RowFixed>
                                    Add {vDFYN.symbol} to Metamask <StyledLogo src={MetaMaskLogo} />
                                    </RowFixed>
                                ) : (
                                    <RowFixed>
                                    Added {vDFYN.symbol}{' '}
                                    <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
                                    </RowFixed>
                                )}
                                </ButtonLight>
                            )}
                        </AutoColumn>
                    </SubmittedView>
                )}
            </Modal>
        </BodyStyle>

    )
}
