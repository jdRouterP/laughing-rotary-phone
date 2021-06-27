import { useGetCurrentRoundTime, useGetinterval } from 'state/hook'
import useTimeCountdown from 'hooks/useGetTimeCountdown'

/**
 * Returns a countdown in seconds of a given block
 */
const useRoundCountdown = (intervalsToAdd = 1) => {
  const interval = useGetinterval()
  const currentRoundBlockTime = useGetCurrentRoundTime()
  const blocksToAdd = intervalsToAdd * interval
  debugger
  const seconds = useTimeCountdown(currentRoundBlockTime + blocksToAdd)
  return seconds
}

export default useRoundCountdown
