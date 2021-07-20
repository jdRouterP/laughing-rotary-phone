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
// import { CardBGImage, CardNoise } from 'components/earn/styled'

interface ExpiredRoundCardProps {
  round: Round
  betAmount?: number
  hasEnteredUp: boolean
  hasEnteredDown: boolean
  bullMultiplier: number
  bearMultiplier: number
}


const CardHeaderBlock = styled.div<{ isPositionUp: boolean}>`
  opacity: 0.5;
  margin-top: 23px;
  width: 206px;
  padding-top: 30px;
  padding-bottom: 41px;
  background: ${({isPositionUp}) => isPositionUp ? '#29a329' : 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));'};
  border-radius: 10px 10px 0px 0px; 
`
const CardFooterBlock = styled.div<{isPositionUp: boolean}>`
  opacity: 0.5;
  margin-bottom: 23px;
  width: 206px;
  padding-top: 37px;
  padding-bottom: 30px;
  background: ${({isPositionUp}) => isPositionUp ? 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))' : '#ff471a'};
  border-radius: 0px 0px 10px 10px;
`

const Wrapper = styled(AutoColumn) <{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: linear-gradient(180deg, #2D3646 0%, #2C2F35 216.76%);
  opacity: 0.7;
  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
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
  const isPositionUp = betPosition === BetPosition.BULL
  // const bet = useGetBetByRoundId(account, round.id)
  // const payout = getPayout(bet)

  if (round.failed) {
    return <CanceledRoundCard round={round} />
  }

  return (
    <Wrapper showBackground={false} bgColor={'yellow'}>
      {/* <CardBGImage desaturate />
      <CardNoise /> */}
        <CardHeader
          status="expired"
          icon={<BlockIcon mr="4px" width="21px" color="textDisabled" />}
          title={t('Expired')}
          blockTime={endBlock}
          epoch={round.epoch}
        />
      <ContentWrapper>
        <CardHeaderBlock isPositionUp={isPositionUp}>
          <MultiplierArrow
            betAmount={betAmount}
            multiplier={bullMultiplier}
            isActive={betPosition === BetPosition.BULL}
            hasEntered={hasEnteredUp}
          />
        </CardHeaderBlock>
        
        <RoundResult round={round} />

        <CardFooterBlock isPositionUp={isPositionUp}>
          <MultiplierArrow
            betAmount={betAmount}
            multiplier={bearMultiplier}
            betPosition={BetPosition.BEAR}
            isActive={betPosition === BetPosition.BEAR}
            hasEntered={hasEnteredDown}
          />
        </CardFooterBlock>
        
      </ContentWrapper>
      {/* <CollectWinningsOverlay roundId={id} epoch={epoch} payout={payout} isBottom={hasEnteredDown} /> */}
    </Wrapper>
  )
}

export default ExpiredRoundCard
