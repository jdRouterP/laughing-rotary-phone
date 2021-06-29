import React, { useCallback, useMemo, useState } from 'react'
import {
  ArrowBackIcon,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Button,
  BinanceIcon,
  Text,
  // Slider,
  Box,
  AutoRenewIcon,
} from '@pancakeswap/uikit'
import { TransactionResponse } from '@ethersproject/providers'
import { useGetMinBetAmount } from 'state/hook'
import { useTranslation } from 'react-i18next'
import { usePredictionContract } from 'hooks/useContract'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { BetPosition } from 'state/prediction/types'
import { getDecimalAmount } from 'utils/formatBalance'
import PositionTag from '../PositionTag'
import useSwiper from '../../hooks/useSwiper'
import FlexRow from '../FlexRow'
import Card from './Card'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import { ChainId, Currency, CurrencyAmount, JSBI } from '@dfyn/sdk'
import { BIG_INT_ZERO } from '../../../../constants'
import { useWalletModalToggle } from 'state/application/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import CurrencyInputPanel from '../../../../components/CurrencyInputPanel'
import useDerivedBettingInfo from 'pages/Predictions/hooks/useDerivedBettingInfo'


interface SetPositionCardProps {
  position: BetPosition
  togglePosition: () => void
  onBack: () => void
  onSuccess: (chainId: ChainId, decimalValue: JSBI | string | number, hash: string) => Promise<void>
}

interface ErrorMessageType {
  key: string,
  data?: Object
}

// // /!\ TEMPORARY /!\
// // Set default gasPrice (6 gwei) when calling BetBull/BetBear before new contract is released fixing this 'issue'.
// // TODO: Remove on beta-v2 smart contract release.
// const gasPrice = new BigNumber(6).times(BIG_TEN.pow(BIG_NINE)).toString()

// const dust = new BigNumber(0.01).times(BIG_TEN.pow(18))
const dust = JSBI.BigInt("10000000000000000"); //TODO
// const percentShortcuts = [10, 25, 50, 75]

const getButtonProps = (account: string | null | undefined, value: JSBI, balance: CurrencyAmount, minBetAmountBalance: CurrencyAmount) => {
  if (!account) return { key: 'Unlock your Wallet', disabled: false }
  const balanceBn = balance.raw;
  const hasSufficientBalance = () => {
    if (JSBI.greaterThan(value, BIG_INT_ZERO)) {
      return JSBI.lessThanOrEqual(value, balanceBn)
    }
    return JSBI.greaterThan(balanceBn, BIG_INT_ZERO)
  }

  if (!hasSufficientBalance()) {
    return { key: 'Insufficient balance', disabled: true }
  }

  if (JSBI.equal(value, BIG_INT_ZERO)) {
    return { key: 'Enter an amount', disabled: true }
  }
  return { key: 'Confirm', disabled: JSBI.lessThan(value, minBetAmountBalance.raw) }
}

