import { ChainId, JSBI, Percent, Token, WETH } from '@dfyn/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import usdcABI from "./abis/usdc.json"
import tokenABI from "./abis/token.json"

import { fortmatic, injected, portis, walletconnect, walletlink } from '../connectors'

export const ROUTER_ADDRESS = '0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429'
export const PREDICTION_ADDRESS = '0x150B4fD25c7c0c65301e86B599822f2feeCC29E7'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export { PRELOADED_PROPOSALS } from './proposals'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

//Chainlink price feed
export const MATIC_USD = new Token(ChainId.MATIC, '0x0000000000000000000000000000000000000000', 8, 'MATIC', 'MATIC');

export const EMPTY = new Token(ChainId.MATIC, '0x0000000000000000000000000000000000000000', 0, 'EMPTY', 'EMPTY')
export const DAI = new Token(ChainId.MATIC, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MATIC, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6, 'USDC', 'USDC')
export const USDT = new Token(ChainId.MATIC, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6, 'USDT', 'Tether USD')
export const mWETH = new Token(ChainId.MATIC, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 'ETH', 'Ether')
export const ROUTE = new Token(ChainId.MATIC, '0x16eccfdbb4ee1a85a33f3a9b21175cd7ae753db4', 18, 'ROUTE', 'Route')
// export const ROUTE = new Token(ChainId.MATIC, '0x246b774CfB1087620620dAbC1f8D46938403C487', 18, 'ROUTE', 'Route')
export const OM = new Token(ChainId.MATIC, '0xc3ec80343d2bae2f8e680fdadde7c17e71e114ea', 18, 'OM', 'Mantra Dao')
export const EASY = new Token(ChainId.MATIC, '0xdb3b3b147a030f032633f6c4bebf9a2fb5a882b5', 18, 'EASY', 'Easy')
export const RAZOR = new Token(ChainId.MATIC, '0xc91c06db0f7bffba61e2a5645cc15686f0a8c828', 18, 'RAZOR', 'Razor')
export const IGG = new Token(ChainId.MATIC, '0xe6fc6c7cb6d2c31b359a49a33ef08ab87f4de7ce', 6, 'IGG', 'IGG')
export const QUICK = new Token(ChainId.MATIC, '0x831753dd7087cac61ab5644b308642cc1c33dc13', 18, 'QUICK', 'Quick')
export const COR = new Token(ChainId.MATIC, '0x4fdce518fe527439fe76883e6b51a1c522b61b7c', 18, 'COR', 'Coreto')
export const FRONT = new Token(ChainId.MATIC, '0xa3ed22eee92a3872709823a6970069e12a4540eb', 18, 'FRONT', 'Frontier')
export const GLCH = new Token(ChainId.MATIC, '0xbe5cf150e1ff59ca7f2499eaa13bfc40aae70e78', 18, 'GLCH', 'Glitch')
export const STR = new Token(ChainId.MATIC, '0xa79e0bfc579c709819f4a0e95d4597f03093b011', 18, 'STR', 'Stater')
export const UNN = new Token(ChainId.MATIC, '0x67480287cb3715d1d9429b38772c71d6e94c16da', 18, 'UNN', 'Union')
export const NORD = new Token(ChainId.MATIC, '0xf6f85b3f9fd581c2ee717c404f7684486f057f95', 18, 'NORD', 'Nord')
export const RAGE = new Token(ChainId.MATIC, '0x40ccd55b789fdee8d434915dc2aa6bd938506a92', 18, 'RAGE', 'Rage')
export const WMATIC = new Token(ChainId.MATIC, '0x4c28f48448720e9000907bc2611f73022fdce1fa', 18, 'WMATIC', 'WMATIC')
export const ETHER = new Token(ChainId.MATIC, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 'ETH', 'Ether')
export const WBTC = new Token(ChainId.MATIC, '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', 8, 'WBTC', 'WBTC')
export const UNI_TOKEN = new Token(ChainId.MATIC, '0xb33eaad8d922b1083446dc23f610c2567fb5180f', 18, 'UNI', 'Uniswap')
export const AAVE = new Token(ChainId.MATIC, '0xd6df932a45c0f255f85145f286ea0b292b21c90b', 18, 'AAVE', 'AAVE')
export const FISH = new Token(ChainId.MATIC, '0x3a3df212b7aa91aa0402b9035b098891d276572b', 18, 'FISH', 'Fish Token')
export const DFYN = new Token(ChainId.MATIC, '0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97', 18, 'DFYN', 'DFYN Token')
export const ZEE = new Token(ChainId.MATIC, '0xfd4959c06FbCc02250952DAEbf8e0Fb38cF9FD8C', 18, 'ZEE', 'ZeroSwapToken')
export const AURORA = new Token(ChainId.MATIC, '0x0c8c8ae8bc3a69dc8482c01ceacfb588bb516b01', 18, 'AURORA', 'Aurora Token')
export const ANY = new Token(ChainId.MATIC, '0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8', 18, 'ANY', 'Anyswap')
export const UFT = new Token(ChainId.MATIC, '0x5b4cf2c120a9702225814e18543ee658c5f8631e', 18, 'UFT', 'UniLend')
export const LUNA = new Token(ChainId.MATIC, '0x24834BBEc7E39ef42f4a75EAF8E5B6486d3F0e57', 18, 'LUNA', 'Wrapped LUNA Token')
export const UST = new Token(ChainId.MATIC, '0x692597b009d13C4049a947CAB2239b7d6517875F', 18, 'UST', 'Wrapped UST Token')
export const AGA = new Token(ChainId.MATIC, '0x033d942a6b495c4071083f4cde1f17e986fe856c', 4, 'AGA', 'AGA')
export const AGAr = new Token(ChainId.MATIC, '0xf84bd51eab957c2e7b7d646a3427c5a50848281d', 8, 'AGAr', 'AGAr')
export const ROYA = new Token(ChainId.MATIC, '0x0bD820aD2d7Ab7305b5C9538ba824C9b9bEb0561', 18, 'ROYA', 'Royale')
export const BOOTY = new Token(ChainId.MATIC, '0xd12dc5319808bb31ba95ae5764def2627d5966ce', 18, 'BOOTY', 'PirateBooty')
export const SX = new Token(ChainId.MATIC, '0x840195888Db4D6A99ED9F73FcD3B225Bb3cB1A79', 18, 'SX', 'SportX')
export const CRV = new Token(ChainId.MATIC, '0x172370d5cd63279efa6d502dab29171933a610af', 18, 'CRV', 'Curve')
export const LINK = new Token(ChainId.MATIC, '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', 18, 'LINK', 'Chain Link')
export const MATICPAD = new Token(ChainId.MATIC, '0x3BfcE6D6F0d3D3f1326d86abdbe2845b4740Dc2E', 18, 'MATPAD', 'MATICPAD')

