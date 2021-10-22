
import { ChainId, Currency, CurrencyAmount, Token, WETH } from '@dfyn/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus, X } from 'react-feather'
import styled, { css, ThemeContext } from 'styled-components'
import { ButtonConfirmed, ButtonError, ButtonLight } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow } from '../../components/Row'
// import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import { Wrapper } from '../../components/swap/styleds'
// import useToggledVersion from '../../hooks/useToggledVersion'
// import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/swap/actions'
// import {
//     useDerivedSwapInfo,
// } from '../../state/swap/hooks'
import { TYPE } from '../../theme'
import AppBody from '../AppBody'
// import { useIsTransactionUnsupported } from 'hooks/Trades'
// import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
// import { RouteComponentProps } from 'react-router-dom'
import { useBlendActionHandlers, useBlendState, useDefaultsFromURLSearchFusion, useDerivedBlendInfo, useGetOutputTokenAmount, useInputToMaticToken } from 'state/blend/hooks'
import { useUserSlippageTolerance } from 'state/user/hooks'
import TransactionSettingFusion from './TransactionSettingFusion'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState, useApproveCallbackArr } from 'hooks/useApproveCallback'
import { BLEND_ADDRESS } from 'constants/index'
import Loader from 'components/Loader'
import _get from 'lodash.get'
import useBlend from 'pages/Predictions/hooks/useBlend'
import { useWalletModalToggle } from 'state/application/hooks'
import { useDispatch } from 'react-redux'
// import { inputCurrencyTrade, totalMatic } from 'state/blend/actions'
import { useDfynFusionContract } from 'hooks/useContract'
import Modal from 'components/Modal'
import { useTransactionAdder } from 'state/transactions/hooks'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { setLatestUpdatedTokenId, setSelectedInputLPToken } from 'state/blend/actions'
import { AppDispatch } from 'state'
import { parseUnits } from '@ethersproject/units'
import { CustomInputLPToMaticConversion, CustomInputToMaticConversion, CustomMaticToMaticConversion } from 'state/blend/reducer'
import { useAllTokens, useCurrency } from 'hooks/Tokens'
import TokenWarningModal from 'components/TokenWarningModal'
import { RouteComponentProps } from 'react-router'
// import { useTradeExactIn } from '../../hooks/Trades'
// import { useDfynFusionContract } from 'hooks/useContract'


const CurrencyWrapper = styled.div<{ inputValue: number, value: number }>`
    position: relative;
    margin-top: 15px;
    ${({ inputValue, value }) => (inputValue - 1 === value) ?
        null
        : css`
        display: flex;
        flex-direction: column-reverse;
        `
    }
`
const ButtonAdd = styled.button`
    margin-top: 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 6px;
    background-color: transparent;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.primary1};
    text-align: center;
    margin: auto;
    background: none;
    padding: 10px 20px;
    font-size: 14px;
    :hover {
        background-color: #2172E57A;
    }
`

const ButtonInsufficient = styled.button`
    margin-top: 10px;
    justify-content: center;
    width: 100%;
    padding: 6px;
    background-color: transparent;
    border-radius: 10px;
    border: 1px solid red;
    text-align: center;
    background: none;
    padding: 5px 20px;
`
const TopSection = styled.div`
    padding: 18px 1rem 0px 1.5rem;
    margin-bottom: -4px;
    width: 100%;
    max-width: 420px;
    color: ${({ theme }) => theme.text2};
`

const CloseWrapper = styled.div<{ clickable: boolean }>`
    position: absolute;
    z-index: 1;
    text-align: center;
    background-color: rgba(231, 76, 60,0.7);
    border-radius: 50%;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 10px;

    width: 24px;
    height: 24px;
    top: -8px;
    right: -8px;

    div{
        align-content: center;
        width: 100%;
        display: inline-grid;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
    }

    ${({ clickable }) =>
        clickable
            ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
            : null}
`

const InnerContent = styled.div`
        display: flex;
        flex-direction: column;
`

