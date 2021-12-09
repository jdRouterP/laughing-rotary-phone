import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@dfyn/sdk'
import { useMemo } from 'react'
import { UNI, USDC, DFYN, FISH, UFT, ANY, AGA, AGAr, NORD, BIFI, COSMIC, TITAN, ICE, WMATIC, CRV, UNI_TOKEN, AAVE, LINK, LUNA, ELE, GAJ, SILVER, SING, RAZOR, ETHER, FRM, CIRUS, MATRIX, SHIB, OAI, NIOX } from '../../constants'
import { STAKING_REWARDS_BASIC_FARMS_INTERFACE } from '../../constants/abis/staking-rewards-basic-farms'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { usePair } from 'data/Reserves'

export const STAKING_GENESIS = 1622485799

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    baseToken?: Token
    rewardToken?: Token
    startTime: number
    stakingRewardAddress: string
    version: string
  }[]
} = {
  [ChainId.MATIC]: [

    //v8
    {
      tokens: [NIOX, USDC],
      baseToken: USDC,
      rewardToken: NIOX,
      startTime: 1639063800,
      stakingRewardAddress: '0x668D23C1F253ad5b20a74aa535c82ca04c91D2D0',
      version: 'v8'
    },
    {
      tokens: [NIOX, DFYN],
      baseToken: DFYN,
      startTime: 1639063800,
      stakingRewardAddress: '0x3A2f9A7665F363d07fAf9776067b80589F2cbc78',
      version: 'v8'
    },
    {
      tokens: [USDC, ELE],
      baseToken: USDC,

      startTime: 1639063800,
      stakingRewardAddress: '0x3e9A073Cc93223a4D4fb75bC5DfC0a91D9f18Bfa',
      version: 'v8'
    },
    {
      tokens: [DFYN, FRM],
      baseToken: DFYN,
      startTime: 1639063800,
      stakingRewardAddress: '0x1d5F09c8E0dcac6355338e94936D53df35E681b4',
      version: 'v8'
    },
    {
      tokens: [RAZOR, ETHER],
      baseToken: ETHER,
      rewardToken: RAZOR,
      startTime: 1639063800,
      stakingRewardAddress: '0x1eB6110490d72d9D9463648534432555fAa11211',
      version: 'v8'
    },
    {
      tokens: [CIRUS, DFYN],
      baseToken: DFYN,
      startTime: 1639063800,
      stakingRewardAddress: '0x13A5dAE25Ca53Ba189858EF59a11Ed5a7f5Ba203',
      version: 'v8'
    },
    {
      tokens: [MATRIX, ETHER],
      baseToken: ETHER,
      startTime: 1639063800,
      rewardToken: MATRIX,
      stakingRewardAddress: '0x5C974377EB746de8b8a416171815F43889b9fcb6',
      version: 'v8'
    },
    {
      tokens: [MATRIX, DFYN],
      baseToken: DFYN,
      startTime: 1639063800,
      rewardToken: DFYN,
      stakingRewardAddress: '0x81315e2EaDe491479e7EE7617C08113e13B74D32',
      version: 'v8'
    },
    {
      tokens: [SHIB, ETHER],
      baseToken: ETHER,
      startTime: 1639063800,
      rewardToken: DFYN,
      stakingRewardAddress: '0x25bbFF88E03A61920A6caF557addD083C1a682Ee',
      version: 'v8'
    },

    {
      tokens: [OAI, DFYN],
      baseToken: DFYN,
      startTime: 1638388000,
      stakingRewardAddress: '0x18c6F325Dd741eF12594Af7046D10F721CC4e9CE',
      version: 'v8'
    },
    {
      tokens: [AGAr, AGA],
      baseToken: AGA,
      startTime: 1637845200,
      rewardToken: AGA,
      stakingRewardAddress: '0xfD2092E2ED896d010E429b4c7587f126A2b24bA3',
      version: 'v8'
    },
    {
      tokens: [DFYN, LUNA],
      baseToken: DFYN,
      startTime: 1637510700,
      stakingRewardAddress: '0x2e78bBCbAcA1a2F1BE8cb3D66452173F3eD58Ce5',
      version: 'v8'
    },

    {
      tokens: [DFYN, LINK],
      baseToken: DFYN,
      startTime: 1637510700,
      stakingRewardAddress: '0x9573E3a8A68B4D74FDC0857473E7F72100E3B9E0',
      version: 'v8'
    },
    {
      tokens: [DFYN, AAVE],
      baseToken: DFYN,
      startTime: 1637510700,
      stakingRewardAddress: '0x22d34d4e8a469A3596c4D0c80CF738E34830B723',
      version: 'v8'
    },
    {
      tokens: [DFYN, UNI_TOKEN],
      baseToken: DFYN,
      startTime: 1637510700,
      stakingRewardAddress: '0x0707eD36534856faEB500354AbFC5ecb5dA99e8d',
      version: 'v8'
    },
    {
      tokens: [DFYN, CRV],
      baseToken: DFYN,
      startTime: 1637510700,
      stakingRewardAddress: '0x73667b79c083Fbd7d86BDbFC0A83373590a4770B',
      version: 'v8'
    },



  ]
}

