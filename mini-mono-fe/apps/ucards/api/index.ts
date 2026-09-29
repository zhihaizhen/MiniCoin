import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';
import type { ReferralConfig, ReferralInfo } from '~/types/referral';

const { API_HOST } = Env;

const URL = {
  emailCodeSend: `${API_HOST}/user/private/v3/email-code-send`,
  configPublic: `${API_HOST}/rewards/public/v1/referral/retail/config`,
  configPrivate: `${API_HOST}/rewards/private/v1/referral/retail/config`,
  referralLink: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`
};

export const postEmailCodeSend = (data) => {
  return fetch({
    url: URL.emailCodeSend,
    method: 'POST',
    data
  });
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

export const getReferralInfo = (): Promise<ReferralInfo> => {
  return fetch({
    url: URL.referralLink,
    method: 'GET'
  });
};
