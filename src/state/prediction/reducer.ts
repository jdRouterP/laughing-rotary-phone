import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import maxBy from 'lodash/maxBy'
import merge from 'lodash/merge'
import { Bet, HistoryFilter, Market, PredictionsState, PredictionStatus, Round } from './types'
import {
    makeFutureRoundResponse,
    transformRoundResponse,
    getBetHistory,
    transformBetResponse,
    getBet,
    makeRoundData,
} from './hooks'
import { BIG_INT_ZERO } from '../../constants'
import { JSBI } from '@dfyn/sdk'
// import { BetResponse } from './queries'

const initialState: PredictionsState = {
    status: PredictionStatus.INITIAL,
    isLoading: false,
    isHistoryPaneOpen: false,
    isChartPaneOpen: false,
    isFetchingHistory: false,
    historyFilter: HistoryFilter.ALL,
    currentEpoch: 0,
    currentRoundStartBlockNumber: 0,
    currentRoundStartTime: 0,
    interval: 300,
    buffer: 60,
    rewardRate: 95,
    minBetAmount: JSBI.BigInt('10000'),
    lastOraclePrice: BIG_INT_ZERO.toString(),
    rounds: {},
    history: {},
    bets: {},
}

// Thunks
export const fetchBet = createAsyncThunk<{ account: string; bet: Bet }, { GraphValue: string, account: string; id: string }>(
    'predictions/fetchBet',
    async ({ GraphValue, account, id }) => {
        const response = await getBet(id, GraphValue)
        const bet = transformBetResponse(response)
        return { account, bet }
    },
)

export const fetchRoundBet = createAsyncThunk<
    { account: string; roundId: string; bet: Bet },
    { account: string; roundId: string }
//@ts-ignore
>('predictions/fetchRoundBet', async ({ GraphValue, account, roundId }) => {
    const betResponses = await getBetHistory(GraphValue, {
        user: account.toLowerCase(),
        round: roundId,
    })

    // This should always return 0 or 1 bet because a user can only place
    // one bet per round
    if (betResponses && betResponses.length === 1) {
        const [betResponse] = betResponses
        return { account, roundId, bet: transformBetResponse(betResponse) }
    }

    return { account, roundId, bet: null }
})

/**
 * Used to poll the user bets of the current round cards
 */
export const fetchCurrentBets = createAsyncThunk<
    { account: string; bets: Bet[] },
    { GRAPH: string; account: string; roundIds: string[] }
>('predictions/fetchCurrentBets', async ({ GRAPH, account, roundIds }) => {
    const betResponses = await getBetHistory(GRAPH, {
        user: account.toLowerCase(),
        round_in: roundIds,
    })

    return { account, bets: betResponses.map(transformBetResponse) }
})

export const fetchHistory = createAsyncThunk<{ account: string; bets: Bet[] }, { GraphValue: string; account: string; claimed?: boolean; }>(
    'predictions/fetchHistory',
    async ({ GraphValue, account, claimed }) => {
        const response = await getBetHistory(GraphValue, {
            user: account.toLowerCase(),
            //@ts-ignore
            claimed,
        })
        const bets = response.map(transformBetResponse)
        return { account, bets }
    },
)

