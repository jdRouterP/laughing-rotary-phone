import React, { useEffect, useMemo, useState } from 'react'
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
  BalanceInput,
  Slider,
  Box,
  AutoRenewIcon,
} from '@pancakeswap/uikit'
import { TransactionResponse } from '@ethersproject/providers'
import { useGetMinBetAmount } from 'state/hook'
import { useTranslation } from 'react-i18next'
import { usePredictionContract } from 'hooks/useContract'
import { useTokenBalance } from 'state/wallet/hooks'
import { BetPosition } from 'state/prediction/types'
import { getDecimalAmount } from 'utils/formatBalance'
import PositionTag from '../PositionTag'
import useSwiper from '../../hooks/useSwiper'
import FlexRow from '../FlexRow'
import Card from './Card'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import { ChainId, JSBI, TokenAmount, WETH } from '@uniswap/sdk'
import { BIG_INT_ZERO } from '../../../../constants'


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
const percentShortcuts = [10, 25, 50, 75]

const getButtonProps = (value: JSBI, balance: TokenAmount, minBetAmountBalance: TokenAmount) => {
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
  const [errorMessage, setErrorMessage] = useState<ErrorMessageType | null>(null)
  let balance = useTokenBalance(account ?? undefined, WETH[chainId ?? 137])

  const minBetAmountBalance = useGetMinBetAmount()
  const { t } = useTranslation()
  const predictionsContract = usePredictionContract()

  const balanceDisplay = useMemo(() => {
    return balance ? balance.toFixed(6) : '0';
  }, [balance])

  const maxBalance = useMemo(() => {
    if (balance === undefined) {
      return new TokenAmount(WETH[chainId ?? 137], BIG_INT_ZERO);
    }
    let dustToken = new TokenAmount(WETH[chainId ?? 137], dust);
    return balance.greaterThan(dust) ? balance.subtract(dustToken) : balance
  }, [balance, chainId])

  const valueAsBn = JSBI.BigInt(value);

  const showFieldWarning = account && JSBI.greaterThan(valueAsBn, BIG_INT_ZERO) && errorMessage !== null

  const [percent, setPercent] = useState(0)

  const handleInputChange = (input: string) => {
    if (input) {
      // const percentage = Math.floor(new BigNumber(input).dividedBy(maxBalance).multipliedBy(100).toNumber())
      const percentage = Math.floor(JSBI.toNumber(JSBI.multiply(JSBI.divide(JSBI.BigInt(input), maxBalance.raw), JSBI.BigInt(100))));
      setPercent(Math.min(percentage, 100))
    } else {
      setPercent(0)
    }
    setValue(input)
  }

  const handlePercentChange = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      const percentageOfStakingMax = maxBalance.divide(JSBI.BigInt(100)).multiply(JSBI.BigInt(sliderPercent));
      setValue(percentageOfStakingMax.toSignificant(6))
    } else {
      setValue('')
    }
    setPercent(sliderPercent)
  }

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

  const { key, disabled } = getButtonProps(valueAsBn, maxBalance, minBetAmountBalance)

  const handleEnterPosition = () => {
    const betMethod = position === BetPosition.BULL ? 'betBull' : 'betBear'
    const decimalValue = getDecimalAmount(WETH[chainId ?? 137], valueAsBn)
    setIsPendingTx(true);
    predictionsContract?.[betMethod](decimalValue, { gasLimit: 350000 })
      .then(async (response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Winnings collected!`
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

  // Warnings
  useEffect(() => {
    const bnValue = JSBI.BigInt(value);
    // const hasSufficientBalance = bnValue.gt(0) && bnValue.lte(maxBalance)
    const hasSufficientBalance = JSBI.greaterThan(bnValue, BIG_INT_ZERO) && JSBI.lessThanOrEqual(bnValue, maxBalance.raw)

    if (!hasSufficientBalance) {
      setErrorMessage({ key: 'Insufficient BNB balance' })
    } else if (JSBI.greaterThan(bnValue, BIG_INT_ZERO) && JSBI.lessThan(bnValue, minBetAmountBalance.raw)) {
      setErrorMessage({
        key: 'A minimum amount of %num% %token% is required',
        data: { num: minBetAmountBalance, token: 'BNB' },
      })
    } else {
      setErrorMessage(null)
    }
  }, [value, maxBalance, minBetAmountBalance, setErrorMessage])

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
              BNB
            </Text>
          </Flex>
        </Flex>
        <BalanceInput
          value={value}
          onUserInput={handleInputChange}
          //@ts-ignore
          isWarning={showFieldWarning}
          inputProps={{ disabled: !account || isPendingTx }}
        />
        {showFieldWarning && (
          <Text color="failure" fontSize="12px" mt="4px" textAlign="right">
            {t(errorMessage?.key, errorMessage?.data)}
          </Text>
        )}
        <Text textAlign="right" mb="16px" color="textSubtle" fontSize="12px" style={{ height: '18px' }}>
          {account && t('Balance: %balance%', { balance: balanceDisplay })}
        </Text>
        <Slider
          name="balance"
          min={0}
          max={100}
          value={percent}
          onValueChanged={handlePercentChange}
          valueLabel={account ? `${percent}%` : ''}
          step={0.1}
          disabled={!account || isPendingTx}
          mb="4px"
          className={!account || isPendingTx ? '' : 'swiper-no-swiping'}
        />
        <Flex alignItems="center" justifyContent="space-between" mb="16px">
          {percentShortcuts.map((percentShortcut) => {
            const handleClick = () => {
              handlePercentChange(percentShortcut)
            }

            return (
              <Button
                key={percentShortcut}
                scale="xs"
                variant="tertiary"
                onClick={handleClick}
                disabled={!account || isPendingTx}
                style={{ flex: 1 }}
              >
                {`${percentShortcut}%`}
              </Button>
            )
          })}
          <Button
            scale="xs"
            variant="tertiary"
            onClick={() => handlePercentChange(100)}
            disabled={!account || isPendingTx}
          >
            {t('Max')}
          </Button>
        </Flex>
        <Box mb="8px">
          {account ? (
            <Button
              width="100%"
              disabled={!account || disabled}
              onClick={handleEnterPosition}
              isLoading={isPendingTx}
              endIcon={isPendingTx ? <AutoRenewIcon color="currentColor" spin /> : null}
            >
              {t(key)}
            </Button>
          ) : (
            <div>Unlock</div>
          )}
        </Box>
        <Text as="p" fontSize="12px" lineHeight={1} color="textSubtle">
          {t('You won’t be able to remove or change your position once you enter it.')}
        </Text>
      </CardBody>
    </Card>
  )
}

export default SetPositionCard
