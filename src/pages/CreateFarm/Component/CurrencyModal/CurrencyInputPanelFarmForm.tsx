import { Currency, Pair } from '@dfyn/sdk';
import CurrencyLogo from 'components/CurrencyLogo';
import DoubleCurrencyLogo from 'components/DoubleLogo';
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal';
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next';
// import { Field } from 'state/swap/actions';
// import { Field } from 'state/farmform/action';
// import useCreateFarmForm, { useDerivedFarmInfo } from 'state/farmform/hook';
// import { useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks';
// import { useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks';
import styled from 'styled-components';
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'


const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: ${({ selected}) => (selected ? "3rem" : "2.6rem")};
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Container = styled.div<{ hideInput: boolean }>`
//   border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
//   border: 1px solid ${({ theme }) => theme.bg2};

`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
`

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
//   padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`
const StyledDropDown = styled(DropDown) <{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

export default function CurrencyInputPanelFarmForm({
    disableCurrencySelect=false,
    hideInput = false,
    pair = null,
    showCommonBases,
    currency,
    otherCurrency = null,
    onCurrencySelect
}:{
    disableCurrencySelect: boolean
    hideInput: boolean
    pair?: Pair | null
    showCommonBases?: boolean
    currency?: Currency | null
    otherCurrency?: Currency | null
    onCurrencySelect?: (currency: Currency) => void
}) {
    const { t } = useTranslation()
    // const theme = useTheme()
    const [modalOpen, setModalOpen] = useState(false)
    const handleDismissSearch = useCallback(() => {
      setModalOpen(false)
    }, [setModalOpen])
    
    return (
        <>
            <Container hideInput={hideInput}>
                <InputRow selected={disableCurrencySelect}>
                    <CurrencySelect
                        selected={!!currency}
                        className="open-currency-select-button"
                        onClick={() => {
                        if (!disableCurrencySelect) {
                            setModalOpen(true)
                        }
                        }}
                    >
                        <Aligner>
                        {pair ? (
                            <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                        ) : currency ? (
                            <CurrencyLogo currency={currency} size={'24px'} />
                        ) : null}
                        {pair ? (
                            <StyledTokenName className="pair-name-container">
                            {pair?.token0.symbol}:{pair?.token1.symbol}
                            </StyledTokenName>
                        ) : (
                            <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                            {(currency && currency.symbol && currency.symbol.length > 20
                                ? currency.symbol.slice(0, 4) +
                                '...' +
                                currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                                : currency?.symbol) || t('selectToken')}
                            </StyledTokenName>
                        )}
                        {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
                        </Aligner>
                    </CurrencySelect>
            </InputRow>
        </Container>
        {!disableCurrencySelect && onCurrencySelect &&(
            <CurrencySearchModal
                isOpen={modalOpen}
                onDismiss={handleDismissSearch}
                onCurrencySelect={onCurrencySelect}
                selectedCurrency={currency}
                otherSelectedCurrency={otherCurrency}
                showCommonBases={showCommonBases}
            />
        )}
        </>
    )
}
