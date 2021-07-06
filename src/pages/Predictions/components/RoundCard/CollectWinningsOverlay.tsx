//@ts-nocheck
import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { useBetCanClaim } from 'state/hook'
import { useTranslation } from 'react-i18next'
import { ButtonWinning } from 'components/Button'

interface CollectWinningsOverlayProps {
  roundId: string
  epoch: number
  payout: number
  isBottom?: boolean
}

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
