import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { Box, Flex, Heading, Text, PrizeIcon, BlockIcon, LinkExternal } from '@pancakeswap/uikit'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useBetCanClaim } from 'state/hook'
import styled from 'styled-components'
import { Bet, BetPosition } from 'state/prediction/types'
import { fetchBet } from 'state/prediction/reducer'
import { Result } from 'state/prediction/hooks'
import { getEtherscanLink } from 'utils'
import useIsRefundable from '../../hooks/useIsRefundable'
import { formatBnb, getPayout } from '../../helpers'
import CollectWinningsButton from '../CollectWinningsButton'
import PositionTag from '../PositionTag'
import ReclaimPositionButton from '../ReclaimPositionButton'
import BigNumber from 'bignumber.js'
import useUSDCPrice from 'utils/useUSDCPrice'
import { WETH } from '@uniswap/sdk'
interface BetResultProps {
  bet: Bet
  result: Result
}

const StyledBetResult = styled(Box)`

  border-radius: 16px;
  margin-bottom: 24px;
  padding: 16px;
`

const BetResult: React.FC<BetResultProps> = ({ bet, result }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { account, chainId } = useWeb3React()
  const { isRefundable } = useIsRefundable(bet.round.epoch)
  const tokenUSDCPrice = useUSDCPrice(WETH[chainId ?? 137])
  const canClaim = useBetCanClaim(account ?? '', bet.round.id)

  // Winners get the payout, otherwise the claim what they put it if it was canceled
  const payout = result === Result.WIN ? getPayout(bet) : bet.amount

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

  const handleSuccess = async () => {
    await dispatch(fetchBet({ account, id: bet.id }))
  }

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <Heading>{t('Your History')}</Heading>
        <Flex alignItems="center">
          <Heading as="h3" color={getHeaderColor()} textTransform="uppercase" bold mr="4px">
            {getHeaderText()}
          </Heading>
          {getHeaderIcon()}
        </Flex>
      </Flex>
      <StyledBetResult>
        {result === Result.WIN && !canClaim && (
          <CollectWinningsButton
            payout={payout}
            roundId={bet.round.id}
            epoch={bet.round.epoch}
            hasClaimed={!canClaim}
            width="100%"
            mb="16px"
            onSuccess={handleSuccess}
          >
            {bet.claimed ? t('Already Collected') : t('Collect Winnings')}
          </CollectWinningsButton>
        )}
        {bet.claimed && (
          <Flex justifyContent="center">
            <LinkExternal href={getEtherscanLink(chainId, bet.claimedHash, "transaction")} mb="16px">
              {t('View on BscScan')}
            </LinkExternal>
          </Flex>
        )}
        {result === Result.CANCELED && isRefundable && (
          <ReclaimPositionButton epoch={bet.round.epoch} width="100%" mb="16px" />
        )}
        <Flex alignItems="center" justifyContent="space-between" mb="16px">
          <Text>{t('Your direction')}</Text>
          <PositionTag betPosition={bet.position}>
            {bet.position === BetPosition.BULL ? t('Up') : t('Down')}
          </PositionTag>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between" mb="16px">
          <Text>{t('Your position')}</Text>
          <Text>{`${formatBnb(bet.amount)} BNB`}</Text>
        </Flex>
        <Flex alignItems="start" justifyContent="space-between">
          <Text bold>{t('Your Result')}</Text>
          <Box style={{ textAlign: 'right' }}>
            <Text bold color={getResultColor()}>{`${result === Result.LOSE ? '-' : '+'}${formatBnb(payout)} BNB`}</Text>
            <Text fontSize="12px" color="textSubtle">
              {`~$${formatBnb(bnbBusdPrice.times(payout).toNumber())}`}
            </Text>
          </Box>
        </Flex>
      </StyledBetResult>
    </>
  )
}

export default BetResult
