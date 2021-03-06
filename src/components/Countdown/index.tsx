import { RowBetween } from 'components/Row'
import React, { useEffect, useMemo, useState } from 'react'
import { TYPE } from '../../theme'

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export function Countdown({ exactEnd, startTime, message = '' }: { exactEnd: number, startTime: number, message?: string }) {
    const end = useMemo(() => (exactEnd ? exactEnd : 0), [
        exactEnd
    ])
    const begin = useMemo(() => (startTime ? startTime : 0), [startTime])

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

    const timeUntilGenesis = begin - time
    // const timeUntilEnd = end - time

    let timeRemaining: number

    timeRemaining = timeUntilGenesis >= 0 ? timeUntilGenesis : Infinity

    const days = (timeRemaining - (timeRemaining % DAY)) / DAY
    timeRemaining -= days * DAY
    const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR
    timeRemaining -= hours * HOUR
    const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE
    timeRemaining -= minutes * MINUTE
    const seconds = timeRemaining

    return (
        <RowBetween>
            <TYPE.white fontWeight={400}>
                {message.length && message}{' '}
            </TYPE.white>
            <TYPE.white fontWeight={400}>
                {Number.isFinite(timeRemaining) && (
                    <code>
                        {`${days}:${hours.toString().padStart(2, '0')}:${minutes
                            .toString()
                            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                    </code>
                )}
            </TYPE.white>
        </RowBetween>
    )
}
