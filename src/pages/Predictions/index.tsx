import React from 'react'
import { usePollBlockNumber } from 'state/hook'
// import usePersistState from 'hooks/usePersistState'
import usePollOraclePrice from './hooks/usePollOraclePrice'
import SwiperProvider from './context/SwiperProvider'
// import Mobile from './Mobile'
// import RiskDisclaimer from './components/RiskDisclaimer'
// import ChartDisclaimer from './components/ChartDisclaimer'

import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { light } from '@pancakeswap/uikit'
import { HelmetProvider } from 'react-helmet-async'
import PredictionsDashboard from './components/DashBoardPrediction/PredictionsDashboard'


export default function Predictions(){

  usePollBlockNumber()
  usePollOraclePrice()
  

  return (
    <>
      <SCThemeProvider theme={light}>
        <SwiperProvider>
          <HelmetProvider>
            <PredictionsDashboard /> 
          </HelmetProvider>
        </SwiperProvider>
      </SCThemeProvider>
    </>
  )
}

