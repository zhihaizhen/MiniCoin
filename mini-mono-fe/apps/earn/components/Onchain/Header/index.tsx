import React, { useEffect, useState, useMemo } from 'react';
import {
  basePath,
  goPage, isMobile,
  normalizeLocale
} from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getPositionList } from '~/api';
import { type MenuProps } from 'antd';
import { useRouter } from 'next/router';
import { IPositionGroup } from '~/interface';
import { useEarnValuation } from '~/hooks/useEarnValuation';
import { EarnHeaderLayout, AssetValuationItem } from '~/components/Common/EarnHeaderLayout';
import { useEarnDataRefresh } from '~/context/EarnDataContext';
import CoinSelector from '~/components/Common/CoinSelector';
import { TopCategoryEnum } from '~/enums';


const Header: React.FC = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { locale } = useRouter();
  const { refreshTrigger } = useEarnDataRefresh();

  const [positionList, setPositionList] = useState<IPositionGroup[]>([]);
  const [showAssets, setShowAssets] = useState(true);
  const [selectCoin, setSelectCoin] = useState<string>('USDT');
  const [loading, setLoading] = useState(true);
  const [isH5, setIsH5] = useState(false);

  useEffect(() => {
    setIsH5(!!isMobile());
  }, []);

  const valuationAssets = useMemo(() => {
    return positionList.map((group) => ({
      coin: group.coin,
      balance: group.all_position,
      totalPnl: (group.data || []).reduce(
        (sum, item) => sum + Number(item.total_pnl || 0),
        0
      ),
      yesterdayPnl: (group.data || []).reduce(
        (sum, item) => sum + Number(item.yesterday_pnl || 0),
        0
      )
    }));
  }, [positionList]);

  const { valuation } = useEarnValuation(valuationAssets);

  // 拉取数据
  useEffect(() => {
    if (!isLogin) {
      if (isLogin !== undefined) {
        setLoading(false);
      }
      setPositionList([]);
      return;
    }
    setLoading(true);
    getPositionList({ 'top_category': TopCategoryEnum.ONCHAIN })
      .then((res) => {
        const positionList = Array.isArray(res?.list) ? res?.list : [];
        setPositionList(positionList)
      })
      .catch(() => setPositionList([]))
      .finally(() => setLoading(false));
  }, [isLogin, refreshTrigger]);  //添加 refreshTrigger 依赖

  const handleSelectAsset: MenuProps['onClick'] = (e) => {
    const value = e.key as string;
    if (value === 'more') {
      const lang = normalizeLocale(locale);
      window.location.href = `/${lang}/setting/basic`;
      return;
    }
    setSelectCoin(value);
  };

  // 根据选择的币种返回数据
  const displayData = useMemo(() => {
    const isBtc = selectCoin === 'BTC';
    return {
      asset: isBtc ? valuation.btc.asset : valuation.usdt.asset,
      pnl: isBtc ? valuation.btc.pnl : valuation.usdt.pnl,
      yesterdayPnl: isBtc ? valuation.btc.yesterdayPnl : valuation.usdt.yesterdayPnl,
      fiatAsset: `${valuation.fiat.symbol} ${valuation.fiat.asset}`,
      fiatPnl: `${valuation.fiat.symbol} ${valuation.fiat.pnl}`,
      fiatYesterdayPnl: `${valuation.fiat.symbol} ${valuation.fiat.yesterdayPnl}`,
    };
  }, [selectCoin, valuation]);

  const isHideFiat = useMemo(() => {
     return +displayData.asset === 0 && +displayData.yesterdayPnl === 0 && +displayData.pnl === 0;
  }, [displayData.asset, displayData.pnl, displayData.yesterdayPnl]);

  return (
    <EarnHeaderLayout
      title={t('earn.onchain')}
      subTitle={t('onchain-sub-title')}
      animationLoopSrc={`${basePath}/images/onchain.mp4`}
      valuationSection={
        <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center justify-start md:gap-[88px]">
          <AssetValuationItem
            label={t('asset-total')}
            extraLabelContent={
              <CoinSelector
                selectCoin={selectCoin}
                handleSelectAsset={handleSelectAsset}
                showAssets={showAssets}
                setShowAssets={setShowAssets}
              />
            }
            value={isLogin ? showAssets ? displayData.asset : '****' : '-'}
            fiatValue={isLogin ? isHideFiat ? '' : showAssets ? `≈ ${displayData.fiatAsset}` : '****' : '-'}
            loading={loading}
            showRightIcon
            onRightClick={() => goPage('financeAcc')}
          />

          <AssetValuationItem
            label={t('pnl-yesterday')}
            value={isLogin ? showAssets ? displayData.yesterdayPnl : '****' : '-'}
            fiatValue={isLogin ? isHideFiat ? '' : showAssets ? `≈ ${displayData.fiatYesterdayPnl}` : '****' : '-'}
            loading={isH5 ? false : loading}
            warpClassName="md:flex-col! flex-row!"
            labelClassName="w-auto! md:w-full!"
            valueClassName="text-xs md:text-lg text-text-brand-default-web! md:text-text-white!"
          />

          <AssetValuationItem
            label={t('pnl-total')}
            value={isLogin ? showAssets ? displayData.pnl : '****' : '-'}
            fiatValue={isLogin ? isHideFiat ? '' : showAssets ? `≈ ${displayData.fiatPnl}` : '****' : '-'}
            loading={isH5 ? false : loading}
            warpClassName="md:flex-col! flex-row!"
            labelClassName="w-auto! md:w-full!"
            valueClassName="text-xs md:text-lg text-text-brand-default-web! md:text-text-white!"
          />
        </div>
      }
      actionButtons={
        <div className="w-full md:w-auto min-w-[188px] flex flex-row-reverse md:flex-row gap-3 md:gap-4 mt-4 md:mt-8">
          <button
            className="min-h-10 flex-1 min-w-40 text-sm bg-fill-button-primary-default hover:bg-fill-button-primary-hover text-text-white-to-black font-medium px-4 py-2 md:py-3 rounded-lg cursor-pointer"
            onClick={() => goPage('financeAcc', 'tab=STAKING_ONCHAIN')}
          >
            {t('view-earnings')}
          </button>
        </div>
      }
    />
  );
};

export default Header;
