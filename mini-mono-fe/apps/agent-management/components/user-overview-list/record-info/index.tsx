//  @ts-nocheck
import styles from './index.module.less';
import dayjs from 'dayjs';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { RightOutline } from 'antd-mobile-icons';
import { numberWithCommas } from '~/utils/format-number';

const RecordInfo = (props) => {
  const t = useFm();
  const { value, handClickEdit, goToOpenPosition, goToPlRecord } = props;

  const handleClickRealizedPL = (user_id) => {
    goToOpenPosition({
      tabIndex: 3,
      user_id
    });
  };

  const handleClickUnrealizedPL = (user_id) => {
    goToPlRecord({
      tabIndex: 2,
      user_id
    });
  };

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
              {dayjs(value?.registration_time).format('YYYY-MM-DD')}
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
        <div className={styles.recordInfo_item}>
          <div className={styles.recordInfo_item_left}>
            <p className={styles.recordInfo_item_label}>{t('userAssets')}</p>
            <p className={cls(styles.recordInfo_item_value, styles.left)}>
              {numberWithCommas(value?.user_assets)}
            </p>
          </div>
          <div className={styles.recordInfo_item_right}>
            <p className={styles.recordInfo_item_label}>{t('tradingAmount')}</p>
            <p className={styles.recordInfo_item_value}>
              {numberWithCommas(value?.trading_amount)}
            </p>
          </div>
        </div>
        {/* <div className={styles.recordInfo_info}>
          <div className={styles.recordInfo_info_label}>{t('realizedPl')}</div>
          <div
            className={styles.recordInfo_info_right}
            onClick={() => handleClickRealizedPL(value?.user_id)}
          >
            <span
              className={`${styles.recordInfo_info_value} 
      ${value?.realized_pnl < 0 ? styles.down : styles.up} `}
            >
              {numberWithCommas(value?.realized_pnl)}
            </span>
            <RightOutline className={styles.recordInfo_info_icon} />
          </div>
        </div>
        <div className={styles.recordInfo_info}>
          <div className={styles.recordInfo_info_label}>
            {t('unrealizedPl')}
          </div>
          <div
            className={styles.recordInfo_info_right}
            onClick={() => handleClickUnrealizedPL(value?.user_id)}
          >
            <span
              className={`${styles.recordInfo_info_value} 
             ${value?.unrealized_pnl < 0 ? styles.down : styles.up} `}
            >
              {numberWithCommas(value?.unrealized_pnl)}
            </span>
            <RightOutline className={styles.recordInfo_info_icon} />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default RecordInfo;
