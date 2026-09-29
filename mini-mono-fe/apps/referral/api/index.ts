import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';
import type {
  ReferralConfig,
  UserOverviewData,
  PaginatedResponse,
  InviteUserRecord,
  RebateRecord,
  TimeRange,
  ReferralInfo
} from '~/types';

const { API_HOST } = Env;

const URL = {
  configPublic: `${API_HOST}/rewards/public/v1/referral/retail/config`,
  configPrivate: `${API_HOST}/rewards/private/v1/referral/retail/config`,
  userData: `${API_HOST}/rewards/private/v1/referral/retail/user/data`,
  userList: `${API_HOST}/rewards/private/v1/referral/retail/user/list`,
  rebateList: `${API_HOST}/rewards/private/v1/referral/retail/rebate/list`,
  referralLink: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`
};

export const getConfigPublic = (): Promise<ReferralConfig> => {
  return fetch({
    url: URL.configPublic,
    method: 'GET'
  });
};

export const getConfigPrivate = (): Promise<ReferralConfig> => {
  return fetch({
    url: URL.configPrivate,
    method: 'GET'
  });
};

export const getUserData = (params: { time_range: TimeRange }): Promise<UserOverviewData> => {
  return fetch({
    url: URL.userData,
    method: 'GET',
    params
  });
};

export const getUserList = (params: {
  page_num: number;
  page_size: number;
}): Promise<PaginatedResponse<InviteUserRecord>> => {
  return fetch({
    url: URL.userList,
    method: 'GET',
    params
  });
};

export const getRebateList = (params: {
  page_num: number;
  page_size: number;
  rebate_type: string;
}): Promise<PaginatedResponse<RebateRecord>> => {
  return fetch({
    url: URL.rebateList,
    method: 'GET',
    params
  });
};

export const getReferralInfo = (): Promise<ReferralInfo> => {
  return fetch({
    url: URL.referralLink,
    method: 'GET'
  });
};
