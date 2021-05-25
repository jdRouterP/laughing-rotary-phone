import { Interface } from '@ethersproject/abi'
import { abi as VAULT_ABI } from './vault.json'

const VAULT_INTERFACE = new Interface(VAULT_ABI)

export { VAULT_INTERFACE }
