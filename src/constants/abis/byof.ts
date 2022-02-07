import { Interface } from '@ethersproject/abi'
import { abi as BYOF_FACTORY} from './byof.json'

const BYOF_FACTORY_INTERFACE = new Interface(BYOF_FACTORY)

export { BYOF_FACTORY_INTERFACE }