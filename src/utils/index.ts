import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import IUniswapV2Router02ABI from "../constants/abis/uniswap-v2-router-02.json";
import { ChainId, JSBI, Percent, Token, CurrencyAmount, Currency, ROUTER_ADDRESS } from '@dfyn/sdk'
import { TokenAddressMap } from '../state/lists/hooks'
import { PREDICTION_ADDRESS } from '../constants'


// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const explorerConfig = {
  etherscan: (
    chainName: string,
    data: string,
    type: "transaction" | "token" | "address" | "block"
  ) => {
    const prefix = `https://${chainName ? `${chainName}.` : ""}etherscan.io`;
    switch (type) {
      case "transaction":
        return `${prefix}/tx/${data}`;
      default:
        return `${prefix}/${type}/${data}`;
    }
  },
  matic: (
    chainName: string,
    data: string,
    type: "transaction" | "token" | "address" | "block"
  ) => {
    // const prefix = `https://explorer-${chainName}.maticvigil.com`
    const prefix = "https://polygonscan.com";
    switch (type) {
      case "transaction":
        return `${prefix}/tx/${data}`;
      case "token":
        return `${prefix}/tokens/${data}`;
      default:
        return `${prefix}/${type}/${data}`;
    }
  },
  okex: (
    chainName = "",
    data: string,
    type: "transaction" | "token" | "address" | "block"
  ) => {
    const prefix = "https://www.oklink.com/okexchain";
    switch (type) {
      case "transaction":
        return `${prefix}/tx/${data}`;
      case "token":
        return `${prefix}/tokenAddr/${data}`;
      default:
        return `${prefix}/${type}/${data}`;
    }
  },
  arbitrum: (
    chainName = "",
    data: string,
    type: "transaction" | "token" | "address" | "block"
  ) => {
    const prefix = "https://www.oklink.com/okexchain";
    switch (type) {
      case "transaction":
        return `${prefix}/tx/${data}`;
      case "token":
        return `${prefix}/tokenAddr/${data}`;
      default:
        return `${prefix}/${type}/${data}`;
    }
  },
};

interface ChainObject {
  [chainId: number]: {
    chainName: string;
    builder: (
      chainName: string,
      data: string,
      type: "transaction" | "token" | "address" | "block"
    ) => string;
  };
}

const chains: ChainObject = {
  [ChainId.MAINNET]: {
    chainName: "",
    builder: explorerConfig.etherscan,
  },
  [ChainId.ROPSTEN]: {
    chainName: "ropsten",
    builder: explorerConfig.etherscan,
  },
  [ChainId.RINKEBY]: {
    chainName: "rinkeby",
    builder: explorerConfig.etherscan,
  },
  [ChainId.GÖRLI]: {
    chainName: "goerli",
    builder: explorerConfig.etherscan,
  },
  [ChainId.KOVAN]: {
    chainName: "kovan",
    builder: explorerConfig.etherscan,
  },
  [ChainId.MATIC]: {
    chainName: "mainnet",
    builder: explorerConfig.matic,
  },
  [ChainId.OKEX]: {
    chainName: "",
    builder: explorerConfig.okex,
  },
  [ChainId.ARBITRUM]: {
    chainName: "",
    builder: explorerConfig.arbitrum,
  },
};

export function getExplorerLink(
  chainId: ChainId,
  data: string,
  type: "transaction" | "token" | "address" | "block"
): string {
  const chain = chains[chainId];
  return chain.builder(chain.chainName, data, type);
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function getRouterAddress(chainId?: ChainId) {
  if (!chainId) {
    throw Error(`Undefined 'chainId' parameter '${chainId}'.`);
  }
  return ROUTER_ADDRESS[chainId];
}


// account is optional
export function getRouterContract(chainId: number, library: Web3Provider, account?: string): Contract {
  return getContract(getRouterAddress(chainId), IUniswapV2Router02ABI, library, account)
}
export function getPredictionContract(_: number, library: Web3Provider, account?: string): Contract {
  return getContract(PREDICTION_ADDRESS, IUniswapV2Router02ABI, library, account)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency, chainId = ChainId.MATIC): boolean {
  if (currency === Currency.getNativeCurrency(chainId)) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}
