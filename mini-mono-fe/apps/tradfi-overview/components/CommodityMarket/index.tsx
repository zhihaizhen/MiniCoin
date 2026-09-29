import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFm } from '@better-bit-fe/base-hooks';
import { useAllSymbolQuote, useSymbolConfig } from 'libs/ws-service';
import { FUTURE_TYPE, LINEAR_CATEGORY_TYPE } from 'libs/ws-service/src/utils';
import { getSymbolUrl, getLang, isApp, goPage } from '@better-bit-fe/base-utils';
import styles from './index.module.less';
import cls from 'classnames';

const formatPrice = (num: number, fraction: number) =>
  num ? num.toLocaleString('en-US', { minimumFractionDigits: fraction, maximumFractionDigits: fraction }) : '--';

const CommodityMarket: React.FC = () => {
  const t = useFm();
  const { futureListWithType } = useAllSymbolQuote();
  const { symbolConfig } = useSymbolConfig();
  const lang = getLang();

  const blockSymbolOrder = useMemo(() => {
    return symbolConfig
      .filter((it: any) => it.symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK)
      .map((it: any) => it.symbolName);
  }, [symbolConfig]);

  const commodityList = useMemo(() => {
    const blockList = futureListWithType?.[FUTURE_TYPE.BLOCK] || [];

    const sorted = [...blockList].sort((a: any, b: any) =>
      blockSymbolOrder.indexOf(a.symbol) - blockSymbolOrder.indexOf(b.symbol)
    );

    return sorted.map((data: any) => {
      const showSymbol = data.symbolAlias || data.symbol;
      return {
        symbol: showSymbol,
        iconUrl: getSymbolUrl(showSymbol.split('USD')[0]),
        formattedLastPrice: data.formattedLastPrice || '--',
        changeRate24H: data.changeRate24H ?? 0,
        highPrice: formatPrice(data.highPrice, data.priceFraction),
        lowPrice: formatPrice(data.lowPrice, data.priceFraction)
      };
    });
  }, [futureListWithType, blockSymbolOrder]);

  const getTradeUrl = (symbol: string) => `/${lang}/tradfi/${symbol}`;

  const handleTrade = (symbol: string) => {
    if (isApp()) {
      goPage('blockTrade', `symbol=${symbol}`);
    } else {
      window.location.href = getTradeUrl(symbol);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>
          <FormattedMessage
            id="tradableCommodityTitle"
            values={{
              highlight: (text) => <span className={styles.highlight}>{text}</span>
            }}
          />
        </h2>

        {/* PC 表格 */}
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={cls(styles.colPair, styles.headerText)}>{t('pairs')}</div>
            <div className={cls(styles.colFlex, styles.headerText)}>{t('lastPrice')}</div>
            <div className={cls(styles.colFlex, styles.headerText)}>{t('change24h')}</div>
            <div className={cls(styles.colFlex, styles.headerText)}>{t('high24h')}</div>
            <div className={cls(styles.colFlex, styles.headerText)}>{t('low24h')}</div>
            <div className={styles.colAction} />
          </div>
          {commodityList.map((item, i) => (
            <div key={i} className={styles.tableRow}>
              <div className={styles.colPair}>
                <div className={styles.pairInfo}>
                  <img className={styles.pairIcon} src={item.iconUrl} alt={item.symbol} />
                  <span className={styles.pairName}>{item.symbol}</span>
                </div>
              </div>
              <div className={cls(styles.colFlex, styles.priceText)}>{item.formattedLastPrice}</div>
              <div className={cls(styles.colFlex, {
                [styles.changePositive]: item.changeRate24H >= 0,
                [styles.changeNegative]: item.changeRate24H < 0
              })}>
                {item.changeRate24H >= 0 ? '+' : ''}{item.changeRate24H?.toFixed(2)}%
              </div>
              <div className={cls(styles.colFlex, styles.priceText)}>{item.highPrice}</div>
              <div className={cls(styles.colFlex, styles.priceText)}>{item.lowPrice}</div>
              <div className={styles.colAction}>
                <span className={styles.tradeBtn} onClick={() => handleTrade(item.symbol)}>{t('trade')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* H5 卡片 */}
        <div className={styles.mobileCards}>
          {commodityList.map((item, i) => (
            <div key={i} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <img className={styles.mobilePairIcon} src={item.iconUrl} alt={item.symbol} />
                <div className={styles.mobilePairInfo}>
                  <span className={styles.mobilePairName}>{item.symbol}</span>
                  <span className={styles.mobilePairSubtitle}>{t(item.symbol)}</span>
                </div>
              </div>
              <div className={styles.mobilePriceArea}>
                <span className={styles.mobilePriceLabel}>{t('lastPrice')}</span>
                <div className={styles.mobilePriceRow}>
                  <span className={styles.mobilePriceValue}>{item.formattedLastPrice}</span>
                  <span className={cls({
                    [styles.mobileChangePositive]: item.changeRate24H >= 0,
                    [styles.mobileChangeNegative]: item.changeRate24H < 0
                  })}>
                    {item.changeRate24H >= 0 ? '+' : ''}{item.changeRate24H?.toFixed(2)}%
                  </span>
                </div>
              </div>
              <span className={styles.mobileTradeBtn} onClick={() => handleTrade(item.symbol)}>{t('trade')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommodityMarket;
