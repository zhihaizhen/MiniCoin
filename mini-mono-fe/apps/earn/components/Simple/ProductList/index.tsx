import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as MoreIcon } from '~/public/images/more.svg';
import { ReactComponent as LessIcon } from '~/public/images/less.svg';
import { ReactComponent as AutoEarnIcon } from '~/public/images/auto-earn.svg';
import { getPrivateSimleEarnList, getPublicSimleEarnList } from '~/api';
import EmptyState from '~/components/Common/EmptyState';
import Loading from '~/components/Common/Loading';
import SimpleProductItem from '~/components/Simple/ProductItem';
import AutoEarnModal from './AutoEarnModal';
import { ISimpleEarnProduct } from '~/interface';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { goPage } from '@better-bit-fe/base-utils';
import CoinSearchSelect from '~/components/Common/CoinSearchSelect';
import EarnTooltip from '~/components/Common/EarnTooltip';

const SimpleProductList: React.FC = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  const [productList, setProductList] = useState([]);
  const [searchCoinSymbol, setSearchCoinSymbol] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMore, setIsMore] = useState<boolean>(false);
  const [isAutoEarn, setIsAutoEarn] = useState<boolean>(false);

  const [modalConfig, setModalConfig] = useState<{
    open: boolean;
    type: 'all' | 'single';
    status: 'open' | 'close';
    product?: ISimpleEarnProduct;
  }>({
    open: false,
    type: 'all',
    status: 'close',
  });

  const fetchProductList = useCallback(async () => {
    const params = {
      coin: searchCoinSymbol
    };

    setIsLoading(true);
    try {
      const res = isLogin
        ? await getPrivateSimleEarnList(params)
        : await getPublicSimleEarnList(params);
      setProductList(Array.isArray(res?.list) ? res.list : []);
      setIsAutoEarn(!!res?.global_enabled);
    } finally {
      setIsLoading(false);
    }
  }, [searchCoinSymbol, isLogin]);

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
    return displayList.map((item: ISimpleEarnProduct, index: number) => (
      <SimpleProductItem
        key={`${item.coin}-${index}`}
        prd={item}
        onSwitch={(checked) => {
          if(!isLogin) {
            goPage('login')
            return;
          }
          setModalConfig({
            open: true,
            type: 'single',
            status: checked ? 'open' : 'close',
            product: item,
          });
        }}
      />
    ));
  };

  const handlAllAutoEarn = () => {
    if(!isLogin) {
      goPage('login')
      return;
    }
    setModalConfig({
      open: true,
      type: 'all',
      status: isAutoEarn ? 'close' : 'open',
    });
  };

  return (
    <div className="w-full">
      <AutoEarnModal
        {...modalConfig}
        onCancel={() => setModalConfig((prev) => ({ ...prev, open: false }))}
        onSuccess={() => {
          setModalConfig((prev) => ({ ...prev, open: false }));
          void fetchProductList();
        }}
      />
      <div className="text-text-primary text-2xl font-bold leading-[52px] text-center md:text-left">
        {t('all-product', '全部产品')}
      </div>

      <div className="mt-6 w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-10">

        <CoinSearchSelect onChange={setSearchCoinSymbol} />

        {
          productList.length > 0 &&
          <div className="w-full md:w-auto flex items-center justify-between md:justify-center py-2 px-2.5 border border-line-border-default rounded-lg cursor-pointer" onClick={handlAllAutoEarn}>
             <div className="flex items-center justify-start">
               <AutoEarnIcon />
               <EarnTooltip title={t('simple-earn-auto-tip')} titleClassName="text-white">
                  <div className="ml-2 text-text-primary text-sm font-medium underline
                    decoration-dashed
                    decoration-gray-300
                    underline-offset-4 cursor-pointer">{t('auto-earn')}</div>
              </EarnTooltip>
             </div>

            <div className={`ml-5 text-[10px] leading-5 font-medium px-1 rounded-sm ${isAutoEarn ? 'text-text-primary bg-text-brand-default-web' : 'text-text-secondary bg-fill-tag-gray'}`}>
              {isAutoEarn ? t('auto-enabled') : t('no-open')}
            </div>
          </div>
        }

      </div>

      <div className="hidden md:grid h-[50px] grid-cols-[2fr_3fr] gap-4 text-text-tertiary text-xs font-medium leading-[50px] mt-6">
        <div>{t('coin')}</div>
        <div className="flex items-center gap-14 md:grid grid-cols-[3fr_1fr] ">
           <div>{t('referApr')}</div>
           <div className="text-right">{t('auto-earn')}</div>
        </div>
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

export default SimpleProductList;
