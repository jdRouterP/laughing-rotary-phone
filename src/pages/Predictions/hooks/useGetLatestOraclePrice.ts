import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useChainlinkOracleContract } from 'hooks/useContract'
import useLastUpdated from 'hooks/useLastUpdated'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { CHAINLINK_ADDRESS } from '../../../constants'
import { useSingleCallResult } from 'state/multicall/hooks'

const useGetLatestOraclePrice = () => {
  const [price, setPrice] = useState(BIG_ZERO)
  const { lastUpdated, setLastUpdated: refresh } = useLastUpdated()
  const chainlinkOracleContract = useChainlinkOracleContract(CHAINLINK_ADDRESS)
  const response = useSingleCallResult(chainlinkOracleContract, 'latestAnswer', undefined)?.result?.[0]

  useEffect(() => {
    setPrice(getBalanceAmount(new BigNumber(response), 8))
  }, [lastUpdated, setPrice])

  return { price, lastUpdated, refresh }
}

export default useGetLatestOraclePrice
