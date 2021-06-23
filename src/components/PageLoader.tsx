import React from 'react'
import styled from 'styled-components'


const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const PageLoader: React.FC = () => {
  return (
    <Wrapper>
      <h1>Loading...</h1>
    </Wrapper>
  )
}

export default PageLoader
