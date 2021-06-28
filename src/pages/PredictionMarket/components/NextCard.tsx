import React from 'react'
import styled from 'styled-components'
import { ButtonPrimary } from '../../../components/Button'

interface Props {

}

const Wrapper = styled.div`
    margin: 0 20px;
`
const TitleWrapper = styled.div`
    width: 320px;
    height: 40px;
    border: 1px solid blue;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

`
const Title = styled.div`
    font-size:16px;
    font-weight:600;
    padding: 0 20px;
    display:flex;
    justify-content: space-between;
`

const ContentWrapper = styled.div`
    width: 320px;
    height: 340px;
    border: 1px solid red;
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const Content = styled.div`
    width: 280px;
    height: 170px;
    border: 1px solid pink;
    border-radius: 12px;
    padding: 20px 15px;
    display:flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 20px 0;
`

const PrizePool = styled.div`
    font-size: 16px;
    font-weight: bold;
    display:flex;
    justify-content: space-between;
`

const Payout = styled.div`
    display: grid;
    place-items: center;
`

const PayoutAmount = styled.div`
    font-size: 16px;
    font-weight: bold;
`

const PayoutLabel = styled.div`
    font-size: 20px;
    font-weight: bold;
`
const UpButton = styled(ButtonPrimary)`
    &&&{
        height: 48px;
        text-transform: none;
        font-size: 18px;
        color:#ffff
        background: ${({ theme }) => theme.green1};
        padding:0;
        margin:0;
    }
`
const DownButton = styled(UpButton)`
    &&&{
        background: ${({ theme }) => theme.red1};
    }
`

const NextCard = (props: Props) => {
    return (
        <Wrapper>
            <TitleWrapper>
                <Title>
                    <span>
                        NEXT
                    </span>
                    <span style={{ fontWeight: 400 }}>
                        #6969
                    </span>
                </Title>
            </TitleWrapper>
            <ContentWrapper>
                <Payout>
                    <PayoutLabel>
                        UP
                    </PayoutLabel>
                    <PayoutAmount>
                        <span>1.24x{' '}</span>
                        <span>Payout</span>
                    </PayoutAmount>
                </Payout>
                <Content>
                    <PrizePool>
                        <span>
                            Prize Pool:
                        </span>
                        <span>
                            36.630 MATIC
                        </span>
                    </PrizePool>
                    <UpButton>
                        Enter UP
                    </UpButton>
                    <DownButton>
                        Enter DOWN
                    </DownButton>
                </Content>
                <Payout>
                    <PayoutAmount>
                        <span>1.24x{' '}</span>
                        <span>Payout</span>
                    </PayoutAmount>
                    <PayoutLabel>
                        DOWN
                    </PayoutLabel>
                </Payout>
            </ContentWrapper>
        </Wrapper>
    )
}

export default NextCard
