import { Interface } from '@ethersproject/abi'
import { abi as STAKING_REWARDS_BASIC_FARMS_ABI } from './staking-rewards-basic-farms.json'
import { abi as STAKING_REWARDS_BASIC_FARMS_FACTORY_ABI } from './staking-rewards-basic-farms-factory.json'

const STAKING_REWARDS_BASIC_FARMS_INTERFACE = new Interface(STAKING_REWARDS_BASIC_FARMS_ABI)

const STAKING_REWARDS_BASIC_FARMS_FACTORY_INTERFACE = new Interface(STAKING_REWARDS_BASIC_FARMS_FACTORY_ABI)

export { STAKING_REWARDS_BASIC_FARMS_INTERFACE, STAKING_REWARDS_BASIC_FARMS_FACTORY_INTERFACE }
