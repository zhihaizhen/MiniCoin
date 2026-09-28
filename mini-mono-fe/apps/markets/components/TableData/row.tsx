import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { getSymbolUrl, getLang } from '@better-bit-fe/base-utils';
import { toThousandsNumberNoZero } from '~/utils';
import { useCollect } from 'libs/ws-service';
import { postFavoriteChange } from '~/api';
import { isInverseBySymbol, FUTURE_TYPE, LINEAR_CATEGORY_TYPE } from 'libs/ws-service/src/utils';
import styles from './index.module.less';
import { FIRST_LAYER } from '~/constants';

const RowData = ({
  symbol = 'BTCUSDT',
  symbolAlias = 'BTCUSDT',
  symbolCategory,
  formattedLastPrice = '22,8822',
  lastPriceNumber,
  priceFraction = 2,
  changeRate24H = 22,
  formattedTurnover24h = '', //
  formattedVolume24h = '4,444',
  highPrice,
  lowPrice,
  type,
  contractType,
  userFiatInfo
}) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { futureCollect, spotCollect, getCollectList } = useCollect();

  const { locale } = useRouter();
  const useShowSymbol = useMemo(() => {
    return symbolAlias || symbol;
  }, [symbolAlias, symbol]);

  const tradePageUrl = useMemo(() => {
    const lang = getLang();
    if (type === FIRST_LAYER.SPOT) {
      return `${location.origin}/${lang}/spot/exchange/${useShowSymbol}`;
    }
    if (isInverseBySymbol(contractType)) {
      return `${location.origin}/${lang}/trade/inverse/${useShowSymbol}`;
    }
    if (symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK) {
      return `${location.origin}/${lang}/tradfi/${useShowSymbol}`;
    }
    return `${location.origin}/${lang}/trade/usdt/${useShowSymbol}`;
  }, [type, contractType, symbolCategory, useShowSymbol]);

  const typeCollect = useMemo(() => {
    let curCollect = futureCollect;
    if (type === FIRST_LAYER.SPOT) {
      curCollect = spotCollect;
    }
    return curCollect;
  }, [type, futureCollect, spotCollect]);

  // 法币：汇率或符号未就绪时不展示，避免拼出 undefinedNaN
  const fiat = useMemo(() => {
    const rate = Number(userFiatInfo?.rate);
    const fiatSymbol = userFiatInfo?.fiat_symbol;
    const lastPrice = Number(lastPriceNumber);
    if (!fiatSymbol || !Number.isFinite(rate) || !Number.isFinite(lastPrice)) {
      return '';
    }
    const value = rate * lastPrice;
    if (!Number.isFinite(value)) {
      return '';
    }
    const formattedValue = toThousandsNumberNoZero(value, priceFraction);
    return `${fiatSymbol}${formattedValue}`;
  }, [lastPriceNumber, userFiatInfo, priceFraction]);

  const isZH = locale.includes('zh');

  const iconSymbol = useMemo(() => {
    if (symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK) {
      const coin = useShowSymbol.split('USD')[0];
      return getSymbolUrl(coin);
    }
    return getSymbolUrl(useShowSymbol);
  }, [useShowSymbol, symbolCategory]);

  const isCollected = useMemo(() => {
    return typeCollect.indexOf(symbol) > -1;
  }, [symbol, typeCollect]);

  const formattedHighPrice = useMemo(() => {
    if (highPrice === undefined || highPrice === null || highPrice === '') {
      return '--';
    }
    return toThousandsNumberNoZero(highPrice, priceFraction);
  }, [highPrice, priceFraction]);

  const formattedLowPrice = useMemo(() => {
    if (lowPrice === undefined || lowPrice === null || lowPrice === '') {
      return '--';
    }
    return toThousandsNumberNoZero(lowPrice, priceFraction);
  }, [lowPrice, priceFraction]);

  const handleChangeCollect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let newCollectList = [...typeCollect];
    if (isCollected) {
      const idx = newCollectList.findIndex((it) => it === symbol);
      newCollectList.splice(idx, 1);
    } else {
      newCollectList.unshift(symbol);
    }
    const key =
      type === FIRST_LAYER.SPOT ? 'spotBookSymbolSequence' : 'bookSymbolSequence';
    const data = {
      upsert_keys: {
        [key]: newCollectList.join(',')
      }
    };
    await postFavoriteChange(data);
    await getCollectList();
  };

  const handleRowClick = () => {
    window.location.href = tradePageUrl;
  };

  return (
    <section
      className={cls(styles.row, styles.cursor)}
      onClick={handleRowClick}
    >
      <div className={styles.pairsCol}>
        {isLogin && (
          <div
            className={cls(styles.startIcon, {
              [styles.starIconActive]: isCollected
            })}
            onClick={handleChangeCollect}
          />
        )}
        {symbolAlias && (
          <img className={styles.itemIcon} src={iconSymbol} alt="" />
        )}
        <div className={styles.symbolMeta}>
          <div className={styles.mainInfo}>
            {symbolAlias}
            {isInverseBySymbol(contractType) && (
              <span>{t('inverse-coin')}</span>
            )}
          </div>

          {/* 永续 */}
          {type === FIRST_LAYER.FUTURE && symbolCategory !== LINEAR_CATEGORY_TYPE.BLOCK && (
            <div className={cls(styles.mt4, styles.tag)}>{t('perp')}</div>
          )}

          {/* 大宗 */}
          {symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK && isZH && (
            <div className={cls(styles.mt4, styles.tag)}>{t(symbolAlias)}</div>
          )}
        </div>
      </div>
      <div className={cls(styles.col, styles.priceCol)}>
        <div className={styles.mainInfo}>{formattedLastPrice}</div>
        {isLogin && fiat ? <span className={styles.fiat}>{fiat}</span> : null}
      </div>
      <div
        className={cls(styles.col, {
          upColor: changeRate24H >= 0,
          downColor: changeRate24H < 0
        })}
      >
        {changeRate24H >= 0 ? `+${changeRate24H}` : changeRate24H}%
      </div>
      <div className={cls(styles.col, styles.mainInfo)}>
        {formattedHighPrice} / {formattedLowPrice}
      </div>
      <div className={styles.col}>
        {type === FIRST_LAYER.FUTURE && contractType === FUTURE_TYPE.INVERSE
          ? formattedVolume24h
          : formattedTurnover24h}
      </div>
      <a
        href={tradePageUrl}
        className={cls(styles.right, styles.brandColor, styles.cursor)}
        onClick={(e) => e.stopPropagation()}
      >
        {t('trade')}
      </a>
    </section>
  );
};

export default RowData;
