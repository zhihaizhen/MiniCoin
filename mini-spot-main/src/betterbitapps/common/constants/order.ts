import {
  EOrderSide,
  EOrderTimeInForce,
  EOrderTriggerBy,
  EOrderType,
  EQtyType,
} from 'common/enums/order.enum';



export const orderInititalState = {
  orderType: EOrderType.Limit,
  side: EOrderSide.Buy,
  timeInForce: EOrderTimeInForce.GoodTillCancel,
  qty: undefined,
  price: undefined,
  takeProfit: '',
  tpTriggerBy: EOrderTriggerBy.IndexPrice,
  stopLoss: '',
  slTriggerBy: EOrderTriggerBy.IndexPrice,
  reduceOnly: false,
  leverage: 100,
  closeOnTrigger: false,
  preCreateId: '',
  triggerPrice: undefined,
  triggerBy: EOrderTriggerBy.IndexPrice,
  positionIdx: 1, // 双向-做多，2表示双向-做空 0表示单向
  leverageE2: 1000,
  type: 'Activity',
  cost: undefined, // 成本下单使用
  orderQtyType: EQtyType.Qty,
};

export const preOrderInitialState = {
  orderType: EOrderType.Limit,
  price: undefined,
  takeUpMargin: undefined,
  liqPrice: undefined,
  qty: undefined,
  origQty: undefined,
  takeProfit: undefined,
  stopLoss: undefined,
  leverage: 100,
  preCreateId: '',
  value: 0,
};
