import { useEffect, useState } from 'react'
import { useChainlinkOracleContract } from 'hooks/useContract'
import useLastUpdated from 'hooks/useLastUpdated'
import { CHAINLINK_ADDRESS, MATIC_USD } from '../../../constants'
import { JSBI, TokenAmount } from '@uniswap/sdk'

const useGetLatestOraclePrice = () => {
  const [price, setPrice] = useState('');
  const { lastUpdated, setLastUpdated: refresh } = useLastUpdated()
  const chainlinkOracleContract = useChainlinkOracleContract(CHAINLINK_ADDRESS)

  useEffect(() => {
    const fetchPrice = async () => {
      const response = await chainlinkOracleContract?.latestAnswer()

      const tokenAmountUSD = new TokenAmount(MATIC_USD, JSBI.BigInt(response)).toSignificant(6);

      setPrice(tokenAmountUSD)
    }

    fetchPrice()
  }, [chainlinkOracleContract, lastUpdated, setPrice])

  return { price, lastUpdated, refresh }
}

export default useGetLatestOraclePrice
