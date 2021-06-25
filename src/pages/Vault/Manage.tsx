import React, { useCallback, useState } from 'react'
// import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
// import { Link } from 'react-router-dom'

import { JSBI } from '@dfyn/sdk'
import { RouteComponentProps } from 'react-router-dom'
// import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ExternalLink, TYPE } from '../../theme'

import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/vanillaFarms/styled'
import { ButtonPrimary } from '../../components/Button'
import StakingModal from '../../components/vault/StakingModal'
import { useStakingInfo } from '../../state/vault/hooks'
import UnstakingModal from '../../components/vault/UnstakingModal'
import ClaimRewardModal from '../../components/vault/ClaimRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { CountUp } from 'use-count-up'
import { Countdown } from './Countdown'
import usePrevious from '../../hooks/usePrevious'
import { BIG_INT_ZERO } from '../../constants'
import { useVaultContract } from 'hooks/useContract'


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
    params: { vaultID }
  }
}: RouteComponentProps<{ vaultID: string }>) {
  const { account } = useActiveWeb3React()

  // get currencies and pair
  const vaultContract = useVaultContract(vaultID);

  const stakingInfo = useStakingInfo(vaultContract?.address)?.[0]

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const countUpAmount = stakingInfo?.earnedAmount?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

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
      {/* <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
          {currencyA?.symbol}-{currencyB?.symbol} Liquidity Mining
        </TYPE.mediumHeader>
        <DoubleCurrencyLogo currency0={currencyA ?? undefined} currency1={currencyB ?? undefined} size={24} />
      </RowBetween> */}

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }} fontSize={14}>Total Deposits</TYPE.body>
            <TYPE.body fontSize={22} fontWeight={500}>
              {stakingInfo ? `${stakingInfo.totalStakedAmount.toFixed(0, { groupSeparator: ',' })} DFYN` : "0 DFYN"}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>APR</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>{`${stakingInfo
              ? stakingInfo.active
                ? `${(stakingInfo.interestRate - 100) * stakingInfo.multiplier}`
                : '0'
              : '0'
              }%`}</TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Maturity Period</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {`${stakingInfo
                ? stakingInfo.active
                  ? `${stakingInfo.vesting / (60 * 60 * 24)} Days`
                  : '0 Day'
                : '0 Day'
                }`}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {/* {showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get DFYN tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`DFYN tokens are required. You can swap it!`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width={'fit-content'}
                as={Link}
                to={`/swap`}
              >
                {`Get DFYN Tokens`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      )} */}
      {showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Vault limit reached!</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`Checkout our new farms!`}
                </TYPE.white>
              </RowBetween>
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                href="https://dfyn-network.medium.com/introducing-dfyn-yield-farming-phase-2-7686281dd93"
                target="_blank"
              >
                <TYPE.white fontSize={14}>Read more about Dfyn Farms Phase 2</TYPE.white>
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      )}
      <RowBetween style={{ gap: '24px', alignItems: 'baseline' }}>
        {" "}
        {stakingInfo?.periodFinish && !showAddLiquidityButton && <Countdown exactEnd={stakingInfo.periodFinish} start={stakingInfo.userVaultInfo.depositTime} />}
      </RowBetween>

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
          <StyledDataCard disabled={disableTop} showBackground={!showAddLiquidityButton}>
            <CardSection>
              <CardBGImage desaturate />
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your Vault Amount</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                  </TYPE.white>
                  <TYPE.white>
                    DFYN
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
                  <TYPE.black>Your unclaimed DFYN</TYPE.black>
                </div>
                {/* {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                  <ButtonEmpty
                    padding="8px"
                    borderRadius="8px"
                    width="fit-content"
                    onClick={() => setShowClaimRewardModal(true)}
                  >
                    Claim
                  </ButtonEmpty>
                )} */}
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.largeHeader fontSize={36} fontWeight={600}>
                  <CountUp
                    key={countUpAmount}
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(countUpAmountPrevious)}
                    end={parseFloat(countUpAmount)}
                    thousandsSeparator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
                {/* <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                    ⚡
                  </span>
                  {stakingInfo?.active
                    ? stakingInfo?.rewardRate
                      ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                      ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                    : '0'}
                  {' DFYN / week'}
                </TYPE.black> */}
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          {`Tokens staked and rewards can be linearly claimed over a period of ${stakingInfo ? stakingInfo.vesting / (60 * 60 * 24) : 0}  days.`}
        </TYPE.main>

        {!showAddLiquidityButton && (
          <DataRow style={{ marginBottom: '1rem' }}>
            {stakingInfo && stakingInfo.active && (
              <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
                {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit DFYN'}
              </ButtonPrimary>
            )}

            {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  onClick={() => setShowClaimRewardModal(true)}
                >
                  Claim
                </ButtonPrimary>
              </>
            )}
          </DataRow>
        )}
        {stakingInfo && (
          <TYPE.main>{stakingInfo?.vaultLimit?.subtract(stakingInfo?.totalStakedAmount).toSignificant(6, { groupSeparator: ',' })} DFYN Available Limit</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}