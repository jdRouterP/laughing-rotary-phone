import { Interface } from '@ethersproject/abi'
import { abi as BYOF_FLORA_FARM} from './flora-farm-byof.json'

const BYOF_FLORA_FARM_INTERFACE = new Interface(BYOF_FLORA_FARM)

export { BYOF_FLORA_FARM_INTERFACE }