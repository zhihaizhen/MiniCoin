import Cookies from 'js-cookie';
import { Env, urlInfo } from '@region-lib/env';

export const setAuthToken = (token: string) => {
  const key = `auth_token_${urlInfo.envName}`;

  Cookies.set(key, token, {
    path: '/',
    domain: Env.COOKIE_DOMAIN,
    expires: 10080
  });
};
