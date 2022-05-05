import { Currency, Token, TokenAmount } from '@dfyn/sdk'
import { useActiveWeb3React } from 'hooks'
import { MouseoverTooltip } from 'components/Tooltip'
import { useDfynByofContract } from 'hooks/useContract'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle, Info, Plus } from 'react-feather'
import { useDerivedFarmFormInfo, useFarmFormActionHandlers, useFarmFormState } from 'state/createFarm/hook'
import { useSingleCallResult } from 'state/multicall/hooks'
import { toV2LiquidityToken, useIsDarkMode, useTrackedTokenPairs } from 'state/user/hooks'
import styled, { css } from 'styled-components'
import { TYPE } from 'theme'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { Wrapper } from './BuildFarm'
import RewardsCurrencyInputPanel from './Component/CurrencyModal/RewardsCurrencyInputPanel'
// import { Field } from 'state/createFarm/action'
// import _get from 'lodash.get'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { useFarmForm } from './hooks/useFarmForm'
import DatePicker from 'react-datepicker'
import { ButtonError } from 'components/Button'
import Modal from 'components/Modal'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { AutoColumn } from 'components/Column'
import { setSeconds } from 'date-fns'
import { Field } from 'state/createFarm/action'
import { useHistory } from 'react-router-dom'
import { useTransactionAdder } from 'state/transactions/hooks'
import { parseUnits } from 'ethers/lib/utils'
import { ethers } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import Loader from 'components/Loader'
// import {moment} from 'momentjs'

const MainContent = styled.div<{ whiteList: boolean }>`
  max-width: 700px;
  width: 100%;
  ${({ whiteList }) =>
    !whiteList &&
    css`
      pointer-events: none;
      opacity: 0.6;
    `}
`

const FormStyle = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 20px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-direction: column;
    `}
`

const LabelStyle = styled.div`
  // max-width: 150px;
  width: 25%;
  margin: auto 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
        margin-bottom: 10px;
    `}
`

const FieldStyle = styled.div`
  display: flex;
  width: 75%;
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
    `}
`

const FieldStyleInput = styled.div`
  display: flex;
  flex-direction: column;
  opacity: 0.3;
  padding: 10px;
  width: 75%;
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
    `}
`

const InputField = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
    `}
`

const AddressStyle = styled.div`
  margin-top: 10px;
  display: flex;
`

const AutoColumn1 = styled.div`
  display: flex;
  flex-direction: column;
`

const CurrencyWrapper = styled.div<{ inputValue: number; value: number }>`
  position: relative;
  padding: 10px;
  ${({ inputValue, value }) =>
    inputValue - 1 === value
      ? null
      : css`
          display: flex;
          flex-direction: column-reverse;
        `}
`

const InnerContent = styled.div`
  // display: flex;
  // // flex-direction: column;
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

const StyleTimeFrame = styled.div`
  display: flex;
  margin-bottom: 20px;
  flex-direction: column;
`

const DateStyle = styled.div`
    width: 100%;
    // max-width: 506px;
    opacity: 0.3;
    display: flex;
    .react-datepicker {
        font-family: auto
        font-size: 0.8rem;
        background-color: ${({ theme }) => theme.bg3};
        color: #000;
        display: inline-block;
        position: relative;
    }
    .react-datepicker__header {
        text-align: center;
        background-color: ${({ theme }) => theme.bg5};
        padding: 8px 0;
        position: relative;
        font-family: system-ui;
        color:  ${({ theme }) => theme.text1};
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
        background-color: ${({ theme }) => theme.bg3};
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

const DateBox = styled.div`
  width: 100%;
  .react-datepicker-wrapper,
  .react-datepicker__input-container,
  .react-datepicker__input-container input {
    color: ${({ theme }) => theme.text1};
    border: none;
    padding: 5px;
    border-radius: 7px;
    outline: none;
    background: transparent;
    font-size: 16px;
    width: 100%;
  }
`

const MainContentWrapper = styled.div`
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

const LoaderStyle = styled.div`
  width:100%;
  display: flex;
  padding: 20px;
`

