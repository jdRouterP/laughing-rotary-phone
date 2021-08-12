import { useEffect, useContext } from 'react'
import { useWeb3React } from '@web3-react/core'
import usePrevious from 'hooks/usePrevious'
import { useDispatch } from 'react-redux'
import { useGetCurrentEpoch, useGetSortedRounds } from 'state/hook'
import { fetchCurrentBets } from 'state/prediction/reducer'
import useSwiper from './useSwiper'
import { GraphContext } from '../PredictionDesktop'

/**
 * Hooks for actions to be performed when the round changes
 */
const useOnNextRound = () => {
  const GraphValue = useContext(GraphContext)
  
  const currentEpoch = useGetCurrentEpoch()
  const rounds = useGetSortedRounds()
  const { account } = useWeb3React()
  const previousEpoch = usePrevious(currentEpoch)
  const { swiper } = useSwiper()
  const dispatch = useDispatch()

  useEffect(() => {
    if (swiper && currentEpoch !== undefined && previousEpoch !== undefined && currentEpoch !== previousEpoch) {
      const currentEpochIndex = rounds.findIndex((round) => round.epoch === currentEpoch)


      // Fetch data on current unclaimed bets
      if (account) dispatch(fetchCurrentBets({GraphValue, account, roundIds: rounds.map((round) => round.id) }))

      // Slide to the current LIVE round which is always the one before the current round
      swiper.slideTo(currentEpochIndex - 1)
      swiper.update()
    }
  }, [previousEpoch, currentEpoch, rounds, swiper, account, dispatch, GraphValue])
}

export default useOnNextRound
