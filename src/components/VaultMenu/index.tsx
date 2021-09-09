import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { darken } from 'polished'
import React, { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import styled from 'styled-components'

const activeClassName = 'ACTIVE'

const StyledMenu = styled.div`
  margin: 0 12px;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: 0 6px;
  `};
`

const StyledMenuButton = styled.div`
  color: ${({ theme }) => theme.text2};
  font-weight: 500;
  cursor: pointer;

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

  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    left: -8.25rem;
  `};
`


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

export default function VaultMenu() {

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.VAULT_MENU)
  const toggle = useToggleModal(ApplicationModal.VAULT_MENU)
  useOnClickOutside(node, open ? toggle : undefined)
  return (
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <span role="img" aria-label="VAULT">Vault</span>
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          {/* <StyledNavLink id={`x-vault-nav-link`} to={'/vdfyn'}>
                    vDFYN
                </StyledNavLink> */}
          <StyledNavLink id={`v-vault-nav-link`} to={'/vault'}>
            Single-Asset Vault
          </StyledNavLink>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
