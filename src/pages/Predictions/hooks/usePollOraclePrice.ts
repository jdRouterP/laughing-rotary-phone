import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setLastOraclePrice } from 'state/prediction/reducer'
import useGetLatestOraclePrice from './useGetLatestOraclePrice'

const usePollOraclePrice = (seconds = 30) => {
  const { price, refresh } = useGetLatestOraclePrice()
  const dispatch = useDispatch()

  // Poll for the oracle price
  useEffect(() => {
    refresh()
    const timer = setInterval(() => {
      refresh()
    }, seconds * 1000)

    return () => {
      clearInterval(timer)
    }
  }, [seconds, refresh])

  // If the price changed update global state
  useEffect(() => {
    dispatch(setLastOraclePrice(price))
  }, [price, dispatch])
}

export default usePollOraclePrice
