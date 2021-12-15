import React from 'react'

import BackgroundBanner from '../../assets/images/burnDfyn.png'
// import { HEADER_ACCESS } from 'constants/networks'
import styled from 'styled-components'
import { ExternalLink, TYPE } from 'theme'
// import BURNDFYN from '../../assets/images/burn.png'
import { OpenInNew } from '@material-ui/icons'

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

const CustomExternalLink = styled(ExternalLink)`
    display: inline-block;
    margin-right: 30px;
    margin-top: 20px;
`

export default function Banner() {
    return (
        <BannerBox>
            <img src={BackgroundBanner} alt={'banner'} style={{ width: "100%"}} />
            <InnerContent>
            <TYPE.white fontSize="18px" fontWeight="500">50 Million $DFYN tokens were burnt</TYPE.white>
            
            <CustomExternalLink
                style={{ color: 'white', textDecoration: 'underline'}}
                href="https://etherscan.io/tx/0x2285411b4ece226e5b68cff956d3e293c678037ce32c7f4d427c30f460cffad7"
                target="_blank"
                rel="noopener noreferrer"
            >
                <TYPE.white fontSize="14px" marginBottom="15px" marginTop="5px" style={{cursor: "pointer"}}>View transaction 
                <OpenInNew style={{ fontSize: "14px", marginLeft: '2px' }}/></TYPE.white>
            </CustomExternalLink>

            <CustomExternalLink
                style={{ color: 'white', textDecoration: 'underline'}}
                href="https://dfyn-network.medium.com/major-tokenomics-changes-in-dfyn-token-934fda5444f1"
                target="_blank"
                rel="noopener noreferrer"
            >
                <TYPE.white fontSize="14px" marginTop="5px" style={{cursor: "pointer"}}>Learn More</TYPE.white>
            </CustomExternalLink>
            </InnerContent>
        </BannerBox>
    )
}
