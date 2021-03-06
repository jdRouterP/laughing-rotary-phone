import { Contract } from '@ethersproject/contracts'
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { abi as UNI_ABI } from '@uniswap/governance/build/Uni.json'
import {abi as STAKING_MULTI_REWARDS_ABI} from '../constants/abis/staking-reward-multi-reward-launch-farm.json'
import { abi as STAKING_REWARDS_ABI } from '@uniswap/liquidity-staker/build/StakingRewards.json'
import { abi as ROUTER_MANAGER_METADATA_ABI } from '../constants/abis/router-manager-metadata.json'
import { abi as STAKING_REWARDS_DUAL_FARMING_ABI } from '../constants/abis/staking-rewards-dual-farms.json'
import { abi as STAKING_REWARDS_FLORA_FARMING_ABI } from '../constants/abis/staking-rewards-flora-farms.json'
import { abi as PREDICTION_MARKET_ABI } from '../constants/abis/prediction-contract.json'
import { abi as CHAINLINK_ABI } from '../constants/abis/chainlink-contract.json'
import { abi as VAULT_ABI } from '../constants/abis/vault.json'
import { abi as DFYN_CHEST_ABI } from '../constants/abis/dfyn-chest.json'
import { abi as DFYN_FUSION_ABI } from '../constants/abis/dfyn-fusion.json'
import { abi as BYOF_FACTORY_ABI } from '../constants/abis/byof.json'
import { abi as BYOF_DUAL_FARM_ABI } from '../constants/abis/dual-farm-byof.json'
import { abi as BYOF_FLORA_FARM_ABI } from '../constants/abis/flora-farm-byof.json'
import { abi as BYOF_LAUNCH_FARM_ABI } from '../constants/abis/launch-farm-byof.json'
import { abi as MERKLE_DISTRIBUTOR_ABI } from '@uniswap/merkle-distributor/build/MerkleDistributor.json'
import { ChainId, FACTORY_ADDRESS, WETH, ROUTER_ADDRESS } from '@dfyn/sdk'
import IUniswapV2PairABI from '../constants/abis/uniswap-v2-pair.json'
import FACTORY_ABI from "../constants/abis/factory.json";
import ROUTER_ABI from "../constants/abis/uniswap-v2-router-02.json";
import MULTICALL2_ABI from '../constants/abis/multicall2.json';
import { useMemo } from 'react'
import { BLEND_ADDRESS, BYOF_FACTORY_ADDRESS, DFYN_CHEST, GOVERNANCE_ADDRESS, MERKLE_DISTRIBUTOR_ADDRESS, UNI, WALLCHAIN_ADDRESS } from '../constants'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS
} from '../constants/abis/argent-wallet-detector'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import UNISOCKS_ABI from '../constants/abis/unisocks.json'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS, MULTICALL_V2_NETWORKS } from '../constants/multicall'
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from '../constants/v1'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'
import { MULTI_TOKEN_VAULT_INTERFACE } from 'constants/abis/multiTokenVault'
import { WETH_V2 } from '../constants'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useContractArr(
  addressOrAddressMapArr: (string | undefined)[],
  ABI: any,
  withSignerIfPossible = true
): (Contract | null)[] {

  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
      return addressOrAddressMapArr?.map((addressOrAddressMap) => {
      if (!addressOrAddressMap || !ABI || !library ) return null
      try {
        return getContract(addressOrAddressMap, ABI, library, withSignerIfPossible && account ? account : undefined)
      } catch (error) {
        console.error('Failed to get contract', error)
        return null
      }
    })
  }, [addressOrAddressMapArr, ABI, library, withSignerIfPossible, account])
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false)
}

export function useFactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(chainId && FACTORY_ADDRESS[chainId], FACTORY_ABI, false);
}

export function useRouterContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(chainId && ROUTER_ADDRESS[chainId], ROUTER_ABI, true);
}



export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useV1ExchangeContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useTokenContractArr(tokenAddressArr: (string | undefined)[], withSignerIfPossible?: boolean): (Contract | null)[] {
  return useContractArr(tokenAddressArr, ERC20_ABI, withSignerIfPossible)
}

export function useBytes32TokenContractArr(
  tokenAddressArr: (string | undefined)[],
  withSignerIfPossible?: boolean
): (Contract | null)[] {
  return useContractArr(tokenAddressArr, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()

  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useWETHV2Contract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH_V2.address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.G??RLI:
      case ChainId.ROPSTEN:
      case ChainId.RINKEBY:
      case ChainId.MATIC:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}
export function useMulticallV2Contract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_V2_NETWORKS[chainId], MULTICALL2_ABI, false)
}

export function useMerkleDistributorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MERKLE_DISTRIBUTOR_ADDRESS[chainId] : undefined, MERKLE_DISTRIBUTOR_ABI, true)
}

export function useGovernanceContract(): Contract | null {
  return useContract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, true)
}

export function useUniContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? UNI[chainId].address : undefined, UNI_ABI, true)
}

export function useWallChainContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(WALLCHAIN_ADDRESS, ROUTER_MANAGER_METADATA_ABI, withSignerIfPossible)
} 

export function useDfynChestContract( withSignerIfPossible?: boolean): Contract | null {
  return useContract(DFYN_CHEST, DFYN_CHEST_ABI, withSignerIfPossible)
}
export function useDfynFusionContract( withSignerIfPossible?: boolean): Contract | null {
  return useContract(BLEND_ADDRESS, DFYN_FUSION_ABI, withSignerIfPossible)
}
export function useDfynByofContract( withSignerIfPossible?: boolean): Contract | null {
  return useContract(BYOF_FACTORY_ADDRESS, BYOF_FACTORY_ABI, withSignerIfPossible)
}


export function useBYOFDualFarmsContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, BYOF_DUAL_FARM_ABI, withSignerIfPossible)
}

export function useBYOFLaunchFarmsContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, BYOF_LAUNCH_FARM_ABI, withSignerIfPossible)
}

export function useBYOFFloraFarmsContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, BYOF_FLORA_FARM_ABI, withSignerIfPossible)
}

export function useMultiRewardStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_MULTI_REWARDS_ABI, withSignerIfPossible)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}
export function useFloraFarmsContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_FLORA_FARMING_ABI, withSignerIfPossible)
}
export function useVaultContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, VAULT_ABI, withSignerIfPossible)
}
export function useMultiTokenVaultContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, MULTI_TOKEN_VAULT_INTERFACE, withSignerIfPossible)
}
export function useDualFarmsContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_DUAL_FARMING_ABI, withSignerIfPossible)
}
export function usePredictionContract(predictionAddress: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(predictionAddress, PREDICTION_MARKET_ABI, withSignerIfPossible)
}
export function useChainlinkOracleContract(chainlinkAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(chainlinkAddress, CHAINLINK_ABI, withSignerIfPossible)
}




export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MATIC ? '0x65770b5283117639760beA3F867b69b3697a91dd' : undefined,
    UNISOCKS_ABI,
    false
  )
}
