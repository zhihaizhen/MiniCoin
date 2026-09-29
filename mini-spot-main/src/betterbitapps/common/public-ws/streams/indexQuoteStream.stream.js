import { BehaviorSubject } from 'rxjs';




/**
 * Init state
 */
const orderbootState = {
  loaded: false,
  rxBuyList: [],
  rxSellList: [],
  bid1Price: 0,
  ask1Price: 0,
};

const recentTradeState = {
  loaded: false,
  list: [],
};

// 初始化就需要订阅了
export const instrumentStream = new BehaviorSubject();
export const orderbookStream = new BehaviorSubject(orderbootState);
export const depthStream = new BehaviorSubject(orderbootState);
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
  depthStream.next({ loaded: false });
  recentTradeStream.next({ list: [], loaded: false });
}
