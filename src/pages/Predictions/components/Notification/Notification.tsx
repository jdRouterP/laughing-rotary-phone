import React from 'react'
import styled from 'styled-components'
import { Card, CardBody } from '@pancakeswap/uikit'
import { TYPE } from 'theme'

interface NotificationProps {
  title: string
}

// const BunnyDecoration = styled.div`
//   position: absolute;
//   top: -130px; // line up bunny at the top of the modal
//   left: 0px;
//   text-align: center;
//   width: 100%;
// `

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
`

const CardWrapper = styled.div`
  position: relative;
  width: 320px;
`

// const BunnyDecoration = styled.div`
//   position: absolute;
//   top: -130px;
//   left: 0px;
//   text-align: center;
//   width: 100%;
//   z-index: 5;
// `

const Notification: React.FC<NotificationProps> = ({ title, children }) => {
  return (
    <Wrapper>
      <CardWrapper>
        <Card>
          <CardBody>
            <TYPE.mediumHeader mb="24px">{title}</TYPE.mediumHeader>
            {children}
          </CardBody>
        </Card>
      </CardWrapper>
    </Wrapper >
  )
}

export default Notification
