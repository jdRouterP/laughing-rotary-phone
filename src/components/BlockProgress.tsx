import React from 'react'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp';
import Progress from './Progress/Progress';
import { ProgressProps } from '@pancakeswap/uikit';

interface BlockProgressProps extends ProgressProps {
    startBlock: number
    endBlock: number
}

const BlockProgress: React.FC<BlockProgressProps> = ({ startBlock, endBlock, ...props }) => {
    const currentBlock = useCurrentBlockTimestamp()?.toNumber() ?? 0;
    const rawProgress = ((currentBlock - startBlock) / (endBlock - startBlock)) * 100
    const progress = rawProgress <= 100 ? rawProgress : 100

    return <Progress primaryStep={progress} {...props} />
}

export default BlockProgress
