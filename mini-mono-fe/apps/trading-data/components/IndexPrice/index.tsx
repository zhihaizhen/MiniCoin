//@ts-nocheck
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useInsertionEffect
} from 'react';
import {
  Radio,
  RadioChangeEvent,
  Select,
  Table,
  Button,
  DatePicker,
  Spin
} from 'antd';
import { ActionSheet, CalendarPicker } from 'antd-mobile';
import { DownFill } from 'antd-mobile-icons';
import styles from './index.module.less';
import { getRiskLimitList } from '~/api';
import { transformNum } from '@unified/helpers';
import { formatThousandDigit } from '~/utils';
import { ReactComponent as BackWeb } from '../../public/icons/back-web.svg';
import { ReactComponent as BackH5 } from '../../public/icons/back-h5.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { getIndexKlineList } from '~/api';
import { unixToFormat } from '~/utils/day';
import { isApp, isPC } from '@better-bit-fe/base-utils';
import { getLang } from '@better-bit-fe/base-utils';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
// import loadingPath from '../../public/icons/loading.gif';
import dayjs from 'dayjs';
import { debounce } from '~/utils';
import cls from 'classnames';
import { contractTypeOptions, contractTypeMap } from '~/constants';
import { useDynamicSymbolHook } from '~/hooks/useDynamicHook';
import { useKlineChart } from '~/hooks/useKlineChart';

const { staticFolder } = getConfig().publicRuntimeConfig;
const { RangePicker } = DatePicker;
const resolutionMap = {
  1: 3,
  5: 15,
  30: 90,
  60: 90,
  D: 180,
  W: 180,
  M: 180
};
const resolutionLabelMap = {
  1: '1m',
  5: '5m',
  30: '30m',
  60: '60m',
  D: 'D',
  W: 'W',
  M: 'M'
};

