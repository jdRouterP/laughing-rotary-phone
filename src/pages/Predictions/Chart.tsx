import React from 'react'
import styled from 'styled-components'
import Menu from './components/Menu'

const MenuWrapper = styled.div`
  flex: none;
`


const Chart = () => {
  return (
    <MenuWrapper>
      <Menu />
    </MenuWrapper>
  )
}

export default Chart
