import React from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { Box, Flex, Button, Link, OpenNewIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { getExplorerLink } from 'utils'
import { useGetCurrentEpoch, useGetLastOraclePrice } from 'state/hook'
import { Bet, BetPosition } from 'state/prediction/types'
import { formatToken, getMultiplier, getPayout } from 'pages/Predictions/helpers'
import { getRoundResult, Result } from 'state/prediction/hooks'
import PnlChart from './PnlChart'
import SummaryRow from './SummaryRow'
import { TYPE } from 'theme'

interface PnlTabProps {
  hasBetHistory: boolean
  bets: Bet[]
}

interface PnlCategory {
  rounds: number
  amount: number
}

interface PnlSummary {
  won: PnlCategory & { payout: number; bestRound: { id: string; payout: number; multiplier: number } }
  lost: PnlCategory
  entered: PnlCategory
}

const TREASURY_FEE = 0.03

const getNetPayout = (bet: Bet) => {
  const rawPayout = getPayout(bet)
  const fee = rawPayout * TREASURY_FEE
  return rawPayout - fee - bet.amount
}

const Divider = styled.div`

  height: 1px;
  margin: 24px auto;
  width: 100%;
`

const initialPnlSummary: PnlSummary = {
  won: {
    rounds: 0,
    amount: 0,
    payout: 0, // net payout after all deductions
    bestRound: {
      id: '0',
      payout: 0, // net payout after all deductions
      multiplier: 0,
    },
  },
  lost: {
    rounds: 0,
    amount: 0,
  },
  entered: {
    rounds: 0,
    amount: 0,
  },
}

const getPnlSummary = (bets: Bet[], currentEpoch: number): PnlSummary => {
  if (bets === undefined) {
    bets = []
  }
  return bets.reduce((summary: PnlSummary, bet) => {
    const roundResult = getRoundResult(bet, currentEpoch)
    if (roundResult === Result.WIN) {
      const payout = getNetPayout(bet)
      let { bestRound } = summary.won
      if (payout > bestRound.payout) {
        const { bullAmount, bearAmount, totalAmount } = bet.round
        const multiplier = getMultiplier(totalAmount, bet.position === BetPosition.BULL ? bullAmount : bearAmount)
        bestRound = { id: bet.round.id, payout, multiplier }
      }
      return {
        won: {
          rounds: summary.won.rounds + 1,
          amount: summary.won.amount + bet.amount,
          payout: summary.won.payout + payout,
          bestRound,
        },
        entered: {
          rounds: summary.entered.rounds + 1,
          amount: summary.entered.amount + bet.amount,
        },
        lost: summary.lost,
      }
    }
    if (roundResult === Result.LOSE) {
      return {
        lost: {
          rounds: summary.lost.rounds + 1,
          amount: summary.lost.amount + bet.amount,
        },
        entered: {
          rounds: summary.entered.rounds + 1,
          amount: summary.entered.amount + bet.amount,
        },
        won: summary.won,
      }
    }
    // Ignore Canceled and Live rounds
    return summary
  }, initialPnlSummary)
}

const PnlTab: React.FC<PnlTabProps> = ({ hasBetHistory, bets }: PnlTabProps) => {
  const { t } = useTranslation()
  const { account, chainId } = useWeb3React()
  const currentEpoch = useGetCurrentEpoch()
  // const tokenusdPrice = usePriceTokenBusd()
  const tokenusdPrice = useGetLastOraclePrice();
  const summary = getPnlSummary(bets, currentEpoch)
  const netResultAmount = summary.won.payout - summary.lost.amount
  const netResultIsPositive = netResultAmount > 0
  const avgPositionEntered = summary.entered.amount / summary.entered.rounds
  const avgTokenWonPerRound = netResultAmount / summary.entered.rounds
  const avgTokenWonIsPositive = avgTokenWonPerRound > 0

  // Guard in case user has only lost rounds
  const hasBestRound = summary.won.bestRound.payout !== 0

  return hasBetHistory ? (
    <Box p="16px">
      <TYPE.white
        fontSize="24px" color="secondary" pb="24px">
        {t('Your history')}
      </TYPE.white>
      <Flex>
        <PnlChart lost={summary.lost.rounds} won={summary.won.rounds} />
        <Flex flexDirection="column" justifyContent="center" pl="24px">
          <TYPE.white color="textSubtle">
            {t('Net results')}
          </TYPE.white>
          <TYPE.white fontSize="24px" lineHeight="1" color={netResultIsPositive ? '#29a329' : '#ff471a'}>
            {`${netResultIsPositive ? '+' : ''}${formatToken(netResultAmount)} MATIC`}
          </TYPE.white>
          <TYPE.white color="textSubtle">
            {`~$${formatToken(tokenusdPrice * (netResultAmount))}`}
          </TYPE.white>
        </Flex>
      </Flex>
      <Box pl="8px">
        <TYPE.white mt="24px" color="textSubtle">
          {t('Average return / round')}
        </TYPE.white>
        <TYPE.white color={avgTokenWonIsPositive ? '#29a329' : '#ff471a'}>
          {`${avgTokenWonIsPositive ? '+' : ''}${formatToken(avgTokenWonPerRound)} MATIC`}
        </TYPE.white>
        <TYPE.white color="textSubtle">
          {`~$${formatToken(tokenusdPrice * (avgTokenWonPerRound))}`}
        </TYPE.white>

        {hasBestRound && (
          <>
            <TYPE.white mt="16px" color="textSubtle">
              {t('Best round: #%roundId%', { roundId: summary.won.bestRound.id })}
            </TYPE.white>
            <Flex alignItems="flex-end">
              <TYPE.white color="success">{`+${formatToken(summary.won.bestRound.payout)} MATIC`}</TYPE.white>
              <TYPE.white ml="4px" color="textSubtle">
                ({summary.won.bestRound.multiplier.toFixed(2)}x)
              </TYPE.white>
            </Flex>
            <TYPE.white color="textSubtle">
              {`~$${formatToken(tokenusdPrice * (summary.won.bestRound.payout))}`}
            </TYPE.white>
          </>
        )}

        <TYPE.white mt="16px" color="textSubtle">
          {t('Average position entered / round')}
        </TYPE.white>
        <TYPE.white>{`${formatToken(avgPositionEntered)} MATIC`}</TYPE.white>
        <TYPE.white color="textSubtle">
          {`~$${formatToken(tokenusdPrice * (avgPositionEntered))}`}
        </TYPE.white>

        <Divider />

        <SummaryRow type="won" summary={summary} tokenusdPrice={tokenusdPrice} />
        <SummaryRow type="lost" summary={summary} tokenusdPrice={tokenusdPrice} />
        <SummaryRow type="entered" summary={summary} tokenusdPrice={tokenusdPrice} />

        <Flex justifyContent="center" mt="24px">
          {(chainId && account) && <Link href={`${getExplorerLink(chainId, account, "address")}#internaltx`} mb="16px" external>
            <Button mt="8px" width="100%">
              {t('View Reclaimed & Won')}
              <OpenNewIcon color="white" ml="4px" />
            </Button>
          </Link>}
        </Flex>
      </Box>
    </Box>
  ) : (
    <Box p="24px">
      <TYPE.mediumHeader size="lg" textAlign="center" mb="8px">
        {t('No prediction history available')}
      </TYPE.mediumHeader>
      <TYPE.white as="p" textAlign="center">
        {t(
          'If you are sure you should see history here, make sure you’re connected to the correct wallet and try again.',
        )}
      </TYPE.white>
    </Box>
  )
}

export default PnlTab
