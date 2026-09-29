//@ts-nocheck
import React, {
  useCallback,
  useEffect,
  useInsertionEffect,
  useState
} from 'react';
import { Select, Table, DatePicker, Button, Spin } from 'antd';
import { ActionSheet, CalendarPicker } from 'antd-mobile';
import { DownFill } from 'antd-mobile-icons';
import styles from './index.module.less';
import { getFundFeeList } from '~/api';
import { transformNum } from '@unified/helpers';
import { formatThousandDigit } from '~/utils';
import { ReactComponent as BackWeb } from '../../public/icons/back-web.svg';
import { ReactComponent as BackH5 } from '../../public/icons/back-h5.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import BigNumber from 'bignumber.js';
import { unixToFormat } from '~/utils/day';
import dayjs from 'dayjs';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { sortByKey } from '~/utils';
import { contractTypeOptions, contractTypeMap } from '~/constants';
import { useDynamicSymbolHook } from '~/hooks/useDynamicHook';

const { staticFolder } = getConfig().publicRuntimeConfig;
const { RangePicker } = DatePicker;
const defaultRange: [Date, Date] = [
  dayjs().subtract(7, 'day').toDate() / 1000,
  dayjs().toDate() / 1000
];

const min = new Date();
min.setDate(1);
min.setMonth(min.getMonth() - 72);

