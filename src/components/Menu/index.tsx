import { HowToVote } from '@material-ui/icons'
import { CHART_URL_PREFIX } from 'constants/networks'
import { useActiveWeb3React } from 'hooks'
import React, { useRef } from 'react'
import { Info, Send, Book, MessageCircle, TrendingUp } from 'react-feather'
import styled from 'styled-components'
import { ReactComponent as MenuIcon } from '../../assets/images/menu.svg'
// import { useActiveWeb3React } from '../../hooks'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'

import { ExternalLink } from '../../theme'
// import { ButtonPrimary } from '../Button'

const HideChart = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: block;
    margin-top: 6px;
  `}
`

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`

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

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
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
  min-width: 9.5rem;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 4rem;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
    top: -14rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    top: -16rem;
  `};
`

const MenuItem = styled(ExternalLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`


export default function Menu() {
  // const { account } = useActiveWeb3React()
  const { chainId } = useActiveWeb3React()
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggle = useToggleModal(ApplicationModal.MENU)
  useOnClickOutside(node, open ? toggle : undefined)
  // const openClaimModal = useToggleModal(ApplicationModal.ADDRESS_CLAIM)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          <MenuItem id="link" href="https://www.dfyn.network/">
            <Info size={14} />
            About
          </MenuItem>
          <MenuItem id="link" href="https://docs.dfyn.network/">
            <Book size={14} />
            Docs
          </MenuItem>
          <MenuItem id="link" href="https://t.me/Dfyn_HQ">
            <Send size={14} />
            Telegram
          </MenuItem>
          <MenuItem id="link" href="https://discord.com/invite/yjM2fUUHvN">
            <MessageCircle size={14} />
            Discord
          </MenuItem>
          <MenuItem id="link" href="https://governance.dfyn.network/">
            <HowToVote style={{ fontSize: "16px" }} />
            Governance
          </MenuItem>
          <HideChart>
            <MenuItem id="link" href={`https://${CHART_URL_PREFIX[(chainId ? chainId : 137)]}.dfyn.network/home/`}>
              <TrendingUp size={15} />
              Charts
            </MenuItem>
          </HideChart>

          {/* <MenuItem id="link" href="https://info.dfyn.network/">
            <PieChart size={14} />
            Analytics
          </MenuItem> */}
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
