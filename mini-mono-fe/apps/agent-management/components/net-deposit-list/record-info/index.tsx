//  @ts-nocheck
import { useState, useEffect } from 'react';
import cls from 'classnames';
import styles from './index.module.less';
import dayjs from 'dayjs';
import { useFm } from '@better-bit-fe/base-hooks';
import { numberWithCommas } from '~/utils/format-number';

const RecordInfo = (props) => {
  const t = useFm();
  const { value } = props;

  return (
    <div className={styles.recordInfo}>
      <div className={styles.recordInfo_container}>
        <div className={styles.recordInfo_base}>
          {/*  */}
          <div className={styles.recordInfo_info}>
            <div className={styles.recordInfo_info_label}>{t('time')}</div>
            <div className={styles.recordInfo_info_value}>
              {dayjs(value?.dt).format('YYYY-MM-DD')}
            </div>
          </div>
          {/*  */}
          <div className={styles.recordInfo_info}>
            <div className={styles.recordInfo_info_label}>
              {t('depositAmount')}
            </div>
            <div className={cls(styles.recordInfo_info_value)}>
              {numberWithCommas(value?.total_deposit)}
            </div>
          </div>
          {/*  */}

          <div className={styles.recordInfo_info}>
            <div className={styles.recordInfo_info_label}>
              {t('withdrawalAmount')}
            </div>
            <div className={styles.recordInfo_info_right}>
              <span className={cls(styles.recordInfo_info_value)}>
                {numberWithCommas(value?.total_withdrawal)}
              </span>
            </div>
          </div>

          <div className={styles.recordInfo_info}>
            <div className={styles.recordInfo_info_label}>
              {t('netDepositAmount')}
            </div>
            <div className={styles.recordInfo_info_right}>
              <span
                className={`${styles.recordInfo_info_value} ${
                  value?.net_deposit < 0 ? styles.down : styles.up
                } `}
              >
                {numberWithCommas(value?.net_deposit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordInfo;
