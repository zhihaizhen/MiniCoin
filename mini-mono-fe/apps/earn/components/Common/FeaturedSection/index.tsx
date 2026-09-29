import { A11y, Autoplay, Mousewheel, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import React, { useEffect, useState, memo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { isMobile } from '@betterbit-library/tools';
import { getProductRcommend, getUserTagInfo } from '~/api';
import { CategoryEnum, TagEnum, TopCategoryEnum } from '~/enums';
import { getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import Image from 'next/image';
import { ReactComponent as ArrowLeftSVG } from '~/public/images/arrow-left.svg';
import { ReactComponent as ArrowRightSVG } from '~/public/images/arrow-right.svg';
import CustomSkeleton from '~/components/Common/CustomSkeleton';
import { formatApr } from '~/utils';
import SubscribeModal from '~/components/Common/SubscribeModal';
import { ProductGroupProps, ProductProps } from '~/interface';
import ProductTag from '~/components/Common/ProductTag';
import PaginationIndicator from './PaginationIndicator';
import { message } from 'antd';
import dayjs from 'dayjs';
import StakeModal from '~/components/Common/StakeModal';
import { TIME_FORMAT } from '~/constants';

const SLIDE_SPACE_BETWEEN = 20;

interface CardProps {
  id: string;
  return_coin: string;
  product_tag: TagEnum;
  product_type: TagEnum | CategoryEnum;
  category: CategoryEnum;
  duration_days: number;
  apr_type: CategoryEnum;
  fixed_apr: string;
  max_apr: string;
  min_apr: string;
  subscribe_end_at: number;
  subscribe_start_at: number;
  allow_invest_quota: number;
  top_category: TopCategoryEnum;
}

interface FeaturedSectionProps {
  topCategory?: TopCategoryEnum;
}

const FeaturedSection = memo(({ topCategory }: FeaturedSectionProps) => {
  const t = useFm();
  const isMobileDevice = isMobile();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [cardList, setCardList] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [group, setGroup] = useState<ProductGroupProps | undefined>();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const calculateIsEnd = (swiper: SwiperType): boolean => {
    const { activeIndex, slidesSizesGrid } = swiper;
    return activeIndex === slidesSizesGrid.length - 3;
  };

  const handleSlideChange = (swiper: SwiperType): void => {
    const { activeIndex, isBeginning: swiperIsBeginning } = swiper;

    if (activeIndex === 0) {
      setIsBeginning(true);
      setIsEnd(false);
      return;
    }

    setIsBeginning(swiperIsBeginning);
    setIsEnd(calculateIsEnd(swiper));
  };

  const handleSubscribe = async (card: CardProps) => {

    // if (!isLogin) {
    //   goPage('login');
    //   return;
    // }

    if (isMobileDevice) {
      goPage('download');
      return;
    }

    if (+card.allow_invest_quota === 0) {
      void message.warning(t('no-left-tip'));
      return;
    }

    const now = dayjs().unix();

    if (now < card.subscribe_start_at) {
      void message.warning(t('subscribe-start-tip', {date: dayjs(card.subscribe_start_at * 1000).format(TIME_FORMAT)}));
      return;
    }

    if (now > card.subscribe_end_at) {
      void message.warning(t('subscribe-end'));
      return;
    }

    if (card.product_tag === TagEnum.NEWBIE) {
      const userTagRes = await getUserTagInfo();
      if (!userTagRes?.is_newbie) {
        void message.warning(t('newbie-tip'));
        return;
      }
    }

    setGroup({
      product_category: card.top_category,
      product_tag: TagEnum.NORMAL,
      product_item: [card as unknown as ProductProps]
    });
    if(card.product_type === TagEnum.DEFI || card.product_type === TagEnum.POS) {
      setShowStakeModal(true);
      return;
    }
    setShowModal(true);
  };

  const onSwiperIndexChange = (index: number) => {
    setActiveIndex(index);
  };

  const handleSwiperInit = (swiper: SwiperType): void => {
    setSwiperInstance(swiper);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(calculateIsEnd(swiper));

     swiper.on('realIndexChange', () => {
       onSwiperIndexChange(swiper.realIndex);
     });
     // 初始化时同步当前索引和链接
     onSwiperIndexChange(swiper.realIndex);
  };

  const handleNextSlide = (): void => {
    swiperInstance?.slideNext();
  };

  const handlePrevSlide = (): void => {
    swiperInstance?.slidePrev();
  };

  const renderSkeletonSlides = () =>
    [...Array(3)].map((_, index) => (
      <SwiperSlide key={`skeleton-${index}`}>
        <CustomSkeleton type="recommand" />
      </SwiperSlide>
    ));

  const renderProductSlides = () =>
    cardList.map((card, index) => (
      <SwiperSlide
        key={`${card.id}-${index}`}
        onClick={() => handleSubscribe(card)}
      >
        <div
          className="h-[184px] md:h-[164px] border border-line-border-default rounded-xl
                flex flex-col items-center justify-between cursor-pointer p-4 hover:border-fill-button-brand-hover"
        >
          <div className="w-full flex items-center justify-start gap-2">
            <Image
              src={getSymbolUrl(card.return_coin)}
              alt={card.return_coin}
              width={40}
              height={40}
              loader={({ src }) => src}
            />
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-base font-bold">
                  {card.return_coin}
                </span>
                <ProductTag prd={card} />
              </div>
              <div className="flex items-center text-text-primary text-xs ">
                <span>
                  {card.top_category === TopCategoryEnum.SAVING
                    ? t('saving-title')
                    : card.top_category === TopCategoryEnum.ONCHAIN
                    ? t('earn.onchain')
                    : card.top_category === TopCategoryEnum.SIMPLE
                    ? t('earn.simple')
                    : ''}
                </span> ｜
                <span>
                  {card.category === CategoryEnum.LIQUID
                  ? t('liquid')
                  : `${card.duration_days} ${t('day')}`}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-between mb-[6px]">
            <div className="flex items-end gap-2">
              <div className="text-text-brand-default md:text-text-primary text-[28px] leading-7 font-bold">
                {card.apr_type === CategoryEnum.FIXED
                  ? formatApr(card.fixed_apr)
                  : `${formatApr(card.min_apr)}～ ${formatApr(card.max_apr)}`}
              </div>
               <div className="text-text-primary text-base">APR</div>
            </div>
          </div>

          <div
            className="md:hidden w-full h-10 rounded-lg bg-fill-button-brand-default text-text-black text-sm flex justify-center items-center"
            onClick={() => goPage('download')}
          >
            {t('subscribe')}
          </div>
        </div>
      </SwiperSlide>
    ));

  useEffect(() => {
    setLoading(true);
    getProductRcommend()
      .then((res) => {
        const recommandList = res?.list || [];
        setCardList(topCategory ? recommandList.filter((card) => card.top_category === topCategory) : recommandList);
        setIsEnd(recommandList.length <= 3);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [topCategory]);

  return (
    <div className="w-full mt-2 md:mt-6">
      {
        cardList.length > 0 &&
        <div className="text-text-primary text-2xl font-bold leading-[52px] text-center md:text-left">
          {t('recommand-block')}
        </div>
      }

      <div className="w-full flex justify-between items-center gap-5 overflow-hidden mt-4 md:mt-6">
        {cardList.length > 3 && (
          <button
            className={`hidden md:flex w-8 h-8 justify-center items-center bg-fill-button-tertiary-default rounded-full  ${
              isBeginning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={handlePrevSlide}
            disabled={isBeginning}
          >
            <ArrowLeftSVG />
          </button>
        )}

        <Swiper
          className="md:block! hidden! flex-1"
          modules={[Scrollbar, A11y, Mousewheel, Autoplay]}
          grabCursor={false}
          slidesPerView={3}
          freeMode={false}
          centeredSlides={false}
          loop={isMobileDevice}
          slideToClickedSlide={false}
          spaceBetween={SLIDE_SPACE_BETWEEN}
          scrollbar={{ draggable: false }}
          pagination={{ clickable: false }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true
          }}
          autoplay={false}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          allowTouchMove={true}
        >
          {loading ? renderSkeletonSlides() : renderProductSlides()}
        </Swiper>
        <Swiper
          className="md:hidden! flex-1"
          modules={[Scrollbar, A11y, Mousewheel, Autoplay]}
          grabCursor={true}
          slidesPerView={1}
          freeMode={false}
          centeredSlides={false}
          loop={isMobileDevice}
          slideToClickedSlide={false}
          spaceBetween={SLIDE_SPACE_BETWEEN}
          scrollbar={{ draggable: false }}
          pagination={{ clickable: false }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true
          }}
          autoplay={{delay: 3000}}
          allowTouchMove={true}
        >
          {loading ? renderSkeletonSlides() : renderProductSlides()}
        </Swiper>
        {cardList.length > 3 && (
          <button
            className={`hidden md:flex w-8 h-8 justify-center items-center bg-fill-button-tertiary-default rounded-full  ${
              isEnd ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={handleNextSlide}
            disabled={isEnd}
          >
            <ArrowRightSVG />
          </button>
        )}
      </div>

      {cardList.length > 1 && (
        <PaginationIndicator
          className="md:hidden"
          total={cardList.length}
          activeIndex={activeIndex}
        />
      )}

      <SubscribeModal open={showModal} group={group} close={() => setShowModal(false) } />
      <StakeModal open={showStakeModal} group={group} close={() => setShowStakeModal(false)} />
    </div>
  );
});

FeaturedSection.displayName = 'FeaturedSection';

export default FeaturedSection;
