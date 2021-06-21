//@ts-nocheck
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
import BigNumber from 'bignumber.js'
import { useGetMinBetAmount } from 'state/hook'
import { useTranslation } from 'react-i18next'
import { usePredictionContract } from 'hooks/useContract'
import { useTokenBalance } from 'state/wallet/hooks'
import { BetPosition } from 'state/prediction/types'
import { getDecimalAmount } from 'utils/formatBalance'
import { BIG_TEN } from 'utils/bigNumber'
import PositionTag from '../PositionTag'
import { getBnbAmount } from '../../helpers'
import useSwiper from '../../hooks/useSwiper'
import FlexRow from '../FlexRow'
import Card from './Card'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useActiveWeb3React } from 'hooks'
import { WETH } from '@uniswap/sdk'

interface SetPositionCardProps {
  position: BetPosition
  togglePosition: () => void
  onBack: () => void
  onSuccess: (decimalValue: BigNumber, hash: string) => Promise<void>
}

// // /!\ TEMPORARY /!\
// // Set default gasPrice (6 gwei) when calling BetBull/BetBear before new contract is released fixing this 'issue'.
// // TODO: Remove on beta-v2 smart contract release.
// const gasPrice = new BigNumber(6).times(BIG_TEN.pow(BIG_NINE)).toString()

const dust = new BigNumber(0.01).times(BIG_TEN.pow(18))
const percentShortcuts = [10, 25, 50, 75]

const getButtonProps = (value: BigNumber, balance: BigNumber, minBetAmountBalance: BigNumber) => {
  const hasSufficientBalance = () => {
    if (value.gt(0)) {
      return value.lte(balance)
    }
    return balance.gt(0)
  }

  if (!hasSufficientBalance()) {
    return { key: 'Insufficient BNB balance', disabled: true }
  }

  if (value.eq(0) || value.isNaN()) {
    return { key: 'Enter an amount', disabled: true }
  }
  return { key: 'Confirm', disabled: value.lt(minBetAmountBalance) }
}

const SetPositionCard: React.FC<SetPositionCardProps> = ({ position, togglePosition, onBack, onSuccess }) => {
  const [value, setValue] = useState('')
  const [isPendingTx, setIsPendingTx] = useState(false)
  const addTransaction = useTransactionAdder()
  const { swiper } = useSwiper()
  const { account, chainId } = useActiveWeb3React()
  const [errorMessage, setErrorMessage] = useState(null)
  const balance = useTokenBalance(account ?? undefined, WETH[chainId ?? 137])
  const minBetAmount = useGetMinBetAmount()
  const { t } = useTranslation()
  const predictionsContract = usePredictionContract()

  const balanceDisplay = useMemo(() => {
    return getBnbAmount(balance).toString()
  }, [balance])
  const maxBalance = useMemo(() => {
    return getBnbAmount(balance.gt(dust) ? balance.minus(dust) : balance)
  }, [balance])
  const minBetAmountBalance = useMemo(() => {
    return getBnbAmount(minBetAmount)
  }, [minBetAmount])

  const valueAsBn = new BigNumber(value)

  const showFieldWarning = account && valueAsBn.gt(0) && errorMessage !== null

  const [percent, setPercent] = useState(0)

  const handleInputChange = (input: string) => {
    if (input) {
      const percentage = Math.floor(new BigNumber(input).dividedBy(maxBalance).multipliedBy(100).toNumber())
      setPercent(Math.min(percentage, 100))
    } else {
      setPercent(0)
    }
    setValue(input)
  }

  const handlePercentChange = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      const percentageOfStakingMax = maxBalance.dividedBy(100).multipliedBy(sliderPercent)
      setValue(percentageOfStakingMax.toFormat(18))
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
    const decimalValue = getDecimalAmount(valueAsBn)
    setIsPendingTx(true);
    predictionsContract?.[betMethod](decimalValue, { gasLimit: 350000 })
      .then(async (response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Winnings collected!`
        })
        setIsPendingTx(false)
        if (onSuccess) {
          onSuccess(decimalValue, response.hash)
        }
      })
      .catch((error: any) => {
        setIsPendingTx(false)
        console.error(error)
      })

  }

  // Warnings
  useEffect(() => {
    const bnValue = new BigNumber(value)
    const hasSufficientBalance = bnValue.gt(0) && bnValue.lte(maxBalance)

    if (!hasSufficientBalance) {
      setErrorMessage({ key: 'Insufficient BNB balance' })
    } else if (bnValue.gt(0) && bnValue.lt(minBetAmountBalance)) {
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
