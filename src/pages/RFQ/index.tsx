import React, { useCallback, useEffect, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow } from '../../components/Row'
import { ArrowWrapper, Wrapper } from '../../components/swap/styleds'
import SwapHeader from '../../components/swap/SwapHeader'
import { Field } from '../../state/swap/actions'
import AppBody from '../AppBody'
import { RouteComponentProps } from 'react-router-dom'
import { SwapVert } from '@material-ui/icons'
import useTheme from 'hooks/useTheme'
// import { useActiveWeb3React } from 'hooks'
import { Currency } from '@dfyn/sdk'
import axios from 'axios'
import { useActiveWeb3React } from 'hooks'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { ethers } from 'ethers'

// const HighlightBanner = styled.div`
//   cursor: pointer;
//   display: flex;
//   color: #FDFCE5;
//   color: ${({ theme }) => theme.bannerText};

//   font-size: 14px;
//   :hover{
//     text-decoration: underline;
//   }
//   img {
//     height: 20px;
//     width: 20px;
//   }
//   span {
//     margin-left: 5px;
//     margin-top: 1px;
//   }
// `
// const DFYNTitle = styled.span`
//   color: #2172E5
// `

export default function Swap({ history }: RouteComponentProps) {
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const theme = useTheme()
  const { account, chainId } = useActiveWeb3React()
  const [currencies, setCurrencies] = useState<{ [field in Field]?: Currency }>()

  const getQuote = useCallback(() => {
    const token0 = currencies && wrappedCurrency(currencies[Field.INPUT], chainId)
    const token1 = currencies && wrappedCurrency(currencies[Field.OUTPUT], chainId)
    if(!token0||!token1||!account||!chainId||amount0==="")
    return;
    
    const options:any = {
      method: 'GET',
      url: 'http://localhost:6673/api/getQuote',
      params: {
        user: account,
        token0: token0?.address,
        token1: token1?.address,
        chainId: chainId,
        amount0: ethers.utils.parseUnits(amount0,token0.decimals).toString(),
      },
    }
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data)
        setAmount1(ethers.utils.formatUnits(response.data.data.messageObject.amount1,token0?.decimals))
      })
      .catch(function (error) {
        console.error(error)
      })
  }, [account, chainId, amount0, currencies])

  useEffect(() => {
    const timer = setTimeout(() => {
      getQuote()
    }, 1000)
    return () => clearTimeout(timer);
  }, [getQuote])

  return (
    <>
      {/* <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      /> */}
      <SwapPoolTabs active={'swap'} />
      <AppBody>
        <SwapHeader />
        <Wrapper id="swap-page">
          <AutoColumn gap={'md'}>
            <CurrencyInputPanel
              label={'From'}
              value={amount0}
              showMaxButton={false}
              currency={currencies && currencies[Field.INPUT]}
              onUserInput={(value) => setAmount0(value)}
              onCurrencySelect={(currency: Currency) => setCurrencies({ ...currencies, [Field.INPUT]: currency })}
              otherCurrency={currencies && currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <SwapVert
                    onClick={() => {
                      // setApprovalSubmitted(false)
                      // setApprovalSubmittedWallchain(false) // reset 2 step UI for approvals
                      // onSwitchTokens()
                    }}
                    style={{
                      color:
                        currencies && currencies[Field.INPUT] && currencies[Field.OUTPUT]
                          ? theme.primary1
                          : theme.text2,
                    }}
                  />
                </ArrowWrapper>
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={amount1}
              onUserInput={(value) => {}}
              label={'To'}
              showMaxButton={false}
              currency={currencies && currencies[Field.OUTPUT]}
              onCurrencySelect={(currency: Currency) => setCurrencies({ ...currencies, [Field.OUTPUT]: currency })}
              otherCurrency={currencies && currencies[Field.INPUT]}
              id="swap-currency-output"
            />

            {/* {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null} */}

            {/* {showWrap ? null : (
              <Card padding={showWrap ? '.25rem 1rem 0 1rem' : '0px'} borderRadius={'20px'}>
                <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                  {Boolean(trade) && (
                    <RowBetween align="center">
                      <Text fontWeight={500} fontSize={14} color={theme.text2}>
                        Price
                      </Text>
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </RowBetween>
                  )}
                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align="center">
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        Slippage Tolerance
                      </ClickableText>
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        {allowedSlippage / 100}%
                      </ClickableText>
                    </RowBetween>
                  )}
                </AutoColumn>
              </Card>
            )} */}
          </AutoColumn>
          {/* <BottomGrouping>
            {swapIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
              </ButtonPrimary>
            ) : !account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : showWrap ? (
              <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </ButtonPrimary>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
                {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>}
              </GreyCard>
            ) : (
              (flowSwap || wallchainResponse) &&
              (wallchainResponse?.pathFound ? (
                showApproveFlowWallchain && loaderWallchain ? (
                  <RowBetween>
                    <ButtonConfirmed
                      onClick={approveCallbackWallchain}
                      disabled={approvalWallchain !== ApprovalState.NOT_APPROVED || approvalSubmittedWallchain}
                      width="48%"
                      altDisabledStyle={approvalWallchain === ApprovalState.PENDING} // show solid button while waiting
                      confirmed={approvalWallchain === ApprovalState.APPROVED}
                    >
                      {approvalWallchain === ApprovalState.PENDING ? (
                        <AutoRow gap="6px" justify="center">
                          Approving <Loader stroke="white" />
                        </AutoRow>
                      ) : approvalSubmittedWallchain && approvalWallchain === ApprovalState.APPROVED ? (
                        'Approved'
                      ) : (
                        'Approve ' + currencies[Field.INPUT]?.symbol
                      )}
                    </ButtonConfirmed>
                    <ButtonError
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap()
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            showConfirm: true,
                            txHash: undefined,
                          })
                        }
                      }}
                      width="48%"
                      id="swap-button"
                      disabled={
                        !isValid ||
                        approvalWallchain !== ApprovalState.APPROVED ||
                        (priceImpactSeverity > 3 && !isExpertMode)
                      }
                      error={isValid && priceImpactSeverity > 2}
                    >
                      <Text fontSize={16} fontWeight={500}>
                        {priceImpactSeverity > 3 && !isExpertMode
                          ? `Price Impact High`
                          : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                      </Text>
                    </ButtonError>
                  </RowBetween>
                ) : (
                  <ButtonError
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }
                    }}
                    id="swap-button"
                    disabled={
                      !loaderWallchain || !isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError
                    }
                    error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                  >
                    <Text fontSize={20} fontWeight={500}>
                      {swapInputError
                        ? swapInputError
                        : priceImpactSeverity > 3 && !isExpertMode
                        ? `Price Impact Too High`
                        : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                    </Text>
                  </ButtonError>
                )
              ) : showApproveFlow ? (
                <RowBetween>
                  <ButtonConfirmed
                    onClick={approveCallback}
                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                    width="48%"
                    altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                    confirmed={approval === ApprovalState.APPROVED}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <AutoRow gap="6px" justify="center">
                        Approving <Loader stroke="white" />
                      </AutoRow>
                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                      'Approved'
                    ) : (
                      'Approve ' + currencies[Field.INPUT]?.symbol
                    )}
                  </ButtonConfirmed>
                  <ButtonError
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }
                    }}
                    width="48%"
                    id="swap-button"
                    disabled={
                      !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                    }
                    error={isValid && priceImpactSeverity > 2}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {priceImpactSeverity > 3 && !isExpertMode
                        ? `Price Impact High`
                        : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                    </Text>
                  </ButtonError>
                </RowBetween>
              ) : (
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined,
                      })
                    }
                  }}
                  id="swap-button"
                  disabled={
                    !loaderWallchain || !isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError
                  }
                  error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {swapInputError
                      ? swapInputError
                      : priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact Too High`
                      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                  </Text>
                </ButtonError>
              ))
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
              </Column>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} 
          </BottomGrouping>*/}
        </Wrapper>
      </AppBody>
    </>
  )
}
