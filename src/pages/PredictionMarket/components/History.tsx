import React, { useState } from 'react'
import styled from 'styled-components'
import { Dialog } from '@material-ui/core';
import { Tabs, Tab } from '@material-ui/core';

interface Props {

}

const Wrapper = styled.div`

`

const HistoryOpenButton = styled.div`
    width:51px;
    height: 51px;
    border-radius: 16px;
    background: rgb(122, 110, 170);
    cursor: pointer;
`

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
    height: 651px;
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
    margin-bottom: 30px;
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

const History = (props: Props) => {

    const [openHistory, setOpenHistory] = useState(false)
    const [tabValue, setTabValue] = useState<number>(0);

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Wrapper>
            <Modal onClose={() => setOpenHistory(false)} open={openHistory}>
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
                                Rounds Content
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
            <HistoryOpenButton onClick={() => setOpenHistory(true)}>
            </HistoryOpenButton>
        </Wrapper>
    )
}

export default History
