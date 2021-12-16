import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { LocalGasStation } from '@material-ui/icons'
import { useGaslessModeManager, useIsGaslessMode } from 'state/user/hooks'
import Toggle from 'components/Toggle'
import { MouseoverTooltip } from 'components/Tooltip'
import { useActiveWeb3React } from 'hooks'
import { HEADER_ACCESS } from 'constants/networks'
import SwapLimitToggle from './SwapLimitToggle'
import { TYPE } from 'theme'


const GaslessModeElement = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }
`

const TopSection = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 0fr;
`

const Icon = styled.div`
  display: flex;
  width: 100%;
`

const CustomToggle = styled.div`
  pointer-events: none;
  opacity: 0.4;
`

const StyledSwapHeader = styled.div`
  padding: 12px 1rem 0px 1.5rem;
  margin-bottom: -4px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

export default function SwapHeader() {
  const [gaslessMode, toggleSetGaslessMode] = useGaslessModeManager()
  if(gaslessMode) toggleSetGaslessMode()
  const { chainId} = useActiveWeb3React()
  const toggleValue = useIsGaslessMode()
  return (
    <StyledSwapHeader>
      <TopSection>
        <Icon>
          {chainId && HEADER_ACCESS.limitOrders.includes(chainId)?
            <SwapLimitToggle />: <TYPE.black fontWeight={500} margin={'auto 0'} width={'88%'}>Swap</TYPE.black>
          }
          {chainId && HEADER_ACCESS.gaslessMode.includes(chainId) &&<GaslessModeElement>

            <MouseoverTooltip
              text={'Gasless Mode is under maintenance.'}
              placement='bottom'>
              <LocalGasStation style={{color: toggleValue ? '#2ecc71' : '', opacity: '0.4'}}/>

            </MouseoverTooltip>
            <CustomToggle>
            <Toggle
              id="toggle-gasless-mode-button"
              isActive={gaslessMode}
              toggle={
                () => toggleSetGaslessMode()
              }
            />
            </CustomToggle>
          </GaslessModeElement>}
          <Settings />
        </Icon>
      </TopSection>
    </StyledSwapHeader>
  )
}
