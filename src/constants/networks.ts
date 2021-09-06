import { ChainId } from '@dfyn/sdk'

const Goerli = '/images/networks/goerli-network.jpg'
const Kovan = '/images/networks/kovan-network.jpg'
const Mainnet = '/images/networks/mainnet-network.jpg'
const OKEx = '/images/networks/okex-network.jpg'
const Polygon = '/images/networks/polygon-network.jpg'
const Rinkeby = '/images/networks/rinkeby-network.jpg'
const Ropsten = '/images/networks/ropsten-network.jpg'
const Arbitrum = '/images/networks/mainnet-network.jpg'

export const NETWORK_ICON = {
    [ChainId.MAINNET]: Mainnet,
    [ChainId.ROPSTEN]: Ropsten,
    [ChainId.RINKEBY]: Rinkeby,
    [ChainId.GÖRLI]: Goerli,
    [ChainId.KOVAN]: Kovan,
    [ChainId.MATIC]: Polygon,
    [ChainId.OKEX]: OKEx,
    [ChainId.ARBITRUM]: Arbitrum,
}

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
    [ChainId.MAINNET]: 'Ethereum',
    [ChainId.RINKEBY]: 'Rinkeby',
    [ChainId.ROPSTEN]: 'Ropsten',
    [ChainId.GÖRLI]: 'Görli',
    [ChainId.KOVAN]: 'Kovan',
    [ChainId.MATIC]: 'Polygon',
    [ChainId.OKEX]: 'OKExChain',
    [ChainId.ARBITRUM]: 'Arbitrum',
}

export const RPC = {
    [ChainId.MAINNET]:
        'https://eth-mainnet.alchemyapi.io/v2/q1gSNoSMEzJms47Qn93f9-9Xg5clkmEC',
    [ChainId.ROPSTEN]:
        'https://eth-ropsten.alchemyapi.io/v2/cidKix2Xr-snU3f6f6Zjq_rYdalKKHmW',
    [ChainId.RINKEBY]:
        'https://eth-rinkeby.alchemyapi.io/v2/XVLwDlhGP6ApBXFz_lfv0aZ6VmurWhYD',
    [ChainId.GÖRLI]:
        'https://eth-goerli.alchemyapi.io/v2/Dkk5d02QjttYEoGmhZnJG37rKt8Yl3Im',
    [ChainId.KOVAN]:
        'https://eth-kovan.alchemyapi.io/v2/6OVAa_B_rypWWl9HqtiYK26IRxXiYqER',
    [ChainId.MATIC]: 'https://rpc-dfyn-mainnet.maticvigil.com/v1/4317c87b41879d5bfafb90308aee37d202f8ddf7',
    [ChainId.OKEX]: 'https://exchainrpc.okex.org',
    [ChainId.ARBITRUM]: 'https://arb1.arbitrum.io/rpc',
}

export const SUPPORTED_NETWORKS: {
    [chainId in ChainId]?: {
        chainId: string
        chainName: string
        nativeCurrency: {
            name: string
            symbol: string
            decimals: number
        }
        rpcUrls: string[]
        blockExplorerUrls: string[]
    }
} = {
    [ChainId.MAINNET]: {
        chainId: '0x1',
        chainName: 'Ethereum',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://mainnet.infura.io/v3'],
        blockExplorerUrls: ['https://etherscan.com'],
    },
    [ChainId.MATIC]: {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: {
            name: 'Matic',
            symbol: 'MATIC',
            decimals: 18,
        },
        rpcUrls: ['https://rpc-mainnet.maticvigil.com'], //['https://matic-mainnet.chainstacklabs.com/'],
        blockExplorerUrls: ['https://polygonscan.com/'],
    },
    [ChainId.OKEX]: {
        chainId: '0x42',
        chainName: 'OKExChain',
        nativeCurrency: {
            name: 'OKEx Token',
            symbol: 'OKT',
            decimals: 18,
        },
        rpcUrls: ['https://exchainrpc.okex.org'],
        blockExplorerUrls: ['https://www.oklink.com/okexchain'],
    },
    [ChainId.ARBITRUM]: {
        chainId: '0xA4B1',
        chainName: 'Arbitrum One',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/'],
    }
}

export const HEADER_ACCESS = {
    vault: [ChainId.MATIC],
    charts: [ChainId.MATIC, ChainId.OKEX],
    farms: [ChainId.MATIC],
    prediction: [ChainId.MATIC],
    gaslessMode: [ChainId.MATIC]
}

export const CHART_URL_PREFIX = {
    [ChainId.MAINNET]: "info",
    [ChainId.ROPSTEN]: "info",
    [ChainId.RINKEBY]: "info",
    [ChainId.GÖRLI]: "info",
    [ChainId.KOVAN]: "info",
    [ChainId.MATIC]: "info",
    [ChainId.ARBITRUM]: "info",
    [ChainId.OKEX]: "info-okex"
}

export const GASLESS_SUPPORT = [ChainId.MATIC]