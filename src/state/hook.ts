import { useEffect, useMemo } from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { orderBy } from 'lodash'
import { getCanClaim } from './prediction/hooks'
import { useActiveWeb3React } from 'hooks'
import { setBlock } from './block'
import { Currency, CurrencyAmount } from '@dfyn/sdk'

// Predictions
export const useIsHistoryPaneOpen = () => {
    return useSelector((state: AppState) => state.predictions.isHistoryPaneOpen)
}

export const useIsChartPaneOpen = () => {
    return useSelector((state: AppState) => state.predictions.isChartPaneOpen)
}

export const useGetRounds = () => {
    return useSelector((state: AppState) => state.predictions.rounds)
}

export const useGetSortedRounds = () => {
    const roundData = useGetRounds()
    return orderBy(Object.values(roundData), ['epoch'], ['asc'])
}

export const useGetCurrentEpoch = () => {
    return useSelector((state: AppState) => state.predictions.currentEpoch)
}

export const useGetinterval = () => {
    return useSelector((state: AppState) => state.predictions.interval)
}

export const useGetbuffer = () => {
    return useSelector((state: AppState) => state.predictions.buffer)
}

export const useInitialBlock = () => {
    return useSelector((state: AppState) => state.block.initialBlock)
}

export const useGetTotalinterval = () => {
    const interval = useGetinterval()
    const buffer = useGetbuffer()
    return interval + buffer
}

export const useGetRound = (id: string) => {
    const rounds = useGetRounds()
    return rounds[id]
}

export const useGetCurrentRound = () => {
    const currentEpoch = useGetCurrentEpoch()
    const rounds = useGetSortedRounds()
    return rounds.find((round) => round.epoch === currentEpoch)
}

export const useGetPredictionsStatus = () => {
    return useSelector((state: AppState) => state.predictions.status)
}

export const useGetHistoryFilter = () => {
    return useSelector((state: AppState) => state.predictions.historyFilter)
}

export const useGetCurrentRoundBlockNumber = () => {
    return useSelector((state: AppState) => state.predictions.currentRoundStartBlockNumber)
}
export const useGetCurrentRoundTime = () => {
    return useSelector((state: AppState) => state.predictions.currentRoundStartTime)
}

export const useGetMinBetAmount = () => {
    const minBetAmount = useSelector((state: AppState) => state.predictions.minBetAmount)
    const { chainId } = useActiveWeb3React()
    return useMemo(() => new CurrencyAmount(Currency.getNativeCurrency(chainId ?? 137), minBetAmount), [minBetAmount, chainId])
}

export const useGetRewardRate = () => {
    const rewardRate = useSelector((state: AppState) => state.predictions.rewardRate)
    return rewardRate / 100
}

export const useGetIsFetchingHistory = () => {
    return useSelector((state: AppState) => state.predictions.isFetchingHistory)
}

export const useGetHistory = () => {
    return useSelector((state: AppState) => state.predictions.history)
}

export const useGetHistoryByAccount = (account: string | null | undefined) => {
    const bets = useGetHistory()
    if (!account) return [];
    return bets ? bets[account] : []
}

export const useGetBetByRoundId = (account: string | undefined | null, roundId: string) => {
    const bets = useSelector((state: AppState) => state.predictions.bets)

    if (!account) {
        return null
    }
    if (!bets[account]) {
        return null
    }

    if (!bets[account][roundId]) {
        return null
    }

    return bets[account][roundId]
}

export const useBetCanClaim = (account: string, roundId: string) => {
    const bet = useGetBetByRoundId(account, roundId)

    if (!bet) {
        return false
    }

    return getCanClaim(bet)
}

export const useGetLastOraclePrice = (): number => {
    const lastOraclePrice = useSelector((state: AppState) => state.predictions.lastOraclePrice)
    return parseFloat(lastOraclePrice);
}

export const usePollBlockNumber = () => {
    const dispatch = useDispatch()
    const { library } = useActiveWeb3React()
    useEffect(() => {
        const interval = setInterval(async () => {
            const blockNumber = await library?.getBlockNumber() ?? 0;
            dispatch(setBlock(blockNumber))
        }, 6000)

        return () => clearInterval(interval)
    }, [dispatch, library])
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector