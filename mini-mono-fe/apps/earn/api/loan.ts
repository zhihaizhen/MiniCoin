import { Env } from '@region-lib/env';
import { fetch, request } from '@better-bit-fe/base-utils';
import { LoanBorrowParams } from '~/interface';

const { API_HOST } = Env;

// ==========================================
// 一、 公共与配置接口 (Public)
// ==========================================

/**
 * 获取借贷币种配置
 * @param params {coin: 'usdt'} 借贷币种，例如 'usdt'
 */
export const getLoanCurrency = (params) => {
  return request({
    url: `${API_HOST}/defi/public/v1/loan/currency/loan`,
    params,
    method: 'get'
  });
};

/**
 * 获取质押币种配置
  * @param params {coin: 'usdt'} 借贷币种，例如 'usdt'
 */
export const getPledgeCurrency = (params) => {
  return request({
    url: `${API_HOST}/defi/public/v1/loan/currency/pledge`,
    params,
    method: 'get'
  });
};


// ==========================================
// 二、 核心交易接口 (Private)
// ==========================================


/**
 * 申请借款 (创建订单)
 * @param data
 */
export const postLoanBorrow = (data: LoanBorrowParams) => {
  return fetch({
    url: `${API_HOST}/defi/private/v1/loan/borrow`,
    method: 'post',
    data
  });
};

/**
 * 开启或关闭自动补仓接口参数
 */
export interface AutomaticReplenishmentParams {
  duration_type: 'liquid' | 'fixed'; // 产品类型: liquid 活期, fixed 定期
  position_id: number;               // 仓位id
  automatic_replenishment: 1 | 0; // 开启或关闭状态
}

/**
 * 开启或关闭自动补仓
 * @param data
 */
export const postAutomaticReplenishment = (data: AutomaticReplenishmentParams) => {
  return fetch({
    url: `${API_HOST}/defi/private/v1/loan/automatic-replenishment`,
    method: 'post',
    data
  });
};

/**
 * 归还借款接口参数
 */
export interface RepayParams {
  duration_type: 'liquid' | 'fixed'; // 期限类型
  position_id: string | number;      // 仓位ID
  repay_amount: string;              // 还款金额
}

/**
 * 归还借款 (还款)
 * @param data
 */
export const postLoanRepay = (data: RepayParams) => {
  return fetch({
    url: `${API_HOST}/defi/private/v1/loan/repay`,
    method: 'post',
    data
  });
};

/**
 * 调整质押率
 * @param data
 */
export const postChangeCollateral = (data) => {
  return fetch({
    url: `${API_HOST}/defi/private/v1/loan/ltv-amend`,
    method: 'post',
    data
  });
};


// ==========================================
// 三、 仓位与资产查询接口 (Private)
// ==========================================

/**
 * 查询特定仓位详情
 * @param id 仓位ID
 */
export const getLoanPositionDetail = (id: string | number) => {
  return request({
    url: `${API_HOST}/defi/private/v1/loan/position?id=${id}`,
    method: 'get'
  });
};

/**
 * 获取进行中的订单列表 (支持按活期/定期筛选)
 * @param params
 */
export const getActiveOrders = (params) => {
  return request({
    url: `${API_HOST}/defi/private/v1/loan/order/active`,
    method: 'get',
    params
  });
};

/**
 * 获取理财/借贷资产总览
 */
export const getLoanAssetOverview = () => {
  return request({
    url: `${API_HOST}/defi/private/v1/loan/asset`,
    method: 'get'
  });
};


// ==========================================
// 四、 历史流水接口 (Private)
// ==========================================

/**
 * 获取还款历史流水
 */
export const getRepayHistory = () => {
  return request({
    url: `${API_HOST}/defi/private/v1/loan/order/history/repay`,
    method: 'get'
  });
};

/**
 * 获取借款历史流水
 */
export const getBorrowHistory = () => {
  return request({
    url: `${API_HOST}/defi/private/v1/loan/order/history/borrow`,
    method: 'get'
  });
};

/**
 * 获取强平历史记录 (风控触发)
 */
export const getForceLiquidationHistory = () => {
  return request({
    url: `${API_HOST}/defi/private/v1/loan/order/history/force`,
    method: 'get'
  });
};

/**
 * 获取质押率调整历史 (手动/自动补仓与提取记录)
 */
export const getAdjustPledgeHistory = () => {
  return request({
    url: `${API_HOST}/defi/private/v1/loan/history/adjust-pledge`,
    method: 'get'
  });
};
