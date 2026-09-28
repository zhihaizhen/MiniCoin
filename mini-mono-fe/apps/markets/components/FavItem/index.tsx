import { useFm } from '@better-bit-fe/base-hooks';
import React, { useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import { Checkbox } from 'antd';
import { useColorPreference } from '@better-bit-fe/base-provider';
import { TendChart } from '@better-bit-fe/base-ui';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import styles from './index.module.less';
import { LINEAR_CATEGORY_TYPE } from 'libs/ws-service/src/utils';

const FavItem = ({
  getFavChecked,
  symbol = 'BTCUSDT',
  symbolAlias = 'BTCUSDT',
  formattedLastPrice = '22,8822',
  changeRate24H = 22,
  formattedVolume24h = '4,444',
  symbolCategory,
  isZhTradfi,
  line = []
}) => {
  const t = useFm();
  const { colorPreference } = useColorPreference();
  const [isChecked, setIsChecked] = useState(true);

  const hanldeChecked = () => {
    getFavChecked(!isChecked, symbol);
    setIsChecked((pre) => !pre);
  };

  const iconSymbol = useMemo(() => {
    if (symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK) {
      const coin = symbolAlias.split('USD')[0];
      return getSymbolUrl(coin);
    }
    return getSymbolUrl(symbolAlias);
  }, [symbolAlias]);

  return (
    <div
      className={cls(styles.favItem, {
        [styles.favItemActive]: isChecked
      })}
      onClick={hanldeChecked}
    >
      <div className={styles.favItemLeft}>
        <div className={cls(styles.symbol)}>
          <img className={styles.icon} src={iconSymbol} />
          <div className={styles.text}>
            <div>{symbolAlias}</div>
            {isZhTradfi && <div className={styles.tag}>{t(symbolAlias)}</div>}
          </div>

        </div>
        <div className={styles.price}>{formattedLastPrice}</div>
        <div
          className={cls(styles.change, {
            "upColor": !(changeRate24H < 0),
            "downColor": changeRate24H < 0
          })}
        >
          {changeRate24H >= 0 ? `+${changeRate24H}` : changeRate24H}%
        </div>
      </div>
      <div className={styles.favItemRight}>
        <Checkbox className={styles.mb16} checked={isChecked} />
        <TendChart chartDataList={line} isUp={!(changeRate24H < 0)} colorPreference={colorPreference} />
      </div>
    </div>
  );
};

export default FavItem;
