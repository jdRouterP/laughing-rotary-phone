import React, { useCallback, useMemo, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { JSBI, TokenAmount } from '@dfyn/sdk'
import { RouteComponentProps } from 'react-router-dom'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ExternalLink, TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/customLaunchFarms/styled'
import { ButtonPrimary } from '../../components/Button'
import StakingModal from '../../components/customLaunchFarms/StakingModal'
import { useStakingCustomLaunchFarmInfo } from '../../state/custom-launch-farm-stake/hooks'
import UnstakingModal from '../../components/customLaunchFarms/UnstakingModal'
import ClaimRewardModal from '../../components/customLaunchFarms/ClaimRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import { CountUp } from 'use-count-up'

import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { useTotalSupply } from '../../data/TotalSupply'
import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
import useUSDCPrice from '../../utils/useUSDCPrice'
import { BIG_INT_ZERO, BIG_INT_SECONDS_IN_DAY, ETHER } from '../../constants'
import { Countdown } from './Countdown'
import { useBYOFLaunchFarmsContract } from 'hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const PositionInfo = styled(AutoColumn) <{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard) <{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
`

const StyledBottomCard = styled(DataCard) <{ dim: any }>`
  background: ${({ theme }) => theme.bg3};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

export default function Manage({
  match: {
    params: { stakingAddress }
  }
}: RouteComponentProps<{ stakingAddress: string }>) {
  const { account, chainId } = useActiveWeb3React()

  const launchContract = useBYOFLaunchFarmsContract(stakingAddress)
  const lpAddress = useSingleCallResult(launchContract, 'stakingToken')
  

  const trackedTokenPairs = useTrackedTokenPairs()
  const allLPPairs = useMemo(
      () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
      [trackedTokenPairs]
  )
  const bothTokens = allLPPairs.filter(i => i.liquidityToken.address === lpAddress.result?.[0])

  const currencyA = bothTokens[0]?.tokens[0]
  const currencyB = bothTokens[0]?.tokens[1]
  // get currencies and pair
  // const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const [, stakingTokenPair] = usePair(tokenA, tokenB)
  const stakingInfo = useStakingCustomLaunchFarmInfo(stakingAddress)?.[0]

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const token = currencyA === ETHER ? tokenB : tokenA
  const WETH = currencyA === ETHER ? tokenA : tokenB
  const backgroundColor = useColor(token)

  // get WETH value of staked LP tokens
  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo?.stakedAmount?.token)
  let valueOfTotalStakedAmountInWETH: TokenAmount | undefined
  if (totalSupplyOfStakingToken && stakingTokenPair && stakingInfo && WETH) {
    // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
    valueOfTotalStakedAmountInWETH = new TokenAmount(
      WETH,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(WETH).raw),
          JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw
      )
    )
  }
  let totalEarnedReward: string = ""
  let totalEarnedRewardTwo: string | undefined
  let countUpAmount: string = ""
  let countUpAmountTwo: string | undefined
  if(stakingInfo?.rewardToken.length === 1){
    totalEarnedReward = stakingInfo?.totalEarnedRewardArr[0]?.toFixed(2) ?? '0';
    countUpAmount = stakingInfo?.earnedAmount[0]?.toFixed(6) ?? '0'
  }
  else{
    totalEarnedReward = stakingInfo?.totalEarnedRewardArr[0]?.toFixed(2) ?? '0';
    countUpAmount = stakingInfo?.earnedAmount[0]?.toFixed(6) ?? '0'
    totalEarnedRewardTwo = stakingInfo?.totalEarnedRewardArr[1]?.currency.symbol !== 'EMPTY' ? stakingInfo?.totalEarnedRewardArr[1]?.toFixed(2) ?? '0' : undefined
    countUpAmountTwo = stakingInfo?.earnedAmount[1]?.currency.symbol !== 'EMPTY' ? stakingInfo?.earnedAmount[1]?.toFixed(6) ?? '0' : undefined
  }
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'
  const countUpAmountTwoPrevious = usePrevious(countUpAmountTwo) ?? '0'
  // const totalVestedAmount = stakingInfo?.totalVestedAmount?.toFixed(2) ?? '0';
  // const totalEarnedReward = stakingInfo?.totalEarnedReward?.toFixed(2) ?? '0';
  // const unClaimedAmount = stakingInfo?.unclaimedAmount?.toNumber()?.toFixed(3);
  // console.log

  // const countUpAmount = unClaimedAmount;
  // const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'
  // const countUpAmount = stakingInfo?.earnedAmount?.toFixed(4) ?? '0'
  // const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  // const vestedAmount = stakingInfo?.earnedAmount?.toFixed(2) ?? '0'

  // const claimedAmount = JSBI.subtract(stakingInfo?.totalVestedAmount?.raw, stakingInfo?.earnedAmount?.raw)
  // console.log(claimedAmount);
  // get the USD value of staked WETH
  const USDPrice = useUSDCPrice(WETH)
  const valueOfTotalStakedAmountInUSDC = valueOfTotalStakedAmountInWETH && USDPrice?.quote(valueOfTotalStakedAmountInWETH)

  const toggleWalletModal = useWalletModalToggle()
  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
          {currencyA?.symbol}-{currencyB?.symbol} Liquidity Mining
        </TYPE.mediumHeader>
        <DoubleCurrencyLogo currency0={currencyA ?? undefined} currency1={currencyB ?? undefined} size={24} />
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total Pool Deposits</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {valueOfTotalStakedAmountInUSDC
                ? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, { groupSeparator: ',' })}`
                : `${valueOfTotalStakedAmountInWETH?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} ETH`}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          {
            !stakingInfo?.hasClaimedPartial || !stakingInfo?.vestingActive ? <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo?.active
                ? stakingInfo?.totalRewardRate[0]
                  ?.multiply(BIG_INT_SECONDS_IN_DAY)
                  ?.toFixed(0, { groupSeparator: ',' }) ?? '-'
                : '0'}
              {` ${stakingInfo ? stakingInfo?.rewardToken[0]?.symbol : ""}`}
              {stakingInfo?.rewardToken.length === 2 && <>
                  {" | "}
                  {stakingInfo?.active
                    ? stakingInfo?.totalRewardRate[1]
                      ?.multiply(BIG_INT_SECONDS_IN_DAY)
                      ?.toFixed(0, { groupSeparator: ',' }) ?? '-'
                    : '0'}
                  {` ${stakingInfo ? stakingInfo?.rewardToken[1]?.symbol : ""}`}
                  </>
              }
              </TYPE.body>
            </AutoColumn> :
              <AutoColumn gap="sm">
                <TYPE.body style={{ margin: 0 }}>{`Total ${stakingInfo?.rewardToken[0]} ${stakingInfo?.rewardToken.length === 2 && stakingInfo?.rewardToken[1]} earned (includes vesting)`}</TYPE.body>
                <TYPE.body fontSize={22} fontWeight={500}>
                  {` ${stakingInfo?.hasClaimedPartial ? totalEarnedReward : stakingInfo?.earnedAmount[0]?.toFixed(2) ?? '0'} ${stakingInfo?.rewardToken[0]} ${stakingInfo?.rewardToken.length === 2 && stakingInfo?.hasClaimedPartial ? totalEarnedRewardTwo : stakingInfo?.earnedAmount[1]?.toFixed(2) ?? '0'} ${stakingInfo?.rewardToken[1]}}`}
                </TYPE.body>
              </AutoColumn>
          }

        </PoolData>
      </DataRow>

      {showAddLiquidityButton && (stakingInfo?.active ? (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get DFYN Liquidity tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`DFYN LP tokens are required. Once you've added liquidity to the ${currencyA?.symbol}-${currencyB?.symbol} pool you can stake your liquidity tokens on this page.`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width={'fit-content'}
                as={Link}
                to={`/add/${currencyA && currencyId(currencyA, chainId)}/${currencyB && currencyId(currencyB, chainId)}`}
              >
                {`Add ${currencyA?.symbol}-${currencyB?.symbol} liquidity`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      ) : (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>This farm has ended!</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`Checkout our new farms!`}
                </TYPE.white>
              </RowBetween>
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                href="https://dfyn-network.medium.com/introducing-dfyn-yield-farming-phase-7-4480eebf0fba"
                target="_blank"
              >
                <TYPE.white fontSize={14}>Read more about Dfyn Farms Phase 7</TYPE.white>
              </ExternalLink>
            </AutoColumn>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      ))}

      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
          />
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => setShowClaimRewardModal(false)}
            stakingInfo={stakingInfo}
          />
        </>
      )}

      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
            <CardSection>
              <CardBGImage desaturate />
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your liquidity deposits</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                  </TYPE.white>
                  <TYPE.white>
                    DFYN LP {currencyA?.symbol}-{currencyB?.symbol}
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
            <CardBGImage desaturate />
            <CardNoise />
            <AutoColumn gap="sm">
              <RowBetween>
                <div>
                  <TYPE.black>{`Your unclaimed ${stakingInfo ? `${stakingInfo?.rewardToken[0].symbol} ${stakingInfo?.rewardToken.length === 2 ? stakingInfo.rewardToken[1].symbol : ""}` : ""}`}</TYPE.black>
                </div>
                {stakingInfo?.earnedAmount[0] && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount[0]?.raw) && (<>
                  <div hidden={stakingInfo?.ableToClaim}>
                    <TYPE.black>{<Countdown showMessage={false} exactEnd={stakingInfo?.unlockAt} color="black" />}</TYPE.black>
                  </div>
                  {stakingInfo?.ableToClaim && <ButtonPrimary
                    padding="5px"
                    borderRadius="8px"
                    width="fit-content"
                    onClick={() => setShowClaimRewardModal(true)}
                  >
                    Claim
                  </ButtonPrimary>}
                </>)}
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
              <TYPE.largeHeader fontSize={24} fontWeight={600}>
                <CountUp
                    key={countUpAmount}
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(countUpAmountPrevious)}
                    end={parseFloat(countUpAmount)}
                    thousandsSeparator={','}
                    duration={1}
                  />
                  {" "}{stakingInfo?.rewardToken[0].symbol}
                  {stakingInfo?.rewardToken.length === 2 && countUpAmountTwo && <>
                    <br />
                    <CountUp
                      key={234}
                      isCounting
                      decimalPlaces={4}
                      start={parseFloat(countUpAmountTwoPrevious)}
                      end={parseFloat(countUpAmountTwo)}
                      thousandsSeparator={','}
                      duration={1}
                    />
                    {" "}{stakingInfo?.rewardToken[1].symbol}
                  </>}
                </TYPE.largeHeader>

                <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                      ⚡
                    </span>
                    {stakingInfo?.active
                      ? stakingInfo?.rewardRate[0]
                        ?.multiply(BIG_INT_SECONDS_IN_DAY)
                        ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                      : '0'}
                    {` ${stakingInfo ? stakingInfo?.rewardToken[0].symbol : ""} / day`}
                    {stakingInfo?.rewardToken.length === 2 && <>
                    <br />
                    <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                      ⭐
                    </span>
                    {stakingInfo?.active
                      ? stakingInfo?.rewardRate[1]
                        ?.multiply(BIG_INT_SECONDS_IN_DAY)
                        ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                      : '0'}
                    {` ${stakingInfo ? stakingInfo?.rewardToken[1].symbol : ""} / day`}
                  </>}
                </TYPE.black>
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          {`You can claim ${stakingInfo?.claim}% of your ${stakingInfo && stakingInfo?.rewardToken[0].symbol} ${stakingInfo?.rewardToken.length === 2 ? stakingInfo.rewardToken[1].symbol : ""} token rewards after the farming program ends, and the remaining will be released ${(100 - stakingInfo?.claim)/(stakingInfo?.splits)}% every ${(stakingInfo?.vestingPeriodDays)/(24*60*60)} days!`}
        </TYPE.main>

        {!showAddLiquidityButton && (
          <DataRow style={{ marginBottom: '1rem' }}>
            {stakingInfo && stakingInfo.active && (
              <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
                {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit DFYN LP Tokens'}
              </ButtonPrimary>
            )}

            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  onClick={() => setShowUnstakingModal(true)}
                >
                  Withdraw
                </ButtonPrimary>
              </>
            )}
          </DataRow>
        )}
        {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : !stakingInfo?.active ? null : (
          <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} DFYN LP tokens available</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}