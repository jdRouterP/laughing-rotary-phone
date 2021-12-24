import React, { useRef } from 'react'
// import { MoreHorizontal } from 'react-feather'
import { ChevronDown } from 'react-feather'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
// import { Apps } from '@material-ui/icons'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { darken } from 'polished'
import { TYPE } from 'theme'
const StyledMenuButton = styled.button`
  height: 100%;
  width: 100%;
  border: none;
  background-color: transparent;
  padding: 0;
  height: 35px;
  border-radius: 0.5rem;

  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  padding: 0.15rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  position: relative;
  outline: none;
  cursor: pointer;

  svg {
    margin: auto;
    position: absolute;
    margin: 0;
    margin-top: 2px;
    margin-left: 4px;
    vertical-align: middle;
    bottom: 4px;
    margin-bottom: 3px;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      margin-bottom: 1px;
    `};
  }
`
const MenuText = styled.span`
  // position: absolute;
  margin: auto;
  height: 100%;
  display: inline;
  vertical-align: middle;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `};
`

const activeClassName = 'ACTIVE'
const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  padding: 0.25rem 0rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: space-around;
  justify-content: center;
  align-items: stretch;


  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  border-radius: 0.5rem;
  padding: 0rem 0;
  padding-right: 1.2rem;
  // background-color: ${({ theme }) => theme.bg3};

  cursor: pointer;
  :hover,
  :focus {
    background-color: ${({ theme }) => theme.bg3};
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-bottom: 3px;
  `};
`

const MenuFlyout = styled.span`
  min-width: 13rem;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  left: 0rem;
  right: 0rem;
  z-index: 100;
  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
  left: -8.25rem;
`};
`
const MenuDesc = styled.div`
  color: ${({ theme }) => theme.text10};
`

const Icon = styled.div`
  margin-left: 40px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-left: 32px;
  `};
`

export default function AppsMenu() {
  // const { account } = useActiveWeb3React()

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.APPS_MENU)
  const toggle = useToggleModal(ApplicationModal.APPS_MENU)
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
      <MenuText>
          More 
          <Icon>
            <ChevronDown size={18}/>
          </Icon>
        </MenuText>
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          <StyledNavLink id={`stake-nav-link`} to={'/prediction'}>
            <TYPE.mediumHeader fontSize={'16px'}>Prediction Markets</TYPE.mediumHeader>
            <MenuDesc>
              <TYPE.subHeader fontWeight={500} fontSize={'10px'}>Predict & earn</TYPE.subHeader>
            </MenuDesc>

          </StyledNavLink>
          <StyledNavLink id={`v-farms-nav-link`} to={'/dfyn-fusion'}>
          <TYPE.mediumHeader fontSize={'16px'}>Dfyn Fusion</TYPE.mediumHeader>
            <MenuDesc>
              <TYPE.subHeader fontWeight={500} fontSize={'10px'}>Convert multiple tokens into one</TYPE.subHeader>
            </MenuDesc>
          </StyledNavLink>
          <StyledNavLink id={`trading-nav-link`} to={'/trading-leaderboard'}>
          <TYPE.mediumHeader fontSize={'16px'}>Trading Competition</TYPE.mediumHeader>
            <MenuDesc>
              <TYPE.subHeader fontWeight={500} fontSize={'10px'}>Trading Leaderboard</TYPE.subHeader>
            </MenuDesc>
          </StyledNavLink>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
