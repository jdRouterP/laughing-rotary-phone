import React from 'react'

import BackgroundBanner from '../../assets/images/burnDfyn.png'
// import { HEADER_ACCESS } from 'constants/networks'
import { Countdown } from 'components/CountDownSwap'
import styled from 'styled-components'
import { ExternalLink, TYPE } from 'theme'
// import BURNDFYN from '../../assets/images/burn.png'


const BannerBox = styled.div`
  max-width: 420px;
  width: 100%;
  textAlign: center;
  position: relative;
  box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;
  border-radius: 30px
`

const InnerContent = styled.div`
  top: 22%;
  left: 4%;
  position: absolute;
`

export default function Banner() {
    return (
        <BannerBox>
            <img src={BackgroundBanner} alt={'banner'} style={{ width: "100%"}} />
            <InnerContent>
            <TYPE.white fontSize="15px" fontWeight="500">50 Million DFYN tokens will be burned in</TYPE.white>
            <Countdown exactEnd={new Date(1638363600000)} start={new Date()} />
            <ExternalLink
                style={{ color: 'white', textDecoration: 'underline'}}
                href="https://dfyn-network.medium.com/major-tokenomics-changes-in-dfyn-token-934fda5444f1"
                target="_blank"
                rel="noopener noreferrer"
            >
                <TYPE.white fontSize="12px" marginTop="5px" style={{cursor: "pointer"}}>Learn More</TYPE.white>
            </ExternalLink>
            </InnerContent>
        </BannerBox>
    )
}
