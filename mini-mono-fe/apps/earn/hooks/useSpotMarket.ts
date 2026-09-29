import { useEffect, useState } from 'react';
import { getSpotMarket } from '~/api';
import { useUserInfo } from '@better-bit-fe/base-provider';

interface SpotMarketProp {
  symbol: string,
  highPrice: string,
  lastPrice: number,
  lowPrice: string,
  openPrice: string,
  quoteVolume: string,
  volume: string,
  time: number
}
const useSpotMarket = () => {
  const { userInfo } = useUserInfo();
  const [spotMarket, setSpotMarket] = useState<SpotMarketProp[]>();


  const fetchSpotMarket = async () => {
    const res = await getSpotMarket();
    setSpotMarket(res);
  };

  useEffect(() => {
    if (userInfo) {
      void fetchSpotMarket();
    }
  }, [userInfo]);

  return {
    spotMarket,
    fetchSpotMarket
  };
};

export default useSpotMarket;
