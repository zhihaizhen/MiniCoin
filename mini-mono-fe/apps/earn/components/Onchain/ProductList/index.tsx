import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as MoreIcon } from '~/public/images/more.svg';
import { ReactComponent as LessIcon } from '~/public/images/less.svg';
import { getProductList } from '~/api';
import EmptyState from '~/components/Common/EmptyState';
import Loading from '~/components/Common/Loading';
import OnchainProductItem, { FlatItemProps } from '~/components/Onchain/ProductItem';
import { ProductGroupProps, ProductProps } from '~/interface';
import CoinSearchSelect from '~/components/Common/CoinSearchSelect';

const OnchainProductList: React.FC = () => {
  const t = useFm();

  const [productList, setProductList] = useState<FlatItemProps[]>([]);
  const [searchCoinSymbol, setSearchCoinSymbol] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMore, setIsMore] = useState<boolean>(false);

  const fetchProductList = useCallback(async () => {
    const params = {
      top_category: 'STAKING_ONCHAIN',
      coin: searchCoinSymbol
    };

    setIsLoading(true);
    try {
      const res = await getProductList(params);
      const list = Array.isArray(res?.list) ? res.list : [];

      const flattenedList: FlatItemProps[] = list.flatMap((coinItem: any) =>
        coinItem.product_collections.flatMap((group: ProductGroupProps) =>
          group.product_item.map((product: ProductProps) => ({
            ...product,
            group,
          }))
        )
      );

      setProductList(flattenedList);
    } finally {
      setIsLoading(false);
    }
  }, [searchCoinSymbol]);

  useEffect(() => {
    void fetchProductList();
  }, [fetchProductList]);

  const renderProductList = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (!productList.length) {
      return <EmptyState />;
    }

    const displayList = isMore ? productList : productList.slice(0, 10);
    return displayList.map((item: FlatItemProps, index: number) => (
      <OnchainProductItem key={`${item.id}-${index}`} prd={item} />
    ));
  };

  return (
    <div className="w-full mt-6 md:mt-0">

      <div className="flex flex-col md:flex-row md:justify-between items-center gap-5 md:gap-10">
        <div className="text-text-primary text-2xl font-bold leading-[52px] text-center md:text-left">
          {t('all-product', '全部产品')}
        </div>

        <CoinSearchSelect onChange={setSearchCoinSymbol} />
      </div>

      <div className="grid h-[50px] grid-cols-2 md:grid-cols-[2fr_3fr_1fr] gap-4 text-text-tertiary text-xs font-medium leading-[50px] mt-6">
        <div>{t('coin')}</div>
        <div className="text-right md:text-left">{t('referApr')}</div>
        <div className="text-right hidden md:block">{t('action', '操作')}</div>
      </div>

      {renderProductList()}

      {productList?.length > 10 && (
        <div className="flex justify-center items-center text-sm text-text-brand-default-web mt-6">
          <div
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setIsMore((visible) => !visible)}
          >
            {!isMore ? (
              <>
                {t('more')} <MoreIcon className="text-xl" />
              </>
            ) : (
              <>
                {t('hide')} <LessIcon className="text-xl" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnchainProductList;
