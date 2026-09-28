import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

const URL = {
  campainDetalsPrivate: `${API_HOST}/rewards/private/v1/campaign/get-campaign-detail`,
  campainDetalsPublic: `${API_HOST}/rewards/public/v1/campaign/get-campaign-detail`,
  joinCampaign: `${API_HOST}/rewards/private/v1/campaign/user-register`
};

export const getCampaignDetail = (params) => {
  return fetch({
    url: params.isLogin ? URL.campainDetalsPrivate : URL.campainDetalsPublic,
    method: 'GET',
    params,
    showErrorMessage: true
  });
};

export const joinCampaign = (params) => {
  return fetch({
    url: URL.joinCampaign,
    method: 'POST',
    data: params
  });
};
