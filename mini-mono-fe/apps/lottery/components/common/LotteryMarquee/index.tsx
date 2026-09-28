import Marquee from 'react-fast-marquee';

import React, { useMemo, memo } from 'react';
import { basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';

interface Props {
  big?: boolean;
}

const LotteryMarquee = ({ big = false }: Props) => {
  const t = useFm();

  const mData = useMemo(() => {
    if (big) {
      const items = [
        { text: 'BTC', icon: `${basePath}/images/btc.png` },
        { text: 'ETH', icon: `${basePath}/images/eth.png` },
        { text: 'SOL', icon: `${basePath}/images/sol.png` },
        { text: t('gold'), icon: `${basePath}/images/gold.png` },
        { text: 'DOGE', icon: `${basePath}/images/dog.png` },
        { text: 'USDT', icon: `${basePath}/images/usdt.png` },
      ];
      return [...items, ...items, ...items];
    }
    return [
      { text: 'BTC', icon: `${basePath}/images/btc.png` },
      { text: `5 USDT`, type: 'coupons', icon: `${basePath}/images/PostGivenCash.png` },
      { text: `5 USDT`, type: 'coupons', icon: `${basePath}/images/ServiceCash.png` },
      { text: 'ETH', icon: `${basePath}/images/eth.png` },
      { text: `20 USDT`, type: 'coupons', icon: `${basePath}/images/PostGivenCash.png` },
      { text: `20 USDT`, type: 'coupons', icon: `${basePath}/images/ServiceCash.png` },
      { text: 'SOL', icon: `${basePath}/images/sol.png` },
      { text: `50 USDT`, type: 'coupons', icon: `${basePath}/images/PostGivenCash.png` },
      { text: `50 USDT`, type: 'coupons', icon: `${basePath}/images/ServiceCash.png` },
      { text: 'DOGE', icon: `${basePath}/images/dog.png` },
      { text: `200 USDT`, type: 'coupons', icon: `${basePath}/images/PostGivenCash.png` },
      { text: `200 USDT`, type: 'coupons', icon: `${basePath}/images/ServiceCash.png` },
      { text: 'USDT', icon: `${basePath}/images/usdt.png` },
      { text: `500 USDT`, type: 'coupons', icon: `${basePath}/images/PostGivenCash.png` },
    ];
  }, [big, t]);

  return (
    <div className="absolute w-[70%] md:w-[810px] h-5 bottom-9 md:bottom-[150px]">
      <Marquee speed={15} gradient={false} pauseOnHover={true} direction="left">
        {mData.map((item, index) => (
          <div
            key={item.text + index}
            className="w-auto h-full flex flex-col justify-center items-center gap-0 mx-3 md:mx-5"
          >
            <div
              className={`relative flex justify-center items-center ${'md:w-[45px] md:h-[45px] w-8 h-8'}`}
            >
              <img
                src={item.icon}
                alt={item.text}
                className="w-full h-full object-contain"
              />
            </div>

            <span className="hidden md:block text-white text-[6px] md:text-xs leading-tight">
              {item.text}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default memo(LotteryMarquee);
