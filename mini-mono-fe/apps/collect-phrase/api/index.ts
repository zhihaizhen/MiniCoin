import { Env } from '@region-lib/env';
import { fetch, request } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

/**
 * 7.1 公共活动信息（非登陆态）
 */
export const getPublicCampaignDetail = () => {
  return request({
    url: `${API_HOST}/rewards/public/v1/collect/campaign/get-campaign-detail`,
    method: 'get'
  });
};

/**
 * 用户活动任务信息（登陆态）
 */
export const getPrivateCampaignDetail = () => {
  return request({
    url: `${API_HOST}/rewards/private/v1/collect/campaign/get-campaign-detail`,
    method: 'get'
  });
};

/**
 * 用户字卡信息
 */
export const getUserCollection = () => {
  return request({
    url: `${API_HOST}/rewards/private/v1/collect/campaign/get-user-collection`,
    method: 'get'
  });
};

/**
 * 字卡合成奖励
 */
export const postExchangeRewards = () => {
  return request({
    url: `${API_HOST}/rewards/private/v1/collect/task/exchange-rewards`,
    method: 'post',
    showErrorMessage: false
  });
};


/**
 * 字卡分享
 */
export const postQrcodeRewards = (data) => {
  return request({
    url: `${API_HOST}/rewards/private/v1/collect/qrcode/generate`,
    method: 'post',
    data,
    showErrorMessage: false
  });
};


/**
 * 用户兑奖记录（登陆态）
 * @param params
 */
export const getUserAwardRecords = (params) => {
  return request({
    url: `${API_HOST}/rewards/private/v1/collect/task/user-award-record`,
    method: 'get',
    params
  });
};


/**
 * 全套字卡领取
 */
export const postClaimTaskCharReward = (data) => {
  return request({
    url: `${API_HOST}/rewards/private/v1/collect/task/claim-task-char-reward`,
    method: 'post',
    data,
    showErrorMessage: false
  });
};

export const getUserInviteInfo = () => {
  return fetch({
    url: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
    method: 'GET',
    showErrorMessage: true
  });
};

//
// /**
//  * 7.2 奖品信息（非登陆态）
//  */
// export const getPublicAwardList = (params) => {
//   return request({
//     url: `${API_HOST}/rewards/public/v1/points/campaign/get-award-list`,
//     method: 'get',
//     params
//   });
// };
// /**
//  * 7.3 最近获奖信息（非登陆态）
//  */
// export const getPublicRecentPrize = () => {
//   return request({
//     url: `${API_HOST}/rewards/public/v1/points/campaign/recent-prize-record`,
//     method: 'get'
//   });
// };
//
// /**
//  * 7.4 用户报名接口（登陆态）
//  */
// export const getUserRegister = (params) => {
//   return request({
//     url: `${API_HOST}/rewards/private/v1/points/campaign/user-register`,
//     method: 'get',
//     params,
//     showErrorMessage: false
//   });
// };
//
//
//
//
// /**
//  * 7.6 用户奖品信息（登陆态）
//  * @param params
//  */
// export const getPrivateAwardList = (params) => {
//   return request({
//     url: `${API_HOST}/rewards/private/v1/points/campaign/get-award-list`,
//     method: 'get',
//     params
//   });
// };
//
//
//
//
// export const getUserInviteInfo = () => {
//   return fetch({
//     url: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
//     method: 'GET',
//     showErrorMessage: true
//   });
// };

