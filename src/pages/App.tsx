import React, { Suspense } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
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
  RedirectToAddLiquidity,
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
import ManageMultiRewardLaunchFarms from './MultiRewardLaunchFarm/Manage'
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
import RFQ from './RFQ'
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
// import Vote from './Vote'
import VotePage from './Vote/VotePage'
// import PredictionMarket from './PredictionMarket'
// import Predictions from './Predictions'
import BetaWarning from './Predictions/components/BetaWarning'
// import PredictionDesktop from './Predictions/PredictionDesktop'
import EcoSystemArchived from './VanillaFarms/EcoSystemArchived'
import DualFarmsArrchived from './DualFarms/DualFarmsArchived'
import PopularFarmsArchived from './FloraFarms/PopularFarmsArchived'
import PreStakingFarmsArchived from './Earn/PreStakingFarmsArchived'
import LaunchFarmsArchived from './LaunchFarms/LaunchFarmsArchived'
import Analytics from 'components/Header/Analytics'
import ThemeChange from 'components/Header/ThemeChange'
import VDFYN from './Vault/VDFYN'
import Fusion from './DfynFusion/Fusion'
import BuildFarm1 from './CreateFarm'

import InactiveCustomManageDualFarms from './CustomDualFarms/InactiveManage'
import InactiveCustomManageVanillaFarms from './CustomVanillaFarms/InactiveManage'
import InactiveCustomManagePopularFarms from './CustomPopularFarms/InactiveManage'
import InactiveCustomManageLaunchFarms from './CustomLaunchFarms/InactiveManage'
import ManageCustomDualFarms from './CustomDualFarms/Manage'
import ManageCustomEcoSyatemFarms from './CustomVanillaFarms/Manage'
import ManageCustomPopularFarms from './CustomPopularFarms/Manage'
import ManageCustomLaunchFarms from './CustomLaunchFarms/Manage'
import CustomDualFarmsArrchived from './CustomDualFarms/DualFarmsArchived'
import CustomEcoSystemArrchived from './CustomVanillaFarms/EcoSystemArchived'
import CustomPopularFarmArrchived from './CustomPopularFarms/PopularFarmsArchived'
import CustomLaunchFarmArrchived from './CustomLaunchFarms/LaunchFarmsArchived'
import CustomVanillaFarms from './CustomVanillaFarms'
import CustomDualFarms from './CustomDualFarms'
import CustomFloraFarms from './CustomPopularFarms'
import CustomLaunchFarms from './CustomLaunchFarms'