export const INACTIVE_STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    baseToken?: Token
    rewardToken?: Token
    startTime: number
    stakingRewardAddress: string
    version: string
  }[]
} = {
  [ChainId.MATIC]: [
    //v7
    {
      tokens: [USDC, ELE],
      baseToken: USDC,
      startTime: 1636457400,
      stakingRewardAddress: '0x7A626cC1B9ad2FE571Be7Fe9B6D87011b2d4C79a',
      version: 'v7'
    },
    {
      tokens: [DFYN, FRM],
      baseToken: DFYN,
      startTime: 1636457400,
      stakingRewardAddress: '0xAbfaB571CD23C1134D0b4a663691b93F35CE4DB0',
      version: 'v7'
    },
    {
      tokens: [DFYN, GAJ],
      baseToken: DFYN,
      startTime: 1636457400,
      stakingRewardAddress: '0x884480979471aAB4aA7266b0Eb1c4BFc3E75403E',
      version: 'v7'
    },
    {
      tokens: [RAZOR, ETHER],
      baseToken: ETHER,
      rewardToken: RAZOR,
      startTime: 1636457400,
      stakingRewardAddress: '0x31078467238C31A81d80e20419F5fc3a4a1A9FB5',
      version: 'v7'
    },
    {
      tokens: [CIRUS, DFYN],
      baseToken: DFYN,
      startTime: 1636457400,
      stakingRewardAddress: '0x65de34Ed19F9Ba1d42CF9c326b739e93Da92A62b',
      version: 'v7'
    },
    {
      tokens: [MATRIX, ETHER],
      baseToken: ETHER,
      startTime: 1636457400,
      rewardToken: MATRIX,
      stakingRewardAddress: '0x6115fFc00F9c071DD808121a9c7D3a7540D41291',
      version: 'v7'
    },
    {
      tokens: [MATRIX, DFYN],
      baseToken: DFYN,
      startTime: 1636457400,
      rewardToken: DFYN,
      stakingRewardAddress: '0x641c94FcE99715F50260c3f0b6aBD97A3577f5b3',
      version: 'v7'
    },
    {
      tokens: [SHIB, ETHER],
      baseToken: ETHER,
      startTime: 1636457400,
      rewardToken: DFYN,
      stakingRewardAddress: '0x24222908eD2bD65c27E64d3304B55C310E16A11D',
      version: 'v7'
    },

    {
      tokens: [AGAr, AGA],
      baseToken: AGA,
      startTime: 1635261300,
      rewardToken: AGA,
      stakingRewardAddress: '0x1AFE2f732FeFD79e0175826B3eA8a4aC3FC26615',
      version: 'v7'
    },
    {
      tokens: [DFYN, LUNA],
      baseToken: DFYN,
      startTime: 1634916600,
      stakingRewardAddress: '0x1a91385A5EbCe3D37F1ce390fe88479154e3F032',
      version: 'v7'
    },

    {
      tokens: [DFYN, LINK],
      baseToken: DFYN,
      startTime: 1634916600,
      stakingRewardAddress: '0x630476521B0c40f6F1330cf1d35C52bA37185691',
      version: 'v7'
    },
    {
      tokens: [DFYN, AAVE],
      baseToken: DFYN,
      startTime: 1634916600,
      stakingRewardAddress: '0xe57058893e12BBB60a33964C6083d9aF665Bf070',
      version: 'v7'
    },
    {
      tokens: [DFYN, UNI_TOKEN],
      baseToken: DFYN,
      startTime: 1634916600,
      stakingRewardAddress: '0xFE48E27F5BDd0F268Fb5Ce78F2dFF6298Ead1BaF',
      version: 'v7'
    },
    {
      tokens: [DFYN, CRV],
      baseToken: DFYN,
      startTime: 1634916600,
      stakingRewardAddress: '0xf63107FC1dB63FeC65C858804f21Ee3fdee1109d',
      version: 'v7'
    },
    //v6
    {
      tokens: [USDC, ELE],
      baseToken: USDC,
      startTime: 1634216400,
      stakingRewardAddress: '0x7cFA9e909B36a44cc6f109AD32387240d8e60037',
      version: 'v6'
    },
    {
      tokens: [DFYN, FRM],
      baseToken: DFYN,
      startTime: 1634216400,
      stakingRewardAddress: '0x7fCf079562f6BD834a164aeD53D7f1BCF6b257Fc',
      version: 'v6'
    },
    {
      tokens: [DFYN, GAJ],
      baseToken: DFYN,
      startTime: 1634216400,
      stakingRewardAddress: '0x9BfC69b95511E81f481E1d4199f93f4d7c9BB4E3',
      version: 'v6'
    },
    {
      tokens: [MATRIX, ETHER],
      baseToken: ETHER,
      startTime: 1634140800,
      rewardToken: MATRIX,
      stakingRewardAddress: '0xb7055600d57e1C9203016f527f901f09C5341d40',
      version: 'v6'
    },
    {
      tokens: [MATRIX, DFYN],
      baseToken: DFYN,
      startTime: 1634140800,
      rewardToken: DFYN,
      stakingRewardAddress: '0x760F1bE4c6F00F2661F7321d68151606Def5a59d',
      version: 'v6'
    },
    {
      tokens: [RAZOR, ETHER],
      baseToken: ETHER,
      rewardToken: RAZOR,
      startTime: 1633609800,
      stakingRewardAddress: '0x8B06E585EA290E12971B25611D62e30A6f0c5b1B',
      version: 'v6'
    },
    {
      tokens: [CIRUS, DFYN],
      baseToken: DFYN,
      startTime: 1633609800,
      stakingRewardAddress: '0x8F353598186dd488528D8C4e532DB27B304521F1',
      version: 'v6'
    },

    {
      tokens: [DFYN, WMATIC],
      baseToken: DFYN,
      startTime: 1632315600,
      stakingRewardAddress: '0xBeEf76FAfA3Afdb2F464010F3b10e893730a106B',
      version: 'v6'
    },
    {
      tokens: [DFYN, LUNA],
      baseToken: DFYN,
      startTime: 1632315600,
      stakingRewardAddress: '0x71144ACE5e9De7cEBf8b936B7996286a01109fD6',
      version: 'v6'
    },
    {
      tokens: [DFYN, LINK],
      baseToken: DFYN,
      startTime: 1632315600,
      stakingRewardAddress: '0x85C8ff38Af275475Cd7B95A26e2c41173e98a400',
      version: 'v6'
    },
    {
      tokens: [DFYN, AAVE],
      baseToken: DFYN,
      startTime: 1632315600,
      stakingRewardAddress: '0x6195fCcC14bA351841606F0f24F944AE9aDD9fB6',
      version: 'v6'
    },
    {
      tokens: [DFYN, UNI_TOKEN],
      baseToken: DFYN,
      startTime: 1632315600,
      stakingRewardAddress: '0x365745AC9a6385193BA8150196CbB02d6E409893',
      version: 'v6'
    },
    {
      tokens: [DFYN, CRV],
      baseToken: DFYN,
      startTime: 1632315600,
      stakingRewardAddress: '0xc7A399EC7Cfe5e1B728cACD742637c4e6F06C3D8',
      version: 'v6'
    },
    {
      tokens: [AGAr, AGA],
      baseToken: AGA,
      startTime: 1632485600,
      rewardToken: AGA,
      stakingRewardAddress: '0xF200BFb1cA8a422F2F19c9E63A61c8E53fe7c78c',
      version: 'v6'
    },
    //v5
    {
      tokens: [USDC, ELE],
      baseToken: USDC,
      startTime: 1631538000,
      stakingRewardAddress: '0x0185801628dC4fC0c24E83681f3f6a515E29FDE0',
      version: 'v5'
    },
    {
      tokens: [DFYN, ELE],
      baseToken: DFYN,
      startTime: 1631538000,
      stakingRewardAddress: '0x0d5F036c1AAe892c4d52bC0151E9466b0edee352',
      version: 'v5'
    },
    {
      tokens: [DFYN, GAJ],
      baseToken: DFYN,
      startTime: 1631538000,
      stakingRewardAddress: '0x81CB25e0ebB5b31DeA411114DAE995678582871b',
      version: 'v5'
    },
    {
      tokens: [DFYN, FRM],
      baseToken: DFYN,
      startTime: 1631538000,
      stakingRewardAddress: '0x44fcF521747BA7f152d78b0b206D43580A2bdf73',
      version: 'v5'
    },
    //v4
    {
      tokens: [DFYN, SING],
      baseToken: DFYN,
      startTime: 1631021400,
      stakingRewardAddress: '0x10b70CC73E3FE9fb518FA86814cEcb97e74C4376',
      version: 'v4'
    },
    {
      tokens: [DFYN, BIFI],
      baseToken: DFYN,
      startTime: 1631021400,
      stakingRewardAddress: '0xa11b8DC1108692AB4A21fb780f3389e27E3DFDEA',
      version: 'v4'
    },
    {
      tokens: [RAZOR, ETHER],
      baseToken: ETHER,
      rewardToken: RAZOR,
      startTime: 1631021400,
      stakingRewardAddress: '0x07A6314C933663472C1a66b2bd4097B60625e35E',
      version: 'v4'
    },

    //v3

    {
      tokens: [DFYN, SILVER],
      baseToken: DFYN,
      startTime: 1630330200,
      stakingRewardAddress: '0x3E8c15d0c14A41Df28478A8E22217cBD9e31493D',
      version: 'v3'
    },

    {
      tokens: [DFYN, FISH],
      baseToken: DFYN,
      startTime: 1627993800,
      stakingRewardAddress: '0xA0b4Eb5201635011eEf2A7eE7d12237b229C38D2',
      version: 'v2'
    },
    {
      tokens: [DFYN, TITAN],
      baseToken: DFYN,
      startTime: 1626183000,
      stakingRewardAddress: '0xd94aA4f6BAAC53E558140a769B9DA6231bfb335e',
      version: 'v1'
    },
    {
      tokens: [DFYN, ICE],
      baseToken: DFYN,
      startTime: 1626183000,
      stakingRewardAddress: '0xD854E7339840F7D1E12B54FD75235eBc0bB6BfAC',
      version: 'v1'
    },
    {
      tokens: [DFYN, BIFI],
      baseToken: DFYN,
      startTime: 1625758200,
      stakingRewardAddress: '0xECe1b93A70A0429Db6cF4580C325F831FBB16d52',
      version: 'v1'
    },
    {
      tokens: [DFYN, COSMIC],
      baseToken: DFYN,
      startTime: 1625758200,
      stakingRewardAddress: '0xccEFB3926E9e2f77d4ce4E661f8D720f379817eD',
      version: 'v1'
    },
    {
      tokens: [DFYN, NORD],
      baseToken: DFYN,
      startTime: 1624980600,
      stakingRewardAddress: '0x2d7c3E61430E4CF4DC091C61df03eaAB6d67cd26',
      version: 'v1'
    },
    {
      tokens: [DFYN, WMATIC],
      baseToken: DFYN,
      startTime: 1629723600,
      stakingRewardAddress: '0x45Ea0bBa68c7435b55A4bBD6B09ec2A0DfCDf334',
      version: 'v3'
    },
    {
      tokens: [DFYN, LUNA],
      baseToken: DFYN,
      startTime: 1629723600,
      stakingRewardAddress: '0x52b965ccd44A98A8aa064bC597C895adCD02e9BC',
      version: 'v3'
    },
    {
      tokens: [DFYN, LINK],
      baseToken: DFYN,
      startTime: 1629723600,
      stakingRewardAddress: '0xD739035dcFfbEc4069E46021019eE7ABBF537AA2',
      version: 'v3'
    },
    {
      tokens: [DFYN, AAVE],
      baseToken: DFYN,
      startTime: 1629723600,
      stakingRewardAddress: '0x75919e23AccA92977C9098255c509311E6A62C59',
      version: 'v3'
    },
    {
      tokens: [DFYN, UNI_TOKEN],
      baseToken: DFYN,
      startTime: 1629723600,
      stakingRewardAddress: '0x924B6897aAfb0d4B20A6E439f99C19173987E19b',
      version: 'v3'
    },
    {
      tokens: [DFYN, CRV],
      baseToken: DFYN,
      startTime: 1629723600,
      stakingRewardAddress: '0x25D779d16021dDD15932f9f3B6EE745b4c8fd488',
      version: 'v3'
    },
    {
      tokens: [DFYN, GAJ],
      baseToken: DFYN,
      startTime: 1628857800,
      stakingRewardAddress: '0x8257383036071C57235bfA12B76778215C348528',
      version: 'v2'
    },
    {
      tokens: [USDC, ELE],
      baseToken: USDC,
      startTime: 1628857800,
      stakingRewardAddress: '0xB6a316dDe99a2844C80355a3Ef165AaD5Eb7d708',
      version: 'v2'
    },
    {
      tokens: [DFYN, ELE],
      baseToken: DFYN,
      startTime: 1628857800,
      stakingRewardAddress: '0x139D73E055308507b6718AFFAB679c2186b6d90e',
      version: 'v2'
    },
    {
      tokens: [AGAr, AGA],
      baseToken: AGA,
      rewardToken: AGA,
      startTime: 1628940600,
      stakingRewardAddress: '0x85E894149348c1aC5B63561462Ca6051f1aB4b72',
      version: 'v2'
    },
    {
      tokens: [DFYN, AGA],
      baseToken: DFYN,
      startTime: 1628857800,
      stakingRewardAddress: '0x2CaAA00D4505aD79FA75C06c475828e47B01C042',
      version: 'v2'
    },
    {
      tokens: [DFYN, AGAr],
      baseToken: DFYN,
      startTime: 1628857800,
      stakingRewardAddress: '0xf8F6cf2f6Dc86dDB471552AA33cD6BeAC495E444',
      version: 'v2'
    },
    //v2
    {
      tokens: [DFYN, WMATIC],
      baseToken: DFYN,
      startTime: 1627142400,
      stakingRewardAddress: '0x971e9e1Cb317cd9f9E0dAdA84965EB741582dDF0',
      version: 'v2'
    },
    {
      tokens: [DFYN, LUNA],
      baseToken: DFYN,
      startTime: 1627142400,
      stakingRewardAddress: '0x6b975bDb7E815E300c0F4Fa7Ad8833dB61895441',
      version: 'v2'
    },
    {
      tokens: [DFYN, LINK],
      baseToken: DFYN,
      startTime: 1627142400,
      stakingRewardAddress: '0xd404AC8ec9F79C4eDd4F34340F7C7be28fDccD24',
      version: 'v2'
    },
    {
      tokens: [DFYN, AAVE],
      baseToken: DFYN,
      startTime: 1627142400,
      stakingRewardAddress: '0x3f354D2ca898b43aA4f5460DF940a7FeFAe140e5',
      version: 'v2'
    },
    {
      tokens: [DFYN, UNI_TOKEN],
      baseToken: DFYN,
      startTime: 1627142400,
      stakingRewardAddress: '0x4FFfa5713c9fF13a2BF3013cF23810347ca79327',
      version: 'v2'
    },
    {
      tokens: [DFYN, CRV],
      baseToken: DFYN,
      startTime: 1627142400,
      stakingRewardAddress: '0x098fdadCcde328e6CD1168125e1e7685eEa54342',
      version: 'v2'
    },
    {
      tokens: [DFYN, AGA],
      baseToken: DFYN,
      startTime: 1623679200,
      stakingRewardAddress: '0x250fF0EE7a02d0DaeC193A0Ea76f879B26818732',
      version: 'v1'
    },
    {
      tokens: [DFYN, AGAr],
      baseToken: DFYN,
      startTime: 1623679200,
      stakingRewardAddress: '0x6719BD4E5Aed0e25b4cE5FB01d763353103e7258',
      version: 'v1'
    },
    {
      tokens: [AGA, AGAr],
      baseToken: AGA,
      startTime: 1623679200,
      stakingRewardAddress: '0xa3d7c12a474a6806df5e0260019eD613bF970c54',
      version: 'v1'
    },
    {
      tokens: [FISH, DFYN],
      baseToken: DFYN,
      startTime: 1622557800,
      stakingRewardAddress: '0xfBCE866aF59bEa3b3880330F7DE3b08d7bc26676',
      version: 'v1'
    },
    {
      tokens: [ANY, DFYN],
      baseToken: DFYN,
      startTime: 1622651400,
      stakingRewardAddress: '0xf4822f5e1B01Dc101914C888d88E6d295c6A7FCA',
      version: 'v1'
    },
    {
      tokens: [UFT, DFYN],
      baseToken: DFYN,
      startTime: 1622651400,
      stakingRewardAddress: '0x4cAE3C18b058eBF1EC439f01457348a9dD9CcC53',
      version: 'v1'
    },
  ]
}
interface TypeOfpools {
  typeOf: string
  url: string
}
export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  baseToken: any
  startTime: number
  rewardToken: Token
  type: TypeOfpools
  tokens: [Token, Token]
  version: string
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  // when the period ends
  periodFinish: Date | undefined

  dfynPrice: number
  // if pool is active
  active: boolean
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(pairToFilterBy?: Pair | null, version: string = 'v1'): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const [, dfynUsdcPair] = usePair(USDC, DFYN);
  const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]) && version === stakingRewardInfo.version
        ) ?? []
        : [],
    [chainId, pairToFilterBy, version]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_BASIC_FARMS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_BASIC_FARMS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_BASIC_FARMS_INTERFACE, 'totalSupply')

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_BASIC_FARMS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_BASIC_FARMS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        // check for account, if no account set to 0

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(info[index].rewardToken ?? uni, JSBI.BigInt(rewardRateState.result?.[0]))
        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            uni,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

        const periodFinishSeconds = periodFinishState.result?.[0]?.toNumber()
        const periodFinishMs = periodFinishSeconds * 1000

        // compare period end timestamp vs current block timestamp (in seconds)
        const active =
          periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp.toNumber() : true

        memo.push({
          type: { typeOf: 'Ecosystem Farms', url: 'eco-farms' },
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          version: info[index].version,
          startTime: info[index].startTime ?? 0,
          tokens: info[index].tokens,
          rewardToken: info[index].rewardToken ?? uni,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          active,
          dfynPrice
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    uni,
    dfynPrice
  ])
}

