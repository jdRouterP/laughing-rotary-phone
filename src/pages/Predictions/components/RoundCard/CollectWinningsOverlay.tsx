//@ts-nocheck
import React from 'react'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { Flex, TrophyGoldIcon } from '@pancakeswap/uikit'
import { useBetCanClaim } from 'state/hook'
import { useTranslation } from 'react-i18next'
import CollectWinningsButton from '../CollectWinningsButton'
import { ButtonWinning } from 'components/Button'
import { Button } from 'theme'

interface CollectWinningsOverlayProps {
  roundId: string
  epoch: number
  payout: number
  isBottom?: boolean
}

const Wrapper = styled(Flex) <{ isBottom: CollectWinningsOverlayProps['isBottom'] }>`
  left: 0;
  position: absolute;
  width: 100%;
  z-index: 30;

  ${({ isBottom }) => {
    return isBottom
      ? `
      border-radius: 0 0 16px 16px;
      bottom: 0;
    `
      : `
      top: 37px; // Card header height
    `
  }}
`

const CollectWinningsOverlay: React.FC<CollectWinningsOverlayProps> = ({
  roundId,
  epoch,
  payout,
  isBottom = false,
  ...props
}: CollectWinningsOverlayProps) => {
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const canClaim = useBetCanClaim(account, roundId)

  if (!canClaim) {
    return null
  }

  return (

    // <TrophyGoldIcon width="64px" style={{ flex: 'none' }} mr="8px" />
    <ButtonWinning payout={payout} roundId={roundId} epoch={epoch} hasClaimed={false} width="100%">
      {t('Collect Winnings')}
    </ButtonWinning>

  )
}

export default CollectWinningsOverlay
