import { useEffect, useState } from 'react';
import { SpotWss } from './spotWss';
import { SpotRealTimeResp } from './types';

export const useSpotWss = (symbol, isDebug = false) => {
  const [realTimes, setRealTimes] = useState<{
    [symbol: string]: SpotRealTimeResp;
  }>({});

  const [wss, setWss] = useState<SpotWss>();

  useEffect(() => {
    const wss = SpotWss.getInstance();
    if (isDebug) {
      wss.showLog();
    }

    wss.on('open', () => {
      wss.sendRealTimes(symbol);
    });

    setWss(wss);
  }, [isDebug, symbol]);

  useEffect(() => {
    if (!wss) {
      return;
    }

    const clear = wss.on('realtimes', (data: SpotRealTimeResp[]) => {
      const newData = {};
      data.forEach((e) => {
        newData[e.symbol] = e;
      });
      setRealTimes((prev) => {
        return {
          ...prev,
          ...newData
        };
      });
    });
    return () => {
      clear();
    };
  });

  return {
    // 获取24小时交易数据
    realTimes,
    status: wss?.status
  };
};
