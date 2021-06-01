import { ChainId, TokenAmount } from '@uniswap/sdk'
import React from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import tokenLogo from '../../assets/big-dfyn.svg'
import { UNI } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
// import { useTotalSupply } from '../../data/TotalSupply'
// import { useMerkleDistributorContract } from '../../hooks/useContract'
// import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
// import { computeUniCirculation } from '../../utils/computeUniCirculation'
import { useTotalUniEarned } from '../../state/stake/hooks'
import { useAggregateUniBalance, useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLink, TYPE, UniTokenAnimated } from '../../theme'
import useUSDCPrice from '../../utils/useUSDCPrice'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { Break, CardBGImage, CardNoise, CardSection, DataCard } from '../earn/styled'
import { useTotalVaultUniEarned } from 'state/vault/hooks'
import { useTotalMultiVaultUniEarned } from 'state/multiTokenVault/hooks'
import { useTotalFloraUniEarned } from 'state/flora-farms/hooks'
import { useTotalDualFarmUniEarned } from 'state/dual-stake/hooks'
import { useTotalEcosystemUniEarned } from 'state/vanilla-stake/hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #021d43 100%);
  padding: 0.5rem;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;
  :hover {
    cursor: pointer;
  }
`

/**
 * Content for balance stats modal
 */
export default function UniBalanceContent({ setShowUniBalanceModal }: { setShowUniBalanceModal: any }) {
  const { account, chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined

  const total = useAggregateUniBalance()
  const uniBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, uni)
  const uniToClaimPreStake: TokenAmount | undefined = useTotalUniEarned()
  const uniToClaimDualFarms: TokenAmount | undefined = useTotalDualFarmUniEarned()
  //Adding vault rewards
  const uniToClaimMultiVault: TokenAmount | undefined = useTotalMultiVaultUniEarned()
  const uniToClaimVault: TokenAmount | undefined = useTotalVaultUniEarned()
  const totalUniToClaimVault: TokenAmount | undefined = uniToClaimMultiVault ? uniToClaimVault?.add(uniToClaimMultiVault) : uniToClaimVault
  const uniToClaimFlora: TokenAmount | undefined = useTotalFloraUniEarned()
  const uniToClaimEcosystem: TokenAmount | undefined = useTotalEcosystemUniEarned()

  const uniPrice = useUSDCPrice(uni)
  // const totalSupply: TokenAmount | undefined = useTotalSupply(uni)
  // const blockTimestamp = useCurrentBlockTimestamp()
  // const unclaimedUni = useTokenBalance(useMerkleDistributorContract()?.address, uni)
  // const circulation: TokenAmount | undefined = useMemo(
  //   () =>
  //     blockTimestamp && uni && chainId === ChainId.MAINNET
  //       ? computeUniCirculation(uni, blockTimestamp, unclaimedUni)
  //       : totalSupply,
  //   [blockTimestamp, chainId, totalSupply, unclaimedUni, uni]
  // )

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        <CardBGImage />
        <CardNoise />
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color="white">Your DFYN Breakdown</TYPE.white>
            <StyledClose stroke="white" onClick={() => setShowUniBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Break />
        {account && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                <UniTokenAnimated width="48px" src={tokenLogo} />{' '}
                <TYPE.white fontSize={48} fontWeight={600} color="white">
                  {total?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.white>
              </AutoColumn>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600} color="white">Balance:</TYPE.white>
                  <TYPE.white color="white">{uniBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white fontWeight={600} color="white">Unclaimed DFYN</TYPE.white>
                </RowBetween>

                <RowBetween>
                  <TYPE.white color="white">• Pre-Stake:</TYPE.white>
                  <TYPE.white color="white">
                    {uniToClaimPreStake?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {/* {uniToClaim && uniToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/dfyn">
                        (claim)
                      </StyledInternalLink>
                    )} */}
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">• Vault:</TYPE.white>
                  <TYPE.white color="white">
                    {(totalUniToClaimVault)?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {/* {uniToClaim && uniToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/dfyn">
                        (claim)
                      </StyledInternalLink>
                    )} */}
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">• Popular Farms:</TYPE.white>
                  <TYPE.white color="white">
                    {uniToClaimFlora?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {/* {uniToClaim && uniToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/dfyn">
                        (claim)
                      </StyledInternalLink>
                    )} */}
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">• Ecosystem Farms:</TYPE.white>
                  <TYPE.white color="white">
                    {uniToClaimEcosystem?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {/* {uniToClaim && uniToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/dfyn">
                        (claim)
                      </StyledInternalLink>
                    )} */}
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">• Dual Farms:</TYPE.white>
                  <TYPE.white color="white">
                    {uniToClaimDualFarms?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {/* {uniToClaim && uniToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/dfyn">
                        (claim)
                      </StyledInternalLink>
                    )} */}
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
            <Break />
          </>
        )}
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.white color="white">DFYN price:</TYPE.white>
              <TYPE.white color="white">${uniPrice?.toFixed(2) ?? '-'}</TYPE.white>
            </RowBetween>
            {/* <RowBetween>
              <TYPE.white color="white">DFYN in circulation:</TYPE.white>
              <TYPE.white color="white">{circulation?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">Total Supply</TYPE.white>
              <TYPE.white color="white">{totalSupply?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
            </RowBetween> */}
            {uni && uni.chainId === ChainId.MAINNET ? (
              <ExternalLink href={`https://info.dfyn.network/token/${uni.address}`}>View DFYN Analytics</ExternalLink>
            ) : null}
          </AutoColumn>
        </CardSection>
      </ModalUpper>
    </ContentWrapper>
  )
}