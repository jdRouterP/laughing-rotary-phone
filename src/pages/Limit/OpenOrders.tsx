import React, { useState } from 'react'
import _get from 'lodash.get'
import { convertIdToToken } from 'hooks/Tokens';
import { ETH_MAINNET_NATIVE_ADDRESS } from 'constants/index';
import { formatUnits } from '@ethersproject/units'
import { ArrowForward } from '@material-ui/icons'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { deleteOrder } from './api';
import { NETWORK_CHAIN_ID } from 'connectors';
import { useActiveWeb3React } from 'hooks';
import { useLimitOrderState, useSwapActionHandlers } from 'state/limitOrder/hooks';
import { RowBetween, RowFixed } from 'components/Row';
import { Currency } from '@dfyn/sdk';
import CurrencyLogo from 'components/CurrencyLogo';
import { ButtonPrimary } from 'components/Button';
import { darken } from 'polished';
import { ButtonTab, ButtonTabItem } from 'components/ButtonTab';
import { useTranslation } from 'react-i18next';
import { useOpenOrdersCallback } from 'hooks/useOpenOrdersCallback';
import { useTransactionAdder } from 'state/transactions/hooks';
import Loader from 'components/Loader';

export enum OrdersTabs {
    Open,
    Cancelled,
    Executed
}

const ButtonMenuContainer = styled.div`
  width: 100%;
  & > div {
    width: 100%;
  }

  & button {
    width: 100%;
  }
`

const StyledTableRow = styled.div`
    padding: 10px 20px;
    &:hover {
        background: #2f303c7a;
    }
    &:first-child {
        margin-top: 5px;
    }
`
const ShowOrderStatus = styled.span`
    color: ${({ theme }) => theme.text3};
`
const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  flex: 1;
  overflow: hidden;
  z-index: 10;
  border-radius: 30px;
  max-height: 620px;
  color: ${({ theme }) => theme.text1};
  box-shadow: 0px 0px 1px rgba(0,0,0,0.01),0px 4px 8px rgba(0,0,0,0.04),0px 16px 24px rgba(0,0,0,0.04), 0px 24px 32px rgba(0,0,0,0.01);
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const LimitOrderPair = styled.div`
    font-size: 14px;
    width: 90%;
    color: ${({ theme }) => theme.text1};
    display: flex;
    -moz-box-align: center;
    align-items: center;
    -moz-box-pack: justify;
    justify-content: space-between;
    margin: 0px;
    margin-bottom: 5px;
    margin-left: 20px;
    cursor: pointer;
    img {
        width: 18px;
        height: 18px;
        border-radius: 18px;
        box-shadow: rgba(0, 0, 0, 0.075) 0px 6px 10px;
        background-color: rgb(255, 255, 255);
    }
`

const OrderTitle = styled.span`
    width: 60%;
    display: flex;
    -moz-box-align: center;
    align-items: center;
    -moz-box-pack: justify;
    justify-content: space-between;
`

const LimitOrderDesc = styled.div`
    font-size: 12px;
    margin-left: 20px;
    margin-bottom: 2px;
`

const LimitOrderDate = styled.div`
    font-size: 12px;
    margin-left: 20px;
    margin-bottom: 2px;
`
const Title = styled.span`
    text-align: left;
    width: 100%;
    margin: 0px;
`

const CustomButtonPrimary = styled(ButtonPrimary)`
    height: 20px;
    width: 60px;
    font-size: 12px;
    background: none;
    border: 1px solid ${({ theme }) => theme.secondary1};
    color: ${({ theme }) => theme.text1};
    :hover {
        border: 1px solid ${({ theme }) => darken(0.1, theme.secondary1)};
        color: ${({ theme }) => darken(0.1, theme.text1)};
        background: transparent;
        cursor: pointer;
        background-color: ${({ theme }) => darken(0.1, theme.secondary1)};
      }
    
      :focus {
        border: 1px solid blue;
        background: transparent;
      }
`
const FilterStatus = styled(RowBetween)`
    padding: 0 10px 0 10px;
    cursor: pointer;
`

const ViewOrders = styled.div`
      min-height: 300px;
      max-height: 500px;
      overflow: auto;
      ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
        background-color: ${({ theme }) => theme.bg1};
      }
      ::-webkit-scrollbar-thumb{
        background-color: ${({ theme }) => theme.bg2};
        border: none;
        border-radius: 1px;
      }
`

