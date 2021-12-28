import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Banner from './Banner'

export const BannerWrapper = styled.div`
  transition: transform 700ms ease-in-out;
  position: relative;
  overflow: hidden;
  height: 145px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
`
interface CarouselContent {
  description: string
  image: string
  value: number
  index: number
  length: number
  viewTransaction: string
  learnText: string
  transaction: string
  learnMore: string
}
const waitTime = 7000
const BannerCarousel = () => {
  const [currentCarousel, setCurrentCarousel] = useState(0)
  const [carouselContent, setCarouselContent] = useState<undefined | CarouselContent[]>()
  useEffect(() => {
    const timeout2 = setTimeout(() => {
      setCurrentCarousel((prev) => prev + 1)
    }, waitTime)
    return () => clearTimeout(timeout2)
  }, [currentCarousel])
  useEffect(() => {
    getBannerData()
  }, [])
  const getBannerData = async () => {
    fetch('https://raw.githubusercontent.com/dfyn/banner-data/master/banner-content/index.json')
      .then((response) => response.json())
      .then((data) => setCarouselContent(data))
  }
  return (
    <BannerWrapper>
      {carouselContent?.map(({ image, description, viewTransaction, learnText, transaction, learnMore }, index) => {
        return (
          <Banner
            key={index}
            image={image}
            description={description}
            value={currentCarousel}
            length={carouselContent.length}
            index={index}
            viewTransaction={viewTransaction}
            learnText={learnText}
            transaction={transaction}
            learnMore={learnMore}
          />
        )
      })}
    </BannerWrapper>
  )
}

export default BannerCarousel
