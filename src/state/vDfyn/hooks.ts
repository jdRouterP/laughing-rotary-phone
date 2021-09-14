import { JSBI, TokenAmount } from '@dfyn/sdk'
import { useMemo } from 'react'
import { DFYN, USDC, vDFYN } from '../../constants';
import { useSingleCallResult } from 'state/multicall/hooks';
import { useDfynChestContract } from 'hooks/useContract';
import { usePair } from 'data/Reserves';
import { useTokenBalance } from 'state/wallet/hooks';

export interface DfynChestInfo {

    vDFYNtoDFYN: TokenAmount

    DFYNtovDFYN: TokenAmount

    dfynPrice: Number

    ratio: Number

    dfynBalance: TokenAmount | undefined

    totalSupply: TokenAmount
}

export function useDfynChestInfo(): DfynChestInfo {


    const inputs = ['1000000000000000000']

    const dfynChest = useDfynChestContract()
    const [, dfynUsdcPair] = usePair(DFYN, USDC);
    const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))

    const vDfynToDfyn = useSingleCallResult(dfynChest, 'vdfynForDfyn', inputs);
    const DfynTovDfyn = useSingleCallResult(dfynChest, 'dfynForVdfyn', inputs);
    // const ratio = useSingleCallResult(dfynChest, 'ratio');
    const dfynBalance = useTokenBalance(dfynChest?.address, DFYN);
    const totalSupply = useSingleCallResult(dfynChest, 'totalSupply');
    const vDfynTotalSupply = totalSupply?.result?.[0] ?? 0
    const ratio = dfynBalance ? parseFloat(dfynBalance?.raw.toString()) / vDfynTotalSupply : 0;
    return useMemo(() => {
        return (
            {
                vDFYNtoDFYN: new TokenAmount(DFYN, JSBI.BigInt(vDfynToDfyn?.result?.[0] ?? 0)),
                DFYNtovDFYN: new TokenAmount(vDFYN, JSBI.BigInt(DfynTovDfyn?.result?.[0] ?? 0)),
                dfynPrice,
                dfynBalance,
                ratio,
                totalSupply: new TokenAmount(vDFYN, JSBI.BigInt(totalSupply?.result?.[0] ?? 0))
            }
        )

    }, [vDfynToDfyn, DfynTovDfyn, dfynPrice, dfynBalance, ratio, totalSupply])

}