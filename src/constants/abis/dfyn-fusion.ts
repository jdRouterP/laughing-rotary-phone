import { Interface } from '@ethersproject/abi'
import { abi as DFYN_FUSION } from './dfyn-chest.json'

const DFYN_FUSION_INTERFACE = new Interface(DFYN_FUSION)

export { DFYN_FUSION_INTERFACE }