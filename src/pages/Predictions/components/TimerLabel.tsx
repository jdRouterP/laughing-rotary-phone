import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { formatRoundTime } from '../helpers'
import useRoundCountdown from '../hooks/useRoundCountdown'

interface TimerLabelProps {
    interval: string
    unit: 'm' | 'h' | 'd'
}

const Closing = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    max-width: 252px;
    width: 100%;
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid ${({theme}) => theme.text6};
`
const Timer = styled.div`
    display: flex;
    align-items: flex-start;
    border-radius: 10px;
    padding: 0px 10px;
`

const CurrentTime = styled.div`
    font-size: 20px;
    font-weight: bold;
    margin-right: 8px;
`

const TotalTime = styled.div`
    font-size: 12px;
    margin-top: 7px;
`

const TimerLabel: React.FC<TimerLabelProps> = ({ interval, unit }: TimerLabelProps) => {
    const seconds = useRoundCountdown()
    const countdown = formatRoundTime(seconds)
    const { t } = useTranslation()
    return (
        <Wrapper>
            <Timer>
                <h1 style={{fontSize: "24px", fontWeight: "normal", textAlign: "center", marginRight: "15px", color: "textSubtle"}}>Closing:</h1>
                <Closing>
                    <CurrentTime>
                        {seconds === 0 ? t('Waiting..') : countdown}
                    </CurrentTime>
                    <TotalTime>
                        {`${interval}${t(unit)}`}
                    </TotalTime>
                </Closing>   
            </Timer>
        </Wrapper>
    )
}

export default TimerLabel
