import { CHART_URL_PREFIX, HEADER_ACCESS } from 'constants/networks'
import { useActiveWeb3React } from 'hooks'
import React from 'react'
import { TrendingUp } from 'react-feather'
import styled from 'styled-components'
import { ExternalLink } from 'theme'

const AnalyticsStyled = styled.div`
    position: fixed;
    display: flex;
    left: 12px;
    bottom: 6px;
    padding: 1rem;
    
    transition: opacity 0.25s ease;
    :hover {
    opacity: 1;
    }
    ${({ theme }) => theme.mediaWidth.upToMediumLarge`
    bottom: 66px;
  `}
`
const ButtonStyle = styled.div`
    display: flex;
    color: ${({theme}) => theme.text8}
`

export default function Analytics() {
    const { chainId } = useActiveWeb3React()
    return (
        <AnalyticsStyled>
            {chainId && HEADER_ACCESS.charts.includes(chainId) && <ExternalLink href={`https://${CHART_URL_PREFIX[(chainId ? chainId : 1)]}.dfyn.network/home/`} style={{textDecoration: 'none'}}>
            <ButtonStyle>
                <span style={{margin: 'auto 5px auto 0px', fontSize: '17px'}}>Charts</span>
                <TrendingUp size={"30px"} />
            </ButtonStyle>
            </ExternalLink>} 
        </AnalyticsStyled>
        
    )
}
