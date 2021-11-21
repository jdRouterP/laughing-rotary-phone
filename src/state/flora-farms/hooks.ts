// import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WETH, Pair } from '@dfyn/sdk'
import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@dfyn/sdk'
import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { ROUTE, UNI, ETHER, USDC, DFYN, WBTC, USDT, DAI, WMATIC, UNI_TOKEN, AAVE, LUNA, UST, LINK, CRV, QUICK, MATICPAD, MIMATIC, NEXO, FTM, USDC_FANTOM, USDT_FANTOM, WBTC_FANTOM, WETH_FANTOM, DFYN_FANTOM, MANA, SOL } from '../../constants'
import { STAKING_REWARDS_FLORA_FARMS_INTERFACE } from '../../constants/abis/staking-rewards-flora-farms'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { usePair } from 'data/Reserves'

export const STAKING_GENESIS = 1621956600

export const REWARDS_DURATION_DAYS = 30

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    baseToken?: Token
    rewardToken?: Token
    startTime?: number
    rate?: TokenAmount
    stakingRewardAddress: string
    version: string
    burnRate: string
  }[]
} = {
  [ChainId.FANTOM]: [
    //v1
    {
      tokens: [DFYN_FANTOM, FTM], //DFYN_FTM
      baseToken: FTM,
      startTime: 1635260400,
      stakingRewardAddress: '0xf9D70A91c9898ed8FF005A286c9F4FF8Fcc868D4',
      version: 'v1',
      burnRate: '35',
      rate: new TokenAmount(DFYN_FANTOM, JSBI.divide(JSBI.BigInt("150000000000000000000000"), JSBI.BigInt("2592000")))
    },
    {
      tokens: [USDC_FANTOM, USDT_FANTOM],
      baseToken: USDT_FANTOM,
      startTime: 1635260400,
      stakingRewardAddress: '0xa8753167da15FF2A19266b99b32993f353d93F0C',
      version: 'v1',
      burnRate: '35',
      rate: new TokenAmount(DFYN_FANTOM, JSBI.divide(JSBI.BigInt("300000000000000000000000"), JSBI.BigInt("2592000")))
    },
    {
      tokens: [WBTC_FANTOM, WETH_FANTOM],
      baseToken: WETH_FANTOM,
      startTime: 1635260400,
      stakingRewardAddress: '0x4E6e4D56A8EE083d763DC34edD903053b28B5267',
      version: 'v1',
      burnRate: '35',
      rate: new TokenAmount(DFYN_FANTOM, JSBI.divide(JSBI.BigInt("300000000000000000000000"), JSBI.BigInt("2592000")))
    },
    {
      tokens: [DFYN_FANTOM, USDC_FANTOM],
      baseToken: USDC_FANTOM,
      startTime: 1635260400,
      stakingRewardAddress: '0x07428ee4ca8B8B39b5b3C8F02dF0867D88D96bC3',
      version: 'v1',
      burnRate: '35',
      rate: new TokenAmount(DFYN_FANTOM, JSBI.divide(JSBI.BigInt("150000000000000000000000"), JSBI.BigInt("2592000")))
    }],
  [ChainId.MATIC]: [
    //v7
    {
      tokens: [UST, USDT],
      baseToken: USDT,
      startTime: 1637510700,
      stakingRewardAddress: '0x8C66D38032b3FF698b379d2C13Cb9A484331A732',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [UST, USDC],
      baseToken: USDC,
      startTime: 1637510700,
      stakingRewardAddress: '0xA9E948A5a9549883908458A1f25f046eE9793916',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [DFYN, USDC],
      baseToken: USDC,
      startTime: 1637510700,
      stakingRewardAddress: '0x3AfD72c0d6a6048bdA4E54f37C17A4034621DB0f',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [DFYN, ETHER],
      baseToken: ETHER,
      startTime: 1637510700,
      stakingRewardAddress: '0x35D21D11f3e5C6A733C18Bb39310088cd19DAc9c',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      startTime: 1637510700,
      stakingRewardAddress: '0xEe772bcCd4919651de4F54b5f5379c4aC9dcF32C',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      startTime: 1637510700,
      stakingRewardAddress: '0x13f8674468bC60a96d7ea73038F62eE7C6f2Bf46',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [USDC, ETHER],
      baseToken: USDC,
      startTime: 1637510700,
      stakingRewardAddress: '0x8fbE445FCa0CD4Bf5A1646b6d405D9F7BE5Ee083',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [USDC, ROUTE],
      baseToken: USDC,
      startTime: 1637510700,
      stakingRewardAddress: '0x687dE006D6cB393c6Fae3c75AbBD62BFC2B92250',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [ETHER, ROUTE],
      baseToken: ETHER,
      startTime: 1637510700,
      stakingRewardAddress: '0x0cffcCeF81AAF39F3D5b6271F067FeFfb24DBd1b',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: WMATIC,
      startTime: 1637510700,
      stakingRewardAddress: '0x083FBd5D63a95cE0C6C33Fb66A8E5a4B65945a5C',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [MANA, ETHER],
      baseToken: ETHER,
      startTime: 1637510700,
      stakingRewardAddress: '0x8F0c6DdF47EecDAF02860BE82B2aC7E485bd08dF',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [SOL, ETHER],
      baseToken: ETHER,
      startTime: 1637510700,
      stakingRewardAddress: '0x9213ab4015F9a619c6E0f3380B4508EB310CC917',
      version: 'v7',
      burnRate: '35'
    },
    {
      tokens: [NEXO, ETHER],
      baseToken: ETHER,
      startTime: 1637510700,
      stakingRewardAddress: '0x09Fce8E9855d6DD733d2c15b918eB65ce159138D',
      version: 'v7',
      burnRate: '35'
    },


    //v6
    {
      tokens: [UST, USDC],
      baseToken: USDC,
      startTime: 1634916600,
      stakingRewardAddress: '0xe6d2d8FDf02A7156797CdD2e611307388946a5Bb',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [UST, USDT],
      baseToken: USDT,
      startTime: 1634916600,
      stakingRewardAddress: '0x506aAECD6C87ae1A6081c15460909b1649023aC0',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [DFYN, USDC],
      baseToken: USDC,
      startTime: 1634916600,
      stakingRewardAddress: '0x06b2499F52A481532238936F0528fa268dDd6A79',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [DFYN, ETHER],
      baseToken: ETHER,
      startTime: 1634916600,
      stakingRewardAddress: '0x0D0A2A3972b499FF8939AA1155F0FD8e2ee709ef',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      startTime: 1634916600,
      stakingRewardAddress: '0x8bCB1E1733c8577751e52F090754454Ae41C1696',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      startTime: 1634916600,
      stakingRewardAddress: '0x386d41280149F870243b8247095dF9089092bccA',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [USDT, DAI],
      baseToken: USDT,
      startTime: 1634916600,
      stakingRewardAddress: '0x1834c10E4B9569b8E6a025734b524f24Bfd4690B',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [USDC, ETHER],
      baseToken: USDC,
      startTime: 1634916600,
      stakingRewardAddress: '0xCf67D5aa0A6C2961e13B39980Bd966D81944BaF0',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [USDC, ROUTE],
      baseToken: USDC,
      startTime: 1634916600,
      stakingRewardAddress: '0xA6D9E92209C56ACe8685033647BdBd6667f2b9b8',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [ETHER, ROUTE],
      baseToken: ETHER,
      startTime: 1634916600,
      stakingRewardAddress: '0xCF2e348bA53eB0C1Ce00549cCE4d5a40EbE67fC5',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: WMATIC,
      startTime: 1634916600,
      stakingRewardAddress: '0x3Ed9697165bfA943A440C46074FB0b0bBd22cCE8',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [CRV, ETHER],
      baseToken: ETHER,
      startTime: 1634916600,
      stakingRewardAddress: '0xd74F11F290a66b58624Cc8fA6EC8C7b94fDC9A5F',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [UNI_TOKEN, ETHER],
      baseToken: ETHER,
      startTime: 1634916600,
      stakingRewardAddress: '0x3e6645941b3e14D216392EF20Ee1785A45fFe833',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [AAVE, ETHER],
      baseToken: ETHER,
      startTime: 1634916600,
      stakingRewardAddress: '0x63e6c24f26B946D0Dd6Ef070C6BA556bc62914d5',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [LINK, ETHER],
      baseToken: ETHER,
      startTime: 1634916600,
      stakingRewardAddress: '0x94835155d98B165818B6A7049012777f2440B198',
      version: 'v6',
      burnRate: '35'
    },
    {
      tokens: [NEXO, ETHER],
      baseToken: ETHER,
      startTime: 1634916600,
      stakingRewardAddress: '0xAaB606C84dAC6727ea560dC39B9EC9d2346c1980',
      version: 'v6',
      burnRate: '35'
    },
  ]
}

