import { AutoColumn } from 'components/Column'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'
import { X } from 'react-feather'
import { ButtonError } from 'components/Button'
import { useFloraFarmsContract } from 'hooks/useContract'
import { TransactionResponse } from '@ethersproject/providers'
import { StakingInfo } from 'state/flora-farms/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { TYPE } from 'theme'

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 20px;
`
const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

interface BurnConfirmationModalProps {
    isOpen: boolean
    setShowConfirmation: (arg0: boolean) => void
    setVestingMode: (arg0: boolean) => void
    stakingInfo: StakingInfo
    vesting: boolean
}


const BurnConfirmationModal = ({ isOpen, setShowConfirmation, stakingInfo, setVestingMode, vesting }: BurnConfirmationModalProps) => {
    //const theme = useContext(ThemeContext)

    // const { account } = useActiveWeb3React()

    // monitor call to help UI loading state
    const addTransaction = useTransactionAdder()

    const [hash, setHash] = useState<string | undefined>()

    const [attempting, setAttempting] = useState(false)

    function wrappedOnDismiss() {
        setShowConfirmation(false);
        setHash(undefined)
        setAttempting(false)
    }

    const stakingContract = useFloraFarmsContract(stakingInfo.stakingRewardAddress)
    async function onSetConfig() {
        if (stakingContract) {
            setAttempting(true)
            await stakingContract
                .setVestingConfig(!vesting, { gasLimit: 350000 })
                .then((response: TransactionResponse) => {
                    addTransaction(response, {
                        summary: `Set Config for Vesting`
                    })
                    setHash(response.hash)
                    setVestingMode(!vesting);
                })
                .catch((error: any) => {
                    setAttempting(false)
                    console.log(error)
                })
        }
        console.log("I am here!");
    }

    return (
        <div>
            <Modal isOpen={isOpen} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
                {!attempting && !hash && <ModalContentWrapper>
                    <AutoColumn gap="lg">
                        <RowBetween style={{ padding: '0 2rem' }}>
                            <div />
                            <Text fontWeight={500} fontSize={20}>
                                Are you sure?
              </Text>
                            <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
                        </RowBetween>
                        <Break />
                        <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
                            <Text fontWeight={500} fontSize={20}>
                                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                                in bad rates and lost funds.
              </Text>
                            <Text fontWeight={600} fontSize={20}>
                                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </Text>
                            <ButtonError
                                error={true}
                                padding={'12px'}
                                onClick={() => {
                                    onSetConfig()
                                }}
                            >
                                <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                                    Turn On Burn Mode
                </Text>
                            </ButtonError>
                        </AutoColumn>
                    </AutoColumn>
                </ModalContentWrapper>}
                {attempting && !hash && (
                    <LoadingView onDismiss={wrappedOnDismiss}>
                        <AutoColumn gap="12px" justify={'center'}>
                            <TYPE.body fontSize={20}>Setting Burnable to {"True"}</TYPE.body>
                        </AutoColumn>
                    </LoadingView>
                )}
                {hash && (
                    <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
                        <AutoColumn gap="12px" justify={'center'}>
                            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
                            <TYPE.body fontSize={20}>Now you'll get 50% of your reward rest will burn</TYPE.body>
                        </AutoColumn>
                    </SubmittedView>
                )}
            </Modal>
        </div>
    )
}

export default BurnConfirmationModal
