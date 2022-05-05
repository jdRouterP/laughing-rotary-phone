import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { NavLink } from 'react-router-dom'
import Row, { RowFixed } from 'components/Row'
import { useTranslation } from 'react-i18next'


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
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: 0 6px;
    font-size: 14px;
  `};

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

const Content = styled.div`
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
   width: 100%;
  `};
`
const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
    justify-content: flex-end;
  `};
`

export default function ByofMenu() {
    const { t } = useTranslation()
    return (
        <Content>
          <HeaderRow>
            <HeaderLinks>
              <StyledNavLink id={`v-byof-nav-link`} to={'/byof'}>
                {t('Build Farm')}
              </StyledNavLink>
              <StyledNavLink id={`v-myFarms-nav-link`} to={'/myFarms'}>
                {t('My Farms')}
              </StyledNavLink>
            </HeaderLinks>
          </HeaderRow>
        </Content>
        
        
    )
}
