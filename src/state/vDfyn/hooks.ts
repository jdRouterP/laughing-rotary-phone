import { JSBI, TokenAmount } from '@dfyn/sdk'
import { useMemo } from 'react'
import { DFYN, USDC, vDFYN } from '../../constants';
import { useSingleCallResult } from 'state/multicall/hooks';
import { useDfynChestContract } from 'hooks/useContract';
import { usePair } from 'data/Reserves';

export interface DfynChestInfo {

    vDFYNtoDFYN: TokenAmount

    DFYNtovDFYN: TokenAmount

    dfynPrice: Number
}

export function useDfynChestInfo(): DfynChestInfo {


    const inputs = ['1000000000000000000']

    const dfynChest = useDfynChestContract()
    const [, dfynUsdcPair] = usePair(DFYN, USDC);
    const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))

    const vDfynToDfyn = useSingleCallResult(dfynChest, 'vDfynForDfyn', inputs);
    const DfynTovDfyn = useSingleCallResult(dfynChest, 'DfynForVDFYN', inputs);



    return useMemo(() => {
        return (
            {
                vDFYNtoDFYN: new TokenAmount(DFYN, JSBI.BigInt(vDfynToDfyn?.result?.[0] ?? 0)),
                DFYNtovDFYN: new TokenAmount(vDFYN, JSBI.BigInt(DfynTovDfyn?.result?.[0] ?? 0)),
                dfynPrice
            }
        )

    }, [vDfynToDfyn, DfynTovDfyn, dfynPrice])

}