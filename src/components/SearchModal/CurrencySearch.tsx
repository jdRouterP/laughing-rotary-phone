import { Currency, Pair, Token } from '@dfyn/sdk'
import React, { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactGA from 'react-ga'
import { useTranslation } from 'react-i18next'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useToken, useIsUserAddedToken, useFoundOnInactiveList } from '../../hooks/Tokens'
import { CloseIcon, TYPE, ButtonText, IconWrapper } from '../../theme'
import { isAddress } from '../../utils'
import Column, { AutoColumn } from '../Column'
import Row, { RowBetween, RowFixed } from '../Row'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { filterTokens, useSortedTokensByQuery } from './filtering'
import { useTokenComparator } from './sorting'
import { PaddedColumn, SearchInput, Separator } from './styleds'
import AutoSizer from 'react-virtualized-auto-sizer'
import styled from 'styled-components'
import useToggle from 'hooks/useToggle'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'
import ImportRow from './ImportRow'
import { Edit } from 'react-feather'
import useDebounce from 'hooks/useDebounce'
import { ButtonTab, ButtonTabItem } from 'components/ButtonTab'
// import { usePairs } from 'data/Reserves'
// import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
// import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
// import { useStakingInfo as useFloraStakingInfo } from '../../state/flora-farms/hooks'
// import { useStakingInfo as useDualStakingInfo } from '../../state/dual-stake/hooks'
// import { useStakingInfo as usePreStakingInfo } from '../../state/stake/hooks'
// import { useStakingInfo as useVanillaStakingInfo } from '../../state/vanilla-stake/hooks'
// import { useInactiveStakingInfo as useInactiveFloraStakingInfo } from '../../state/flora-farms/hooks'
// import { useInactiveStakingInfo as useInactiveDualStakingInfo } from '../../state/dual-stake/hooks'
// import { useInactiveStakingInfo as useInactivePreStakingInfo } from '../../state/stake/hooks'
// import { useInactiveStakingInfo as useInactiveVanillaStakingInfo } from '../../state/vanilla-stake/hooks'
// import { BIG_INT_ZERO } from '../../constants'
// import { Dots } from 'components/swap/styleds'
// import getLP from 'components/LiquidityDetails/hooks'
import LPOptions from 'pages/DfynFusion/LPOptions'
// import DoubleCurrencyLogo from 'components/DoubleLogo'
// import { Dots } from 'components/swap/styleds'


const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
`

const Footer = styled.div`
  width: 100%;
  border-radius: 20px;
  padding: 20px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.bg1};
  border-top: 1px solid ${({ theme }) => theme.bg2};
`

const ButtonMenuContainer = styled.div`
  width: 100%;
  margin-bottom: 15px;
  & > div {
    width: 100%;
  }

  & button {
    width: 100%;
  }
`

const PaddedSearch = styled.div`
    padding: 0px 20px 20px 20px;
`

const PaddedColumnContent = styled(AutoColumn)`
    padding: 20px 20px 0px 20px;
`

// const EmptyProposals = styled.div`
//   padding: 16px 12px;
//   border-radius: 12px;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
// `

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: (Currency | null) | (Currency | undefined)[]
  showCommonBases?: boolean
  showManageView: () => void
  showImportView: () => void
  setImportToken: (token: Token) => void
  lp?: boolean
  onLPCurrencySelect?: (pair: Pair) => void
}

