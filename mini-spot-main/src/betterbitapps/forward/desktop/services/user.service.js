import { isMobile } from 'common/utils/utils';
import {
  getCurrentEntrust,
  getHistoryEntrust,
  getPositionTradeDetail,
  getCurrentPlanEntrust,
  getHistoryPlanEntrust,
} from '@/services/position.service';
import http from 'common/utils/http';
import debounce from 'lodash.debounce';
import { Env } from '@region-lib/env';
import { api2Host } from 'common/utils/routerSwitchEvent';
import { types } from '@/store';
import { PLAN_TYPE } from '@/containers/position/constant';

/**
 * 将 plan_order 合集列表按 plan_type 拆成计划委托 / 止盈止损两桶。
 * NORMAL → 计划委托；PROFIT_OR_STOP → 止盈止损；其余取值忽略。
 */
function splitPlanOrdersByType(list = []) {
  const planList = [];
  const tpslList = [];
  const items = Array.isArray(list) ? list : [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item?.plan_type === PLAN_TYPE.PROFIT_OR_STOP) {
      tpslList.push(item);
    } else if (item?.plan_type === PLAN_TYPE.NORMAL) {
      planList.push(item);
    }
  }
  return { planList, tpslList };
}

// 获取个人用户基本信息
const normalizeIntegerFieldToString = (text, field) =>
  // 匹配 JSON 中指定字段的 16 位及以上整数（支持负数），并转成字符串，避免 JS 数字精度丢失：
  // - $1: ("${field}"\s*:\s*)，即“字段名 + 冒号 + 可能存在的空白”，例如 `"defaultAccountId":`
  // - $2: (-?\d{16,})，即字段值里的长整数字面量，例如 `12345678901234567` 或 `-12345678901234567`
  // - 示例：`{"defaultAccountId":12345678901234567}` => `{"defaultAccountId":"12345678901234567"}`
  text.replace(new RegExp(`("${field}"\\s*:\\s*)(-?\\d{16,})`, 'g'), '$1"$2"');

const getExtraHeadersFromUrl = () => {
  const headers = {};
  const currentHref = window.location.href;

  if (currentHref.includes('user_id_type=')) {
    const [, userIdType] = currentHref.split('user_id_type=');
    headers.user_id_type = userIdType;
  }
  if (currentHref.includes('user_id=')) {
    const [, randomUserId] = currentHref.split('user_id=');
    headers.random_user_id = randomUserId;
  }

  return headers;
};

// 获取用户基本信息
// 因为defaultAccountId超过了Number.MAX_SAFE_INTEGER所以在response获取的时候需要转化
export const getUserBaseInfo = async () => {
  const response = await fetch(
    `${api2Host}/spot/private/v1/user/get_base_info`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        platform: 'pcweb',
        ...getExtraHeadersFromUrl(),
      },
    },
  );
  const responseText = await response.text();
  const normalizedText = normalizeIntegerFieldToString(
    responseText,
    'defaultAccountId',
  );
  const payload = JSON.parse(normalizedText);
  const code = payload.code != null ? payload.code : payload.retCode;

  if (code === 0 || code === 200) {
    return payload.data;
  }

  return Promise.reject(payload);
};


const PRE_CREATE_SAVE_API = () => `${api2Host}/user/private/v3/double-confirm-save`;

// 保存设置的数据
export const saveDoubleConfirm = (confirmData) =>
  http.post(PRE_CREATE_SAVE_API(), {
    confirms: confirmData,
  });

export const getDynamicSymbolData = () =>
  http.get(`${api2Host}/trade/public/v1/market/dynamic_symbol`);

// 板块分类
export const getTradeSectionCategory = () =>
  http.get(`${api2Host}/spot/public/v1/config/trade_section_category`);

export const logout = () => http.post(`${api2Host}/logout`);

