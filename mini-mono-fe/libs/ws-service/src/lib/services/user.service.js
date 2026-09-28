import {
  ABTestResult,
  execTypeKeyMap
} from '../common/packages-biz/by-global-settings/index';
import {
  getClosedPnlList,
  getTpslAllList
} from '../common/services/linearOrder.service';
import { getPositionList } from '../common/services/linearPosition.service';
import { getTradeList } from '../common/services/linearTrade.service';
import { getOrderList } from '../common/services/order.service';
import http from '../common/utils/http';
import debounce from 'lodash.debounce';
import { Env } from '@region-lib/env';
import { api2Host } from '../common/utils/routerSwitchEvent';
import { types } from '../store';

const PRE_CREATE_SAVE_API = () => `${api2Host}/user/private/v3/double-confirm-save`;

export const savePreCreateConfirm = (confirmData) =>
  http.post(PRE_CREATE_SAVE_API(), { confirms: confirmData });

// 保存设置的数据
export const saveDoubleConfirm = (confirmData) =>
  http.post(`${api2Host}/user/private/v3/double-confirm-save`, {
    confirms: confirmData
  });

// export const getProfile = () => http.get(`${api2Host}/v2/private/user/profile`);

export const logout = () => http.post(`${api2Host}/logout`);

// 聚合持仓仓位数据,部分止盈止损数据不需要根据symbol重新请求
export const getUserPrivatePoz = (symbol, globalDispatch) => {
  Promise.allSettled([
    getPositionList()
    // getInversePositionList()
  ]).then(
    ([
      { status: linearStatus, value: data, reason }
      // { status: reverseStatus, value: reverseData, reason: reverseReason },
    ]) => {
      if (linearStatus === 'rejected') {
        globalDispatch({
          type: types.NETWORK_SHIFT,
          show: true,
          // 被reject的情况有多种
          e: reason
        });
      }
      // if (reverseStatus === 'rejected') {
      //   globalDispatch({
      //     type: types.NETWORK_SHIFT,
      //     show: true,
      //     e: reverseReason,
      //   });
      // }
      globalDispatch({
        type: types.SET_POSITION_LIST,
        list: linearStatus === 'fulfilled' ? data?.list : [],
        // reverseList: reverseStatus === 'fulfilled' ? reverseData?.list : [],
        symbol
      });
    }
  );
  Promise.allSettled([getTpslAllList()])
    .then(
      ([
        { value: tpsls }
        // { value: reverseTpsl }
      ]) => {
        globalDispatch({
          type: types.SET_POSITION_TP_SL_LIST,
          list: tpsls?.tpsl ?? []
          // reverseTpsl: reverseTpsl?.tpsl ?? [],
        });
      }
    )
    .catch();
};

export const getUserPrivateDetail = (symbol, globalDispatch) => {
  getOrderList({
    symbol,
    orderListType: 'activity,history,normal-conditions',
    filter: 'all'
  })
    .then(({ activity, normalConditions, history }) => {
      globalDispatch({
        type: types.SET_POSITION_ORDER_LIST,
        list: activity?.data ?? [],
        insertType: 'activity',
        symbol
      });
      globalDispatch({
        type: types.SET_POSITION_ORDER_LIST,
        list: normalConditions?.data ?? [],
        insertType: 'conditions',
        symbol
      });
      globalDispatch({
        type: types.SET_POSITION_ORDER_LIST,
        list: history?.data ?? [],
        insertType: 'history',
        symbol
      });
    })
    .catch((e) => {
      globalDispatch({
        type: types.NETWORK_SHIFT,
        show: true,
        e
      });
    });
  const formatExecTypes = Object.keys(execTypeKeyMap).join(',');
  getTradeList({ symbol, execTypes: formatExecTypes }).then((res) => {
    globalDispatch({
      type: types.INSERT_MY_DEAL_LIST,
      list: res?.data,
      option: 'insert',
      symbol
    });
  });

  getClosedPnlList({ symbol }).then((res) => {
    globalDispatch({ type: types.SET_PROFITLIST, list: res?.data, symbol });
  });
};

// 用户个人属性获取, 注意: 该接口需要登录态
export const toGetUserPreferences = (params) =>
  http.post(`${api2Host}/user/private/v3/preference/get`, {
    preference_keys: params
  });

// export const getUserPreferences = (params, globalDispatch) => {
//   toGetUserPreferences(params).then((payload) => {
//     const preferences = payload?.preferences || {};
//     // 默认该接口返回空对象.
//     const data = preferences?.bookSymbolSequence || '';
//     globalDispatch({ type: types.SET_BOOK_SYMBOL_LIST, data });
//   });
// };

// 用户个人属性更新, 注意: 该接口需要登录态
export const toUpdateUserPreferences = (params) =>
  http.post(`${api2Host}/user/private/v3/preference/set`, {
    upsert_keys: { bookSymbolSequence: params }
  });

export const updateUserPreferences = debounce((params, globalDispatch) => {
  toUpdateUserPreferences(params)
    .then(() => {})
    .catch(() => {
      let resetedData = '';
      if (params) {
        const resetedDataArr = params.split(',');
        resetedDataArr.pop();
        if (resetedDataArr.length) {
          resetedData = resetedDataArr.join(',');
        }
      }
      globalDispatch({ type: types.SET_BOOK_SYMBOL_LIST, data: resetedData });
    });
}, 1000);

export const updateUserPreferenceSetting = debounce(
  (params) =>
    http.post(`${api2Host}/user/private/v3/preference/set`, {
      upsert_keys: params
    }),
  1000
);

// 获取ws token 的获取地址
export const getWsToken = () =>
  http.get(`${api2Host}/user/private/v3/websocket/token`);

export const getWsPath = () =>
  http.get(`${api2Host}/trade/private/v3/member/user-info`);


