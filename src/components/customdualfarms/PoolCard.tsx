import React from 'react'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE, StyledInternalLink } from '../../theme'
import DoubleCurrencyLogo from '../DoubleLogo'
import { JSBI, TokenAmount } from '@dfyn/sdk'
import { ButtonPrimary } from '../Button'
import { useColor } from '../../hooks/useColor'
// import { currencyId } from '../../utils/currencyId'
import { Break, CardNoise, CardBGImage } from './styled'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { useTotalSupply } from '../../data/TotalSupply'
import { usePair } from '../../data/Reserves'
import useUSDCPrice from '../../utils/useUSDCPrice'
import { BIG_INT_SECONDS_IN_DAY, EMPTY } from '../../constants'
// import { useActiveWeb3React } from 'hooks'
import { StakingInfo } from 'state/custom-dual-farm-stake/hooks'
import { Countdown } from 'pages/CustomDualFarms/Countdown'

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
  grid-template-columns: 48px 1fr 120px;
  grid-gap: 0px;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  z-index: 1;
`

export default function PoolCardDualFarm({ stakingInfo, isInactive }: { stakingInfo: StakingInfo, isInactive: boolean }) {
  const token0 = stakingInfo.tokens[0]
  const token1 = stakingInfo.tokens[1]

  const reward0 = stakingInfo?.rewardAddresses[0] || ''
  const reward1 = stakingInfo?.rewardAddresses[1] || ''
  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)
  const baseTokenCurrency = unwrappedToken(stakingInfo.baseToken);
  const empty = unwrappedToken(EMPTY);
  // const { chainId } = useActiveWeb3React()

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  // get the color of the token
  const baseToken = baseTokenCurrency === empty ? token0 : stakingInfo.baseToken;
  const token = baseTokenCurrency === empty ? token1 : baseTokenCurrency === currency0 ? token1 : token0;

  const backgroundColor = useColor(token)

  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo.stakedAmount.token)
  const [, stakingTokenPair] = usePair(...stakingInfo.tokens)

  // let returnOverMonth: Percent = new Percent('0')
  let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined
  if (totalSupplyOfStakingToken && stakingTokenPair) {
    // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
    valueOfTotalStakedAmountInBaseToken = new TokenAmount(
      baseToken,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(baseToken).raw),
          JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw
      )
    )
  }




  let USDPrice = useUSDCPrice(baseToken)

  const valueOfTotalStakedAmountInUSDC = valueOfTotalStakedAmountInBaseToken && USDPrice?.quote(valueOfTotalStakedAmountInBaseToken)

  const rateOne = stakingInfo?.totalRewardRate?.multiply(BIG_INT_SECONDS_IN_DAY).toFixed(5);
  const rateTwo = stakingInfo?.totalRewardRateTwo?.multiply(BIG_INT_SECONDS_IN_DAY).toFixed(5);
  //@ts-ignore
  const valueOfToken1GivenPerYear: any = parseFloat(rateOne) * stakingInfo?.tokenOnePrice * 365

  //@ts-ignore
  const valueOfToken2GivenPerYear: any = parseFloat(rateTwo) * stakingInfo?.tokenTwoPrice * 365
  const apr = valueOfTotalStakedAmountInUSDC && (valueOfToken1GivenPerYear + valueOfToken2GivenPerYear) / Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6)) * 100;
  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <CardBGImage desaturate />
      <CardNoise />

      <TopSection>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
        <TYPE.white fontWeight={600} fontSize={24} style={{ marginLeft: '8px' }}>
          {currency0.symbol}-{currency1.symbol}
        </TYPE.white>

        <StyledInternalLink to={`/custom-dual-farms/${isInactive ? 'archived/' : ''}${stakingInfo.stakingRewardAddress}`} style={{ width: '100%' }}>
          <ButtonPrimary padding="8px" borderRadius="8px">
            {isStaking ? 'Manage' : 'Deposit'}
          </ButtonPrimary>
        </StyledInternalLink>
      </TopSection>

      <StatContainer>
        <RowBetween >
          <Countdown exactEnd={stakingInfo?.periodFinish} start={new Date(Number(stakingInfo?.start)*1000)} />
        </RowBetween>
        <RowBetween>
          <TYPE.white> Total deposited</TYPE.white>
          <TYPE.white>
            {valueOfTotalStakedAmountInUSDC
              ? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, { groupSeparator: ',' })}`
              : `${valueOfTotalStakedAmountInBaseToken?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} ETH`}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> {reward0?.symbol} Pool rate </TYPE.white>
          <TYPE.white>
            {stakingInfo
              ? stakingInfo.active
                ? `${Number(stakingInfo.rewardRate.toExact()) === 0 
                  ? Math.round((Number(stakingInfo.rewardAmount[0])/Math.pow(10, stakingInfo.rewardAddresses[0].decimals))/Number(stakingInfo.duration))
                  : stakingInfo.totalRewardRate
                  ?.multiply(BIG_INT_SECONDS_IN_DAY)
                  ?.toFixed(0, { groupSeparator: ',' })} ${reward0?.symbol} / day`
                : `{0 ${reward0?.symbol} / day}`
              : '-'}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> {reward1?.symbol} Pool rate </TYPE.white>
          <TYPE.white>
            {stakingInfo
              ? stakingInfo.active
                ? `${Number(stakingInfo.rewardRateTwo.toExact()) === 0 
                  ? Math.round((Number(stakingInfo.rewardAmount[1])/Math.pow(10, stakingInfo.rewardAddresses[1].decimals))/Number(stakingInfo.duration))
                  : stakingInfo.totalRewardRateTwo
                  ?.multiply(BIG_INT_SECONDS_IN_DAY)
                  ?.toFixed(0, { groupSeparator: ',' })} ${reward1?.symbol} / day`
                : `{0 ${reward1?.symbol} / day}`
              : '-'}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> APR</TYPE.white>
          <TYPE.white>{`${Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6)) === 0 ? '-' : apr ? apr?.toFixed(2) : 0}%`}</TYPE.white>
        </RowBetween>
      </StatContainer>

      {isStaking && (
        <>
          <Break />
          <BottomSection showBackground={true}>
            <TYPE.black color={'white'} fontWeight={500}>
              <span>Your rate</span>
            </TYPE.black>

            <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                ⚡
              </span>
              {stakingInfo
                ? stakingInfo.active
                  ? `${stakingInfo.rewardRate
                    ?.multiply(BIG_INT_SECONDS_IN_DAY)
                    ?.toSignificant(4, { groupSeparator: ',' })} ${reward0?.symbol} / day`
                  : `0 ${reward0?.symbol} / day`
                : '-'}
            </TYPE.black>
            <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                ⚡
              </span>
              {stakingInfo
                ? stakingInfo.active
                  ? `${stakingInfo.rewardRateTwo
                    ?.multiply(BIG_INT_SECONDS_IN_DAY)
                    ?.toSignificant(4, { groupSeparator: ',' })} ${reward1?.symbol} / day`
                  : `0 ${reward1?.symbol} / day`
                : '-'}
            </TYPE.black>
          </BottomSection>
        </>
      )}
    </Wrapper>
  )
}
