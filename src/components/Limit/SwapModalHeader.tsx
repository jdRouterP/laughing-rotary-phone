import React, { useContext} from 'react'
import { ArrowDown} from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { isAddress, shortenAddress } from '../../utils'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { TruncatedText } from 'components/swap/styleds'
import { CurrencyAmount } from '@dfyn/sdk'
import { Field } from 'state/swap/actions'
import { useDerivedSwapInfo } from 'state/swap/hooks'

export default function SwapModalHeader({
  recipient,
  onAcceptChanges,
  inputAmount,
  outputAmount,
  marketPrice,
  limitPrice
}: {
  recipient: string | null
  onAcceptChanges: () => void
  inputAmount: CurrencyAmount | undefined
  outputAmount: string
  marketPrice: string
  limitPrice: string
}) {
  const {
    currencies
  } = useDerivedSwapInfo()
  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
      <RowBetween align="flex-end">
        <RowFixed gap={'0px'}>
          <CurrencyLogo currency={currencies[Field.INPUT]} size={'24px'} style={{ marginRight: '12px' }} />
          <TruncatedText
            fontSize={24}
            fontWeight={500}
          >
            {inputAmount?.toExact()}
            {/* {trade.inputAmount.toSignificant(6)} */}
          </TruncatedText>
        </RowFixed>
        <RowFixed gap={'0px'}>
          <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
            {currencies[Field.INPUT]?.symbol}
          </Text>
        </RowFixed>
      </RowBetween>
      <RowFixed>
        <ArrowDown size="16" color={theme.text2} style={{ marginLeft: '4px', minWidth: '16px' }} />
      </RowFixed>
      <RowBetween align="flex-end">
        <RowFixed gap={'0px'}>
          <CurrencyLogo currency={currencies[Field.OUTPUT]} size={'24px'} style={{ marginRight: '12px' }} />
          <TruncatedText
            fontSize={24}
            fontWeight={500}
          >
            {outputAmount}
            {/* {trade.outputAmount.toSignificant(6)} */}
          </TruncatedText>
        </RowFixed>
        <RowFixed gap={'0px'}>
          <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
            {currencies[Field.OUTPUT]?.symbol}
          </Text>
        </RowFixed>
      </RowBetween>
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
        <RowBetween align="center">
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Limit Price:
            </TYPE.black>
          </RowFixed>
          <RowFixed>
            <Text fontWeight={500} fontSize={14} color={theme.text2}>
              {outputAmount && inputAmount ? <span>
                1 {currencies[Field.INPUT]?.symbol} = {limitPrice} {currencies[Field.OUTPUT]?.symbol}
              </span> : '-'}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowBetween align="center">
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Market Price:
            </TYPE.black>
          </RowFixed>
          <RowFixed>
            <Text fontWeight={500} fontSize={14} color={theme.text2}>
              {marketPrice ? <span>
                1 {currencies[Field.INPUT]?.symbol} = {marketPrice} {currencies[Field.OUTPUT]?.symbol}
              </span> : '-'}
            </Text>
          </RowFixed>
        </RowBetween>
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
