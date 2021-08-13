import React from 'react'
import styled from 'styled-components'
// import { useWeb3React } from '@web3-react/core'
import { Box, Flex } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { useGetCurrentEpoch, useGetLastOraclePrice, useGetRewardRate } from 'state/hook'
import { Bet, BetPosition } from 'state/prediction/types'
import { formatToken, getMultiplier, getNetGains } from 'pages/Predictions/helpers'

import { getRoundResult, Result } from 'state/prediction/hooks'
import PnlChart from './PnlChart'
import SummaryRow from './SummaryRow'
import { TYPE } from 'theme'
import { useIsDarkMode } from 'state/user/hooks'


const StyledBox = styled.div`
  padding: 15px;
  border: 1px solid;
  border-radius: 10px;  
`
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

// const TREASURY_FEE = 0.1

// const getNetPayout = (bet: Bet) => {
//   const rawPayout = getPayout(bet)
//   const fee = rawPayout * TREASURY_FEE
//   return rawPayout - fee - bet.amount
// }

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
    const rewardRate = useGetRewardRate()
    if (roundResult === Result.WIN) {
      const payout = getNetGains(bet, rewardRate)
      let { bestRound } = summary.won
      if (payout > bestRound.payout) {
        const { bullAmount, bearAmount, totalAmount } = bet.round
        const multiplier = getMultiplier(totalAmount, bet.position === BetPosition.BULL ? bullAmount : bearAmount, rewardRate)
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
  // const { account, chainId } = useWeb3React()
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
  const darkMode = useIsDarkMode()

  return hasBetHistory ? (
    <Box p="16px" style={{ border: "1px solid rgba(0,0,0,0.1)", background: darkMode ? "#2F303C" : "rgba(47, 48, 60, 0.10)" }}>
      <TYPE.main
        fontSize="24px" pb="24px">
        {t('Your history')}
      </TYPE.main>
      <Flex mb="35px">
        <PnlChart lost={summary.lost.rounds} won={summary.won.rounds} />
        <Flex flexDirection="column" justifyContent="center" pl="24px">
          <TYPE.main fontSize="18px" marginLeft="2px">
            {t('Net results')}
          </TYPE.main>
          <TYPE.main fontSize="17px" marginTop="11px" lineHeight="1" color={netResultIsPositive ? '#29a329' : '#ff471a'}>
            {`${netResultIsPositive ? '+' : ''}${formatToken(netResultAmount)} MATIC`}
          </TYPE.main>
          <TYPE.main marginTop="5px">
            {`~$${formatToken(tokenusdPrice * (netResultAmount))}`}
          </TYPE.main>
        </Flex>
      </Flex>
      <Box >
        <StyledBox>
          <TYPE.main mb="5px" fontWeight="600">
            {t('Average return / round')}
          </TYPE.main>
          <TYPE.main color={avgTokenWonIsPositive ? '#29a329' : '#ff471a'} font-size="14px">
            {`${avgTokenWonIsPositive ? '+' : ''}${formatToken(avgTokenWonPerRound)} MATIC`}
          </TYPE.main>
          <TYPE.main fontSize="14px">
            {`~$${formatToken(tokenusdPrice * (avgTokenWonPerRound))}`}
          </TYPE.main>

          {hasBestRound && (
            <>
              <TYPE.main mt="16px" mb="5px" fontWeight="600">
                {`Best round: #${summary.won.bestRound.id}`}
              </TYPE.main>
              <Flex alignItems="flex-end">
                <TYPE.main font-size="14px" color={'#29a329'}>{`+${formatToken(summary.won.bestRound.payout)} MATIC`}</TYPE.main>
                <TYPE.main>
                  ({summary.won.bestRound.multiplier.toFixed(2)}x)
                </TYPE.main>
              </Flex>
              <TYPE.main fontSize="14px">
                {`~$${formatToken(tokenusdPrice * (summary.won.bestRound.payout))}`}
              </TYPE.main>
            </>
          )}

          <TYPE.main mt="16px" mb="5px" fontWeight="600">
            {t('Average position entered / round')}
          </TYPE.main>
          <TYPE.main font-size="14px">{`${formatToken(avgPositionEntered)} MATIC`}</TYPE.main>
          <TYPE.main fontSize="14px">
            {`~$${formatToken(tokenusdPrice * (avgPositionEntered))}`}
          </TYPE.main>
        </StyledBox>


        <Divider />

        <SummaryRow type="won" summary={summary} tokenusdPrice={tokenusdPrice} />
        <SummaryRow type="lost" summary={summary} tokenusdPrice={tokenusdPrice} />
        <SummaryRow type="entered" summary={summary} tokenusdPrice={tokenusdPrice} />

        {/* <Flex justifyContent="center" mt="24px">
          {(chainId && account) && <Link href={`${getExplorerLink(chainId, account, "address")}#internaltx`} mb="16px" external>
            <ButtonPrimary mt="8px" width="100%">
              <ExternalLink>
                {t('View Reclaimed & Won')}
                <ExternalLinkIcon color="white" ml="4px" />
              </ExternalLink>
            </ButtonPrimary>
          </Link>}
        </Flex> */}
      </Box>
    </Box>
  ) : (
    <Box p="24px">
      <TYPE.largeHeader textAlign="center">
        {t('No prediction history available')}
      </TYPE.largeHeader>
      <TYPE.main as="p" textAlign="center">
        {t(
          'If you are sure you should see history here, make sure you’re connected to the correct wallet and try again.',
        )}
      </TYPE.main>
    </Box>
  )
}

export default PnlTab
