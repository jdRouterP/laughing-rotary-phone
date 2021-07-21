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
        <TYPE.white as="p" color="failure" mb="24px">
          {t(
            'This round was automatically canceled due to an error. If you entered a position, please reclaim your funds below.',
          )}
        </TYPE.white>
      )}
      {result !== Result.LIVE && <BetResult bet={bet} result={result} />}
      <TYPE.mediumHeader mb="10px" ml="5px">{t('Round History')}</TYPE.mediumHeader>
      <TYPE.white color=''>
        <RoundResult round={bet.round} mb="24px">
          <PayoutRow positionLabel={t('BULL')} multiplier={bullMultiplier} amount={bullAmount} />
          <PayoutRow positionLabel={t('BEAR')} multiplier={bearMultiplier} amount={bearAmount} />
        </RoundResult>
      </TYPE.white>
      {/* <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <TYPE.white>{t('Opening Block')}</TYPE.white>
        <TYPE.white>{bet.round.lockBlock}</TYPE.white>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <TYPE.white>{t('Closing Block')}</TYPE.white>

        <TYPE.white>{bet.round.endBlock}</TYPE.white>
      
      </Flex> */}
    </StyledBetDetails>
  )
}

export default BetDetails