export default function Fusion({ history }: RouteComponentProps) {
    const loadedUrlParams = useDefaultsFromURLSearchFusion()
    
     // token warning stuff
    const [loadedInputCurrency, loadedOutputCurrency] = [
        useCurrency(loadedUrlParams?.inputCurrencyId),
        useCurrency(loadedUrlParams?.outputCurrencyId)
    ]
    const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
    const urlLoadedTokens: Token[] = useMemo(
        () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
        [loadedInputCurrency, loadedOutputCurrency]
    )
    const handleConfirmTokenWarning = useCallback(() => {
        setDismissTokenWarning(true)
    }, [])

    // dismiss warning if all imported tokens are in active lists
    const defaultTokens = useAllTokens()
    const importTokensNotInDefault =
        urlLoadedTokens &&
        urlLoadedTokens.filter((token: Token) => {
        return !Boolean(token.address in defaultTokens)
    })

      // reset if they close warning without tokens in params
    const handleDismissTokenWarning = useCallback(() => {
        setDismissTokenWarning(true)
        history.push('/dfynFusion/')
    }, [history])

    const dfynFusionContract = useDfynFusionContract()
    const dispatch = useDispatch<AppDispatch>()
    const theme = useContext(ThemeContext)
    const toggleWalletModal = useWalletModalToggle()
    const { account, chainId = ChainId.MATIC } = useActiveWeb3React()
    // swap state
    const wrappedNativeToken = WETH[chainId]
    const nativeCurrencySymbol = Currency.getNativeCurrencySymbol(chainId) || ""

    const { onCurrencySelection, addInputBox, removeInputBox, onUserInput, onResetToInitialState } = useBlendActionHandlers()

    //blend state
    const {
        typedValues,
        [Field.INPUT]: inputCurrencyIds,
        inputToMaticConversion,
        inputLPToMaticConversion,
        maticToMaticConversion,
        lpTokenPairs,
        outputTokenToMatic,
        latestUpdatedTokenId
    } = useBlendState()
    const { outputTokenAmount, totalMaticValue } = outputTokenToMatic

    const { inputCurrencyArr, outputCurrency,
    } = useDerivedBlendInfo()

    //Returns all selected token (FROM tokens + TO token)
    const fetchAllSelectedCurrencies = useCallback(() => {
        const selectedOutputCurrency = outputCurrency === null ? undefined : outputCurrency;
        return [...inputCurrencyArr, selectedOutputCurrency]
    }, [inputCurrencyArr, outputCurrency])
    //Validates whether given currency is already present in selected tokens list
    const isCurrencySelected = useCallback((selectedCurrency: Currency | undefined) => {
        const allSelectedCurrencies = fetchAllSelectedCurrencies()
        return allSelectedCurrencies.find(c => c && selectedCurrency && _get(selectedCurrency, 'address', selectedCurrency.symbol) === _get(c, 'address', c.symbol))
    }, [fetchAllSelectedCurrencies])

    const handleTypeInput = useCallback(
        (value: string, i: number) => {
            onUserInput(value, i)
            const latestUpdatedToken = inputCurrencyArr[i]
            dispatch(setLatestUpdatedTokenId({ latestUpdatedTokenId: _get(latestUpdatedToken, 'address', latestUpdatedToken?.symbol) }))
        },
        [onUserInput, dispatch, inputCurrencyArr]
    )
    const handleInputSelect = useCallback(
        (inputCurrency, i) => {
            if (isCurrencySelected(inputCurrency)) return;
            onCurrencySelection(Field.INPUT, inputCurrency, i)
            const latestUpdatedToken = _get(inputCurrency, 'address', inputCurrency?.symbol)
            dispatch(setLatestUpdatedTokenId({ latestUpdatedTokenId: latestUpdatedToken }))
        },
        [onCurrencySelection, isCurrencySelected, dispatch]
    )

    const handleLPCurrencySelect = useCallback((pair, i) => {
        onCurrencySelection(Field.INPUT, pair.liquidityToken, i)
        const latestUpdatedToken = pair.liquidityToken
        dispatch(setLatestUpdatedTokenId({ latestUpdatedTokenId: _get(latestUpdatedToken, 'address', latestUpdatedToken?.symbol) }))
        dispatch(setSelectedInputLPToken({ lpTokenPair: pair || null }))
    }, [onCurrencySelection, dispatch])

    const handleOutputSelect = useCallback(outputCurrency => {
        if (isCurrencySelected(outputCurrency)) return;
        onCurrencySelection(Field.OUTPUT, outputCurrency, 0) // last param is 0 because there will be only one TO token
    }, [onCurrencySelection, isCurrencySelected])


    //Slippage tolerance
    const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()

    //function
    const selectedCurrencyBalances = useCurrencyBalances(account ?? undefined, inputCurrencyArr)
    const handleMaxInput = useCallback((selectedCurrency: Currency | undefined, i: number) => {
        let maxAmount: string | undefined;
        const isNativeAsset = Currency.getNativeCurrencySymbol(chainId) === selectedCurrency?.symbol;
        const fetchToken: CurrencyAmount | undefined = selectedCurrencyBalances.find(asset => {
            if (!asset) return false;
            if (isNativeAsset && asset?.currency.symbol === selectedCurrency?.symbol) return true;
            return _get(asset, 'token.address', '') === _get(selectedCurrency, 'address', 'NONE')
        })
        maxAmount = fetchToken?.toExact()
        onUserInput(maxAmount || '0', i)
        const latestUpdatedToken = inputCurrencyArr[i]
        dispatch(setLatestUpdatedTokenId({ latestUpdatedTokenId: _get(latestUpdatedToken, 'address', latestUpdatedToken?.symbol) }))
    }, [onUserInput, selectedCurrencyBalances, chainId, dispatch, inputCurrencyArr])

    //aproval
    const {
        parsedAmountArr
    } = useBlend(selectedCurrencyBalances, inputCurrencyArr)

    const [approvalStateArr, approveCallback] = useApproveCallbackArr(parsedAmountArr, BLEND_ADDRESS)
    const isValid = (): boolean => {
        for (let i = 0; i < approvalStateArr.length; i++) {
            if (approvalStateArr[i] !== ApprovalState.APPROVED)
                return false
        }
        return true
    }
    useGetOutputTokenAmount()
    const getOPValue = () => {
        if (!outputCurrency || !outputCurrency.symbol) return ''
        const opValue = outputTokenAmount //_get(outputTokenAmount, 'outputAmount', null)
        if (opValue) return opValue.toFixed(6)
        if (totalMaticValue) return totalMaticValue.toString()
        return ''
    }
    useInputToMaticToken(latestUpdatedTokenId)
    // }, [inputCurrencyToMatic, dispatch])
    // const outputTokenPath = outputTokenAmount?.route.path.map((i) => i.address)
    const [isOpen, setIsOpen] = useState(false)
    const addTransaction = useTransactionAdder()
    const [hash, setHash] = useState<string | undefined>()
    const [attempting, setAttempting] = useState<boolean>(false)
    const wrappedOnDismiss = useCallback(() => {
        setHash(undefined)
        setAttempting(false)
        setIsOpen(false)
    }, [])
    //Blend to token

    function convertDataToInput(inputToMaticConversion: CustomInputToMaticConversion | null, maticToMaticConversion: CustomMaticToMaticConversion | null) {
        if (!inputToMaticConversion) return null;
        let swapTokensInput: any = []
        let swapMatic = {};
        Object.values(inputToMaticConversion).forEach(selToken => {
            const inputToken = _get(selToken, 'inputToken', {})
            const token = _get(inputToken, 'address', null)
            const amount = _get(selToken, 'inputValue', null)
            if (token && amount && parseFloat(amount) > 0) {
                swapTokensInput.push({
                    token,
                    amount: parseUnits(amount, _get(inputToken, 'decimals', 18)).toString(),
                    tokenToNativePath: _get(selToken, 'maticConversion.route.path', []).map((p: any) => p.address)
                })
            } else {
                const tokenSymbol = _get(inputToken, 'symbol', null)
                if (tokenSymbol && tokenSymbol === nativeCurrencySymbol) {
                    const getMaticConversionValue = _get(selToken, `inputValue`, '0').toString()
                    swapMatic = {
                        value: parseUnits(getMaticConversionValue, _get(wrappedNativeToken, 'decimals', 18)).toString(),
                        nativeToTokenPath: _get(selToken, 'maticConversion.route.path', []).map((p: any) => p.address)
                    }
                }
            }
        })
        return { swapTokensInput, swapMatic }
    }


    function convertLPDataToInput(inputLPToken: CustomInputLPToMaticConversion | null) {
        if (!inputLPToken) return [];
        const lpValues = Object.values(inputLPToken || {})
        if (!lpValues || lpValues.length === 0) return [];
        let swapTokenInput: any = []
        lpValues.forEach(val => {
            const token = _get(val, 'inputLPToken.address', '')
            if (!token) return;
            swapTokenInput.push({
                token,
                amount: parseUnits(val.inputLPValue, val.inputLPToken?.decimals).toString(),
                token0ToNativePath: _get(val, 'maticConversion[0].route.path', [outputCurrency]).map((p: any) => p.address),
                token1ToNativePath: _get(val, 'maticConversion[1].route.path', [outputCurrency]).map((p: any) => p.address)
            })
        })
        return swapTokenInput
    }
    //(isValid() && outputCurrency === Currency.getNativeCurrency(chainId)) ? blendToNative() : blendToToken()

    function blendTxSuccess(response: TransactionResponse) {
        addTransaction(response, {
            summary: `Convert tokens to ${outputCurrency?.symbol}`
        })
        setHash(response.hash)
        onResetToInitialState()
    }
   
    async function blendToToken() {
        setIsOpen(true)
        setAttempting(true)
        if (dfynFusionContract) {
            if (isValid()) {
                const resToInputData = convertDataToInput(inputToMaticConversion, maticToMaticConversion)
                const resLPToInputData = convertLPDataToInput(inputLPToMaticConversion)

                if (!resToInputData) return;
                const expectedReturn = parseFloat(_get(outputTokenAmount, 'outputAmount', 0).toFixed())
                const minReturnAmount = parseUnits(((userSlippageTolerance / 10000) * expectedReturn).toFixed(6), _get(outputTokenAmount, 'outputAmount.currency.decimals', 18))

                if (outputCurrency?.symbol === nativeCurrencySymbol) {
                    await dfynFusionContract.swapTokensToNative(resToInputData.swapTokensInput, resLPToInputData, minReturnAmount.toString())
                        .then(blendTxSuccess)
                        .catch(blendTxError)
                } else {
                    let nativeToTokenPath = _get(resToInputData, 'swapMatic.nativeToTokenPath', [])
                    await dfynFusionContract.swapTokensToToken(resToInputData.swapTokensInput,
                        resLPToInputData,
                        _get(outputCurrency, 'address', ''),
                        minReturnAmount.toString(),
                        nativeToTokenPath,
                        {
                            value: _get(resToInputData, 'swapMatic.value', '')
                        }).then(blendTxSuccess)
                        .catch((err: any) =>
                            blendTxError(err))
                }
            } else {
                setAttempting(false)
                setIsOpen(false)
                throw new Error('Attempting to stake without approval or a signature. Please contact support.')
            }

        }

        function blendTxError(err: any) {
            setAttempting(false)
            setIsOpen(false)
            // console.log(`error invoking wallet ${JSON.stringify(err)}`)
        }
    }
    return (
        <>
            <TokenWarningModal
                isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
                tokens={importTokensNotInDefault}
                onConfirm={handleConfirmTokenWarning}
                onDismiss={handleDismissTokenWarning}
            />
            <AppBody>
                <TopSection>
                <TYPE.mediumHeader paddingTop={'5px'} color={theme.text1}>Dfyn Fusion</TYPE.mediumHeader>
                <TYPE.subHeader color={theme.text3} fontWeight={300} margin={'10px 0 0 0'}>Convert multiple tokens into one token</TYPE.subHeader>
                </TopSection>
                <Wrapper id="swap-page">
                    <AutoColumn gap={'md'}>
                        {inputCurrencyIds.map((_, i) => {
                            return (
                                <div key={i}>
                                    <CurrencyWrapper inputValue={inputCurrencyIds.length} value={i} >
                                        <InnerContent>
                                            <CurrencyInputPanel
                                                label={'From'}
                                                value={typedValues[i]}
                                                showMaxButton={!parsedAmountArr[i]}
                                                currency={inputCurrencyArr[i]}
                                                onUserInput={(e) => { handleTypeInput(e, i); }}
                                                onMax={() => handleMaxInput(inputCurrencyArr[i], i)}
                                                onCurrencySelect={(e) => handleInputSelect(e, i)}
                                                otherCurrency={fetchAllSelectedCurrencies()}
                                                id="swap-currency-input"
                                                lp={true}
                                                pair={lpTokenPairs[_get(inputCurrencyArr[i], 'address', null)]}
                                                onLPCurrencySelect={(e) => handleLPCurrencySelect(e, i)}
                                            />
                                            {/* {account && parsedAmountArr[i] && inputCurrencyArr[i] instanceof Token && bestTrade(i)} */}
                                            {account &&
                                                parsedAmountArr[i] ?
                                                <>
                                                    {!(approvalStateArr[i] === ApprovalState.APPROVED) && <ButtonConfirmed
                                                        onClick={() => { approveCallback(i) }}
                                                        disabled={
                                                            approvalStateArr[i] !== ApprovalState.NOT_APPROVED
                                                        }
                                                        width="100%"
                                                        padding="7px"
                                                        marginTop="10px"
                                                        altDisabledStyle={approvalStateArr[i] === ApprovalState.PENDING} // show solid button while waiting
                                                        confirmed={
                                                            approvalStateArr[i] === ApprovalState.APPROVED
                                                            // || signatureState === UseERC20PermitState.SIGNED
                                                        }
                                                    >
                                                        {approvalStateArr[i] === ApprovalState.PENDING ? (
                                                            <AutoRow gap="6px" justify="center">
                                                                Approving <Loader stroke="white" />
                                                            </AutoRow>
                                                        )
                                                            : (approvalStateArr[i] === ApprovalState.APPROVED) ? (
                                                                'Approved'
                                                            )
                                                                : (
                                                                    'Approve ' + inputCurrencyArr[i]?.symbol
                                                                )}
                                                    </ButtonConfirmed>}
                                                </>
                                                : (typedValues[i] && inputCurrencyArr[i] &&
                                                    <>
                                                        <ButtonInsufficient>
                                                            <TYPE.black>Your balance is not enough</TYPE.black>
                                                        </ButtonInsufficient>
                                                    </>
                                                )
                                            }
                                        </InnerContent>
                                        {inputCurrencyIds.length > 1 ?
                                            <CloseWrapper onClick={() => removeInputBox(i, inputCurrencyArr[i])} clickable>
                                                <div><X size="16" color="white" /></div>
                                            </CloseWrapper>
                                            : null
                                        }
                                    </CurrencyWrapper>
                                </div>
                            )
                        })}
                        <ButtonAdd onClick={addInputBox}>
                            <Plus size="16" style={{ color: theme.text1, marginRight: "10px" }} />
                            <TYPE.black>Add Token</TYPE.black>
                        </ButtonAdd>
                        <AutoColumn justify="space-between">
                            <AutoRow justify={'center'} style={{ padding: '0 1rem' }}>
                                <ArrowDown
                                    size="16"
                                    style={{ color: inputCurrencyArr[0]?.name && outputCurrency ? theme.primary1 : theme.text2 }}
                                />
                            </AutoRow>
                        </AutoColumn>
                        <CurrencyInputPanel
                            value={getOPValue()}
                            onUserInput={(e: string) => {
                                
                            }}
                            label={'To'}
                            showMaxButton={false}
                            currency={outputCurrency}
                            onCurrencySelect={handleOutputSelect}
                            otherCurrency={fetchAllSelectedCurrencies()}
                            id="swap-currency-output"
                        />
                        <TransactionSettingFusion
                            rawSlippage={userSlippageTolerance}
                            setRawSlippage={setUserslippageTolerance}
                        />

                        {account ?
                            <>
                                <ButtonError
                                    onClick={blendToToken}
                                    id="swap-button"
                                    error={false}
                                    disabled={!isValid() || (outputCurrency === undefined) || (outputCurrency === null)}
                                >
                                    Convert
                                </ButtonError>
                            </>
                            :
                            <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                        }
                    </AutoColumn>
                </Wrapper>
                <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
                    {attempting && !hash && (
                        <LoadingView onDismiss={wrappedOnDismiss}>
                            <AutoColumn gap="12px" justify={'center'}>
                                <TYPE.largeHeader>Waiting For Confirmation</TYPE.largeHeader>
                                <TYPE.body fontSize={14}>Converting selected tokens to {outputCurrency?.name}</TYPE.body>
                            </AutoColumn>
                        </LoadingView>
                    )}
                    {attempting && hash && (
                        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
                            <AutoColumn gap="12px" justify={'center'}>
                                <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
                                <TYPE.body fontSize={20}></TYPE.body>
                            </AutoColumn>
                        </SubmittedView>
                    )}
                </Modal>
            </AppBody>
        </>
    )
}