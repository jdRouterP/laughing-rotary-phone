import { Currency, Token } from '@dfyn/sdk'
import React, { useCallback, useEffect, useMemo, useState} from 'react'
import { Info, Plus, X } from 'react-feather'
import { Field } from 'state/createFarm/action'
import { useDerivedFarmFormInfo, useFarmFormActionHandlers, useFarmFormState } from 'state/createFarm/hook'
import styled, { css } from 'styled-components'
import { TYPE } from 'theme'
// import CurrencyInputPanelFarmForm from './Component/CurrencyModal/CurrencyInputPanelFarmForm'
import RewardsCurrencyInputPanel from './Component/CurrencyModal/RewardsCurrencyInputPanel'
import _get from 'lodash.get'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
// import { darken } from 'polished'
import {  useCurrencyBalances } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks'
import { useFarmForm } from './hooks/useFarmForm'
import { parseUnits } from '@ethersproject/units'
import { ethers } from 'ethers'
import { ButtonConfirmed, ButtonError } from 'components/Button'
import { useDfynByofContract } from 'hooks/useContract'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { useTransactionAdder } from 'state/transactions/hooks'
import Modal from 'components/Modal'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { AutoColumn } from 'components/Column'
import { ApprovalState, useApproveCallbackArr } from 'hooks/useApproveCallback'
import { AutoRow } from 'components/Row'
import { BYOF_FACTORY_ADDRESS, USDC } from 'constants/index'
import Loader from 'components/Loader'
import { toV2LiquidityToken, useIsDarkMode, useTrackedTokenPairs } from 'state/user/hooks'
import { useSingleCallResult } from 'state/multicall/hooks'
import { CheckCircle } from '@material-ui/icons'
import { MouseoverTooltip } from 'components/Tooltip'
import { wrappedCurrency } from 'utils/wrappedCurrency'

enum FarmStrategy {
    ECF = '1',
    DF = '2',
    PF = '3',
    LF = '4',
    MTF = ''
  }


const StyleAdd = styled.div`
    padding: 10px;
`
const LabelStyle = styled.div`
    // max-width: 150px;
    width: 25%;
    margin:  auto 0;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
        margin-bottom: 10px;
    `}
`

const LabelStyle1 = styled.div`
    // max-width: 150px;
    width: 44%;
    margin:  auto 0;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 25%;
    `}
`

const FormStyle = styled.div`
    display: flex;
    width:100%;
    margin-bottom: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-direction: column;
    `}
`

const FormStyle1 = styled.div`
    display: flex;
    width:50%;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
        margin-bottom: 20px;
    `}
`

const FieldStyle = styled.div`
    display: flex;
    width:75%;
    border: 1px solid ${({ theme }) => theme.bg2};
    border-radius: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
    `}
`

const FieldStyleInput = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    width:75%;
    border: 1px solid ${({ theme }) => theme.bg2};
    border-radius: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
    `}
`

const InputField = styled.div`
    display: flex;
    width:100%;
    justify-content: space-between;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
    `}
`
const AddressStyle = styled.div`
  margin-top: 10px;
  display: flex;
`

const FieldStyle1 = styled.div`
    display: flex;
    width:50%;
    border: 1px solid ${({ theme }) => theme.bg2};
    border-radius: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 78%;
    `}
`
const FieldStyle2 = styled.div`
    display: flex;
    width:50%;
    margin-left: 20px;
    border: 1px solid ${({ theme }) => theme.bg2};
    border-radius: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 78%;
    `}
`

const CurrencyWrapper = styled.div<{ inputValue: number, value: number }>`
    position: relative;
    padding: 10px;
    ${({ inputValue, value }) => (inputValue - 1 === value) ?
        null
        : css`
        display: flex;
        flex-direction: column-reverse;
        `
    }
`

const InnerContent = styled.div`
    // display: flex;
    // // flex-direction: column;
`

const ButtonAdd = styled.button`
    cursor: pointer;
    display: flex;
    justify-content: center;
    max-width: 157px;
    width: 100%;
    background-color: transparent;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.primary1};
    text-align: center;
    // margin: auto;
    background: none;
    padding: 10px;

    :hover {
        background-color: #2172E57A;
    }
`

const CloseWrapper = styled.div<{ clickable: boolean }>`
    position: absolute;
    z-index: 1;
    text-align: center;
    background-color: rgba(231, 76, 60,0.7);
    border-radius: 50%;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 10px;

    width: 24px;
    height: 24px;
    top: -8px;
    right: -8px;

    div{
        align-content: center;
        width: 100%;
        display: inline-grid;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
    }

    ${({ clickable }) =>
        clickable
            ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
            : null}
`

const SearchInput = styled.input`
  opacity: 0.3;
  width: 100%;
  max-width: 572px;
  position: relative;
  display: flex;
  padding: 13px 5px 13px 10px;
  align-items: center;
  white-space: nowrap;
  background-color: ${({ theme }) => theme.bg1};
  border: none;
  outline: none;
  border-radius: 10px;
  color: ${({ theme }) => theme.text1};
  -webkit-appearance: none;

  font-size: 16px;

  ::placeholder {
    color: ${({ theme }) => theme.text3};
  }
`

