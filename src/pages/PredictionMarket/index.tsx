import React, { useRef } from 'react'
import LiveCard from './components/LiveCard'
import ExpiredCard from './components/ExpiredCard'
import styled from 'styled-components'
import NextCard from './components/NextCard'
import UpcomingCard from './components/UpcomingCard'
import BetTimer from './components/BetTimer'
import History from './components/History'
import DfynPrice from './components/DfynPrice'

interface Props {

}

const Wrapper = styled.div`
  
`

const CardsWrapper = styled.div`
    width: 80vw;
    display: flex;
    align-items: center;
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
::-webkit-scrollbar { 
    width: 0;
    height: 0;
}
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
`


const PredictionMarket = (props: Props) => {

    const TOTAL_TIMER = 5 * 60 //in seconds

    const cardsWrapperRef = useRef<HTMLInputElement | null>(null)

    const horizontalScroll = (e: any) => {
        e.preventDefault();

        if (cardsWrapperRef && cardsWrapperRef.current) {
            console.log(cardsWrapperRef.current.scrollLeft)
            cardsWrapperRef.current.scrollLeft += (e.deltaY);
        }

        console.log(e.deltaY)
    }

    return (
        <Wrapper>
            <Header>
                <DfynPrice />
                <BetTimer totalTime={TOTAL_TIMER} />
                <History />
            </Header>
            <CardsWrapper ref={cardsWrapperRef} onWheel={horizontalScroll}>
                <ExpiredCard />
                <LiveCard totalTime={TOTAL_TIMER} />
                <NextCard />
                <UpcomingCard totalTime={TOTAL_TIMER} />
                <ExpiredCard />
                <LiveCard totalTime={TOTAL_TIMER} />
                <NextCard />
                <UpcomingCard totalTime={TOTAL_TIMER} />
            </CardsWrapper>
        </Wrapper>
    )
}

export default PredictionMarket
