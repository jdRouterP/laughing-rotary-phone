import { Currency, Pair } from '@dfyn/sdk'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'
import { useTranslation } from 'react-i18next'
// import useTheme from 'hooks/useTheme'
// import { useActiveWeb3React } from 'hooks'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import CurrencyLogo from 'components/CurrencyLogo'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { darken } from 'polished'
// import { RowBetween } from 'components/Row'


const InputRow = styled.div<{ selected: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
//   padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: ${({ selected}) => (selected ? "3rem" : "2.6rem")};
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg2 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
  :focus,
  :active,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
`


const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledDropDown = styled(DropDown) <{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
//   ${({ theme }) => theme.flexColumnNoWrap}
//   position: relative;
//   border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
//   background-color: ${({ theme }) => theme.bg2};
//   z-index: 1;
    margin: auto 0;
`

const Container = styled.div<{ hideInput: boolean }>`
//   border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
//   border: 1px solid ${({ theme }) => theme.bg2};
//   background-color: ${({ theme }) => theme.bg1};
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};

`

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  // ${({ theme }) => theme.mediaWidth.upToSmall`
  //   flex-direction: column;
  // `}
`

interface RewardsCurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: (Currency | undefined)[] | (Currency | null)
  id: string
  lpByof?: boolean
  showCommonBases?: boolean
}

export default function RewardsCurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  lpByof,
  showCommonBases
}: RewardsCurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
//   const { account } = useActiveWeb3React()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <MainContent>
        <InputPanel id={id}>
            <Container hideInput={hideInput}>
                <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
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
            {!disableCurrencySelect && onCurrencySelect && (
                <CurrencySearchModal
                    isOpen={modalOpen}
                    onDismiss={handleDismissSearch}
                    onCurrencySelect={onCurrencySelect}
                    selectedCurrency={currency}
                    otherSelectedCurrency={otherCurrency}
                />
            )}
        </InputPanel>
        {!lpByof && 
          <NumericalInput
            className="token-amount-input"
            value={value}
            onUserInput={val => {
                onUserInput(val)
            }}
        />}
        
    </MainContent>
  )
}
