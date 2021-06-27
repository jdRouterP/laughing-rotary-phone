import React from 'react'
import styled from 'styled-components'
import RoundHistoryCard from './RoundHistoryCard'
import YourHistoryCard from './YourHistoryCard'

interface Props {

}

const Wrapper = styled.div`
    overflow-y: scroll;
    display: grid;
    place-items: center;
    height: 505px;
`

const RowWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 340px;
    margin: 7px 0;
    font-size: 16px;
`

const BlockType = styled.div``

const BlockNumber = styled.div`
    font-weight: bold;
`

const RoundsContent = (props: Props) => {
    return (
        <Wrapper>
            <YourHistoryCard />
            <RoundHistoryCard />
            <RowWrapper>
                <BlockType>
                    Opening Block
                </BlockType>
                <BlockNumber>
                    8658490
                </BlockNumber>
            </RowWrapper>
            <RowWrapper>
                <BlockType>
                    Closing Block
                </BlockType>
                <BlockNumber>
                    8658490
                </BlockNumber>
            </RowWrapper>
        </Wrapper>
    )
}

export default RoundsContent
