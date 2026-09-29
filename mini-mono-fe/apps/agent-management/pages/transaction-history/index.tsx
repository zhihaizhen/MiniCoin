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
import { getLang } from '@better-bit-fe/base-utils';
import { TransactionHistoryProvider } from '~/context/transactionHistoryContext';
import styles from './index.module.less';
import { ConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import zhTW from 'antd-mobile/es/locales/zh-TW';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import utc from 'dayjs/plugin/utc';
import {
  NavBar,
  SearchBar,
  Toast,
  Tabs,
  Swiper,
  Dropdown,
  DatePicker
} from 'antd-mobile';
import { Dropdown as AntDropdown } from 'antd';
import { FilterOutline } from 'antd-mobile-icons';
import { goPrePageInAPP } from '~/utils/url';
import { SwiperRef } from 'antd-mobile/es/components/swiper';
import UserOverviewList from '~/components/user-overview-list';
import UserAssetsList from '~/components/user-assets-list';
import UserOpenPositionList from '~/components/user-open-position-list';
import UserPLRecordsList from '~/components/user-pl-records-list';
import dayjs from 'dayjs';
import { SafeArea } from 'antd-mobile';

dayjs.extend(utc);
const tabItems = [
  { key: 'userOverview', title: 'User Overview' },
  { key: 'userAssets', title: 'User Assets' }
  // { key: 'openPositions', title: 'Open Positions' },
  // { key: 'plRecords', title: 'P&L Records' }
];
const now = new Date();
const filterTypeList = ['All', 'Deposit', 'Withdrawal'];

const TransactionHistory = (props) => {
  const t = useFm();
  const swiperRef = useRef<SwiperRef>(null);
  const searchRef = useRef<SearchBarRef>(null);
  const ref = useRef<DropdownRef>(null);
  const [tabIndex, setTabIndex] = useState(0); //tab index
  const [currentType, setCurrentType] = useState('All');
  const [datePickerVisible, setDatePickerVisible] = useState(false); //日期选择器
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTimeStamp, setStartTimeStamp] = useState(0); //接口用时间戳
  const [endTimeStamp, setEndTimeStamp] = useState(0); //接口用时间戳
  const [dateType, setDateType] = useState(''); // start date or end date
  const [searchType, setSearchType] = useState('user_id'); // search type
  const [searchUserIdValue, setSearchUserIdValue] = useState('');
  const [searchUserRemarkValue, setUserSearchRemarkValue] = useState('');
  const [searchParams, setSearchParams] = useState({}); //搜索参数
  const [isClickTab, setIsClickTab] = useState(true);

  const tab0Ref = useRef(null);
  const tab1Ref = useRef(null);
  const tab2Ref = useRef(null);
  const tab3Ref = useRef(null);

  useEffect(() => {
    // 只有点击tab切换的时候才重置搜索条件
    if (!isClickTab) {
      return;
    }
    let params = {};
    if (tabIndex === 0 || tabIndex === 2) {
      params = { user_id: '' };
    } else if (tabIndex === 1) {
      params = {
        user_id: '',
        type: 'All',
        start_date: startTimeStamp,
        end_date: endTimeStamp
      };
    } else {
      params = {
        user_id: '',
        start_date: startTimeStamp,
        end_date: endTimeStamp
      };
    }
    setSearchParams(params);
    console.log('tab change params', params);
  }, [tabIndex, isClickTab]);

  const handleSetSearchVal = useCallback(
    (value) => {
      searchType === 'user_id'
        ? setSearchUserIdValue(value)
        : setUserSearchRemarkValue(value);
    },
    [searchType]
  );

  const handleSelectSearchType = (e) => {
    const { key } = e;
    setSearchType(key);
    searchRef.current?.clear();
  };

  const handleSelectStartTime = (type) => {
    setDateType(type);
    setDatePickerVisible(true);
  };

  const handleResetSearchParams = useCallback(() => {
    setSearchUserIdValue('');
    setUserSearchRemarkValue('');
    searchRef.current?.clear();
    setStartDate('');
    setEndDate('');
    setStartTimeStamp(0);
    setEndTimeStamp(0);
    setCurrentType('All');
    setSearchType('user_id');
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
    let params = {};
    if (tabIndex === 0 || tabIndex === 2) {
      params =
        searchType === 'user_id'
          ? { user_id: searchUserIdValue }
          : { remark: searchUserRemarkValue };
    } else if (tabIndex === 1) {
      params =
        searchType === 'user_id'
          ? {
            user_id: searchUserIdValue,
            type: currentType,
            start_date: startTimeStamp,
            end_date: endTimeStamp
          }
          : {
            remark: searchUserRemarkValue,
            type: currentType,
            start_date: startTimeStamp,
            end_date: endTimeStamp
          };
    } else {
      params =
        searchType === 'user_id'
          ? {
            user_id: searchUserIdValue,
            start_date: startTimeStamp,
            end_date: endTimeStamp
          }
          : {
            remark: searchUserRemarkValue,
            start_date: startTimeStamp,
            end_date: endTimeStamp
          };
    }
    setSearchParams(params);
    console.log('params', params);
    ref.current?.close();
  }, [
    t,
    currentType,
    endDate,
    endTimeStamp,
    searchType,
    searchUserIdValue,
    searchUserRemarkValue,
    startDate,
    startTimeStamp,
    tabIndex
  ]);

  const handleRefresh = () => {
    switch (tabIndex) {
      case 0:
        console.log('reff', tab0Ref.current);
        tab0Ref.current?.handleRefresh();
        break;
      case 1:
        tab1Ref.current?.handleRefresh();
        break;
      case 2:
        tab2Ref.current?.handleRefresh();
        break;
      case 3:
        tab3Ref.current?.handleRefresh();
        break;

      default:
        break;
    }
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
            <div className={styles.dropdown}>
              <div className={styles.dropdown_row}>
                <div className={styles.dropdown_search}>
                  <AntDropdown
                    menu={{
                      items: [
                        {
                          key: 'user_id',
                          label: t('user_id')
                        },
                        {
                          key: 'user_remarks',
                          label: t('user_remarks')
                        }
                      ],
                      onClick: handleSelectSearchType,
                      selectable: true,
                      selectedKeys: [searchType]
                    }}
                  >
                    <div className={styles.dropdown_search_left}>
                      <span className={styles.dropdown_search_text}>
                        {t(`${searchType}`)}
                      </span>
                      <span className={styles.dropdown_search_icon} />
                    </div>
                  </AntDropdown>
                  <div className={styles.dropdown_search_right}>
                    <SearchBar
                      ref={searchRef}
                      value={
                        searchType === 'user_id'
                          ? searchUserIdValue
                          : searchUserRemarkValue
                      }
                      placeholder={
                        searchType === 'user_id'
                          ? t('inputUserIdTips')
                          : t('inputUserRemarksTips')
                      }
                      style={{
                        '--border-radius': '0 4px 4px 0',
                        '--background': '#222',
                        '--placeholder-color': '#666'
                      }}
                      onChange={(e) => handleSetSearchVal(e)}
                    />
                  </div>
                </div>
              </div>
              {tabIndex === 1 && (
                <div className={styles.dropdown_row}>
                  <p className={styles.dropdown_row_title}>{t('type')}</p>
                  <div className={styles.dropdown_tab}>
                    {filterTypeList.map((item) => (
                      <span
                        className={
                          currentType === item
                            ? styles.dropdown_tab_active
                            : styles.dropdown_tab_item
                        }
                        key={item}
                        onClick={() => setCurrentType(item)}
                      >
                        {t(`${item}`)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(tabIndex === 1 || tabIndex === 3) && (
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
              )}
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
    [
      searchType,
      searchUserIdValue,
      searchUserRemarkValue,
      tabIndex,
      startDate,
      endDate,
      handleResetSearchParams,
      handleConfirmSearch,
      t,
      handleSetSearchVal,
      currentType
    ]
  );

  const goToOpenPosition = (item) => {
    const { tabIndex, user_id } = item;
    setTabIndex(tabIndex);
    setSearchUserIdValue(user_id);
    setSearchParams({
      user_id
    });
    setIsClickTab(false);
    swiperRef.current?.swipeTo(tabIndex);
  };

  const goToPlRecord = (item) => {
    const { tabIndex, user_id } = item;
    setTabIndex(tabIndex);
    setSearchUserIdValue(user_id);
    setSearchParams({
      user_id
    });
    setIsClickTab(false);
    swiperRef.current?.swipeTo(tabIndex);
  };

  const handleTabChange = (key) => {
    const index = tabItems.findIndex((item) => item.key === key);
    setTabIndex(index);
    setIsClickTab(true);
    swiperRef.current?.swipeTo(index);
    // 切换tab时清空搜索条件
    handleResetSearchParams();
  };

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
              {t('transactionHistory')}
            </NavBar>
          </div>
          <div className={styles.tab_container}>
            <Tabs
              className={styles.tabs}
              activeKey={tabItems[tabIndex].key}
              onChange={(key) => handleTabChange(key)}
              style={{
                '--active-line-color': 'var(--text-brand-default)',
                '--active-title-color': '#fff',
                '--content-padding': '16px',
                '--title-font-size': '14px'
              }}
            >
              {tabItems.map((item) => (
                <Tabs.Tab title={t(`${item.key}`)} key={item.key} />
              ))}
            </Tabs>
          </div>
          <div className={styles.body_container}>
            <Swiper
              direction="horizontal"
              loop
              indicator={() => null}
              ref={swiperRef}
              defaultIndex={tabIndex}
              onIndexChange={(index) => {
                setTabIndex(index);
              }}
            >
              <Swiper.Item>
                <div className={styles.swiperContainer}>
                  <UserOverviewList
                    ref={tab0Ref}
                    searchParams={searchParams}
                    tabIndex={tabIndex}
                    goToOpenPosition={goToOpenPosition}
                    goToPlRecord={goToPlRecord}
                  />
                </div>
              </Swiper.Item>
              <Swiper.Item>
                <div className={styles.swiperContainer}>
                  <UserAssetsList
                    ref={tab1Ref}
                    searchParams={searchParams}
                    tabIndex={tabIndex}
                  />
                </div>
              </Swiper.Item>
              <Swiper.Item>
                <div className={styles.swiperContainer}>
                  <UserOpenPositionList
                    ref={tab2Ref}
                    searchParams={searchParams}
                    tabIndex={tabIndex}
                  />
                </div>
              </Swiper.Item>
              <Swiper.Item>
                <div className={styles.swiperContainer}>
                  <UserPLRecordsList
                    ref={tab3Ref}
                    searchParams={searchParams}
                    tabIndex={tabIndex}
                  />
                </div>
              </Swiper.Item>
            </Swiper>
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
