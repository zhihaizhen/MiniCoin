import { Env } from '@region-lib/env';
import { fetch, requestWithI18n } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

const URL = {
  getCampaignList: `${API_HOST}/rewards/public/v1/challenge/campaign/get-campaign-list`, // 获取活动列表
  campainDetalsPublic: `${API_HOST}/rewards/public/v1/challenge/campaign/get-campaign-detail`, // 获取活动的基本信息（非登陆态）
  userRegister: `${API_HOST}/rewards/private/v1/challenge/campaign/user-register`, // 用户报名
  campainDetalsPrivate: `${API_HOST}/rewards/private/v1/challenge/campaign/get-campaign-detail`, // 用户活动信息（登陆态）
  receiveAward: `${API_HOST}/rewards/private/v1/challenge/task/receive-award`, // 领取奖励
  receivePhysicalAward: `${API_HOST}/rewards/private/v1/challenge/task/receive-physical-award`, // 领取实物奖励
  receiveAwardRecord: `${API_HOST}/rewards/private/v1/challenge/task/receive-award-record`, // 领取奖励记录
  affiliateLineVerify: `${API_HOST}/rewards/private/v1/challenge/affiliate/affiliate-line-verify`, // 获取用户已抽中奖励的奖品信息
  getReferralInfo: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default` // 邀请信息
};

export const getCampaignDetailsPublic = (params) => {
  return fetch({
    url: URL.campainDetalsPublic,
    method: 'GET',
    params
  });
};

export const userRegister = (params) => {
  return fetch({
    url: URL.userRegister,
    method: 'GET',
    params,
    showErrorMessage: false,
    noErrorMsgCodes: [35600004, 35600005, 35620006, 35620005]
  });
};

export const getCampaignDetailsPrivate = (params) => {
  return fetch({
    url: URL.campainDetalsPrivate,
    method: 'GET',
    params
  });
};

export const receiveAward = (params) => {
  return requestWithI18n.fetch({
    url: URL.receiveAward,
    method: 'GET',
    params
  });
};

export const receivePhysicalAward = (data) => {
  return fetch({
    url: URL.receivePhysicalAward,
    method: 'POST',
    data
  });
};

export const receiveAwardRecord = (params) => {
  return fetch({
    url: URL.receiveAwardRecord,
    method: 'GET',
    params
  });
};

export const affiliateLineVerify = () => {
  return fetch({
    url: URL.affiliateLineVerify,
    method: 'GET'
  });
};

/**
 * 获取活动列表（客户端运行时使用）
 */
export const getCampaignList = () => {
  return fetch({
    url: URL.getCampaignList,
    method: 'GET'
  });
};

export const getReferralInfo = () => {
  return fetch({
    url: URL.getReferralInfo,
    method: 'GET'
  });
};

/**
 * 获取活动列表（服务端构建时使用）
 * 使用原生 axios，避免浏览器环境依赖
 */
export const getCampaignListForBuild = async () => {
  const axios = require('axios');
  const apiHost =
    typeof window === 'undefined'
      ? (() => {
          const env = process.env.ENVIRONMENT || 'test';
          const hosts: Record<string, string> = {
            production: 'https://www.easicoin.xyz',
            testnet: 'https://www.test.bitrunfinance.com',
            test: 'https://www.test.bitrunfinance.com',
            dev: 'https://www.test.bitrunfinance.com',
            local: 'https://www.test.bitrunfinance.com'
          };
          return hosts[env] || hosts.test;
        })()
      : API_HOST;

  const apiUrl = `${apiHost}/mapi/rewards/public/v1/challenge/campaign/get-campaign-list`;

  try {
    const { data = {} } = await axios.get(apiUrl);
    return data?.data || [];
  } catch (error) {
    console.error('[getCampaignListForBuild] 请求失败:', error);
    throw error;
  }
};
