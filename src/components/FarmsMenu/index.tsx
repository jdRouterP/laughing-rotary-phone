import React, { useRef } from 'react'
// import { Info, PieChart, Send } from 'react-feather'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
// import { useActiveWeb3React } from '../../hooks'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { darken } from 'polished'
// import { ExternalLink } from '../../theme'
// import { ButtonPrimary } from '../Button'

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};

  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  color: white;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #C0657A 0%, #59ADE1 100%), #edeef2;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.7rem
  `};
  svg {
    margin-top: 2px;
  }
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
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 12.125rem;
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    left: -8.25rem;
  `};
`

// const MenuItem = styled(ExternalLink)`
//   flex: 1;
//   padding: 0.5rem 0.5rem;
//   color: ${({ theme }) => theme.text2};
//   :hover {
//     color: ${({ theme }) => theme.text1};
//     cursor: pointer;
//     text-decoration: none;
//   }
//   > svg {
//     margin-right: 8px;
//   }
// `


export default function FarmsMenu() {
  // const { account } = useActiveWeb3React()

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.FARMS_MENU)
  const toggle = useToggleModal(ApplicationModal.FARMS_MENU)
  useOnClickOutside(node, open ? toggle : undefined)
  // const openClaimModal = useToggleModal(ApplicationModal.ADDRESS_CLAIM)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>

      <StyledMenuButton onClick={toggle}>
        ⚡FARMS
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          <StyledNavLink id={`f-farms-nav-link`} to={'/popular-farms'}>
            Popular Farms
          </StyledNavLink>
          <StyledNavLink id={`d-farms-nav-link`} to={'/dual-farms'}>
            Dual Farms
          </StyledNavLink>
          <StyledNavLink id={`stake-nav-link`} to={'/vault'}>
            Single-Asset Vault
          </StyledNavLink>
          <StyledNavLink id={`stake-nav-link`} to={'/dfyn'}>
            Pre-Staking Farms
          </StyledNavLink>
          {/* <StyledNavLink id={`v-farms-nav-link`} to={'/v-farms'}>
            Vanilla Farms
          </StyledNavLink> */}
          {/* {account && (
            <ButtonPrimary onClick={openClaimModal} padding="8px 10px" width="100%" borderRadius="12px" mt="0.5rem">
              Claim DFYN
            </ButtonPrimary>
          )} */}
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
