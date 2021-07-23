import React, { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
// import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { useDispatch } from 'react-redux'
import { useGetPredictionsStatus, useInitialBlock, usePollBlockNumber } from 'state/hook'
import {
  getMarketData,
  useStaticPredictionsData,
  makeFutureRoundResponse,
  makeRoundData,
  transformRoundResponse,
} from 'state/prediction/hooks'
import { fetchCurrentBets, initialize, setPredictionStatus } from 'state/prediction/reducer'
import { HistoryFilter, PredictionsState, PredictionStatus } from 'state/prediction/types'
// import usePersistState from 'hooks/usePersistState'
import PageLoader from 'components/PageLoader'
import usePollOraclePrice from './hooks/usePollOraclePrice'
import usePollRoundData from './hooks/usePollRoundData'
import Container from './components/Container'
import SwiperProvider from './context/SwiperProvider'
import Desktop from './Desktop'
// import Mobile from './Mobile'
// import RiskDisclaimer from './components/RiskDisclaimer'
// import ChartDisclaimer from './components/ChartDisclaimer'

import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { light } from '@pancakeswap/uikit'
const FUTURE_ROUND_COUNT = 1 // the number of rounds in the future to show

const Predictions = () => {
  // const { isXl } = useMatchBreakpoints()
  // const [hasAcceptedRisk, setHasAcceptedRisk] = usePersistState(false, {
  //   localStorageKey: 'pancake_predictions_accepted_risk',
  // })
  // const [hasAcceptedChart, setHasAcceptedChart] = usePersistState(false, {
  //   localStorageKey: 'pancake_predictions_chart',
  // })
  const { account } = useWeb3React()
  const _staticPredictionsData = useStaticPredictionsData();
  const status = useGetPredictionsStatus()
  // const isChartPaneOpen = useIsChartPaneOpen()
  const dispatch = useDispatch()
  const initialBlock = useInitialBlock()
  // const isDesktop = isXl
  // const handleAcceptRiskSuccess = () => setHasAcceptedRisk(true)
  // const handleAcceptChart = () => setHasAcceptedChart(true)
  // const [onPresentRiskDisclaimer] = useModal(<RiskDisclaimer onSuccess={handleAcceptRiskSuccess} />, false)
  // const [onPresentChartDisclaimer] = useModal(<ChartDisclaimer onSuccess={handleAcceptChart} />, false)

  // TODO: memoize modal's handlers
  // const onPresentRiskDisclaimerRef = useRef(onPresentRiskDisclaimer)
  // const onPresentChartDisclaimerRef = useRef(onPresentChartDisclaimer)

  // Disclaimer
  // useEffect(() => {
  //   if (!hasAcceptedRisk) {
  //     onPresentRiskDisclaimerRef.current()
  //   }
  // }, [hasAcceptedRisk, onPresentRiskDisclaimerRef])

  // // Chart Disclaimer
  // useEffect(() => {
  //   if (!hasAcceptedChart && isChartPaneOpen) {
  //     onPresentChartDisclaimerRef.current()
  //   }
  // }, [onPresentChartDisclaimerRef, hasAcceptedChart, isChartPaneOpen])

  useEffect(() => {

    const fetchInitialData = async () => {
      const [staticPredictionsData, marketData] = await Promise.all([_staticPredictionsData, getMarketData()])
      if (staticPredictionsData === undefined || marketData === undefined) return;

      const { currentEpoch, interval, buffer } = staticPredictionsData;
      const latestRound = marketData.rounds.find((round) => round.epoch === currentEpoch)
      // Fetch data on current unclaimed bets
      //@ts-ignore
      dispatch(fetchCurrentBets({ account, roundIds: marketData.rounds.map((round) => round.id) }))

      if (marketData.market.paused) {
        dispatch(setPredictionStatus(PredictionStatus.PAUSED))
      } else if (latestRound && latestRound.epoch === currentEpoch) {
        const currentRoundStartBlock = Number(latestRound.startBlock)
        const currentRoundStartTime = Number(latestRound.startAt)
        const futureRounds = []
        const halfInterval = (interval + buffer) / 2

        for (let i = 1; i <= FUTURE_ROUND_COUNT; i++) {
          futureRounds.push(makeFutureRoundResponse(currentEpoch + i, (currentRoundStartTime + halfInterval) * i))
        }

        const roundData = makeRoundData([...marketData.rounds, ...futureRounds.map(transformRoundResponse)])
        dispatch(
          initialize({
            ...(staticPredictionsData as Omit<PredictionsState, 'rounds'>),
            historyFilter: HistoryFilter.ALL,
            currentRoundStartBlockNumber: currentRoundStartBlock,
            rounds: roundData,
          }),
        )
      } else {
        // If the latest epoch from the API does not match the latest epoch from the contract we have an unrecoverable error
        console.log(latestRound, latestRound?.epoch === currentEpoch)
        dispatch(setPredictionStatus(PredictionStatus.ERROR))
      }
    }

    // Do not start initialization until the first block has been retrieved
    if (initialBlock > 0) {
      fetchInitialData()
    }
  }, [initialBlock, dispatch, _staticPredictionsData, account])

  usePollBlockNumber()
  usePollRoundData()
  usePollOraclePrice()

  if (status === PredictionStatus.INITIAL) {
    return <PageLoader />
  }

  return (
    <>
      <SCThemeProvider theme={light}>
        <SwiperProvider>
          <Container>
            <Desktop />
          </Container>
        </SwiperProvider>
      </SCThemeProvider>
    </>
  )
}

export default Predictions
