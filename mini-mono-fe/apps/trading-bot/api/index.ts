import { Env } from '@region-lib/env';
import { fetch, requestWithI18n } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

/**
 * 获取公告
 * @param data
 */
export const postNotificationList = (data) => {
  return fetch({
    url: `${API_HOST}/commom-public/index/public/v1/announcement/list`,
    method: 'POST',
    data
  });
};

export const getReferralInfo = () => {
  return fetch({
    url: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
    method: 'GET'
  });
};

// 创建现货网格并开启
export const addSpotGrid = (data) => {
  return requestWithI18n.fetch({
    url: `${API_HOST}/strategy-bot/private/strategy/add-spot-grid`,
    method: 'POST',
    data
  });
};

// 停止策略
export const stopStrategy = (data) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/strategy/stop`,
    method: 'POST',
    data
  });
};

//当前用户总览
export const getUserTotalInfo = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/strategy/total`,
    method: 'GET',
    params
  });
};

// 当前用户的策略列表
export const getUserStrategyList = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/strategy/list`,
    method: 'GET',
    params
  });
};

// 查询策略当前挂单
export const getUserStrategyOrder = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/order/open-orders`,
    method: 'GET',
    params
  });
};

// 查询策略成交记录
export const getUserStrategyTrade = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/order/user-trades`,
    method: 'GET',
    params
  });
};

// 策略大厅
export const getStrategyList = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/public/strategy/recommend-list`,
    method: 'GET',
    params
  });
};

// 查询策略大厅的指定策略详情
export const getStrategyInfoDetail = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/public/strategy/recommend-info`,
    method: 'GET',
    params
  });
};

// 策略交易配置
export const getStrategyTradeConfig = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/public/strategy/config`,
    method: 'GET',
    params
  });
};

// AI推荐参数
export const getStrategyAiConfig = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/public/strategy/ai-recommend`,
    method: 'GET',
    params
  });
};

// 查询策略详情
export const getStrategyInfoById = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/strategy/info`,
    method: 'GET',
    params
  });
};

// 查询历史日收益明细--图表数据
export const getStrategyProfitChart = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/strategy/profit`,
    method: 'GET',
    params
  });
};

// 查询现货余额
export const getAsset = (params) => {
  return fetch({
    url: `${API_HOST}/spot/private/v1/asset/get`,
    method: 'GET',
    params
  });
};

// 预创建现货网格接口
export const preAddSpotGrid = (data) => {
  return requestWithI18n.fetch({
    url: `${API_HOST}/strategy-bot/private/strategy/pre-add-spot-grid`,
    method: 'POST',
    data
  });
};

// 查询币对信息
export const getQuoteTokens = (params) => {
  return fetch({
    url: `${API_HOST}/spot/public/v1/config/quote_tokens`,
    method: 'GET',
    params
  });
};

// ==================== 现货定投 DCA ====================

// 获取定投基础配置
export const getDcaConfig = () => {
  return fetch({
    url: `${API_HOST}/strategy-bot/public/dca/config`,
    method: 'GET'
  });
};

// 查询系统推荐定投策略列表
export const getDcaRecommendList = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/public/dca/strategies/recommend`,
    method: 'GET',
    params
  });
};

// 查询公开系统定投策略详情
export const getDcaStrategyInfo = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/public/dca/strategies/info`,
    method: 'GET',
    params
  });
};

// 创建用户自定义定投策略（含复制模式，复制时需额外传 strategy_id）
export const createDcaStrategy = (data) => {
  return requestWithI18n.fetch({
    url: `${API_HOST}/strategy-bot/private/dca/strategies/create`,
    method: 'POST',
    data
  });
};

// 查询当前用户的定投策略列表
export const getDcaUserStrategies = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies`,
    method: 'GET',
    params
  });
};

// 查询当前用户的定投策略详情
export const getDcaUserStrategyInfo = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/info`,
    method: 'GET',
    params
  });
};

// 终止定投策略
export const terminateDcaStrategy = (data) => {
  return requestWithI18n.fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/terminate`,
    method: 'POST',
    data
  });
};

// 暂停定投策略
export const pauseDcaStrategy = (data) => {
  return requestWithI18n.fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/pause`,
    method: 'POST',
    data
  });
};

// 恢复定投策略
export const resumeDcaStrategy = (data) => {
  return requestWithI18n.fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/resume`,
    method: 'POST',
    data
  });
};

// 查询定投策略资产（当前持仓）
export const getDcaUserStrategyAssets = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/assets`,
    method: 'GET',
    params
  });
};

// 查询定投策略执行计划（成交记录）
export const getDcaUserStrategyPlans = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/plans`,
    method: 'GET',
    params
  });
};

// 查询定投策略成交明细
export const getDcaUserStrategyTrades = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/trades`,
    method: 'GET',
    params
  });
};

// 修改定投策略名称
export const updateDcaStrategyName = (data: { strategy_id: number | string; strategy_name: string }) => {
  return requestWithI18n.fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/update-name`,
    method: 'POST',
    data
  });
};

// 查询定投策略统计信息
export const getDcaUserStrategyStats = (params) => {
  return fetch({
    url: `${API_HOST}/strategy-bot/private/dca/user/strategies/stats`,
    method: 'GET',
    params
  });
};
