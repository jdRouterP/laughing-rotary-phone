import { Interface } from '@ethersproject/abi'
import { abi as STAKING_REWARDS_DUAL_FARMS_ABI } from './staking-rewards-dual-farms.json'
import { abi as STAKING_REWARDS_DUAL_FARMS_FACTORY_ABI } from './staking-rewards-dual-farms-factory.json'

const STAKING_REWARDS_DUAL_FARMS_INTERFACE = new Interface(STAKING_REWARDS_DUAL_FARMS_ABI)

const STAKING_REWARDS_DUAL_FARMS_FACTORY_INTERFACE = new Interface(STAKING_REWARDS_DUAL_FARMS_FACTORY_ABI)

export { STAKING_REWARDS_DUAL_FARMS_INTERFACE, STAKING_REWARDS_DUAL_FARMS_FACTORY_INTERFACE }
