import { parseUrl, Env } from '@region-lib/env';

function getServiceHostFormat() {
  return {
    API2_HOST: Env.API_HOST,
    WS2_HOST: Env.WS_HOST,
  };
}

const api2Host = getServiceHostFormat().API2_HOST;
const wsHost = getServiceHostFormat().WS2_HOST;

export { api2Host, wsHost };
