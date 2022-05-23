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
import { Currency, TokenAmount } from '@dfyn/sdk'
import axios from 'axios'
import { useActiveWeb3React } from 'hooks'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { ethers } from 'ethers'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { RFQ_ADDRESS } from '../../constants'
import { ButtonPrimary } from 'components/Button'
import { TYPE } from 'theme'

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
  const token = currencies && currencies[Field.OUTPUT] && wrappedCurrency(currencies[Field.OUTPUT], chainId)
  const typedValueParsed =token&& ethers.utils.parseUnits(amount1===""?"0":amount1, token.decimals).toString()
  const tokenAmount = (token)&& new TokenAmount(token, typedValueParsed??"0")
  const [approvalRFQ, approveCallback] = useApproveCallback(tokenAmount, RFQ_ADDRESS)

  const getQuote = useCallback(() => {
    const token0 = currencies && wrappedCurrency(currencies[Field.INPUT], chainId)
    const token1 = currencies && wrappedCurrency(currencies[Field.OUTPUT], chainId)
    if (!token0 || !token1 || !account || !chainId || amount0 === '') return

    const options: any = {
      method: 'GET',
      url: 'http://localhost:6673/api/getQuote',
      params: {
        user: account,
        token0: token0?.address,
        token1: token1?.address,
        chainId: chainId,
        amount0: ethers.utils.parseUnits(amount0, token0.decimals).toString(),
      },
    }
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data)
        setAmount1(ethers.utils.formatUnits(response.data.data.messageObject.amount1, token0?.decimals))
      })
      .catch(function (error) {
        console.error(error)
      })
  }, [account, chainId, amount0, currencies])

  useEffect(() => {
    const timer = setTimeout(() => {
      getQuote()
    }, 1000)
    return () => clearTimeout(timer)
  }, [getQuote])

  return (
    <>
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
          </AutoColumn>
          <AutoColumn style={{marginTop:"8px"}}>

          {approvalRFQ === ApprovalState.NOT_APPROVED && (
            <ButtonPrimary onClick={approveCallback}>
              <TYPE.main mb="4px">Approve</TYPE.main>
            </ButtonPrimary>
          )}
          {approvalRFQ === ApprovalState.PENDING && (
            <ButtonPrimary>
              <TYPE.main mb="4px">Approving</TYPE.main>
            </ButtonPrimary>
          )}
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </>
  )
}
