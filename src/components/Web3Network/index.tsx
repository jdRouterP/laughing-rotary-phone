import { NETWORK_LABEL } from '../../constants/networks'
import NetworkModel from '../NetworkModal'
import React from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useNetworkModalToggle } from '../../state/application/hooks'

function Web3Network(): JSX.Element | null {
    const { chainId } = useActiveWeb3React()

    const toggleNetworkModal = useNetworkModalToggle()

    if (!chainId) return null

    return (
        <div onClick={() => toggleNetworkModal()}>
            {NETWORK_LABEL[chainId]}
            <NetworkModel />
        </div>
    )
}

export default Web3Network