export enum FusionTabs {
  Tokens,
  LP,
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  showManageView,
  showImportView,
  setImportToken,
  onLPCurrencySelect,
  lp
}: CurrencySearchProps) {
  const { t } = useTranslation()
  const {  chainId } = useActiveWeb3React()
  const theme = useTheme()

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const [invertSearchOrder] = useState<boolean>(false)

  const allTokens = useAllTokens()

  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery)
  const searchToken = useToken(debouncedQuery)
  const searchTokenIsAdded = useIsUserAddedToken(searchToken)

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch
      })
    }
  }, [isAddressSearch])

  const showETH: boolean = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim()
    return s === '' || s === 'e' || s === 'et' || s === 'eth'
  }, [debouncedQuery])

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens), debouncedQuery)
  }, [allTokens, debouncedQuery])

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator)
  }, [filteredTokens, tokenComparator])

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery)

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  const handleLPCurrencySelect = useCallback(
    (pair: Pair) => {
      onLPCurrencySelect && onLPCurrencySelect(pair)
      onDismiss()
    },
    [onDismiss, onLPCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim()
        if (s === 'eth') {
          handleCurrencySelect(Currency.getNativeCurrency(chainId))
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, debouncedQuery, chainId]
  )

  // menu ui
  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, open ? toggle : undefined)

  // if no results on main list, show option to expand into inactive
  const inactiveTokens = useFoundOnInactiveList(debouncedQuery)
  const filteredInactiveTokens: Token[] = useSortedTokensByQuery(inactiveTokens, debouncedQuery)
  
  //switch tab
  const [activeTab, setActiveTab] = useState(0)
  const switchTab = async (tabIndex: number) => {
    setActiveTab(tabIndex)
  }

  //for liquidity providers

  
  return (
    <ContentWrapper>
      {lp ? 
        <>
          <PaddedColumnContent gap="16px">
            <RowBetween>
              <Text fontWeight={500} fontSize={16}>
                Select a token or LP Pair
              </Text>
              <CloseIcon onClick={onDismiss} />
            </RowBetween> 
            <ButtonMenuContainer>
              <ButtonTab activeIndex={activeTab} onItemClick={switchTab}>
                <ButtonTabItem width="50%" mr="5px">{t('Tokens')}</ButtonTabItem>
                <ButtonTabItem width="50%" color='text8'>{t('LP')}</ButtonTabItem>
              </ButtonTab>
            </ButtonMenuContainer>
          </PaddedColumnContent>
          { activeTab === FusionTabs.Tokens ?
            <>
              <PaddedSearch>
                <Row>
                  <SearchInput
                    type="text"
                    id="token-search-input"
                    placeholder={t('tokenSearchPlaceholder')}
                    autoComplete="off"
                    value={searchQuery}
                    ref={inputRef as RefObject<HTMLInputElement>}
                    onChange={handleInput}
                    onKeyDown={handleEnter}
                  />
                </Row>
                {showCommonBases && (
                  <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
                )}
              </PaddedSearch>
              <Separator />
              {searchToken && !searchTokenIsAdded ? (
              <Column style={{ padding: '20px 0', height: '100%' }}>
                <ImportRow token={searchToken} showImportView={showImportView} setImportToken={setImportToken} />
              </Column>
              ) : filteredSortedTokens?.length > 0 || filteredInactiveTokens?.length > 0 ? (
              <div style={{ flex: '1' }}>
                <AutoSizer disableWidth>
                  {({ height }) => (
                    <CurrencyList
                      height={height}
                      showETH={showETH}
                      currencies={
                        filteredInactiveTokens ? filteredSortedTokens.concat(filteredInactiveTokens) : filteredSortedTokens
                      }
                      breakIndex={inactiveTokens && filteredSortedTokens ? filteredSortedTokens.length : undefined}
                      onCurrencySelect={handleCurrencySelect}
                      otherCurrency={otherSelectedCurrency}
                      selectedCurrency={selectedCurrency}
                      fixedListRef={fixedList}
                      showImportView={showImportView}
                      setImportToken={setImportToken}
                    />
                  )}
                </AutoSizer>
              </div>
              ) : (
                <Column style={{ padding: '20px', height: '100%' }}>
                  <TYPE.main color={theme.text3} textAlign="center" mb="20px">
                    No results found.
                  </TYPE.main>
                </Column>
              )}
            </>
            :
            <>
              <LPOptions onLPSelect={handleLPCurrencySelect}/>
            </>
          }
        </> 
        :  
          <>
            <PaddedColumn gap="16px">
              <RowBetween>
                <Text fontWeight={500} fontSize={16}>
                  Select a token
                </Text>
                <CloseIcon onClick={onDismiss} />
              </RowBetween>
              <Row>
                <SearchInput
                  type="text"
                  id="token-search-input"
                  placeholder={t('tokenSearchPlaceholder')}
                  autoComplete="off"
                  value={searchQuery}
                  ref={inputRef as RefObject<HTMLInputElement>}
                  onChange={handleInput}
                  onKeyDown={handleEnter}
                />
              </Row>
              {showCommonBases && (
                <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
              )}
            </PaddedColumn>
            <Separator />
            {searchToken && !searchTokenIsAdded ? (
              <Column style={{ padding: '20px 0', height: '100%' }}>
                <ImportRow token={searchToken} showImportView={showImportView} setImportToken={setImportToken} />
              </Column>
            ) : filteredSortedTokens?.length > 0 || filteredInactiveTokens?.length > 0 ? (
              <div style={{ flex: '1' }}>
                <AutoSizer disableWidth>
                  {({ height }) => (
                    <CurrencyList
                      height={height}
                      showETH={showETH}
                      currencies={
                        filteredInactiveTokens ? filteredSortedTokens.concat(filteredInactiveTokens) : filteredSortedTokens
                      }
                      breakIndex={inactiveTokens && filteredSortedTokens ? filteredSortedTokens.length : undefined}
                      onCurrencySelect={handleCurrencySelect}
                      otherCurrency={otherSelectedCurrency}
                      selectedCurrency={selectedCurrency}
                      fixedListRef={fixedList}
                      showImportView={showImportView}
                      setImportToken={setImportToken}
                    />
                  )}
                </AutoSizer>
              </div>
            ) : (
              <Column style={{ padding: '20px', height: '100%' }}>
                <TYPE.main color={theme.text3} textAlign="center" mb="20px">
                  No results found.
                </TYPE.main>
              </Column>
            )}
          </>
      }
      <Footer>
        <Row justify="center">
          <ButtonText onClick={showManageView} color={theme.blue1} className="list-token-manage-button">
            <RowFixed>
              <IconWrapper size="16px" marginRight="6px">
                <Edit />
              </IconWrapper>
              <TYPE.main color={theme.blue1}>Manage</TYPE.main>
            </RowFixed>
          </ButtonText>
        </Row>
      </Footer>
    </ContentWrapper>
  )
}
