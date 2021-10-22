import { TokenAmount, Currency } from '@dfyn/sdk'
import React, { useState } from 'react'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { isAndroid, isIOS, isMobile } from 'react-device-detect'
import styled from 'styled-components'
import { CHART_URL_PREFIX, HEADER_ACCESS, NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import Logo from '../../assets/images/DFYN logo final.png'
import LogoDark from '../../assets/images/DFYN logo dark.png'
import DarkLogoMobile from '../../assets/images/logo_white.png'
import LogoMobile from '../../assets/images/dfyn_colour.png'
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances, useTokenBalance } from '../../state/wallet/hooks'
import { CardNoise } from '../earn/styled'
import { CountUp } from 'use-count-up'
import { ExternalLink, TYPE } from '../../theme'

import { YellowCard } from '../Card'
import { Moon, Sun, TrendingUp } from 'react-feather'
import Menu from '../Menu'

import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import ClaimModal from '../claim/ClaimModal'
import { useToggleSelfClaimModal, useShowClaimPopup, useNetworkModalToggle } from '../../state/application/hooks'
import { useUserHasAvailableClaim } from '../../state/claim/hooks'
import { useUserHasSubmittedClaim } from '../../state/transactions/hooks'
import { Dots } from '../swap/styleds'
import Modal from '../Modal'
import UniBalanceContent from './UniBalanceContent'
import usePrevious from '../../hooks/usePrevious'
// import QuestionHelper from 'components/QuestionHelper'
// import Toggle from 'components/Toggle'
import FarmsMenu from 'components/FarmsMenu'
import Web3Network from 'components/Web3Network'
import { UNI } from './../../constants/index'
import CurrencyLogo from 'components/CurrencyLogo'
import AppsMenu from 'components/AppsMenu'
// import VaultMenu from 'components/VaultMenu'

const StyledAnalytics = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block;
    position: relative;
    padding: 0.15rem 0.5rem;
    background-color: ${({ theme }) => theme.bg3};
    border-radius: 0.5rem;
    margin-left: 8px;
    :hover,
    :focus {
      cursor: pointer;
      outline: none;
      background-color: ${({ theme }) => theme.bg4};
    }
    > * {
      stroke: ${({ theme }) => theme.text1};
    }
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
      display:none;
  `}
`

const ButtonStyle = styled.div`
    color: ${({ theme }) => theme.text8}
`

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 100vw;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 5px;
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
    padding: 1rem 2rem 1rem 1rem;
    justify-content: flex-end;
`};

${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 1rem 0rem 1rem 1rem;
`};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`

const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg4};
  // background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

const UNIWrapper = styled.span`
  margin-left: 8px;
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`
const NetworkStyle = styled.span`
  ${({ theme }) => theme.mediaWidth.upToMediumSmall`
    display: none;
  `};
`

const NetworkCard = styled(YellowCard)`
  border-radius: 12px;
  padding: 6px 12px;
  cursor: pointer;
  border-style: solid;
  border-width:2px;

  :hover {
    background-color: rgba(228, 126, 33,0.3);
  }

  :focus {
    border: 1px solid blue;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
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

// const StyledExternalLink = styled(ExternalLink).attrs({
//   activeClassName
// }) <{ isActive?: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: left;
//   border-radius: 3rem;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   color: ${({ theme }) => theme.text2};
//   font-size: 1rem;
//   width: fit-content;
//   margin: 0 12px;
//   font-weight: 500;

//   &.${activeClassName} {
//     border-radius: 12px;
//     font-weight: 600;
//     color: ${({ theme }) => theme.text1};
//   }

//   :hover,
//   :focus {
//     color: ${({ theme }) => darken(0.1, theme.text1)};
//   }

//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//       display: none;
// `}
// `

// const StyledDocsLink = styled(StyledExternalLink)`
// ${({ theme }) => theme.mediaWidth.upToExtraSmall`
// display: inline-block;
// `}
// `

const StyledMenuButton = styled.button`
  display: none;

  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    border: none;
    color: ${({ theme }) => theme.text1};
    background-color: transparent;
    margin: 0;
    padding: 0;
    height: 35px;
    background-color: ${({ theme }) => theme.bg3};
    margin-left: 8px;
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
    > * {
      stroke: ${({ theme }) => theme.text1};
    }
  `}
  // ${({ theme }) => theme.mediaWidth.upToSmall`
  //   display: none;
  // `}
`

const NetworkIcon = styled.span`
    display: none;
    ${({ theme }) => theme.mediaWidth.upToMediumSmall`
        display: block;
    `}
