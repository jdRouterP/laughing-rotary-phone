import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateMarketData } from 'state/prediction/reducer'
import { getMarketData } from 'state/prediction/hooks'

const POLL_TIME_IN_SECONDS = 10

const usePollRoundData = (API_INFO: string) => {
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  
  useEffect(() => {
    const timer = setInterval(async () => {
      const marketData = await getMarketData(API_INFO)
      dispatch(updateMarketData(marketData))
    }, POLL_TIME_IN_SECONDS * 1000)

    return () => {
      clearInterval(timer)
    }
  }, [account, dispatch, API_INFO])
}

export default usePollRoundData
