import { ChainId } from '@dfyn/sdk'

const Goerli = '/images/networks/goerli-network.jpg'
const Kovan = '/images/networks/kovan-network.jpg'
const Mainnet = '/images/networks/mainnet-network.jpg'
const OKEx = '/images/networks/okex-network.jpg'
const Polygon = '/images/networks/polygon-network.jpg'
const Rinkeby = '/images/networks/rinkeby-network.jpg'
const Ropsten = '/images/networks/ropsten-network.jpg'
const Arbitrum = '/images/networks/arbitrum-network.jpg'
const Avalanche = '/images/networks/avalanche-network.jpg'
const Bsc = '/images/networks/bsc-network.jpg'
const Fantom = '/images/networks/fantom-network.jpg'
const Harmony = '/images/networks/harmonyone-network.jpg'
const xDai = '/images/networks/xdai-network.jpg'

export const NETWORK_ICON = {
  [ChainId.MAINNET]: Mainnet,
  [ChainId.ROPSTEN]: Ropsten,
  [ChainId.RINKEBY]: Rinkeby,
  [ChainId.GÖRLI]: Goerli,
  [ChainId.KOVAN]: Kovan,
  [ChainId.MATIC]: Polygon,
  [ChainId.OKEX]: OKEx,
  [ChainId.ARBITRUM]: Arbitrum,
  [ChainId.XDAI]: xDai,
  [ChainId.FANTOM]: Fantom,
  [ChainId.HARMONY]: Harmony,
  [ChainId.AVALANCHE]: Avalanche,
  [ChainId.BSC]: Bsc,
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
  [ChainId.XDAI]: 'xDAI',
  [ChainId.FANTOM]: 'Fantom',
  [ChainId.HARMONY]: 'Harmony',
  [ChainId.AVALANCHE]: 'Avalanche',
  [ChainId.BSC]: 'BSC',
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
  [ChainId.XDAI]: 'https://rpc.xdaichain.com',
  [ChainId.FANTOM]: 'https://rpc.ftm.tools',
  [ChainId.HARMONY]: 'https://api.harmony.one',
  [ChainId.AVALANCHE]: 'https://api.avax.network/ext/bc/C/rpc',
  [ChainId.BSC]: 'https://bsc-dataseed.binance.org',
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
  },
  [ChainId.FANTOM]: {
    chainId: '0xfa',
    chainName: 'Fantom',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ftm.tools'],
    blockExplorerUrls: ['https://ftmscan.com'],
  },
  [ChainId.BSC]: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  [ChainId.HARMONY]: {
    chainId: '0x63564C40',
    chainName: 'Harmony',
    nativeCurrency: {
      name: 'One Token',
      symbol: 'ONE',
      decimals: 18,
    },
    rpcUrls: [
      'https://api.harmony.one',
      'https://s1.api.harmony.one',
      'https://s2.api.harmony.one',
      'https://s3.api.harmony.one',
    ],
    blockExplorerUrls: ['https://explorer.harmony.one/'],
  },
  [ChainId.AVALANCHE]: {
    chainId: '0xA86A',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax.network'],
  },
  [ChainId.XDAI]: {
    chainId: '0x64',
    chainName: 'xDai',
    nativeCurrency: {
      name: 'xDai Token',
      symbol: 'xDai',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.xdaichain.com'],
    blockExplorerUrls: ['https://blockscout.com/poa/xdai'],
  },
}

export const SupportedChainIds = [
  250, // fantom
  137, // matic
  100, // xdai
  56, // binance smart chain
  43114, // avalanche
  1666600000, // harmony
  66, // okex
  42161, // arbitrum
]

export const HEADER_ACCESS = {
  vault: [ChainId.MATIC],
  charts: [ChainId.MATIC, ChainId.OKEX, ChainId.FANTOM],
  farms: [ChainId.MATIC, ChainId.FANTOM],
  prediction: [ChainId.MATIC],
  gaslessMode: [ChainId.MATIC],
  more: [ChainId.MATIC],
  limitOrders: [ChainId.MATIC, ChainId.BSC, ChainId.FANTOM]
}

export const FARMS_ACCESS = {
  singleAssetVault: [ChainId.MATIC],
  ecosystem: [ChainId.MATIC],
  popular: [ChainId.MATIC, ChainId.FANTOM],
  launch: [ChainId.MATIC],
  dual: [ChainId.MATIC],
  prestake: [ChainId.MATIC]
}

export const CHART_URL_PREFIX = {
  [ChainId.MAINNET]: "info",
  [ChainId.ROPSTEN]: "info",
  [ChainId.RINKEBY]: "info",
  [ChainId.GÖRLI]: "info",
  [ChainId.KOVAN]: "info",
  [ChainId.MATIC]: "info",
  [ChainId.ARBITRUM]: "info",
  [ChainId.OKEX]: "info-okex",
  [ChainId.XDAI]: 'info',
  [ChainId.FANTOM]: 'info-fantom',
  [ChainId.HARMONY]: 'info',
  [ChainId.AVALANCHE]: 'info',
  [ChainId.BSC]: 'info',
}

export const GASLESS_SUPPORT = [ChainId.MATIC]