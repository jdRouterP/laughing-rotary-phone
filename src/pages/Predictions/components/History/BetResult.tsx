import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { Box, Flex, PrizeIcon, BlockIcon, LinkExternal } from '@pancakeswap/uikit'
// import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Bet, BetPosition } from 'state/prediction/types'
// import { fetchBet } from 'state/prediction/reducer'
import { Result } from 'state/prediction/hooks'
import { getExplorerLink } from 'utils'
import useIsRefundable from '../../hooks/useIsRefundable'
import { formatToken, getNetPayout } from '../../helpers'
// import CollectWinningsButton from '../CollectWinningsButton'
import PositionTag from '../PositionTag'
import ReclaimPositionButton from '../ReclaimPositionButton'
import { TYPE } from 'theme'
import { useGetRewardRate } from 'state/hook'
interface BetResultProps {
  bet: Bet
  result: Result
}

const StyledBetResult = styled(Box)`
  border: 1px solid;
  border-radius: 16px;
  margin-bottom: 24px;
  padding: 11px;
`

const BetResult: React.FC<BetResultProps> = ({ bet, result }) => {
  const { t } = useTranslation()
  // const dispatch = useDispatch()
  const { chainId } = useWeb3React()
  const { isRefundable } = useIsRefundable(bet.round.epoch)
  const rewardRate = useGetRewardRate()
  //const tokenUSDCPrice = useUSDCPrice(WETH[chainId ?? 137])
  // const canClaim = useBetCanClaim(account ?? '', bet.round.id)
  // debugger
  // Winners get the payout, otherwise the claim what they put it if it was canceled
  const payout = result === Result.WIN ? getNetPayout(bet, rewardRate) : bet.amount

  const getHeaderColor = () => {
    switch (result) {
      case Result.WIN:
        return 'warning'
      case Result.LOSE:
        return 'textSubtle'
      case Result.CANCELED:
        return 'textDisabled'
      default:
        return 'text'
    }
  }

  const getHeaderText = () => {
    switch (result) {
      case Result.WIN:
        return t('Win')
      case Result.LOSE:
        return t('Lose')
      case Result.CANCELED:
        return t('Canceled')
      default:
        return ''
    }
  }

  const getHeaderIcon = () => {
    switch (result) {
      case Result.WIN:
        return <PrizeIcon color={getHeaderColor()} />
      case Result.LOSE:
      case Result.CANCELED:
        return <BlockIcon color={getHeaderColor()} />
      default:
        return null
    }
  }

  const getResultColor = () => {
    switch (result) {
      case Result.WIN:
        return 'success'
      case Result.LOSE:
        return 'failure'
      case Result.CANCELED:
      default:
        return 'text'
    }
  }

  // const handleSuccess = async () => {
  //   if (account && bet.id)
  //     dispatch(fetchBet({ account, id: bet.id }))
  // }

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" mb="8px" ml="5px">
        <TYPE.mediumHeader>{result === Result.LIVE ? ('Your Position') : ('Your History')}</TYPE.mediumHeader>
        <Flex alignItems="center">
          <TYPE.mediumHeader as="h3" color={getHeaderColor()} mr="4px">
            {getHeaderText()}
          </TYPE.mediumHeader>
          {getHeaderIcon()}
        </Flex>
      </Flex>
      <StyledBetResult>
        {/* {result === Result.WIN && canClaim && !bet.claimed && (
          <CollectWinningsButton
            payout={payout}
            roundId={bet.round.id}
            epoch={bet.round.epoch}
            hasClaimed={!canClaim}
            mb="16px"
            onSuccess={handleSuccess}
          >
            {t('Collect Winnings')}
          </CollectWinningsButton>
        )} */}
        {result === Result.CANCELED && isRefundable && (
          <ReclaimPositionButton epoch={bet.round.epoch} width="100%" mb="16px" />
        )}
        <Flex alignItems="center" justifyContent="space-between" mb="10px">
          <TYPE.main >{t('Your direction')}</TYPE.main>
          <PositionTag betPosition={bet.position}>
            {bet.position === BetPosition.BULL ? t('BULL') : t('BEAR')}
          </PositionTag>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between" mb="16px">
          <TYPE.main >{t('Your position')}</TYPE.main>
          <TYPE.main >{`${formatToken(bet.amount)} MATIC`}</TYPE.main>
        </Flex>
        {result !== Result.LIVE && <Flex alignItems="start" justifyContent="space-between">
          <TYPE.main >{t('Your Result')}</TYPE.main>
          <Box style={{ textAlign: 'right' }}>
            <TYPE.main color={getResultColor()}>{`${result === Result.LOSE ? '-' : '+'}${formatToken(payout)} MATIC`}</TYPE.main>
            <TYPE.main fontSize="12px" color="textSubtle">
              {/* 
              {`~$${formatToken(tokenusdPrice.times(payout).toNumber())}`} */}
            </TYPE.main>
          </Box>
        </Flex>}
        {bet.claimed && (
          <Flex justifyContent="center" mt='15px'>
            {chainId && bet.claimedHash && <LinkExternal href={getExplorerLink(chainId, bet.claimedHash, "transaction")} mb="16px">
              {t('View on Explorer')}
            </LinkExternal>}
          </Flex>
        )}
      </StyledBetResult>
    </>
  )
}

export default BetResult
