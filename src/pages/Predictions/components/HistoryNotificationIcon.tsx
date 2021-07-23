import { HistoryIcon } from '@pancakeswap/uikit'
import React from 'react'
import styled from 'styled-components'

const NotificationIcon = styled.div`
    position: absolute;
    top: -10px;
    right: -10px;
    padding: 5px 10px;
    border-radius: 50%;
    background: red;
    color: white;
`

export default function HistoryNotificationIcon() {
    return (
        <div>
            <HistoryIcon width="24px" color="white" />
            <NotificationIcon /> 
        </div>
    )
}
