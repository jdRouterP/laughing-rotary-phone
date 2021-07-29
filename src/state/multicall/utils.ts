import { Contract, ethers } from 'ethers'

export type MultiCallResponse<T> = T | null

export interface Call {
    address: string // Address of the contract
    name: string // Function name on the contract (example: balanceOf)
    params?: any[] // Function params
}

interface MulticallOptions {
    requireSuccess?: boolean
}

export const multicallv2 = async <T = any>(
    contract: Contract,
    abi: any[],
    calls: Call[],
    options: MulticallOptions = { requireSuccess: true },
): Promise<MultiCallResponse<T>> => {
    const { requireSuccess } = options

    const itf = new ethers.utils.Interface(abi)

    const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
    const returnData = await contract.tryAggregate(requireSuccess, calldata)
    const res = returnData.map((call: any, i: any) => {
        const [result, data] = call
        return result ? itf.decodeFunctionResult(calls[i].name, data) : null
    })

    return res
}
