import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardNoise } from 'components/customFloraFarms/styled'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { CardBGImage } from 'components/dualFarms/styled'
import { RowBetween } from 'components/Row'
import { BIG_INT_SECONDS_IN_DAY, EMPTY } from '../../constants'
import { useColor } from 'hooks/useColor'
import { Countdown } from 'pages/DualFarms/Countdown'
import React from 'react'
import styled from 'styled-components'
import { StyledInternalLink, TYPE } from 'theme'
import { unwrappedToken } from 'utils/wrappedCurrency'

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: none;
`};
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${showBackground ? theme.black : theme.bg5} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  grid-gap: 0px;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

// const BottomSection = styled.div<{ showBackground: boolean }>`
//   padding: 12px 16px;
//   opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
//   border-radius: 0 0 12px 12px;
//   display: flex;
//   flex-direction: row;
//   align-items: baseline;
//   justify-content: space-between;
//   z-index: 1;
// `

export default function PoolCardAdminFarms({ farmsDetails }: { farmsDetails: any }) {
  const token0 = farmsDetails?.tokens[0]
  const token1 = farmsDetails?.tokens[1]
  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)

  const reward0 = farmsDetails?.rewardToken0 || ''
  const reward1 = farmsDetails?.rewardToken1 || ''

  const baseTokenCurrency = unwrappedToken(farmsDetails.tokens[0])
  const empty = unwrappedToken(EMPTY)

  // const baseToken = baseTokenCurrency === empty ? token0 : farmsDetails.tokens[0];
  const token = baseTokenCurrency === empty ? token1 : baseTokenCurrency === currency0 ? token1 : token0
  const backgroundColor = useColor(token)
  const currenctEpoch = Math.floor(new Date().getTime() / 1000)
  return (
    <Wrapper showBackground={false} bgColor={backgroundColor}>
      <CardBGImage desaturate />
      <CardNoise />

      <TopSection>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
        <TYPE.white fontWeight={600} fontSize={24} style={{ marginLeft: '8px' }}>
          {currency0.symbol}-{currency1.symbol}
          <span style={{ marginLeft: '10px', fontSize: '15px' }}>({farmsDetails.type.typeOf})</span>
        </TYPE.white>
        {(farmsDetails.type.typeOf === 'Ecosystem Farms' || farmsDetails.type.typeOf === 'Dual Farms') && ((farmsDetails.periodFinish - currenctEpoch) < 21600) && (
          <StyledInternalLink
            to={`/renewFarm/${farmsDetails.stakingRewardAddress}`}
            style={{ width: '100%', fontSize: '15px' }}
          >
            <ButtonPrimary padding="8px" borderRadius="8px">
              Renew Farm
            </ButtonPrimary>
          </StyledInternalLink>
        )}
      </TopSection>
      <StatContainer>
        <RowBetween>
          <Countdown exactEnd={new Date(farmsDetails?.periodFinish * 1000)} start={new Date(farmsDetails.startTime*1000)} />
        </RowBetween>
        <RowBetween>
            <TYPE.white> {reward0?.symbol} Pool rate </TYPE.white>
            <TYPE.white>
              {farmsDetails && farmsDetails.rewardToken0RewardRate
                  ? `${Number(farmsDetails.rewardToken0RewardRate.toExact()) === 0 
                      ? Math.round((Number(farmsDetails.rewardAmount[0])/Math.pow(10, farmsDetails.reward0.decimals))/Number(farmsDetails.duration))
                      : farmsDetails.rewardToken0RewardRate?.multiply(BIG_INT_SECONDS_IN_DAY)
                      ?.toFixed(0, { groupSeparator: ',' })} ${reward0?.symbol} / day`
                  : `{0 ${reward0?.symbol} / day}`
              }
            </TYPE.white>
        </RowBetween>
        {farmsDetails.rewardToken1 && 
            <RowBetween>
                <TYPE.white> {reward1?.symbol} Pool rate </TYPE.white>
                <TYPE.white>
                {farmsDetails && farmsDetails.rewardToken1RewardRate
                  ? `${Number(farmsDetails.rewardToken1RewardRate.toExact()) === 0 
                      ? Math.round((Number(farmsDetails.rewardAmount[1])/Math.pow(10, farmsDetails.reward1.decimals))/Number(farmsDetails.duration))
                      : farmsDetails.rewardToken1RewardRate?.multiply(BIG_INT_SECONDS_IN_DAY)
                      ?.toFixed(0, { groupSeparator: ',' })} ${reward1?.symbol} / day`
                  : `{0 ${reward1?.symbol} / day}`
                }
                </TYPE.white>
            </RowBetween>
        }

        {/* <RowBetween>
                    <TYPE.white> APR</TYPE.white>
                    <TYPE.white>{`${Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6)) === 0 ? '-' : apr ? apr?.toFixed(2) : 0}%`}</TYPE.white>
                </RowBetween> */}
      </StatContainer>
    </Wrapper>
  )
}
