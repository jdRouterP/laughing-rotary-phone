import {  CurrencyAmount, JSBI } from '@dfyn/sdk'
import { ButtonError, ButtonLight } from 'components/Button'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { CardNoise } from 'components/earn/styled'
import { RowBetween } from 'components/Row'
import { DFYN } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import useStake from 'pages/Predictions/hooks/useStake'
import React, { useCallback, useMemo, useState } from 'react'
import { useWalletModalToggle } from 'state/application/hooks'
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

export default function InputComponent({label}: {label: string}) {

   

    const [typedValue, setTypedValue] = useState('')
    const { account, chainId } = useActiveWeb3React()
    let balance = useCurrencyBalance(account ?? undefined, DFYN)
    
    const dust = JSBI.BigInt("10000000000000000"); //TODO
    
    const {
        parsedAmount,
        error: swapInputError
    } = useStake(typedValue, DFYN, balance)
    const maxBalance = useMemo(() => {
        if (balance === undefined) {
            return new CurrencyAmount(DFYN, BIG_INT_ZERO);
        }
        let dustToken = new CurrencyAmount(DFYN, dust);
        
        return balance.greaterThan(dust) ? balance.subtract(dustToken) : balance
    }, [balance, dust])
    

    const toggleWalletModal = useWalletModalToggle()

    const onUserInput = useCallback((typedValue: string) => {
        setTypedValue(typedValue)
    }, [])
    
    // used for max input button
    const maxAmountInput: CurrencyAmount | undefined =  maxAmountSpend(maxBalance, chainId)
    
    const atMaxAmount = Boolean(maxAmountInput && balance?.equalTo(maxAmountInput))
    const handleMax = useCallback(() => {
        maxAmountInput && onUserInput(maxAmountInput.toExact())
    }, [maxAmountInput, onUserInput])
    
    return (
        <BodyStyle>
            <RowBetween>
                <TYPE.black>{label}</TYPE.black>
                <UNIWrapper>
                    <UNIAmount>
                        <TYPE.white padding="0 2px">
                            1DFYN = 1.5vDFYN
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
                    currency={DFYN}
                    label={''}
                    disableCurrencySelect={true}
                    customBalanceText={'Balance: '}
                    id="stake"
                />
                <RowBetween mt={"20px"}>
                    {account ?  
                    <ButtonError
                        id="swap-button"
                        disabled={!!swapInputError}
                        error={!!swapInputError && !!parsedAmount}
                    >
                        {swapInputError ?? 'Swap'}
                    </ButtonError> : 
                    <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight> }
                </RowBetween>
            </InputRow>
        </BodyStyle>
    )
}
