//@ts-nocheck
import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { ArrowUpIcon, ArrowDownIcon, Flex, FlexProps } from '@pancakeswap/uikit'
import { BetPosition } from 'state/prediction/types'
import { TYPE } from 'theme'

interface TagProps extends FlexProps {
  bg?: string
  startIcon?: ReactNode
}

const StyledTag = styled(Flex) <{ bg: TagProps['bg'] }>`
  background-color: 'blue';
  display: inline-flex;
`

export const Tag: React.FC<TagProps> = ({ bg = 'success', startIcon, children, onClick, ...props }) => {
  const icon = startIcon || <ArrowUpIcon color="white" />

  return (
    <StyledTag
      alignItems="center"
      justifyContent="center"
      borderRadius="4px"
      bg={bg}
      py="4px"
      px="8px"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'normal' }}
      {...props}
    >
      {icon}
      <TYPE.white ml="4px">
        {children}
      </TYPE.white>
    </StyledTag>
  )
}

interface PositionTagProps extends FlexProps {
  betPosition: BetPosition
}

const PositionTag: React.FC<PositionTagProps> = ({ betPosition, children, ...props }: PositionTagProps) => {
  const isUpPosition = betPosition === BetPosition.BULL
  const icon = isUpPosition ? <ArrowUpIcon color="green" /> : <ArrowDownIcon color="red" />

  return (
    <Tag bg={isUpPosition ? '#29a329' : '#ff471a'} startIcon={icon} {...props}>
      {children}
    </Tag>
  )
}

export default PositionTag
