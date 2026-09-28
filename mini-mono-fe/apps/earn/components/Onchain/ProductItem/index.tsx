import React, { useMemo, useState, memo } from 'react';
import Image from 'next/image';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { ProductGroupProps, ProductProps } from '~/interface';
import { formatApr } from '~/utils';
import { CategoryEnum, TagEnum } from '~/enums';
import ProductTag from '~/components/Common/ProductTag';
import StakeModal from '~/components/Common/StakeModal';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { goPage, isMobile } from '@better-bit-fe/base-utils';
import dayjs from 'dayjs';
import { message } from 'antd';
import { getUserTagInfo } from '~/api';
import { TIME_FORMAT } from '~/constants';

export interface FlatItemProps extends ProductProps {
  group: ProductGroupProps;
}

interface OnchainProductItemProps {
  prd: FlatItemProps;
}

const OnchainProductItem = memo(({ prd }: OnchainProductItemProps) => {
  const t = useFm();
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

    if (+prd.allow_invest_quota === 0) {
      void message.warning(t('no-left-tip'));
      return;
    }

    const now = dayjs().unix();

    if (now < prd.subscribe_start_at) {
      void message.warning(
        t('subscribe-start-tip', {
          date: dayjs(prd.subscribe_start_at * 1000).format(
            TIME_FORMAT
          ),
        })
      );
      return;
    }

    if (now > prd.subscribe_end_at) {
      void message.warning(t('subscribe-end'));
      return;
    }

    if (prd.product_tag === TagEnum.NEWBIE) {
      const userTagRes = await getUserTagInfo();
      if (!userTagRes?.is_newbie) {
        void message.warning(t('newbie-tip'));
        return;
      }
    }
    setShowModal(true);
  };

  const aprDisplay = useMemo(() => {
    if (prd.category === CategoryEnum.FIXED) {
      return formatApr(prd.fixed_apr);
    }
    return prd.min_apr === prd.max_apr ? formatApr(prd.min_apr) : `${formatApr(prd.min_apr)} ~ ${formatApr(prd.max_apr)}`;
  }, [prd]);

  const handleRowClick = () => {
    if (isMobile()) {
      goPage('download');
      return;
    }
  }

  return (
    <div>
      <div className="min-h-[60px] py-4 px-2 mb-3 flex justify-between items-center md:grid grid-cols-[2fr_3fr_1fr] gap-4 text-text-primary text-base font-medium
        rounded-lg hover:bg-(--fill-fill-hover-1,#F5F5F5)" onClick={handleRowClick}>
        <div className="flex justify-start items-center gap-2 text-base font-bold">
          <Image
            src={getSymbolUrl(prd.coin)}
            alt={prd.coin}
            width={24}
            height={24}
            loader={({ src }) => src}
          />
          <div className="flex items-center gap-1">
            <span>{prd.coin}</span>
            <ProductTag prd={prd} />
          </div>
        </div>
        <div className="block font-base">{aprDisplay}</div>
        <div className="hidden md:flex justify-end">
          <div
            className={`min-w-[100px] w-fit h-8 select-none px-[22px] flex items-center text-sm font-medium justify-center cursor-pointer rounded-lg text-nowrap
             ${
               +prd?.allow_invest_quota === 0
                 ? 'bg-fill-button-primary-disabled text-text-tertiary'
                 : 'bg-text-brand-default-web hover:bg-fill-button-brand-hover text-black'
             }`}
            onClick={handleSubscribe}
          >
            {+prd?.allow_invest_quota === 0 ? t('sold-out') : t('stake-now')}
          </div>
        </div>
      </div>
      <StakeModal
        open={showModal}
        group={prd.group}
        defaultProductId={prd.id}
        close={() => setShowModal(false)}
      />
    </div>
  );
});
OnchainProductItem.displayName = 'OnchainProductItem';
export default OnchainProductItem;
