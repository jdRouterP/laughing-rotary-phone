import { Currency, Token } from '@dfyn/sdk'
import { useCurrency } from 'hooks/Tokens'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 2;
`
const CoveredLogo = styled(CurrencyLogo) <{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false
}: DoubleCurrencyLogoProps) {
  const currencyIdA = currency0 instanceof Token ? currency0.address : currency0?.symbol
  const currencyIdB = currency1 instanceof Token ? currency1.address : currency1?.symbol
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && <HigherLogo currency={currencyA ?? undefined} size={size.toString() + 'px'} />}
      {currency1 && <CoveredLogo currency={currencyB ?? undefined} size={size.toString() + 'px'} sizeraw={size} />}
    </Wrapper>
  )
}
