// import pushEvent from '@region/by-gtm';
import { transformNum } from '@unified/helpers';
import { neverGotOrderId } from 'common/model/httpAwsTips';
import { message, notify } from 'common/antdComponents';
import { useMemo } from 'react';
import { createOrder } from '@/services/order.service';
import {
  ORDER_ACTION,
  ORDER_TYPE,
} from '@/constants/types';

let freezeClickBuy = false;
let freezeClickSell = false;

const handleResetFreeze = () => {
  if (freezeClickBuy) freezeClickBuy = false;
  if (freezeClickSell) freezeClickSell = false;
};

const createQuickOrder = ({
  price,
  qty,
  originalQty,
  cb,
  side,
  success,
  symbol,
  coin,
  t,
}) => {
  if (price <= 0) {
    message.error(t('ztsl_error_code:130005'));
    if (typeof cb === 'function') cb();
    handleResetFreeze();
    return;
  }
  if (qty <= 0 || !qty) {
    message.error(t('ztsl_error_code:130009'));
    if (typeof cb === 'function') cb();
    handleResetFreeze();
    return;
  }
  const finalParams = {
    type: ORDER_TYPE.MARKET.toLowerCase(),
    side: side.toUpperCase(),
    price: String(price),
    quantity: qty,
    symbol_id: symbol, // BTCUSDT
    client_order_id: new Date().getTime(),
  };

  createOrder(finalParams)
    .then((res) => {
      // http-ws 如果已经存在orderId, 不提示
      if (neverGotOrderId(res.data?.orderId)) {
        const sideT =
          side === ORDER_ACTION.BUY ? t('orderBuy') : t('orderSell');
        notify.success(
          t('orderCreateSuccessTitle'), // 委托创建成功
          t('orderCreateSuccess', {
            price,
            side: sideT,
            qty,
            coin,
            symbol,
          }),
        );
      }
   
      if (typeof success === 'function') success(res);
    })
    .catch(() => {})
    .finally(() => {
      if (typeof cb === 'function') cb();
      if (side === ORDER_ACTION.BUY) {
        freezeClickBuy = false;
      }
      if (side === ORDER_ACTION.SELL) {
        freezeClickSell = false;
      }
    });
};

export function useGenQuickOrderProps({
  t,
  symbol,
  coin,
  bid1,
  ask1,
  formattedAsk1,
  formattedBid1,
  lastPriceNumber,
  maxQty,
  lotFraction,
  lotSize,
}) {
  return useMemo(() => {
    return {
      leftBtnText: t('buyLongMarket'),
      rightBtnText: t('sellShortMarket'),
      bid1,
      ask1,
      formattedAsk1,
      formattedBid1,
      minQty: 0,
      maxQty,
      precision: lotFraction,
      lotSize,
      needLoading: true,
      symbol,

      // qty为转化后的btc的单位
      onBuy: (price, qty, originalQty, cb, success) => {
        /**         pushEvent('click', 'trade_buylong', `trading_pair=${symbol}`); */
        if (freezeClickBuy) {
          return;
        }
        freezeClickBuy = true;
        createQuickOrder({
          side: ORDER_ACTION.BUY,
          price,
          qty,
          originalQty,
          cb,
          success,
          t,
          symbol,
          coin,
        });
      },
      onSell: (price, qty, originalQty, cb, success) => {
        /**         pushEvent('click', 'trade_sellshort', `trading_pair=${symbol}`); */
        if (freezeClickSell) {
          return;
        }
        freezeClickSell = true;
        createQuickOrder({
          side: ORDER_ACTION.SELL,
          price,
          qty,
          originalQty,
          cb,
          success,
          t,
          symbol,
          coin,
        });
      },
    };
  }, [
    t,
    bid1,
    ask1,
    formattedAsk1,
    formattedBid1,
    maxQty,
    lotFraction,
    lotSize,
    symbol,
    lastPriceNumber,
    coin,
  ]);
}