// 获取持仓区的数据
export const getUserPrivateDetail = (symbol, globalDispatch, account_id) => {
  // 获取当前委托
  getCurrentEntrust({
    account_id,
  }).then((res) => {
    globalDispatch({
      type: types.SET_CURRENT_ENTRUST_LIST,
      data: res?.list,
      symbol,
    });
  });

  // 获取历史委托
  getHistoryEntrust({ account_id }).then((res) => {
    globalDispatch({
      type: types.SET_HISTORY_ENTRUST_LIST,
      data: res?.list,
      symbol,
    });
  });

  // 交易历史
  getPositionTradeDetail({
    account_id,
  }).then((res) => {
    globalDispatch({
      type: types.SET_MY_DEAL_LIST,
      list: res?.list,
      symbol,
    });
  });

  // ===== 计划委托家族（不传 plan_type，一次返回 NORMAL + PROFIT_OR_STOP） =====
  // 前端按返回项 plan_type 拆入「计划委托」「止盈止损」两桶
  getCurrentPlanEntrust()
    .then((res) => {
      const { planList, tpslList } = splitPlanOrdersByType(res?.list);
      globalDispatch({
        type: types.SET_CURRENT_PLAN_LIST,
        data: planList,
        symbol,
      });
      globalDispatch({
        type: types.SET_CURRENT_TPSL_LIST,
        data: tpslList,
        symbol,
      });
    })
    .catch(() => {});
  getHistoryPlanEntrust()
    .then((res) => {
      const { planList, tpslList } = splitPlanOrdersByType(res?.list);
      globalDispatch({
        type: types.SET_HISTORY_PLAN_LIST,
        data: planList,
        symbol,
      });
      globalDispatch({
        type: types.SET_HISTORY_TPSL_LIST,
        data: tpslList,
        symbol,
      });
    })
    .catch(() => {});
};

// 单独刷新「当前委托」（限价/市价，order 家族）：WS 对撤单的推送不总是可靠，
// 撤单成功后主动拉取一次以确保列表及时移除。编辑止盈止损已由 WS 的
// ws.spot.order 推送（带 profitPrice/stopPrice）原地更新，无需再调用本方法。
export const refreshCurrentEntrustList = (symbol, globalDispatch, account_id) =>
  getCurrentEntrust({ account_id }).then((res) => {
    globalDispatch({
      type: types.SET_CURRENT_ENTRUST_LIST,
      data: res?.list,
      symbol,
    });
  });

// 刷新「当前计划委托 + 止盈止损」两桶：不传 plan_type 拉合集后按 plan_type 分流。
// account_id 未使用，仅为与 refreshCurrentEntrustList 签名保持一致。
export const refreshCurrentPlanFamilyLists = (
  symbol,
  globalDispatch,
  // eslint-disable-next-line no-unused-vars
  account_id,
) =>
  getCurrentPlanEntrust().then((res) => {
    const { planList, tpslList } = splitPlanOrdersByType(res?.list);
    globalDispatch({
      type: types.SET_CURRENT_PLAN_LIST,
      data: planList,
      symbol,
    });
    globalDispatch({
      type: types.SET_CURRENT_TPSL_LIST,
      data: tpslList,
      symbol,
    });
  });

// 用户个人属性获取, 注意: 该接口需要登录态
export const toGetUserPreferences = (params) =>
  http.post(`${api2Host}/user/private/v3/preference/get`, {
    preference_keys: params,
  });

// 用户个人属性更新, 注意: 该接口需要登录态
export const toUpdateUserPreferences = (params) =>
  http.post(`${api2Host}/user/private/v3/preference/set`, {
    upsert_keys: { spotBookSymbolSequence: params },
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
      upsert_keys: params,
    }),
  1000,
);

// 获取ws token 的获取地址
export const getWsToken = () =>
  http.get(`${api2Host}/user/private/v3/websocket/token`);

export const getPrivateInfo = () =>
  http.get(`${api2Host}/trade/private/v1/member/user-info`);

export const getUserRate = () =>
  http.get(`${api2Host}/trade/public/v1/market/fee-rate`);

// 埋点用户下单行为信息
export const trackPush = (params) => {
  const basicParmas = {
    platform: isMobile() ? 'h5' : 'pcweb',
    business: 'contract',
    // user_id: userinfo?.userId, // 这里通过params传递
    user_agent: window?.navigator.userAgent, // user-agent, 对于app来说，设备ID
    ctime: new Date().getTime(),
  };
  const payload = {
    ...basicParmas,
    ...params,
  };
  return http.post(`${api2Host}/app-devops/public/v1/app/collect`, {
    ...payload,
  });
};
