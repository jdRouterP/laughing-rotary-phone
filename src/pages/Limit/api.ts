import { ChainId } from "@dfyn/sdk";
import { request, gql } from "graphql-request";

const LIMIT_ORDERS_API = process.env.REACT_APP_UNIDEX_ORDERS;
const UNIDEX_GRAPH_API = process.env.REACT_APP_UNIDEX_GRAPH_API;

export async function deleteOrder(
  order: any,
  chainId: ChainId | undefined
): Promise<any> {
  const {
    owner: account,
    module,
    inputToken,
    outputToken,
    minReturn,
    owner,
    witness,
  } = order;
  let url = `${LIMIT_ORDERS_API}/orders/limit/cancel?account=${account}&chainId=${chainId}&module=${module}&inputToken=${inputToken}&outputToken=${outputToken}&minReturn=${minReturn}&owner=${owner}&witness=${witness}`;
  let response;
  try {
    response = await fetch(url, { credentials: "omit" });
    return response.json();
  } catch (error) {}
}

export async function createOrder(order: any): Promise<any> {
  const {
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    account,
    chainId,
  } = order;
  let url = `${LIMIT_ORDERS_API}/orders/limit?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${sellAmount}&buyAmount=${buyAmount}&account=${account}&chainId=${chainId}`;
  let response;
  try {
    response = await fetch(url, { credentials: "omit" });
    return response.json();
  } catch (error) {
    return {};
  }
}

export async function getListOpenOrders(
  address: string | null | undefined,
  chainId: ChainId | undefined,
  status: string = "open"
): Promise<any> {
  const owner = address?.toLowerCase();
  let url = `${UNIDEX_GRAPH_API}`;
  let response;
  try {
    response = await request(
      url,
      gql`
        query GetOrdersByOwner($owner: String) {
          orders(where:{owner:$owner,status:${status}}) {
            id
            owner
            createdAt
            module
            inputToken
            outputToken
            inputAmount
            minReturn
            witness
            secret
            status
          }
        }
      `,
      { owner }
    );
    return response.orders;
  } catch (error) {
    return {};
  }
}
