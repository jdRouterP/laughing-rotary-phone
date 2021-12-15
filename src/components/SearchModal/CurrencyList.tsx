import { ChainId, Currency, CurrencyAmount, currencyEquals, Pair, Token, TokenAmount } from '@dfyn/sdk'
import React, { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { WrappedTokenInfo, useCombinedActiveList } from '../../state/lists/hooks'
import { useCurrencyBalance, useTokenBalance } from '../../state/wallet/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { useIsUserAddedToken, useAllInactiveTokens } from '../../hooks/Tokens'
import Column from '../Column'
import { RowFixed, RowBetween } from '../Row'
import CurrencyLogo, { getCurrencyLogoUrls } from '../CurrencyLogo'
import { MouseoverTooltip } from '../Tooltip'
import { MenuItem } from './styleds'
import Loader from '../Loader'
import { isTokenOnList } from '../../utils'
import ImportRow from './ImportRow'
import { unwrappedToken, wrappedCurrency } from 'utils/wrappedCurrency'
import { LightGreyCard } from 'components/Card'
import TokenListLogo from '../../assets/svg/tokenlist.svg'
import QuestionHelper from 'components/QuestionHelper'
import useTheme from 'hooks/useTheme'
import { PlusCircle } from 'react-feather'
import _get from 'lodash.get'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Dots } from 'components/swap/styleds'
import { BIG_INT_ZERO } from '../../constants'
// import { useDerivedBlendInfo } from 'state/blend/hooks'

function currencyKey(currency: Currency, chainId = ChainId.MATIC): string {
  return currency instanceof Token ? currency.address : currency === Currency.getNativeCurrency(chainId) ? Currency.getNativeCurrencySymbol(chainId) || 'MATIC ' : ''
}


const TextIcon = styled.div`
  display: flex;
`
const Icon = styled.div`
  margin: auto 3px;
`

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

const MenuItemLP = styled(RowBetween)`
    padding: 4px 20px;
    height: 56px;
    display: grid;
    grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 5px);
    grid-gap: 16px;
    cursor: ${({ disabled }) => !disabled && 'pointer'};
    pointer-events: ${({ disabled }) => disabled && 'none'};
    :hover {
      background-color: ${({ theme, disabled }) => !disabled && theme.bg2};
    }
    opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

function Balance({ balance }: { balance: CurrencyAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

interface LPPositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakingInfo?: any
  handleLPSelect: (token: Pair)=>void
  stakedBalance?: TokenAmount, // optional balance to indicate that liquidity is deposited in mining pool
  hideZeroBalance?: boolean
}

const TokenListLogoWrapper = styled.img`
  height: 20px;
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}) {
  const { ethereum } = window
  const { account, chainId } = useActiveWeb3React()
  const key = currencyKey(currency)
  const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)

  //for Plus or add directly to the metamask
  const isMetamask = (ethereum && ethereum.isMetaMask && isOnSelectedList);
  const addTokenToMetamask = (tokenAddress:any, tokenSymbol:any, tokenDecimals:any) => {    if(ethereum) {
      // @ts-ignore
      ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: getCurrencyLogoUrls(tokenAddress, tokenSymbol, chainId) // A string url of the token logo
          },
        },
      })
      .then((result:any) => {
      })
      .catch((error:any) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('We can encrypt anything without the key.');
        } else {
          console.error(error);
        }
      });
    } 
  }

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <CurrencyLogo currency={currency} size={'24px'} />
      <Column>
        <TextIcon>
          <Text title={currency.getName(chainId)} fontWeight={500}>
            { //TODO: refactor (change in sdk)
              currency.symbol
            }
          </Text>
          <Icon>
            { isMetamask && currency !== Currency.getNativeCurrency(chainId ?? 137) && (
              <LinkStyledButton
              style={{cursor: 'pointer'}}
              onClick={event => {
                addTokenToMetamask(
                  currency instanceof Token ? currency.address : '',
                  currency.symbol,
                  currency.decimals
                )
                event.stopPropagation()
              }}
              >
              <PlusCircle size={"17px"} />
              </LinkStyledButton>
              )
            }
          </Icon>
        </TextIcon>
        
        <TYPE.darkGray ml="0px" fontSize={'12px'} fontWeight={300}>
          {currency.getName(chainId)} {!isOnSelectedList && customAdded && '• Added by user'}
        </TYPE.darkGray>
      </Column>
      <TokenTags currency={currency} />
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
      </RowFixed>
    </MenuItem>
  )
}

