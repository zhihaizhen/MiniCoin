import { Env } from '@region-lib/env';
import { fetch } from './request';

const { API_HOST } = Env;


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


