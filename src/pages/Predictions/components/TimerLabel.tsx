import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { formatRoundTime } from '../helpers'
import useRoundCountdown from '../hooks/useRoundCountdown'
import { TYPE } from 'theme'

interface TimerLabelProps {
    interval: string
    unit: 'min' | 'hour' | 'day'
}

const Closing = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top:2px;
    margin-left:14px;
`

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    max-width: 280px;
    width: 100%;
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.text6};

    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 260px;
        margin-left: 8px;
        padding: 6px;
  `};
`
const Timer = styled.div`
    width: 100%;
    display: flex;
    align-items: flex-start;
    border-radius: 10px;
    padding: 0px 10px;
    justify-content: center;
    
    ${({ theme }) => theme.mediaWidth.upToSmall`
        padding-right: 8px;
        justify-content: center;
  `};
`

const CurrentTime = styled.div`
    font-size: 24px;
    font-weight: bold;
    margin-right: 8px;
    color: #dbb84b;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;
    font-weight: 500;
    margin-right: 5px;
  `};
`

const TotalTime = styled.div`
    font-size: 14px;
    margin-top: 6px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
    margin-top: 4px;
  `};
`

const TimerLabel: React.FC<TimerLabelProps> = ({ interval, unit }: TimerLabelProps) => {
    const seconds = useRoundCountdown()
    const countdown = formatRoundTime(seconds)
    const { t } = useTranslation()
    return (
        <Wrapper>
            <Timer>
                <TYPE.largeHeader style={{ fontWeight: "normal", textAlign: "center" }}>Closing:</TYPE.largeHeader>
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
