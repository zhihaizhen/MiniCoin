import { WS_HOST } from '../common/utils/host';
import { urlInfo } from '@region-lib/env';
import EnhancedWS from '../utils/enhancedWS';

const getRealWSUrl = (path) => `${WS_HOST}/${path}`;
export const createPrivateWS = (privateWSPath) => {
  return new EnhancedWS(getRealWSUrl(privateWSPath), {
    autoConnect: true,
    pingInterval: 5000,
    debug: urlInfo.env === 'test'
  });
};

export default createPrivateWS;
