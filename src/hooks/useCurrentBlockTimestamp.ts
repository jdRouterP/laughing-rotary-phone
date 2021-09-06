import { BigNumber } from 'ethers'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useMulticallV2Contract } from './useContract'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const multicall = useMulticallV2Contract()
  return useSingleCallResult(multicall, 'getCurrentBlockTimestamp')?.result?.[0]
}
