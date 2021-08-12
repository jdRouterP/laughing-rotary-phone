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
  usePredictionInfo,
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

import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { light } from '@pancakeswap/uikit'
import { HelmetProvider } from 'react-helmet-async'
import { RouteComponentProps } from 'react-router-dom'
const FUTURE_ROUND_COUNT = 1 // the number of rounds in the future to show

export const GraphContext = React.createContext('')
export const AddressContext = React.createContext('')
export const CandleSizeContext = React.createContext('')

export default function PredictionDesktop({
  match: {
    params: {currency, candleSize}
  }
}: RouteComponentProps<{currency: string, candleSize: string }>){
  
  const InfoValue = usePredictionInfo(currency, candleSize)
  const API_GRAPH_VALUE = InfoValue.map(Api_Info => Api_Info.GRAPH_API_PREDICTION)
  const GRAPH = API_GRAPH_VALUE[0]
  const API_ADDRESS_VALUE = InfoValue.map(Api_Info => Api_Info.prediction_address)
  const predictionAddress = API_ADDRESS_VALUE[0]
  

  const { account } = useWeb3React()
  const _staticPredictionsData = useStaticPredictionsData(predictionAddress);
  const status = useGetPredictionsStatus()
  // const isChartPaneOpen = useIsChartPaneOpen()
  const dispatch = useDispatch()
  const initialBlock = useInitialBlock()

  useEffect(() => {
    dispatch(setPredictionStatus(PredictionStatus.INITIAL))
  }, [dispatch])

  useEffect(() => {

    const fetchInitialData = async () => {
      const [staticPredictionsData, marketData] = await Promise.all([_staticPredictionsData, getMarketData(GRAPH)])
      
      if (staticPredictionsData === undefined || marketData === undefined) return;
      const { currentEpoch, interval, buffer } = staticPredictionsData;
      const latestRound = marketData.rounds.find((round) => round.epoch === currentEpoch)
      
      // Fetch data on current unclaimed bets
      //@ts-ignore
      dispatch(fetchCurrentBets({ GRAPH, account, roundIds: marketData.rounds.map((round) => round.id) }))

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
        // console.log(latestRound, latestRound?.epoch === currentEpoch)
        dispatch(setPredictionStatus(PredictionStatus.ERROR))
      }
    }

    
    // Do not start initialization until the first block has been retrieved
    if (initialBlock > 0) {
      fetchInitialData()
    }
  }, [initialBlock, dispatch, _staticPredictionsData, account, GRAPH])


  usePollBlockNumber()
  usePollRoundData(GRAPH)
  usePollOraclePrice()

  if (status === PredictionStatus.INITIAL) {
    return <PageLoader />
  }


  return (
    <>
      <SCThemeProvider theme={light}>
        <SwiperProvider>
          <HelmetProvider>
            <Container>
              <GraphContext.Provider value={GRAPH}>
                <AddressContext.Provider value={predictionAddress}>
                  <CandleSizeContext.Provider value={candleSize}>
                    <Desktop />
                  </CandleSizeContext.Provider>
                </AddressContext.Provider>
              </GraphContext.Provider>
            </Container> 
          </HelmetProvider>
        </SwiperProvider>
      </SCThemeProvider>
    </>
  )
}