//for Inactive Info
export function useInactiveStakingInfo(pairToFilterBy?: Pair | null, version: string = 'v1'): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const [, dfynUsdcPair] = usePair(USDC, DFYN);
  const dfynPrice = Number(dfynUsdcPair?.priceOf(DFYN)?.toSignificant(6))
  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? INACTIVE_STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]) && version === stakingRewardInfo.version
        ) ?? []
        : [],
    [chainId, pairToFilterBy, version]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_BASIC_FARMS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_BASIC_FARMS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_BASIC_FARMS_INTERFACE, 'totalSupply')

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_BASIC_FARMS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_BASIC_FARMS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        // check for account, if no account set to 0

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(info[index].rewardToken ?? uni, JSBI.BigInt(rewardRateState.result?.[0]))
        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            uni,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

        const periodFinishSeconds = periodFinishState.result?.[0]?.toNumber()
        const periodFinishMs = periodFinishSeconds * 1000

        // compare period end timestamp vs current block timestamp (in seconds)
        const active =
          periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp.toNumber() : true
        memo.push({
          type: { typeOf: 'Archived Ecosystem Farms', url: 'eco-farms/archived' },
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          version: info[index].version,
          startTime: info[index].startTime ?? 0,
          tokens: info[index].tokens,
          rewardToken: info[index].rewardToken ?? uni,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          active,
          dfynPrice
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    uni,
    dfynPrice
  ])
}

export function useTotalEcosystemUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const activeStakingInfos = useStakingInfo()
  const inactiveStakingInfos = useInactiveStakingInfo();
  const stakingInfos = activeStakingInfos.concat(inactiveStakingInfos);

  return useMemo(() => {
    if (!uni) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => {
          if (stakingInfo.rewardToken === uni) {

            return accumulator.add(stakingInfo.earnedAmount)
          }
          return accumulator
        },
        new TokenAmount(uni, '0')
      ) ?? new TokenAmount(uni, '0')
    )
  }, [stakingInfos, uni])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

  const parsedAmount = parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}