import { ChainId, Currency, Token } from '@dfyn/sdk'
import { useActiveWeb3React } from 'hooks'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import MaticLogo from '../../assets/images/matic-logo.png'
import OKExLogo from '../../assets/images/okex-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'

export const getTokenLogoURL = (address: string) => {
  let uri;
  if (!uri) {
    uri = ``;
  }
  return uri;
}

const logo: { readonly [chainId in ChainId]?: string } = {
  [ChainId.MATIC]: MaticLogo,
  [ChainId.OKEX]: OKExLogo,
}

const StyledNativeLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo) <{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const { chainId } = useActiveWeb3React()
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (!chainId) return []
    if (currency === Currency.getNativeCurrency(chainId)) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)]
      }
      return [getTokenLogoURL(currency.address)]
    }
    return []
  }, [chainId, currency, uriLocations])

  if (currency === Currency.getNativeCurrency(chainId)) {
    if (chainId)
      return <StyledNativeLogo src={logo[chainId] || `/images/tokens/unknown.png`} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.getSymbol(chainId) ?? 'token'} logo`} style={style} />
}
