import React, { useState, memo, useMemo } from 'react';
import { CategoryEnum, TagEnum, TopCategoryEnum } from '~/enums';
import { useFm } from '@better-bit-fe/base-hooks';
import { ProductGroupProps } from '~/interface';
import SubscribeModal from '~/components/Common/SubscribeModal';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { formatApr } from '~/utils';
import dayjs from 'dayjs';
import { message } from 'antd';
import ProductTag from '~/components/Common/ProductTag';
import { getUserTagInfo } from '~/api';
import { goPage, isMobile } from '@better-bit-fe/base-utils';
import { TIME_FORMAT } from '~/constants';
import StakeModal from '~/components/Common/StakeModal';

interface PrdGroupComponentProps {
  group: ProductGroupProps;
}

const PrdGroup = memo(({ group }: PrdGroupComponentProps) => {
  const t = useFm();

  const selectedProduct = group.product_item[0];
  const [showModal, setShowModal] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);

  const termText = useMemo(() => {
    const hasLiquid = group.product_item.some(
      (item) => item.category === CategoryEnum.LIQUID
    );
    const fixedDurations = group.product_item
      .filter((item) => item.category === CategoryEnum.FIXED)
      .map((item) => item.duration_days);

    const terms = [];

    if (hasLiquid) {
      terms.push(t('liquid'));
    }

    if (fixedDurations.length > 0) {
      const minDuration = Math.min(...fixedDurations);
      const maxDuration = Math.max(...fixedDurations);

      terms.push(
        minDuration === maxDuration
          ? `${minDuration}${t('day')}`
          : `${minDuration}~${maxDuration}${t('day')}`
      );
    }

    return terms.join('/');
  }, [group.product_item, t]);

  const aprDisplay = useMemo(() => {
    if (selectedProduct.category === CategoryEnum.FIXED) {
      return formatApr(selectedProduct.fixed_apr);
    }

    return selectedProduct.min_apr === selectedProduct.max_apr
      ? formatApr(selectedProduct.min_apr)
      : `${formatApr(selectedProduct.min_apr)} ~ ${formatApr(selectedProduct.max_apr)}`;
  }, [selectedProduct]);

  const handleSubscribe = async () => {
    // if (!isLogin) {
    //   goPage('login');
    //   return;
    // }
    if (isMobile()) {
      goPage('download');
      return;
    }

    if (group.product_item.length > 1) {
      if (group.product_category === TopCategoryEnum.ONCHAIN) {
        setShowStakeModal(true);
        return;
      }
      setShowModal(true);
      return;
    }

    if (+selectedProduct.allow_invest_quota === 0) {
      void message.warning(t('no-left-tip'));
      return;
    }

    const now = dayjs().unix();

    if (now < selectedProduct.subscribe_start_at) {
      void message.warning(t('subscribe-start-tip', { date: dayjs(selectedProduct.subscribe_start_at * 1000).format(TIME_FORMAT) }));
      // void message.warning(t('subscribe-no-start'));
      return;
    }

    if (now > selectedProduct.subscribe_end_at) {
      void message.warning(t('subscribe-end'));
      return;
    }

    if (selectedProduct.product_tag === TagEnum.NEWBIE) {
      const userTagRes = await getUserTagInfo();
      if (!userTagRes?.is_newbie) {
        void message.warning(t('newbie-tip'));
        return;
      }
    }

    if (group.product_category === TopCategoryEnum.ONCHAIN) {
      setShowStakeModal(true);
      return;
    }

    setShowModal(true);
  };

  return (
    <>
      <div
        className="relative min-h-[56px] md:grid grid-cols-[2fr_2fr_3fr_1fr] gap-4 text-text-primary text-sm font-normal md:py-4
        after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-[98%] after:h-px after:bg-line-divider-primary ">
        <div className="flex justify-start items-center gap-1 pl-7">
          {group.product_category === TopCategoryEnum.SAVING
            ? t('saving-title')
            : group.product_category === TopCategoryEnum.ONCHAIN
              ? t('earn.onchain')
              : group.product_category === TopCategoryEnum.SIMPLE
                ? t('earn.simple')
                : ''}
        </div>
        <div
          className="text-base h-6 mb-6 md:mb-0 mt-10 md:mt-0 pb-2 md:h-auto flex justify-between md:justify-start items-center border-b md:border-none border-b-line-border-default md:pt-2">
          <div className="flex justify-start items-center gap-1">
            <span className="md:hidden">{t('saving-title')}</span>
            <ProductTag prd={selectedProduct} />
          </div>
          <span className="md:leading-5 text-text-brand-default md:text-text-primary">
            {aprDisplay}
          </span>
        </div>
        <div className="flex justify-start items-center flex-wrap">
           {termText}
        </div>
        <div className="flex justify-end items-center mt-6 md:mt-0">
          <div
            className={`w-full md:w-fit md:min-w-[100px] select-none h-8 px-[22px] text-nowrap flex items-center justify-center rounded-lg
                ${
              +selectedProduct?.allow_invest_quota === 0
                ? 'cursor-not-allowed bg-fill-button-primary-disabled text-text-tertiary'
                : 'cursor-pointer bg-text-brand-default-web hover:bg-fill-button-brand-hover'
            }`}
            onClick={handleSubscribe}
          >
            {+selectedProduct?.allow_invest_quota === 0
              ? t('sold-out')
              : t('subscribe')}
          </div>
        </div>
      </div>
      <SubscribeModal
        open={showModal}
        group={group}
        defaultProductId={selectedProduct.id}
        close={() => setShowModal(false)}
      />
      <StakeModal
        open={showStakeModal}
        group={group}
        defaultProductId={selectedProduct.id}
        close={() => setShowStakeModal(false)}
      />
    </>
  );
});

PrdGroup.displayName = 'PrdGroup';

export default PrdGroup;
