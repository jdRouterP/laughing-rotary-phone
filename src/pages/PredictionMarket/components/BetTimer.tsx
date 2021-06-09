import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

interface Props {
    totalTime: number
}

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.bg4};
    padding: 10px 4px;
    border-radius: 15px;
    width: 120px;
`
const Timer = styled.div`
    display: flex;
    align-items: flex-start;
`

const CurrentTime = styled.div`
    font-size: 20px;
    font-weight: bold;
    margin-right: 10px;
`

const TotalTime = styled.div`
    font-size: 12px;
    margin-top: 1px;
`

const BetTimer = ({ totalTime }: Props) => {


    //const totalTime = 5 * 60
    const totalTimeString = (totalTime / 60) + 'm'

    const setTimeLeft = useState(totalTime)[1]
    const [minutes, setMinutes] = useState('0' + totalTime / 60)
    const [seconds, setSeconds] = useState('00')

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((oldTime) => {
                if (oldTime === 0) {
                    clearInterval(timer)
                }
                const minute = Math.floor(oldTime / 60)
                const second = Math.floor(oldTime % 60)

                setMinutes(minute < 10 ? '0' + minute : String(minute))
                setSeconds(second < 10 ? '0' + second : String(second))

                return oldTime - 1
            })
        }, 1000)
        return () => {
            clearInterval(timer);
        }
    }, [])

    return (
        <Wrapper>
            <Timer>
                <CurrentTime>
                    {minutes}:{seconds}
                </CurrentTime>
                <TotalTime>
                    {totalTimeString}
                </TotalTime>
            </Timer>
        </Wrapper>
    )
}

export default BetTimer
