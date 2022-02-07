
import { RowBetween } from 'components/Row'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { darken } from 'polished'
import React, { useRef } from 'react'
import { ChevronDown } from 'react-feather'
import { NavLink } from 'react-router-dom'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'


const StyledMenuButton = styled.button`
  display: flex;
  width: 100%;
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

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }
//   ${({ theme }) => theme.mediaWidth.upToMedium`
//     font-size: 0.7rem
//   `};
//   svg {
//     margin-top: 2px;
//   }

//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     font-size: 10px;
//     margin-right: 2px;
//     padding: 1px 4px;
// `};
`


const activeClassName = 'ACTIVE'
const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
//   align-items: left;
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
  // max-width: 90px;
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
  right: 0rem;
  z-index: 100;

//   ${({ theme }) => theme.mediaWidth.upToExtraLarge`
//     left: -8.25rem;
//   `};
`
const Content = styled.div`
    width: 100%;
    max-width: 640px;
`


export default function CustomFarms({farmsName}:{farmsName: string}) {
    const node = useRef<HTMLDivElement>()
    const open = useModalOpen(ApplicationModal.CUSTOM_FARM_MENU)
    const toggle = useToggleModal(ApplicationModal.CUSTOM_FARM_MENU)
    useOnClickOutside(node, open ? toggle : undefined)
    return (
        <Content>
           <RowBetween>
                <TYPE.black fontSize="18px">Select Farms</TYPE.black>
                <StyledMenu ref={node as any}>
                    <StyledMenuButton onClick={toggle}>
                        <TYPE.black fontSize="16px" margin="auto 0">{farmsName}</TYPE.black>
                        <ChevronDown size="15px" style={{ margin: "auto 0 auto 5px"}}/>
                    </StyledMenuButton>
                    {open && (
                        <MenuFlyout>
                            <StyledNavLink id={`v-farms-nav-link`} to={'/custom-dual-farms'}>
                                Dual Farms
                            </StyledNavLink>
                            <StyledNavLink id={`v-farms-nav-link`} to={'/custom-eco-farms'}>
                                Ecosystem Farms
                            </StyledNavLink>
                            <StyledNavLink id={`v-farms-nav-link`} to={'/custom-popular-farms'}>
                                Popular Farms
                            </StyledNavLink>
                            <StyledNavLink id={`v-farms-nav-link`} to={'/custom-launch-farms'}>
                                Launch Farms
                            </StyledNavLink>
                        </MenuFlyout>
                    )}
                </StyledMenu>
            </RowBetween> 
        </Content>
        
        
    )
}
