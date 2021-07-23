import { useEffect, useState } from 'react'
import { useChainlinkOracleContract } from 'hooks/useContract'
import useLastUpdated from 'hooks/useLastUpdated'
import { CHAINLINK_ADDRESS, MATIC_USD } from '../../../constants'
import { JSBI, TokenAmount } from '@dfyn/sdk'

const useGetLatestOraclePrice = () => {
  const [price, setPrice] = useState('');
  const { lastUpdated, setLastUpdated: refresh } = useLastUpdated()
  const chainlinkOracleContract = useChainlinkOracleContract(CHAINLINK_ADDRESS)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await chainlinkOracleContract?.latestAnswer()
        const tokenAmountUSD = new TokenAmount(MATIC_USD, JSBI.BigInt(response)).toSignificant(6);
        setPrice(tokenAmountUSD)
      } catch (error) {
        console.log(error);
      }


    }

    fetchPrice()
  }, [chainlinkOracleContract, lastUpdated, setPrice])

  return { price, lastUpdated, refresh }
}

export default useGetLatestOraclePrice
