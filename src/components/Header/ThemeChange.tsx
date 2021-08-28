import React from 'react'
import { Moon, Sun } from 'react-feather'
import { useDarkModeManager } from 'state/user/hooks'
import styled from 'styled-components'

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  color: ${({theme}) => theme.text1};
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }
`

const HeaderElementWrap = styled.div`
  display: flex;
  position: fixed;
  right: 0;
  bottom: 6px;
  padding: 1rem;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMediumLarge`
    display: none;
  `}
`

export default function ThemeChange() {
    const [darkMode, toggleDarkMode] = useDarkModeManager()
    return (
        <HeaderElementWrap>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
        </HeaderElementWrap>
    )
}
