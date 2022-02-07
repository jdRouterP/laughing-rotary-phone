// import { useActiveWeb3React } from 'hooks'
// import { useDfynByofContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks'
import { useDfynByofContract } from 'hooks/useContract'
import React, {useMemo} from 'react'
import { useSingleCallResult } from 'state/multicall/hooks'
// import { useSingleCallResult } from 'state/multicall/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import BuildFarm from './BuildFarm'
// import BuildFarm from './BuildFarm'
// import FarmForm1 from './FarmForm1'
// import FarmForm2 from './FarmForm2'


const MainContent = styled.div`
    display: flex;
    padding: 25px;
    margin-top: 10px;
    max-width: 720px;
    border-radius: 10px;
    width: 100%;
    background: ${({ theme }) => theme.bg1};
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
`
const LeftContent = styled.div`
    width: 100%;
`

const Footer = styled.div`
    width:100%;
    text-align: center;
    margin-bottom: 20px;
`

function BuildFarm1() {
    const byofFactoryContract = useDfynByofContract()
    const { account } = useActiveWeb3React()
    const accountArg = useMemo(() => [account ?? undefined], [account])
    const whiteListed = useSingleCallResult(byofFactoryContract, 'isWhitelisted', accountArg)
    return (
        <>
            <MainContent>
                <LeftContent>
                    {whiteListed.result && !whiteListed.result[0] &&
                        <Footer><TYPE.black>Only whitelisted address allowed to deploy farm
                        Contact Dfyn team (telegram @surajchawla) to whitelist your address</TYPE.black></Footer>
                    } 
                    <BuildFarm />
                </LeftContent>
            </MainContent>
        </>
    )
}

export default BuildFarm1
