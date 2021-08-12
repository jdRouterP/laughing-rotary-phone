//@ts-nocheck
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Dialog } from '@material-ui/core';
// import { Tabs, Tab } from '@material-ui/core';
// import RoundsContent from './RoundsContent';
import { useGetCurrentEpoch, useGetHistoryByAccount, useGetHistoryFilter, useGetIsFetchingHistory, useIsHistoryPaneOpen } from 'state/hook';
import { useDispatch } from 'react-redux';
import { fetchHistory, setHistoryPaneState } from 'state/prediction/reducer';
import { useActiveWeb3React } from 'hooks';
import { Header, HistoryTabs } from 'pages/Predictions/components/History';
import PnlTab from 'pages/Predictions/components/History/PnlTab/PnlTab';
import RoundsTab from 'pages/Predictions/components/History/PnlTab/PnlTab';
import { HistoryFilter } from 'state/prediction/types';
import { getUnclaimedWinningBets } from 'state/prediction/hooks';
import { Flex, Text } from '@pancakeswap/uikit';
import { ButtonLight } from 'components/Button';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';




const Modal = styled(Dialog)`
&&&{
	.MuiPaper-root{
        
        height: 700px;
    width: 451px;
    background: ${({ theme }) => theme.bg1};
    border-radius: 20px;
	}
	.MuiDialog-paper{
		margin:0;
		overflow: hidden;
	}
	.MuiDialog-paperWidthSm{
		max-width: none;
	}
	.MuiPaper-rounded{
		border-radius:0;
	}
    &:focus{
    outline: none;
	}
}
`;

const BetWrapper = styled.div`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  position: relative;
`

// const HistoryWrapper = styled.div`
//     height: 700px;
//     width: 451px;
//     background: ${({ theme }) => theme.bg1};
//     border-radius: 20px;
// `

// const HistoryHeader = styled.div`
//     font-size: 24px;
//     font-weight: bold;
//     color: ${({ theme }) => theme.text1};
//     display: grid;
//     place-items: center;
//     padding: 30px;
// `

// const HistoryTitle = styled.div`
//     margin-bottom: 30px;
// `

// const StyledTabsWrapper = styled.div`
//     border: 1px solid ${({ theme }) => theme.red1};
//     border-radius: 11.5px;
//     margin: 0 auto;
//     width: 351px;
// `

// const StyledTabs = styled(Tabs)`
//     &&&{
//         width: 100%;
//         height: 35px;
//         border-radius: 11px;
//         background-color: ${({ theme }) => theme.bg2};
//     }
//     .PrivateTabIndicator-root-1{
//         display:none;                                                                   
//     }
//     .PrivateTabIndicator-colorSecondary-4{
//         display:none; 
//     }
//     .jss3{
// 		display:none !important; 
// 	}
// 	.jss1{
// 		display:none !important; 
// 	}
// 	.MuiTabs-indicator{
// 		display:none !important; 
// 	}
// `

// const StyledTab = styled(Tab) <{ active: boolean }>`
// &&&{
//     width: 50%;
//     height:100%;
//     color: ${({ active, theme }) => active ? '#FFFF' : theme.text1};
//     border: ${({ theme, active }) => active ? `1px solid ${theme.red1}` : ''};
//     background: ${({ theme, active }) => active ? theme.red1 : 'none'};
//     border-radius: ${({ active }) => active ? 10 : 0}px;
//     font-weight: ${({ active }) => active ? 600 : 400};
//     font-size: 16px;
//     text-transform: none;
// }
// `
// const HistoryContent = styled.div`
//     color: ${({ theme }) => theme.text1};
// `
// const RoundsWraper = styled.div`

// `

// const PnlWrapper = styled.div`

// `

const SpinnerWrapper = styled.div`
  align-items: center;
  display: flex;
  left: 0;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
`

const History = () => {

    // const [tabValue, setTabValue] = useState<number>(0);
    const { account } = useActiveWeb3React()
    const toggleWalletModal = useWalletModalToggle()
    const dispatch = useDispatch()
    const isHistoryPaneOpen = useIsHistoryPaneOpen()
    const isFetchingHistory = useGetIsFetchingHistory()
    const historyFilter = useGetHistoryFilter()
    const currentEpoch = useGetCurrentEpoch()
    const { t } = useTranslation()
    const bets = useGetHistoryByAccount(account)
    const [activeTab, setActiveTab] = useState(HistoryTabs.ROUNDS)

    useEffect(() => {
        if (account && isHistoryPaneOpen) {
            dispatch(fetchHistory({ account }))
        }
    }, [account, currentEpoch, isHistoryPaneOpen, dispatch])
    // Currently the api cannot filter by unclaimed AND won so we do it here
    // when the user has selected Uncollected only include positions they won
    const results = historyFilter === HistoryFilter.UNCOLLECTED ? getUnclaimedWinningBets(bets) : bets

    const hasBetHistory = results && results.length > 0

    let activeTabComponent = null

    switch (activeTab) {
        case HistoryTabs.PNL:
            activeTabComponent = <PnlTab hasBetHistory={hasBetHistory} bets={results} />
            // activeTabComponent = 'PNL Content'
            break
        case HistoryTabs.ROUNDS:
        default:
            activeTabComponent = <RoundsTab hasBetHistory={hasBetHistory} bets={results} />
            // activeTabComponent = <RoundsContent />
            break
    }

    if (!account) {
        activeTabComponent = (
            <Flex justifyContent="center" alignItems="center" flexDirection="column" mt="32px">
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                <Text mt="8px">{t('Connect your wallet to view your prediction history')}</Text>
            </Flex>
        )
    }


    const handleClick = () => {
        dispatch(setHistoryPaneState(!isHistoryPaneOpen))
    }

    return (

        <Modal onClose={handleClick} open={isHistoryPaneOpen}>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <BetWrapper>
                {isFetchingHistory ? (
                    <SpinnerWrapper>
                        <Text>Loading...</Text>
                    </SpinnerWrapper>
                ) : (
                    activeTabComponent
                )}
            </BetWrapper>
        </Modal>

    )
}

export default History
