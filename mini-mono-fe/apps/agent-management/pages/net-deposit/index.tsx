//  @ts-nocheck
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { withLayout } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { TransactionHistoryProvider } from '~/context/transactionHistoryContext';
import styles from './index.module.less';
import { isApp } from '@better-bit-fe/base-utils';
import utc from 'dayjs/plugin/utc';
import { NavBar, Toast, Dropdown, DatePicker } from 'antd-mobile';
import { FilterOutline } from 'antd-mobile-icons';
import { goPrePageInAPP } from '~/utils/url';
import NetDepositList from '~/components/net-deposit-list';
import { ConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import zhTW from 'antd-mobile/es/locales/zh-TW';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import dayjs from 'dayjs';
import { SafeArea } from 'antd-mobile';

dayjs.extend(utc);
const now = new Date();

const TransactionHistory = (props) => {
  const t = useFm();
  const ref = useRef(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false); //日期选择器
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTimeStamp, setStartTimeStamp] = useState(0); //接口用时间戳
  const [endTimeStamp, setEndTimeStamp] = useState(0); //接口用时间戳
  const [dateType, setDateType] = useState(''); // start date or end date
  const [searchParams, setSearchParams] = useState({}); //搜索参数
  const childRef = useRef(null);

  const handleSelectStartTime = (type) => {
    setDateType(type);
    setDatePickerVisible(true);
  };

  const handleResetSearchParams = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setStartTimeStamp(0);
    setEndTimeStamp(0);
    setSearchParams({});
  }, []);

  const getParamsUtcTimeStamp = (time) => {
    return time ? dayjs.utc(time).valueOf() : 0;
  };

  const handleConfirmSearch = useCallback(() => {
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
      start_date: startTimeStamp,
      end_date: endTimeStamp
    };

    setSearchParams(params);
    ref.current?.close();
  }, [t, endDate, endTimeStamp, startDate, startTimeStamp]);

  const handleRefresh = () => {
    childRef.current.handleRefresh();
  };

  //
  const right = useMemo(
    () => (
      <div className={styles.rightWrapper}>
        <span className={styles.refreshIcon} onClick={handleRefresh} />
        <Dropdown ref={ref}>
          <Dropdown.Item
            key="sorter"
            title={<FilterOutline style={{ fontSize: '20px' }} />}
          >
            <div className={styles.dropdown}>
              <div className={styles.dropdown_row}>
                <p className={styles.dropdown_row_title}>{t('dateRange')}</p>
                <div className={styles.dropdown_picker}>
                  <span
                    className={styles.dropdown_picker_date}
                    onClick={() => handleSelectStartTime('startDate')}
                  >
                    {startDate || t('startDate')}
                  </span>
                  <span>-</span>
                  <span
                    className={styles.dropdown_picker_date}
                    onClick={() => handleSelectStartTime('endDate')}
                  >
                    {endDate || t('endDate')}
                  </span>
                </div>
              </div>

              <footer className={styles.dropdown_footer}>
                <span
                  className={styles.dropdown_footer_reset}
                  onClick={handleResetSearchParams}
                >
                  {t('reset')}
                </span>
                <span
                  className={styles.dropdown_footer_confirm}
                  onClick={handleConfirmSearch}
                >
                  {t('confirm')}
                </span>
              </footer>
            </div>
          </Dropdown.Item>
        </Dropdown>
      </div>
    ),
    [startDate, endDate, handleResetSearchParams, handleConfirmSearch, t]
  );

  const antdLocalMap = {
    'en-US': enUS,
    'zh-TW': zhTW,
    'zh-CN': zhCN
  };

  return (
    <ConfigProvider locale={antdLocalMap[props.locale] || enUS}>
      <TransactionHistoryProvider>
        <div className={styles.container}>
          <SafeArea position="top" />
          <div className={styles.head}>
            <NavBar right={right} onBack={goPrePageInAPP}>
              {t('netDepositStatistics')}
            </NavBar>
          </div>
          <div className={styles.content}>
            <NetDepositList searchParams={searchParams} ref={childRef} />
          </div>

          <DatePicker
            title={t('selectDate')}
            visible={datePickerVisible}
            onClose={() => {
              setDatePickerVisible(false);
            }}
            // precision="second"
            max={now}
            onConfirm={(val) => {
              if (dateType === 'startDate') {
                if (endTimeStamp && endTimeStamp < getParamsUtcTimeStamp(val)) {
                  Toast.show({
                    content: t('dateErrorTips'),
                    duration: 2000
                  });
                  return;
                }
                setStartDate(dayjs(val).format('YYYY-MM-DD'));

                setStartTimeStamp(getParamsUtcTimeStamp(val));
              } else {
                if (
                  startTimeStamp &&
                  startTimeStamp > getParamsUtcTimeStamp(val)
                ) {
                  Toast.show({
                    content: t('dateErrorTips'),
                    duration: 2000
                  });
                  return;
                }
                setEndDate(dayjs(val).format('YYYY-MM-DD'));
                setEndTimeStamp(getParamsUtcTimeStamp(val));
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

export default withLayout(TransactionHistory);
