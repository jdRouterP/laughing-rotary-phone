import { CurrencyAmount, JSBI, Token } from '@dfyn/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { ArrowWrapper, Wrapper } from '../../components/swap/styleds'
import TokenWarningModal from '../../components/TokenWarningModal'
import SwapHeader from '../../components/swap/SwapHeader'
import { ETH_MAINNET_NATIVE_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapState
} from '../../state/swap/hooks'
import {
  useLimitOrderState,
  useSwapActionHandlers
} from '../../state/limitOrder/hooks'
import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { BodyWrapper } from '../AppBody'
import { RouteComponentProps } from 'react-router-dom'
import { FileCopyOutlined, SwapVert } from '@material-ui/icons'
import _get from 'lodash.get'
import OpenOrders from './OpenOrders'
import { createOrder } from './api'
import { parseUnits } from 'ethers/lib/utils'
import { useCurrencyBalance } from 'state/wallet/hooks'
import ConfirmSwapModal from 'components/Limit/ConfirmSwapModal'
// import { useTransactionLimitOrder } from 'state/transactions/hooks'
import { useOpenOrdersCallback } from 'hooks/useOpenOrdersCallback'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { InputAdornment, OutlinedInput } from '@material-ui/core'

const RateConverterOutlinedInput = styled(OutlinedInput)`
  border-radius: 20px !important;
  width: 100%;
  color: ${({ theme }) => theme.text2};
  font-family: inherit !important;
  margin-left: 12px;
  input {
    color: ${({ theme }) => theme.text1};
  }
  p {
    color: ${({ theme }) => theme.text2};
    font-size: 16px;
    text-transform: uppercase;
  }
  fieldset {
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.bg2} !important;
    color: ${({ theme }) => theme.text1};
   
  }
  div {
    color: ${({ theme }) => theme.text2};
    font-size: 12px;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }
`

const VerticalLine = styled.div<{isVisible: boolean}>`
    background: ${({ theme }) => theme.bg2};
    width: 2px;
    position: absolute;
    height: calc(10% + 34px);
    opacity: 1;
    left: calc(12% - 1px);
    z-index: 1;
    top: ${({ isVisible }) => (isVisible? '105px': '160px')};
`
const CustomMarketRateRow = styled(RowBetween)`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.primary1};
  }

`;
const CustomSwapVert = styled.div`
    text-align: center;
    z-index: 2;
    background: ${({ theme }) => theme.bg1};
    border: 1px solid ${({ theme }) => theme.bg2};
    border-radius: 15px;
    margin: auto;
    text-align: center;
    vertical-align: middle;
    height: 50px;
    line-height: 3.7;
`

const LimitOrderDisable = styled(AutoColumn)`
    background: ${({ theme }) => theme.bgAlert};
    // border: 1px solid ${({ theme }) => theme.bg2};
    padding: 10px;
    border-radius: 10px;
    margin: 10px auto;
    text-align: center;
    color: ${({ theme }) => theme.textAlert}
`

const CustomBodyWrapper = styled(Wrapper)<{isVisible: boolean}>`
    opacity: ${({isVisible})=>(isVisible? '1': '0.6')};
    pointer-events: ${({isVisible})=>(isVisible? 'initial': 'none')};
    cursor: ${({isVisible})=>(isVisible? 'initial': 'not-allowed')};
`;

