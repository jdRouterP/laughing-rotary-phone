import { useEffect, useRef, useState } from 'react'
import { POLYGON_BLOCK_TIME } from '../constants'
import { useActiveWeb3React } from 'hooks'

/**
 * Returns a countdown in seconds of a given block
 */
const useBlockCountdown = (blockNumber: number) => {
  const timer: { current: NodeJS.Timeout | null } = useRef(null)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const { library } = useActiveWeb3React()
  useEffect(() => {

    const startCountdown = async () => {
      const currentBlock = await library?.getBlockNumber() ?? 0;

      if (blockNumber > currentBlock) {
        setSecondsRemaining((blockNumber - currentBlock) * POLYGON_BLOCK_TIME)

        // Clear previous interval
        if (timer.current) {
          clearInterval(timer.current)
        }

        timer.current = setInterval(() => {
          setSecondsRemaining((prevSecondsRemaining) => {
            if (prevSecondsRemaining === 1) {
              //clearInterval(timer.current)
            }

            return prevSecondsRemaining - 1
          })
        }, 1000)
      }
    }

    startCountdown()

    return () => {
      //clearInterval(timer.current)
    }
  }, [setSecondsRemaining, blockNumber, timer])

  return secondsRemaining
}

export default useBlockCountdown