export default function OpenOrders() {
    const { t } = useTranslation()

    const [activeTab, setActiveTab] = useState(0)
    const { onOrderStatusType } = useSwapActionHandlers()

    const switchTab = async (tabIndex: number) => {
        setActiveTab(tabIndex)
        onOrderStatusType(OrdersTabs[tabIndex].toLowerCase())
    }
    // let { limitOrders } = useLimitOrderState()
    const { orderStatus, limitOrders } = useLimitOrderState()
    const fetchOrders = useOpenOrdersCallback()
    const addTransaction = useTransactionAdder()

    let openOrders = limitOrders && limitOrders.length && limitOrders.filter(x => x.status.toLowerCase() === (OrdersTabs[activeTab]).toLowerCase())
    openOrders && openOrders.sort(function (a, b) {
        return _get(b, 'createdAt', '0') - _get(a, 'createdAt', '0') 
    });
    const { library, chainId } = useActiveWeb3React()
    const handleDeleteOrder = async (order: any) => {
        const deleteOrderTxnData = await deleteOrder(order, NETWORK_CHAIN_ID)
        if (library && library.provider.isMetaMask && library.provider.request) {
            const hash = await library.provider.request({
                method: 'eth_sendTransaction',
                params: [deleteOrderTxnData['tx']],
            })
            const base = `Order deleted for pair ${_get(order, 'formattedData.pairSymbol', '')}`
            const txnData = await library.getTransaction(hash)
            addTransaction(txnData, { summary: base })
            const fetchDataInterval = setInterval(async ()=>{
                const txnData = await library.getTransaction(hash)
                if(txnData.confirmations > 1){
                  fetchOrders(orderStatus)
                  clearInterval(fetchDataInterval)
                }
              }, 2000)
        }
    }

    const CreateData = (input: any) => {
        const row = Object.assign({ formattedData: {} }, input.row)
        const createdDate = new Date(0)
        createdDate.setUTCSeconds(_get(row, 'createdAt', '0'))
        const formattedDate = `${createdDate.getDate()} ${createdDate.toLocaleString('default', { month: 'short' })} ${createdDate.getFullYear()} ${createdDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
        const limitPriceRow = _get(row, 'inputAmount', '0')
        const address1 = row.inputToken, address2 = row.outputToken
        let [asset1, asset2] = convertIdToToken([address1, address2])
        let pair1Symbol = asset1?.symbol
        let pair2Symbol = asset2?.symbol

        if (address1.toLowerCase() === ETH_MAINNET_NATIVE_ADDRESS.address.toLowerCase()) {
            pair1Symbol = ETH_MAINNET_NATIVE_ADDRESS.symbol
            asset1 = Currency.getNativeCurrency(chainId)
        }
        if (address2.toLowerCase() === ETH_MAINNET_NATIVE_ADDRESS.address.toLowerCase()) {
            pair2Symbol = ETH_MAINNET_NATIVE_ADDRESS.symbol
            asset2 = Currency.getNativeCurrency(chainId)
        }

        let pair = `${pair1Symbol}-${pair2Symbol}`
        const minReturn = _get(row, 'minReturn', 0)
        const sellAmount = formatUnits(limitPriceRow, asset1?.decimals).toString()
        row.formattedData = {
            pairSymbol: pair,
            sellAmount
        }

        return <StyledTableRow key={row.id}>
            <LimitOrderPair>
                <OrderTitle>
                    <CurrencyLogo currency={asset1} /> {asset1?.symbol} <ArrowForward /> <CurrencyLogo currency={asset2} /> {asset2?.symbol}
                </OrderTitle>
                {activeTab === 0?<CustomButtonPrimary onClick={() => handleDeleteOrder(row)}>Cancel</CustomButtonPrimary>:
                activeTab === 1? <ShowOrderStatus>{OrdersTabs[activeTab]}</ShowOrderStatus>:
                <ShowOrderStatus>{t('Filled')}</ShowOrderStatus>}
            </LimitOrderPair>
            <LimitOrderDesc>
                Sell {sellAmount} {asset1?.symbol} for {formatUnits(minReturn, asset2?.decimals).toString()} {asset2?.symbol}
            </LimitOrderDesc>
            <LimitOrderDate>{formattedDate}</LimitOrderDate>
        </StyledTableRow>
    }

    return (<BodyWrapper>
        <Title>
            <RowBetween>
                <RowFixed>
                    <TYPE.mediumHeader fontSize={'16px'} margin={'20px'} fontWeight={600}>Limit Orders</TYPE.mediumHeader>
                </RowFixed>
            </RowBetween>
        </Title>
        <FilterStatus>
            <ButtonMenuContainer>
                <ButtonTab activeIndex={activeTab} onItemClick={switchTab}>
                    <ButtonTabItem width="33%" mr="5px" padding="8px 6px">{t('Open')}</ButtonTabItem>
                    <ButtonTabItem width="33%" color='text8' mr="5px" padding="8px 6px">{t('Cancelled')}</ButtonTabItem>
                    <ButtonTabItem width="33%" color='text8' mr="5px" padding="8px 6px">{t('Filled')}</ButtonTabItem>
                </ButtonTab>
            </ButtonMenuContainer>
        </FilterStatus>
        {openOrders && openOrders.length === 0 
        ? <Loader style={{ margin: '20px auto' }} /> 
        : !openOrders 
        ? <div style={{ textAlign: 'center', padding: '30px', width: '100%' }}>No orders found</div>
        : openOrders.length === 0 
        ? <div style={{ textAlign: 'center', padding: '30px', width: '100%' }}>No orders found</div>
        :   (
            <ViewOrders>
                {openOrders && openOrders.length > 0 && openOrders.map((o, i) => <CreateData key={i} row={o} />)}
            </ViewOrders>) 
        }
    </BodyWrapper>)
}