export const INACTIVE_STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    baseToken?: Token
    rewardToken?: Token
    startTime?: number
    stakingRewardAddress: string
    version: string
    burnRate: string
  }[]
} = {
  [ChainId.MATIC]: [
    //v5
    {
      tokens: [UST, USDC],
      baseToken: USDC,
      startTime: 1632315600,
      stakingRewardAddress: '0xB3e063CBbA9750142786a938d72ffF6d4a437554',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [UST, USDT],
      baseToken: USDT,
      startTime: 1631021400,
      stakingRewardAddress: '0xC16b42709692BC4c32CfFAA385624CE999eF62A2',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [DFYN, USDC],
      baseToken: USDC,
      startTime: 1631021400,
      stakingRewardAddress: '0x162a6e5fa8b47581AD5091f6d0F3E240f5bf03a5',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [DFYN, ETHER],
      baseToken: ETHER,
      startTime: 1631021400,
      stakingRewardAddress: '0x58376534cc5e629f9AEBD06c190AB6dd9E288190',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      startTime: 1631021400,
      stakingRewardAddress: '0xD37A3e5fe23B1188C54510aAf9BeA6bbC8500Ce4',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      startTime: 1631021400,
      stakingRewardAddress: '0x0EE80b2a34f760514519bFab412b45A90BE6eC0A',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [USDT, DAI],
      baseToken: USDT,
      startTime: 1631021400,
      stakingRewardAddress: '0xB69a17f33969a4dacC7F8a73f227B7350f39d38A',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [DAI, USDC],
      baseToken: USDC,
      startTime: 1631021400,
      stakingRewardAddress: '0x40E9d56b7a419b96F0C03Fdd6D6418d8B5c4cF34',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [USDC, ETHER],
      baseToken: USDC,
      startTime: 1631021400,
      stakingRewardAddress: '0x98397d8Cf226aD53eDe2B252bABc069F8B13d844',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [USDC, ROUTE],
      baseToken: USDC,
      startTime: 1631021400,
      stakingRewardAddress: '0x9a4b24822BD425554b9B4f1DfD8c3faC68ab4b9a',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [ETHER, ROUTE],
      baseToken: ETHER,
      startTime: 1631021400,
      stakingRewardAddress: '0xC00d7cb5D6d97B1DF834728Dc2003D8B05c4420A',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: WMATIC,
      startTime: 1631021400,
      stakingRewardAddress: '0x4b7Da0D0F0Ae06a009962C4f8c65DA81C86f2c10',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [CRV, ETHER],
      baseToken: ETHER,
      startTime: 1631021400,
      stakingRewardAddress: '0x40df423c4FC5C3249030bd0821E13f1E75C82A2d',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [UNI_TOKEN, ETHER],
      baseToken: ETHER,
      startTime: 1631021400,
      stakingRewardAddress: '0x419305970b6Ad7f737968AA9B362396b72db082c',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [AAVE, ETHER],
      baseToken: ETHER,
      startTime: 1631021400,
      stakingRewardAddress: '0x68ccC7B0c084B288738FEaC52b10e8D0719839fe',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [LINK, ETHER],
      baseToken: ETHER,
      startTime: 1631021400,
      stakingRewardAddress: '0x2685CAefCdd48cDf584C2C3A2a22012E87Ddc304',
      version: 'v5',
      burnRate: '35'
    },
    {
      tokens: [NEXO, ETHER],
      baseToken: ETHER,
      startTime: 1631021400,
      stakingRewardAddress: '0x2644EE75b7Cb5a13c0B14F81d592F093d074c01E',
      version: 'v5',
      burnRate: '35'
    },

    //v4
    {
      tokens: [UST, USDT],
      baseToken: USDT,
      startTime: 1629723600,
      stakingRewardAddress: '0xb4Ca3F9982CBAe99629167D1Ef0aC2939FA52e80',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [DFYN, USDC],
      baseToken: USDC,
      startTime: 1629723600,
      stakingRewardAddress: '0x001A4e27CCDfe8ed6BBaFfEc9AE0985aB5542BEf',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [DFYN, ETHER],
      baseToken: ETHER,
      startTime: 1629723600,
      stakingRewardAddress: '0xEAb0FD1FE0926E43b61612d65002Ba6320AA1080',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      startTime: 1629723600,
      stakingRewardAddress: '0x64bf206E80DE13691AD162348Dd478f5B0CBFe00',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      startTime: 1629723600,
      stakingRewardAddress: '0x72189093cB70ED931B66972FBE6F1a309701ed8d',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [USDT, DAI],
      baseToken: USDT,
      startTime: 1629723600,
      stakingRewardAddress: '0x584575d9AaDD76D6DDE860bb90F2b5B2f38e0308',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [DAI, USDC],
      baseToken: USDC,
      startTime: 1629723600,
      stakingRewardAddress: '0x299CEF5Ca7C9EceE77638b7fa9b516FF7badfB4f',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [USDC, ETHER],
      baseToken: USDC,
      startTime: 1629723600,
      stakingRewardAddress: '0xf57AdA7DcBa902602655ec7aC672AeC61F17246e',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [USDC, ROUTE],
      baseToken: USDC,
      startTime: 1629723600,
      stakingRewardAddress: '0xadD690b421cd697763Bf9807A516E723E999E332',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [ETHER, ROUTE],
      baseToken: ETHER,
      startTime: 1629723600,
      stakingRewardAddress: '0xc14603d08A4f130192B7a864AB49A990383898AD',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: WMATIC,
      startTime: 1629723600,
      stakingRewardAddress: '0x5bbEe00100b30B1F3937432A5C9D2577F59b1238',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [CRV, ETHER],
      baseToken: ETHER,
      startTime: 1629723600,
      stakingRewardAddress: '0xff885dDA95360e00a5E12a74426464Ea1d036285',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [UNI_TOKEN, ETHER],
      baseToken: ETHER,
      startTime: 1629723600,
      stakingRewardAddress: '0x71f2FbD3049dA7F36cedaBC5A79e5637cADCDFbb',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [QUICK, WMATIC],
      baseToken: WMATIC,
      startTime: 1629723600,
      stakingRewardAddress: '0xC64280F3D6B8aAA8388Ce13E0bF1401A839B79A3',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [AAVE, ETHER],
      baseToken: ETHER,
      startTime: 1629723600,
      stakingRewardAddress: '0x99FaDefbc7DB0C17FCe6fEe1B991138abe94e01A',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [LINK, ETHER],
      baseToken: ETHER,
      startTime: 1629723600,
      stakingRewardAddress: '0xe7Cb4A502e9d68062013174C96d94D4b09f93855',
      version: 'v4',
      burnRate: '35'
    },
    {
      tokens: [NEXO, ETHER],
      baseToken: ETHER,
      startTime: 1629723600,
      stakingRewardAddress: '0xD423437f2e647b3D542C96B35D8e3FC0F9Ce8AB0',
      version: 'v4',
      burnRate: '35'
    },
    //v3
    {
      tokens: [NEXO, ETHER],
      baseToken: ETHER,
      startTime: 1627993800,
      stakingRewardAddress: '0xC406879608072142C53f8be94B33086CE56bb485',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [UST, USDT],
      baseToken: USDT,
      startTime: 1627142400,
      stakingRewardAddress: '0xbFE8679551Ee2CBA6A0FFDBa48AC29Ab89421A1F',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [DFYN, USDC],
      baseToken: USDC,
      startTime: 1627142400,
      stakingRewardAddress: '0x5661681563003189a02a21Ca352a08f4D2B7dc6b',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [DFYN, ETHER],
      baseToken: ETHER,
      startTime: 1627142400,
      stakingRewardAddress: '0xAE3b7B761FA5d19330E7b70f982e82a8514097F1',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      startTime: 1627142400,
      stakingRewardAddress: '0xAA1c6DE472eE563Bc2D5c9414db0ab80C3D0B53e',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      startTime: 1627142400,
      stakingRewardAddress: '0x015a19cb6279F2c50fB197e1D83fA35C239521Bc',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [USDT, DAI],
      baseToken: USDT,
      startTime: 1627142400,
      stakingRewardAddress: '0x41b03D6146222C2EF99C4af4Bc54Ad879DDE65B4',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [DAI, USDC],
      baseToken: USDC,
      startTime: 1627142400,
      stakingRewardAddress: '0xF01261a698cd6331521CE6e1f9b17A011bf1c22E',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [USDC, ETHER],
      baseToken: USDC,
      startTime: 1627142400,
      stakingRewardAddress: '0x83bF2d48626b86c11389BF1B38942Caf31B57149',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [USDC, ROUTE],
      baseToken: USDC,
      startTime: 1627142400,
      stakingRewardAddress: '0x0D11c2Be47cE813D72D5Ae5C94BE669DBD76BB35',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [ETHER, ROUTE],
      baseToken: ETHER,
      startTime: 1627142400,
      stakingRewardAddress: '0xe38298301670DEBbd10FdB350569D7984458F482',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: WMATIC,
      startTime: 1627142400,
      stakingRewardAddress: '0x9C1f078085FEB02849edDE18bd28Aa688D20a7Ce',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [CRV, ETHER],
      baseToken: ETHER,
      startTime: 1627142400,
      stakingRewardAddress: '0xC20D2f5b9d2FD9E89f33aa0b400A8070f1008B50',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [UNI_TOKEN, ETHER],
      baseToken: ETHER,
      startTime: 1627142400,
      stakingRewardAddress: '0x797fEd94a3865df1c2096a0e9a1cDfd194fe7150',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [UNI_TOKEN, USDC],
      baseToken: USDC,
      startTime: 1627142400,
      stakingRewardAddress: '0x8FA2e1ae0180f42c7b39EB91C018879E55918145',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [QUICK, WMATIC],
      baseToken: WMATIC,
      startTime: 1627142400,
      stakingRewardAddress: '0xc721F5d5BE5DDa564D9daC501757976F21ae8210',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [AAVE, ETHER],
      baseToken: ETHER,
      startTime: 1627142400,
      stakingRewardAddress: '0x3481fd816CE3C1418bcDB1105F6D1b4c6B3a9823',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [AAVE, USDC],
      baseToken: USDC,
      startTime: 1627142400,
      stakingRewardAddress: '0xcCf0565d6B15560eE0Bcaad6361CD565905CdcFa',
      version: 'v3',
      burnRate: '35'
    },
    {
      tokens: [LINK, USDC],
      baseToken: USDC,
      startTime: 1627142400,
      stakingRewardAddress: '0xDC87882BCb8A3F15DDEbCE9023bc4661FEa4dbA5',
      version: 'v3',
      burnRate: '35'
    },

    //v2
    {
      tokens: [UST, USDT],
      baseToken: USDT,
      startTime: 1625758200,
      stakingRewardAddress: '0x35A3a9DF5F0E2dFf08FBA3ece64Ea5faeD7D3b18',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [DFYN, WMATIC],
      baseToken: DFYN,
      startTime: 1625758200,
      stakingRewardAddress: '0x8555b37C21F78F0B73d905b9c2923EB3A3efe7bc',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [LUNA, DFYN],
      baseToken: DFYN,
      startTime: 1625758200,
      stakingRewardAddress: '0xF2BaEc3ECA845A6762863C6159b223E871f5ceAe',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [MATICPAD, ETHER],
      baseToken: ETHER,
      startTime: 1624980600,
      rewardToken: MATICPAD,
      stakingRewardAddress: '0x9Eabb8DcBFc062E3fD445E4028D617C0b6F3eaf1',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [DFYN, MIMATIC],
      baseToken: DFYN,
      startTime: 1624980600,
      stakingRewardAddress: '0x98D7c004C54C47b7e65320Bd679CB897Aae6a6D6',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [DFYN, USDC],
      baseToken: USDC,
      startTime: 1624550400,
      stakingRewardAddress: '0xeee84F55F493c6ea89b655FFF09F2a2f9C2D1Dd8',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [DFYN, ETHER],
      baseToken: ETHER,
      startTime: 1624550400,
      stakingRewardAddress: '0x17e8732E2f0f6c35a794e9db4e63AeaDa9ce927C',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      startTime: 1624550400,
      stakingRewardAddress: '0xA51aF13F630489eE77B4489844041031e4e36824',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      startTime: 1624550400,
      stakingRewardAddress: '0xa55D1729eF64755D44640C67feA6D18A44EE9326',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [DAI, USDT],
      baseToken: USDT,
      startTime: 1624550400,
      stakingRewardAddress: '0xf01adB0eF728D4544E9a1E3543FC98F0C1CAE7FD',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [DAI, USDC],
      baseToken: USDC,
      startTime: 1624550400,
      stakingRewardAddress: '0xbd7BD38EC111A1789158b25240B5DaAE043113aE',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [ETHER, USDC],
      baseToken: USDC,
      startTime: 1624550400,
      stakingRewardAddress: '0x12286A4a13FCAFB77f08c48A00e6963A0ca6d917',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [ROUTE, USDC],
      baseToken: USDC,
      startTime: 1624550400,
      stakingRewardAddress: '0x39a7733e5F418a5F4c11A2212f085F0a776Ac7D3',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [ROUTE, ETHER],
      baseToken: ETHER,
      startTime: 1624550400,
      stakingRewardAddress: '0xCf32aF39BC10BAd0E193630E4E49b0Fa44867E7B',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: ETHER,
      startTime: 1624550400,
      stakingRewardAddress: '0xC79FC48EC33038e80531B14b1efE0C8cAb50747A',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [CRV, ETHER],
      baseToken: ETHER,
      startTime: 1624550400,
      stakingRewardAddress: '0xbE6D6BA111E459610646FD4234005331af49179F',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [UNI_TOKEN, ETHER],
      baseToken: ETHER,
      startTime: 1624550400,
      stakingRewardAddress: '0xC9091079b96fc51df933720b5071c0B0d18EF785',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [UNI_TOKEN, USDC],
      baseToken: USDC,
      startTime: 1624550400,
      stakingRewardAddress: '0xf8f7F41BC59f37cfC19794CB41Ec37073fc98E5f',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [QUICK, WMATIC],
      baseToken: WMATIC,
      startTime: 1624550400,
      stakingRewardAddress: '0x9b0E341661E8A993BBe3dd4b1d2484f100A55BB4',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [AAVE, ETHER],
      baseToken: ETHER,
      startTime: 1624550400,
      stakingRewardAddress: '0xE504196B11dE48Da00872697f4683F5596dc8E8E',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [AAVE, USDC],
      baseToken: USDC,
      startTime: 1624550400,
      stakingRewardAddress: '0xF4B0Dfe49aa35463D40d2FFAe47006990Ae10465',
      version: 'v2',
      burnRate: '50'
    },
    {
      tokens: [LINK, USDC],
      baseToken: USDC,
      startTime: 1624550400,
      stakingRewardAddress: '0x6aa7f7cD7185905948951ab10E5FAE65d4Ab883D',
      version: 'v2',
      burnRate: '50'
    },


    // old farms

    {
      tokens: [LUNA, DFYN],
      baseToken: DFYN,
      startTime: 1623164400,
      stakingRewardAddress: '0xB5583E039E4C9b627F6258bD823fd884668afE02',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [UST, USDT],
      baseToken: USDT,
      startTime: 1623164400,
      stakingRewardAddress: '0x4B47d7299Ac443827d4468265A725750475dE9E6',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [DFYN, USDC],
      baseToken: USDC,
      startTime: 1621956600,
      stakingRewardAddress: '0x24a5256589126a0eb73a1a011e22C1c838890Ced',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [DFYN, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0xE4F8C4722Aa44bFf5c99ba64c0bC39C6d883CcB6',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [WBTC, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0x370737D328cf8DfD830fFFf51Dd9c972345e6Fee',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [USDT, USDC],
      baseToken: USDC,
      startTime: 1621956600,
      stakingRewardAddress: '0xf786Ba582AbbE846B35E6e7089a25B761eA54113',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [DAI, USDT],
      baseToken: USDT,
      startTime: 1621956600,
      stakingRewardAddress: '0x32B73E973057d309d22EC98B50a8311C0F583Ad3',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [ETHER, USDC],
      baseToken: USDC,
      startTime: 1621956600,
      stakingRewardAddress: '0x694351F6dAfe5F2e92857e6a3C0578b68A8C1435',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [ROUTE, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0xf162a26aCc064B88a0150a36d7B38996723E94D7',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [WMATIC, DFYN],
      baseToken: DFYN,
      startTime: 1621956600,
      stakingRewardAddress: '0x376920095Ae17e12BC114D4E33D30DFda83f8EfB',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [WMATIC, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0x0BADA377367f4937bdf6A17FdaeeB0b798051c91',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [UNI_TOKEN, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0x3cA3f35b081CD7c47990e0Ef5Eed763b54F22874',
      version: 'v1',
      burnRate: '50'
    },
    {
      tokens: [AAVE, ETHER],
      baseToken: ETHER,
      startTime: 1621956600,
      stakingRewardAddress: '0x80dF5A040E045817AB75A4214e29Dc95D83f1118',
      version: 'v1',
      burnRate: '50'
    },
  ]
}

interface UserVestingInfo {
  hasOptForVesting: boolean
  hasSetConfig: boolean
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
  version: string
  type: TypeOfpools
  userVestingInfo: UserVestingInfo
  burnRate: string
  tokens: [Token, Token]
  rewardToken: Token
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  // Total vested unclaimed amount
  unclaimedAmount: BigNumber
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  // total vested amount
  totalVestedAmount: TokenAmount
  // when the period ends
  periodFinish: Date | undefined
  // size of split window
  splitWindow: Date | undefined
  //
  totalEarnedReward: TokenAmount | undefined
  // number of days of vesting
  vestingPeriod: Date | undefined
  // next reward unlocked at for a user
  unlockAt: Date | undefined
  // user claimed till this split
  claimedSplits: number | undefined
  // check if user had claimed the current split reward
  ableToClaim: boolean | undefined
  // check if user claimed the non vested reward
  hasClaimedPartial: boolean | undefined
  // if pool is active
  active: boolean
  dfynPrice: Number

  // if vesting is active
  vestingActive: boolean
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
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'earned', accountArg)
  const claimedSplits = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'claimedSplits', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalSupply')
  const hasClaimed = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'hasClaimed', accountArg)
  const totalEarnedReward = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalEarnedReward', accountArg)
  const totalVestedAmount = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalVestedRewardForUser', accountArg)
  const userVestingInfo = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'getUserVestingInfo', accountArg)

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )
  const splitWindow = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'splitWindow',
    undefined,
    NEVER_RELOAD
  )
  const splits = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'splits',
    undefined,
    NEVER_RELOAD
  )
  const vesting = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'vestingPeriod',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const totalVestedAmountState = totalVestedAmount[index]
      const claimedSplitsState = claimedSplits[index]
      const hasClaimedPartialState = hasClaimed[index]
      const totalEarnedRewardState = totalEarnedReward[index]
      const userVestingInfoState = userVestingInfo[index]
      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const splitWindowState = splitWindow[index]
      const splitsState = splits[index]
      const vestingState = vesting[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !claimedSplitsState?.loading &&
        !hasClaimedPartialState?.loading &&
        !totalVestedAmountState?.loading &&
        !totalEarnedRewardState?.loading &&
        !userVestingInfoState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        splitWindowState &&
        !splitWindowState.loading &&
        splitsState &&
        !splitsState.loading &&
        vestingState &&
        !vestingState.loading

      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          claimedSplitsState?.error ||
          userVestingInfoState?.error ||
          totalEarnedRewardState?.error ||
          hasClaimedPartialState?.error ||
          totalVestedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          splitWindowState.error ||
          splitsState.error ||
          vestingState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        // check for account, if no account set to 0

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState?.result?.[0] ?? 0))
        const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(rewardRateState?.result?.[0] ?? 20))
        const totalVestedAmount = new TokenAmount(uni, JSBI.BigInt(totalVestedAmountState?.result?.[0] ?? 0))
        const totalEarnedReward = new TokenAmount(uni, JSBI.BigInt(totalEarnedRewardState?.result?.[0] ?? 0))
        const userClaimedSplit = claimedSplitsState?.result?.[0]?.toNumber() ?? 0;
        const splits = splitsState?.result?.[0]?.toNumber() ?? 0
        const hasClaimedPartial = hasClaimedPartialState?.result?.[0] ?? false
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

        const vestingPeriodSeconds = vestingState.result?.[0]?.toNumber()
        const vestingPeriodMs = vestingPeriodSeconds * 1000

        const splitWindowSeconds = splitWindowState.result?.[0]?.toNumber()
        const splitWindowStateMs = splitWindowSeconds * 1000



        // compare period end timestamp vs current block timestamp (in seconds)
        const active = periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp?.toNumber() : true

        // compare vesting end timestamp vs current block timestamp (in seconds)
        const vestingEndsSeconds = vestingPeriodSeconds + periodFinishSeconds;
        const vestingActive = vestingEndsSeconds && currentBlockTimestamp ? vestingEndsSeconds > currentBlockTimestamp?.toNumber() : true
        let currentSplit = Math.sign(Math.floor(Date.now() / 1000) - periodFinishSeconds) === -1 ? 0 : (Math.floor(Date.now() / 1000) - periodFinishSeconds) / splitWindowSeconds;

        currentSplit = currentSplit > splits ? splits : currentSplit;

        const unlockAt = active ? periodFinishSeconds : vestingActive ? (periodFinishSeconds + (Math.floor(currentSplit + 1) * splitWindowSeconds)) : vestingEndsSeconds;
        const unclaimedSplits = BigNumber.from((Math.floor(currentSplit) - userClaimedSplit))

        let unclaimedAmount = BigNumber.from(totalVestedAmountState?.result?.[0] ?? 0).mul(unclaimedSplits).div(BigNumber.from(splits))
        unclaimedAmount = unclaimedAmount.div(BigNumber.from('1000000000000000000'))

        let ableToClaim = !vestingActive || (Math.floor(Date.now() / 1000) >= periodFinishSeconds &&
          (userClaimedSplit !== Math.floor(currentSplit) ? true : !hasClaimedPartial))
        memo.push({
          type: { typeOf: 'Popular Farms', url: 'popular-farms' },
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          version: info[index].version,
          burnRate: info[index].burnRate,
          startTime: info[index].startTime ?? 0,
          rewardToken: info[index].rewardToken ?? uni,
          tokens: info[index].tokens,
          userVestingInfo: { hasSetConfig: userVestingInfoState?.result?.[0].hasSetConfig, hasOptForVesting: userVestingInfoState?.result?.[0].hasOptForVesting },
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          splitWindow: splitWindowStateMs > 0 ? new Date(splitWindowStateMs) : undefined,
          vestingPeriod: vestingPeriodMs > 0 ? new Date(periodFinishMs + vestingPeriodMs) : undefined, //vesting period after period ends
          earnedAmount: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          unclaimedAmount: unclaimedAmount,
          totalVestedAmount: totalVestedAmount,
          rewardRate: individualRewardRate,
          totalRewardRate: chainId === ChainId.FANTOM ? (info[index].rate ?? totalRewardRate) : totalRewardRate, //TODO: Fix this temp for fantom chain
          stakedAmount: stakedAmount,
          claimedSplits: userClaimedSplit,
          totalEarnedReward,
          ableToClaim,
          dfynPrice,
          hasClaimedPartial,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          unlockAt: unlockAt > 0 ? new Date(unlockAt * 1000) : undefined,
          vestingActive,
          active
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    totalEarnedReward,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    claimedSplits,
    totalVestedAmount,
    splitWindow,
    splits,
    hasClaimed,
    vesting,
    uni,
    dfynPrice,
    userVestingInfo
  ])
}

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
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'earned', accountArg)
  const claimedSplits = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'claimedSplits', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalSupply')
  const hasClaimed = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'hasClaimed', accountArg)
  const totalEarnedReward = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalEarnedReward', accountArg)
  const totalVestedAmount = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'totalVestedRewardForUser', accountArg)
  const userVestingInfo = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_FLORA_FARMS_INTERFACE, 'getUserVestingInfo', accountArg)

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )
  const splitWindow = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'splitWindow',
    undefined,
    NEVER_RELOAD
  )
  const splits = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'splits',
    undefined,
    NEVER_RELOAD
  )
  const vesting = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_FLORA_FARMS_INTERFACE,
    'vestingPeriod',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]
      const totalVestedAmountState = totalVestedAmount[index]
      const claimedSplitsState = claimedSplits[index]
      const hasClaimedPartialState = hasClaimed[index]
      const totalEarnedRewardState = totalEarnedReward[index]
      const userVestingInfoState = userVestingInfo[index]
      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const splitWindowState = splitWindow[index]
      const splitsState = splits[index]
      const vestingState = vesting[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !claimedSplitsState?.loading &&
        !hasClaimedPartialState?.loading &&
        !totalVestedAmountState?.loading &&
        !totalEarnedRewardState?.loading &&
        !userVestingInfoState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        splitWindowState &&
        !splitWindowState.loading &&
        splitsState &&
        !splitsState.loading &&
        vestingState &&
        !vestingState.loading

      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          claimedSplitsState?.error ||
          userVestingInfoState?.error ||
          totalEarnedRewardState?.error ||
          hasClaimedPartialState?.error ||
          totalVestedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          splitWindowState.error ||
          splitsState.error ||
          vestingState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        // check for account, if no account set to 0

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState?.result?.[0] ?? 0))
        const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(rewardRateState?.result?.[0] ?? 0))
        const totalVestedAmount = new TokenAmount(uni, JSBI.BigInt(totalVestedAmountState?.result?.[0] ?? 0))
        const totalEarnedReward = new TokenAmount(uni, JSBI.BigInt(totalEarnedRewardState?.result?.[0] ?? 0))
        const userClaimedSplit = claimedSplitsState?.result?.[0]?.toNumber() ?? 0;
        const splits = splitsState?.result?.[0]?.toNumber() ?? 0
        const hasClaimedPartial = hasClaimedPartialState?.result?.[0] ?? false
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

        const vestingPeriodSeconds = vestingState.result?.[0]?.toNumber()
        const vestingPeriodMs = vestingPeriodSeconds * 1000

        const splitWindowSeconds = splitWindowState.result?.[0]?.toNumber()
        const splitWindowStateMs = splitWindowSeconds * 1000



        // compare period end timestamp vs current block timestamp (in seconds)
        const active = periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp?.toNumber() : true

        // compare vesting end timestamp vs current block timestamp (in seconds)
        const vestingEndsSeconds = vestingPeriodSeconds + periodFinishSeconds;
        const vestingActive = vestingEndsSeconds && currentBlockTimestamp ? vestingEndsSeconds > currentBlockTimestamp?.toNumber() : true
        let currentSplit = Math.sign(Math.floor(Date.now() / 1000) - periodFinishSeconds) === -1 ? 0 : (Math.floor(Date.now() / 1000) - periodFinishSeconds) / splitWindowSeconds;

        currentSplit = currentSplit > splits ? splits : currentSplit;

        const unlockAt = active ? periodFinishSeconds : vestingActive ? (periodFinishSeconds + (Math.floor(currentSplit + 1) * splitWindowSeconds)) : vestingEndsSeconds;
        const unclaimedSplits = BigNumber.from((Math.floor(currentSplit) - userClaimedSplit))

        let unclaimedAmount = BigNumber.from(totalVestedAmountState?.result?.[0] ?? 0).mul(unclaimedSplits).div(BigNumber.from(splits))
        unclaimedAmount = unclaimedAmount.div(BigNumber.from('1000000000000000000'))

        let ableToClaim = !vestingActive || (Math.floor(Date.now() / 1000) >= periodFinishSeconds &&
          (userClaimedSplit !== Math.floor(currentSplit) ? true : !hasClaimedPartial))
        memo.push({
          type: { typeOf: 'Archived Popular Farms', url: 'popular-farms/archived' },
          stakingRewardAddress: rewardsAddress,
          baseToken: info[index].baseToken,
          version: info[index].version,
          burnRate: info[index].burnRate,
          startTime: info[index].startTime ?? 0,
          rewardToken: info[index].rewardToken ?? uni,
          tokens: info[index].tokens,
          userVestingInfo: { hasSetConfig: userVestingInfoState?.result?.[0].hasSetConfig, hasOptForVesting: userVestingInfoState?.result?.[0].hasOptForVesting },
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          splitWindow: splitWindowStateMs > 0 ? new Date(splitWindowStateMs) : undefined,
          vestingPeriod: vestingPeriodMs > 0 ? new Date(periodFinishMs + vestingPeriodMs) : undefined, //vesting period after period ends
          earnedAmount: new TokenAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          unclaimedAmount: unclaimedAmount,
          totalVestedAmount: totalVestedAmount,
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          claimedSplits: userClaimedSplit,
          totalEarnedReward,
          ableToClaim,
          dfynPrice,
          hasClaimedPartial,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          unlockAt: unlockAt > 0 ? new Date(unlockAt * 1000) : undefined,
          vestingActive,
          active
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    totalEarnedReward,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    claimedSplits,
    totalVestedAmount,
    splitWindow,
    splits,
    hasClaimed,
    vesting,
    uni,
    dfynPrice,
    userVestingInfo
  ])
}

export function useTotalFloraUniEarned(): TokenAmount | undefined {
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