`


export default function Header() {
  const { account, chainId, library } = useActiveWeb3React()
  const { t } = useTranslation()

  const mobile = isMobile || isAndroid || isIOS;

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  // const [isDark] = useDarkModeManager()
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  // const [gaslessMode, toggleSetGaslessMode] = useGaslessModeManager()
  const toggleNetworkModal = useNetworkModalToggle()

  const toggleClaimModal = useToggleSelfClaimModal()

  const availableClaim: boolean = useUserHasAvailableClaim(account)

  const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined)

  // const aggregateBalance: TokenAmount | undefined = useAggregateUniBalance()
  const uni = chainId ? UNI[chainId] : undefined
  const aggregateBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, uni)

  const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)
  const showClaimPopup = useShowClaimPopup()

  const countUpValue = aggregateBalance?.toFixed(0) ?? '0'

  const countUpValuePrevious = usePrevious(countUpValue) ?? '0'

  return (
    <HeaderFrame>
      <ClaimModal />
      <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
        <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
      </Modal>
      <HeaderRow>
        <Title href=".">
          <UniIcon>
            {mobile ? (
              <img width={'30px'} src={darkMode ? DarkLogoMobile : LogoMobile} alt="logo" />
            ) : (
              <img height={'80px'} width={'177px'} src={darkMode ? LogoDark : Logo} alt="logo" />
            )}
          </UniIcon>
        </Title>
        <HeaderLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            {t('swap')}
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/create') ||
              pathname.startsWith('/find')
            }
          >
            {t('pool')}
          </StyledNavLink>
          {/* {chainId && HEADER_ACCESS.vault.includes(chainId) && <StyledNavLink id={`vault-nav-link`} to={'/prediction'}>
            Prediction
          </StyledNavLink>} */}
          {chainId && HEADER_ACCESS.vault.includes(chainId) && <StyledNavLink id={`vault-nav-link`} to={'/vdfyn'}>
            vDFYN
          </StyledNavLink>}
          {/* {chainId && HEADER_ACCESS.vault.includes(chainId) && <VaultMenu />} */}
          {/* {chainId && HEADER_ACCESS.charts.includes(chainId) && <StyledExternalLink id={`stake-nav-link`} href={`https://${CHART_URL_PREFIX[(chainId ? chainId : 1)]}.dfyn.network/home/`}>
            Charts <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink>} */}
          {/* <StyledDocsLink id={`docs-nav-link`} href={'https://docs.dfyn.network/'}>
            Docs {!mobile && <span style={{ fontSize: '11px' }}>↗</span>}
          </StyledDocsLink> */}
          {chainId && HEADER_ACCESS.farms.includes(chainId) &&<FarmsMenu /> }
          {chainId && HEADER_ACCESS.more.includes(chainId) &&<AppsMenu /> }
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          {/* {chainId && HEADER_ACCESS.gaslessMode.includes(chainId) && <GaslessModeElement>
            <TYPE.black fontWeight={400} fontSize={14}>
              Gasless Mode
            </TYPE.black>
            <QuestionHelper text="This button will toggle Dfyn’s gasless feature for your wallet. Users with hardware wallets should keep this setting turned off." />

            <Toggle
              id="toggle-gasless-mode-button"
              isActive={gaslessMode}
              toggle={
                () => toggleSetGaslessMode()
              }
            />
          </GaslessModeElement>} */}
          {availableClaim && !showClaimPopup && (
            <UNIWrapper onClick={toggleClaimModal}>
              <UNIAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                <TYPE.white padding="0 2px">
                  {claimTxn && !claimTxn?.receipt ? <Dots>Claiming DFYN</Dots> : 'Claim DFYN'}
                </TYPE.white>
              </UNIAmount>
              <CardNoise />
            </UNIWrapper>
          )}
          {!availableClaim && aggregateBalance && (
            <UNIWrapper onClick={() => setShowUniBalanceModal(true)}>
              <UNIAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                {account && (
                  <HideSmall>
                    <TYPE.black
                      style={{
                        paddingRight: '.4rem',
                        marginRight: '5px'
                      }}
                    >
                      <CountUp
                        key={countUpValue}
                        isCounting
                        start={parseFloat(countUpValuePrevious)}
                        end={parseFloat(countUpValue)}
                        thousandsSeparator={','}
                        duration={1}
                      />
                    </TYPE.black>
                  </HideSmall>
                )}
                <CurrencyLogo currency={UNI[chainId ?? 137]} />
              </UNIAmount>
              <CardNoise />
            </UNIWrapper>
          )}
          <NetworkStyle>
            {library && library.provider.isMetaMask && chainId && NETWORK_LABEL[chainId] && (
              <NetworkCard onClick={() => toggleNetworkModal()} title={NETWORK_LABEL[chainId]}><Web3Network /></NetworkCard>
            )}
          </NetworkStyle>
          <NetworkIcon>
            <img src={NETWORK_ICON[chainId ?? 137]} onClick={() => toggleNetworkModal()} alt="polygon" height="36px" width="36px" style={{ borderRadius: '40%', marginTop: "4px" }} />
          </NetworkIcon>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)}{' '}
                {Currency.getNativeCurrencySymbol(
                  chainId
                )}
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <StyledAnalytics>
            {chainId && HEADER_ACCESS.charts.includes(chainId) && <ExternalLink href={`https://${CHART_URL_PREFIX[(chainId ? chainId : 137)]}.dfyn.network/home/`} style={{ textDecoration: 'none' }}>
              <ButtonStyle>
                <TrendingUp size={"25px"} />
              </ButtonStyle>
            </ExternalLink>}
          </StyledAnalytics>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}
