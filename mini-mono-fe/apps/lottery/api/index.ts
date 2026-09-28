import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

/**
 * 查询活动基本信息
 */
export const getPublicCampaignDetails = () => {
  return fetch({
    url: `${API_HOST}/lottery/public/v1/campaign/get-campaign-detail`,
    method: 'GET',
    showErrorMessage: true
  });
};

/**
 * 查询大宗活动基本信息
 */
export const getPublicBigCampaignDetails = () => {
  return fetch({
    url: `${API_HOST}/lottery/public/v1/campaign/get-block-trade-campaign-detail`,
    method: 'GET',
    showErrorMessage: true
  });
};



/**
 * 用户报名接口
 * @param params
 */
export const registerCampaign = (params) => {
  return fetch({
    url: `${API_HOST}/lottery/private/v1/campaign/user-register`,
    method: 'POST',
    data: params,
    showErrorMessage: false
  });
};

/**
 * 用户报名信息接口
 * @param params
 */
export const getRegisterCampaign = (params) => {
  return fetch({
    url: `${API_HOST}/lottery/private/v1/campaign/get-user-register`,
    method: 'POST',
    data: params,
    showErrorMessage: false
  });
};



/**
 * 用户抽奖次数及待抽奖信息订单
 */
export const getUserPositionRecord = (params) => {
  return fetch({
    url: `${API_HOST}/lottery/private/v1/position/user-position-record`,
    method: 'GET',
    params,
    showErrorMessage: true
  });
};

/**
 * 抽奖接口
 */
export const getLuckyDraw = (params) => {
  return fetch({
    url: `${API_HOST}/lottery/private/v1/position/lucky-draw`,
    method: 'GET',
    params,
    showErrorMessage: false
  });
};

/**
 * 用户抽奖记录接口
 */
export const getUserLotterRecord = (params) => {
  return fetch({
    url: `${API_HOST}/lottery/private/v1/position/user-lottery-record`,
    method: 'GET',
    params,
    showErrorMessage: true
  });
};

/**
 * 最近获奖信息接口, 获取最近十条获奖用户的信息
 */
export const getRecentPrizeRecord = (params) => {
  return fetch({
    url: `${API_HOST}/lottery/public/v1/campaign/recent-prize-record`,
    method: 'GET',
    params,
    showErrorMessage: true
  });
};

/**
 *
 */
export const getUserInviteInfo = () => {
  return fetch({
    url: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
    method: 'GET',
    showErrorMessage: true
  });
};

/**
 * 查询活动基本信息- 红包雨
 */
export const getBonusPublicCampaignDetails = () => {
  return fetch({
    url: `${API_HOST}/lottery/public/v1/bonus/campaign/get-campaign-detail`,
    method: 'GET',
    showErrorMessage: true
  });
};

/**
 * 查询活动基本信息- 红包雨-登录
 */
export const getBonusPrivateCampaignDetails = (params: {campaign_no:string}) => {
  return fetch({
    url: `${API_HOST}/lottery/private/v1/bonus/campaign/get-campaign-detail`,
    method: 'GET',
    params,
    showErrorMessage: true
  });
};

/**
 * 领取奖励- 红包雨
 */
export const getBonusDraw = (params: {campaign_no:string, version?:string}) => {
  return fetch({
    url: `${API_HOST}/lottery/private/v1/bonus/draw/lottery-draw`,
    method: 'GET',
    params,
    showErrorMessage: false
  });
};

/**
 * 用户红包雨活动获奖记录-红包雨
 */
export const getBonusLotteryRecord = (params) => {
  return fetch({
    url: `${API_HOST}/lottery/private/v1/position/user-lottery-record`,
    method: 'GET',
    params,
    showErrorMessage: true
  });
};

/**
 * 获取最近十条获奖用户的信息-红包雨
 */
export const getBonusRecentRecord = (params) => {
  return fetch({
    url: `${API_HOST}/lottery/public/v1/bonus/campaign/recent-prize-record`,
    method: 'GET',
    params,
    showErrorMessage: true
  });
};

/**
 * 获取活动规则
 */
export const getCampaignDesc = (params) => {
  return fetch({
    url: `${API_HOST}/rewards/public/v1/campaign/get-campaign-multilang-list`,
    method: 'GET',
    params,
    showErrorMessage: true
  });
};



