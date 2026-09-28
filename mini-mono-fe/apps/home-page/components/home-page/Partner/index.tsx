import { useFm } from "@better-bit-fe/base-hooks";
import React from "react";
import getConfig from 'next/config';
import Marquee from "react-fast-marquee";

const { staticFolder } = getConfig().publicRuntimeConfig;

const Partner = () => {
  const t = useFm();
  const partnerList = ['Sumsub', 'Fireblocks', 'Coincover', 'CoinMarketCap', 'TokenInsight', 'CoinDesk', 'Chainalysis']

  return (
    <div>
      <div className="flex items-center justify-center text-text-primary font-bold text-2xl md:text-4xl">{t('partner')}</div>
      <div className="w-full h-12 sm:h-16 flex items-center justify-start select-none my-[40px]">
        <Marquee
          speed={50}
          gradient={false}
          pauseOnHover={true}
          direction="left"
          className="flex items-center"
        >
          {Array.isArray(partnerList) && partnerList.map((name, index) => (
            <div key={index} className="flex items-center gap-1 mx-6 sm:mx-10 whitespace-nowrap">
              <span className="text-black text-sm font-medium leading-tight">
                <img src={`${staticFolder}/images/homePage/partners/${name}.svg`} />
              </span>

            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default Partner;
