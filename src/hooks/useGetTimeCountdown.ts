import { useEffect, useRef, useState } from 'react'
import { useActiveWeb3React } from 'hooks'

/**
 * Returns a countdown in seconds of a given block
 */
const useTimeCountdown = (time: number) => {
  const timer = useRef<ReturnType<typeof setTimeout>>(null)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const { library } = useActiveWeb3React()
  useEffect(() => {

    const startCountdown = async () => {
      const currentBlock = await library?.getBlockNumber();
      const currentTime = (currentBlock && (await library?.getBlock(currentBlock))?.timestamp) || 0;
      // console.log(currentBlock, currentTime, time);
      if (time > currentTime) {
        setSecondsRemaining((time - currentTime))
        // Clear previous interval
        if (timer.current) {
          clearInterval(timer.current)
        }

        //@ts-ignore
        timer.current = setInterval(() => {
          setSecondsRemaining((prevSecondsRemaining) => {

            if (prevSecondsRemaining === 1 && timer.current) {
              clearInterval(timer.current)
            }

            return prevSecondsRemaining - 1
          })
        }, 1000)
      }
    }

    startCountdown()

    return () => {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }
  }, [setSecondsRemaining, time, timer, library])

  return secondsRemaining
}

export default useTimeCountdown