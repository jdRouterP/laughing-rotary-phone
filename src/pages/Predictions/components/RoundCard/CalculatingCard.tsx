import React from 'react'
import { CardBody, Flex, Spinner, WaitIcon, TooltipText, useTooltip, InfoIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round, BetPosition } from 'state/prediction/types'
import { useGetTotalIntervalBlocks } from 'state/hook'
import { RoundResultBox } from '../RoundResult'
import MultiplierArrow from './MultiplierArrow'
import Card from './Card'
import CardHeader from './CardHeader'

interface CalculatingCardProps {
  round: Round
}

const CalculatingCard: React.FC<CalculatingCardProps> = ({ round }) => {
  const { t } = useTranslation()
  const interval = useGetTotalIntervalBlocks()
  const estimatedEndBlock = round.startBlock + interval
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This round’s closing transaction has been submitted to the blockchain, and is awaiting confirmation.'),
    { placement: 'bottom' },
  )

  return (
    <>
      <Card>
        <CardHeader
          status="calculating"
          icon={<WaitIcon mr="4px" width="21px" />}
          title={t('Calculating')}
          epoch={round.epoch}
          blockNumber={estimatedEndBlock}
        />
        <CardBody p="16px">
          <MultiplierArrow isDisabled />
          <RoundResultBox>
            <Flex alignItems="center" justifyContent="center" flexDirection="column">
              <Spinner size={96} />
              <Flex mt="8px" ref={targetRef}>
                <TooltipText>{t('Calculating')}</TooltipText>
                <InfoIcon ml="4px" />
              </Flex>
            </Flex>
          </RoundResultBox>
          <MultiplierArrow betPosition={BetPosition.BEAR} isDisabled />
        </CardBody>
      </Card>
      {tooltipVisible && tooltip}
    </>
  )
}

export default CalculatingCard
