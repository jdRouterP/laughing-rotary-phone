import React from 'react'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE, StyledInternalLink } from '../../theme'
// import CurrencyLogo from '../CurrencyLogo'
// import { JSBI, TokenAmount } from '@dfyn/sdk'
import { ButtonPrimary } from '../Button'
import { StakingInfo } from '../../state/vault/hooks'
import { useColor } from '../../hooks/useColor'
// import { currencyId } from '../../utils/currencyId'
import { CardNoise, CardBGImage } from './styled'
// import { useTotalSupply } from '../../data/TotalSupply'
// import { usePair } from '../../data/Reserves'
// import useUSDCPrice from '../../utils/useUSDCPrice'
// import { BIG_INT_SECONDS_IN_DAY } from '../../constants'

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

const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
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
  grid-template-columns:1fr 120px;
  grid-gap: 0px;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns:1fr 96px;
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

export default function PoolCard({ stakingInfo }: { stakingInfo: StakingInfo }) {

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))
  const limitReached = Boolean(stakingInfo?.vaultLimit?.subtract(stakingInfo?.totalStakedAmount).equalTo('0'));
  const backgroundColor = useColor();
  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <CardBGImage desaturate />
      <CardNoise />

      <TopSection>
        <TYPE.white fontWeight={600} fontSize={24} >
          {stakingInfo?.vaultName}
        </TYPE.white>

        <StyledInternalLink to={`/vault/${stakingInfo?.vaultAddress}`} style={{ width: '100%' }}>
          <ButtonPrimary padding="8px" borderRadius="8px">
            {isStaking ? 'Manage' : limitReached ? 'Filled' : 'Deposit'}
          </ButtonPrimary>
        </StyledInternalLink>
      </TopSection>

      <StatContainer>
        <RowBetween>
          <TYPE.white> Launch Date</TYPE.white>
          <TYPE.white>
            {stakingInfo && `${new Date(stakingInfo.startedOn * 1000).toDateString()}`}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> Total deposited</TYPE.white>
          <TYPE.white>
            {stakingInfo && `${stakingInfo.totalStakedAmount.toFixed(0, { groupSeparator: ',' })} ${stakingInfo?.vaultToken?.symbol ?? 'DFYN'}`}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> Vault limit </TYPE.white>
          <TYPE.white>
            {stakingInfo
              ? stakingInfo.active
                ? `${stakingInfo.vaultLimit?.toFixed(0, { groupSeparator: ',' })} ${stakingInfo?.vaultToken?.symbol ?? 'DFYN'}`
                : `0 ${stakingInfo?.vaultToken?.symbol ?? 'DFYN'}`
              : '-'}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> Available limit </TYPE.white>
          <TYPE.white>
            {stakingInfo
              ? stakingInfo.active
                ? `${stakingInfo?.vaultLimit?.subtract(stakingInfo?.totalStakedAmount).toSignificant(6, { groupSeparator: ',' })} ${stakingInfo?.vaultToken?.symbol ?? 'DFYN'}`
                : `0 ${stakingInfo?.vaultToken?.symbol ?? 'DFYN'}`
              : '-'}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> Maturity Period </TYPE.white>
          <TYPE.white>{`${stakingInfo
            ? stakingInfo.active
              ? `${stakingInfo.vesting / (60 * 60 * 24)} Days`
              : '0 Day'
            : '-'
            }`}</TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> APR</TYPE.white>
          <TYPE.white>{`${stakingInfo
            ? stakingInfo.active
              ? `${(stakingInfo.interestRate - 100) * stakingInfo.multiplier}`
              : '0'
            : '0'
            }%`}</TYPE.white>
        </RowBetween>
      </StatContainer>

      {/* {isStaking && (
        <>
          <Break />
          <BottomSection showBackground={true}>
            <TYPE.black color={'white'} fontWeight={500}>
              <span>Your rate</span>
            </TYPE.black>

            <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                ???
              </span>
            </TYPE.black>
          </BottomSection>
        </>
      )} */}
    </Wrapper>
  )
}