const BackArrowStyle = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 18px;
`

interface RenewFormProps{
    allByofFarmsDetails: {
      stakingRewardAddress: string
      tokens: [Token, Token]
      totalSupply: TokenAmount
      stakingToken: string
      rewardToken0: Token
      rewardToken1: Token | undefined
      rewardToken0RewardRate: TokenAmount
      rewardToken1RewardRate: TokenAmount | undefined
      startTime: number
      periodFinish: number
      type: {
        typeOf: string
        url: string
      }
      rewardsDuration: number}[]
    stakingAddress:string
}

const RenewForm=({stakingAddress,allByofFarmsDetails}:RenewFormProps) =>{
    const [isOpen, setIsOpen] = useState(false)
    const history = useHistory();
    const [hash, setHash] = useState<string | undefined>()
    const [attempting, setAttempting] = useState<boolean>(false)
    const [dateStart, setDateStart] = useState<undefined | Date>(undefined)
    const addTransaction = useTransactionAdder()
    const { account, chainId } = useActiveWeb3React()
    const darkMode = useIsDarkMode()
    const liveFarm = allByofFarmsDetails.filter(
      (i: any) => i.stakingRewardAddress?.toLowerCase() === stakingAddress?.toLowerCase()
    )
    const byofFactoryContract = useDfynByofContract()
    const accountArg = useMemo(() => [account ?? undefined], [account])
    const whiteListed = useSingleCallResult(byofFactoryContract, 'isWhitelisted', accountArg)
    const { inputCurrency1, inputCurrency2, outputCurrencyArr } = useDerivedFarmFormInfo()
    const { onCurrencySelection, addInputBox, onUserInput, onResetToInitialState } = useFarmFormActionHandlers()
    const trackedTokenPairs = useTrackedTokenPairs()
  
    useEffect(() => {
      const thisFarm = liveFarm[0]
      if (thisFarm && !inputCurrency1 && !inputCurrency2 && !outputCurrencyArr[0] && !outputCurrencyArr[0]) {
        onCurrencySelection(Field.INPUT1, thisFarm.tokens[0], 0)
        onCurrencySelection(Field.INPUT2, thisFarm.tokens[1], 0)
        if (thisFarm.rewardToken0) onCurrencySelection(Field.OUTPUT, thisFarm.rewardToken0, 0)
        if (thisFarm.rewardToken1) {
          addInputBox()
          onCurrencySelection(Field.OUTPUT, thisFarm.rewardToken1, 1)
        }
        const finishDate = setSeconds(thisFarm.periodFinish * 1000, 0)
        setDateStart(finishDate)
      }
    }, [liveFarm, onCurrencySelection, addInputBox, inputCurrency1, inputCurrency2, outputCurrencyArr])
  
    const allLPPairs = useMemo(
      () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
      [trackedTokenPairs]
    )
  
    const tokenMatic = wrappedCurrency(Currency.getNativeCurrency(chainId) ?? undefined, chainId)
  
    const existAddress = allLPPairs.filter((token) => {
      if (!liveFarm[0]?.tokens[0] || !liveFarm[0]?.tokens[1]) return ''
      if (liveFarm[0]?.tokens[1] === Currency.getNativeCurrency(chainId)) {
        if (
          liveFarm[0]?.tokens[0] instanceof Token &&
          liveFarm[0]?.tokens[0].address.toLowerCase().includes(token.tokens[0].address.toLowerCase()) &&
          tokenMatic?.address.toLowerCase().includes(token.tokens[1].address.toLowerCase())
        )
          return token
        if (
          liveFarm[0]?.tokens[0] instanceof Token &&
          liveFarm[0]?.tokens[0].address.toLowerCase().includes(token.tokens[1].address.toLowerCase()) &&
          tokenMatic?.address.toLowerCase().includes(token.tokens[0].address.toLowerCase())
        )
          return token
      } else if (liveFarm[0]?.tokens[0] === Currency.getNativeCurrency(chainId)) {
        if (
          liveFarm[0]?.tokens[1] instanceof Token &&
          liveFarm[0]?.tokens[1].address.toLowerCase().includes(token.tokens[0].address.toLowerCase()) &&
          tokenMatic?.address.toLowerCase().includes(token.tokens[1].address.toLowerCase())
        )
          return token
        if (
          liveFarm[0]?.tokens[1] instanceof Token &&
          liveFarm[0]?.tokens[1].address.toLowerCase().includes(token.tokens[1].address.toLowerCase()) &&
          tokenMatic?.address.toLowerCase().includes(token.tokens[0].address.toLowerCase())
        )
          return token
      } else {
        if (
          liveFarm[0]?.tokens[0] instanceof Token &&
          liveFarm[0]?.tokens[0].address.toLowerCase() === token.tokens[0].address.toLowerCase() &&
          liveFarm[0]?.tokens[1] instanceof Token &&
          liveFarm[0]?.tokens[1].address.toLowerCase().includes(token.tokens[1].address.toLowerCase())
        )
          return token
        if (
          liveFarm[0]?.tokens[0] instanceof Token &&
          liveFarm[0]?.tokens[0].address.toLowerCase().includes(token.tokens[1].address.toLowerCase()) &&
          liveFarm[0]?.tokens[1] instanceof Token &&
          liveFarm[0]?.tokens[1].address.toLowerCase().includes(token.tokens[0].address.toLowerCase())
        )
          return token
      }
      return ''
    })
  
    let rewardTokenArray = [liveFarm[0]?.rewardToken0]
    if (liveFarm[0]?.rewardToken1) rewardTokenArray.push(liveFarm[0]?.rewardToken1)
  
    const { typedValues, [Field.OUTPUT]: outputCurrencyIds, numberOfRewardTokens } = useFarmFormState()
  
    const selectedCurrencyBalances = useCurrencyBalances(account ?? undefined, rewardTokenArray)
  
    const handleTypeInput = useCallback(
      (value: string, i: number) => {
        onUserInput(value, i)
      },
      [onUserInput]
    )
    const { parsedAmountArr } = useFarmForm(selectedCurrencyBalances, rewardTokenArray)
  
    const [durationEco, setDurationEco] = useState(15)
  
    const customSetDurationEco = (duration: string) => {
      if (duration === '15') setDurationEco(15)
      else if (duration === '30') setDurationEco(30)
      else if (duration === '60') setDurationEco(60)
      else if (duration === '90') setDurationEco(90)
      else if (duration === '120') setDurationEco(120)
      else if (duration === '360') setDurationEco(360)
    }
  
    function gettingRewardAmount(){
      if(!isValidTypedValues()) return null
      const rewardAmounts = typedValues.map((i, j) => {
          return parseUnits(i, rewardTokenArray[j]?.decimals ?? 18)
      })
      return rewardAmounts
    }
  
    const isValidTypedValues = (): boolean => {
      for (let i = 0; i < numberOfRewardTokens; i++) {
        if (typedValues[i] === '') return false
      }
      return true
    }
  
    function gettingTimeFrame(){
      if(liveFarm[0]?.periodFinish){
          const date = durationEco*86400*1000
          const Endepoch = liveFarm[0].periodFinish*1000 + date
          return {
              endDate: Math.floor(Endepoch/1000)
          }
      }
      return {}
    }
  
    async function buildYourOwnFarms() {
      setIsOpen(true)
      setAttempting(true)
      if (byofFactoryContract) {
        const endTime = gettingTimeFrame()
        const rewardsAmount = gettingRewardAmount()
        if(!endTime) return
        let bytes
        const farmAddress = liveFarm[0]?.stakingRewardAddress
        if(isValidTypedValues() && endTime){
          bytes = await ethers.utils.defaultAbiCoder.encode(["uint", "uint[]"], [endTime.endDate, rewardsAmount])
        }
        await byofFactoryContract.renewFarmUpdated(farmAddress, bytes).then(
          (response: TransactionResponse) => {
              addTransaction(response, {
                  summary: `Farm Renewed`
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

    const wrappedOnDismiss = useCallback(() => {
      setHash(undefined)
      setAttempting(false)
      setIsOpen(false)
      setDurationEco(0)
      onResetToInitialState()
      history.push("/myFarms");
    }, [onResetToInitialState, history])
  
    const wrappedOnDismissLoader = useCallback(() => {
      setHash(undefined)
      setAttempting(false)
      setIsOpen(false)
    }, [])
  
    useEffect(() => {
      onResetToInitialState()
    }, [onResetToInitialState])

    const [topLoader, setTopLoader] = useState(true)
    useEffect(() =>{
      if(liveFarm[0]) setTopLoader(false)
    }, [liveFarm])
  
    const handleOnClick = () => {
      history.push("/myFarms");
    }
    
    return (
      <MainContentWrapper>
        <MainContent whiteList={whiteListed.result && whiteListed.result[0]}>
          {/* <MainContent whiteList={true} > */}
          <BackArrowStyle onClick={handleOnClick}>
            <ArrowLeft size='20px' cursor={'pointer'}/>
            <TYPE.black ml={"15px"}>Renew your own Farm</TYPE.black>
          </BackArrowStyle>
          {topLoader ?
            <LoaderStyle>
              <Loader size='64px' style={{ margin: 'auto'}} /> 
            </LoaderStyle>
            :
            <>
              <FormStyle>
                <LabelStyle>
                  <label>
                    Type of Farm
                    <MouseoverTooltip
                      text={`Select the appropriate farm as per your use case\n1. Ecosystem Farm - Single reward token farm with no vesting\n2. Dual farm - dual reward token farm with no vesting\n3. Popular farm - Single/dual reward token farm with vested rewards\n4. Launch farm - Single/dual reward token farm with vested rewards with burn rate for early redemption`}
                      placement="bottom"
                    >
                      <Info size={13} style={{ margin: 'auto 5px' }} />
                    </MouseoverTooltip>
                    <span style={{ color: 'red' }}>*</span>
                  </label>
                </LabelStyle>
                <FieldStyle>
                  <select
                    style={{
                      opacity: '0.3',
                      background: darkMode ? '#212429' : '#FFFFFF',
                      maxWidth: '572px',
                      width: '100%',
                      alignItems: 'center',
                      fontSize: '16px',
                      borderRadius: '10px',
                      outline: 'none',
                      padding: '14px 0px 14px 10px',
                      fontFamily: 'inherit',
                      fontWeight: 'inherit',
                      color: darkMode ? '#FFFFFF' : '#000000',
                      border: 'none',
                    }}
                    placeholder={'Select a Farm'}
                    //   defaultValue={liveFarm[0]?.type?.typeOf}
                    disabled
                  >
                    <option>{liveFarm[0]?.type?.typeOf}</option>
                  </select>
                </FieldStyle>
              </FormStyle>
              <FormStyle>
                <LabelStyle>
                  <label>
                    Token Pair
                    <MouseoverTooltip text={'The 2 tokens that you want the users to stake in your farm'} placement="bottom">
                      <Info size={13} style={{ margin: 'auto 5px' }} />
                    </MouseoverTooltip>
                    <span style={{ color: 'red' }}>*</span>
                  </label>
                </LabelStyle>
                <FieldStyleInput>
                  <InputField>
                    <RewardsCurrencyInputPanel
                      label={''}
                      onUserInput={(e: string) => {}}
                      value={''}
                      showMaxButton={false}
                      // currency={liveFarm[0]?.tokens[0]}
                      currency={inputCurrency1}
                      onCurrencySelect={(e) => {}}
                      // otherCurrency={liveFarm[0]?.tokens[1]}
                      otherCurrency={inputCurrency2}
                      id="swap-currency-input"
                      lpByof={true}
                      disableCurrencySelect={true}
                    />
                    <span style={{ margin: 'auto 10px' }}>
                      <Plus size={'15'} />
                    </span>
                    <RewardsCurrencyInputPanel
                      label={''}
                      onUserInput={(e: string) => {}}
                      value={''}
                      showMaxButton={false}
                      // currency={liveFarm[0]?.tokens[1]}
                      currency={inputCurrency2}
                      onCurrencySelect={(e) => {}}
                      // otherCurrency={liveFarm[0]?.tokens[0]}
                      otherCurrency={inputCurrency1}
                      id="swap-currency-input"
                      lpByof={true}
                      disableCurrencySelect={true}
                    />
                  </InputField>
                  {existAddress.length !== 0 ? (
                    <AddressStyle>
                      <CheckCircle style={{ color: 'green' }} />{' '}
                      <span style={{ margin: 'auto 5px', overflow: 'hidden' }}>{existAddress[0].liquidityToken.address}</span>
                    </AddressStyle>
                  ) : (
                    liveFarm[0]?.tokens[1] &&
                    liveFarm[0]?.tokens[0] && (
                      <AddressStyle>
                        <span style={{ color: 'red' }}>No LP address found corresponding to these tokens</span>
                      </AddressStyle>
                    )
                  )}
                </FieldStyleInput>
              </FormStyle>
              <FormStyle>
                <LabelStyle>
                  <label>
                    Reward Token
                    <MouseoverTooltip
                      text={
                        'The token you want to give out as rewards. Enter total rewards to be given in the complete duration'
                      }
                      placement="bottom"
                    >
                      <Info size={13} style={{ margin: 'auto 5px' }} />
                    </MouseoverTooltip>
                    <span style={{ color: 'red' }}>*</span>
                  </label>
                </LabelStyle>
                <FieldStyle>
                  <Wrapper id="swap-page">
                    <AutoColumn1>
                      {outputCurrencyIds.map((_, i: any) => {
                        return (
                          <div key={i}>
                            <CurrencyWrapper inputValue={outputCurrencyIds.length} value={i}>
                              <InnerContent>
                                {outputCurrencyArr[i] && selectedCurrencyBalances[i] ? (
                                  <TYPE.black fontSize="13px" textAlign="start" mb="5px">
                                    {'Balance- ' + selectedCurrencyBalances[i]?.toSignificant(6)}
                                  </TYPE.black>
                                ) : (
                                  ''
                                )}
                                <RewardsCurrencyInputPanel
                                  label={'From'}
                                  value={typedValues[i]}
                                  currency={outputCurrencyArr[i]}
                                  showMaxButton={false}
                                  onUserInput={(e: string) => {
                                    handleTypeInput(e, i)
                                  }}
                                  onCurrencySelect={(e) => {}}
                                  otherCurrency={null}
                                  id="swap-currency-input"
                                  disableCurrencySelect={true}
                                />
                                {account && parsedAmountArr[i] ? (
                                  <></>
                                ) : (
                                  typedValues[i] &&
                                  rewardTokenArray[i] && (
                                    <>
                                      <ButtonInsufficient>
                                        <TYPE.black>Your balance is not enough</TYPE.black>
                                      </ButtonInsufficient>
                                    </>
                                  )
                                )}
                              </InnerContent>
                              {/* {farms !== "DF" && outputCurrencyIds.length > 1 ?
                                                      <CloseWrapper onClick={() => removeInputBox(i, outputCurrencyArr[i])} clickable>
                                                          <div><X size="16" color="white" /></div>
                                                      </CloseWrapper>
                                                      : null
                                                  } */}
                            </CurrencyWrapper>
                          </div>
                        )
                      })}
                    </AutoColumn1>
                  </Wrapper>
                </FieldStyle>
              </FormStyle>
              <StyleTimeFrame>
                <FormStyle>
                  <LabelStyle>
                    <label>
                      Start Date
                      <span style={{ fontSize: '9px', marginLeft: '3px' }}>(UTC)</span>
                      <MouseoverTooltip
                        text={'The date and time (in UTC) on which you want the farm to start'}
                        placement="bottom"
                      >
                        <Info size={13} style={{ margin: 'auto 5px' }} />
                      </MouseoverTooltip>
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                  </LabelStyle>
                  <FieldStyle>
                    <DateStyle>
                      <DateBox>
                        <DatePicker
                          showTimeSelect
                          dateFormat="MM/dd/yyyy  EE hh:mm a"
                          selected={dateStart}
                          onChange={(date: any) => date}
                          placeholderText="Start Date"
                          readOnly={true}
                        />
                      </DateBox>
                    </DateStyle>
                  </FieldStyle>
                </FormStyle>
                <FormStyle style={{ marginBottom: '0px' }}>
                  <LabelStyle>
                    <label>
                      Duration (Days)
                      <MouseoverTooltip text={'Number of days for which the farm will be active'} placement="bottom">
                        <Info size={13} style={{ margin: 'auto 5px' }} />
                      </MouseoverTooltip>
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                  </LabelStyle>
                  <FieldStyle>
                    <select
                      style={{
                        opacity: '0.9',
                        background: darkMode ? '#212429' : '#FFFFFF',
                        maxWidth: '512px',
                        width: '100%',
                        alignItems: 'center',
                        fontSize: '16px',
                        borderRadius: '10px',
                        outline: 'none',
                        padding: '14px 0px 14px 10px',
                        fontFamily: 'inherit',
                        fontWeight: 'inherit',
                        color: darkMode ? '#FFFFFF' : '#000000',
                        border: 'none',
                      }}
                      placeholder={'Duration'}
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
                </FormStyle>
              </StyleTimeFrame>
      
              <ButtonError
                width={'100%'}
                maxWidth={'670px'}
                style={{ zIndex: 0 }}
                onClick={() => buildYourOwnFarms()}
                error={false}
                disabled={!isValidTypedValues() || existAddress.length === 0 || durationEco === 0}
              >
                Create
              </ButtonError>
            </>
          }
          
          <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
            {attempting && !hash && (
              <LoadingView onDismiss={wrappedOnDismissLoader}>
                <AutoColumn gap="12px" justify={'center'}>
                  <TYPE.largeHeader>Renewing Farm</TYPE.largeHeader>
                  <TYPE.body fontSize={20}>
                    {'DFYN LP '}
                    {liveFarm[0]?.tokens[0]?.symbol}
                    {'-'}
                    {liveFarm[0]?.tokens[1]?.symbol}
                  </TYPE.body>
                </AutoColumn>
              </LoadingView>
            )}
            {attempting && hash && (
              <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
                <AutoColumn gap="12px" justify={'center'}>
                  <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
                  <TYPE.body fontSize={20}>{'Farms Renewed'}</TYPE.body>
                </AutoColumn>
              </SubmittedView>
            )}
          </Modal>
        </MainContent>
      </MainContentWrapper>
    )
}

export default RenewForm