export const COSMIC = new Token(ChainId.MATIC, '0xa5Eb60CA85898f8b26e18fF7c7E43623ccbA772C', 18, 'COSMIC', 'Cosmicswap')
export const BIFI = new Token(ChainId.MATIC, '0xfbdd194376de19a88118e84e279b977f165d01b8', 18, 'BIFI', 'beefy.finance')
export const FRM = new Token(ChainId.MATIC, '0xd99baFe5031cC8B345cb2e8c80135991F12D7130', 18, 'FRM', 'Ferrum network token')

export const EZ = new Token(ChainId.MATIC, '0x34C1b299A74588D6Abdc1b85A53345A48428a521', 18, 'EZ', 'EASY V2')
export const UFARM = new Token(ChainId.MATIC, '0xa7305ae84519ff8be02484cda45834c4e7d13dd6', 18, 'UFARM', 'Unifarm Token')
export const NWC = new Token(ChainId.MATIC, '0x968F6f898a6Df937fC1859b323aC2F14643e3fED', 18, 'NWC', 'Newscrypto')
export const mRTK = new Token(ChainId.MATIC, '0x38332D8671961aE13d0BDe040d536eB336495eEA', 18, 'mRTK', 'mRTK')

export const XUSD = new Token(ChainId.MATIC, '0x3A3e7650f8B9f667dA98F236010fBf44Ee4B2975', 18, 'xUSD', 'xDollar Stablecoin')
export const XDO = new Token(ChainId.MATIC, '0x3Dc7B06dD0B1f08ef9AcBbD2564f8605b4868EEA', 18, 'XDO', 'xDollar')
export const MIMATIC = new Token(ChainId.MATIC, '0xa3fa99a148fa48d14ed51d610c367c61876997f1', 18, 'MIMATIC', 'miMatic')

