//  @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import styles from './index.module.less';
import cls from 'classnames';
import dayjs from 'dayjs';
import { useFm } from '@better-bit-fe/base-hooks';
import { Divider } from 'antd-mobile';
import useFormatNumberParams from '~/hooks/useFormatNumberParams';
import { numberWithCommas } from '~/utils/format-number';

const RecordInfo = (props) => {
  const t = useFm();
  const { value, handClickEdit } = props;

  return (
    <div className={styles.recordInfo}>
      <div className={styles.recordInfo_container}>
        <div className={styles.recordInfo_base}>
          <div className={styles.recordInfo_info}>
            <div className={styles.recordInfo_info_id}>
              ID: {value?.user_id}
              <div
                className={styles.recordInfo_remark_right}
                onClick={() => handClickEdit(value)}
              >
                <span className={styles.recordInfo_remark_icon} />
              </div>
            </div>
            <div className={styles.recordInfo_info_label}>
              {value.dt ? dayjs(value.dt).format('YYYY-MM-DD') : '-'}
            </div>
          </div>
          {value?.remark && (
            <div className={styles.recordInfo_remark}>
              <div className={styles.recordInfo_remark_left}>
                <span className={styles.recordInfo_remark_label}>
                  {value?.remark}
                </span>
              </div>
            </div>
          )}
        </div>
        <Divider className={styles.recordInfo_divider} />
        <div className={styles.recordInfo_item}>
          <div className={styles.recordInfo_item_left}>
            <p className={styles.recordInfo_item_left_label}>
              <span>{value?.symbol}</span>
              <span
                className={cls(styles.recordInfo_item_left_label_icon, {
                  [styles.up]: value?.direction === 'Long',
                  [styles.down]: value?.direction !== 'Long'
                })}
              >
                {value?.direction == 'Long' ? t('long') : t('short')}
              </span>
            </p>
            <p className={styles.recordInfo_item_left_value}>
              <span>{value?.margin_mode}&nbsp;</span>
              <span>{value?.leverage}x</span>
            </p>
          </div>
          <div className={styles.recordInfo_item_right}>
            <p className={styles.recordInfo_item_label}>{t('unrealizedPl')}</p>
            <p
              className={`${styles.recordInfo_item_value} 
      ${value?.unrealized_pnl < 0 ? styles.down : styles.up} `}
            >
              {numberWithCommas(value?.unrealized_pnl)}(
              {useFormatNumberParams(value?.pnl_rate)})
            </p>
          </div>
        </div>

        <div className={styles.flex}>
          <div className={styles.item}>
            <p className={styles.label}>{t('amount')}</p>
            <p className={styles.value}>{numberWithCommas(value?.amount)}</p>
          </div>
          <div className={styles.item}>
            <p className={styles.label}>{t('openingPrice')}</p>
            <p className={styles.value}>
              {numberWithCommas(value?.opening_price)}
            </p>
          </div>
          <div className={styles.item}>
            <p className={styles.label}>{t('markPrice')}</p>
            <p className={styles.value}>
              {numberWithCommas(value?.mark_price)}
            </p>
          </div>
        </div>
        <div className={styles.recordInfo_item}>
          <div className={styles.recordInfo_item_left}>
            <p className={styles.recordInfo_item_left_text}>
              <span>{t('estLiqPrice')}</span>
            </p>
          </div>
          <div className={styles.recordInfo_item_right}>
            <p className={styles.recordInfo_item_right_value}>
              {numberWithCommas(value?.est_liq_price)}
            </p>
          </div>
        </div>
        {/* <div className={styles.recordInfo_item}>
          <div className={styles.recordInfo_item_left}>
            <p className={styles.recordInfo_item_left_text}>
              <span>{t('margin')}</span>
            </p>
          </div>
          <div className={styles.recordInfo_item_right}>
            <p className={styles.recordInfo_item_right_value}>
              {numberWithCommas(value?.margin)}
            </p>
          </div>
        </div>*/}

        <div className={styles.recordInfo_item}>
          <div className={styles.recordInfo_item_left}>
            <p className={styles.recordInfo_item_left_text}>
              <span>{t('value')}</span>
            </p>
          </div>
          <div className={styles.recordInfo_item_right}>
            <p className={styles.recordInfo_item_right_value}>
              {numberWithCommas(value?.value)}
            </p>
          </div>
        </div>
        <div className={styles.recordInfo_item}>
          <div className={styles.recordInfo_item_left}>
            <p className={styles.recordInfo_item_left_text}>
              <span>{t('tpPrice')}</span>
            </p>
          </div>
          <div className={styles.recordInfo_item_right}>
            <p className={styles.recordInfo_item_right_value}>
              {numberWithCommas(value?.tp_price)}
            </p>
          </div>
        </div>
        <div className={styles.recordInfo_item}>
          <div className={styles.recordInfo_item_left}>
            <p className={styles.recordInfo_item_left_text}>
              <span>{t('slPrice')}</span>
            </p>
          </div>
          <div className={styles.recordInfo_item_right}>
            <p className={styles.recordInfo_item_right_value}>
              {numberWithCommas(value?.sl_price)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordInfo;
