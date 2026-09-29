import { useFm } from '@better-bit-fe/base-hooks';
import React, { useEffect, useState } from 'react';
import Loading from '~/components/Loading';
import cls from 'classnames';
import Row from './row';
import { SORT_TYPE } from '~/constants';
import styles from './index.module.less';

const defaultStatus = {
  priceUp: false,
  priceDwon: false,
  '24changeUp': false,
  '24changeDwon': false,
  volUp: false,
  volDwon: false,
  highLowUp: false,
  highLowDwon: false
};

const TableData = ({
  data = [],
  changeSort,
  curSecondFavLayer,
  curFirstCategory,
  userFiatInfo,
  sortInfo,
  isLogin,
  loading
}) => {
  const t = useFm();
  const [showData, setShowData] = useState(data);
  const [sortStatus, setSortStatus] = useState(defaultStatus); // 排序状态

  useEffect(() => {
    setShowData(data);
  }, [data]);

  useEffect(() => {
    if (sortInfo) {
      const { key, direction } = sortInfo;
      const label = `${key}${direction}`;
      setSortStatus({
        ...defaultStatus,
        [label]: true
      });
    } else {
      setSortStatus(defaultStatus);
    }
  }, [sortInfo]);

  const UpDownIcon = (key) => {
    return (
      <div className={styles.sortIcons}>
        <div
          className={cls(styles.upIcon, {
            [styles.upIconActive]: sortStatus[`${key}Down`]
          })}
        />
        <div
          className={cls(styles.downIcon, {
            [styles.downIconActive]: sortStatus[`${key}Up`]
          })}
        />
      </div>
    );
  };

  const handleBigSort = (key: string) => {
    const labelUp = `${key}Up`;
    const preKeyUp = sortStatus[labelUp];
    // 正序和倒序之间循环,初次点击该key，默认up
    let newStatus = 'Up';
    if (preKeyUp) {
      newStatus = 'Down';
    }

    const label = `${key}${newStatus}`;
    setSortStatus({
      ...defaultStatus,
      [label]: true
    });
    changeSort(key, newStatus);
  };

  return (
    <div className={styles.tableContent}>
      <div className={styles.header}>
        <div className={styles.pairsCol}>{t('pairs')}</div>
        <div
          className={cls(styles.col, styles.alignEnd, styles.cursor)}
          onClick={() => handleBigSort(SORT_TYPE.PRICE)}
        >
          {t('lastPrice')}
          {UpDownIcon(SORT_TYPE.PRICE)}
        </div>
        <div
          className={cls(styles.col, styles.alignEnd, styles.cursor)}
          onClick={() => handleBigSort(SORT_TYPE['24CHANGE'])}
        >
          {t('24change')}
          {UpDownIcon(SORT_TYPE['24CHANGE'])}
        </div>
        <div
          className={cls(styles.col, styles.alignEnd, styles.cursor)}
          onClick={() => handleBigSort(SORT_TYPE.HIGH_LOW)}
        >
          {t('highLow24h')}
          {UpDownIcon(SORT_TYPE.HIGH_LOW)}
        </div>
        <div
          className={cls(styles.col, styles.alignEnd, styles.cursor)}
          onClick={() => handleBigSort(SORT_TYPE.VOL)}
        >
          {t('vol')}
          {UpDownIcon(SORT_TYPE.VOL)}
        </div>
        <div className={styles.right}>{t('action')}</div>
      </div>
      <div className={styles.content}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {showData.length ? (
              showData.map((it, i) => (
                <Row
                  key={i}
                  {...it}
                  userFiatInfo={userFiatInfo}
                  isLogin={isLogin}
                />
              ))
            ) : (
              <div className={cls(styles.nodata, styles.bothCenter)}>
                <div className={styles.nodataIcon} />
                <div className={styles.text}>{t('nodata')}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TableData;
