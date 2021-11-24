import React, { useEffect, useMemo, useState } from 'react'
import { TYPE } from '../../theme'

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export function Countdown({ exactEnd, start }: { exactEnd: Date, start: Date }) {
  // get end/beginning times
  const end = useMemo(() => (exactEnd ? Math.floor(exactEnd.getTime() / 1000) : 0), [
    exactEnd
  ])
//   const begin = useMemo(() => (start ? Math.floor(start.getTime() / 1000) : 0), [start])
  // get current time
  const [time, setTime] = useState(() => Math.floor(Date.now() / 1000))
  useEffect((): (() => void) | void => {
    // we only need to tick if rewards haven't ended yet
    if (time <= end) {
      const timeout = setTimeout(() => setTime(Math.floor(Date.now() / 1000)), 1000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [time, end])
//   const timeUntilGenesis = begin - time
  const timeUntilEnd = end - time

  let timeRemaining: number
    const ongoing = timeUntilEnd >= 0
    if (ongoing) {
      timeRemaining = timeUntilEnd
    } else {
      timeRemaining = Infinity
    }

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY
  timeRemaining -= days * DAY
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR
  timeRemaining -= hours * HOUR
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE
  timeRemaining -= minutes * MINUTE
  const seconds = timeRemaining
  return (
    <>
      <TYPE.white fontWeight="500" fontSize={"26px"} mt={"12px"}>
        {Number.isFinite(timeRemaining) && (
          <code>
            {`${days}d ${hours.toString().padStart(2, '0')}h ${minutes
              .toString()
              .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`}
          </code>
        )}
      </TYPE.white>
    </>
  )
}