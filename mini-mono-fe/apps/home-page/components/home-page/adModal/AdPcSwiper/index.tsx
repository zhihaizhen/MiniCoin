import { useFm } from '@better-bit-fe/base-hooks';
import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Mousewheel, Scrollbar, A11y, Autoplay, Thumbs } from 'swiper/modules';
import { ReactComponent as CloseAd } from '~/icon/close-ad.svg';

import styles from './index.module.less';
import 'swiper/css';
// import 'swiper/css/bundle';

import { Checkbox } from 'antd';
import { IAdProps } from '~/interface';

interface AdSwiperProps {
  adList: IAdProps[];
  close: () => void;
  onIsHideTodayChange: () => void;
}

const ContentSwiper: React.FC<AdSwiperProps> = ({ close, adList, onIsHideTodayChange }) => {
  const t = useFm();

  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState<string>('');
  const progressCircle = useRef<SVGSVGElement | null>(null);

  const onAutoplayTimeLeft = (
    _swiper: SwiperInstance,
    time: number,
    progress: number
  ) => {
    if (progressCircle.current) {
      progressCircle.current.style.setProperty('--progress', String(1 - progress));
    }
    setTimeLeft(`${Math.ceil(time / 1000)}s`);
  };

  const [currentHrefUrl, setCurrentHrefUrl] = useState<string>('');

  const onSwiperIndexChange = (index: number) => {
    setActiveIndex(index);
    const ad = adList[index];
    const url =
      ad?.redirect_web_url ||
      ad?.redirect_h5_url ||
      '';
    setCurrentHrefUrl(url);
  };

  const onRedirect = () => {
    if (!currentHrefUrl) return;
    window.open(currentHrefUrl);
  };

  // 无广告则不渲染
  if (!Array.isArray(adList) || adList.length === 0) return null;

  return (
    <div className={`${styles.adContainer} ${adList.length > 1 ? styles.adMultContianer : ''}`}>
      {adList.length > 1 && (
        <div className={styles.navContianer}>
          <div className={styles.swiperNav}>
            <Swiper
              className="myVerticalSwiper"
              direction="vertical"
              slidesPerView={4}
              spaceBetween={16}
              loop={false}
              modules={[A11y, Mousewheel, Autoplay]}
              mousewheel={{
                forceToAxis: true,
                sensitivity: 1,
                releaseOnEdges: true
              }}
              autoplay={{
                delay: 8000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              onSwiper={(swiper: SwiperInstance) => setThumbsSwiper(swiper)}
            >
              {adList.map((card) => (
                <SwiperSlide key={card.code}>
                  <div className={styles.navCard}>
                    <img
                      className={styles.cardImage}
                      src={card.pic_web_dark_url}
                      alt={card.title}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className={`custom-pagination ${styles.customPagination}`}>
            {`${activeIndex + 1} / ${adList.length}`}
          </div>
        </div>
      )}

      <div className={`${styles.mainContainer} ${adList.length === 1 ? styles.singleContianer : ''}`}>
        <div className={styles.manager}>
          <div className={styles.autoplayProgress}>
            {adList.length > 1 && (
              <>
                <svg viewBox="0 0 48 48" ref={progressCircle}>
                  <circle cx="24" cy="24" r="20" />
                </svg>
                <span>{timeLeft}</span>
              </>
            )}
          </div>
          <div className="cursor-pointer" onClick={close}>
            <CloseAd />
          </div>
        </div>

        <div className={styles.swiperMain}>
          <Swiper
            slidesPerView={1}
            spaceBetween={16}
            loop
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Scrollbar, A11y, Mousewheel, Autoplay, Thumbs]}
            scrollbar={{ draggable: false }}
            pagination={{ clickable: false }}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
              releaseOnEdges: true
            }}
            autoplay={{
              delay: 8000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            onAutoplayTimeLeft={onAutoplayTimeLeft}
            allowTouchMove
            onSwiper={(swiper: SwiperInstance) => {
              swiper.on('realIndexChange', () => {
                onSwiperIndexChange(swiper.realIndex);
              });
              onSwiperIndexChange(swiper.realIndex);
            }}
          >
            {adList.map((card) => (
              <SwiperSlide key={card.code}>
                <div className={styles.cardView}>
                  <img
                    className={styles.cardImage}
                    src={card.pic_web_dark_url}
                    alt={card.title}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className={styles.footerView}>
          <div className={styles.learnMorePc} onClick={onRedirect}>
            {t('knowMore')}
          </div>

          {/* <div className="flex items-center gap-2">
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
