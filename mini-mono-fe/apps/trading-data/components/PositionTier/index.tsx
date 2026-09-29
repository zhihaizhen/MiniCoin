// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Select, Table, Spin } from 'antd';
import cls from 'classnames';
import { ActionSheet } from 'antd-mobile';
import { DownFill } from 'antd-mobile-icons';
import SymbolFetch from '@region-lib/symbol-fetch';
import { getRiskLimitList } from '~/api';
import { transformNum } from '@unified/helpers';
import { formatThousandDigit } from '~/utils';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';
import { constants } from 'buffer';
import { getCurrentUrlParameters } from '@better-bit-fe/base-utils';
import { contractTypeOptions, contractTypeMap } from '~/constants';
import { useDynamicSymbolHook } from '~/hooks/useDynamicHook';

const PositionTier = () => {
  const { allSymbols, loading: dynamicLoading } = useDynamicSymbolHook(); //
  const [symbolOptions, setSymbolOptions] = useState([]);
  const [selectSymbolKey, setSelectSymbolKey] = useState(); //  接口传参用
  const [selectContractType, setSelectContractType] = useState('');
  const [tableCoin, setTableCoin] = useState('');
  const [data, setData] = useState([]);
  const [symbolVisible, setSymbolVisible] = useState(false);
  const [contractTypeVisible, setContractTypeVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = useFm();
  const { query } = useRouter();
  const { contractType, symbol } = getCurrentUrlParameters();

  const columns = [
    {
      title: t('position-level'),
      dataIndex: 'id',
      render: (_, record, index) => <span>{index + 1}</span>
    },
    {
      title: t('margin-times'),
      key: 'maxLeverageE2',
      render: (_, record) => (
        <span>{transformNum(record.maxLeverageE2, 1e2, 'div')}X</span>
      )
    },
    {
      title: tableCoin,
      key: 'limit',
      render: (_, record) => (
        <span>{`${formatThousandDigit(record.range[0])}~${formatThousandDigit(
          record.range[1]
        )}`}</span>
      )
    },
    {
      title: t('margin-ratio'),
      key: 'maintainMarginE8',
      render: (_, record) => (
        <span>{transformNum(record.maintainMarginE8, 1e6, 'div')}%</span>
      )
    }
  ];

  useEffect(() => {
    if (!selectSymbolKey) return;
    setLoading(true);
    getRiskLimitList(selectSymbolKey).then((res) => {
      res?.list.forEach((item, index) => {
        if (index === 0) {
          item.range = ['0', item.limit];
          return item;
        } else {
          item.range = [res?.list[index - 1].limit, item.limit];
          return item;
        }
      });
      setData(res?.list);
      const walletCoin =
        selectContractType === 'InversePerpetual'
          ? selectSymbolKey?.replace(/USD(T)?/, '')
          : selectContractType === 'FreeUPerpetual'
            ? 'FreeU'
            : 'USDT';
      setTableCoin(walletCoin);
      setLoading(false);
    });
  }, [selectSymbolKey, selectContractType]);

  useEffect(() => {
    // init
    if (symbol && contractType) {
      setSelectContractType(contractType);
      const list = allSymbols?.[contractType] || [];
      const symbols = list?.map((item) => ({
        label: item?.symbolAlias,
        value: item?.symbolName
      }));
      setSymbolOptions(symbols);

      const item = symbols.find((it) => it.label === symbol);
      setSelectSymbolKey(item?.value);
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
  }, [allSymbols, contractType, contractTypeMap.LinearPerpetual, symbol]);

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

  if (loading || dynamicLoading) {
    return (
      <div className={styles['container']}>
        <div className={styles['loading-box']}>
          {/* <div className={styles['img']}></div> */}
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles['container']}>
      <div className={styles['wrapper']}>
        <div className={styles['header']}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
          {/* 以上是H5使用 */}
          <div className={styles['title']}>{t('position-level-title')}</div>
          <div className={styles['desc']}>{t('position-level-desc')}</div>
          <div className={styles['filter-select']}>
            <div className={styles['label']}>{t('futures-type')}</div>
            <Select
              className={cls(styles['select'], styles['select-contractType'])}
              options={contractTypeOptions.map((item) => ({
                ...item,
                label: t(item?.label),
                key: item?.value
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

        <Table
          className={styles['table']}
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={loading || dynamicLoading}
          rowKey={(record) => record.id}
        />
      </div>
    </div>
  );
};
export default PositionTier;
