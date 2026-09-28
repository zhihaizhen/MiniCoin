import React, { useCallback, useMemo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { type LoanAsset, useLoanCoinData } from '~/context/LoanCoinDataContext';
import BigNumber from 'bignumber.js';
import { useUserInfo } from '@better-bit-fe/base-provider';
import Image from 'next/image';
import Loading from '~/components/Common/Loading';
import useSpotMarket from '~/hooks/useSpotMarket';

interface MarketAsset {
  coin: string;
  price?: string;
}

const EMPTY_ASSETS: LoanAsset[] = [];
type GetPriceInUsdt = (coin: string) => BigNumber;

interface AssetSectionProps {
  title: string;
  totalLabel: string;
  totalValue: string;
  assets: LoanAsset[];
  marketAssets: MarketAsset[];
  accentClassName: string;
  isLogin: boolean;
  getPriceInUsdt: GetPriceInUsdt;
  isShowMinus?: boolean;
}

const formatAmount = (value: string | number, decimal = 8) => (
  new BigNumber(value || 0).decimalPlaces(decimal).toString()
);

const getAssetValuation = (
  asset: LoanAsset,
  marketAssets: MarketAsset[],
  decimal = 8,
  getPriceInUsdt: GetPriceInUsdt
) => {
  const coinData = marketAssets.find((coin) => coin.coin === asset.coin);
  if (!coinData?.price) {
    return '0.0000';
  }

  return new BigNumber(asset.amount || 0)
    .multipliedBy(getPriceInUsdt(asset.coin.toLocaleUpperCase()))
    .decimalPlaces(decimal)
    .toString();
};

const getTotalValuation = (assets: LoanAsset[], getPriceInUsdt: GetPriceInUsdt) => (
  assets.reduce((total, asset) => {
    const price = new BigNumber(getPriceInUsdt(asset.coin.toLocaleUpperCase()));
    return total.plus(new BigNumber(asset.amount || 0).multipliedBy(price));
  }, new BigNumber(0))
);

const AssetSection: React.FC<AssetSectionProps> = ({
  title,
  totalLabel,
  totalValue,
  assets,
  marketAssets,
  accentClassName,
  isLogin,
  getPriceInUsdt,
  isShowMinus = false,
}) => {
  const t = useFm();

  return (
    <div className="w-full min-w-0">
      <div className="h-24 rounded-lg bg-bg-secondary flex flex-col justify-center items-center">
        <div className="text-text-tertiary text-sm">
          {totalLabel}
        </div>
        <div className="text-text-primary text-xl font-bold leading-7">
          {isLogin ? `≈ ${totalValue}` : '-'}
        </div>
      </div>

      <div className={`mt-4 pl-2 border-l-2 ${accentClassName} text-text-primary text-base font-medium`}>
        {title}
      </div>

      <div className="min-h-9 grid grid-cols-[1fr_1fr_1.15fr] gap-4 text-text-secondary text-xs font-medium
        border-b border-line-border-default mt-5 px-2">
        <div>{t('coin', '币种')}</div>
        <div>{t('amount', '数量')}</div>
        <div className="text-right">{t('valuation-usdt', '估值 (USDT)')}</div>
      </div>

      {!assets.length ? (
        <div className="h-[72px] flex items-center justify-center text-text-secondary text-sm">
          {t('no-data')}
        </div>
      ) : (
        assets.map((asset) => (
          <div
            key={asset.coin}
            className="grid grid-cols-[1fr_1fr_1.15fr] gap-4 items-center min-h-[60px] px-2 text-text-primary text-sm font-medium"
          >
            <div className="flex items-center gap-2 min-w-0 font-medium">
              <Image
                src={getSymbolUrl(asset.coin)}
                alt={asset.coin}
                width={24}
                height={24}
                loader={({ src }) => src}
              />
              <span className="truncate">{asset.coin}</span>
            </div>
            <div className="truncate">{isShowMinus ? '-' : ''}{formatAmount(asset.amount, 8)}</div>
            <div className="text-right truncate">{isShowMinus ? '-' : ''}{getAssetValuation(asset, marketAssets, 8, getPriceInUsdt)}</div>
          </div>
        ))
      )}
    </div>
  );
};

const LoanAssets: React.FC = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const {
    sourceBorrowCoinList,
    sourcePledgeCoinList,
    isLoading,
    loanAssetOverview,
    isAssetOverviewLoading
  } = useLoanCoinData();
  const loanAssets = loanAssetOverview.borrow_assets || EMPTY_ASSETS;
  const pledgeAssets = loanAssetOverview.pledge_assets || EMPTY_ASSETS;
  const { spotMarket } = useSpotMarket();

  const marketMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (spotMarket) {
      spotMarket.forEach((item) => {
        map[item.symbol] = String(item.lastPrice);
      });
    }
    return map;
  }, [spotMarket]);

   const getPriceInUsdt = useCallback(
    (coin: string) => {
      if (coin === 'USDT') return new BigNumber(1);
      const price = marketMap[`${coin}USDT`];
      return new BigNumber(price || 0);
    },
    [marketMap]
  );

  const displayData = useMemo(() => {

    if (!loanAssets || !pledgeAssets) {
      return null;
    }
    const totalLoanUsdtValue = getTotalValuation(loanAssets, getPriceInUsdt);
    const totalPledgeUsdtValue = getTotalValuation(pledgeAssets, getPriceInUsdt);

    return {
      totalBorrow: `${totalLoanUsdtValue.isGreaterThan(0) ? '-' : ''}${totalLoanUsdtValue.toString()}` ,
      totalPledge: totalPledgeUsdtValue.abs().toString()
    };
  }, [loanAssets, pledgeAssets, getPriceInUsdt]);


  return (
    <div className="max-w-[1200px] mx-auto md:py-10 px-4 md:px-0">
      {isAssetOverviewLoading || isLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-9 ">
          <AssetSection
            title={t('loan.liabilityAssets', '负债资产')}
            totalLabel={t('loan.totalLiabilityValuation', '总负债估值 (USDT)')}
            totalValue={displayData?.totalBorrow || '0.0000'}
            assets={loanAssets}
            marketAssets={sourceBorrowCoinList}
            accentClassName="border-red-500"
            isLogin={!!isLogin}
            getPriceInUsdt={getPriceInUsdt}
            isShowMinus={true}
          />
          <AssetSection
            title={t('loan.pledgeAssets', '质押资产')}
            totalLabel={t('loan.totalPledgeValuation', '总质押估值 (USDT)')}
            totalValue={displayData?.totalPledge || '0.0000'}
            assets={pledgeAssets}
            marketAssets={sourcePledgeCoinList}
            accentClassName="border-green-500"
            isLogin={!!isLogin}
            getPriceInUsdt={getPriceInUsdt}
          />
        </div>
      )}
    </div>
  );
};

export default LoanAssets;