const Price = () => {
  const t = useFm();
  // const [symbolOptions, setSymbol] = useState([]);
  // const [selectSymbol, setSelectSymbol] = useState('');
  const { allSymbols, loading: dynamicLoading } = useDynamicSymbolHook(); //
  const [symbolOptions, setSymbolOptions] = useState([]);
  const [selectSymbolKey, setSelectSymbolKey] = useState(); //  接口传参用
  const [selectContractType, setSelectContractType] = useState('');
  const [symbolVisible, setSymbolVisible] = useState(false);
  const [contractTypeVisible, setContractTypeVisible] = useState(false);

  const [visible, setVisible] = useState(false);
  const [resolution, setResolution] = useState('1');
  const [bottom, setBottom] = useState('bottomRight');
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [disableRangeTime, setDisableRangeTime] = useState(false);
  const [rangeValue1, setValue1] = useState(null);
  const [date, setDate] = useState({
    from: getTimestamps()['1'] / 1000,
    to: new Date().getTime() / 1000
  });
  let isFirstRender = true;
  const lang = getLang() || 'en-US';

  const { query } = useRouter();
  const { contractType, symbol } = query;

  function getTimestamps() {
    const now = Date.now();
    const oneMinute = 60000;
    const fiveMinutes = oneMinute * 5;
    const thirtyMinutes = oneMinute * 30;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;
    const oneWeek = oneDay * 7;
    const oneMonth = oneDay * 30;

    return {
      1: now - oneDay * 3,
      5: now - oneDay * 15,
      30: now - oneDay * 90,
      60: now - oneDay * 90,
      D: now - oneDay * 180,
      W: now - oneDay * 180,
      M: now - oneDay * 180
    };
  }

  useInsertionEffect(() => {
    if (isFirstRender) {
      setTableLoading(true);
      console.log('这是首次渲染');
      isFirstRender = false;
    } else {
      setTableLoading(false);
      console.log('这是更新渲染');
    }
  }, []); //

  useEffect(() => {
    const querySymbol = Array.isArray(symbol) ? symbol[0] : symbol;
    const queryContractType = Array.isArray(contractType)
      ? contractType[0]
      : contractType;

    const buildOptions = (type) => {
      const list = allSymbols?.[type] || [];
      return list.map((item) => ({
        label: item?.symbolAlias,
        value:
          type === contractTypeMap.InversePerpetual
            ? item?.symbolAlias
            : item?.symbolName
      }));
    };

    const findInType = (type, sym) => {
      const options = buildOptions(type);
      const item = options.find((it) => it.label === sym || it.value === sym);
      return item ? { type, options, item } : null;
    };

    // 同时带 symbol + contractType
    if (querySymbol && queryContractType) {
      const found = findInType(queryContractType, querySymbol);
      if (found) {
        setSelectContractType(found.type);
        setSymbolOptions(found.options);
        setSelectSymbolKey(found.item.value);
        return;
      }
    }

    // 仅 ?symbol=xx：在各合约类型中反查并填充两个 Select
    if (querySymbol) {
      const searchTypes = [
        contractTypeMap.LinearPerpetual,
        contractTypeMap.FreeUPerpetual,
        contractTypeMap.InversePerpetual
      ];
      for (const type of searchTypes) {
        const found = findInType(type, querySymbol);
        if (found) {
          setSelectContractType(found.type);
          setSymbolOptions(found.options);
          setSelectSymbolKey(found.item.value);
          return;
        }
      }
    }

    // 默认 USDT 合约 + BTCUSDT
    const options = buildOptions(contractTypeMap.LinearPerpetual);
    setSymbolOptions(options);
    setSelectContractType(contractTypeMap.LinearPerpetual);
    setSelectSymbolKey('BTCUSDT');
  }, [allSymbols, contractType, symbol]);

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

  function getYesterdayTimestamp() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.getTime();
  }

  useEffect(() => {
    if (!selectSymbolKey) return;
    getIndexKlineList({
      symbol: selectSymbolKey,
      resolution: '1',
      from: Math.floor(getYesterdayTimestamp() / 1000),
      to: Math.floor(new Date().getTime() / 1000)
    }).then((res) => {
      const list = allSymbols?.[selectContractType] || [];
      const symbols = list?.filter((item) => item.symbolName === selectSymbolKey)?.[0];
      res?.list.forEach((item, index) => {
        item.time = item.startAt;
        item.startAt = item.startAt;
        item.close = item.close.toFixed(symbols?.priceFraction || 2);
        return item;
      });
      if (res?.list?.length) {
        const result = res?.list?.reverse();
        setTableData(result);
        setTableLoading(false);
      }
    });
  }, [selectSymbolKey, allSymbols]);

  // 图表挂载的 DOM 节点：用回调 ref 拿到，避免和页面 loading 状态的时序竞态
  const [chartContainer, setChartContainer] = useState(null);
  const priceFraction = allSymbols?.[selectContractType]?.find(
    (item) => item.symbolName === selectSymbolKey
  )?.priceFraction;

  const { loading: chartLoading } = useKlineChart({
    container: chartContainer,
    fetchKline: getIndexKlineList,
    symbol: selectSymbolKey,
    resolution,
    dateRange: date,
    priceFraction,
    lang,
    t
  });

  const columns = [
    {
      title: t('time'),
      dataIndex: 'startAt',
      render: (_, record, index) => (
        <span>{unixToFormat(record?.startAt * 1000)}</span>
      )
    },
    {
      title: t('index-price-tag', '指数价格'),
      key: 'open',
      render: (_, record) => <span>{record.close}</span>
    }
  ];


  const onChangeTime = ({ target: { value } }: RadioChangeEvent) => {
    setResolution(value);
    // setValue1(null);
    setDisableRangeTime(value === 'W' || value === 'M');
    setDate({
      from: getTimestamps()[value] / 1000,
      to: new Date().getTime() / 1000
    });
  };

  const disabledDate = useCallback(
    (current, p) => {
      const tm = {
        '1': 3,
        '5': 15,
        '60': 90
      };
      if (p?.from && tm[resolution]) {
        return Math.abs(current.diff(p?.from, 'days')) >= tm[resolution];
      }
      return false;
    },
    [resolution]
  );

  const shouldDisableDate = useCallback((date) => {
    console.log('ztf---date', date);
  }, []);

  const toTrade = () => {
    if (
      isApp() &&
      typeof window !== undefined &&
      window?.flutter_inappwebview
    ) {
      // const jsonPrams = JSON.stringify({
      //   symbol: selectSymbol.replace('M1', '') || 'BTCUSDT'
      // });
      // window?.flutter_inappwebview?.callHandler(
      //   '_b_bridge_Navigator_',
      //   jsonPrams
      // );
      const param = {
        methodName: 'push',
        moduleName: '_b_bridge_Router_',
        uniqueId: 'handleInvite', // 用于回调
        params: {
          path: 'https://www.easicoin.io/contract/trade',
          symbol: selectSymbolKey || 'BTCUSDT'
        }
      };
      const jsonPrams = JSON.stringify(param);
      window.flutter_inappwebview.callHandler('_b_bridge_Router_', jsonPrams);
    } else {
      if (selectContractType === 'InversePerpetual') {
        window.open(
          `${location.origin}/${lang}/trade/inverse/${selectSymbolKey?.replace('M1', '') || 'BTCUSDT'
          }`
        );
      } else {
        window.open(
          `${location.origin}/${lang}/trade/usdt/${selectSymbolKey?.replace('M1', '') || 'BTCUSDT'
          }`
        );
      }
    }
  };

  const handleDate = (dates, dateStrings) => {
    // setValue1(dates);
    if (dates.length) {
      const from = dayjs(dates[0].valueOf()).startOf('day').unix();
      const to = dates[1].valueOf() / 1000;
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

  if (tableLoading || dynamicLoading || chartLoading) {
    return (
      <div className={styles['loading-box']}>
        {/* <div className={styles['img']}></div> */}
        <Spin size="large" />
      </div>
    );
  }
  return (
    <div className={styles['wrapper']}>
      <div className={styles['header']}>
        <div className={styles['header-row1']}>
          {/* <div className={styles['symbol']} onClick={() => setVisible(true)}>
            {selectSymbol.replace('M1', '')}
            <DownFill />
          </div> */}
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
            console.log('setSelectContractType', action);
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
        <h1 className={styles['title']}>
          {t('index-price-tag', '指数价格')}
        </h1>
        <div className={styles['select-box-wrapper']}>
          <div className={styles['select-box']}>
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
          </div>
          <Button
            className={styles['trade-web']}
            type="primary"
            onClick={toTrade}
          >
            {t('to-trade')}
          </Button>
        </div>
        <div className={styles['tips']}>
          {' '}
          {t('select-time-tips')
            .replace('{resolution}', resolutionLabelMap[resolution])
            .replace('{d}', resolutionMap[resolution])}
        </div>
        <div className={styles['history-price-tag-desc']}>
          {t('index-price-tag', '{symbol}指数价格')
            .replace('{symbol}', selectSymbolKey)
            .replace('M1', '')}
        </div>
        <div className={styles['resolution']}>
          <Radio.Group
            className={styles['range-wrapper']}
            onChange={onChangeTime}
            value={resolution}
            buttonStyle="solid"
          >
            <Radio.Button value="1">{t('1m')}</Radio.Button>
            <Radio.Button value="5">{t('5m')}</Radio.Button>
            <Radio.Button value="30">{t('30m')}</Radio.Button>
            <Radio.Button value="60">{t('60m')}</Radio.Button>
            <Radio.Button value="D">{t('day')}</Radio.Button>
            <Radio.Button value="W">{t('week')}</Radio.Button>
            <Radio.Button value="M">{t('month')}</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <div
        id={'chartContainer'}
        ref={setChartContainer}
        className={styles['chartContainer']}
      ></div>
      <Table
        className={styles['table']}
        columns={columns}
        dataSource={tableData}
        rowKey={(record) => record?.startAt}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          position: ['bottomCenter']
        }}
      />
    </div>
  );
};
export default Price;
