import React, { useEffect, useState, useMemo } from 'react';
import {
  basePath,
  goPage, isMobile,
  normalizeLocale
} from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { ReactComponent as ShareIcon } from '~/public/images/share.svg';
import { getPositionList } from '~/api';
import { type MenuProps } from 'antd';
import { useRouter } from 'next/router';
import ReferralShareModal from '~/components/Simple/ReferralShareModal';
import { IPositionGroup } from '~/interface';
import { useEarnValuation } from '~/hooks/useEarnValuation';
import { EarnHeaderLayout, AssetValuationItem } from '~/components/Common/EarnHeaderLayout';
import CoinSelector from '~/components/Common/CoinSelector';


const Header: React.FC = () => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { locale } = useRouter();

  const [positionList, setPositionList] = useState<IPositionGroup[]>([]);
  const [showAssets, setShowAssets] = useState(true);
  const [selectCoin, setSelectCoin] = useState<string>('USDT');
  const [loading, setLoading] = useState(true);
  const [isH5, setIsH5] = useState(false);

  useEffect(() => {
    setIsH5(!!isMobile());
  }, []);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
    getPositionList({ 'top_category': 'SIMPLE_EARN' })
      .then((res) => {
        const positionList = Array.isArray(res?.list) ? res?.list : [];
        setPositionList(positionList)
      })
      .catch(() => setPositionList([]))
      .finally(() => setLoading(false));
  }, [isLogin]);

  const handleSelectAsset: MenuProps['onClick'] = (e) => {
    const value = e.key as string;
    if (value === 'more') {
      const lang = normalizeLocale(locale);
      window.location.href = `/${lang}/setting/basic`;
      return;
    }
    setSelectCoin(value);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
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
     return +displayData.pnl === 0 && +displayData.yesterdayPnl === 0;
  }, [displayData.pnl, displayData.yesterdayPnl]);
  return (
    <>
      <EarnHeaderLayout
        title={t('simple-title')}
        subTitle={t('simple-sub-title')}
        animationLoopSrc={`${basePath}/images/simple.mp4`}
        valuationSection={
          <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center justify-start md:gap-[88px]">
            <AssetValuationItem
              label={t('pnl-total')}
              extraLabelContent={
                <CoinSelector
                  selectCoin={selectCoin}
                  handleSelectAsset={handleSelectAsset}
                  showAssets={showAssets}
                  setShowAssets={setShowAssets}
                />
              }
              value={isLogin ? showAssets ? displayData.pnl : '****' : '-'}
              fiatValue={isLogin ? isHideFiat ? '' :showAssets ? `≈ ${displayData.fiatPnl}` : '****' : '-'}
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
          </div>
        }
        actionButtons={
          <div className="w-full md:w-auto flex flex-row-reverse md:flex-row gap-3 md:gap-4 mt-4 md:mt-8">
            <button
              className="w-10 md:w-12 h-10 md:h-12 text-base flex items-center justify-center bg-fill-button-primary-default hover:bg-fill-button-primary-hover text-text-white-to-black font-medium rounded-lg md:rounded-xl cursor-pointer"
              onClick={handleShare}
            >
              <ShareIcon />
            </button>
            <button
              className="min-h-10 flex-1 min-w-[188px] text-sm bg-fill-button-primary-default hover:bg-fill-button-primary-hover text-text-white-to-black font-medium px-4 py-2 md:py-3 rounded-lg md:rounded-lg cursor-pointer"
              onClick={() => goPage('financeAcc', 'tab=SIMPLE_EARN')}
            >
              {t('view-earnings')}
            </button>
          </div>
        }
      />

      <ReferralShareModal
        modalOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>

  );
};

export default Header;
