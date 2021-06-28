import React from 'react'
import { CardBody, Flex, WaitIcon, TooltipText, Text, useTooltip, InfoIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { Round, BetPosition } from 'state/prediction/types'
import { useGetTotalinterval } from 'state/hook'
import { RoundResultBox } from '../RoundResult'
import MultiplierArrow from './MultiplierArrow'
import Card from './Card'
import CardHeader from './CardHeader'

interface CalculatingCardProps {
  round: Round
}

const CalculatingCard: React.FC<CalculatingCardProps> = ({ round }) => {
  const { t } = useTranslation()
  const interval = useGetTotalinterval()
  const estimatedEndTime = round.startAt + interval
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
          blockTime={estimatedEndTime}
        />
        <CardBody p="16px">
          <MultiplierArrow isDisabled />
          <RoundResultBox>
            <Flex alignItems="center" justifyContent="center" flexDirection="column">
              <Text>Loading..</Text>
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
