//  @ts-nocheck
import styles from './index.module.less';
import dayjs from 'dayjs';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { Divider } from 'antd-mobile';
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
              {value.dt ? dayjs(value.dt).format('YYYY-MM-DD HH:mm:ss') : '-'}
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
          <p className={styles.recordInfo_item_label}>
            <span>{value?.symbol}</span>
            <span
              className={cls(styles.recordInfo_item_label_close_icon, {
                [styles.up]: value?.closing_direction === 'Long',
                [styles.down]: value?.closing_direction !== 'Long'
              })}
            >
              {value?.closing_direction === 'Long'
                ? t('closeShort')
                : t('closeLong')}
            </span>
          </p>
        </div>
        <div className={styles.flex}>
          <div className={styles.item}>
            <p className={styles.label}>{t('plInUsdt')}</p>
            <p
              className={`${styles.plValue} 
      ${value?.closed_pnl < 0 ? styles.down : styles.up} `}
            >
              {numberWithCommas(value?.closed_pnl)}
            </p>
          </div>
          <div className={styles.item}>
            <p className={styles.label}>{t('amount')}</p>
            <p className={styles.value}>{numberWithCommas(value?.amount)}</p>
          </div>
        </div>
        <div className={styles.flex}>
          <div className={styles.item}>
            <p className={styles.label}>{t('openingPrice')}</p>
            <p className={styles.value}>
              {numberWithCommas(value?.opening_price)}
            </p>
          </div>
          <div className={styles.item}>
            <p className={styles.label}>{t('closingPrice')}</p>
            <p className={styles.value}>
              {numberWithCommas(value?.closing_price)}
            </p>
          </div>
          <div className={styles.item}>
            <p className={styles.label}>{t('fee')}</p>
            <p className={styles.value}>{numberWithCommas(value?.fee)}</p>
          </div>
          <div className={styles.item}>
            <p className={styles.label}>{t('exitType')}</p>
            {/* 交易||强平 */}
            <p className={styles.value}>{t(value?.exit_type)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordInfo;
