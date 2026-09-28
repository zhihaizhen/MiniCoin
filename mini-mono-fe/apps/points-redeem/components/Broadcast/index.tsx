import 'swiper/css';
import React, { useEffect, useState } from 'react';
import {ReactComponent as UserIcon } from '~/public/images/user.svg';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, A11y, Autoplay } from 'swiper/modules';
import { useFm } from '@better-bit-fe/base-hooks';
import { getPublicRecentPrize } from '~/api';
import Marquee from 'react-fast-marquee';
import {
  getAwardDesc as getAwardDescUtil, getAwardTokenStr
} from '~/hooks/useAwardInfo';
import { AwardItem } from '~/interface';
import { FormattedMessage } from 'react-intl';

const Broadcast: React.FC = () => {

  const t = useFm()
  const [notifications, setNotifications] = useState([]);
  const getAwardDesc = (award) => {

   const desc = getAwardDescUtil(award as unknown as AwardItem, t);
    const tokenStr = getAwardTokenStr(award as unknown as AwardItem, t);
    return desc ? `${desc} ${tokenStr}` : tokenStr;
  };

  useEffect(() => {
    getPublicRecentPrize().then(res => {
      setNotifications(res.records);
    });
  }, [])

  if (!Array.isArray(notifications) || notifications.length === 0) return null;

  return (
    <>
      <div
        className="md:hidden mt-10 w-full h-12 sm:h-16 flex items-center justify-start bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)]
         backdrop-blur-[5px] select-none"
      >
        <Marquee
          speed={20}
          gradient={false}
          pauseOnHover={true}
          direction="left"
          className="flex items-center"
        >
          {Array.isArray(notifications) &&
            notifications.map((item, index) => (
              <div
                className="text-xs flex justify-center items-center gap-2 leading-6 mr-10"
                key={index}
              >
                <UserIcon />
                <span className="text-text-primary">
                  {item?.user_id} {t('geted')}
                </span>

                <span className="text-text-brand-default-web">
                  {item?.geted}
                  <FormattedMessage
                    id="tokenformatawarddesc"
                    defaultMessage={getAwardDesc(item)}
                    values={{
                      i: (chunks: React.ReactNode) => <span>{chunks}</span>,
                    }}
                  />
                </span>
              </div>
            ))}
        </Marquee>
      </div>
      <div
        className="hidden md:flex min-w-[500px] h-10 fixed items-center px-3 rounded-lg bottom-[60px] left-20
         bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)]
         backdrop-blur-[5px] z-20"
      >
        <div className="text-text-primary flex justify-start items-center gap-2">
          <UserIcon />
          <Swiper
            className="h-6"
            slidesPerView={1}
            modules={[A11y, Mousewheel, Autoplay]}
            freeMode={false}
            direction="vertical"
            centeredSlides={false}
            loop={true}
            slideToClickedSlide={false}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              stopOnLastSlide: true
            }}
            allowTouchMove={true}
          >
            {notifications.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="text-xs flex justify-start items-center gap-2 leading-6 overflow-hidden">
                  <span className="text-text-primary text-nowrap">
                    {item?.user_id} {t('geted')}
                  </span>

                  <span className="text-text-brand-default-web text-nowrap">
                    {item?.geted}
                    <FormattedMessage
                      id="tokenformatawarddescweb"
                      defaultMessage={getAwardDesc(item)}
                      values={{
                        i: (chunks: React.ReactNode) => <span>{chunks}</span>,
                      }}
                    />
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
}

export default Broadcast