export const ICE = new Token(ChainId.MATIC, '0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef', 18, 'ICE', 'Iron Finance ICE Token')
export const TITAN = new Token(ChainId.MATIC, '0xaaa5b9e6c589642f98a1cda99b9d024b8407285a', 18, 'TITAN', 'Titan DAO Finance')

export const NEXO = new Token(ChainId.MATIC, '0x41b3966b4ff7b427969ddf5da3627d6aeae9a48e', 18, 'NEXO', 'Nexo')
export const CHART = new Token(ChainId.MATIC, '0x083c56d87ead73d6231c165ec450c6e28f3399c9', 18, 'CHART', 'ChartEx')
export const RVF = new Token(ChainId.MATIC, '0x2ce13e4199443fdfff531abb30c9b6594446bbc7', 18, 'RVF', 'Rocket Vault')

export const GAJ = new Token(ChainId.MATIC, '0xF4B0903774532AEe5ee567C02aaB681a81539e92', 18, 'GAJ', 'GAJ')
export const ELE = new Token(ChainId.MATIC, '0xAcD7B3D9c10e97d0efA418903C0c7669E702E4C0', 18, 'ELE', 'Eleven.finance')

//OKEX
export const WOKT = new Token(ChainId.OKEX, '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15', 18, 'OKT', 'Wrapped OKT')
export const DAIK = new Token(ChainId.OKEX, '0x21cde7e32a6caf4742d00d44b07279e7596d26b9', 18, 'DAIK', 'DAI')
//TEST TOKENS
export const REWARDTEST2 = new Token(ChainId.OKEX, '0x6c5e0d6e2150e7f9743fe5b9cb357e5e2da33447', 18, 'TEST2', 'Test2 Token')
export const REWARDTEST = new Token(ChainId.OKEX, '0x6c5e0d6e2150e7f9743fe5b9cb357e5e2da33447', 18, 'TEST', 'Test Token')

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const GOVERNANCE_ADDRESS = '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'

export const TIMELOCK_ADDRESS = '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'
export const CHAINLINK_ADDRESS = '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0'

export const WETH_V2 = new Token(ChainId.MATIC, '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 18, 'WMATIC', 'WMATIC')

export const GRAPH_API_PREDICTION = "https://api.thegraph.com/subgraphs/name/iamshashvat/matic-prediction"
//DFYN ADDRESS
const UNI_ADDRESS = '0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97'
//TEST TOKEN ADDRESS
// const UNI_ADDRESS = '0xD33dcD9673e1fA99F064CB4682c6299351AD771C'

export const UNI: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.MATIC]: new Token(ChainId.MATIC, UNI_ADDRESS, 18, 'DFYN', 'DFYN Token'),
  [ChainId.OKEX]: new Token(ChainId.OKEX, "0x6c5e0d6e2150e7f9743fe5b9cb357e5e2da33447", 18, 'TEST', 'TEST'),
}

export const REWARD_TOKENS: Token[] = [ROUTE, DFYN, ZEE, AURORA, ROYA, BOOTY, SX, EZ, UFARM, NWC, mRTK, XDO, FRM, RVF, CHART]

