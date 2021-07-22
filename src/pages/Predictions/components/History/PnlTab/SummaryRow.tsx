import React from 'react'
import { Flex } from '@pancakeswap/uikit'
import { formatToken } from 'pages/Predictions/helpers'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { TYPE } from 'theme'

type SummaryType = 'won' | 'lost' | 'entered'

const BoxStyle = styled.div<{ color: string }>`
  padding: 12px 12px;
  margin-bottom: 12px;
  width:100%;
  max-width: 320px;
  border-radius: 10px;
  background: ${({ color }) => color === "#27AE60" ? 'linear-gradient(0deg, rgba(39, 174, 96, 0.1), rgba(39, 174, 96, 0.1))' : color === "#EB5757" ? 'linear-gradient(0deg, rgba(235, 87, 87, 0.1), rgba(235, 87, 87, 0.1))' : 'rgb(94 96 116 / 10%)'};
  
`

interface SummaryRowProps {
  type: SummaryType
  summary: any
  tokenusdPrice: number
}

const summaryTypeColors = {
  won: '#27AE60',
  lost: '#EB5757',
  entered: 'text2',
}

const summaryTypeSigns = {
  won: '+',
  lost: '-',
  entered: '',
}

const SummaryRow: React.FC<SummaryRowProps> = ({ type, summary, tokenusdPrice }) => {
  const { t } = useTranslation()

  const color = summaryTypeColors[type]
  const { rounds, amount } = summary[type]
  const totalRounds = summary.entered.rounds
  const roundsInPercents = ((rounds * 100) / totalRounds).toFixed(2)
  const typeTranslationKey = type.charAt(0).toUpperCase() + type.slice(1)
  const displayAmount = type === 'won' ? summary[type].payout : amount


  return (
    <>
      <BoxStyle color={color}>
        <TYPE.main>
          {t(typeTranslationKey)}
        </TYPE.main>
        <Flex>
          <Flex flex="2" flexDirection="column">
            <TYPE.main fontSize="20px" color={color}>
              {rounds} {t('Rounds').toLocaleLowerCase()}
            </TYPE.main>
            <TYPE.main fontSize="12px">
              {type === 'entered' ? t('Total').toLocaleLowerCase() : `${roundsInPercents}%`}
            </TYPE.main>
          </Flex>
          <Flex flex="3" flexDirection="column">
            <TYPE.main fontSize="20px" color={color}>
              {`${summaryTypeSigns[type]}${formatToken(displayAmount)} MATIC`}
            </TYPE.main>
            <TYPE.main fontSize="12px">
              {`~$${formatToken(tokenusdPrice * displayAmount)}`}
            </TYPE.main>
          </Flex>
        </Flex>
      </BoxStyle>

    </>
  )
}

export default SummaryRow
