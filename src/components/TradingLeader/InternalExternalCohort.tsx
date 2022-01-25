import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { NavLink, useLocation } from 'react-router-dom';
import { darken } from 'polished';

const TopSection = styled.div`
    width: 100%;
    display: flex;
`

const StyledSwapHeader = styled.div`
  width: 60%;
  margin-bottom: 20px;
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
    padding: 6px;
    border-radius: 10px;
    width: 100%;
    max-width: 300px;
    display: flex;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.bg3};
    border: none;
    box-shadow: 0px 0px 1px #00000087;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        width: 70%;
        font-size: 10px;
    `};

`
export default function InternalExternalCohort() {
    const [infoPairs, setInfoPairs] = useState<any>([])
    const location = useLocation();
    const INTERNAL_PAGE = '/trading-leaderboard'
    const isOnInternalCohortPage = location.pathname.toLowerCase() === INTERNAL_PAGE
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
            setInfoPairs(data)
        })
        .catch(error => {
            console.log("Error in fetching data", error);
        })
    }, [])
    return (
        <StyledSwapHeader>
            <TopSection>
                <ButtonGroup>
                    <Button isActive={(match, { pathname }) => isOnInternalCohortPage} to={'/trading-leaderboard'}>Internal Cohort</Button>
                    <Button isActive={() => !isOnInternalCohortPage} to={`/trading-leaderboard/external-cohort/${infoPairs[0]?.name.toLowerCase()}/${infoPairs[0]?.id ?? '1'}`}>External Cohort</Button>
                </ButtonGroup>
            </TopSection>
        </StyledSwapHeader>
    )
}