const ButtonInsufficient = styled.button`
    margin-top: 10px;
    justify-content: center;
    width: 100%;
    padding: 6px;
    background-color: transparent;
    border-radius: 10px;
    border: 1px solid red;
    text-align: center;
    background: none;
    padding: 5px 20px;
`

export const Wrapper = styled.div`
    position: relative;
    max-width: 572px;
    width: 100%;
    border-radius: 30px;
`

const AutoColumn1 = styled.div`
    display: flex;
    flex-direction: column;
`

const DateBox = styled.div`
width:100%;
.react-datepicker-wrapper,
.react-datepicker__input-container,
.react-datepicker__input-container input {
    color: ${({theme}) => theme.text1};
    border: none;
    padding: 5px;
    border-radius: 7px;
    outline: none;
    background: transparent;
    font-size: 16px;
    width: 100%;
}
`
const MainContent = styled.div<{whiteList: boolean}>`
    max-width: 700px;
    width: 100%;
    ${({whiteList}) => !whiteList && css`
        pointer-events: none;
        opacity: 0.6;
    `}
`
const DateStyle = styled.div`
    width: 100%;
    // max-width: 506px;
    display: flex;
    .react-datepicker {
        font-family: auto
        font-size: 0.8rem;
        background-color: ${({theme}) => theme.bg3};
        color: #000;
        display: inline-block;
        position: relative;
    }
    .react-datepicker__header {
        text-align: center;
        background-color: ${({theme}) => theme.bg5};
        padding: 8px 0;
        position: relative;
        font-family: system-ui;
        color:  ${({theme}) => theme.text1};
    }
    .react-datepicker__day:hover, .react-datepicker__month-text:hover, .react-datepicker__quarter-text:hover, .react-datepicker__year-text:hover {
        border-radius: 0.3rem;
        background-color: #1d5d90;
    }
    .react-datepicker__day--disabled:hover, .react-datepicker__month-text--disabled:hover, .react-datepicker__quarter-text--disabled:hover, .react-datepicker__year-text--disabled:hover {
        background-color: transparent;
    }
    .react-datepicker__day, .react-datepicker__month-text, .react-datepicker__quarter-text, .react-datepicker__year-text {
        cursor: pointer;
        color: black;
    }
    .react-datepicker__day--disabled, .react-datepicker__month-text--disabled, .react-datepicker__quarter-text--disabled, .react-datepicker__year-text--disabled {
        cursor: default;
        opacity:0.4;
        color: black;
    }
    .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--disabled {
        cursor: default;
        opacity:0.4;
        color: black;
    }
    .react-datepicker__time-container .react-datepicker__time {
        font-family: system-ui;
        position: relative;
        background-color: ${({theme}) => theme.bg3};
        border-bottom-right-radius: 0.3rem;
    }
    .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
        cursor: pointer;
        background-color: #1d5d90;
    }
    .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {
        color: black;
        list-style: none;
        margin: 0;
        height: calc(195px + (1.7rem / 2));
        overflow-y: scroll;
        padding-right: 0;
        padding-left: 0;
        width: 100%;
        box-sizing: content-box;
    }
    .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
        cursor: pointer;
        background-color: #1d5d90;
    }
    .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--disabled:hover {
        background-color: transparent;
    }
`

const SearchStyled = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`

const SingleLineStyle = styled.div`
    display: flex;
    margin-bottom: 20px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-direction: column;
    `}
`

const StyleTimeFrame = styled.div`
    display: flex;
    margin-bottom: 20px;
    flex-direction: column;
`