export function LPPositionCard({ 
  pair, 
  border, 
  stakedBalance, 
  stakingInfo,
  handleLPSelect,
  hideZeroBalance
}:LPPositionCardProps) {
  const { account} = useActiveWeb3React()
  
  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)
  const userDefaultPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance
  const showCard = hideZeroBalance? userPoolBalance?.greaterThan(BIG_INT_ZERO): true;

  const handleLPMenuSelect = useCallback((pair: Pair)=>{
    if(pair instanceof Pair) {
      handleLPSelect(pair)
    }
  }, [handleLPSelect])
  return (
    showCard? <MenuItemLP
      // style={style}
      // className={`token-item-${key}`}
      onClick={()=> handleLPMenuSelect(pair)}
      disabled={false}
      selected={false}
    >
      <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
      <Text fontWeight={500} fontSize={20}>
        {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
      </Text>
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {userPoolBalance ? <Balance balance={userPoolBalance} /> : account ? <Loader /> : null}
      </RowFixed>
    </MenuItemLP>: null
  )
}


export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showETH,
  showImportView,
  setImportToken,
  breakIndex
}: {
  height: number
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: (Currency | null) | (Currency | undefined)[]
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showETH: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
  breakIndex: number | undefined
}) {
  const { chainId } = useActiveWeb3React()
  const itemData: (Currency | undefined)[] = useMemo(() => {
    let formatted: (Currency | undefined)[] = showETH ? [Currency.getNativeCurrency(chainId), ...currencies] : currencies
    if (breakIndex !== undefined) {
      formatted = [...formatted.slice(0, breakIndex), undefined, ...formatted.slice(breakIndex, formatted.length)]
    }
    return formatted
  }, [breakIndex, currencies, showETH, chainId])
  const theme = useTheme()

  const inactiveTokens: {
    [address: string]: Token
  } = useAllInactiveTokens()

  // const {inputCurrencyArr } = useDerivedBlendInfo()

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index]
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const otherCurrencyVal = Array.isArray(otherCurrency) ? otherCurrency.find(x=>_get(x, 'address', x?.symbol) === _get(currency, 'address', currency?.symbol)) : otherCurrency
      const otherSelected = Boolean(otherCurrencyVal && currencyEquals(otherCurrencyVal, currency))
      
      const handleSelect = () => onCurrencySelect(currency)
      const token = wrappedCurrency(currency, chainId)
      const showImport = inactiveTokens && token && Object.keys(inactiveTokens).includes(token.address)

      if (index === breakIndex || !data) {
        return (
          <FixedContentRow style={style}>
            <LightGreyCard padding="8px 12px" borderRadius="8px">
              <RowBetween>
                <RowFixed>
                  <TokenListLogoWrapper src={TokenListLogo} />
                  <TYPE.main ml="6px" fontSize="12px" color={theme.text1}>
                    Expanded results from inactive Token Lists
                  </TYPE.main>
                </RowFixed>
                <QuestionHelper text="Tokens from inactive lists. Import specific tokens below or click 'Manage' to activate more lists." />
              </RowBetween>
            </LightGreyCard>
          </FixedContentRow>
        )
      }

      if (showImport && token) {
        return (
          <ImportRow
            style={style}
            token={token}
            showImportView={showImportView}
            setImportToken={setImportToken}
            dim={true}
          />
        )
      } else {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
          />
        )
      }
    },
    [
      chainId,
      inactiveTokens,
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      setImportToken,
      showImportView,
      breakIndex,
      theme.text1
    ]
  )

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
