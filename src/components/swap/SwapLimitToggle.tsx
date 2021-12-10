import React from 'react'
import styled from 'styled-components'
import { NavLink, useLocation } from 'react-router-dom';
import { darken } from 'polished';

const TopSection = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 0fr;
`

const StyledSwapHeader = styled.div`
  padding: 8px 0rem 0px 0px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

const activeClassName = 'ACTIVE'

const Button = styled(NavLink).attrs({
    activeClassName
})`
    padding: 8px 10px;
    text-decoration: none;
    border-radius: 0px;
    font-weight: 300;
    cursor: pointer;
    text-align: center;
    width: 50%;
    color: #bbb;
    &:last-child {
        border-right: none;
    }

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        font-size: 12px;
    `};

    &.${activeClassName} {
        border-radius: 12px;
        font-weight: 500;
        color: ${({ theme }) => theme.text1};
        background-color: ${({ theme }) => theme.primary1};
    }
    :hover,
    :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
    }


`

const ButtonGroup = styled.div`
    padding: 3px;
    border-radius: 10px;
    width: 60%;
    display: flex;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.bg3};
    border: none;
    box-shadow: 0px 0px 1px #00000087;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        width: 70%;
    `};

`
export default function SwapLimitToggle() {
    const location = useLocation();
    const SWAP_PAGE = '/swap'
    const isOnSwapPage = location.pathname.toLowerCase() === SWAP_PAGE
    return (
        <StyledSwapHeader>
            <TopSection>
                <ButtonGroup>
                    <Button isActive={(match, { pathname }) => isOnSwapPage} to={'/swap'}>Swap</Button>
                    <Button isActive={() => !isOnSwapPage} to={'/limit-order'}>Limit</Button>
                </ButtonGroup>
            </TopSection>
        </StyledSwapHeader>
    )
}