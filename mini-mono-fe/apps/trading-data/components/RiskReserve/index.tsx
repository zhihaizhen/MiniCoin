// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Descriptions, Select, Table, Spin } from 'antd';
import { ActionSheet } from 'antd-mobile';
import styles from './index.module.less';
import { getRiskPollList } from '~/api';
import { transformNum } from '@unified/helpers';
import { formatThousandDigit } from '~/utils';
import { ReactComponent as DownFill } from '../../public/icons/arrow-small.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import getConfig from 'next/config';
import { useDynamicSymbolHook } from '~/hooks/useDynamicHook';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { isMobile } from '@better-bit-fe/base-utils';
import BigNumber from 'bignumber.js';
import { unixToFormat } from '~/utils/day';

const { staticFolder } = getConfig().publicRuntimeConfig;

const RiskReserve = () => {
  const { allSymbolList, loading: dynamicLoading } = useDynamicSymbolHook(); //
  const [symbolOptions, setSymbolOptions] = useState([]);
  const [selectSymbolKey, setSelectSymbolKey] = useState(); //  接口传参用
  const [symbolVisible, setSymbolVisible] = useState(false);

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);
  const t = useFm();

  const { query } = useRouter();
  const { contractType, symbol } = query;

  const columns = [
    {
      title: t('settlement-time'),
      dataIndex: 'createdAt',
      render: (_, record, index) => (
        <span>{transformDate(record.createdAt)}</span>
      )
    },
    {
      title: t('contract'),
      key: 'symbol',
      render: (_, record) => <span>{record.symbol.replace('M1', '')}</span>
    },
    {
      title: t('sum'),
      key: 'changeAmount',
      render: (_, record) => (
        <span>
          {`${formatThousandDigit(record.changeAmount)} ${record?.coin}`}
        </span>
      )
    },
    {
      title: t('balance'),
      key: 'balance',
      render: (_, record) => (
        <span>{`${formatThousandDigit(record.balance)} ${record?.coin}`}</span>
      )
    }
  ];

  const transformDate = (dateStr) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleString().replace(/\//g, '-');
    return formattedDate;
  };



  useEffect(() => {
    if (selectSymbolKey) {
      getRiskPollList({ symbol: selectSymbolKey }).then((res) => {
        setData(res);
        setLoading(false);
      });
    } else {
      setData(null);
      setLoading(false);
    }
  }, [selectSymbolKey]);

  useEffect(() => {
    // init
    if (symbol) {
      const symbols = allSymbolList?.map((item) => ({
        label: item?.symbolAlias,
        value: item?.symbolName
      }));
      setSymbolOptions(symbols);
      const item = symbols.find((it) => it.label === symbol);
      setSelectSymbolKey(item?.value);
    } else {
      const symbols = allSymbolList?.map((item) => ({
        label: item?.symbolAlias,
        value: item?.symbolName
      }));
      setSymbolOptions(symbols);
      setSelectSymbolKey('BTCUSDT');
    }
  }, [symbol, allSymbolList]);

  const handleSymbol = (value) => {
    setSelectSymbolKey(value);
  };

  if (loading || dynamicLoading) {
    return (
      <div className={styles['container']}>
        <div className={styles['loading-box']}>
          <Spin size="large" />
          {/* <div className={styles['img']}></div> */}
        </div>
      </div>
    );
  }

  if (isMobile()) {
    const record = data?.list?.find(
      (item) => item?.symbolName === selectSymbolKey
    );
    return (
      <div className={styles['container']}>
        <div className={styles['header']}>
          <div className={styles['title']}>{t('risk-reserve-title')}</div>
          <div
            className={styles['actionSheet']}
            onClick={() => setSymbolVisible(true)}
          >
            <ActionSheet
              visible={symbolVisible}
              cancelText={t('cancel')}
              safeArea={true}
              actions={symbolOptions?.map((item) => ({
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

            <div className={styles['symbol']}>
              <span style={{ fontWeight: 400 }}>{t('contract') + ':'}</span>
              {
                symbolOptions?.filter((it) => it.value === selectSymbolKey)?.[0]
                  ?.label
              }
            </div>
            <DownFill />
          </div>
          {/* <div className={styles['total']}>
            <div className={styles['total-title']}>
              {t('all-contract-risk-reserve')}
            </div>
            <div className={styles['total-balance-value']}>
              <span>{formatThousandDigit(data?.totalBalance)}</span>
              <span className={styles['coin']}>{data?.coin}</span>
            </div>
          </div> */}
        </div>
        <div className={styles['content']}>
          <div className={styles['list']}>
            {data?.list?.map((item) => (
              <>
                <div className={styles['line']} />
                <div className={styles['list-item']} key={item?.symbol}>
                  <div className={styles['list-item-symbol']}>
                    {item?.symbol.replace('M1', '')}
                  </div>

                  <div className={styles['key-value']}>
                    <span className={styles['key']}>
                      {t('settlement-time')}
                    </span>
                    <span className={styles['value']}>
                      {transformDate(item?.createdAt)}
                    </span>
                  </div>
                  <div className={styles['key-value']}>
                    <span className={styles['key']}>{t('sum')}</span>
                    <span className={styles['value']}>
                      {`${formatThousandDigit(item?.changeAmount)} ${item?.coin
                        }`}
                    </span>
                  </div>
                  <div className={styles['key-value']}>
                    <span className={styles['key']}>{t('balance')}</span>
                    <span className={styles['value']}>
                      {`${formatThousandDigit(item?.balance)} ${item?.coin}`}
                    </span>
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles['container']}>
      <div className={styles['wrapper']}>
        <div className={styles['header']}>
          <div className={styles['title']}>{t('risk-reserve-title')}</div>
          <div className={styles['filter-select']}>
            <div className={styles['label']}>{t('contract')}</div>
            <Select
              showSearch
              className={styles['select']}
              options={symbolOptions?.sort(function (a, b) {
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
        <Table
          className={styles['table']}
          pagination={false}
          columns={columns}
          dataSource={data?.list?.map((item) => ({
            ...item,
            key: item?.symbol
          }))}
          rowKey={(record) => record.id}
        />
      </div>
    </div>
  );
};
export default RiskReserve;
