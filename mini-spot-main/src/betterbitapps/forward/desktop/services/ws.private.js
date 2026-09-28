import { WS_HOST } from 'common/utils/host';
import { isDev, isTestnet } from 'common/utils/env';
import EnhancedWebSocket from '../utils/EnhancedWebSocket';

const getRealWSUrl = (path) => `${WS_HOST}/${path}`;

export const createPrivateWS = (privateWSPath) => {
  return new EnhancedWebSocket(getRealWSUrl(privateWSPath), {
    autoConnect: true,
    pingInterval: 3000,
    inactivePingInterval: 15000,
    pingTimeout: 10000,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 3000,
    randomizationFactor: 0,
    debug: isDev || isTestnet,
  });
};

export default createPrivateWS;
