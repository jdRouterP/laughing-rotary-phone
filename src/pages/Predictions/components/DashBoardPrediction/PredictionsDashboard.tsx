import React, { useEffect } from 'react'
import styled from 'styled-components'
import { RowBetween } from 'components/Row'
import { CardBGImage, CardNoise, CardSection, DataCard } from 'components/vault/styled'
import { AutoColumn } from 'components/Column'
import { ExternalLink, TYPE } from 'theme'
import { useGetLastOraclePrice} from 'state/hook'
import { useCountUp } from 'react-countup'
import { usePredictionInfo } from 'state/prediction/hooks'
import PredictionMarket from './PredictionMarket'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
`};
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const PredictionsDashboard: React.FC = () => {
  const price = useGetLastOraclePrice()
  const predictionInfos = usePredictionInfo()
  const { countUp, update } = useCountUp({
      start: 0,
      end: price,
      duration: 1,
      decimals: 3,
    })

    useEffect(() => {
      let isMounted = true;
      if (isMounted) update(price)
      return () => { isMounted = false };
    }, [price, update])
  
  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <DataCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600} fontSize={"20px"} textAlign={'center'}>Predictions Markets</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                    Prediction Market is in BETA, use at your own risk!
                </TYPE.white>
              </RowBetween>{' '}
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                href="https://docs.dfyn.network/"
                target="_blank"
              >
                <TYPE.white fontSize={14}>Learn More About Prediction Market</TYPE.white>
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </DataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <TYPE.mediumHeader fontSize={20} style={{ marginTop: '0.5rem' }}>Markets</TYPE.mediumHeader>
        </DataRow>

        <PoolSection>
            {predictionInfos.map((predictionValue)=>{
                return <PredictionMarket key={predictionValue.id} predictionValue={predictionValue} price={countUp} />
            })}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}   

export default PredictionsDashboard