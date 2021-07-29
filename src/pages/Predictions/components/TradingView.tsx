import React, { useEffect } from 'react'
import { Box } from '@pancakeswap/uikit'
import { DefaultTheme, useTheme } from 'styled-components'
// import { CloseIcon, TYPE } from 'theme'
// import { Flex } from 'rebass'
// import { useTranslation } from 'react-i18next'
// import { useDispatch } from 'react-redux'
// import { setChartPaneState } from 'state/prediction/reducer'
// import { useIsDarkMode } from 'state/user/hooks'
/**
 * When the script tag is injected the TradingView object is not immediately
 * available on the window. So we listen for when it gets set
 */
const tradingViewListener = async () =>
  new Promise<void>((resolve) =>
    Object.defineProperty(window, 'TradingView', {
      configurable: true,
      set(value) {
        this.tv = value
        resolve(value)
      },
    }),
  )

const initializeTradingView = (TradingViewObj: any, theme: DefaultTheme) => {
  /* eslint-disable new-cap */
  /* eslint-disable no-new */
  // @ts-ignore
  new TradingViewObj.widget({
    autosize: true,
    height: '100%',
    symbol: 'BINANCE:MATICUSDT',
    interval: '5',
    timezone: 'Etc/UTC',
    theme: theme.bg4,
    style: '1',
    toolbar_bg: '#f1f3f6',
    enable_publishing: false,
    allow_symbol_change: true,
    container_id: 'tradingview_b239c',
  })
}

const TradingView = () => {
  const theme = useTheme()
  // const { t } = useTranslation()
  // const dispatch = useDispatch()
  // const darkMode = useIsDarkMode()
  useEffect(() => {
    
    // @ts-ignore
    if (window.TradingView) {
      // @ts-ignore
      initializeTradingView(window.TradingView, theme)
    } else {
      tradingViewListener().then((tv) => {
        initializeTradingView(tv, theme )
      })
    }
  }, [theme])

  // const handleClick = () => {
  //   dispatch(setChartPaneState(false))
  // }
  return (
    <Box overflow="hidden" className="tradingview_container">
      {/* <Flex alignItems="center" justifyContent="space-between" p={"11px"} bg={darkMode ? "#40444F" : "#FFFFFF"}>
        <TYPE.mediumHeader>
          {t('CHART')}
        </TYPE.mediumHeader>
        <CloseIcon onClick={handleClick} />
      </Flex> */}
      <div id="tradingview_b239c" />
    </Box>
  )
}
export default TradingView