import { useFm } from '@better-bit-fe/base-hooks';
import React, { useMemo } from 'react';
import { intercept, toThousands } from '@unified/helpers';
import styles from './index.module.less';
import cls from 'classnames';
import { numberFormat } from '~/utils/index'
import { TendChart } from '@better-bit-fe/base-ui';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { getLang } from '@better-bit-fe/base-utils';

const RowData = ({
  colorPreference,
  symbol, //应该是别名
  formattedLastPrice,
  changeRate24H,
  symbolAlias,
  activeTab,
  hignPriceNum,
  turnover24h,
  line = []
}) => {

  const t = useFm();

  const useShowSymbol = useMemo(() => {
    return symbolAlias || symbol;
  }, [symbolAlias, symbol]);

  const lang = getLang();

  const getTradeUrl = () => {
    if (activeTab === 'spots') {
      return `/${lang}/spot/exchange/${useShowSymbol}`;
    }
    return `/${lang}/trade/usdt/${useShowSymbol}`;
  }

  return (
    <a
      className={styles.leftRowItem}
      href={getTradeUrl()}
    >
      <span className={cls(styles.pairs, styles.pairsName, styles.flex, styles.left)}>
        {symbolAlias && (
          <img className={styles.itemIcon} src={getSymbolUrl(symbolAlias)} />
        )}
        <span>{symbolAlias}</span>
      </span>
      {/* H5才有 */}
      <div className={cls(styles.h524Change, styles.right)}>
        <div>{formattedLastPrice}</div>
        <div className={cls(styles.size14, {
          "upColor": changeRate24H >= 0,
          "downColor": changeRate24H < 0
        })}>
          {changeRate24H >= 0 ? `+${changeRate24H.toFixed(2)}` : changeRate24H.toFixed(2)}%</div>
      </div>

      <span className={cls(styles.left, styles.change)}>
        {formattedLastPrice}
      </span>
      <span
        className={cls(styles.left, styles.change, {
          "upColor": changeRate24H >= 0,
          "downColor": changeRate24H < 0
        })}
      >
        {changeRate24H >= 0 ? `+${changeRate24H.toFixed(2)}` : changeRate24H.toFixed(2)}%
      </span>
      <span
        className={cls(styles.left, styles.change)}
      >
        {numberFormat(turnover24h)}
      </span>

      <a
        className={cls(styles.right, styles.trade, styles.tradeBtn)}
        href={getTradeUrl()}
      >
        {t('trade')}
      </a>
    </a>
  );
};

export default RowData;
