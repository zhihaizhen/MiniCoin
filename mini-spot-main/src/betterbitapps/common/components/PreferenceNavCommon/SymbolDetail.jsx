import { Tooltip } from 'antd';
import cls from 'classnames';
import BigNumber from 'bignumber.js';
import { toThousandsNumber } from 'common/utils/utils';
import BookSymbol from 'common/components/BookSymbol';
import CoinsIcon from 'common/global/CoinsIcon';
import { TRADE_THEMES } from 'common/packages-biz/global-settings';
import useCurSymbolQuoteStream from 'common/public-ws/stream-hooks/use-instrument-stream';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@/store';
import ScrollBlock from '../ScrollBlock';
import Style from './symbolDetail.module.less';

const SymbolDetail = ({ theme }) => {
  const { t, i18n } = useTranslation();
  const [globalState] = useGlobalState();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const {
    coin,
    walletCoin,
    symbolFullName,
    user,
  } = globalState;

  const {
    exchangeRate: { rate, currencyCode },
  } = user;
  const {
    volume24h,
    closePrice,
    formattedClosePrice,
    changeRate24h,
    formattedHighPrice24h,
    formattedLowPrice24h,
    formattedVolume24h,
    formattedTurnover24h,
  } = useCurSymbolQuoteStream();

  const fiat = useMemo(() => {
    return BigNumber(closePrice)
      .multipliedBy(rate)
      .toFixed(2, BigNumber.ROUND_FLOOR);
  }, [rate, closePrice]);

  const detailFields = [
    {
      label: formattedClosePrice,
      data: `≈${toThousandsNumber(fiat, 2)} ${currencyCode}`,
      labelClassName: Style['last-price'],
      isShow: true,
    },
    {
      label: t('24hChange'),
      data: `${changeRate24h > 0 ? '+' : ''}${changeRate24h}%`,
      contentClassName: !(changeRate24h > 0) ? 'short' : 'long',
      isShow: true,
    },
    { label: t('24hHigh'), data: formattedHighPrice24h, isShow: true, },
    { label: t('24hLow'), data: formattedLowPrice24h, isShow: true, },

    // 24小时成交额(币种)
    {
      label: `${t('24hVolume')}(${coin})`,
      data: formattedVolume24h,
      isShow: true,
    },
    // 24小时成交额(USDT)
    {
      label: `${t('24hVolume')}(${walletCoin})`,
      data: formattedTurnover24h,
      isShow: true,
    },
    // 币种标签
    {
      label: t('symbolTag'),
      data: t('tag-0fee'),
      contentClassName: Style['icon-0fee'],
      isShow: symbolFullName === 'USD1/USDT',
    },
  ];

  const currentSymbol = (
    <Tooltip
      title={ <BookSymbol  defaultActiveTab='all' /> }
      trigger="hover"
      // trigger="click"
      placement="bottomLeft"
      overlayClassName={Style['symbol-list__drop-down']}
      open={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
    >
      <div
        className={Style['symbol-list-container']}
        data-coachmark-step="symbol-select"
      >
        <CoinsIcon
          size={24}
          coin={coin?.toLowerCase()}
          className={Style['symbol-icon']}
          theme={theme}
        />
        <div>
          <div className={cls(Style.symbols, isTooltipOpen && Style['symbols-active'])}>
            <span className={Style['symbol-name']}>{symbolFullName}</span>
            <span className={cls('icon iconfont', isTooltipOpen ? 'icon-shang' : 'icon-xia')} />
          </div>
        </div>
      </div>
    </Tooltip>
  );

  return (
    <div className={Style['perfer-symbol-detail']}>
      {currentSymbol}
      <div className={Style['perfer-line']} />
      <ScrollBlock scrollCS={Style['detail-scroll']}>
        <For each="detail" index="index" of={detailFields}>
          {detail.isShow && <div className={Style['single-field']} key={index}>
            <div className={cls(Style.title, detail.labelClassName)}>
              {detail.label}
            </div>
            <div className={cls(Style.content, detail.contentClassName)}>
              {detail.data}
            </div>
          </div>}
        </For>
      </ScrollBlock>
    </div>
  );
};

SymbolDetail.defaultProps = {
  theme: TRADE_THEMES.LIGHT,
};

SymbolDetail.propTypes = {
  theme: PropTypes.string,
};

export default SymbolDetail;