import TradingLeader from 'components/TradingLeader'
import ArchivedTradingLeader from 'components/TradingLeader/ArchivedTradingLeader'
import LimitOrder from './Limit'
import { useActiveWeb3React } from 'hooks'
import { HEADER_ACCESS } from 'constants/networks'
import ExternalCohortPartnersInfo from 'components/TradingLeader/ExternalCohortPartnersInfo'
import MyFarms from './CreateFarm/MyFarms'
import RenewFarms from './CreateFarm/RenewFarms'

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
  const { chainId } = useActiveWeb3React()

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
              <Route exact strict path="/rfq" component={RFQ} />
              <Route exact strict path="/dfyn-fusion" component={Fusion} />
              <Route exact strict path="/byof" component={BuildFarm1} />
              <Route exact strict path="/myFarms" component={MyFarms} />
              <Route exact strict path="/renewFarm/:stakingAddress" component={RenewFarms} />
              {chainId && HEADER_ACCESS.limitOrders.includes(chainId) && (
                <Route exact strict path="/limit-order" component={LimitOrder} />
              )}
              <Route exact strict path="/dfynFusion" component={Fusion}>
                <Redirect to="/dfyn-fusion" />
              </Route>
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
              <Route exact strict path="/vdfyn" component={VDFYN} />
              {/* <Route exact strict path="/prediction" component={Predictions} /> */}
              {chainId && HEADER_ACCESS.tradingCompetitions.includes(chainId) && (
                <Route exact strict path="/trading-leaderboard" component={TradingLeader} />
              )}
              {chainId && HEADER_ACCESS.tradingCompetitions.includes(chainId) && (
                <Route
                  exact
                  strict
                  path="/trading-leaderboard/external-cohort/:partnerName/:id"
                  component={ExternalCohortPartnersInfo}
                />
              )}
              {chainId && HEADER_ACCESS.tradingCompetitions.includes(chainId) && (
                <Route exact strict path="/trading-leaderboard/archived" component={ArchivedTradingLeader} />
              )}
              {/* <Route exact strict path="/prediction/:currency/:candleSize" component={PredictionDesktop} /> */}
              {/* <Route exact strict path="/predictionMarket" component={PredictionMarket} /> */}
              {/* <Route exact strict path="/vote" component={Vote} /> */}
              <Route exact strict path="/custom-eco-farms" component={CustomVanillaFarms} />
              <Route exact strict path="/custom-eco-farms/archived" component={CustomEcoSystemArrchived} />
              <Route exact strict path="/custom-eco-farms/:stakingAddress" component={ManageCustomEcoSyatemFarms} />
              <Route
                exact
                strict
                path="/custom-eco-farms/:archived/:stakingAddress"
                component={InactiveCustomManageVanillaFarms}
              />
              <Route exact strict path="/custom-dual-farms" component={CustomDualFarms} />
              <Route exact strict path="/custom-dual-farms/archived" component={CustomDualFarmsArrchived} />
              <Route exact strict path="/custom-dual-farms/:stakingAddress" component={ManageCustomDualFarms} />
              <Route
                exact
                strict
                path="/custom-dual-farms/:archived/:stakingAddress"
                component={InactiveCustomManageDualFarms}
              />
              <Route exact strict path="/custom-popular-farms" component={CustomFloraFarms} />
              <Route exact strict path="/custom-popular-farms/archived" component={CustomPopularFarmArrchived} />
              <Route exact strict path="/custom-popular-farms/:stakingAddress" component={ManageCustomPopularFarms} />
              <Route
                exact
                strict
                path="/custom-popular-farms/:archived/:stakingAddress"
                component={InactiveCustomManagePopularFarms}
              />
              <Route exact strict path="/custom-launch-farms" component={CustomLaunchFarms} />
              <Route exact strict path="/custom-launch-farms/archived" component={CustomLaunchFarmArrchived} />
              <Route exact strict path="/custom-launch-farms/:stakingAddress" component={ManageCustomLaunchFarms} />
              <Route
                exact
                strict
                path="/custom-launch-farms/:archived/:stakingAddress"
                component={InactiveCustomManageLaunchFarms}
              />
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
              <Route
                exact
                strict
                path="/eco-farms/:currencyIdA/:currencyIdB/:version?"
                component={ManageVanillaFarms}
              />
              <Route
                exact
                strict
                path="/eco-farms/:archived/:currencyIdA/:currencyIdB/:version?"
                component={InactiveManageVanillaFarms}
              />
              <Route exact strict path="/eco-farms/:archived" component={EcoSystemArchived} />
              <Route exact strict path="/dual-farms/:currencyIdA/:currencyIdB/:version?" component={ManageDualFarms} />
              <Route
                exact
                strict
                path="/dual-farms/:archived/:currencyIdA/:currencyIdB/:version?"
                component={InactiveManageDualFarms}
              />
              <Route exact strict path="/dual-farms/:archived" component={DualFarmsArrchived} />
              <Route
                exact
                strict
                path="/launch-farms/:currencyIdA/:currencyIdB/:version?"
                component={ManageLaunchFarms}
              />
              <Route
                exact
                strict
                path="/multi-reward-launch-farms/:currencyIdA/:currencyIdB/:version?"
                component={ManageMultiRewardLaunchFarms}
              />
              <Route
                exact
                strict
                path="/launch-farms/:archived/:currencyIdA/:currencyIdB/:version?"
                component={InactiveManageLaunchFarms}
              />
              <Route exact strict path="/launch-farms/:archived" component={LaunchFarmsArchived} />
              <Route
                exact
                strict
                path="/popular-farms/:currencyIdA/:currencyIdB/:version?"
                component={ManageFloraFarms}
              />
              <Route exact strict path="/popular-farms/:archived" component={PopularFarmsArchived} />
              <Route
                exact
                strict
                path="/popular-farms/:archived/:currencyIdA/:currencyIdB/:version?"
                component={InactiveManageFloraFarms}
              />
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
