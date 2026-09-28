import { ENV } from '../config';

const WS_HOST = {
  dev: '',
  local: '',
  production: '',
  test: '',
  testnet: ''
};

export const wsHost = WS_HOST[ENV];
