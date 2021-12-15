import { Interface } from '@ethersproject/abi'
import { abi as STAKING_MULTI_REWARDS_ABI } from './staking-reward-multi-reward-launch-farm.json'

const STAKING_MULTI_REWARDS_INTERFACE = new Interface(STAKING_MULTI_REWARDS_ABI)

export { STAKING_MULTI_REWARDS_INTERFACE }