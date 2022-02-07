import { Interface } from '@ethersproject/abi'
import { abi as BYOF_LAUNCH_FARM} from './launch-farm-byof.json'

const BYOF_LAUNCH_FARM_INTERFACE = new Interface(BYOF_LAUNCH_FARM)

export { BYOF_LAUNCH_FARM_INTERFACE }