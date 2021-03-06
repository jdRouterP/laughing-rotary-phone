import { ChainId, Currency, Token } from '@dfyn/sdk'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import MaticLogo from '../../assets/images/matic-logo.png'
import OKExLogo from '../../assets/images/okex-logo.png'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import AvalancheLogo from '../../assets/images/avax.png'
import BinanceChainLogo from '../../assets/images/bnb.png'
import FantomLogo from '../../assets/images/ftm.png'
import HarmonyLogo from '../../assets/images/one.png'
import XdaiLogo from '../../assets/images/xdai.png'
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

const getChainNameById = (chainId: ChainId) =>{
  switch(chainId) {
  case ChainId.MAINNET: return 'ethereum';
  case ChainId.FANTOM: return 'fantom';
  case ChainId.MATIC: return 'polygon';
  case ChainId.OKEX: return 'okex';
  default: return '';
  }
}


export function getCurrencyLogoUrls(tokenAddress: string, tokenSymbol: string, chainId: ChainId | undefined) {
  let urls = ''
  if (!chainId) return;

  urls =
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${getChainNameById(chainId)}/assets/${tokenAddress
    }/logo.png`

  return urls
}

const logo: { readonly [chainId in ChainId]?: string } = {
  [ChainId.MATIC]: MaticLogo,
  [ChainId.OKEX]: OKExLogo,
  [ChainId.ARBITRUM]: EthereumLogo,
  [ChainId.XDAI]: XdaiLogo,
  [ChainId.BSC]: BinanceChainLogo,
  [ChainId.AVALANCHE]: AvalancheLogo,
  [ChainId.FANTOM]: FantomLogo,
  [ChainId.HARMONY]: HarmonyLogo,
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
  const currencyIdA = currency instanceof Token ? currency.address : currency?.symbol
  const currencyA = useCurrency(currencyIdA)
  const { chainId } = useActiveWeb3React()
  const uriLocations = useHttpLocations(currencyA instanceof WrappedTokenInfo ? currencyA.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (!chainId) return []
    if (currencyA === Currency.getNativeCurrency(chainId)) return []

    if (currencyA instanceof Token) {
      if (currencyA instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currencyA.address)]
      }
      return [getTokenLogoURL(currencyA.address)]
    }
    return []
  }, [chainId, currencyA, uriLocations])

  if (currencyA === Currency.getNativeCurrency(chainId)) {
    if (chainId)
      return <StyledNativeLogo src={logo[chainId] || `/images/tokens/unknown.png`} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currencyA?.getSymbol(chainId) ?? 'token'} logo`} style={style} />
}
