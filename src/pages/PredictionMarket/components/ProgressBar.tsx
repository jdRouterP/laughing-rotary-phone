import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import styled from 'styled-components'

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
});

const StyledLinearProgress = styled(LinearProgress)`
    &&&{
        height: 7px;
    }
`
interface Props {
    totalTime: number
}

export default function ProgressBar({ totalTime }: Props) {
    const classes = useStyles();
    const [progress, setProgress] = React.useState(0);

    //const totalTime = 10 //in MS

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                return oldProgress + ((1 / totalTime) * 100);
            });
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className={classes.root}>
            <StyledLinearProgress variant="determinate" value={progress} />
        </div>
    );
}