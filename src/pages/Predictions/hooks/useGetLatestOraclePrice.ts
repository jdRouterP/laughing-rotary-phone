import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useChainlinkOracleContract } from 'hooks/useContract'
import useLastUpdated from 'hooks/useLastUpdated'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { CHAINLINK_ADDRESS } from '../../../constants'

const useGetLatestOraclePrice = () => {
  const [price, setPrice] = useState(BIG_ZERO)
  const { lastUpdated, setLastUpdated: refresh } = useLastUpdated()
  const chainlinkOracleContract = useChainlinkOracleContract(CHAINLINK_ADDRESS)

  useEffect(() => {
    const fetchPrice = async () => {
      const response = await chainlinkOracleContract?.latestAnswer()
      setPrice(getBalanceAmount(new BigNumber(response.toNumber()), 8))
    }

    fetchPrice()
  }, [chainlinkOracleContract, lastUpdated, setPrice])

  return { price, lastUpdated, refresh }
}

export default useGetLatestOraclePrice