export default function LimitOrder({ history }: RouteComponentProps) {
  const isLimitOrderEnabled = process.env.REACT_APP_ENABLE_LIMIT_ORDER==="true"? true:false
  const loadedUrlParams = useDefaultsFromURLSearch()
  const toggleWalletModal = useWalletModalToggle()
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

  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const [isExpertMode] = useExpertModeManager()
  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()
  //input token per output token rate conversion
  const [inputPerOutput, setInputPerOutput] = useState<string>('-')
  const [inputAmountEnter, setInputAmountEnter] = useState<string>('')
  const [outputAmount, setOutputAmount] = useState<string>('')

  // swap state
  const { independentField, typedValue } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies
  } = useDerivedSwapInfo()

  const { wrapType } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const toggledVersion = useToggledVersion()
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  }
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion]
  const tradeInputAmount = trade?.inputAmount
  const tradeOutputAmount = trade?.outputAmount
  
  const parsedAmounts = useMemo(() => (showWrap
    ? {
      [Field.INPUT]: parsedAmount,
      [Field.OUTPUT]: parsedAmount
    }
    : {
      [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : tradeInputAmount,
      [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : tradeOutputAmount
    }), [independentField, parsedAmount, showWrap, tradeInputAmount, tradeOutputAmount])

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleMarketInputPerOutputConversion = useCallback(
    () => {
      onUserInput(Field.INPUT, '1')
    },
    [onUserInput]
  )


  const [{ showConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    history.push('/swap/')
  }, [history])


  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }
  }, [dependentField, independentField, parsedAmounts, showWrap, typedValue])


  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  const inputCurrency = currencies[Field.INPUT]
  const inputAmount = parsedAmounts[Field.INPUT]
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)//parseUnits(inputAmountEnter, currencies[Field.INPUT].decimals)
  const inputAmountToBigintIsh = inputAmountEnter && JSBI.BigInt(parseUnits(inputAmountEnter, currencies[Field.INPUT]?.decimals).toString())
  const inputToJSBI = inputCurrency && new CurrencyAmount(inputCurrency, inputAmountToBigintIsh)
  let sufficientBalance = inputAmount && inputToJSBI && balance && !balance.lessThan(inputToJSBI)
  if (sufficientBalance === undefined) sufficientBalance = true
  const addTransaction = useTransactionAdder()

  const { orderStatus } = useLimitOrderState()
  const fetchOrders = useOpenOrdersCallback()
  useMemo(() => {
    fetchOrders(orderStatus)
  }, [orderStatus, fetchOrders])

  const handlePlaceLimitOrder = async () => {
    const isFormValid = validateForm()
    setSwapState({ attemptingTxn: true, showConfirm: true, swapErrorMessage: undefined, txHash: undefined })
    if (!isFormValid) return;
    const sellToken = currencies[Field.INPUT]
    const buyToken = currencies[Field.OUTPUT]
    if(!sellToken || !buyToken) return;
    const sellTokenAddress = _get(currencies[Field.INPUT], 'address', ETH_MAINNET_NATIVE_ADDRESS.address)
    const buyTokenAddress = _get(currencies[Field.OUTPUT], 'address', ETH_MAINNET_NATIVE_ADDRESS.address)
    const inputAmount = inputAmountEnter || '0'

    const order = {
      chainId,
      account,
      sellToken: sellTokenAddress,
      sellAmount: parseUnits(inputAmount, sellToken?.decimals).toString(),
      buyToken: buyTokenAddress,
      buyAmount: parseUnits(outputAmount, buyToken?.decimals).toString()
    }

    const createOrderTxnData = await createOrder(order)
    if (createOrderTxnData && createOrderTxnData.tx && library && library.provider.isMetaMask && library.provider.request) {
      library.provider.request({
        method: 'eth_sendTransaction',
        params: [createOrderTxnData['tx']],
      }).then(async hash => {
        setSwapState({ attemptingTxn: false, showConfirm, swapErrorMessage: undefined, txHash: hash })
        const base = `Order created for ${currencies[Field.INPUT]?.symbol}/${currencies[Field.OUTPUT]?.symbol}`
        const txnData = await library.getTransaction(hash)

        addTransaction(txnData, {
          summary: base
        })
        setInputAmountEnter('')
        setInputPerOutput('')
        ReactGA.event({
          category: 'Create-LimitOrder',
          action: base,
          label: [
            sellToken?.symbol,
            buyToken?.symbol
          ].join('/')
        })
        const fetchDataInterval = setInterval(async () => {
          const txnData = await library.getTransaction(hash)
          if (txnData.confirmations > 1) {
            fetchOrders(orderStatus)
            clearInterval(fetchDataInterval)
          }
        }, 2000)
      })
        .catch(error => {
          setSwapState({
            attemptingTxn: false,
            showConfirm,
            swapErrorMessage: error.message,
            txHash: undefined
          })
        })
    }
  }

  const setPriceToMarket = useCallback(() => {
    if (parsedAmounts && parsedAmounts[Field.OUTPUT]) {
      const inputEntered = _get(parsedAmounts, Field.OUTPUT, 0).toFixed(4)
      setInputPerOutput(inputEntered)
      const outputAmountCalculated = parseFloat(inputAmountEnter) * parseFloat(inputEntered)
      if (isNaN(outputAmountCalculated) || !isFinite(outputAmountCalculated)) return;
      setOutputAmount(outputAmountCalculated.toFixed(4))
    }
  }, [inputAmountEnter, parsedAmounts])

  const handleSetInputAmountEnter = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    setInputAmountEnter(value)
    const outputAmountCalculated = parseFloat(value) * parseFloat(inputPerOutput);
    if (isNaN(outputAmountCalculated) || !isFinite(outputAmountCalculated)) return;
    setOutputAmount(outputAmountCalculated.toFixed(4))
  }, [inputPerOutput])

  const handleSetOutputAmont = useCallback((value: string) => {
    setOutputAmount(value)
    let conversionRate =
      (parseFloat(value) / parseFloat(inputPerOutput));
    if (isNaN(conversionRate) || !isFinite(conversionRate)) return;
    setInputAmountEnter(conversionRate.toFixed(4))

  }, [setOutputAmount, setInputAmountEnter, inputPerOutput])

  const handleSetInputPerOutput = useCallback(inputEntered => {
    
    if (isNaN(inputEntered) || !isFinite(inputEntered)) return;
    setInputPerOutput(inputEntered)
    const outputAmountCalculated = parseFloat(inputAmountEnter) * parseFloat(inputEntered || 0)
    if (isNaN(outputAmountCalculated) || !isFinite(outputAmountCalculated)) return;
    setOutputAmount(outputAmountCalculated.toFixed(4))
  }, [inputAmountEnter])

  const handleInputSelect = useCallback(
    inputCurrency => {
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  useMemo(() => {
    let outputToken = currencies[Field.OUTPUT],
      inputTokenAmount = parsedAmounts[Field.INPUT],
      inputToken = currencies[Field.INPUT]

    if (outputToken && inputPerOutput === '-' && !inputTokenAmount && inputToken) {
      handleMarketInputPerOutputConversion()
    }
  }, [currencies, handleMarketInputPerOutputConversion, inputPerOutput, parsedAmounts])

  const validateForm = (() => {
    const sellToken = _get(currencies[Field.INPUT], 'address', ETH_MAINNET_NATIVE_ADDRESS.address)
    const buyToken = _get(currencies[Field.OUTPUT], 'address', ETH_MAINNET_NATIVE_ADDRESS.address)
    const inputAmount = inputAmountEnter || '0'
    if (!sellToken) {
      return false
    }
    if (!buyToken) {
      return false
    }
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      return false
    }
    if (!outputAmount || parseFloat(outputAmount) <= 0) {
      return false
    }

    if (parseFloat(inputPerOutput) < parseFloat(_get(parsedAmounts, Field.OUTPUT, 0).toFixed(2))) {
      return false
    }

    return true
  })

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, txHash])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      
      setOutputAmount('')
    }
  }, [attemptingTxn, swapErrorMessage, txHash])

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <SwapPoolTabs active={'swap'} />
      <BodyWrapper style={{ margin: 'auto' }}>
        <SwapHeader />
        <CustomBodyWrapper isVisible={isLimitOrderEnabled} id="swap-page">
         {isLimitOrderEnabled ? null :
            <LimitOrderDisable gap="md" justify="center">
              <TYPE.subHeader color={theme.textAlert} fontSize={14} fontWeight={500}>
                Limit order is under maintenance
              </TYPE.subHeader>
            </LimitOrderDisable>
          }
          <ConfirmSwapModal
            isOpen={showConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={null}
            allowedSlippage={allowedSlippage}
            onConfirm={handlePlaceLimitOrder}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            inputAmount={inputToJSBI}
            outputAmount={outputAmount}
            limitPrice={inputPerOutput}
            marketPrice={(parseFloat(formattedAmounts[Field.OUTPUT]) / parseFloat(formattedAmounts[Field.INPUT])).toFixed(4)}
          />
          <AutoColumn gap={'sm'}>
            <CurrencyInputPanel
              value={inputAmountEnter}
              onUserInput={handleSetInputAmountEnter}
              label={'From'}
              onMax={() => maxAmountInput && handleSetInputAmountEnter(maxAmountInput.toExact())}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <VerticalLine isVisible={isLimitOrderEnabled}></VerticalLine>
            <AutoColumn justify="start">
              <AutoRow justify={'start'} style={{ padding: '0 0.5rem' }}>
                <ArrowWrapper clickable style={{ width: '14%', zIndex: 2, textAlign: 'center' }}>
                  <CustomSwapVert>
                    <SwapVert
                      onClick={() => {
                        onSwitchTokens()
                        handleMarketInputPerOutputConversion()
                      }}
                      style={{ color: currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2 }}
                    />
                  </CustomSwapVert>
                </ArrowWrapper>
                <ArrowWrapper clickable={false} style={{ width: '84%' }}>
                  <RateConverterOutlinedInput
                    id="input-per-output-conversion"
                    value={inputPerOutput === '-' ? '' : inputPerOutput}
                    onChange={(e)=>handleSetInputPerOutput(e.target.value)}
                    endAdornment={<InputAdornment position="end">
                      {_get(currencies[Field.OUTPUT], 'symbol', '')} per {_get(currencies[Field.INPUT], 'symbol', '')}
                    </InputAdornment>}
                    aria-describedby="input-per-output-conversion"
                    placeholder={formattedAmounts[Field.OUTPUT]}
                    type="number"
                    labelWidth={0}
                    title={''}
                  />
                </ArrowWrapper>
              </AutoRow>
            </AutoColumn>

            <CurrencyInputPanel
              value={outputAmount}
              onUserInput={handleSetOutputAmont}
              label={'To'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />
          </AutoColumn>

          <AutoColumn gap="8px" style={{ padding: '0 16px', margin: '20px 0px' }}>

            <CustomMarketRateRow align="center" style={{ cursor: 'pointer' }} onClick={setPriceToMarket}>
              <RowFixed>
                <FileCopyOutlined style={{fontSize: '16px', marginRight: '4px'}}/> Market Rate 
              </RowFixed>
              <RowFixed>
                  {currencies[Field.INPUT] && currencies[Field.OUTPUT] ? <span>
                    1 {_get(currencies[Field.INPUT], 'symbol', '')} = {formattedAmounts[Field.OUTPUT]} {_get(currencies[Field.OUTPUT], 'symbol', '')}
                  </span> : '-'}
              </RowFixed>
            </CustomMarketRateRow>
            {(inputPerOutput && parsedAmounts[Field.OUTPUT] && parseFloat(inputPerOutput) < parseFloat(_get(parsedAmounts, Field.OUTPUT, 0).toFixed(2))) ?
              <RowBetween align="center" style={{ margin: '15px auto 0px auto', borderRadius: '10px', textAlign: 'center', width: 'auto', background: theme.bg2, padding: '4px 10px' }}>
                <RowFixed>
                  <AlertTriangle stroke={theme.red1} size={12} />
                  <TYPE.body fontWeight={500} fontSize={12} color={theme.red1}>
                    &nbsp;&nbsp;Price below market rate
                  </TYPE.body>
                </RowFixed>
              </RowBetween> : null}
          </AutoColumn>
          {
            account ?
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handlePlaceLimitOrder()
                  } else {
                    setSwapState({
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                disabled={!validateForm() || !Boolean(sufficientBalance) || outputAmount === ""}>
                <Text fontSize={16} fontWeight={500}>{Boolean(sufficientBalance)
                  ? 'Place Limit Order' : `Insufficient ${inputCurrency?.symbol} balance`
                }
                </Text>
              </ButtonError>
              :
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
          }
        </CustomBodyWrapper>
      </BodyWrapper>
      <BodyWrapper style={{ marginTop: '10px' }}>
        <OpenOrders />
      </BodyWrapper>

    </>
  )
}