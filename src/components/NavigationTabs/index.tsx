import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink, Link as HistoryLink } from 'react-router-dom'

import { ArrowLeft } from 'react-feather'
import { RowBetween } from '../Row'
// import QuestionHelper from '../QuestionHelper'
import Settings from '../Settings'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { resetMintState } from 'state/mint/actions'
import { MouseoverTooltip } from 'components/Tooltip'
import { HEADER_ACCESS } from 'constants/networks'
import { LocalGasStation } from '@material-ui/icons'
import Toggle from 'components/Toggle'
import { useGaslessModeManager, useIsGaslessMode } from 'state/user/hooks'
import { useActiveWeb3React } from 'hooks'

const Icon = styled.div`
  display: flex;
  width: 100%;
`

const TopSection = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 0fr;
`

const GaslessModeElement = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }
`

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const ActiveText = styled.div`
  margin: auto;
  font-weight: 500;
  font-size: 20px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation()
  return (
    <Tabs style={{ marginBottom: '20px', display: 'none' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
        {t('pool')}
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText>Import Pool</ActiveText>
        <Settings />
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  // reset states on back
  const [gaslessMode, toggleSetGaslessMode] = useGaslessModeManager()
  const { chainId} = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const toggleValue = useIsGaslessMode()
  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink
          to="/pool"
          onClick={() => {
            adding && dispatch(resetMintState())
          }}
        >
          <StyledArrowLeft />
        </HistoryLink>
        <TopSection>
          <ActiveText>{creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}</ActiveText>
          <Icon>
            {chainId && HEADER_ACCESS.gaslessMode.includes(chainId) &&<GaslessModeElement>
              <MouseoverTooltip text={'Gasless Mode. This button will toggle Dfyn’s gasless feature for your wallet. Users with hardware wallets should keep this setting turned off.'} placement='bottom'>
                <LocalGasStation style={{color: toggleValue ? '#2ecc71' : ''}}/>
              </MouseoverTooltip>
              <Toggle
                id="toggle-gasless-mode-button"
                isActive={gaslessMode}
                toggle={
                  () => toggleSetGaslessMode()
                }
              />
            </GaslessModeElement>}
            <Settings />
          </Icon>
          
        </TopSection>
        
      </RowBetween>
    </Tabs>
  )
}
