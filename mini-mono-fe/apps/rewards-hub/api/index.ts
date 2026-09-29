import { Env } from '@region-lib/env';
import { createRequestInstance } from '@better-bit-fe/base-utils';

const { fetch } = createRequestInstance({
  showErrorMessage: true,
  noErrorMsgCodes: [20007009, 20007004, 20005001, 20000103, 20007010, 20005011, -999999],
  enableLangHeader: true,
  enableI18nError: true
});

const { API_HOST } = Env;

const URL = {
  publicActivities: `${API_HOST}/rewards/public/v1/campaign/get-campaign-list`,
  privateActivities: `${API_HOST}/rewards/private/v1/campaign/get-campaign-list`,
  userJoinActivities: `${API_HOST}/rewards/private/v1/campaign/get-user-join`,
  signUpActivities: `${API_HOST}/rewards/private/v1/campaign/user-register`,
  getPublicTaskList: `${API_HOST}/rewards/public/v1/campaign/get-campaign-detail`,
  getPrivateTaskList: `${API_HOST}/rewards/private/v1/task/list-by-campaign`,
  getTokensBalance: `${API_HOST}/rewards/private/v1/award/get-tokens-balance`, // 多选的
  getTokenBalance: `${API_HOST}/rewards/private/v1/award/get-token-balance`, // 单选的
  getBalanceRecords: `${API_HOST}/rewards/private/v1/award/get-token-balance-flow`,
  receivedReward: `${API_HOST}/rewards/private/v1/task/receive-award`,
  getReferralInfo: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
  claimCoupon: `${API_HOST}/rewards/private/v1/coupon/claim`,
  getCouponList: `${API_HOST}/rewards/private/v1/coupon/page`,
  getCouponStatusCount: `${API_HOST}/rewards/private/v1/coupon/status-count`

  // getTaskRecordDetail: `${API_HOST}/rewards/private/v1/task/get-task-record-detail`,
  // getTaskRecordDetail: `${API_HOST}/rewards/private/v1/task/get-task-record-detail`,
  // getTaskRecordDetail: `${API_HOST}/rewards/private/v1/task/get-task-record-detail`,
  // getTaskRecordDetail: `${API_HOST}/rewards/private/v1/task/get-task-record-detail`,
};

export const getPublicActivities = (params) => {
  return fetch({
    url: URL.publicActivities,
    method: 'GET',
    params
  });
};

export const getPrivateActivities = (params) => {
  return fetch({
    url: URL.privateActivities,
    method: 'GET',
    params
  });
};
export const getUserJoinActivities = (params = {}) => {
  return fetch({
    url: URL.userJoinActivities,
    method: 'GET',
    params
  });
};

// 活动报名
export const signUpActivities = (data = {}) => {
  return fetch({
    url: URL.signUpActivities,
    method: 'POST',
    data
  });
};

export const getPrivateTaskList = (params) => {
  return fetch({
    url: URL.getPrivateTaskList,
    method: 'GET',
    params
  });
};

export const getPublicTaskList = (params) => {
  return fetch({
    url: URL.getPublicTaskList,
    method: 'GET',
    params
  });
};

export const getTokensBalance = (params = {}) => {
  return fetch({
    url: URL.getTokensBalance,
    method: 'GET',
    params
  });
};

export const getTokenBalance = (params = { award_token: 'FreeU' }) => {
  return fetch({
    url: URL.getTokenBalance,
    method: 'GET',
    params
  });
};

export const getBalanceRecords = (params) => {
  return fetch({
    url: URL.getBalanceRecords,
    method: 'GET',
    params
  });
};

export const receivedReward = (taskId) => {
  return fetch({
    url: URL.receivedReward + `?task_id=${taskId}`,
    method: 'GET'
  });
};

export const getReferralInfo = () => {
  return fetch({
    url: URL.getReferralInfo,
    method: 'GET'
  });
};

export const claimCoupon = (data: { coupon_id: string }) => {
  return fetch({
    url: URL.claimCoupon,
    method: 'POST',
    data
  });
};

export const getCouponList = (params: {
  page_num: number;
  page_size: number;
  coupon_status: string;
  product_type?: string;
}) => {
  return fetch({
    url: URL.getCouponList,
    method: 'GET',
    params
  });
};

export const getCouponStatusCount = (): Promise<{
  init_count: number;
  activated_count: number;
  expired_count: number;
}> => {
  return fetch({
    url: URL.getCouponStatusCount,
    method: 'GET'
  });
};
