import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from '@dfyn/sdk'
import { useMemo } from 'react'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE} from '../constants'
import { getTradeVersion, useV1TradeExchangeAddress } from '../data/V1'
import { splitSignature } from '@ethersproject/bytes'
import { useTransactionAdder } from '../state/transactions/hooks'
import abi from '../constants/abis/uniswap-v2-router-02.json'
import { calculateGasMargin, getRouterAddress, getRouterContract, isAddress, shortenAddress } from '../utils'
import isZero from '../utils/isZero'
import v1SwapArguments from '../utils/v1SwapArguments'
import { useActiveWeb3React } from './index'
import { useV1ExchangeContract, useWallChainContract } from './useContract'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './useENS'
import { Version } from './useToggledVersion'
import { useGaslessModeManager } from 'state/user/hooks'
import getBiconomy from './getBiconomy'
// import getWallChainTxn from 'utils/getWallChainTxn'
// import { getNetworkLibrary } from 'connectors'
// import ROUTER_ABI from "../constants/abis/uniswap-v2-router-02.json";
// import { useApproveCallback, ApprovalState } from '../hooks/useApproveCallback'

// const Web3 = require("web3");
export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  const v1Exchange = useV1ExchangeContract(useV1TradeExchangeAddress(trade), true)

  return useMemo(() => {
    const tradeVersion = getTradeVersion(trade)
    if (!trade || !recipient || !library || !account || !tradeVersion || !chainId || !deadline) return []

    const contract: Contract | null =
      tradeVersion === Version.v2 ? getRouterContract(chainId, library, account) : v1Exchange
    if (!contract) {
      return []
    }

    const swapMethods = []

    switch (tradeVersion) {
      case Version.v2:
        swapMethods.push(
          Router.swapCallParameters(trade, {
            feeOnTransfer: false,
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            deadline: deadline.toNumber()
          })
        )

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          swapMethods.push(
            Router.swapCallParameters(trade, {
              feeOnTransfer: true,
              allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
              recipient,
              deadline: deadline.toNumber()
            })
          )
        }
        break
      case Version.v1:
        swapMethods.push(
          v1SwapArguments(trade, {
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            deadline: deadline.toNumber()
          })
        )
        break
    }
    return swapMethods.map(parameters => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade, v1Exchange])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null,
  wallChainResponse: any// the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
  const [gaslessMode] = useGaslessModeManager();
  const getWeb3 = getBiconomy(gaslessMode);


  const contractAddress = getRouterAddress(chainId);

  const wallchainProxyContract =  useWallChainContract()

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  const addTransaction = useTransactionAdder()

  // const [approval, approveCallback] = useApproveCallback(trade?.inputAmount, WALLCHAIN_ADDRESS)

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    const tradeVersion = getTradeVersion(trade)

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(call => {
            const {
              parameters: { methodName, args, value },
              contract
            } = call
            const options = !value || isZero(value) ? {} : { value }

            return contract.estimateGas[methodName](...args, options)
              .then(gasEstimate => {
                return {
                  call,
                  gasEstimate
                }
              })
              .catch(gasError => {
                console.debug('Gas estimate failed, trying eth_call to extract error', call)

                return contract.callStatic[methodName](...args, options)
                  .then(result => {
                    console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
                  })
                  .catch(callError => {
                    console.debug('Call threw error', call, callError)
                    let errorMessage: string
                    switch (callError.reason) {
                      case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                        break
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
                    }
                    return { call, error: new Error(errorMessage) }
                  })
              })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value }
          },
          gasEstimate
        } = successfulEstimation

        if (methodName === "swapExactETHForTokens" || methodName === "swapETHForExactTokens" || !gaslessMode) {

          // //call wallchain here
          // const web3 = new Web3(getNetworkLibrary())
          // const fnMethodSchema = ROUTER_ABI.find(fnSchema => fnSchema.name === methodName)
          // const data = web3.eth.abi.encodeFunctionCall(fnMethodSchema, args)
          // const wallChainResponse = await getWallChainTxn(data, account, chainId, isZero(value)?'0': BigInt(value).toString())
          // console.log('wallChainResponse: ', wallChainResponse)
          if(wallchainProxyContract && wallChainResponse && wallChainResponse.pathFound && wallChainResponse.transactionArgs && library.provider && library.provider.isMetaMask && library.provider.request) {
            wallChainResponse.transactionArgs.to = '0xC123F196aaD0a34e27075f5b491C69908C386A13'
            wallChainResponse.transactionArgs.from = wallChainResponse.transactionArgs.sender
            wallChainResponse.transactionArgs.gas = '0xC3500'
            args.push(wallChainResponse["transactionArgs"]?.data)
            return library.provider.request({
              method: 'eth_sendTransaction',
              params: [wallChainResponse.transactionArgs],
            }).then(async hash => {
              const inputSymbol = trade.inputAmount.currency.symbol;
              const outputSymbol = trade.outputAmount.currency.symbol;
              const inputAmount = trade.inputAmount.toSignificant(3)
              const outputAmount = trade.outputAmount.toSignificant(3)
              const txnData = await library.getTransaction(hash)
              const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`

              addTransaction(txnData, {
                summary: base
              })
              return hash;
            })
          //call wallchainResponse to wallet directly (limit order way)
            // return;
          }
          return contract[methodName](...args, {
            gasLimit: calculateGasMargin(gasEstimate),
            ...(value && !isZero(value) ? { value, from: account } : { from: account })
          })
            .then((response: any) => {
              const inputSymbol = trade.inputAmount.currency.symbol;
              const outputSymbol = trade.outputAmount.currency.symbol;
              const inputAmount = trade.inputAmount.toSignificant(3)
              const outputAmount = trade.outputAmount.toSignificant(3)

              const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
              const withRecipient =
                recipient === account
                  ? base
                  : `${base} to ${recipientAddressOrName && isAddress(recipientAddressOrName)
                    ? shortenAddress(recipientAddressOrName)
                    : recipientAddressOrName
                  }`

              const withVersion =
                tradeVersion === Version.v2 ? withRecipient : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`

              addTransaction(response, {
                summary: withVersion
              })

              return response.hash
            })
            .catch((error: any) => {
              // if the user rejected the tx, pass this along
              if (error?.code === 4001) {
                throw new Error('Transaction rejected.')
              } else {
                // otherwise, the error was unexpected and we need to convey that
                console.error(`Swap failed`, error, methodName, args, value)
                throw new Error(`Swap failed: ${error.message}`)
              }
            })
        }
        else {
          const bicomony_contract = new getWeb3.eth.Contract(abi, contractAddress);
          let biconomy_nonce = await bicomony_contract.methods.getNonce(account).call();
          let gasLimit = calculateGasMargin(gasEstimate)
          console.log("gasLimit", gasLimit);
          let res = bicomony_contract.methods[methodName](...args).encodeABI()
          let message: any = {};
          message.nonce = parseInt(biconomy_nonce);
          message.from = account;
          message.functionSignature = res;

          const dataToSign = JSON.stringify({
            types: {
              EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "verifyingContract", type: "address" },
                { name: "chainId", type: "uint256" }
              ],
              MetaTransaction: [
                { name: "nonce", type: "uint256" },
                { name: "from", type: "address" },
                { name: "functionSignature", type: "bytes" }
              ]
            },
            domain: {
              name: "UniswapV2Router02",
              version: "1",
              verifyingContract: contractAddress,
              chainId
            },
            primaryType: "MetaTransaction",
            message
          });
          let sig = await library
            .send('eth_signTypedData_v4', [account, dataToSign])
          let signature = await splitSignature(sig)
          let { v, r, s } = signature
          // console.log('account: ', account, 'res: ', res, 'r: ', r, 's: ', s, 'v: ', v)
          return bicomony_contract.methods
            .executeMetaTransaction(account, res, r, s, v)
            .send({
              from: account
            })
            .then((response: any) => {

              const inputSymbol = trade.inputAmount.currency.symbol
              const outputSymbol = trade.outputAmount.currency.symbol
              const inputAmount = trade.inputAmount.toSignificant(3)
              const outputAmount = trade.outputAmount.toSignificant(3)

              const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
              const withRecipient =
                recipient === account
                  ? base
                  : `${base} to ${recipientAddressOrName && isAddress(recipientAddressOrName)
                    ? shortenAddress(recipientAddressOrName)
                    : recipientAddressOrName
                  }`

              const withVersion =
                tradeVersion === Version.v2 ? withRecipient : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`

              if (!response.hash)
                response.hash = response.transactionHash;
              addTransaction(response, {
                summary: withVersion
              })

              return response.hash
            })
            .catch((error: any) => {
              // if the user rejected the tx, pass this along
              if (error?.code === 4001) {
                throw new Error('Transaction rejected.')
              } else {
                // otherwise, the error was unexpected and we need to convey that
                console.error(`Swap failed`, error, methodName, args, value)
                throw new Error(`Swap failed: ${error.message}`)
              }
            })
        }
        // return contract[methodName](...args, {
        //   gasLimit: calculateGasMargin(gasEstimate),
        //   ...(value && !isZero(value) ? { value, from: account } : { from: account })
        // })
        //   .then((response: any) => {
        //     const inputSymbol = trade.inputAmount.currency.symbol
        //     const outputSymbol = trade.outputAmount.currency.symbol
        //     const inputAmount = trade.inputAmount.toSignificant(3)
        //     const outputAmount = trade.outputAmount.toSignificant(3)

        //     const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
        //     const withRecipient =
        //       recipient === account
        //         ? base
        //         : `${base} to ${
        //             recipientAddressOrName && isAddress(recipientAddressOrName)
        //               ? shortenAddress(recipientAddressOrName)
        //               : recipientAddressOrName
        //           }`

        //     const withVersion =
        //       tradeVersion === Version.v2 ? withRecipient : `${withRecipient} on ${(tradeVersion as any).toUpperCase()}`

        //     addTransaction(response, {
        //       summary: withVersion
        //     })

        //     return response.hash
        //   })
        //   .catch((error: any) => {
        //     // if the user rejected the tx, pass this along
        //     if (error?.code === 4001) {
        //       throw new Error('Transaction rejected.')
        //     } else {
        //       // otherwise, the error was unexpected and we need to convey that
        //       console.error(`Swap failed`, error, methodName, args, value)
        //       throw new Error(`Swap failed: ${error.message}`)
        //     }
        //   })
      },
      error: null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCalls, addTransaction, gaslessMode, contractAddress])
}
