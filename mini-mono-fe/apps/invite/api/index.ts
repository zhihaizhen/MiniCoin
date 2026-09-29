import { Env } from '@region-lib/env';
import { request, fetch } from '@better-bit-fe/base-utils';
import type { CampaignDetail } from '~/types/campaign';

const { API_HOST } = Env;

const URL = {
  getReferralInfo: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
  getInviteProgress: `${API_HOST}/commom-public/user-invite/v1/private/invite/progress`,
  campaignDetailPublic: `${API_HOST}/rewards/public/v1/referral/campaign/get-campaign-detail`,
  campaignDetailPrivate: `${API_HOST}/rewards/private/v1/referral/campaign/get-campaign-detail`,
  userRegister: `${API_HOST}/rewards/private/v1/referral/campaign/user-register`,
  receiveAward: `${API_HOST}/rewards/private/v1/referral/campaign/receive-award`
};

export const getReferralInfo = () => {
  return fetch({
    url: URL.getReferralInfo,
    method: 'GET'
  });
};

export const getInviteProgress = () => {
  return fetch({
    url: URL.getInviteProgress,
    method: 'GET'
  });
};

export const getCampaignDetailPublic = (): Promise<CampaignDetail> => {
  return fetch({
    url: URL.campaignDetailPublic,
    method: 'GET'
  });
};

export const getCampaignDetailPrivate = (): Promise<CampaignDetail> => {
  return fetch({
    url: URL.campaignDetailPrivate,
    method: 'GET'
  });
};

export const enrollActivity = (campaignNo: string) => {
  return fetch({
    url: URL.userRegister,
    method: 'GET',
    params: { campaign_no: campaignNo }
  });
};

export const receiveAward = (data: { campaign_no: string; task_event: string }) => {
  return fetch({
    url: URL.receiveAward,
    method: 'POST',
    data
  });
};
