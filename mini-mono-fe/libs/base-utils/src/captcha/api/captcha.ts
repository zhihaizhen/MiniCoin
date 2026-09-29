import { Env } from '@region-lib/env';
import { fetch } from '../utils';

const { API_HOST } = Env;

/**
 * 极验获取初始化信息
 */
export const getCaptchaInfo = (params: {
  type: string;
  login_name: string;
}) => {
  return fetch({
    url: `${API_HOST}/user/public/v3/captcha-info?_t=${+new Date()}`,
    params: {
      ...params
    }
  });
};
