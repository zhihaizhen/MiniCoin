//@ts-ignore
import { useFm } from '@better-bit-fe/base-hooks';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import cls from 'classnames';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { ReactComponent as ArrowLeftSVG } from '~/icon/arrow-left.svg';
import { ReactComponent as ArrowRightSVG } from '~/icon/arrow-right.svg';
import { ReactComponent as NotiIcon } from '~/public/images/homePage/notification.svg';
import { ReactComponent as ArrowRightIcon } from '~/public/images/homePage/arrow-right.svg';
import { normalizeLocale } from '@better-bit-fe/base-utils';
import { isMobile } from '@betterbit-library/tools';
import { postDynamicImg, postNotificationList } from '~/api';
import { useRouter } from 'next/router';
import styles from './index.module.less';
import 'swiper/css';


const spaceBetween = 20;

const ContentSwiper = () => {
  const t = useFm();
  const isMb = isMobile();
  const [swiperInstance, setSwiperInstance] = useState(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);
  const { locale } = useRouter();

  // const [loading, setLoading] = useState(true);
  const [dynamicImg, setDynamicImg] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const fetchDynamicImgList = async () => {
    const params = {
      language: locale,
    }
    const res = await postDynamicImg(params);
    // 全屏展示的个数小于总个数时候，为true
    setIsEnd(!(res.records.length > 4));
    setDynamicImg(res.records);
  }

  const fetchNotificationList = async () => {
    const params = {
      language: locale,
    }
    const res = await postNotificationList(params);
    setNotifications(res.records);
  }

  useEffect(() => {
    fetchNotificationList()
    fetchDynamicImgList();
  }, []);

  const handleSlideChange = (swiper) => {
    const activeIndex = swiper.activeIndex;
    if (activeIndex === 0) {
      setIsBeginning(true);
      setIsEnd(false);
      return;
    }

    setIsBeginning(swiper.isBeginning);
    const totalSlides = swiper.slides.length;
    const slideWidth = swiper.slidesSizesGrid?.[0] ?? 0;  // 每个 slide 的宽度
    const visibleCount = Math.floor(swiper.width / (slideWidth + spaceBetween));
    const isEnd = activeIndex > totalSlides - visibleCount;
    setIsEnd(isEnd);
  }

  const handleViewMore = (card) => {
    window?.open(card?.redirect_web_url);
  }

  const handleNextSlide = () => {
    if (!swiperInstance) return;
    swiperInstance.slideNext();
  }

  const handlePrevSlide = () => {
    if (!swiperInstance) return;
    swiperInstance.slidePrev();
  }

  const handleMoreClick = () => {
    const lang = normalizeLocale(locale);
    window.open(`https://easicoin.zendesk.com/hc/${lang}/categories/13278340573711-%E9%87%8D%E8%A6%81%E5%85%AC%E5%91%8A`);
  };

  const handleNotificationClick = (notification) => {
    window.open(notification?.redirect_url);
  }

  return (
    <div className={styles.contentSwiper}>
      <div className={styles.coreContent}>
        {/* 通知栏 */}
        <div className={styles.notificationBar}>
          <div className={styles.notificationContent}>
            <NotiIcon className={styles.notiIcon} />
            <Swiper
              slidesPerView={1}
              modules={[A11y, Mousewheel, Autoplay]}
              freeMode={false}
              direction='vertical'
              centeredSlides={false}
              loop={true}
              slideToClickedSlide={false}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                stopOnLastSlide: true,
              }}
              allowTouchMove={true}
              className={styles.notificationSwiper}
            >
              {notifications.map((text, index) => (
                <SwiperSlide key={index} onClick={() => handleNotificationClick(text)}>
                  <a href={text?.redirect_url}>{text?.title}</a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <button className={styles.moreButton} onClick={handleMoreClick}>
            <span>{t('more')}</span>
            <ArrowRightIcon className={styles.moreArrow} />
          </button>
        </div>

        {/* 卡片区域 */}
        {dynamicImg.length > 0 && (
          <div className={styles.cardsWrapper}>
            <Swiper
              modules={[Scrollbar, A11y, Mousewheel, Autoplay]}
              grabCursor={isMb}
              slidesPerView={4}
              // slidesPerView={'auto'}
              freeMode={false}
              centeredSlides={false}
              loop={true}
              slideToClickedSlide={false}
              spaceBetween={spaceBetween}
              scrollbar={{ draggable: false }}
              pagination={{ clickable: false }}
              mousewheel={{
                forceToAxis: true,
                sensitivity: 1,
                releaseOnEdges: true
              }}
              // autoplay={{
              //   delay: 5000,
              //   disableOnInteraction: false,
              //   pauseOnMouseEnter: true,
              //   stopOnLastSlide: true,
              // }}
              onSwiper={(swiper) => setSwiperInstance(swiper)}
              onSlideChange={handleSlideChange}
              allowTouchMove={true}
              className={styles.swiper}
            >
              {dynamicImg.map((card, index) => (
                <SwiperSlide key={index} className={styles.cardSlide} onClick={() => handleViewMore(card)}>
                  <div className={styles.card}>
                    <div className={styles.cardContent}>
                      <div className={styles.cardText}>
                        <div className={styles.cardTitle}>{card?.title}</div>
                        {card?.abstr && <div className={styles.cardSubtitle}>{card?.abstr}</div>}
                      </div>
                      <img className={styles.cardImage} src={card?.pic_web_dark_url} alt={card?.title} />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* 箭头按钮 */}
            <button
              disabled={isBeginning}
              className={cls(styles.arrowButton, styles.arrowLeft)}
              onClick={handlePrevSlide}
            >
              <ArrowLeftSVG />
            </button>
            <button
              disabled={isEnd}
              className={cls(styles.arrowButton, styles.arrowRight)}
              onClick={handleNextSlide}
            >
              <ArrowRightSVG />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSwiper;
