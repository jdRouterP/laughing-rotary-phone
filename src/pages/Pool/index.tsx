import React, { useContext, useEffect, useMemo, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair, JSBI, Token } from '@dfyn/sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { useUserHasLiquidityInAllTokens } from '../../data/V1'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { StyledInternalLink, ExternalLink, TYPE, HideSmall } from '../../theme'
import { Text } from 'rebass'
import Card from '../../components/Card'
import { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { Dots } from '../../components/swap/styleds'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { useStakingInfo as useFloraStakingInfo } from '../../state/flora-farms/hooks'
import { useStakingInfo as useDualStakingInfo } from '../../state/dual-stake/hooks'
import { useStakingInfo as usePreStakingInfo } from '../../state/stake/hooks'
import { useStakingInfo as useVanillaStakingInfo } from '../../state/vanilla-stake/hooks'
import { BIG_INT_ZERO } from '../../constants'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { CHART_URL_PREFIX } from 'constants/networks'
import { SearchInput } from 'components/SearchModal/styleds'



// const SearchItem = styled.div`
//   display: flex;
//   max-width: 645px;
//   width: 100%;
//   border-radius: 10px;
//   background: ${({theme}) => theme.bg3};
//   border-radius: 10px;
//   padding-right: 13px;
// `

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account, chainId } = useActiveWeb3React()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const hasV1Liquidity = useUserHasLiquidityInAllTokens()

  // show liquidity even if its deposited in rewards contract
  const vanillaStakingInfo = useVanillaStakingInfo()
  const vanillaStakingInfosWithBalance = vanillaStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const preStakingInfo = usePreStakingInfo()
  const preStakingsWithBalance = preStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const dualStakingInfo = useDualStakingInfo()
  const dualStakingInfosWithBalance = dualStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const floraStakingInfo = useFloraStakingInfo()
  const floraStakingInfosWithBalance = floraStakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  //ORDER MATTERS
  let stakingPairs = [...usePairs(vanillaStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
  ...usePairs(preStakingsWithBalance?.map(stakingInfo => stakingInfo.tokens)),
  ...usePairs(dualStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens)),
  ...usePairs(floraStakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))]
  let balances = [...vanillaStakingInfosWithBalance,
  ...preStakingsWithBalance,
  ...dualStakingInfosWithBalance,
  ...floraStakingInfosWithBalance];
  // remove any pairs that also are included in pairs with stake in mining pool
  const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
    return (
      stakingPairs
        ?.map(stakingPair => stakingPair[1])
        .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
    )
  })

  const { currencies: swapCurrency } = useDerivedSwapInfo()

  const [inputCurrency, setinputCurrency] = useState(swapCurrency?.INPUT instanceof Token ? swapCurrency?.INPUT?.address : swapCurrency?.INPUT?.symbol ?? 'MATIC')
  const [outputCurrency, setOutputCurrency] = useState(swapCurrency?.OUTPUT instanceof Token ? swapCurrency?.OUTPUT?.address : swapCurrency?.OUTPUT?.symbol ?? '0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97')

  useEffect(() => {
    const localInput = sessionStorage.getItem('CurrencyInput')
    const localOutput = sessionStorage.getItem('CurrencyOutput')
    if (localInput) {
      setinputCurrency(localInput)
    }
    if (localOutput) {
      setOutputCurrency(localOutput)
    }
  }, [inputCurrency, outputCurrency])

  const [searchItem, setSearchItem] = useState('')

  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active={'pool'} />
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Liquidity provider rewards</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  {`Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
                </TYPE.white>
              </RowBetween>
              {/* <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                target="_blank"
                href="https://uniswap.org/docs/v2/core-concepts/pools/"
              >
                <TYPE.white fontSize={14}>Read more about providing liquidity</TYPE.white>
              </ExternalLink> */}
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>

        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
              <HideSmall>
                <TYPE.mediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                  Your liquidity
                </TYPE.mediumHeader>
              </HideSmall>
              <ButtonRow>
                <ResponsiveButtonSecondary as={Link} padding="6px 8px" to={`/create/${inputCurrency}/${outputCurrency}`}>
                  Create a pair
                </ResponsiveButtonSecondary>
                <ResponsiveButtonPrimary
                  id="join-pool-button"
                  as={Link}
                  padding="6px 8px"
                  borderRadius="12px"
                  to={`/add/${inputCurrency}/${outputCurrency}`}
                >
                  <Text fontWeight={500} fontSize={16}>
                    Add Liquidity
                  </Text>
                </ResponsiveButtonPrimary>
              </ButtonRow>
            </TitleRow>

            {!account ? (
              <Card padding="40px">
                <TYPE.body color={theme.text3} textAlign="center">
                  Connect to a wallet to view your liquidity.
                </TYPE.body>
              </Card>
            ) : v2IsLoading ? (
              <EmptyProposals>
                <TYPE.body color={theme.text3} textAlign="center">
                  <Dots>Loading</Dots>
                </TYPE.body>
              </EmptyProposals>
            ) : allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0 ? (
              <>
                <ButtonSecondary>
                  <RowBetween>
                    <ExternalLink href={`https://${CHART_URL_PREFIX[(chainId ? chainId : 1)]}.dfyn.network/account/` + account}>
                      Account analytics and accrued fees
                    </ExternalLink>
                    <span> ↗</span>
                  </RowBetween>
                </ButtonSecondary>
                {/* <SearchItem> */}
                  <SearchInput 
                    type="text" 
                    placeholder="Search by name, symbol, address" 
                    onChange={(e)=>{
                    setSearchItem(e.target.value)
                  }}/>
                {/* </SearchItem> */}
                {v2PairsWithoutStakedAmount?.filter(stakingInfos => {
                  if(searchItem === '') return stakingInfos
                  //for symbol
                  else if(stakingInfos?.token0.symbol?.toLowerCase().includes(searchItem.toLowerCase()) 
                  || stakingInfos?.token1?.symbol?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                  //for name
                  else if(stakingInfos?.token0?.name?.toLowerCase().includes(searchItem.toLowerCase()) 
                  || stakingInfos?.token1?.name?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                  //for address
                  else if(stakingInfos?.token0?.address?.toLowerCase().includes(searchItem.toLowerCase()) 
                  || stakingInfos?.token1?.address?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                  //Other case
                  else return ""
                  
                }).map(v2Pair => (
                  <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                ))}
                {stakingPairs?.filter(stakingInfos => {
                  if(searchItem === '') return stakingInfos
                  //for symbol
                  else if(stakingInfos[1]?.token0.symbol?.toLowerCase().includes(searchItem.toLowerCase()) 
                  || stakingInfos[1]?.token1?.symbol?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                  //for name
                  else if(stakingInfos[1]?.token0?.name?.toLowerCase().includes(searchItem.toLowerCase()) 
                  || stakingInfos[1]?.token1?.name?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                  //for address
                  else if(stakingInfos[1]?.token0?.address?.toLowerCase().includes(searchItem.toLowerCase()) 
                  || stakingInfos[1]?.token1?.address?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                  //Other case
                  else return ""
                  
                }).map(
                  (stakingPair, i) => {
                    return stakingPair[1] && ( // skip pairs that arent loaded
                      <FullPositionCard
                        key={i}
                        pair={stakingPair[1]}
                        stakingInfo={balances[i]}
                        stakedBalance={balances[i]?.stakedAmount}
                      />
                    )
                  }

                )}
              </>
            ) : (
              <EmptyProposals>
                <TYPE.body color={theme.text3} textAlign="center">
                  No liquidity found.
                </TYPE.body>
              </EmptyProposals>
            )}

            <AutoColumn justify={'center'} gap="md">
              <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
                {hasV1Liquidity ? 'Uniswap V1 liquidity found!' : "Don't see a pool you joined?"}{' '}
                <StyledInternalLink id="import-pool-link" to={hasV1Liquidity ? '/migrate/v1' : '/find'}>
                  {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
                </StyledInternalLink>
              </Text>
            </AutoColumn>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}