const SetPositionCard: React.FC<SetPositionCardProps> = ({ position, togglePosition, onBack, onSuccess }) => {
  const [value, setValue] = useState('')
  const [isPendingTx, setIsPendingTx] = useState(false)
  const addTransaction = useTransactionAdder()
  const { swiper } = useSwiper()
  const { account, chainId } = useActiveWeb3React()
  const [errorMessage,] = useState<ErrorMessageType | null>(null)
  let balance = useCurrencyBalance(account ?? undefined, Currency.getNativeCurrency(chainId ?? 137))

  const minBetAmountBalance = useGetMinBetAmount()
  const { t } = useTranslation()
  const predictionsContract = usePredictionContract()

  const balanceDisplay = useMemo(() => {
    return balance ? balance.toFixed(6) : '0';
  }, [balance])

  const maxBalance = useMemo(() => {
    if (balance === undefined) {
      return new CurrencyAmount(Currency.getNativeCurrency(chainId ?? 137), BIG_INT_ZERO);
    }
    let dustToken = new CurrencyAmount(Currency.getNativeCurrency(chainId ?? 137), dust);
    return balance.greaterThan(dust) ? balance.subtract(dustToken) : balance
  }, [balance, chainId])

  const { parsedAmount } = useDerivedBettingInfo(value, Currency.getNativeCurrency(chainId ?? 137), balance, minBetAmountBalance)
  const valueAsBn = parsedAmount ?? new CurrencyAmount(Currency.getNativeCurrency(chainId ?? 137), BIG_INT_ZERO);

  const showFieldWarning = account && JSBI.greaterThan(valueAsBn.raw, BIG_INT_ZERO) && errorMessage !== null

  const [, setPercent] = useState(0)

  // const handleInputChange = (input: string) => {
  //   if (input) {
  //     // const percentage = Math.floor(new BigNumber(input).dividedBy(maxBalance).multipliedBy(100).toNumber())
  //     const percentage = Math.floor(JSBI.toNumber(JSBI.multiply(JSBI.divide(JSBI.BigInt(input), maxBalance.raw), JSBI.BigInt(100))));
  //     setPercent(Math.min(percentage, 100))
  //   } else {
  //     setPercent(0)
  //   }
  //   debugger
  //   setValue(input)
  // }

  const onUserInput = useCallback((typedValue: string) => {
    setValue(typedValue)
  }, [])
  // used for max input button
  const maxAmountInput = maxAmountSpend(maxBalance, chainId);
  const atMaxAmount = Boolean(maxAmountInput && balance?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])



  // const handlePercentChange = (sliderPercent: number) => {
  //   if (sliderPercent > 0) {
  //     const percentageOfStakingMax = maxBalance.divide(JSBI.BigInt(100)).multiply(JSBI.BigInt(sliderPercent));
  //     setValue(percentageOfStakingMax.toSignificant(6))
  //   } else {
  //     setValue('')
  //   }
  //   setPercent(sliderPercent)
  // }

  // Clear value
  const handleGoBack = () => {
    setValue('')
    setPercent(0)
    onBack()
  }

  // Disable the swiper events to avoid conflicts
  const handleMouseOver = () => {
    swiper.keyboard.disable()
    swiper.mousewheel.disable()
    swiper.detachEvents()
  }

  const handleMouseOut = () => {
    swiper.keyboard.enable()
    swiper.mousewheel.enable()
    swiper.attachEvents()
  }

  const { key, disabled } = getButtonProps(account, valueAsBn.raw, maxBalance, minBetAmountBalance)
  const toggleWalletModal = useWalletModalToggle()

  const handleEnterPosition = () => {
    if (!account) {
      toggleWalletModal()
    } else {
      const betMethod = position === BetPosition.BULL ? 'betBull' : 'betBear'
      const decimalValue = getDecimalAmount(Currency.getNativeCurrency(chainId ?? 137), valueAsBn.raw)
      setIsPendingTx(true);
      predictionsContract?.[betMethod](decimalValue, { gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Placed Bet!`
          })
          setIsPendingTx(false)
          if (onSuccess) {
            onSuccess(chainId ?? 137, decimalValue.toSignificant(6), response.hash)
          }
        })
        .catch((error: any) => {
          setIsPendingTx(false)
          console.error(error)
        })
    }

  }


  return (
    <Card onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <CardHeader p="16px">
        <Flex alignItems="center">
          <IconButton variant="text" scale="sm" onClick={handleGoBack} mr="8px">
            <ArrowBackIcon width="24px" />
          </IconButton>
          <FlexRow>
            <Heading scale="md">{t('Set Position')}</Heading>
          </FlexRow>
          <PositionTag betPosition={position} onClick={togglePosition}>
            {position === BetPosition.BULL ? t('Up') : t('Down')}
          </PositionTag>
        </Flex>
      </CardHeader>
      <CardBody py="16px">
        <Flex alignItems="center" justifyContent="space-between" mb="8px">
          <Text textAlign="right" color="textSubtle">
            {t('Commit')}:
          </Text>
          <Flex alignItems="center">
            <BinanceIcon mr="4px  " />
            <Text bold textTransform="uppercase">
              MATIC
            </Text>
          </Flex>
        </Flex>
        {/* <BalanceInput
          value={value}
          onUserInput={handleInputChange}
          //@ts-ignore
          isWarning={showFieldWarning}
          inputProps={{ disabled: !account || isPendingTx }}
        /> */}
        <CurrencyInputPanel
          value={value}
          onUserInput={onUserInput}
          onMax={handleMax}
          showMaxButton={!atMaxAmount}
          currency={Currency.getNativeCurrency(chainId ?? 137)}
          label={''}
          disableCurrencySelect={true}
          customBalanceText={'Available to bet: '}
          id="bet-token"
        />
        {showFieldWarning && (
          <Text color="failure" fontSize="12px" mt="4px" textAlign="right">
            {t(errorMessage?.key, errorMessage?.data)}
          </Text>
        )}
        {
          account && <Text textAlign="right" mb="16px" color="textSubtle" fontSize="12px" style={{ height: '18px' }}>
            {balanceDisplay}
          </Text>
        }

        <Box mb="8px">
          {
            <Button
              width="100%"
              disabled={disabled}
              onClick={handleEnterPosition}
              isLoading={isPendingTx}
              endIcon={isPendingTx ? <AutoRenewIcon color="currentColor" spin /> : null}
            >
              {t(key)}
            </Button>
          }
        </Box>
        <Text as="p" fontSize="12px" lineHeight={1} color="textSubtle">
          {t('You won’t be able to remove or change your position once you enter it.')}
        </Text>
      </CardBody>
    </Card>
  )
}

export default SetPositionCard
