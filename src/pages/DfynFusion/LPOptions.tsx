import { Pair } from '@dfyn/sdk'
import useGetLP from 'components/LiquidityDetails/hooks'
import { LPPositionCard } from 'components/SearchModal/CurrencyList'
import { SearchInput, Separator } from 'components/SearchModal/styleds'
import { Dots } from 'components/swap/styleds'
import { useActiveWeb3React } from 'hooks'
import React, {useState} from 'react'
import styled, { useTheme } from 'styled-components'
import { TYPE } from 'theme'

const EmptyProposals = styled.div`
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const PaddedSearch = styled.div`
    padding: 0px 20px 20px 20px;
`

const AllLPTokens = styled.div`
  overflow-y: auto;
`

function LPOptions({ onLPSelect }: { onLPSelect: (token: Pair)=>void}) {
    const {account} = useActiveWeb3React()
    const {v2PairsWithoutStakedAmount, balances, v2IsLoading, stakingPairs, allV2PairsWithLiquidity} = useGetLP()
    const [searchItem, setSearchItem] = useState('')
    const theme = useTheme()
    return (
        <>
           {v2IsLoading ? (
                <EmptyProposals>
                  <TYPE.body color={theme.text3} textAlign="center">
                    <Dots>Loading</Dots>
                  </TYPE.body>
                </EmptyProposals>
                )
                : 
                ((allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0) && account ? 
                  <>
                    <PaddedSearch>
                      <SearchInput
                        type="text"
                        placeholder="Search by name, symbol, address"
                        onChange={(e) => {
                          setSearchItem(e.target.value)
                      }} />
                    </PaddedSearch>
                    <Separator />
                    <AllLPTokens>
                    {v2PairsWithoutStakedAmount?.filter(stakingInfos => {
                      if (searchItem === '') return stakingInfos
                      //for symbol
                      else if (stakingInfos?.token0.symbol?.toLowerCase().includes(searchItem.toLowerCase())
                        || stakingInfos?.token1?.symbol?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                      //for name
                      else if (stakingInfos?.token0?.name?.toLowerCase().includes(searchItem.toLowerCase())
                        || stakingInfos?.token1?.name?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                      //for address
                      else if (stakingInfos?.token0?.address?.toLowerCase().includes(searchItem.toLowerCase())
                        || stakingInfos?.token1?.address?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                      //Other case
                      else return ""

                    }).map(v2Pair => {
                      return (
                      <LPPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} handleLPSelect={onLPSelect}/>
                    )})}
                    {stakingPairs?.filter(stakingInfos => {
                      if (searchItem === '') return stakingInfos
                      //for symbol
                      else if (stakingInfos[1]?.token0.symbol?.toLowerCase().includes(searchItem.toLowerCase())
                        || stakingInfos[1]?.token1?.symbol?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                      //for name
                      else if (stakingInfos[1]?.token0?.name?.toLowerCase().includes(searchItem.toLowerCase())
                        || stakingInfos[1]?.token1?.name?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                      //for address
                      else if (stakingInfos[1]?.token0?.address?.toLowerCase().includes(searchItem.toLowerCase())
                        || stakingInfos[1]?.token1?.address?.toLowerCase().includes(searchItem.toLowerCase())) return stakingInfos

                      //Other case
                      else return ""

                    }).map(
                      (stakingPair, i) => {
                        return stakingPair[1] && ( // skip pairs that arent loaded
                          <LPPositionCard
                            key={i}
                            pair={stakingPair[1]}
                            stakingInfo={balances[i]}
                            stakedBalance={undefined}
                            handleLPSelect={onLPSelect}
                            hideZeroBalance={true}
                          />
                        )
                      }

                    )}
                    </AllLPTokens>
                  </>
                  :
                    <EmptyProposals>
                      <TYPE.body color={theme.text3} textAlign="center">
                        No liquidity found.
                      </TYPE.body>
                    </EmptyProposals>
                )
           }
        </>
    )
}

export default LPOptions
