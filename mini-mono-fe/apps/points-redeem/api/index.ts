import { Env } from '@region-lib/env';
import { fetch, request } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

/**
 * 7.1 公共活动信息（非登陆态）
 */
export const getPublicCampaignDetail = () => {
  return request({
    url: `${API_HOST}/rewards/public/v1/points/campaign/get-campaign-detail`,
    method: 'get'
  });
};

/**
 * 7.2 奖品信息（非登陆态）
 */
export const getPublicAwardList = (params) => {
  return request({
    url: `${API_HOST}/rewards/public/v1/points/campaign/get-award-list`,
    method: 'get',
    params
  });
};
/**
 * 7.3 最近获奖信息（非登陆态）
 */
export const getPublicRecentPrize = () => {
  return request({
    url: `${API_HOST}/rewards/public/v1/points/campaign/recent-prize-record`,
    method: 'get'
  });
};

/**
 * 7.4 用户报名接口（登陆态）
 */
export const getUserRegister = (params) => {
  return request({
    url: `${API_HOST}/rewards/private/v1/points/campaign/user-register`,
    method: 'get',
    params,
    showErrorMessage: false
  });
};

/**
 * 用户活动任务信息（登陆态）
 */
export const getPrivateCampaignDetail = () => {
  return request({
    url: `${API_HOST}/rewards/private/v1/points/campaign/get-campaign-detail`,
    method: 'get'
  });
};


/**
 * 7.6 用户奖品信息（登陆态）
 * @param params
 */
export const getPrivateAwardList = (params) => {
  return request({
    url: `${API_HOST}/rewards/private/v1/points/campaign/get-award-list`,
    method: 'get',
    params
  });
};


/**
 * 7.7 奖励兑换接口（登陆态）
 */
export const postExchangeRewards = (data) => {
  return request({
    url: `${API_HOST}/rewards/private/v1/points/task/exchange-rewards`,
    method: 'post',
    data,
    showErrorMessage: false
  });
};


/**
 * 7.8 用户兑奖记录（登陆态）
 * @param params
 */
export const getUserAwardRecords = (params) => {
  return request({
    url: `${API_HOST}/rewards/private/v1/points/task/user-award-record`,
    method: 'get',
    params
  });
};

export const getUserInviteInfo = () => {
  return fetch({
    url: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
    method: 'GET',
    showErrorMessage: true
  });
};

