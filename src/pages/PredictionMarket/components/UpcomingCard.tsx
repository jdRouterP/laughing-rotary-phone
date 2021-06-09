import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

interface Props {
    totalTime: number
}

const Wrapper = styled.div`
    margin: 0 20px;
`
const TitleWrapper = styled.div`
    width: 320px;
    height: 40px;
    border: 1px solid blue;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

`
const Title = styled.div`
    font-size:16px;
    font-weight:600;
    padding: 0 20px;
    display:flex;
    justify-content: space-between;
`

const ContentWrapper = styled.div`
    width: 320px;
    height: 280px;
    border: 1px solid red;
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const Content = styled.div`
    width: 250px;
    height: 120px;
    border: 1px solid pink;
    border-radius: 12px;
    padding: 20px 15px;
    display:grid;
    place-items: center;
    margin: 20px 0;
`

const Payout = styled.div`
    display: grid;
    place-items: center;
`

const PayoutLabel = styled.div`
    font-size: 20px;
    font-weight: bold;
`

const EntryTitle = styled.div`
    font-size: 16px;
    font-weight: bold;
`
const EntryTimer = styled.div`
    font-size: 30px;
    font-weight: bold;
`

const UpcomingCard = ({ totalTime }: Props) => {


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
            <TitleWrapper>
                <Title>
                    <span>
                        LATER
                    </span>
                    <span style={{ fontWeight: 400 }}>
                        #6969
                    </span>
                </Title>
            </TitleWrapper>
            <ContentWrapper>
                <Payout>
                    <PayoutLabel>
                        UP
                    </PayoutLabel>
                </Payout>
                <Content>
                    <EntryTitle>
                        Entry Starts
                    </EntryTitle>
                    <EntryTimer>
                        ~{minutes}:{seconds}
                    </EntryTimer>
                </Content>
                <Payout>
                    <PayoutLabel>
                        DOWN
                    </PayoutLabel>
                </Payout>
            </ContentWrapper>
        </Wrapper>
    )
}

export default UpcomingCard
