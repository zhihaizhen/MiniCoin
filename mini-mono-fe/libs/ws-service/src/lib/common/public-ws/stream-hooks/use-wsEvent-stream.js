import { types, useGlobalState } from '../../../store';
import { WebsocketEvents } from '@region-lib/public-ws';
import { useEffect } from 'react';
import { websocketEventStream } from '../streams/wsEvent.stream';

const useWebsocketEventStream = () => {
  const [, globalDispatch] = useGlobalState();

  useEffect(() => {
    // console.log('订阅-MarketDataWS-公共行情WS-连接状态');
    const subscription = websocketEventStream.subscribe((websocketEvent) => {
      if (!websocketEvent) return;
      switch (websocketEvent) {
        case WebsocketEvents.RECONNECT:
          // console.log('MarketDataWS-公共行情WS-连接状态: RECONNECTING');
          globalDispatch({ type: types.NETWORK_CHANGE, show: false });
          break;
        case WebsocketEvents.CLOSE:
          // console.log('MarketDataWS-公共行情WS-连接状态: CLOSE');
          globalDispatch({ type: types.NETWORK_CHANGE, show: true });
          break;
        default:
      }
    });
    return () => {
      // console.log('取消订阅-MarketDataWS-公共行情WS-连接状态');
      subscription.unsubscribe();
    };
  }, []);
};

export default useWebsocketEventStream;
