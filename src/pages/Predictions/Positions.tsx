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

const StyledSwiper = styled.div`
  .swiper-wrapper {
    align-items: center;
    display: flex;
  }

  .swiper-slide {
    width: 320px;
  }
`

const MenuWrapper = styled.div`
  margin: 2px 45px;
`
const Positions: React.FC = () => {
  const { setSwiper } = useSwiper()
  const rounds = useGetSortedRounds()
  const initialIndex = Math.floor(rounds.length / 2)

  useOnNextRound()

  return (
    <div>
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
