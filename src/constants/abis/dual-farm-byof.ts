import { Interface } from '@ethersproject/abi'
import { abi as BYOF_DUAL_FARM} from './dual-farm-byof.json'

const BYOF_DUAL_FARM_INTERFACE = new Interface(BYOF_DUAL_FARM)

export { BYOF_DUAL_FARM_INTERFACE }