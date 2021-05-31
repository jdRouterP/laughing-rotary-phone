import { Interface } from '@ethersproject/abi'
import { abi as MULTI_TOKEN_VAULT_ABI } from './multiTokenVault.json'

const MULTI_TOKEN_VAULT_INTERFACE = new Interface(MULTI_TOKEN_VAULT_ABI)

export { MULTI_TOKEN_VAULT_INTERFACE }
