import { Env } from '@region-lib/env';
import { fetch, isMobile } from '@better-bit-fe/base-utils';
import { list } from 'postcss';

const { API_HOST } = Env;

export const URL = {
  dynamicSymbol: `${API_HOST}/trade/public/v1/market/dynamic_symbol`,
  dashboardData: `${API_HOST}/dashboard/get-data`,
  signupEmail: `${API_HOST}/index/public/v1/waitlist/user/save`,
  referInfo: `${API_HOST}/api/affiliate_api/public/getNameByCode`,
  poolList: `${API_HOST}/trade/public/v1/market/risk-pool-list`,
  trendKline: `${API_HOST}/trade/public/v1/market/kline-list`,
  appStatus: '/static/app/files/configs/lazy_update.json',
  currentCountryCode: `${API_HOST}/user/public/v3/country-code`,
  profileUpdate: `${API_HOST}/user/private/v3/profile-update`,
  spotList: `${API_HOST}/spot-openapi/public/v1/market/summary-new`,
  auditDatesList: `${API_HOST}/commom-public/reserve/public/v1/audit-dates/list`,
  reserveData: `${API_HOST}/commom-public/reserve/public/v1/ratios`,
  dynamicImg: `${API_HOST}/commom-public/index/public/v2/rotate-pic/list`,
  logout: `${API_HOST}/user/private/v3/logout-web2`, // logout
  copyTradingDealers: `${API_HOST}/copy-trading-service/public/v1/dealer/show-dealer-list`, // 获取带单员
  notificationList: `${API_HOST}/commom-public/index/public/v1/announcement/list`, // 获取公告

  publicOpenAdList: `${API_HOST}/commom-public/index/public/v2/open-ad/list`,
  privateOpenAdList: `${API_HOST}/commom-public/index/private/v2/open-ad/list`,
  getReferralInfo: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
  wealthTracking: `${API_HOST}/app-devops/public/v1/track/upload`,
  getSocialMediaList: `${API_HOST}/commom-public/index/public/v2/mult-social-media/list`, // 获取社媒信息
  getCampaignMultilangList: `${API_HOST}/rewards/public/v1/campaign/get-campaign-multilang-list`
};

export const manualLogout = () => {
  return fetch({
    url: URL.logout,
    method: 'POST',
    data: {
      platform: isMobile() ? 'h5' : 'pcweb'
    }
  });
};

export const postDynamicImg = (params: { language?: string }) => {
  return fetch({
    url: URL.dynamicImg,
    method: 'GET',
    params
  });
};

export const getSpotList = () => {
  return fetch({
    url: URL.spotList,
    method: 'GET'
  });
};

export const getTrendKline = (params) => {
  return fetch({
    url: URL.trendKline,
    method: 'GET',
    params
  });
};

export const getDynamicSymbol = () => {
  return fetch({
    url: URL.dynamicSymbol,
    method: 'GET'
  });
};

export const getDashboardData = () => {
  return fetch({
    url: URL.dashboardData,
    method: 'GET'
  });
};

export const postSignUp = (data) => {
  return fetch({
    url: URL.signupEmail,
    method: 'POST',
    data
  });
};

export const getReferInfo = (inviteCode: string) => {
  return fetch({
    url: URL.referInfo,
    method: 'GET',
    params: { invite_code: inviteCode }
  });
};

export const getPoolList = () => {
  return fetch({
    url: URL.poolList,
    method: 'GET',
    params: { symbol: 'BTCUSDT' }
  });
};

export const getCurrentCountryCode = (params?) => {
  return fetch({
    url: URL.currentCountryCode,
    method: 'GET',
    params
  });
};

export const postProfileLanguageUpdate = (data: { language?: string }) => {
  return fetch({
    url: URL.profileUpdate,
    method: 'POST',
    data
  });
};

export const getAuditDatesList = () => {
  return fetch({
    url: URL.auditDatesList,
    method: 'GET'
  });
};

export const getReserveData = (auditDate: string) => {
  return fetch({
    url: URL.reserveData,
    method: 'GET',
    params: { auditDate }
  });
};

export const getPublicOpenAdList = (headerParams) => {
  return fetch({
    url: URL.publicOpenAdList,
    method: 'GET',
    headers: headerParams
  });
};

export const getPrivateOpenAdList = (headerParams) => {
  return fetch({
    url: URL.privateOpenAdList,
    method: 'GET',
    headers: headerParams
  });
};

export const getPublicCampaignDetails = () => {
  return fetch({
    url: `${API_HOST}/lottery/public/v1/campaign/get-campaign-detail`,
    method: 'GET',
    showErrorMessage: true
  });
};

export const getCopyTradingDealers = (
  order_type = 'pnl_percent_last_30day',
  page_num = 1,
  page_size = 3
) => {
  return fetch({
    url: URL.copyTradingDealers,
    method: 'GET',
    params: { order_type, page_num, page_size }
  });
};

export const postNotificationList = (data) => {
  return fetch({
    url: URL.notificationList,
    method: 'POST',
    data
  });
};

export const getReferralInfo = () => {
  return fetch({
    url: URL.getReferralInfo,
    method: 'GET'
  });
};

export const getSocialMediaList = () => {
  return fetch({
    url: URL.getSocialMediaList,
    method: 'GET'
  });
};

export const postWealthTracking = (data) => {
  return fetch({
    url: URL.wealthTracking,
    method: 'POST',
    showErrorMessage: false,
    data
  });
};
export const getCampaignMultilangList = (params) => {
  return fetch({
    url: URL.getCampaignMultilangList,
    method: 'GET',
    params
  });
};

