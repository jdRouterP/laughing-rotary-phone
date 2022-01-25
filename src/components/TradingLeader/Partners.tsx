import { useOnClickOutside } from 'hooks/useOnClickOutside';
import { darken } from 'polished';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'react-feather';
import { NavLink } from 'react-router-dom';
import { ApplicationModal } from 'state/application/actions';
import { useModalOpen, useToggleModal } from 'state/application/hooks';
import styled from 'styled-components';
import { TYPE } from 'theme';


const Content = styled.div`
    width: 40%;
    display: flex;
    justify-content: flex-end;
`
const StyledMenu = styled.div`
  // max-width: 90px;
  position: relative;
  border: none;
`

const StyledMenuButton = styled.button`
  display: flex;
  border: none;
  justify-content: space-around;
  padding: 12px 16px;
  max-width: 160px;
  width: 100%;
}
  background-color: ${({ theme }) => theme.bg3};

  border-radius: 0.5rem;

  color: white;
  font-weight: 500;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
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
  right: 0rem;
  z-index: 100;

//   ${({ theme }) => theme.mediaWidth.upToExtraLarge`
//     left: -8.25rem;
//   `};
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

export default function Partners({partnerName}: {partnerName: string}) {
    const node = useRef<HTMLDivElement>()
    const open = useModalOpen(ApplicationModal.PARTNERS_MENU)
    const toggle = useToggleModal(ApplicationModal.PARTNERS_MENU)
    useOnClickOutside(node, open ? toggle : undefined)
    const [pairs, setPairs] = useState([])
    const url = 'https://api.trading-competition.dfyn.network'
    useEffect(() => {
        fetch(`${url}/pairs/external_cohort`)
        .then(response => {
            if(response.ok){
                return response.json()
            }
            throw response
        })
        .then(data => {
            setPairs(data)
        })
        .catch(error => {
            console.log("Error in fetching data", error);
        })
    }, [])
    // const partnersName = pairs.map((i: any) => i.name)
    
    return (
        <Content>
            <StyledMenu ref={node as any}>
                <StyledMenuButton onClick={toggle}>
                    <TYPE.black fontSize="16px" margin="auto 0">{partnerName}</TYPE.black>
                    <ChevronDown size="15px" style={{ margin: "auto 0 auto 5px"}}/>
                </StyledMenuButton>
                {open &&
                        <MenuFlyout>{
                            pairs.map((i: any) => {
                                return(
                                    <StyledNavLink id={``} to={`/trading-leaderboard/external-cohort/${i.name.toLowerCase()}/${i.id}`}>
                                        {i.name}
                                    </StyledNavLink> 
                                )
                            }) 
                        }
                        </MenuFlyout>
                }
            </StyledMenu>
        </Content>
    )
}
