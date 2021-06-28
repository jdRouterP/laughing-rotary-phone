import React from 'react'
import styled from 'styled-components'
import tokenLogo from '../assets/big-dfyn.svg'
import { UniTokenAnimated } from 'theme'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const PageLoader: React.FC = () => {
  return (
    <Wrapper>
      <UniTokenAnimated width="168px" src={tokenLogo} />
    </Wrapper>
  )
}

export default PageLoader
