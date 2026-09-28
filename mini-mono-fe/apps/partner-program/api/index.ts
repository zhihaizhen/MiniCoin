import { Env } from '@region-lib/env';
import { loginRequest } from '@better-bit-fe/base-utils';
const { request } = loginRequest;

const { API_HOST } = Env;

const URL = {
  emailCodeSend: `${API_HOST}/user/private/v3/email-code-send`
};

export const postEmailCodeSend = (data) => {
  return request({
    url: URL.emailCodeSend,
    method: 'POST',
    data
  });
};
