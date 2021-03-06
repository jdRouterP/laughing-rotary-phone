import { useContext, useEffect, useState } from 'react'
import { usePredictionContract } from 'hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { AddressContext } from '../PredictionDesktop'

const useIsRefundable = (epoch: number) => {
  const [isRefundable, setIsRefundable] = useState(false)
  const AddressValue = useContext(AddressContext)
  const predictionsContract = usePredictionContract(AddressValue)
  const { account } = useWeb3React()

  useEffect(() => {
    const fetchRefundableStatus = async () => {
      const canClaim = await predictionsContract?.claimable(epoch, account)

      if (canClaim) {
        const refundable = await predictionsContract?.refundable(epoch, account)
        setIsRefundable(refundable)
      } else {
        setIsRefundable(false)
      }
    }

    if (account) {
      fetchRefundableStatus()
    }
  }, [account, epoch, predictionsContract, setIsRefundable])

  return { isRefundable, setIsRefundable }
}

export default useIsRefundable
