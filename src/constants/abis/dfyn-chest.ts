import { Interface } from '@ethersproject/abi'
import { abi as DFYN_CHEST } from './dfyn-chest.json'

const DFYN_CHEST_INTERFACE = new Interface(DFYN_CHEST)

export { DFYN_CHEST_INTERFACE }