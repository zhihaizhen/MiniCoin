import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useRouter } from 'next/router';
import { Select } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as MoreIcon } from '~/public/images/more.svg';
import { ReactComponent as LessIcon } from '~/public/images/less.svg';
import { ReactComponent as SuffixIcon } from '~/public/images/select-suffix.svg';
import { CategoryEnum } from '~/enums';
import { getCoinAssets, getProductList } from '~/api';
import ProductItem, { ItemProps } from '~/components/Overview/ProductItem';
import EmptyState from '~/components/Common/EmptyState';
import Loading from '~/components/Common/Loading';
import CoinSearchSelect from '~/components/Common/CoinSearchSelect';
import { useUserInfo } from '@better-bit-fe/base-provider';


const CATEGORY_OPTIONS = [
  {
    label: 'all-category',
    value: CategoryEnum.ALL
  },
  {
    label: 'liquid',
    value: CategoryEnum.LIQUID
  },
  {
    label: 'fixed',
    value: CategoryEnum.FIXED
  }
];

const OverviewProductList: React.FC = () => {
  const t = useFm();
  const { query, isReady } = useRouter();
  const { isLogin } = useUserInfo();

  const [selectedCategory, setSelectedCategory] = useState<CategoryEnum>(
    CategoryEnum.ALL
  );
  const [productList, setProductList] = useState<ItemProps[]>([]);
  const [coinAssetMap, setCoinAssetMap] = useState<Map<string, number>>(
    new Map()
  );
  const [searchCoinSymbol, setSearchCoinSymbol] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMore, setIsMore] = useState<boolean>(false);

  useEffect(() => {
    if (!isReady) return;
    const duration = query.duration as string;
    if (Object.values(CategoryEnum).includes(duration as CategoryEnum)) {
      setSelectedCategory(duration as CategoryEnum);
    }
  }, [isReady, query.duration]);

  const categorySelectOptions = useMemo(
    () =>
      CATEGORY_OPTIONS.map((item) => ({
        label: t(item.label),
        value: item.value,
        key: item.value
      })),
    [t]
  );

  const handleCategoryChange = (value: CategoryEnum) => {
    setSelectedCategory(value);
  };

  const fetchProductList = useCallback(async () => {
    const params = {
      duration: selectedCategory,
      coin: searchCoinSymbol
    };

    setIsLoading(true);
    try {
      const res = await getProductList(params);
      setProductList(Array.isArray(res?.list) ? res.list : []);
    } finally {
      setIsLoading(false);
    }
  }, [searchCoinSymbol, selectedCategory]);

  useEffect(() => {
    void fetchProductList();
  }, [fetchProductList]);

  useEffect(() => {
    if (!isLogin) {
      setCoinAssetMap(new Map());
      return;
    }
    let cancelled = false;
    (async () => {
      const coinAssets = await getCoinAssets();
      const assetList = Array.isArray(coinAssets) ? coinAssets : [];
      if (cancelled) return;
      setCoinAssetMap(
        new Map(assetList.map((asset) => [asset.tokenId, Number(asset.free)]))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [isLogin]);

  const displayProductList = useMemo(() => {
    if (!coinAssetMap.size) return productList;
    return productList.map((prd) =>
      coinAssetMap.has(prd.coin)
        ? { ...prd, spot_amount: coinAssetMap.get(prd.coin) }
        : prd
    );
  }, [productList, coinAssetMap]);


  const renderProductList = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (!displayProductList.length) {
      return <EmptyState />;
    }

    const displayList = isMore
      ? displayProductList
      : displayProductList.slice(0, 10);
    return displayList.map((item: ItemProps, index: number) => (
      <ProductItem key={`${item.coin}-${index}`} prd={item} />
    ));
  };
  return (
    <div className="w-full mt-5 md:mt-10">

      <div className="text-text-primary text-2xl font-bold leading-[52px] text-center md:text-left">
        {t('all-product', '全部产品')}
      </div>

      <div className="mt-6 flex justify-between items-center gap-10">
        <Select
          className="w-40 md:w-[220px]"
          size="large"
          suffixIcon={<SuffixIcon />}
          options={categorySelectOptions}
          value={selectedCategory}
          onChange={handleCategoryChange}
        />

        <CoinSearchSelect onChange={setSearchCoinSymbol} className="w-40 md:w-[220px]" />
      </div>

      <div className="hidden md:grid h-[50px] grid-cols-[2fr_2fr_3fr_1fr] gap-4 text-text-tertiary text-xs font-medium leading-[50px] mt-6">
        <div>{t('coin')}</div>
        <div>{t('referApr')}</div>
        <div>{t('term')}</div>
        <div className="text-right">{t('manage')}</div>
      </div>

      {renderProductList()}

      {displayProductList?.length > 10 && (
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

export default OverviewProductList;
