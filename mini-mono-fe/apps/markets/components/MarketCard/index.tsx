import React, { useMemo } from 'react';
import cls from 'classnames';
import { TendChart } from '@better-bit-fe/base-ui';
import { getSymbolUrl, getLang } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

interface MarketCardProps {
  symbol?: string;
  symbolAlias?: string;
  formattedLastPrice?: string;
  changeRate24H?: number;
  line?: number[];
  colorPreference?: string;
}

const MarketCard = ({
  symbol = 'BTCUSDT',
  symbolAlias = 'BTCUSDT',
  formattedLastPrice = '--',
  changeRate24H = 0,
  line = [],
  colorPreference = 'greenUpRedDown'
}: MarketCardProps) => {
  const showSymbol = useMemo(() => symbolAlias || symbol, [symbolAlias, symbol]);
  const isUp = !(changeRate24H < 0);
  const iconUrl = useMemo(() => getSymbolUrl(showSymbol), [showSymbol]);

  const handleClick = () => {
    const lang = getLang();
    window.location.href = `/${lang}/trade/usdt/${showSymbol}`;
  };

  return (
    <div className={styles.marketCard} onClick={handleClick}>
      <div className={styles.topRow}>
        <div className={styles.symbolInfo}>
          <img className={styles.icon} src={iconUrl} alt={showSymbol} />
          <span className={styles.symbol}>{showSymbol}</span>
        </div>
        <span
          className={cls(styles.change, {
            upColor: isUp,
            downColor: !isUp
          })}
        >
          {changeRate24H >= 0 ? `+${changeRate24H}` : changeRate24H}%
        </span>
      </div>
      <div className={styles.bottomRow}>
        <span className={styles.price}>{formattedLastPrice}</span>
        <TendChart
          chartDataList={line}
          isUp={isUp}
          colorPreference={colorPreference}
          width={112}
          height={64}
        />
      </div>
    </div>
  );
};

export default MarketCard;
