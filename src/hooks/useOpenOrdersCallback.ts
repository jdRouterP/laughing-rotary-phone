// import { useLimitOrderState } from 'state/limitOrder/hooks';
import { useActiveWeb3React } from "hooks";
import { deleteOrder, getListOpenOrders } from "pages/Limit/api";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "state";
import { setLimitOrders } from "state/limitOrder/actions";
// import { useLimitOrderState } from "state/limitOrder/hooks";

export function useOpenOrdersCallback(): any {
  const { chainId, account } = useActiveWeb3React();
  // const { orderStatus } = useLimitOrderState()
  // const [ordersFetched, setOrdersFetched] = useState<any[]>([]);

  const dispatch = useDispatch<AppDispatch>();
// console.log(dispatch)
  return useMemo(()=> {
    // console.log(`order status: ${orderStatus}`)
    return (orderStatus: string)=> getListOpenOrders(account, chainId, orderStatus).then((resp: any) => {
      dispatch(setLimitOrders({ orders: resp }));
    })
    .catch((error: any) => {
      console.debug(`Failed to get open orders list`, error);
      throw error;
    })
  }, [account, chainId, dispatch])
  // return ordersFetched
}

export function useDeleteOrdersCallback(order: any): any[] {
  const { chainId } = useActiveWeb3React();
  const [deleteOrderTxn, setDeleteOrderTxn] = useState<any[]>([]);

  useEffect(() => {
    deleteOrder(order, chainId)
      .then((resp) => {
        setDeleteOrderTxn(resp);
      })
      .catch((error) => {
        console.debug(`Failed to get open orders list`, error);
        throw error;
      });
  }, [chainId, order]);
  return deleteOrderTxn;
}