const FundFee = () => {
  // const [symbolOptions, setSymbol] = useState([]);
  // const [selectSymbol, setSelectSymbol] = useState('');
  const { query, isReady } = useRouter();
  const { contractType, symbol } = query;

  const { allSymbols, loading: dynamicLoading } = useDynamicSymbolHook(); //
  const [symbolOptions, setSymbolOptions] = useState([]);
  const [selectSymbolKey, setSelectSymbolKey] = useState(symbol); //  接口传参用
  const [selectContractType, setSelectContractType] = useState(contractType);
  const [data, setData] = useState([]);
  // const [visible, setVisible] = useState(false);
  const [symbolVisible, setSymbolVisible] = useState(false);
  const [contractTypeVisible, setContractTypeVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [date, setDate] = useState({
    from: defaultRange[0],
    to: defaultRange[1]
  });
  const [bottom, setBottom] = useState('bottomRight');

  const t = useFm();
  let isFirstRender = true;

  const columns = [
    {
      title: t('time'),
      key: 'maxLeverageE2',
      render: (_, record) => <span>{unixToFormat(record.time * 1000)}</span>
    },
    {
      title: t('status'),
      key: 'valueE8',
      render: (_, record) => (
        <span>
          {BigNumber(record.valueE8)?.dividedBy(1e6)?.toString() + '%'}
        </span>
      )
    }
  ];
  useInsertionEffect(() => {
    if (isFirstRender) {
      setLoading(true);
      isFirstRender = false;
    } else {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (!selectSymbolKey || !isReady) return;
    getFundFeeList({
      symbol: selectSymbolKey,
      from: Math.floor(date.from),
      to: Math.floor(date.to)
    }).then((res) => {
      setData(res?.list);
      setLoading(false);
    });
  }, [date.from, date.to, selectSymbolKey, isReady]);

  const fetchData = () => {
    if (!selectSymbolKey) return;
    getFundFeeList({
      symbol: selectSymbolKey,
      from: Math.floor(date.from),
      to: Math.floor(date.to)
    }).then((res) => {
      setData(res?.list);
      setLoading(false);
    });
  };

  // const handleSymbol = (value) => {
  //   setSelectSymbol(value);
  // };

  useEffect(() => {
    // init
    if (!isReady) return;
    if (symbol && contractType) {
      setSelectContractType(contractType);
      const list = allSymbols?.[contractType] || [];
      const symbols = list?.map((item) => ({
        label: item?.symbolAlias,
        value: item?.symbolName
      }));
      setSymbolOptions(symbols);
      const item = symbols.find((it) => it.label === symbol);
      if (contractType === contractTypeMap.LinearPerpetual) {
        setSelectSymbolKey(item?.value);
      } else {
        setSelectSymbolKey(item?.label);
      }
    } else {
      const list = allSymbols?.[contractTypeMap.LinearPerpetual] || [];
      const symbols = list?.map((item) => ({
        label: item?.symbolAlias,
        value: item?.symbolName
      }));
      setSymbolOptions(symbols);
      setSelectContractType(contractTypeMap.LinearPerpetual);
      setSelectSymbolKey('BTCUSDT');
    }
  }, [allSymbols, contractType, symbol, isReady]);

  const handleSymbol = (value) => {
    setSelectSymbolKey(value);
  };

  const handleContractType = (value) => {
    setSelectContractType(value);
    const list = allSymbols?.[value] || [];
    const symbols = list?.map((item) => ({
      label: item?.symbolAlias,
      value:
        value === contractTypeMap.InversePerpetual
          ? item?.symbolAlias
          : item?.symbolName
    }));
    setSelectSymbolKey(symbols[0]?.value);
    setSymbolOptions(symbols);
  };
  const handleDate = (dates, dateStrings) => {
    if (dates?.length) {
      const from = dayjs(dates[0].valueOf()).startOf('day').unix();
      // const to = dates[1].valueOf() / 1000;
      const to = dayjs(dates[1].valueOf()).endOf('day').unix();
      setDate({
        from,
        to
      });
    } else {
      setDate({
        from: 956399226,
        to: new Date().getTime() / 1000
      });
    }
  };

  if (loading || dynamicLoading) {
    return (
      <div className={styles['loading-box']}>
        <Spin size="large" />
        {/* <div className={styles['img']}></div> */}
      </div>
    );
  }

  return (
    <div className={styles['wrapper']}>
      <div className={styles['header']}>
        {/* <div className={styles['symbol']} onClick={() => setVisible(true)}>
          {selectSymbolKey?.replace('M1', '')}
          <DownFill />
        </div>
        <ActionSheet
          visible={visible}
          actions={symbolOptions?.map((item) => ({
            ...item,
            text: item?.label,
            key: item?.value
          }))}
          onClose={() => setVisible(false)}
          onAction={(action) => {
            setVisible(false);
            setSelectSymbol(action.key.toString());
          }}
        /> */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
          <div
            className={styles['symbol']}
            onClick={() => setContractTypeVisible(true)}
          >
            {selectContractType && t(selectContractType)}
            <DownFill />
          </div>
          <div
            className={styles['symbol']}
            onClick={() => setSymbolVisible(true)}
          >
            {
              symbolOptions.filter((it) => it.value === selectSymbolKey)?.[0]
                ?.label
            }
            <DownFill />
          </div>
        </div>

        <ActionSheet
          visible={contractTypeVisible}
          cancelText={t('cancel')}
          safeArea={true}
          actions={contractTypeOptions.map((item) => ({
            ...item,
            text: t(item?.label),
            key: item?.value
          }))}
          onClose={() => setContractTypeVisible(false)}
          onAction={(action) => {
            setContractTypeVisible(false);
            handleContractType(action.key.toString());
          }}
        />
        <ActionSheet
          visible={symbolVisible}
          cancelText={t('cancel')}
          safeArea={true}
          actions={symbolOptions
            .sort(function (a, b) {
              const nameA = a.label.toUpperCase(); // 转换为大写字母以忽略小写
              const nameB = b.label.toUpperCase();
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              // 名字相同，则按照 'value' 排序
            })
            ?.map((item) => ({
              ...item,
              text: item?.label,
              key: item?.value
            }))}
          onClose={() => setSymbolVisible(false)}
          onAction={(action) => {
            setSymbolVisible(false);
            setSelectSymbolKey(action.key.toString());
          }}
        />
        <div className={styles['title-box']}>
          <h1 className={styles['title']}>
            {t('fundfee-title', '历史资金费率')}
          </h1>
        </div>
        <div className={styles['desc']}>
          {t(
            'fundfee-desc',
            'BTCUSDT 永续合约的资金历史记录如下所示。资金费用将在资金结算后立即处理。'
          )
            .replace('{symbol}', selectSymbolKey)
            ?.replace('M1', '')}
        </div>

        <div className={styles['filter-select']}>
          <div className={styles['label']}>{t('futures-type')}</div>
          <Select
            className={cls(styles['select'], styles['select-contractType'])}
            options={contractTypeOptions.map((item) => ({
              label: t(item?.label),
              value: item?.value
            }))}
            value={selectContractType}
            onChange={handleContractType}
          />
        </div>
        <div className={styles['filter-select']}>
          <div className={styles['label']}>{t('contract')}</div>
          <Select
            showSearch
            className={styles['select']}
            options={symbolOptions.sort(function (a, b) {
              const nameA = a.label.toUpperCase(); // 转换为大写字母以忽略小写
              const nameB = b.label.toUpperCase();
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              // 名字相同，则按照 'value' 排序
            })}
            value={selectSymbolKey}
            onChange={handleSymbol}
          />
        </div>
        {/* <Select
          showSearch
          className={styles['select']}
          options={symbolOptions?.map((item) => ({
            ...item,
            label: item?.label,
            key: item?.value
          }))}
          value={selectSymbol}
          onChange={handleSymbol}
        /> */}
        {/*<div className={cls(styles['time'], styles.label)}>{t('time')}</div>*/}
        {/*<div className={styles['rangePicker']}>*/}
        {/*  <RangePicker*/}
        {/*    className={styles['web-rangePicker']}*/}
        {/*    // showTime*/}
        {/*    onChange={handleDate}*/}
        {/*  />*/}
        {/*  <Button*/}
        {/*    className={styles['select-time']}*/}
        {/*    onClick={() => setPickerVisible(true)}*/}
        {/*  >*/}
        {/*    /!* {t('select-time')} *!/*/}
        {/*    {`${unixToFormat(date?.from * 1000, 'YYYY-MM-DD')}~${unixToFormat(*/}
        {/*      date?.to * 1000,*/}
        {/*      'YYYY-MM-DD'*/}
        {/*    )}`}*/}
        {/*  </Button>*/}

        {/*  <CalendarPicker*/}
        {/*    className={styles['h5-rangePicker']}*/}
        {/*    min={min}*/}
        {/*    visible={pickerVisible}*/}
        {/*    // defaultValue={defaultRange}*/}
        {/*    selectionMode="range"*/}
        {/*    onClose={() => setPickerVisible(false)}*/}
        {/*    onMaskClick={() => setPickerVisible(false)}*/}
        {/*    onChange={handleDate}*/}
        {/*  />*/}
        {/*  <Button type="primary" onClick={fetchData}>*/}
        {/*    {t('query')}*/}
        {/*  </Button>*/}
        {/*</div>*/}
      </div>

      <Table
        className={styles['table']}
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.id}
        loading={loading || dynamicLoading}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          position: ['bottomCenter']
        }}
      />
    </div>
  );
};

export default FundFee;
