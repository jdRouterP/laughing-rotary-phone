import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { formatRoundTime } from '../helpers'
import useRoundCountdown from '../hooks/useRoundCountdown'

interface TimerLabelProps {
    interval: string
    unit: 'm' | 'h' | 'd'
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
    margin-right: 15px;
`

const TotalTime = styled.div`
    font-size: 12px;
    margin-top: 1px;
`

const TimerLabel: React.FC<TimerLabelProps> = ({ interval, unit }: TimerLabelProps) => {
    const seconds = useRoundCountdown()
    const countdown = formatRoundTime(seconds)
    const { t } = useTranslation()
    return (
        <Wrapper>
            <Timer>
                <CurrentTime>
                    {seconds === 0 ? t('Closing') : countdown}
                </CurrentTime>
                <TotalTime>
                    {`${interval}${t(unit)}`}
                </TotalTime>
            </Timer>
        </Wrapper>
    )
}

export default TimerLabel
