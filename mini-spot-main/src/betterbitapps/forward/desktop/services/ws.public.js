import EnhancedWS from '../utils/enhancedWS';
import { WS_HOST } from '../../../common/utils/host';

const publicWSUrl = () => `${WS_HOST}/realtime_public?v=2`;
export const publicWS = new EnhancedWS(() => publicWSUrl(), {
  autoConnect: true,
  main: true,
});

export default publicWS;