export default function BuildFarm() {
    const [isOpen, setIsOpen] = useState(false)
    const addTransaction = useTransactionAdder()
    const [hash, setHash] = useState<string | undefined>()
    const [attempting, setAttempting] = useState<boolean>(false)
    // const dispatch = useDispatch<AppDispatch>()


    const byofFactoryContract = useDfynByofContract()
    const { account, chainId } = useActiveWeb3React()
    const {onCurrencySelection, onUserInput, addInputBox, removeInputBox, onResetToInitialState} = useFarmFormActionHandlers()
    const { inputCurrency1, inputCurrency2, outputCurrencyArr} = useDerivedFarmFormInfo()

    const selectedCurrencyBalances = useCurrencyBalances(account ?? undefined, outputCurrencyArr)
    // const selectedInputtCurrencyBalance = useCurrencyBalance(account ?? undefined, inputCurrency ?? undefined)

    const {parsedAmountArr} = useFarmForm(selectedCurrencyBalances, outputCurrencyArr)
    
    const {typedValues,
        [Field.OUTPUT]: outputCurrencyIds, numberOfRewardTokens } = useFarmFormState()

    const fetchAllSelectedCurrencies = useCallback(() => {
        return [USDC, Currency.getNativeCurrency(137)]
    },[])

    const isCurrencySelected = useCallback((selectedCurrency: Currency | undefined) =>{
        const allSelectedCurrencies = fetchAllSelectedCurrencies()
        return allSelectedCurrencies.find(c=>c && selectedCurrency && _get(selectedCurrency, 'address', selectedCurrency.symbol) === _get(c, 'address', c.symbol))
    }, [fetchAllSelectedCurrencies])

    const handleTypeInput = useCallback(
        (value: string, i: number) => {
            onUserInput(value, i)
        },
        [onUserInput]
    )

    const handleOutputSelect = useCallback(
        (inputCurrency, i) => {
            if (isCurrencySelected(inputCurrency)) return;
            onCurrencySelection(Field.OUTPUT, inputCurrency, i)
        },
        [onCurrencySelection, isCurrencySelected]
    )

    const [startDate, setStartdDate] = useState<Date>();
    const filterPassedTime = (time: any) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
    
        return currentDate.getTime() < selectedDate.getTime();
      };
    const [farms, setFarms] = useState('ECF')

    const [approvalStateArr, approveCallback]=useApproveCallbackArr(parsedAmountArr, BYOF_FACTORY_ADDRESS)
    const isValid=():boolean => {
        for(let i=0;i<approvalStateArr.length;i++) {
          if(approvalStateArr[i]!==ApprovalState.APPROVED)
          return false
        }
        return true
    }

    const isValidTypedValues=():boolean => {
        for(let i=0;i<numberOfRewardTokens;i++) {
          if(typedValues[i] === "") return false
        }
        return true
    }

    const isValidParsedValues=():boolean => {
        for(let i=0;i<numberOfRewardTokens;i++) {
          if(parsedAmountArr[i] === undefined) return false
        }
        return true
    }

    const customSetFarms = (farmType: string) => {
        if(farmType === "DF"){
           if(numberOfRewardTokens > 2){
               for(let i = numberOfRewardTokens - 1; i > 1; i--){
                    removeInputBox(i, outputCurrencyArr[i])
               }
            //show an error message dual tokens have only two reward token
            }
            else if(numberOfRewardTokens === 1){
                addInputBox()
            } 
        }
        else if(farmType === "ECF"){
            if(numberOfRewardTokens > 1){
                for(let i = numberOfRewardTokens-1; i > 0; i--){
                    removeInputBox(i, outputCurrencyArr[i])
                }
            }
        }
        else if(farmType === "LF"){
            if(numberOfRewardTokens > 1){
                for(let i = numberOfRewardTokens-1; i > 0; i--){
                    removeInputBox(i, outputCurrencyArr[i])
                }
            }
        }
        setFarms(farmType)
    }
    function gettingRewardTokens(){
        if(!isValidTypedValues() || !isValidParsedValues()) return null
        const rewardsTokenArr = outputCurrencyIds.map((i: any) => {
            if(i instanceof Token) return i.address
            else return i?.symbol
        })
        return rewardsTokenArr
    }
    function gettingPoolTokens(){
        if(existAddress.length !== 0) return existAddress[0].liquidityToken.address
        else return ""
    }
    
    const [duration, setDuration] = useState(15)
    const [durationEco, setDurationEco] = useState(15)
    
    function gettingTimeFrame(){
        if(startDate){
            const Startepoch = startDate.getTime()
            var date
            if(farms === "ECF" || farms ==="DF") date = durationEco*86400*1000
            else date = duration*86400*1000
            const Endepoch = Startepoch + date
            return {
                startDate: Math.floor(Startepoch/1000),
                endDate: Math.floor(Endepoch/1000)
            }
        }
        return {}
    }

    function gettingRewardAmount(){
        if(!isValidTypedValues() || !isValidParsedValues()) return null
        const rewardAmounts = typedValues.map((i, j) => {
            return parseUnits(i, outputCurrencyArr[j]?.decimals ?? 18)
        })
        return rewardAmounts
    }

    // const [searchItem, setSearchItem] = useState('')
    const [burnRate, setBurnRate] = useState(30) 
    const [splitWindow, setSplitWindow] = useState(8)
    const [vestingPeriod, setVestingPeriod] = useState(30)

    const customSetBurnRate = (burnType: string) => {
        if(burnType === "30") setBurnRate(30)
        else if(burnType === "35") setBurnRate(35)
        else if(burnType === "40") setBurnRate(40)
        else if(burnType === "50") setBurnRate(50)
    }

    const customSetDuration = (duration: string) => {
        if(duration === "15") setDuration(15)
        else if(duration === "30") setDuration(30)
        else if(duration === "60") setDuration(60)
    }

    const customSetDurationEco = (duration: string) => {
        if(duration === "15") setDurationEco(15)
        else if(duration === "30") setDurationEco(30)
        else if(duration === "60") setDurationEco(60)
        else if(duration === "90") setDurationEco(90)
        else if(duration === "120") setDurationEco(120)
        else if(duration === "360") setDurationEco(360)
    }

    const customSetVesting = (vestingType: string) => {
        if(vestingType === "30") setVestingPeriod(30)
        else if(vestingType === "60") setVestingPeriod(60)
        else if(vestingType === "120") setVestingPeriod(120)
        else if(vestingType === "240") setVestingPeriod(240)
    }
    
    useMemo(() => {
        if(duration === 15 && vestingPeriod === 60) setSplitWindow(4)
        else if(duration === 15 && vestingPeriod === 30) setSplitWindow(8)
        else if(duration === 30 && vestingPeriod === 120) setSplitWindow(4)
        else if(duration === 30 && vestingPeriod === 60) setSplitWindow(4)
        else if(duration === 60 && vestingPeriod === 240) setSplitWindow(4)
        else if(duration === 60 && vestingPeriod === 120) setSplitWindow(8)

    }, [duration, vestingPeriod])
    
    const trackedTokenPairs = useTrackedTokenPairs()
    
    const allLPPairs = useMemo(
        () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
        [trackedTokenPairs]
    )
    
    const tokenMatic = wrappedCurrency(Currency.getNativeCurrency(chainId) ?? undefined, chainId)

    const existAddress = allLPPairs.filter(token => {
        if(!inputCurrency1 || !inputCurrency2) return ""
        if(inputCurrency2 === Currency.getNativeCurrency(chainId)){
            if((inputCurrency1 instanceof Token && inputCurrency1.address.toLowerCase().includes(token.tokens[0].address.toLowerCase())) && (tokenMatic?.address.toLowerCase().includes(token.tokens[1].address.toLowerCase()))) return token
            if((inputCurrency1 instanceof Token && inputCurrency1.address.toLowerCase().includes(token.tokens[1].address.toLowerCase())) && (tokenMatic?.address.toLowerCase().includes(token.tokens[0].address.toLowerCase()))) return token
        }
        else if(inputCurrency1 === Currency.getNativeCurrency(chainId)){
            if((inputCurrency2 instanceof Token && inputCurrency2.address.toLowerCase().includes(token.tokens[0].address.toLowerCase())) && (tokenMatic?.address.toLowerCase().includes(token.tokens[1].address.toLowerCase()))) return token
            if((inputCurrency2 instanceof Token && inputCurrency2.address.toLowerCase().includes(token.tokens[1].address.toLowerCase())) && (tokenMatic?.address.toLowerCase().includes(token.tokens[0].address.toLowerCase()))) return token
        }
        else{
            if((inputCurrency1 instanceof Token && inputCurrency1.address.toLowerCase() === token.tokens[0].address.toLowerCase()) && (inputCurrency2 instanceof Token && inputCurrency2.address.toLowerCase().includes(token.tokens[1].address.toLowerCase()))) return token
            if((inputCurrency1 instanceof Token && inputCurrency1.address.toLowerCase().includes(token.tokens[1].address.toLowerCase()))  && (inputCurrency2 instanceof Token && inputCurrency2.address.toLowerCase().includes(token.tokens[0].address.toLowerCase()))) return token
        }
        return ""
    })

    const handleInputSelect1 = useCallback(inputCurrency => {
        onCurrencySelection(Field.INPUT1, inputCurrency, 0) // last param is 0 because there will be only one TO token
    }, [onCurrencySelection])

    const handleInputSelect2 = useCallback(inputCurrency => {
        onCurrencySelection(Field.INPUT2, inputCurrency, 0) // last param is 0 because there will be only one TO token
    }, [onCurrencySelection])


    async function buildYourOwnFarms(){
        setIsOpen(true)
        setAttempting(true)
        if(byofFactoryContract){
            if(isValid() && isValidTypedValues()){
                const poolsTokens = gettingPoolTokens()
                const rewardsTokens = gettingRewardTokens()
                const timeFrame = gettingTimeFrame()
                const rewardsAmount = gettingRewardAmount()
                if(!timeFrame) return
                if(poolsTokens === "") return
                let params
                if(farms === "PF" && burnRate && vestingPeriod && splitWindow){
                    let bytes = await ethers.utils.defaultAbiCoder.encode(["uint", "uint", "uint", "uint"], [burnRate, vestingPeriod*24*60*60, splitWindow, 20])
                    params = await ethers.utils.defaultAbiCoder.encode(["address", "uint", "uint","address[]","uint[]", "bytes"], [poolsTokens, timeFrame.startDate, timeFrame.endDate, rewardsTokens, rewardsAmount, bytes])
                }
                else if(farms === "LF" && vestingPeriod && splitWindow){
                    let bytes = await ethers.utils.defaultAbiCoder.encode(["uint", "uint", "uint"], [vestingPeriod*24*60*60, splitWindow, 20])
                    params = await ethers.utils.defaultAbiCoder.encode(["address", "uint", "uint","address[]","uint[]", "bytes"], [poolsTokens, timeFrame.startDate, timeFrame.endDate, rewardsTokens, rewardsAmount, bytes])
                }
                else {
                    params = await ethers.utils.defaultAbiCoder.encode(["address", "uint", "uint","address[]","uint[]"], [poolsTokens, timeFrame.startDate, timeFrame.endDate, rewardsTokens, rewardsAmount])
                }
                const strategyId = _get(FarmStrategy, farms)
                await byofFactoryContract.deployFarm(strategyId, params).then(
                    (response: TransactionResponse) => {
                        addTransaction(response, {
                            summary: `Farm Created`
                    })
                    setHash(response.hash)
                }).catch((error: any) => {
                    setAttempting(false)
                    setIsOpen(false)
                    console.log(`error invoking wallet ${error}`)
                })
            }else {
                setAttempting(false)
                setIsOpen(false)
                throw new Error('Attempting to stake without approval or a signature. Please contact support.')
            }
        }       
    } 
    
    const wrappedOnDismiss = useCallback(() => {
        setHash(undefined)
        setAttempting(false)
        setIsOpen(false)
        setStartdDate(undefined)
        setDuration(0)
        onResetToInitialState()
    }, [onResetToInitialState])

    //For WhiteListing
    const accountArg = useMemo(() => [account ?? undefined], [account])
    const whiteListed = useSingleCallResult(byofFactoryContract, 'isWhitelisted', accountArg)
    const darkMode = useIsDarkMode()
    
    useEffect(() => {
        if(farms === "PF" || farms === "LF") setDuration(duration)
        if(farms === "ECF" || farms === "DF") setDurationEco(durationEco)
    }, [farms, duration, durationEco])

    useEffect(() => {
        if(duration === 15) setVestingPeriod(30)
        else if(duration === 30) setVestingPeriod(60)
        else if(duration === 60) setVestingPeriod(120)
    }, [duration])

    useEffect(() => {
        onResetToInitialState()
    }, [onResetToInitialState])
    
    return (
        <MainContent whiteList={whiteListed.result && whiteListed.result[0]} >
        {/* <MainContent whiteList={true} > */}
            <TYPE.black mb="18px">Create your own Farm</TYPE.black>
            <FormStyle>
                <LabelStyle>
                    <label>Type of Farm 
                        <MouseoverTooltip
                                text={`Select the appropriate farm as per your use case\n1. Ecosystem Farm - Single reward token farm with no vesting\n2. Dual farm - dual reward token farm with no vesting\n3. Popular farm - Single/dual reward token farm with vested rewards\n4. Launch farm - Single/dual reward token farm with vested rewards with burn rate for early redemption`}
                                placement='bottom'
                            >
                                <Info size={13} style={{margin: "auto 5px"}}/>
                        </MouseoverTooltip>
                        <span style={{color: "red"}}>*</span>
                    </label>  
                </LabelStyle>
                <FieldStyle>
                    <select 
                        style={{
                            opacity: "0.9",
                            background: darkMode ? '#212429' : '#FFFFFF',
                            maxWidth: "572px",
                            width: "100%",
                            alignItems: "center",
                            fontSize: "16px",
                            borderRadius: "10px",
                            outline: "none",
                            padding: "14px 0px 14px 10px",
                            fontFamily: "inherit",
                            fontWeight: "inherit",
                            color: darkMode ? "#FFFFFF" : "#000000",
                            border: "none"
                        }} placeholder={'Select a Farm'}
                        onChange={(e) => customSetFarms(e.target.value)}
                    >
                        {FarmStrategy.ECF && <option value="ECF">Ecosystem Farm</option>}
                        {FarmStrategy.DF && <option value="DF">Dual Farm</option>}
                        {FarmStrategy.PF && <option value="PF">Popular Farm</option>}
                        {FarmStrategy.MTF !== "" && <option value="MTF">MultiTokens Farms</option>}
                        {FarmStrategy.LF && <option value="LF">Launch Farm</option>}
                    </select>
                </FieldStyle>
            </FormStyle>
            <FormStyle>
                <LabelStyle>
                    <label>Token Pair
                        <MouseoverTooltip
                                text={'The 2 tokens that you want the users to stake in your farm'}
                                placement='bottom'
                            >
                                <Info size={13} style={{margin: "auto 5px"}}/>
                        </MouseoverTooltip>
                        <span style={{color: "red"}}>*</span>
                    </label>
                </LabelStyle>
                <FieldStyleInput>
                    <InputField>
                        <RewardsCurrencyInputPanel
                            label={''}
                            onUserInput={(e: string) => {      
                            }}
                            value={''}
                            showMaxButton={false}
                            currency={inputCurrency1}
                            onCurrencySelect={(e) => handleInputSelect1(e)}
                            otherCurrency={inputCurrency2}
                            id="swap-currency-input"
                            lpByof={true}
                            disableCurrencySelect={false}
                        />
                        <span style={{margin: "auto 10px"}}><Plus size={"15"}/></span>
                        <RewardsCurrencyInputPanel
                            label={''}
                            onUserInput={(e: string) => {      
                            }}
                            value={''}
                            showMaxButton={false}
                            currency={inputCurrency2}
                            onCurrencySelect={(e) => handleInputSelect2(e)}
                            otherCurrency={inputCurrency1}
                            id="swap-currency-input"
                            lpByof={true}
                            disableCurrencySelect={false}
                        /> 
                    </InputField>
                    {existAddress.length !== 0 ?
                        <AddressStyle>
                            <CheckCircle style={{color: 'green'}}/> <span style={{margin: "auto 5px", overflow: "hidden"}}>{existAddress[0].liquidityToken.address}</span>
                        </AddressStyle> 
                        :
                        inputCurrency2 && inputCurrency1 &&
                        <AddressStyle>
                            <span style={{color: "red"}}>No LP address found corresponding to these tokens</span>
                        </AddressStyle> 
                    }
                    
                    {/* <SearchStyled>
                        <CheckedStyle>
                           <SearchInput
                                type="text"
                                placeholder="Search by address"
                                onChange={(e) => {
                                setSearchItem(e.target.value)}} 
                            /> 
                            {existAddress[0] && <CheckCircle size={16} style={{margin: 'auto 10px', color: 'green'}} />}
                        </CheckedStyle>
                        
                        <TextStyled existAddress={Boolean(!existAddress[0] && searchItem.length > 1)}>
                            {!existAddress[0] && searchItem.length > 1 && <span>Address does not exist</span> }
                        </TextStyled>
                    </SearchStyled> */}
                    
                </FieldStyleInput>
            </FormStyle>
            <FormStyle>
                <LabelStyle>
                    <label>Reward Token
                        <MouseoverTooltip
                            text={'The token you want to give out as rewards. Enter total rewards to be given in the complete duration'}
                            placement='bottom'
                        >
                            <Info size={13} style={{margin: "auto 5px"}}/>
                        </MouseoverTooltip>
                        <span style={{color: "red"}}>*</span>
                    </label>
                </LabelStyle>
                <FieldStyle>
                <Wrapper id="swap-page">
                    <AutoColumn1>
                        {outputCurrencyIds.map((_, i: any) => {
                            return (
                                <div key={i}>
                                    <CurrencyWrapper inputValue={outputCurrencyIds.length} value={i} >
                                        <InnerContent>
                                        {outputCurrencyArr[i] && selectedCurrencyBalances[i] ? <TYPE.black fontSize="13px" textAlign="start" mb="5px">{('Balance- ')+selectedCurrencyBalances[i]?.toSignificant(6)}</TYPE.black> : ""}
                                            <RewardsCurrencyInputPanel
                                                label={'From'}
                                                value={typedValues[i]}
                                                currency={outputCurrencyArr[i]}
                                                showMaxButton={false}
                                                onUserInput={(e) => { handleTypeInput(e, i); }}
                                                onCurrencySelect={(e) => handleOutputSelect(e, i)}
                                                otherCurrency={fetchAllSelectedCurrencies()}
                                                id="swap-currency-input"
                                                disableCurrencySelect={false}
                                            />
                                            { account &&
                                                parsedAmountArr[i]  ?
                                                    <>
                                                        {!(approvalStateArr[i] === ApprovalState.APPROVED) && <ButtonConfirmed
                                                            onClick={()=>{approveCallback(i)}}
                                                            disabled={
                                                                approvalStateArr[i] !== ApprovalState.NOT_APPROVED 
                                                            }
                                                            width="100%"
                                                            padding="7px"
                                                            marginTop="10px"
                                                            altDisabledStyle={approvalStateArr[i] === ApprovalState.PENDING} // show solid button while waiting
                                                            confirmed={
                                                                approvalStateArr[i] === ApprovalState.APPROVED 
                                                                // || signatureState === UseERC20PermitState.SIGNED
                                                            } 
                                                        >
                                                            {approvalStateArr[i] === ApprovalState.PENDING ? (
                                                                <AutoRow gap="6px" justify="center">
                                                                    Approving <Loader stroke={darkMode ? 'white' : 'black'} />
                                                                </AutoRow>
                                                            ) 
                                                            : (approvalStateArr[i] === ApprovalState.APPROVED) ? (
                                                                'Approved'
                                                            ) 
                                                            : (
                                                                'Approve ' + outputCurrencyArr[i]?.symbol
                                                        )}
                                                        </ButtonConfirmed>} 
                                                    </>
                                                :   (typedValues[i] && outputCurrencyArr[i] &&
                                                    <>
                                                        <ButtonInsufficient>
                                                            <TYPE.black>Your balance is not enough</TYPE.black>
                                                        </ButtonInsufficient>
                                                    </>
                                                )
                                            }
                                        </InnerContent>
                                        {farms !== "DF" && outputCurrencyIds.length > 1 ?
                                            <CloseWrapper onClick={() => removeInputBox(i, outputCurrencyArr[i])} clickable>
                                                <div><X size="16" color="white" /></div>
                                            </CloseWrapper>
                                            : null
                                        }
                                    </CurrencyWrapper>
                                </div>
                            )
                        })}
                        {(farms === "PF" || farms === "LF") && numberOfRewardTokens < 2 &&
                            <StyleAdd>
                                <ButtonAdd onClick={addInputBox}>
                                    {/* <Plus size="16" style={{ color: theme.primary1, marginRight: "10px" }} /> */}
                                    <TYPE.black>Add Reward Token</TYPE.black>
                                </ButtonAdd>
                            </StyleAdd>
                            
                        }
                    </AutoColumn1>
                </Wrapper>
                </FieldStyle>
            </FormStyle>
            <StyleTimeFrame>
                <FormStyle>
                    <LabelStyle>
                        <label>Start Date
                            <span style={{fontSize: "9px", marginLeft: "3px"}}>(UTC)</span>
                            <MouseoverTooltip
                                text={'The date and time (in UTC) on which you want the farm to start'}
                                placement='bottom'
                            >
                                <Info size={13} style={{margin: "auto 5px"}}/>
                            </MouseoverTooltip>
                            <span style={{color: "red"}}>*</span>
                        </label>
                    </LabelStyle>
                    <FieldStyle>
                        <DateStyle>
                            <DateBox>
                                <DatePicker 
                                    showTimeSelect
                                    selected={startDate}
                                    onChange={(date: any) => setStartdDate(date)}
                                    minDate={new Date()}
                                    filterTime={filterPassedTime}
                                    isClearable
                                    placeholderText="Start Date"
                                    dateFormat="MM/dd/yyyy  EE hh:mm a"
                                    onChangeRaw={(e) => e.preventDefault()}
                                />
                            </DateBox>
                        </DateStyle>
                    </FieldStyle>
                </FormStyle>
                <FormStyle style={{marginBottom: "0px"}}>
                    <LabelStyle>
                        <label>Duration (Days)  
                            <MouseoverTooltip
                                text={'Number of days for which the farm will be active'}
                                placement='bottom'
                            >
                                <Info size={13} style={{margin: "auto 5px"}}/>
                            </MouseoverTooltip>
                        <span style={{color: "red"}}>*</span></label>
                    </LabelStyle>
                    {(farms  === "PF" || farms === "LF") ? 
                        <FieldStyle>
                            <select 
                                style={{
                                    opacity: "0.9",
                                    background: darkMode ? '#212429' : '#FFFFFF',
                                    maxWidth: "512px",
                                    width: "100%",
                                    alignItems: "center",
                                    fontSize: "16px",
                                    borderRadius: "10px",
                                    outline: "none",
                                    padding: "14px 0px 14px 10px",
                                    fontFamily: "inherit",
                                    fontWeight: "inherit",
                                    color: darkMode ? "#FFFFFF" : "#000000",
                                    border: "none"
                                }} placeholder={'Duration'}
                                onChange={(e) => customSetDuration(e.target.value)}
                                value={duration}
                            >
                                <option value="15">15 days</option>
                                <option value="30">30 days</option>
                                <option value="60">60 days</option>
                            </select>
                        </FieldStyle>
                        :
                        <FieldStyle>
                            <select 
                                style={{
                                    opacity: "0.9",
                                    background: darkMode ? '#212429' : '#FFFFFF',
                                    maxWidth: "512px",
                                    width: "100%",
                                    alignItems: "center",
                                    fontSize: "16px",
                                    borderRadius: "10px",
                                    outline: "none",
                                    padding: "14px 0px 14px 10px",
                                    fontFamily: "inherit",
                                    fontWeight: "inherit",
                                    color: darkMode ? "#FFFFFF" : "#000000",
                                    border: "none"
                                }} placeholder={'Duration'}
                                onChange={(e) => customSetDurationEco(e.target.value)}
                                value={durationEco}
                            >
                                <option value="15">15 days</option>
                                <option value="30">30 days</option>
                                <option value="60">60 days</option>
                                <option value="90">90 days</option>
                                <option value="120">120 days</option>
                                <option value="360">360 days</option>
                            </select>
                        </FieldStyle>
                    }
                    
                </FormStyle>
            </StyleTimeFrame>
            
            { (farms === "PF" || farms === "LF") && 
                <>
                    <SingleLineStyle>
                        <FormStyle1>
                            <LabelStyle1>
                                <label>Vesting Period
                                    <MouseoverTooltip
                                        text={'Users can claim their rewards post initial claim at regular intervals; the vesting period defines the duration between each claim'}
                                        placement='bottom'
                                    >
                                        <Info size={13} style={{margin: "auto 5px"}}/>
                                    </MouseoverTooltip>
                                    <span style={{color: "red"}}>*</span>
                                </label>
                            </LabelStyle1>
                            <FieldStyle2>
                                <select 
                                    value={vestingPeriod}
                                    style={{
                                        opacity: "0.9",
                                        background: darkMode ? '#212429' : '#FFFFFF',
                                        maxWidth: "512px",
                                        width: "100%",
                                        alignItems: "center",
                                        fontSize: "16px",
                                        borderRadius: "10px",
                                        outline: "none",
                                        padding: "14px 0px 14px 10px",
                                        fontFamily: "inherit",
                                        fontWeight: "inherit",
                                        color: darkMode ? "#FFFFFF" : "#000000",
                                        border: "none"
                                    }} placeholder={'Select a vesting period'}
                                    onChange={(e) => customSetVesting(e.target.value)}
                                >
                                    {duration === 15 ?
                                        <>
                                            <option value="30">30 days</option>
                                            <option value="60">60 days</option>
                                        </>
                                        : duration === 30 ?
                                        <>
                                            <option value="60">60 days</option>
                                            <option value="120">120 days</option>
                                        </>
                                        : <>
                                            <option value="120">120 days</option>
                                            <option value="240">240 days</option>
                                        </>
                                    }   
                                </select>
                            </FieldStyle2>
                        </FormStyle1>
                        <FormStyle1 style={{justifyContent: 'end'}}>
                            <LabelStyle1>
                                <label>Split Window
                                    <MouseoverTooltip
                                        text={'The number of tranches in which the reward will be split'}
                                        placement='bottom'
                                    >
                                        <Info size={13} style={{margin: "auto 5px"}}/>
                                    </MouseoverTooltip>
                                    <span style={{color: "red"}}>*</span>
                                </label>
                            </LabelStyle1>
                            <FieldStyle1>
                                <SearchStyled>
                                    <SearchInput
                                        type="number"
                                        placeholder="Select a splitwindow period"
                                        value={splitWindow}
                                        readOnly={true}
                                    />
                                </SearchStyled>
                            </FieldStyle1>
                        </FormStyle1>
                    </SingleLineStyle>
                    {farms === "PF" && 
                        <FormStyle>
                            <LabelStyle>
                                <label>Burn Rate
                                    <MouseoverTooltip
                                        text={'Percentage of tokens that will be deducted from the users reward pool in case they opt for no-vesting rewards redemption'}
                                        placement='bottom'
                                    >
                                        <Info size={13} style={{margin: "auto 5px"}}/>
                                    </MouseoverTooltip>
                                    <span style={{color: "red"}}>*</span>
                                </label> 
                            </LabelStyle>
                            <FieldStyle>
                                <select 
                                    style={{
                                        opacity: "0.9",
                                        background: darkMode ? '#212429' : '#FFFFFF',
                                        maxWidth: "512px",
                                        width: "100%",
                                        alignItems: "center",
                                        fontSize: "16px",
                                        borderRadius: "10px",
                                        outline: "none",
                                        padding: "14px 0px 14px 10px",
                                        fontFamily: "inherit",
                                        fontWeight: "inherit",
                                        color: darkMode ? "#FFFFFF" : "#000000",
                                        border: "none"
                                    }} placeholder={'Burn Rate in Percentage'}
                                    onChange={(e) => customSetBurnRate(e.target.value)}
                                >
                                    <option value="30">30</option>
                                    <option value="35">35</option>
                                    <option value="40">40</option>
                                    <option value="50">50</option>
                                </select>
                            </FieldStyle>
                        </FormStyle>
                    }
                    <FormStyle>
                        <LabelStyle>
                            <label>Initial Claim
                                <MouseoverTooltip
                                    text={'% of rewards that the user can claim once the farm ends'}
                                    placement='bottom'
                                >
                                    <Info size={13} style={{margin: "auto 5px"}}/>
                                </MouseoverTooltip>
                                <span style={{color: "red"}}>*</span>
                            </label>
                        </LabelStyle>
                        <FieldStyle>
                        <SearchStyled>
                            <SearchInput
                                type="number"
                                placeholder="Claim"
                                value={20}
                                readOnly={true}
                            />
                            </SearchStyled>
                        </FieldStyle>
                    </FormStyle>
                </>
            }
            <ButtonError 
                width={"100%"}
                maxWidth={"670px"}
                style={{zIndex: 0}}
                onClick={() => buildYourOwnFarms()} 
                error={false}
                disabled={!isValid() || !isValidTypedValues() || existAddress.length === 0 || !startDate || (startDate === null) || (duration === 0)}
            >
                Create
            </ButtonError>  
            <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
                {attempting && !hash && (
                    <LoadingView onDismiss={wrappedOnDismiss}>
                        <AutoColumn gap="12px" justify={'center'}>
                            <TYPE.largeHeader>Creating Farm</TYPE.largeHeader>
                            <TYPE.body fontSize={20}>{"DFYN LP "}{inputCurrency1?.symbol}{"-"}{inputCurrency2?.symbol}</TYPE.body>
                        </AutoColumn>
                    </LoadingView>
                )}
                {attempting && hash && (
                    <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
                        <AutoColumn gap="12px" justify={'center'}>
                            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
                            <TYPE.body fontSize={20}>{"Farms Created"}</TYPE.body>
                        </AutoColumn>
                    </SubmittedView>
                )}
            </Modal>
        </MainContent>
    )
}
