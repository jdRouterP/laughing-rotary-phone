import React from 'react'
import { TYPE } from 'theme'
import styled from 'styled-components'


interface NotificationProps {
  title: string
}

const Wrapper = styled.div`
  max-width: 460px;
  width: 100%;
  border: 1px solid;
  padding: 20px 20px;
    border-radius: 10px;
`

const Notification: React.FC<NotificationProps> = ({ title, children }) => {
  return (
    <Wrapper>
      <TYPE.mediumHeader mb='20px' style={{ fontSize: "26px" }}>{title}</TYPE.mediumHeader>
      {children}
    </Wrapper>
  )
}

export default Notification
