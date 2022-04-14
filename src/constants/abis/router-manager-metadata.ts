import { Interface } from '@ethersproject/abi'
import { abi as ROUTER_MANAGER_METADATA} from './router-manager-metadata.json'

const ROUTER_MANAGER_METADATA_INTERFACE = new Interface(ROUTER_MANAGER_METADATA)

export { ROUTER_MANAGER_METADATA_INTERFACE }