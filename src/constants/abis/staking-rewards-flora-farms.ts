import { Interface } from '@ethersproject/abi'
import { abi as STAKING_REWARDS_FLORA_FARMS_ABI } from './staking-rewards-flora-farms.json'
import { abi as STAKING_REWARDS_FLORA_FARMS_FACTORY_ABI } from './staking-rewards-flora-farms-factory.json'

const STAKING_REWARDS_FLORA_FARMS_INTERFACE = new Interface(STAKING_REWARDS_FLORA_FARMS_ABI)

const STAKING_REWARDS_FLORA_FARMS_FACTORY_INTERFACE = new Interface(STAKING_REWARDS_FLORA_FARMS_FACTORY_ABI)

export { STAKING_REWARDS_FLORA_FARMS_FACTORY_INTERFACE, STAKING_REWARDS_FLORA_FARMS_INTERFACE }
