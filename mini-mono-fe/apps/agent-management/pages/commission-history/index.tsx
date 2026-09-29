//  @ts-nocheck
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { withLayout } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useFm } from '@better-bit-fe/base-hooks';
import { TransactionHistoryProvider } from '~/context/transactionHistoryContext';
import CommissionRecordList from '~/components/commission-record-list';
import styles from './index.module.less';
import { NavBar, Toast, Dropdown, DatePicker, SafeArea } from 'antd-mobile';
import { FilterOutline } from 'antd-mobile-icons';
import { DropdownRef } from 'antd-mobile/es/components/dropdown';
import dayjs from 'dayjs';
import { goPrePageInAPP } from '~/utils/url';
import { ConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import zhTW from 'antd-mobile/es/locales/zh-TW';
import zhCN from 'antd-mobile/es/locales/zh-CN';

const now = new Date();
const tabList = ['All', 'Settlement', 'Withdraw']; //结算，提现

const CommissionRecord = (props) => {
  const ref = useRef<DropdownRef>(null);
  const t = useFm();
  const [currentType, setCurrentType] = useState('All');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateType, setDateType] = useState('');
  const [startTimeStamp, setStartTimeStamp] = useState(0);
  const [endTimeStamp, setEndTimeStamp] = useState(0);
  const [searchParams, setSearchParams] = useState({
    type: 'All'
  }); //搜索参数
  const childRef = useRef(null);

  useEffect(() => {
    document.title = `EasiCoin | ${t('commissionRecord')}`;
  }, []);

  const handleSelectType = (item) => {
    setCurrentType(item);
  };

  const handleSelectStartDate = (type) => {
    setDateType(type);
    setDatePickerVisible(true);
  };

  const handleReset = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setStartTimeStamp(0);
    setEndTimeStamp(0);
    setCurrentType('All');
    setSearchParams({
      type: 'All'
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (
      (startTimeStamp && !endTimeStamp) ||
      (!startTimeStamp && endTimeStamp)
    ) {
      Toast.show({
        content: t('selectRightDateRange'),
        duration: 2000
      });
      return;
    }
    const params = {
      type: currentType,
      start_date: startTimeStamp,
      end_date: endTimeStamp
    };
    setSearchParams(params);
    // handleReset();
    ref.current?.close();
  }, [currentType, startTimeStamp, endTimeStamp]);

  const handleRefresh = () => {
    childRef.current.handleRefresh();
  };

  const right = useMemo(
    () => (
      <div className={styles.rightWrapper}>
        <span className={styles.refreshIcon} onClick={handleRefresh} />
        <Dropdown ref={ref}>
          <Dropdown.Item
            key="sorter"
            title={<FilterOutline style={{ fontSize: '20px' }} />}
          >
            <div className={styles.commissionRecord_dropdown}>
              <div className={styles.commissionRecord_dropdown_row}>
                <p className={styles.commissionRecord_dropdown_row_title}>
                  {t('type')}
                </p>
                <div className={styles.commissionRecord_dropdown_tab}>
                  {tabList.map((item) => (
                    <span
                      className={
                        currentType === item
                          ? styles.commissionRecord_dropdown_tab_active
                          : styles.commissionRecord_dropdown_tab_item
                      }
                      key={item}
                      onClick={() => handleSelectType(item)}
                    >
                      {t(`${item}`)}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.commissionRecord_dropdown_row}>
                <p className={styles.commissionRecord_dropdown_row_title}>
                  {t('dateRange')}
                </p>
                <div className={styles.commissionRecord_dropdown_picker}>
                  <span
                    className={styles.commissionRecord_dropdown_picker_date}
                    onClick={() => handleSelectStartDate('startDate')}
                  >
                    {startDate || t('startDate')}
                  </span>
                  <span>-</span>
                  <span
                    className={styles.commissionRecord_dropdown_picker_date}
                    onClick={() => handleSelectStartDate('endDate')}
                  >
                    {endDate || t('endDate')}
                  </span>
                </div>
              </div>
              <footer className={styles.commissionRecord_dropdown_footer}>
                <span
                  className={styles.commissionRecord_dropdown_footer_reset}
                  onClick={handleReset}
                >
                  {t('reset')}
                </span>
                <span
                  className={styles.commissionRecord_dropdown_footer_confirm}
                  onClick={handleConfirm}
                >
                  {t('confirm')}
                </span>
              </footer>
            </div>
          </Dropdown.Item>
        </Dropdown>
      </div>
    ),
    [currentType, startDate, endDate, handleReset, handleConfirm]
  );
  const antdLocalMap = {
    'en-US': enUS,
    'zh-TW': zhTW,
    'zh-CN': zhCN
  };

  return (
    <ConfigProvider locale={antdLocalMap[props.locale] || enUS}>
      <TransactionHistoryProvider>
        <div className={styles.commissionRecord}>
          <SafeArea position="top" />
          <div className={styles.commissionRecord_head}>
            <NavBar right={right} onBack={goPrePageInAPP}>
              {t('commissionTransHistory')}
            </NavBar>
          </div>
          <div className={styles.commissionRecord_list}>
            <CommissionRecordList searchParams={searchParams} ref={childRef} />
          </div>
          <DatePicker
            title={t('selectDate')}
            visible={datePickerVisible}
            onClose={() => {
              setDatePickerVisible(false);
            }}
            max={now}
            onConfirm={(val) => {
              if (dateType === 'startDate') {
                if (endTimeStamp && endTimeStamp < dayjs(val).valueOf()) {
                  Toast.show({
                    content: t('dateErrorTips'),
                    duration: 2000
                  });
                  return;
                }
                setStartDate(dayjs(val).format('YYYY-MM-DD'));
                setStartTimeStamp(dayjs(val).valueOf());
              } else {
                if (startTimeStamp && startTimeStamp > dayjs(val).valueOf()) {
                  Toast.show({
                    content: t('dateErrorTips'),
                    duration: 2000
                  });
                  return;
                }
                setEndDate(dayjs(val).format('YYYY-MM-DD'));
                setEndTimeStamp(dayjs(val).valueOf());
              }
            }}
          />
        </div>
      </TransactionHistoryProvider>
    </ConfigProvider>
  );
};

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: 'agent-management', //
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });
  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

export default withLayout(CommissionRecord);
