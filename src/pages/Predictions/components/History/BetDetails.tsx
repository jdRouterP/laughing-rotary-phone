import React from 'react'
import styled from 'styled-components'
import { Bet } from 'state/prediction/types'
import { useTranslation } from 'react-i18next'
import { getExplorerLink } from 'utils'
import { Flex, Text, Link, Heading } from '@pancakeswap/uikit'
import { Result } from 'state/prediction/hooks'
import { getMultiplier } from '../../helpers'
import { PayoutRow, RoundResult } from '../RoundResult'
import BetResult from './BetResult'
import { useActiveWeb3React } from 'hooks'

interface BetDetailsProps {
  bet: Bet
  result: Result
}

const StyledBetDetails = styled.div`

  padding: 24px;
`

const BetDetails: React.FC<BetDetailsProps> = ({ bet, result }) => {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const { totalAmount, bullAmount, bearAmount } = bet.round
  const bullMultiplier = getMultiplier(totalAmount, bullAmount)
  const bearMultiplier = getMultiplier(totalAmount, bearAmount)

  return (
    <StyledBetDetails>
      {result === Result.CANCELED && (
        <Text as="p" color="failure" mb="24px">
          {t(
            'This round was automatically canceled due to an error. If you entered a position, please reclaim your funds below.',
          )}
        </Text>
      )}
      {result !== Result.LIVE && <BetResult bet={bet} result={result} />}
      <Heading mb="8px">{t('Round History')}</Heading>
      <RoundResult round={bet.round} mb="24px">
        <PayoutRow positionLabel={t('BULL')} multiplier={bullMultiplier} amount={bullAmount} />
        <PayoutRow positionLabel={t('BEAR')} multiplier={bearMultiplier} amount={bearAmount} />
      </RoundResult>
      <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <Text>{t('Opening Block')}</Text>
        {chainId && <Link href={getExplorerLink(chainId, bet.round.lockBlock1.toString(), "block")} external>
          {bet.round.lockBlock1}
        </Link>}
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <Text>{t('Closing Block')}</Text>
        {chainId && <Link href={getExplorerLink(chainId, bet.round.endBlock1.toString(), "block")} external>
          {bet.round.endBlock1}
        </Link>}
      </Flex>
    </StyledBetDetails>
  )
}

export default BetDetails
