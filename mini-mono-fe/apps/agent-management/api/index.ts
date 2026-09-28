import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';
import { setBodyToUrlParam } from '~/utils/url';
import { IUserProfile, IReferralLink } from '~/types';

const { API_HOST } = Env;

const HOST = API_HOST;

const URL = {
  userProfile: `${HOST}/user/private/v3/profile`, // 获取用户信息
  defaultReferralLink: `${HOST}/api/affiliate_app/private/invite-code/list`,
  commissionCard: `${HOST}/api/affiliate_app/private/index/commission`,
  commissionHistory: `${HOST}/api/affiliate_app/private/index/commission/history`,
  overviewCard: `${HOST}/api/affiliate_app/private/index/overview`,
  commissionWithdrawal: `${HOST}/api/affiliate_app/private/index/commission/withdrawal`,
  userOverview: `${HOST}/api/affiliate_app/private/user/overview`,
  userAsset: `${HOST}/api/affiliate_app/private/user/asset`,
  userPositions: `${HOST}/api/affiliate_app/private/user/positions`,
  userPnl: `${HOST}/api/affiliate_app/private/user/pnl`,
  updateRemark: `${HOST}/api/affiliate_app/private/user/update-remark`,
  netDeposit: `${HOST}/api/affiliate_app/private/net-deposit/days`
};

export const getNetDepositList = (params) => {
  return fetch({
    url: URL.netDeposit,
    method: 'GET',
    params
  });
};

export const getUserProfile = () => {
  return fetch<IUserProfile>({
    url: `${URL.userProfile}?t=${Date.now()}`,
    method: 'GET'
  });
};

export const getDefaultReferralLink = () => {
  return fetch({
    url: URL.defaultReferralLink,
    method: 'GET',
    params: {
      page_no: 1,
      page_size: 100
    }
  });
};

export const getCommissionCardDataSev = (circle_time) => {
  return fetch({
    url: URL.commissionCard,
    method: 'GET',
    params: {
      circle_time
    }
  });
};

export const getCommissionHistorySev = (params) => {
  return fetch({
    url: URL.commissionHistory,
    method: 'GET',
    params
  });
};

export const getOverviewCardDataSev = (circle_time) => {
  return fetch({
    url: URL.overviewCard,
    method: 'GET',
    params: {
      circle_time
    }
  });
};

export const commissionWithdrawalSev = () => {
  return fetch({
    url: URL.commissionWithdrawal,
    method: 'POST',
    data: {}
  });
};

export const getUserOverviewListSev = (params) => {
  return fetch({
    url: URL.userOverview,
    method: 'GET',
    params
  });
};

export const gitUserAssetListSev = (params) => {
  return fetch({
    url: URL.userAsset,
    method: 'GET',
    params
  });
};

export const gitUserPositionsListSev = (params) => {
  return fetch({
    url: URL.userPositions,
    method: 'GET',
    params
  });
};

export const gitUserPnlListSev = (params) => {
  return fetch({
    url: URL.userPnl,
    method: 'GET',
    params
  });
};

export const updateRemarkSev = (data) => {
  return fetch({
    url: URL.updateRemark,
    method: 'POST',
    data
  });
};
