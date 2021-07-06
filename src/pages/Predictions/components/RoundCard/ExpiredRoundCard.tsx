import React from 'react'
import styled from 'styled-components'
import { BlockIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round, BetPosition } from 'state/prediction/types'
// import { useGetBetByRoundId } from 'state/hook'
import { RoundResult } from '../RoundResult'
// import { getPayout } from '../../helpers'
import MultiplierArrow from './MultiplierArrow'
// import Card from './Card'
import CardHeader from './CardHeader'
// import CollectWinningsOverlay from './CollectWinningsOverlay'
import CanceledRoundCard from './CanceledRoundCard'
// import { useActiveWeb3React } from 'hooks'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise } from 'components/earn/styled'

interface ExpiredRoundCardProps {
  round: Round
  betAmount?: number
  hasEnteredUp: boolean
  hasEnteredDown: boolean
  bullMultiplier: number
  bearMultiplier: number
}
const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${showBackground ? theme.black : theme.bg5} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}

    opacity: 0.7;
    transition: opacity 300ms;
  
    &:hover {
      opacity: 1;
    }
`

const ContentWrapper = styled.div`
    height: 320px;
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
`


const ExpiredRoundCard: React.FC<ExpiredRoundCardProps> = ({
  round,
  betAmount,
  hasEnteredUp,
  hasEnteredDown,
  bullMultiplier,
  bearMultiplier,
}) => {
  const { t } = useTranslation()
  // const { account } = useActiveWeb3React()
  const { endBlock, lockPrice, closePrice } = round
  const betPosition = closePrice > lockPrice ? BetPosition.BULL : BetPosition.BEAR
  // const bet = useGetBetByRoundId(account, round.id)
  // const payout = getPayout(bet)

  if (round.failed) {
    return <CanceledRoundCard round={round} />
  }

  return (
    <Wrapper showBackground={false} bgColor={'yellow'}>
      <CardBGImage desaturate />
      <CardNoise />
      <CardHeader
        status="expired"
        icon={<BlockIcon mr="4px" width="21px" color="textDisabled" />}
        title={t('Expired')}
        blockTime={endBlock}
        epoch={round.epoch}
      />
      <ContentWrapper>
        <MultiplierArrow
          betAmount={betAmount}
          multiplier={bullMultiplier}
          isActive={betPosition === BetPosition.BULL}
          hasEntered={hasEnteredUp}
        />

        <RoundResult round={round} />

        <MultiplierArrow
          betAmount={betAmount}
          multiplier={bearMultiplier}
          betPosition={BetPosition.BEAR}
          isActive={betPosition === BetPosition.BEAR}
          hasEntered={hasEnteredDown}
        />
      </ContentWrapper>
      {/* <CollectWinningsOverlay roundId={id} epoch={epoch} payout={payout} isBottom={hasEnteredDown} /> */}
    </Wrapper>
  )
}

export default ExpiredRoundCard
