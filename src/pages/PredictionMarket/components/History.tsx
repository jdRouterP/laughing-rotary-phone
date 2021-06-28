//@ts-nocheck
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Dialog } from '@material-ui/core';
import { Tabs, Tab } from '@material-ui/core';
import RoundsContent from './RoundsContent';
import { useGetCurrentEpoch, useGetHistoryByAccount, useGetHistoryFilter, useGetIsFetchingHistory, useIsHistoryPaneOpen } from 'state/hook';
import { useDispatch } from 'react-redux';
import { fetchHistory, setHistoryPaneState } from 'state/prediction/reducer';
import { useActiveWeb3React } from 'hooks';
import { HistoryTabs } from 'pages/Predictions/components/History';
import { HistoryFilter } from 'state/prediction/types';
import { getUnclaimedWinningBets } from 'state/prediction/hooks';
import { Flex, Text } from '@pancakeswap/uikit';
import { ButtonLight } from 'components/Button';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';

const Wrapper = styled.div`

`

// const HistoryOpenButton = styled.div`
//     width:51px;
//     height: 51px;
//     border-radius: 16px;
//     background: rgb(122, 110, 170);
//     cursor: pointer;
// `

const Modal = styled(Dialog)`
&&&{
	.MuiPaper-root{
		background: transparent;
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

const HistoryWrapper = styled.div`
    height: 700px;
    width: 451px;
    background: ${({ theme }) => theme.bg1};
    border-radius: 20px;
`

const HistoryHeader = styled.div`
    font-size: 24px;
    font-weight: bold;
    color: ${({ theme }) => theme.text1};
    display: grid;
    place-items: center;
    padding: 30px;
`

const HistoryTitle = styled.div`
    margin-bottom: 30px;
`

const StyledTabsWrapper = styled.div`
    border: 1px solid ${({ theme }) => theme.red1};
    border-radius: 11.5px;
    margin: 0 auto;
    width: 351px;
`

const StyledTabs = styled(Tabs)`
    &&&{
        width: 100%;
        height: 35px;
        border-radius: 11px;
        background-color: ${({ theme }) => theme.bg2};
    }
    .PrivateTabIndicator-root-1{
        display:none;                                                                   
    }
    .PrivateTabIndicator-colorSecondary-4{
        display:none; 
    }
    .jss3{
		display:none !important; 
	}
	.jss1{
		display:none !important; 
	}
	.MuiTabs-indicator{
		display:none !important; 
	}
`

const StyledTab = styled(Tab) <{ active: boolean }>`
&&&{
    width: 50%;
    height:100%;
    color: ${({ active, theme }) => active ? '#FFFF' : theme.text1};
    border: ${({ theme, active }) => active ? `1px solid ${theme.red1}` : ''};
    background: ${({ theme, active }) => active ? theme.red1 : 'none'};
    border-radius: ${({ active }) => active ? 10 : 0}px;
    font-weight: ${({ active }) => active ? 600 : 400};
    font-size: 16px;
    text-transform: none;
}
`
const HistoryContent = styled.div`
    color: ${({ theme }) => theme.text1};
`
const RoundsWraper = styled.div`

`

const PnlWrapper = styled.div`

`

const History = () => {

    const [tabValue, setTabValue] = useState<number>(0);
    const { account } = useActiveWeb3React()
    const toggleWalletModal = useWalletModalToggle()
    const isHistoryPaneOpen = useIsHistoryPaneOpen()
    const dispatch = useDispatch();
    const { t } = useTranslation()
    const historyFilter = useGetHistoryFilter()
    const currentEpoch = useGetCurrentEpoch()
    const bets = useGetHistoryByAccount(account)
    const [activeTab, setActiveTab] = useState(HistoryTabs.ROUNDS)
    const isFetchingHistory = useGetIsFetchingHistory();
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

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
            //   activeTabComponent = <PnlTab hasBetHistory={hasBetHistory} bets={results} />
            activeTabComponent = 'PNL Content'
            break
        case HistoryTabs.ROUNDS:
        default:
            //   activeTabComponent = <RoundsTab hasBetHistory={hasBetHistory} bets={results} />
            activeTabComponent = <RoundsContent />
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
        <Wrapper>
            <Modal onClose={handleClick} open={isHistoryPaneOpen}>
                <HistoryWrapper>
                    <HistoryHeader>
                        <HistoryTitle>
                            History
                        </HistoryTitle>
                        <StyledTabsWrapper>
                            <StyledTabs value={tabValue} onChange={handleTabChange}>
                                <StyledTab label='Rounds' active={tabValue === 0} />
                                <StyledTab label='PNL' active={tabValue === 1} />
                            </StyledTabs>
                        </StyledTabsWrapper>
                    </HistoryHeader>
                    <HistoryContent>
                        {
                            (tabValue === 0) &&
                            <RoundsWraper>
                                <RoundsContent />
                            </RoundsWraper>
                        }
                        {
                            (tabValue === 1) &&
                            <PnlWrapper>
                                PNL Content
                            </PnlWrapper>
                        }
                    </HistoryContent>
                </HistoryWrapper>
            </Modal>
        </Wrapper>
    )
}

export default History
