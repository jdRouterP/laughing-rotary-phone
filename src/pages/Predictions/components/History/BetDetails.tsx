import React from 'react'
import styled from 'styled-components'
import { Bet } from 'state/prediction/types'
import { useTranslation } from 'react-i18next'
// import { getExplorerLink } from 'utils'
import { Result } from 'state/prediction/hooks'
import { getMultiplier } from '../../helpers'
import { PayoutRow, RoundResult } from '../RoundResult'
import BetResult from './BetResult'
// import { useActiveWeb3React } from 'hooks'
import { TYPE } from 'theme'

interface BetDetailsProps {
  bet: Bet
  result: Result
}

const StyledBetDetails = styled.div`
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 0px 0px 30px 30px;
  padding: 20px;
`

const BetDetails: React.FC<BetDetailsProps> = ({ bet, result }) => {
  const { t } = useTranslation()
  // const { chainId } = useActiveWeb3React()
  const { totalAmount, bullAmount, bearAmount } = bet.round
  const bullMultiplier = getMultiplier(totalAmount, bullAmount)
  const bearMultiplier = getMultiplier(totalAmount, bearAmount)
  return (
    <StyledBetDetails>
      {result === Result.CANCELED && (
        <TYPE.main as="p" color="failure" mb="24px">
          {t(
            'This round was automatically canceled due to an error. If you entered a position, please reclaim your funds below.',
          )}
        </TYPE.main>
      )}
      {<BetResult bet={bet} result={result} />}
      <TYPE.mediumHeader mb="10px" ml="5px">{t('Round History')}</TYPE.mediumHeader>
      <TYPE.main color=''>
        <RoundResult round={bet.round} mb="24px">
          <PayoutRow positionLabel={t('BULL')} multiplier={bullMultiplier} amount={bullAmount} />
          <PayoutRow positionLabel={t('BEAR')} multiplier={bearMultiplier} amount={bearAmount} />
        </RoundResult>
      </TYPE.main>
      {/* <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <TYPE.main>{t('Opening Block')}</TYPE.main>
        <TYPE.main>{bet.round.lockBlock}</TYPE.main>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <TYPE.main>{t('Closing Block')}</TYPE.main>

        <TYPE.main>{bet.round.endBlock}</TYPE.main>
      
      </Flex> */}
    </StyledBetDetails>
  )
}

export default BetDetails