export const predictionsSlice = createSlice({
    name: 'predictions',
    initialState,
    reducers: {
        setPredictionStatus: (state, action: PayloadAction<PredictionStatus>) => {
            state.status = action.payload
        },
        setHistoryPaneState: (state, action: PayloadAction<boolean>) => {
            state.isHistoryPaneOpen = action.payload
            state.historyFilter = HistoryFilter.ALL
        },
        setChartPaneState: (state, action: PayloadAction<boolean>) => {
            state.isChartPaneOpen = action.payload
        },
        setHistoryFilter: (state, action: PayloadAction<HistoryFilter>) => {
            state.historyFilter = action.payload
        },
        initialize: (state, action: PayloadAction<PredictionsState>) => {
            return {
                ...state,
                ...action.payload,
            }
        },
        clearState: (state) => {
            Object.assign(state, initialState)
        },
        updateMarketData: (state, action: PayloadAction<{ rounds: Round[]; market: Market }>) => {
            const { rounds, market } = action.payload
            const newRoundData = makeRoundData(rounds)
            const incomingCurrentRound = maxBy(rounds, 'epoch')

            if (incomingCurrentRound && (state.currentEpoch !== incomingCurrentRound.epoch)) {
                // Add new round
                const newestRound = maxBy(rounds, 'epoch') as Round
                const futureRound = transformRoundResponse(
                    makeFutureRoundResponse(newestRound.epoch + 2, newestRound.startBlock + state.interval),
                )

                newRoundData[futureRound.id] = futureRound
            }

            state.currentEpoch = incomingCurrentRound?.epoch ?? 0
            state.currentRoundStartBlockNumber = incomingCurrentRound?.startBlock ?? 0
            state.currentRoundStartTime = incomingCurrentRound?.startAt ?? 0
            state.status = market.paused ? PredictionStatus.PAUSED : PredictionStatus.LIVE
            state.rounds = { ...state.rounds, ...newRoundData }
        },
        setCurrentEpoch: (state, action: PayloadAction<number>) => {
            state.currentEpoch = action.payload
        },
        markBetAsCollected: (state, action: PayloadAction<{ account: string; roundId: string }>) => {
            const { account, roundId } = action.payload
            const accountBets = state.bets[account]

            if (accountBets && accountBets[roundId]) {
                accountBets[roundId].claimed = true
            }
        },
        markPositionAsEntered: (state, action: PayloadAction<{ account: string; roundId: string; bet: Bet }>) => {
            const { account, roundId, bet } = action.payload

            state.bets = {
                ...state.bets,
                [account]: {
                    ...state.bets[account],
                    [roundId]: bet,
                },
            }
        },
        setLastOraclePrice: (state, action: PayloadAction<string>) => {
            state.lastOraclePrice = action.payload
        },
    },
    extraReducers: (builder) => {
        // Get unclaimed bets
        builder.addCase(fetchCurrentBets.fulfilled, (state, action) => {
            const { account, bets } = action.payload
            const betData = bets.reduce((accum, bet) => {
                return {
                    ...accum,
                    [bet.round.id]: bet,
                }
            }, {})

            state.bets = merge({}, state.bets, {
                [account]: betData,
            })
        })

        // Get round bet
        builder.addCase(fetchRoundBet.fulfilled, (state, action) => {
            const { account, roundId, bet } = action.payload

            if (bet) {
                state.bets = {
                    ...state.bets,
                    [account]: {
                        ...state.bets[account],
                        [roundId]: bet,
                    },
                }
            }
        })

        // Update Bet
        builder.addCase(fetchBet.fulfilled, (state, action) => {
            const { account, bet } = action.payload
            state.history[account] = [...state.history[account].filter((currentBet) => currentBet.id !== bet.id), bet]
        })

        // Show History
        builder.addCase(fetchHistory.pending, (state) => {
            state.isFetchingHistory = true
        })
        builder.addCase(fetchHistory.rejected, (state) => {
            state.isFetchingHistory = false
            state.isHistoryPaneOpen = true
        })
        builder.addCase(fetchHistory.fulfilled, (state, action) => {
            const { account, bets } = action.payload

            state.isFetchingHistory = false
            state.isHistoryPaneOpen = true
            state.history[account] = bets

            // Save any fetched bets in the "bets" namespace
            const betData = bets.reduce((accum, bet) => {
                return {
                    ...accum,
                    [bet.round.id]: bet,
                }
            }, {})

            state.bets = merge({}, state.bets, {
                [account]: betData,
            })
        })
    },
})

// Actions
export const {
    initialize,
    clearState,
    setChartPaneState,
    setCurrentEpoch,
    setHistoryFilter,
    setHistoryPaneState,
    updateMarketData,
    markBetAsCollected,
    setPredictionStatus,
    markPositionAsEntered,
    setLastOraclePrice,
} = predictionsSlice.actions

export default predictionsSlice.reducer