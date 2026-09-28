//  @ts-nocheck
import {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import cls from 'classnames';
import { Divider, Popup, CheckList } from 'antd-mobile';
import { CheckOutline } from 'antd-mobile-icons';
import styles from './index.module.less';
import { useContextReferral } from '~/context/transactionHistoryContext';
import { timeFilterList } from '~/constants';
import { numberWithCommas } from '~/utils/format-number';
import { REFERRAL_PATH } from '~/constants/path';
import { keepUrlQueryParams, jumpToUrl, goPrePageInAPP } from '~/utils/url';

const defaultSortName = timeFilterList.filter((item) => item.value === 'All')[0]
  .key;

let OverviewSummaryCard = (props, ref) => {
  const t = useFm();
  const { overviewCardData, getOverviewCardData, hasAuth } =
    useContextReferral();
  const [selected, setSelected] = useState('All');
  const [sortName, setSortName] = useState(defaultSortName);
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    handleRefresh: () => {
      getOverviewCardData(selected);
    }
  }));

  useEffect(() => {
    // alert(`调用了getOverviewCardData`);
    if (hasAuth) {
      getOverviewCardData(selected);
    }
  }, [selected, hasAuth]);

  const openFilterPopup = () => {
    setFilterPopupVisible(true);
  };

  const closeFilterPopup = () => {
    setFilterPopupVisible(false);
  };

  // 去储值页面
  const gotoNetdeposit = useCallback(() => {
    jumpToUrl(keepUrlQueryParams(REFERRAL_PATH.netDeposit));
  }, []);

  return (
    <div className={styles.overviewSummaryCard}>
      <div className={styles.overviewSummaryCard_head}>
        <span className={styles.overviewSummaryCard_head_title}>
          {t('overview')}
        </span>
        <div
          className={styles.overviewSummaryCard_head_time}
          onClick={openFilterPopup}
        >
          <span>{t(`${sortName}`)}</span>
          <span className={styles.overviewSummaryCard_head_time_icon} />
        </div>
      </div>
      <div className={styles.overviewSummaryCard_container}>
        <div className={styles.overviewSummaryCard_row}>
          <div className={styles.overviewSummaryCard_info}>
            <div className={styles.overviewSummaryCard_info_label}>
              {t('signUpNum')}
            </div>
            <div className={styles.overviewSummaryCard_info_value}>
              {numberWithCommas(overviewCardData?.register_user_count)}
            </div>
          </div>
          <div className={styles.overviewSummaryCard_info}>
            <div className={styles.overviewSummaryCard_info_label}>
              {t('tradingVolume')}
            </div>
            <div className={styles.overviewSummaryCard_info_value_right}>
              {numberWithCommas(overviewCardData?.trading_volume)}
            </div>
          </div>
        </div>
        <div className={styles.overviewSummaryCard_row}>
          <div className={styles.overviewSummaryCard_info}>
            <div className={styles.overviewSummaryCard_info_label}>
              {t('firstDepositsNum')}
            </div>
            <div className={styles.overviewSummaryCard_info_value}>
              {numberWithCommas(overviewCardData?.deposit_user_count)}
            </div>
          </div>
          <div className={styles.overviewSummaryCard_info}>
            <div className={styles.overviewSummaryCard_info_label}>
              {t('clientsWhoTraded')}
            </div>
            <div className={styles.overviewSummaryCard_info_value_right}>
              {numberWithCommas(overviewCardData?.trade_user_count)}
            </div>
          </div>
        </div>

        <Divider className={styles.overviewSummaryCard_divider} />
        <div className={cls(styles.overviewSummaryCard_row, styles.nopadding)}>
          <div className={styles.overviewSummaryCard_info_label}>
            {t('totalDeposit')}
          </div>
          <div className={styles.overviewSummaryCard_info_value}>
            <span>{numberWithCommas(overviewCardData?.total_deposit)}</span>
          </div>
        </div>
        <div className={cls(styles.overviewSummaryCard_row, styles.nopadding)}>
          <div className={styles.overviewSummaryCard_info_label}>
            {t('totalWithdrawal')}
          </div>
          <div className={styles.overviewSummaryCard_info_value}>
            <span>{numberWithCommas(overviewCardData?.total_withdrawal)}</span>
          </div>
        </div>
        <div className={cls(styles.overviewSummaryCard_row, styles.nopadding)}>
          <div className={styles.overviewSummaryCard_info_label}>
            {t('netDeposit')}
          </div>
          <div className={styles.overviewSummaryCard_info_value1}>
            <span>{numberWithCommas(overviewCardData?.net_deposit)}</span>
            <span
              className={cls(styles.overviewSummaryCard_info_netIcon, {
                [styles.disabled]:
                  !overviewCardData?.net_deposit ||
                  numberWithCommas(overviewCardData?.net_deposit) == 0
              })}
              onClick={gotoNetdeposit}
            />
          </div>
        </div>
      </div>
      <Popup
        visible={filterPopupVisible}
        onMaskClick={() => {
          setFilterPopupVisible(false);
        }}
        destroyOnClose
        bodyStyle={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          minHeight: '30vh'
        }}
      >
        <div className={styles.filterPopupContainer}>
          <div className={styles.content}>
            <CheckList
              activeIcon={<CheckOutline color="var(--text-brand-default)" />}
              className={styles.myCheckList}
              defaultValue={selected ? [selected] : []}
              onChange={(val) => {
                const currentVal = val.length === 0 ? selected : val[0];
                setSelected(currentVal);
                setSortName(
                  timeFilterList.filter((item) => item.value === currentVal)[0]
                    .key
                );
                setFilterPopupVisible(false);
              }}
            >
              {timeFilterList.map((item) => (
                <CheckList.Item
                  key={item.key}
                  value={item.value}
                  style={{
                    '--active-background-color': '#222'
                  }}
                >
                  {t(`${item.key}`)}
                </CheckList.Item>
              ))}
            </CheckList>
          </div>
          <div className={styles.btn} onClick={closeFilterPopup}>
            {t('cancel')}
          </div>
        </div>
      </Popup>
    </div>
  );
};
OverviewSummaryCard = forwardRef(OverviewSummaryCard);

export default OverviewSummaryCard;
