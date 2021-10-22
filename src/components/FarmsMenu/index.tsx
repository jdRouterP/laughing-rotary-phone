import React, { useRef } from 'react'
// import { Info, PieChart, Send } from 'react-feather'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { darken } from 'polished'
// import { ExternalLink } from '../../theme'
// import { ButtonPrimary } from '../Button'
import { ChevronDown, XCircle} from 'react-feather'
import { useFarmsHelptextToggle, useFarmsHelptextVisible } from 'state/user/hooks'
import { FARMS_ACCESS } from 'constants/networks'

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

const FarmsHelpText = styled.span`
  color: #FFF;
  background: #2172e5;
  top: 100%;
  position: absolute;
  padding: 5px 10px;
  margin-top: 5px;
  width: 120px;
  font-size: 12px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  z-index: -1;
  display: inherit;

  span {
    text-align: right;
    position: absolute;
    right: 6px;
    margin: auto;
    &:hover svg{
      color: rgb(189, 189, 189);
    }
  }
  &:after{
    content: '';
    display: block;
    position: absolute;
    left: 40%;
    bottom: 100%;
    width: 0;
    height: 0;
    border-bottom: 6px solid #2172e5;
    border-top: 6px solid transparent;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  right: 0;
  &:after{
    left: 70%;
  }
  `};
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
  const { chainId } = useActiveWeb3React()

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.FARMS_MENU)
  const toggle = useToggleModal(ApplicationModal.FARMS_MENU)
  useOnClickOutside(node, open ? toggle : undefined)
  // const openClaimModal = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  // const [showTooltip, setTooltip] = useState(true)
  const toggleFarmsHelptextWarning = useFarmsHelptextToggle()
  let farmingTooltipVisible = useFarmsHelptextVisible()
  if (farmingTooltipVisible === undefined) farmingTooltipVisible = true
  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <span role="img" aria-label="FARMS"><MenuText>Farms <ChevronDown size={18}/></MenuText></span>
      </StyledMenuButton>
      {farmingTooltipVisible && <FarmsHelpText onClick={toggleFarmsHelptextWarning}>Farms & Vault <span><XCircle size={14} /></span></FarmsHelpText>}

      {open && (
        <MenuFlyout>
          {chainId && FARMS_ACCESS.singleAssetVault.includes(chainId) && <StyledNavLink id={`stake-nav-link`} to={'/vault'}>
            Single-Asset Vault
          </StyledNavLink>}
          {chainId && FARMS_ACCESS.ecosystem.includes(chainId) && <StyledNavLink id={`v-farms-nav-link`} to={'/eco-farms'}>
            Ecosystem Farms
          </StyledNavLink>}
          {chainId && FARMS_ACCESS.popular.includes(chainId) && <StyledNavLink id={`f-farms-nav-link`} to={'/popular-farms'}>
            Popular Farms
          </StyledNavLink>}
          {chainId && FARMS_ACCESS.dual.includes(chainId) && <StyledNavLink id={`d-farms-nav-link`} to={'/dual-farms'}>
            Dual Farms
          </StyledNavLink>}
          {chainId && FARMS_ACCESS.launch.includes(chainId) && <StyledNavLink id={`stake-nav-link`} to={'/launch-farms'}>
            Launch Farms
          </StyledNavLink>}
          {chainId && FARMS_ACCESS.prestake.includes(chainId) && <StyledNavLink id={`stake-nav-link`} to={'/dfyn'}>
            Pre-Staking Farms
          </StyledNavLink>}
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
