import React from 'react'
import styled from 'styled-components'
import SwiperCore, { Keyboard, Mousewheel } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useGetSortedRounds } from 'state/hook'
import 'swiper/swiper.min.css'
import RoundCard from './components/RoundCard'
import Menu from './components/Menu'
import useSwiper from './hooks/useSwiper'
import useOnNextRound from './hooks/useOnNextRound'

SwiperCore.use([Keyboard, Mousewheel])


// const BetaVersionCard = styled.div`
//   margin: 0 auto;
//   text-align: center;
//   padding: 2px;
//   margin-bottom: 6px;
//   max-width: 366px;
//   width: 100%;
//   border: 1px solid;
//   border-radius: 5px;
//   background: radial-gradient(76.02% 75.41% at 1.84% 0%,#ff007a 0%,#2172e5 100%);
// `

const StyledSwiper = styled.div`
  .swiper-wrapper {
    align-items: center;
    display: flex;
  }

  .swiper-slide {
    width: 310px;
  }
`

const MenuWrapper = styled.div`
  margin: 2px 45px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 2px;
  `};
`
const Positions: React.FC = () => {
  const { setSwiper } = useSwiper()
  const rounds = useGetSortedRounds()
  const initialIndex = Math.floor(rounds.length / 2);
  useOnNextRound()

  return (
    <div>
      {/* <BetaVersionCard>
        <span>Prediction Market is in BETA, use at own risk</span>
      </BetaVersionCard> */}
      <MenuWrapper>
        <Menu />
      </MenuWrapper>
      <StyledSwiper>
        <Swiper
          initialSlide={initialIndex}
          onSwiper={setSwiper}
          spaceBetween={16}
          slidesPerView="auto"
          freeMode
          freeModeSticky
          centeredSlides
          freeModeMomentumRatio={0.25}
          freeModeMomentumVelocityRatio={0.5}
          mousewheel
          keyboard
          resizeObserver
        >
          {rounds.map((round) => (
            <SwiperSlide key={round.id}>
              <RoundCard round={round} />
            </SwiperSlide>
          ))}
        </Swiper>
      </StyledSwiper>
    </div>
  )
}

export default Positions
