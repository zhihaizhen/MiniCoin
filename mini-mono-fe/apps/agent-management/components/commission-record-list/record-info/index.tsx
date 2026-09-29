//  @ts-nocheck
import styles from './index.module.less';
import dayjs from 'dayjs';
import { RecordType } from '~/constants/dict';
import { useFm } from '@better-bit-fe/base-hooks';
import { numberWithCommas } from '~/utils/format-number';

const RecordInfo = (props) => {
  const t = useFm();
  const { value } = props;

  return (
    <div className={styles.recordInfo}>
      <div className={styles.recordInfo_container}>
        <div className={styles.recordInfo_info}>
          <div className={styles.recordInfo_info_label}>{t('date')}</div>
          <div className={styles.recordInfo_info_value}>
            {dayjs(value?.dt).format('YYYY-MM-DD')}
          </div>
        </div>
        <div className={styles.recordInfo_info}>
          <div className={styles.recordInfo_info_label}>{t('type')}</div>
          <div className={styles.recordInfo_info_value}>
            {t(`${RecordType[value?.type]}`)}
          </div>
        </div>
        <div className={styles.recordInfo_info}>
          <div className={styles.recordInfo_info_label}>
            {t('amount')}(USDT)
          </div>
          <div
            className={`${styles.recordInfo_info_value} 
      ${value?.amount < 0 ? styles.down : styles.up} `}
          >
            {numberWithCommas(value?.amount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordInfo;
