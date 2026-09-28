import 'swiper/css';
import React, { useEffect, useState } from 'react';
import {ReactComponent as NoticIcon } from '~/public/images/noti.svg';
import {ReactComponent as RightArrowIcon } from '~/public/images/right-arrow.svg';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, A11y, Autoplay } from 'swiper/modules';
import { postNotificationList } from '~/api';
import { useRouter } from 'next/router';
import { normalizeLocale } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';

const Broadcast: React.FC = () => {

  const t = useFm()
  const { locale } = useRouter();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    postNotificationList({ language: locale }).then(res => {
      setNotifications(res.records);
    });
  }, [locale])

  const handleMoreClick = () => {
    const lang = normalizeLocale(locale);
    window.open(`https://easicoin.zendesk.com/hc/${lang}/categories/13278340573711-%E9%87%8D%E8%A6%81%E5%85%AC%E5%91%8A`);
  };

  const handleNotificationClick = (url) => {
    window.open(url, '_blank');
  }
  return (
    <div className="w-full h-5 md:h-10 flex justify-between mt-6 md:mt-0">
      <div className="text-text-primary flex justify-start items-center gap-2">
        <NoticIcon />
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
            <SwiperSlide
              key={index}
              onClick={() => handleNotificationClick(item?.redirect_url)}
            >
              <span className="text-sm cursor-pointer w-full max-w-[300px] md:max-w-[1000px] truncate inline-block leading-6">
                {item?.title}
              </span>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div
        className="text-black text-base flex justify-end items-center gap-2 cursor-pointer group"
        onClick={handleMoreClick}
      >
        <span className="hidden md:block">{t('more')}</span>
        <RightArrowIcon className="group-hover:translate-x-1.5 transition-all ease-in-out duration-300" />
      </div>
    </div>
  );
}

export default Broadcast