export const COMMON_CONTRACT_NAMES: { [address: string]: string } = {
  [UNI_ADDRESS]: 'DFYN',
  [GOVERNANCE_ADDRESS]: 'Governance',
  [TIMELOCK_ADDRESS]: 'Timelock'
}

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x34dCec0229FFc7900A116664FC4bEbe13a8622CD',
  [ChainId.MATIC]: '0x34dCec0229FFc7900A116664FC4bEbe13a8622CD'
}

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
  [ChainId.KOVAN]: [WETH[ChainId.KOVAN]],
  [ChainId.MATIC]: [WETH[ChainId.MATIC]],
  [ChainId.OKEX]: [WETH[ChainId.OKEX]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: [...WETH_ONLY[ChainId.MATIC], DAI, USDC, USDT, mWETH, ROUTE, AAVE, UNI_TOKEN, DFYN, WBTC, UST, LUNA, FISH, LINK, CRV, QUICK]
  // [ChainId.MATIC]: [...WETH_ONLY[ChainId.MATIC], DAI, USDC, USDT, mWETH]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MATIC]: {
  }
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: []
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: [...WETH_ONLY[ChainId.MATIC], DAI, USDC, USDT, mWETH, ROUTE, OM, EASY, IGG, RAZOR, QUICK]
  // [ChainId.MATIC]: [...WETH_ONLY[ChainId.MATIC], DAI, USDC, USDT, mWETH]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MATIC]: [
    [USDC, USDT],
    [DAI, USDT]
  ]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }
}

// Meta txn config
export const biconomyAPIKey = 'C_Or9KnXC.e31d2693-40a4-4adf-bc19-e67af30ee040';

export const META_TXN_SUPPORTED_TOKENS: any = {
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": { "abi": tokenABI },
  "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": { "abi": tokenABI },
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": { "abi": usdcABI },
  "0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c": { "abi": tokenABI },
  "0x313d009888329c9d1cf4f75ca3f32566335bd604": { "abi": tokenABI },
  "0xda537104d6a5edd53c6fbba9a898708e465260b6": { "abi": tokenABI },
  "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063": { "abi": tokenABI },
  "0xdab529f40e671a1d4bf91361c21bf9f0c9712ab7": { "abi": tokenABI },
  "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4": { "abi": tokenABI },
  "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6": { "abi": tokenABI },
  "0x71b821aa52a49f32eed535fca6eb5aa130085978": { "abi": tokenABI },
  "0x578360adf0bbb2f10ec9cec7ef89ef495511ed5f": { "abi": tokenABI },
  "0x556f501cf8a43216df5bc9cc57eb04d4ffaa9e6d": { "abi": tokenABI },
  "0xeab9cfb094db203e6035c2e7268a86debed5bd14": { "abi": tokenABI },
  "0xb33eaad8d922b1083446dc23f610c2567fb5180f": { "abi": tokenABI },
  "0x5a2fdf906ada9353ebe496fa5d351b39f8908d19": { "abi": tokenABI },
  "0xe6fc6c7cb6d2c31b359a49a33ef08ab87f4de7ce": { "abi": tokenABI },
  "0x16eccfdbb4ee1a85a33f3a9b21175cd7ae753db4": { "abi": tokenABI },
  "0x03247a4368a280bec8133300cd930a3a61d604f6": { "abi": tokenABI },
  "0x840195888db4d6a99ed9f73fcd3b225bb3cb1a79": { "abi": tokenABI },
  "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39": { "abi": tokenABI },
  "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7": { "abi": tokenABI },
  "0x462d8d82c2b2d2ddabf7f8a93928de09d47a5807": { "abi": tokenABI },
  "0x72d6066f486bd0052eefb9114b66ae40e0a6031a": { "abi": tokenABI },
  "0xc3ec80343d2bae2f8e680fdadde7c17e71e114ea": { "abi": tokenABI },
  "0xc91c06db0f7bffba61e2a5645cc15686f0a8c828": { "abi": tokenABI },
  '0x4fdce518fe527439fe76883e6b51a1c522b61b7c': { "abi": tokenABI },
  '0xa3ed22eee92a3872709823a6970069e12a4540eb': { "abi": tokenABI },
  '0xbe5cf150e1ff59ca7f2499eaa13bfc40aae70e78': { "abi": tokenABI },
  '0xf6f85b3f9fd581c2ee717c404f7684486f057f95': { "abi": tokenABI },
  '0x40ccd55b789fdee8d434915dc2aa6bd938506a92': { "abi": tokenABI },
  '0xa79e0bfc579c709819f4a0e95d4597f03093b011': { "abi": tokenABI }
}


export const META_TXN_DISABLED = false

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)
export const BIG_INT_SECONDS = JSBI.BigInt(60)
export const BIG_INT_SECONDS_IN_DAY = JSBI.BigInt(60 * 60 * 24)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C'
]
