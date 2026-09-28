import { BehaviorSubject } from 'rxjs';

/**
 * Init state
 */
const orderbootState = {
  loaded: false,
  Sell: [],
  ask1Id: 0, // 0表示不影响展示
  Buy: [],
  bid1Id: 0, // 0表示不影响展示
  depthGroupedBuyList: [],
  depthGroupedSellList: [],
};

const recentTradeState = {
  loaded: false,
  list: [],
};

export const instrumentStream = new BehaviorSubject();
export const orderbookStream = new BehaviorSubject(orderbootState);
export const recentTradeStream = new BehaviorSubject(recentTradeState);

export const orderbookReset = () => {
  orderbookStream.next(orderbootState);
};

export const recentTradeReset = () => {
  recentTradeStream.next(recentTradeState);
};

export function clearIndexQuoteTopic() {
  instrumentStream.next({});
  orderbookStream.next({ loaded: false });
  recentTradeStream.next({ list: [], loaded: false });
}
