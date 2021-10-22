import { Token, TokenAmount } from '@dfyn/sdk'
import ERC20_INTERFACE from 'constants/abis/erc20'
import { useMemo } from 'react'

import { useTokenContract } from '../hooks/useContract'
import { useMultipleContractSingleData, useSingleCallResult } from '../state/multicall/hooks'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(() => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined), [
    token,
    allowance
  ])
}

export function useTokenAllowanceArr(tokenArr: (Token | undefined)[], owner?: string, spender?: string): (TokenAmount | undefined)[] {
  // const contractArr = useContractArr(tokenArr.map(token=>token?.address), false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowanceArr = useMultipleContractSingleData(tokenArr.map(token=>token?.address),ERC20_INTERFACE, 'allowance', inputs).map(i=>i.result)

  const modAllowanceArr: string[]=allowanceArr.map(allowance=>allowance?allowance.toString():"0")

  return useMemo(
    () => (tokenArr.map((token,i)=>token && allowanceArr[i] ? new TokenAmount(token, modAllowanceArr[i]) : undefined)),
    [tokenArr, allowanceArr, modAllowanceArr]
  )
}
