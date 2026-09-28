// import pushEvent from '@region/by-gtm';
import { notify, message } from 'common/antdComponents';
import {
  cancelOrder,
  replaceOrder,
  createOrder,
} from '@/services/order.service';
import { useCallback } from 'react';
import { useGlobalState } from '@/store';

let FREEZE_CLICK = false;

export function useSendCreateOrder({
  symbol,
  setClosePositionParams,
  setIfHideClosePositionTip,
  setConfirmLoading,
  feeRateE8,
}) {
  const [globalState, globalDispatch] = useGlobalState();
  return useCallback(
    (params) => {
      if (FREEZE_CLICK) {
        return;
      }
      FREEZE_CLICK = true;
      createOrder({ ...params, feeRateE8 })
        .then((res) => {})
        .finally(() => {
          FREEZE_CLICK = false;
          setClosePositionParams(null);
          setIfHideClosePositionTip(false);
          setConfirmLoading(false);
        });
    },
    [
      setClosePositionParams,
      setConfirmLoading,
      setIfHideClosePositionTip,
      symbol,
    ],
  );
}

export function useSendCancelActivityPositionOrder({
  t,
  symbol,
  setCancelOrderParams,
  setIfHideCancelOrderTip,
  setConfirmLoading,
}) {
  const [globalState] = useGlobalState();
  const { user } = globalState;
  return useCallback(
    (currentOrderInfo) => {
      if (FREEZE_CLICK) {
        return;
      }
      FREEZE_CLICK = true;
      const { params, side, price, qty } = currentOrderInfo;

      cancelOrder({
        order_id: params.orderId,
        account_id: user?.userInfo?.defaultAccountId,
      })
        .then(() => {
          const sType = side === 'Buy' ? t('Buy') : t('Sell');
          message.success(t('cancelSuccess'));
          // notify.success(
          //   t('orderCancelSuc'),
          //   t('actOrderCancelSucDesc', {
          //     price,
          //     type: sType,
          //     qty,
          //     symbol,
          //   }),
          // );
          /**           pushEvent(
            'click',
            'trade_cancel',
            `trading_pair=${symbol},order_type=Activity,trade_type=${side}`,
          ); */
        })
        .finally(() => {
          FREEZE_CLICK = false;
          setCancelOrderParams(null);
          setIfHideCancelOrderTip(false);
          setConfirmLoading(false);
        });
    },
    [
      setCancelOrderParams,
      setConfirmLoading,
      setIfHideCancelOrderTip,
      symbol,
      t,
    ],
  );
}

export function useSendCancelConditionsPositionOrder({
  t,
  symbol,
  setCancelOrderParams,
  setIfHideCancelOrderTip,
  setConfirmLoading,
}) {
  const [globalState] = useGlobalState();
  const { user } = globalState;
  return useCallback(
    (currentOrderInfo) => {
      if (FREEZE_CLICK) {
        return;
      }
      FREEZE_CLICK = true;
      const { params, side, qty, triggerPrice } = currentOrderInfo;

      cancelOrder({
        order_id: params.orderId,
        account_id: user?.userInfo?.defaultAccountId,
      })
        .then(() => {
          const sType = side === 'Buy' ? t('Buy') : t('Sell');
          notify.success(
            t('orderCancelSuc'),
            t('cOrderCancelSucDesc', {
              triggerPrice,
              type: sType,
              qty,
              symbol,
            }),
          );
          /**           pushEvent(
            'click',
            'trade_cancel',
            `trading_pair=${symbol},order_type=Conditions,trade_type=${side}`,
          ); */
        })
        .finally(() => {
          FREEZE_CLICK = false;
          setCancelOrderParams(null);
          setIfHideCancelOrderTip(false);
          setConfirmLoading(false);
        });
    },
    [
      setCancelOrderParams,
      setConfirmLoading,
      setIfHideCancelOrderTip,
      symbol,
      t,
    ],
  );
}

export function usePostReplaceOrder({ tradingViewRef }) {
  return useCallback(
    (p, r) => {
      // TODO temporary not support replace order, reset order line directly
      tradingViewRef.current.resetOrderLines(p.type);
      // return new Promise((resolve, reject) =>
      //   replaceOrder(p, r)
      //     .then(() => {
      //       resolve();
      //     })
      //     .catch((e) => {
      //       tradingViewRef.current.resetOrderLines(p.type);
      //       reject(e);
      //     }),
      // );
    },
    [tradingViewRef],
  );
}
