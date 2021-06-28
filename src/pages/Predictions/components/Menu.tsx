//@ts-nocheck
import React from 'react'
import styled from 'styled-components'
import { Flex, HelpIcon, IconButton } from '@pancakeswap/uikit'
import FlexRow from './FlexRow'
import PrevNextNav from './PrevNextNav'
import HistoryButton from './HistoryButton'
import TokenUSDPrice from './TokenUSDPrice'
import TimerLabel from './TimerLabel'

const SetCol = styled.div`
  flex: none;
  width: auto;  
  width: 270px;
  `
// ${({ theme }) => theme.mediaWidth.upToLarge} {
// }

const HelpButtonWrapper = styled.div`
  order: 1;
  margin: 0 8px 0 0;

  `
// ${({ theme }) => theme.mediaWidth.upToLarge} {
//   order: 2;
//   margin: 0 0 0 8px;
// }

const TimerLabelWrapper = styled.div`
  order: 2;

  `
// ${({ theme }) => theme.mediaWidth.upToLarge} {
//   order: 1;
// }

const HistoryButtonWrapper = styled.div`
  display: initial;
  order: 3;
  
  `
// ${({ theme }) => theme.mediaWidth.upToLarge} {
//   display: initial;
// }

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
`

const Menu = () => {
  return (
    <Header>
      <TokenUSDPrice />
      <TimerLabel interval="10" unit="m" />
      <HistoryButton />
    </Header>
  )
}

export default Menu
