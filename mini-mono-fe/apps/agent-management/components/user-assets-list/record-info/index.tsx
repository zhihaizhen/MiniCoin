//  @ts-nocheck
import { useState, useEffect } from 'react';
import styles from './index.module.less';
import dayjs from 'dayjs';
import { useFm } from '@better-bit-fe/base-hooks';
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
              {dayjs(value?.dt).format('YYYY-MM-DD HH:mm:ss')}
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
        <div className={styles.recordInfo_info}>
          <div className={styles.recordInfo_info_label}>{t('amount')}</div>
          <div className={styles.recordInfo_info_right}>
            <span
              className={`${styles.recordInfo_info_value} 
      ${value?.amount < 0 ? styles.down : styles.up} `}
            >
              {numberWithCommas(value?.amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordInfo;
