import { NETWORK_LABEL } from '../../constants/networks'
import NetworkModel from '../NetworkModal'
import React from 'react'
import { useActiveWeb3React } from '../../hooks'


function Web3Network(): JSX.Element | null {
    const { chainId } = useActiveWeb3React()

    if (!chainId) return null

    return (
        <>
            {NETWORK_LABEL[chainId]}
            <NetworkModel />
        </>
    )
}

export default Web3Network