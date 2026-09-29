import { TRADE_STRATEGY } from '@/constants/types';
// import pushEvent from '@region/by-gtm';

import { useMemo } from 'react';

export function useGenActiveOrderLines({
  t,
  symbol,
  language,
  priceRef,
  activityList,
  cancelOrderTipStatus,
  watchPriceChangeStatus,
  setCancelOrderParams,
  sendCancelActivityPositionOrder,
  setReplaceOrderText,
  setReplaceOrderConfirm,
  postReplaceOrder,
}) {
  return useMemo(() => {
    if (activityList.length > 0) {
      const aArr = [];
      activityList.forEach((item) => {
        const {
          orderId,
          origQty: qty,
          price,
          side,
          timeInForce,
          positionIdx,
        } = item;
        aArr.push({
          id: orderId,
          text: `${t('limitOrder')}：${price}`,
          size: qty,
          price,
          side,
          positionIdx: String(positionIdx),
          onCancel: () => {
            const params = {
              orderId,
              symbol: item.symbol,
              positionIdx: String(positionIdx),
            };
            if (cancelOrderTipStatus === 'show') {
              setCancelOrderParams({
                params,
                side,
                price,
                qty,
                symbol,
                type: 'Activity',
              });
            } else {
              sendCancelActivityPositionOrder({
                params,
                side,
                price,
                qty,
                symbol,
                type: 'Activity',
              });
            }
          },
          onMove: (curPrice) => {
            const params = {
              orderId,
              type: 'Activity',
              symbol: item.symbol,
              price: String(curPrice),
            };

            if (
              (side === 'Buy' && curPrice > priceRef.current.lastPrice) ||
              (side === 'Sell' && curPrice < priceRef.current.lastPrice)
            ) {
              if (timeInForce === TRADE_STRATEGY.POST_ONLY) {
                setReplaceOrderText(
                  t('orHintContentCancel', { price: curPrice }),
                );
              } else {
                // 可能立即成交
                setReplaceOrderText(
                  t('orHintContentExec', { price: curPrice }),
                );
              }
              setReplaceOrderConfirm({
                params,
                rpPorts: { sc: 20316, ec: 20317 },
                side,
              });
              return;
            }
            postReplaceOrder(params, { sc: 20316, ec: 20317 });
            /**             pushEvent(
              'click',
              'trade_modify',
              `trading_pair=${symbol},order_type=Activity,trade_type=${side}`,
            ); */
          },
        });
      });
      return aArr;
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityList, language, cancelOrderTipStatus, watchPriceChangeStatus]);
}
