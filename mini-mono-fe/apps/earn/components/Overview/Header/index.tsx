import React, { useEffect, useState, useMemo } from 'react';
import {
  basePath,
  goPage, isMobile,
  normalizeLocale
} from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { type MenuProps } from 'antd';
import { useRouter } from 'next/router';
import { useEarnValuation } from '~/hooks/useEarnValuation';
import { EarnHeaderLayout, AssetValuationItem } from '~/components/Common/EarnHeaderLayout';
import { useWalletList } from '~/context/WalletListContext';
import CoinSelector from '~/components/Common/CoinSelector';

const OverviewHeader: React.FC = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { locale } = useRouter();
  const { assetsList, loading } = useWalletList();

  const [showAssets, setShowAssets] = useState(true);
  const [selectCoin, setSelectCoin] = useState<string>('USDT');
  const [isH5, setIsH5] = useState(false);

  useEffect(() => {
    setIsH5(!!isMobile());
  }, []);

  const valuationAssets = useMemo(() => {
    return assetsList.map((asset) => ({
      coin: asset.coin,
      balance: asset.wallet_balance,
      totalPnl: asset.total_pnl
    }));
  }, [assetsList]);

  const { valuation } = useEarnValuation(valuationAssets);

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
      fiatAsset: `${valuation.fiat.symbol} ${valuation.fiat.asset}`,
      fiatPnl: `${valuation.fiat.symbol} ${valuation.fiat.pnl}`
    };
  }, [selectCoin, valuation]);

  const isHideFiat = useMemo(() => {
     return +displayData.asset === 0 && +displayData.pnl === 0;
  }, [displayData.asset, displayData.pnl]);

  return (
    <EarnHeaderLayout
      title={t('finance-overview')}
      subTitle={t('finance-overview-sub-title')}
      animationLoopSrc={`${basePath}/images/overview-loop.mp4`}
      valuationSection={
        <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center justify-start md:gap-[88px]">
          <AssetValuationItem
            label={t('asset-valuation')}
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
            label={t('finance-pnl')}
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
        <div className="hidden md:flex gap-4 mt-4 md:mt-8">
          {isLogin ? (
            <>
              <button
                className="min-w-[188px] text-sm bg-fill-button-primary-default hover:bg-fill-button-primary-hover text-text-white-to-black font-medium px-4 py-2 md:py-3 rounded-lg cursor-pointer"
                onClick={() => goPage('financeOrder')}
              >
                {t('history')}
              </button>
              <button
                className="min-w-[188px] text-sm bg-fill-button-brand-default hover:bg-fill-button-brand-hover text-text-white-to-black font-medium px-4 py-2 md:py-3 rounded-lg cursor-pointer"
                onClick={() => goPage('financeAcc')}
              >
                {t('account')}
              </button>
            </>
          ) : (
            <button
              className="w-full md:w-auto min-w-[188px] text-sm bg-fill-button-primary-default hover:bg-fill-button-brand-hover text-text-white-to-black font-medium px-4 py-3 rounded-lg cursor-pointer"
              onClick={() => goPage('login')}
            >
              {t('login-look')}
            </button>
          )}
        </div>
      }
    />
  );
};

export default OverviewHeader;
