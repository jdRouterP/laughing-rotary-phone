import { ChainId } from "@dfyn/sdk";
import { getRouterAddress } from "utils";

export default function getWallChainTxn(data: string, senderAddress: string, chainId: ChainId, value: string): any {
  const contractAddress = getRouterAddress(chainId);
  
  return fetch('https://matic.wallchain.xyz/upgrade_txn/?key=3a48884a-a490-4ad8-9c31-681ed704292c', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      value,
      sender: senderAddress,
      destination: contractAddress,
      data,
    }),
  })
    .then((response) => response.json())
    .then((response_json) => {
        console.log('wallchain response: ', response_json)
        return response_json;
    })
    .catch((err) => {
      console.error('wallchain error: ', err)
      return null;
    })
}
