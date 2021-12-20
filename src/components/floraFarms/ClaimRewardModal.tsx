import React, { useState } from 'react'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon, StyledInternalLink } from '../../theme'
import { ButtonError, ButtonPrimary } from '../Button'
import { StakingInfo } from '../../state/flora-farms/hooks'
import { useStakingContract } from '../../hooks/useContract'
import { SubmittedView, LoadingView } from '../ModalViews'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useActiveWeb3React } from '../../hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
}

export default function ClaimRewardModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useActiveWeb3React()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)
  const unClaimedAmount = stakingInfo?.unclaimedAmount?.toNumber()?.toFixed(3);
  async function onClaimReward() {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttempting(true)
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated ${stakingInfo ? stakingInfo?.rewardToken.symbol : "DFYN"} rewards`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? 'Enter an amount'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Claim</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {unClaimedAmount && (
            <AutoColumn justify="center" gap="md">
              {stakingInfo.userVestingInfo.hasSetConfig ? stakingInfo.userVestingInfo.hasOptForVesting ? <TYPE.body fontWeight={600} fontSize={36}>
                {'25%'}
              </TYPE.body> : <TYPE.body fontWeight={600} fontSize={36}>
                {parseFloat(stakingInfo?.earnedAmount.toFixed(3)) * (1 - (parseInt(stakingInfo?.burnRate) / 100))}
              </TYPE.body> : <TYPE.body fontWeight={600} fontSize={36}>
                {'25%'}
              </TYPE.body>}
              <TYPE.body>{`Unclaimed ${stakingInfo ? stakingInfo?.rewardToken.symbol : "DFYN"}`}</TYPE.body>
            </AutoColumn>
          )}
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you claim without withdrawing your liquidity remains in the mining pool.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onClaimReward}>
            {error ?? 'Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>{`Claiming ${stakingInfo ? stakingInfo?.rewardToken.symbol : "DFYN"}`}</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{`Claimed ${stakingInfo ? stakingInfo?.rewardToken.symbol : "DFYN"}!`}</TYPE.body>
            <StyledInternalLink to={`/vdfyn`} style={{width: '100%', marginTop: "10px"}}>
              <ButtonPrimary padding="18px" borderRadius="8px" fontSize="18px" fontWeight="700">
                Stake DFYN
              </ButtonPrimary>
            </StyledInternalLink>
            <TYPE.body fontSize={'12px'}>Stake your DFYN rewards in vDfyn to get extra APR</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
