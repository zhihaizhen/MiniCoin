import { useFm } from '@better-bit-fe/base-hooks';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y, Autoplay } from 'swiper/modules';
import { ReactComponent as CloseAd } from '~/icon/close-ad.svg';
import styles from './index.module.less';
import 'swiper/css';
import { Checkbox } from 'antd';
import { IAdProps } from '~/interface';
import PaginationIndicator from '../PaginationIndicator';

interface AdSwiperProps {
  adList: IAdProps[];
  close: () => void;
  onIsHideTodayChange: () => void;
}

const ContentSwiper: React.FC<AdSwiperProps> = ({ close, adList, onIsHideTodayChange }) => {
  const t = useFm();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [currentHrefUrl, setCurrentHrefUrl] = useState<string>('');

  const onSwiperIndexChange = (index: number) => {
    setActiveIndex(index);
    const ad = adList[index];
    const url =
      ad?.redirect_h5_url ||
      ad?.redirect_web_url ||
      '';
    setCurrentHrefUrl(url);
  };

  const onRedirect = () => {
    if (!currentHrefUrl) return;
    window.open(currentHrefUrl);
  };

  useEffect(() => {
    if (!Array.isArray(adList) || adList.length === 0) return;
    const firstAd = adList[0];
    const url =
      firstAd?.redirect_web_url ||
      firstAd?.redirect_h5_url ||
      '';
    setCurrentHrefUrl(url);
    setActiveIndex(0);
  }, [adList]);

  if (!Array.isArray(adList) || adList.length === 0) {
    return null;
  }

  return (
    <div className={styles.mobileAdContainer}>
      <div className={styles.mainContainer}>
        <div className={styles.manager}>
          <button
            type="button"
            className="cursor-pointer"
            onClick={close}
          >
            <CloseAd />
          </button>
        </div>

        <div className={styles.swiperMain}>
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            loop
            modules={[A11y, Autoplay]}
            autoplay={{
              delay: 8000,
              pauseOnMouseEnter: true
            }}
            allowTouchMove
            onSwiper={(swiper: SwiperInstance) => {
              swiper.on('realIndexChange', () => {
                onSwiperIndexChange(swiper.realIndex);
              });
              // 初始化时同步当前索引和链接
              onSwiperIndexChange(swiper.realIndex);
            }}
          >
            {adList.map((card) => (
              <SwiperSlide key={card.code} className={styles.cardSlide}>
                <div className={styles.card}>
                  <img
                    className={styles.cardImage}
                    src={card.pic_h5_dark_url || card.pic_app_dark_url}
                    alt={card.title}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className={`${styles.bottomBar} ${adList.length === 1 ? styles.bottomSingleBar : ''}`}>
          {adList.length > 1 && (
            <PaginationIndicator total={adList.length} activeIndex={activeIndex} />
          )}

          <button
            type="button"
            className={styles.learnMore}
            onClick={onRedirect}
          >
            {t('knowMore')}
          </button>

          {/* <div className="flex items-center gap-2 mt-4">
            <Checkbox onChange={() => onIsHideTodayChange()} />
            <span className="text-white text-xs md:text-sm">
              {t('hide-today')}
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ContentSwiper;
