import { ButtonLight } from 'components/Button'
import { CardNoise } from 'components/earn/styled'
import { RowBetween } from 'components/Row'
import { BottomGrouping } from 'components/swap/styleds'
import React from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'

const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  width: 0;
  position: relative;
  font-weight: 500;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: ${({ theme }) => theme.bg1};
  font-size: ${({ fontSize }) => fontSize ?? '24px'};
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.primary5};
  border: 1px solid ${({ theme }) => theme.primary5};
  border-radius: 0.5rem;
  font-size: 0.875rem;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.primaryText1};
  :hover {
    border: 1px solid ${({ theme }) => theme.primary1};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.bg2};
  padding: 0.75rem 0.5rem 0.75rem 1rem;
`

const MainComponent = styled.div`
    margin-top: 1rem;
    width: 100%;
`

const BodyStyle = styled.div`
    width: 100%;
`
const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const UNIAmount = styled.div`
  color: white;
  border-radius: 10px;
  margin: auto;
  padding: 4px 8px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

export default function InputComponent({label}: {label: string}) {
    return (
        <BodyStyle>
            <RowBetween>
                <TYPE.black>{label}</TYPE.black>
                <UNIWrapper>
                    <UNIAmount>
                        <TYPE.white padding="0 2px">
                            1DFYN = 1.5xDFYN
                        </TYPE.white>
                    </UNIAmount>
                    <CardNoise />
                </UNIWrapper> 
            </RowBetween>
            <MainComponent>
                <InputRow>
                    <>
                        <StyledInput placeholder={"0.0"} />
                        <TYPE.black style={{marginRight: '20px', fontSize: '15px'}}>Balance:</TYPE.black>
                        <StyledBalanceMax>MAX</StyledBalanceMax>
                    </>
                </InputRow>
                <BottomGrouping>
                    <ButtonLight>Connect Wallet</ButtonLight>
                </BottomGrouping>
            </MainComponent>
        </BodyStyle>
    )
}
