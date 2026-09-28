import { ORDER_TYPE } from '../common/packages-biz/by-global-settings/usdt-settings';

export const orderQtyFocusEventNames = {
  [ORDER_TYPE.LIMIT]: 'trade_orderLimitQtyOpen',
  [ORDER_TYPE.MARKET]: 'trade_orderMarketQtyOpen',
  [ORDER_TYPE.CONDITION]: 'trade_orderConditionalQtyOpen'
};

export const orderQtySelectEventNames = {
  [ORDER_TYPE.LIMIT]: 'trade_orderLimitPercentOpen',
  [ORDER_TYPE.MARKET]: 'trade_orderMarketPercentOpen',
  [ORDER_TYPE.CONDITION]: 'trade_orderConditionalPercentOpen'
};

export const orderTypeChangeEventNames = {
  [ORDER_TYPE.LIMIT]: 'trade_positionLimitOpen',
  [ORDER_TYPE.MARKET]: 'trade_positionMarketOpen',
  [ORDER_TYPE.CONDITION]: 'trade_positionConditionalOpen'
};
