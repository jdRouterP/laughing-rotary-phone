import React from 'react'
import styled from 'styled-components'

import { ReactComponent as Close } from '../../assets/images/x.svg'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useNetworkModalToggle } from '../../state/application/hooks'
import { ChainId } from '@uniswap/sdk'
import Modal from '../Modal'
import Option from './Options'
import { NETWORK_ICON, SUPPORTED_NETWORKS } from 'constants/networks'
import { useActiveWeb3React } from 'hooks'

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  padding: 2rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`
const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`

export default function NetworkModal() {
    const { account, error, library, chainId } = useActiveWeb3React()


    const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)

    const toggleNetworkModal = useNetworkModalToggle()

    function getOptions() {

        return [
            ChainId.MATIC,
            ChainId.OKEX,
        ].map((key: ChainId) => {
            const option = SUPPORTED_NETWORKS[key]
            return (
                <Option
                    id={`connect-${key}`}
                    onClick={() => {
                        toggleNetworkModal()
                        const params = option
                        debugger
                        library?.send('wallet_addEthereumChain', [
                            params,
                            account,
                        ])
                    }}
                    key={key}
                    active={chainId === key}
                    color={"white"}
                    header={option?.chainName}
                    subheader={null} //use option.descriptio to bring back multi-line
                    icon={NETWORK_ICON[key]}
                />
            )
        }
        )
    }

    function getModalContent() {
        if (error) {
            return (
                <UpperSection>
                    <CloseIcon onClick={toggleNetworkModal}>
                        <CloseColor />
                    </CloseIcon>
                    <HeaderRow>{'Error'}</HeaderRow>
                    <ContentWrapper>
                        {"Error"}
                    </ContentWrapper>
                </UpperSection>
            )
        }
        return (
            <UpperSection>
                <CloseIcon onClick={toggleNetworkModal}>
                    <CloseColor />
                </CloseIcon>
                <HeaderRow>
                    <HoverText>Connect to a network</HoverText>
                </HeaderRow>
                <ContentWrapper>
                    {
                        <OptionGrid>{getOptions()}</OptionGrid>
                    }
                </ContentWrapper>
            </UpperSection>
        )
    }

    return (
        <Modal isOpen={networkModalOpen} onDismiss={toggleNetworkModal} minHeight={false} maxHeight={90}>
            <Wrapper>{getModalContent()}</Wrapper>
        </Modal>
    )
}
