import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import AddressClaimModal from '../components/claim/AddressClaimModal'
import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import { ApplicationModal } from '../state/application/actions'
import { useModalOpen, useToggleModal } from '../state/application/hooks'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from './AddLiquidity/redirects'
import Earn from './Earn'
import Manage from './Earn/Manage'
import InactiveManage from './Earn/InactiveManage'
import VanillaFarms from './VanillaFarms'
import DualFarms from './DualFarms'
import LaunchFarms from './LaunchFarms'
import FloraFarms from './FloraFarms'
import Vault from './Vault'
import ManageVanillaFarms from './VanillaFarms/Manage'
import InactiveManageVanillaFarms from './VanillaFarms/InactiveManage'
import ManageDualFarms from './DualFarms/Manage'
import ManageLaunchFarms from './LaunchFarms/Manage'
import InactiveManageDualFarms from './DualFarms/InactiveManage'
import InactiveManageLaunchFarms from './LaunchFarms/InactiveManage'
import ManageFloraFarms from './FloraFarms/Manage'
import InactiveManageFloraFarms from './FloraFarms/InactiveManage'
import ManageVault from './Vault/Manage'
import MultiTokenManage from './Vault/MultiTokenManage'
import MigrateV1 from './MigrateV1'
import MigrateV1Exchange from './MigrateV1/MigrateV1Exchange'
import RemoveV1Exchange from './MigrateV1/RemoveV1Exchange'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
// import Vote from './Vote'
import VotePage from './Vote/VotePage'
// import PredictionMarket from './PredictionMarket'
import Predictions from './Predictions'
import BetaWarning from './Predictions/components/BetaWarning'
import PredictionDesktop from './Predictions/PredictionDesktop'
import EcoSystemArchived from './VanillaFarms/EcoSystemArchived'
import DualFarmsArrchived from './DualFarms/DualFarmsArchived'
import PopularFarmsArchived from './FloraFarms/PopularFarmsArchived'
import PreStakingFarmsArchived from './Earn/PreStakingFarmsArchived'
import LaunchFarmsArchived from "./LaunchFarms/LaunchFarmsArchived"
import Analytics from 'components/Header/Analytics'
import ThemeChange from 'components/Header/ThemeChange'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  return <AddressClaimModal isOpen={open} onDismiss={toggle} />
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        <URLWarning />
        <BetaWarning />
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper>
          <Popups />
          <Polling />
          <ThemeChange />
          <Analytics />
          <TopLevelModals />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/swap" component={Swap} />
              <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route exact strict path="/find" component={PoolFinder} />
              <Route exact strict path="/pool" component={Pool} />
              <Route exact strict path="/dfyn" component={Earn} />
              <Route exact strict path="/eco-farms" component={VanillaFarms} />
              <Route exact strict path="/dual-farms" component={DualFarms} />
              <Route exact strict path="/launch-farms" component={LaunchFarms} />
              <Route exact strict path="/popular-farms" component={FloraFarms} />
              <Route exact strict path="/vault" component={Vault} />
              <Route exact strict path="/prediction" component={Predictions} />
              <Route exact strict path="/prediction/:currency/:candleSize" component={PredictionDesktop} />
              {/* <Route exact strict path="/predictionMarket" component={PredictionMarket} /> */}
              {/* <Route exact strict path="/vote" component={Vote} /> */}
              <Route exact strict path="/create" component={RedirectToAddLiquidity} />
              <Route exact path="/add" component={AddLiquidity} />
              <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact path="/create" component={AddLiquidity} />
              <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact strict path="/remove/v1/:address" component={RemoveV1Exchange} />
              <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
              <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route exact strict path="/migrate/v1" component={MigrateV1} />
              <Route exact strict path="/migrate/v1/:address" component={MigrateV1Exchange} />
              <Route exact strict path="/dfyn/:currencyIdA/:currencyIdB" component={Manage} />
              <Route exact strict path="/dfyn/:archived/:currencyIdA/:currencyIdB" component={InactiveManage} />
              <Route exact strict path="/dfyn/:archived" component={PreStakingFarmsArchived} />
              <Route exact strict path="/eco-farms/:currencyIdA/:currencyIdB/:version?" component={ManageVanillaFarms} />
              <Route exact strict path="/eco-farms/:archived/:currencyIdA/:currencyIdB/:version?" component={InactiveManageVanillaFarms} />
              <Route exact strict path="/eco-farms/:archived" component={EcoSystemArchived} />
              <Route exact strict path="/dual-farms/:currencyIdA/:currencyIdB/:version?" component={ManageDualFarms} />
              <Route exact strict path="/dual-farms/:archived/:currencyIdA/:currencyIdB/:version?" component={InactiveManageDualFarms} />
              <Route exact strict path="/dual-farms/:archived" component={DualFarmsArrchived} />
              <Route exact strict path="/launch-farms/:currencyIdA/:currencyIdB/:version?" component={ManageLaunchFarms} />
              <Route exact strict path="/launch-farms/:archived/:currencyIdA/:currencyIdB/:version?" component={InactiveManageLaunchFarms} />
              <Route exact strict path="/launch-farms/:archived" component={LaunchFarmsArchived} />
              <Route exact strict path="/popular-farms/:currencyIdA/:currencyIdB/:version?" component={ManageFloraFarms} />
              <Route exact strict path="/popular-farms/:archived" component={PopularFarmsArchived} />
              <Route exact strict path="/popular-farms/:archived/:currencyIdA/:currencyIdB/:version?" component={InactiveManageFloraFarms} />
              <Route exact strict path="/vault/:vaultID" component={ManageVault} />
              <Route exact strict path="/multi-vault/:vaultID" component={MultiTokenManage} />
              <Route exact strict path="/vote/:id" component={VotePage} />
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </Web3ReactManager>
          <Marginer />
        </BodyWrapper>
      </AppWrapper>
    </Suspense>
  )
}
