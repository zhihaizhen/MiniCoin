import { useFm } from "@better-bit-fe/base-hooks";
import React from "react";
import Marquee from "react-fast-marquee";
import { useDepositData } from "~/hooks/useDepositData";

const Carousel = () => {
  const t = useFm();
  const { depositData = [] } = useDepositData();

  // // 如果没有数据，不显示跑马灯
  // if (!depositData || !Array.isArray(depositData) || depositData.length === 0) {
  //   return null;
  // }

  return (
    <div className="w-full h-12 sm:h-16 flex items-center justify-start bg-[linear-gradient(270deg,_#9FD6AB_6.45%,_#378248_33.34%,_#9FD6AB_63.6%,_#378248_93.85%)] select-none">
      <Marquee
        speed={50}
        gradient={false}
        pauseOnHover={true}
        direction="left"
        className="flex items-center"
      >
        {Array.isArray(depositData) && depositData.map((notification, index) => (
          <div key={index} className="flex items-center gap-1 mx-6 sm:mx-10 whitespace-nowrap">
            <span className="text-black text-sm font-medium leading-tight">
              {notification.user_id}
            </span>
            <span className="text-black text-sm leading-tight">
              {t('deposit-cashback-carousel-text')}
            </span>
            <span className="text-black text-sm font-bold leading-tight">
              {`${notification.amount} usdt`}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Carousel;
