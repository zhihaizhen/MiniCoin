import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {basePath, goPage, isMobile, normalizeLocale } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { type MenuProps } from 'antd';
import { useRouter } from 'next/router';
import { EarnHeaderLayout, AssetValuationItem } from '~/components/Common/EarnHeaderLayout';
import CoinSelector from '~/components/Common/CoinSelector';
import { ReactComponent as FrameIcon } from '~/public/images/loan/frame.svg';
import { ReactComponent as CheckIcon } from '~/public/images/loan/check.svg';
import { FormattedMessage } from 'react-intl';
import { type LoanAsset, useLoanCoinData } from '~/context/LoanCoinDataContext';
import useFiatInfo from '~/hooks/useFiatInfo';
import BigNumber from 'bignumber.js';
import useSpotMarket from '~/hooks/useSpotMarket';
import { ReactComponent as EyeOpenIcon } from '~/public/images/eye-open.svg';
import { ReactComponent as EyeCloseIcon } from '~/public/images/eye-close.svg';

const EMPTY_ASSETS: LoanAsset[] = [];

const Header: React.FC<{ headerStyle?: 'default' | 'second' }> = ({ headerStyle }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { userFiatInfo } = useFiatInfo();
  const { locale } = useRouter();

  const [showAssets, setShowAssets] = useState(true);
  const [selectCoin, setSelectCoin] = useState<string>('USDT');
  const [isH5, setIsH5] = useState(false);
  const {
    sourceBorrowCoinList,
    sourcePledgeCoinList,
    isLoading,
    loanAssetOverview,
    isAssetOverviewLoading
  } = useLoanCoinData();

  const currentLoanNum = loanAssetOverview.running_order_count || 0;
  const overdueLoanNum = loanAssetOverview.overdue_order_count || 0;
  const borrowAssets = loanAssetOverview.borrow_assets || EMPTY_ASSETS;
  const pledgeAssets = loanAssetOverview.pledge_assets || EMPTY_ASSETS;


  const handleSelectAsset: MenuProps['onClick'] = (e) => {
    const value = e.key as string;
    if (value === 'more') {
      const lang = normalizeLocale(locale);
      window.location.href = `/${lang}/setting/basic`;
      return;
    }
    setSelectCoin(value);
  };

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

    if (!sourceBorrowCoinList || !sourcePledgeCoinList || !borrowAssets || !pledgeAssets || !userFiatInfo) {
      return null;
    }
    const btcPrice = getPriceInUsdt('BTC');
    const isBtc = selectCoin === 'BTC';
    const decimal = userFiatInfo.display_fiat_decimal;
    const fiatSymbol = userFiatInfo.fiat_symbol;
    // Calculate total loan assets value
    let totalLoanUsdtValue = new BigNumber(0);
    borrowAssets.forEach((asset) => {
      const amount = new BigNumber(asset.amount || 0);
      const price = new BigNumber(getPriceInUsdt(asset.coin.toLocaleUpperCase()));
      totalLoanUsdtValue = totalLoanUsdtValue.plus(amount.multipliedBy(price));
    });

    // Calculate total pledge assets value
    let totalPledgeUsdtValue = new BigNumber(0);
    pledgeAssets.forEach((asset) => {
      const amount = new BigNumber(asset.amount || 0);
      const price = new BigNumber(getPriceInUsdt(asset.coin.toLocaleUpperCase()));
      totalPledgeUsdtValue = totalPledgeUsdtValue.plus(amount.multipliedBy(price));
    });

    const totalLoanValue = isBtc ? totalLoanUsdtValue.div(btcPrice) : totalLoanUsdtValue;
    const totalLoan = totalLoanValue.decimalPlaces(8).toFormat();
    const totalLoanFiatValue = totalLoanUsdtValue.multipliedBy(userFiatInfo?.rate || 1);

    return {
      totalLoan: totalLoanValue.isGreaterThan(0) ? `-${totalLoan}` : totalLoan,
      totalLoanFiat:  `${fiatSymbol} ${totalLoanFiatValue.isGreaterThan(0) ? '-' : ''}${totalLoanFiatValue.decimalPlaces(decimal).toFormat()}`,
      totalPledge: isBtc ? totalPledgeUsdtValue.div(btcPrice).decimalPlaces(8).toFormat() : totalPledgeUsdtValue.decimalPlaces(8).toFormat(),
      totalPledgeFiat: `${fiatSymbol} ${totalPledgeUsdtValue.multipliedBy(userFiatInfo?.rate || 1).decimalPlaces(decimal).toFormat()}`
    };
  }, [sourceBorrowCoinList, sourcePledgeCoinList, borrowAssets, pledgeAssets, userFiatInfo, getPriceInUsdt, selectCoin]);

  const isHideFiat = useMemo(() => {
    return +displayData?.totalLoan === 0 && +displayData?.totalPledge === 0;
  }, [displayData?.totalLoan, displayData?.totalPledge]);

  useEffect(() => {
    setIsH5(!!isMobile());
  }, []);

  const isSecondHeader = headerStyle === 'second';
  const actionButtonWidthClass = isSecondHeader ? 'min-w-[178px] py-2 rounded-lg' : 'min-w-[188px] py-2 md:py-3 rounded-lg';
  const actionButtonBaseClass = `${actionButtonWidthClass} text-sm text-text-white-to-black font-medium px-4 cursor-pointer`;
  const loggedInActionButtons = [
    {
      key: 'history',
      label: t('history'),
      page: 'loanBorrowHistory',
      className: `${actionButtonBaseClass} bg-fill-button-primary-default hover:bg-fill-button-primary-hover`
    },
    {
      key: isSecondHeader ? 'earn-account' : 'in-progress',
      label: isSecondHeader ? t('earn-acc') : t('in-progress'),
      page: isSecondHeader ? 'financeAcc' : 'loanPersonal',
      className: `${actionButtonBaseClass} bg-fill-button-brand-default hover:bg-fill-button-brand-hover`
    }
  ];

  const onIntroduce = () => {
    // setShowAssets(!showAssets);
    console.log('introduce →');
  };

  return (
    <EarnHeaderLayout
      title={
        <p className={headerStyle === 'second' && 'mt-6'}>
           {t('earn.loan')}
           {
              headerStyle !== 'second' &&
              <a
                className="text-text-brand-default text-base font-normal inline-flex justify-start items-center ml-6 gap-[10px]"
                href={t('earn-loan-introduce')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FrameIcon /> {t('loan.introduce')}
              </a>
          }
        </p>
      }
      subTitle={
        <div className="flex flex-col text-white text-base font-normal gap-6">
          {t('earn.loan.subtitle')}
          <div className="flex gap-2 justify-start items-center">
            <div className={'flex justify-start items-center gap-2'}><CheckIcon /> {t('loan.subtip1')} </div>
            <div className={'flex justify-start items-center gap-2'}><CheckIcon /> {t('loan.subtip2')} </div>
            <div className={'flex justify-start items-center gap-2'}><CheckIcon /> {t('loan.subtip3')} </div>
            <div className={'flex justify-start items-center gap-2'}><CheckIcon /> {t('loan.subtip4')} </div>
          </div>
          {
            headerStyle === 'second' &&
            <a
              className="flex justify-center items-center w-[188px] h-12 bg-fill-button-brand-default hover:bg-fill-button-brand-hover text-text-white-to-black font-medium px-4 py-3 rounded-xl cursor-pointer"
              href={t('earn-loan-introduce')}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('loan.introduce')}
            </a>
          }
        </div>
      }
      animationIntroSrc={`${basePath}/images/loan/entry.mp4`}
      animationLoopSrc={`${basePath}/images/loan/loop.mp4`}
      valuationSection={
        <div className="w-full">
          <div className="w-full flex justify-between items-center text-text-secondary text-sm mb-4">
            <div>
              <FormattedMessage
                id="loan.currentRoom"
                values={{
                  num: overdueLoanNum > 0 ? <span className="text-red-500"> {t('loan.overdue_order_count', {num:overdueLoanNum})}</span> : currentLoanNum,
                  i: (chunks) => <span className="text-text-brand-default">{chunks}</span>
                }}
              />
            </div>
            {
              headerStyle === 'second' &&
              <div
                className="cursor-pointer text-base ml-1.5"
                onClick={() => setShowAssets(!showAssets)}
              >
                {showAssets ? <EyeOpenIcon /> : <EyeCloseIcon />}
              </div>
            }
          </div>
          <div
            className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center justify-start md:gap-[88px]">
            <AssetValuationItem
              label={t('loan.total')}
              extraLabelContent={
                <CoinSelector
                  isHideEye={headerStyle === 'second'}
                  selectCoin={selectCoin}
                  handleSelectAsset={handleSelectAsset}
                  showAssets={showAssets}
                  setShowAssets={setShowAssets}
                />
              }
              value={isLogin ? showAssets ? displayData?.totalLoan : '****' : '-'}
              fiatValue={isLogin ? isHideFiat ? '' : showAssets ? `≈ ${displayData?.totalLoanFiat}` : '****' : '-'}
              loading={isAssetOverviewLoading || isLoading}
              loadingClassName={headerStyle === 'second' ? "w-[120px]!" : ''}
            />

            <AssetValuationItem
              label={`${t('loan.totalpledge')}(${selectCoin})`}
              value={isLogin ? showAssets ? displayData?.totalPledge : '****' : '-'}
              fiatValue={isLogin ? isHideFiat ? '' : showAssets ? `≈ ${displayData?.totalPledgeFiat}` : '****' : '-'}
              loading={isH5 ? false : isAssetOverviewLoading}
              warpClassName="md:flex-col! flex-row!"
              labelClassName="w-auto! md:w-full!"
              valueClassName="text-xs md:text-lg text-text-brand-default-web! md:text-text-white!"
              loadingClassName={headerStyle === 'second' ? "w-[120px]!" : ''}
            />
          </div>
        </div>
      }
      actionButtons={
        <div className="hidden md:flex gap-4 mt-4 md:mt-8">
          {isLogin ? loggedInActionButtons.map(({ key, label, page, className }) => (
            <button
              key={key}
              className={className}
              onClick={() => goPage(page)}
            >
              {label}
            </button>
          )) : (
            <button
              className="w-full md:w-auto min-w-[188px] text-sm bg-fill-button-primary-default hover:bg-fill-button-brand-hover text-text-white-to-black font-medium px-4 py-3 rounded-lg cursor-pointer"
              onClick={() => goPage('login')}
            >
              {t('login-look')}
            </button>
          )}
        </div>
      }
      headerStyle={headerStyle}
    />
  );
};

export default Header;
