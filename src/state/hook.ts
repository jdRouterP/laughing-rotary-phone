import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { orderBy } from 'lodash'
import { getCanClaim } from './prediction/hooks'
import BigNumber from 'bignumber.js'

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

export const useGetIntervalBlocks = () => {
    return useSelector((state: AppState) => state.predictions.intervalBlocks)
}

export const useGetBufferBlocks = () => {
    return useSelector((state: AppState) => state.predictions.bufferBlocks)
}

export const useInitialBlock = () => {
    return useSelector((state: AppState) => state.block.initialBlock)
}

export const useGetTotalIntervalBlocks = () => {
    const intervalBlocks = useGetIntervalBlocks()
    const bufferBlocks = useGetBufferBlocks()
    return intervalBlocks + bufferBlocks
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

export const useGetMinBetAmount = () => {
    const minBetAmount = useSelector((state: AppState) => state.predictions.minBetAmount)
    return useMemo(() => new BigNumber(minBetAmount), [minBetAmount])
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

export const useGetLastOraclePrice = (): BigNumber => {
    const lastOraclePrice = useSelector((state: AppState) => state.predictions.lastOraclePrice)
    return new BigNumber(lastOraclePrice)
}
