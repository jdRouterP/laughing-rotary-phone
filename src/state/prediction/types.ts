// Predictions

import { JSBI } from "@dfyn/sdk";

export enum BetPosition {
    BULL = 'Bull',
    BEAR = 'Bear',
    HOUSE = 'House',
}

export enum PredictionStatus {
    INITIAL = 'initial',
    LIVE = 'live',
    PAUSED = 'paused',
    ERROR = 'error',
}

export interface Round {
    id: string
    epoch: number
    failed?: boolean
    startBlock: number
    startAt: number
    lockAt: number
    lockBlock: number
    lockPrice: number
    endBlock: number
    closePrice: number
    totalBets: number
    totalAmount: number
    bullBets: number
    bearBets: number
    bearAmount: number
    bullAmount: number
    position: BetPosition
    bets?: Bet[]
}

export interface Market {
    id: string
    paused: boolean
    epoch: number
}

export interface Bet {
    id?: string
    hash?: string
    amount: number
    position: BetPosition
    claimed: boolean
    claimedHash: string | null
    user?: PredictionUser
    round: Round
}

export interface PredictionUser {
    id: string
    address: string
    block1: number
    totalBets: number
    totalBNB: number
}

export interface RoundData {
    [key: string]: Round
}

export interface HistoryData {
    [key: string]: Bet[]
}

export interface BetData {
    [key: string]: {
        [key: string]: Bet
    }
}

export enum HistoryFilter {
    ALL = 'all',
    COLLECTED = 'collected',
    UNCOLLECTED = 'uncollected',
}

export interface PredictionsState {
    status: PredictionStatus
    isLoading: boolean
    isHistoryPaneOpen: boolean
    isChartPaneOpen: boolean
    isFetchingHistory: boolean
    historyFilter: HistoryFilter
    currentEpoch: number
    currentRoundStartBlockNumber: number
    currentRoundStartTime: number
    interval: number
    buffer: number
    minBetAmount: JSBI
    rewardRate: number
    lastOraclePrice: string
    rounds: RoundData
    history: HistoryData
    bets: BetData
}
