import React, { useState, memo } from 'react';
import { CategoryEnum, TagEnum } from '~/enums';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as SelectCornIcon } from '~/public/images/select-corner.svg';
import { ProductGroupProps, ProductProps } from '~/interface';
import SubscribeModal from '~/components/Common/SubscribeModal';
import { formatApr } from '~/utils';
import dayjs from 'dayjs';
import { message } from 'antd';
import ProductTag from '~/components/Common/ProductTag';
import { getUserTagInfo } from '~/api';
import { goPage, isMobile } from '@better-bit-fe/base-utils';
import { TIME_FORMAT } from '~/constants';

interface PrdGroupComponentProps {
  group: ProductGroupProps;
}

const SavingsPrdGroup = memo(({ group }: PrdGroupComponentProps) => {
  const t = useFm();

  const [selectedProduct, setSelectedProduct] = useState<ProductProps>(
    group.product_item[0]
  );
  const [showModal, setShowModal] = useState(false);


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
       setShowModal(true);
       return;
    }

    if (+selectedProduct.allow_invest_quota === 0) {
      void message.warning(t('no-left-tip'));
      return;
    }

    const now = dayjs().unix();

    if (now < selectedProduct.subscribe_start_at) {
       void message.warning(t('subscribe-start-tip', {date: dayjs(selectedProduct.subscribe_start_at * 1000).format(TIME_FORMAT)}));
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


    setShowModal(true);
  };

  const handleSelectProduct = (product: ProductProps) => {
    setSelectedProduct(product);
  };

  return (
    <>
      <div className="min-h-[60px] md:grid grid-cols-[1fr_2fr_3fr_1fr] gap-4 text-text-primary text-sm font-medium leading-[50px] md:my-5">
        <div />
        <div className="text-base h-6 mb-6 md:mb-0 mt-10 md:mt-0 pb-2 md:h-auto flex justify-between md:justify-start items-center md:items-start border-b md:border-none border-b-line-border-default md:pt-2">
          <div className="flex justify-start items-center gap-1">
            <span className="md:hidden">{t('saving-title')}</span>
            <ProductTag prd={selectedProduct} />
          </div>
          <span className="md:leading-5 text-text-brand-default md:text-text-primary font-normal">
            {selectedProduct.category === CategoryEnum.FIXED
              ? formatApr(selectedProduct.fixed_apr)
              : `${formatApr(selectedProduct.min_apr)} ~
              ${formatApr(selectedProduct.max_apr)}`}
          </span>
        </div>
        <div className="flex justify-start items-start flex-wrap gap-2">
          {group.product_item.map((item: ProductProps) => {
            const isActive = item.id === selectedProduct.id;
            return (
              <div
                key={item.id}
                className={`relative min-w-[54px] h-11 px-2 cursor-pointer flex items-center justify-center bg-bg-secondary border rounded-lg overflow-hidden
                ${
                  isActive
                    ? 'border-text-brand-default'
                    : 'border-line-border-default'
                }`}
                onClick={() => handleSelectProduct(item)}
              >
                {item.category === CategoryEnum.LIQUID
                  ? t('liquid')
                  : item.duration_days}
                {isActive && (
                  <SelectCornIcon className="absolute bottom-0 right-0 w-5 h-5" />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end items-start mt-6 md:mt-0">
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
    </>
  );
});

SavingsPrdGroup.displayName = 'SavingsPrdGroup';

export default SavingsPrdGroup;
