// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Descriptions, Select, Table, Spin } from 'antd';
import { ActionSheet } from 'antd-mobile';
// import { DownFill } from 'antd-mobile-icons';
import styles from './index.module.less';
import { getRiskLimitList } from '~/api';
import { transformNum } from '@unified/helpers';
import { formatThousandDigit } from '~/utils';
import { ReactComponent as BackWeb } from '../../public/icons/back-web.svg';
import { ReactComponent as CheckIcon } from '../../public/icons/check.svg';
// import { ReactComponent as BackWeb } from '../../public/icons/loading.gif';
import { ReactComponent as DownFill } from '../../public/icons/arrow-small.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import getConfig from 'next/config';
import { getDynamicSymbol } from 'libs/ws-service/src/api';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { isMobile } from '@better-bit-fe/base-utils';
import BigNumber from 'bignumber.js';
import { contractTypeOptions, contractTypeMap } from '~/constants';
import { useDynamicSymbolHook } from '~/hooks/useDynamicHook';

const { staticFolder } = getConfig().publicRuntimeConfig;

const SplitSymbol = () => {
  const { allSymbols, loading: dynamicLoading } = useDynamicSymbolHook(); //
  const [symbolOptions, setSymbolOptions] = useState([]);
  const [selectSymbolKey, setSelectSymbolKey] = useState(); //  接口传参用
  const [selectContractType, setSelectContractType] = useState('');
  const [symbolVisible, setSymbolVisible] = useState(false);
  const [contractTypeVisible, setContractTypeVisible] = useState(false);

  const [data, setdata] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [visible, setVisible] = useState(false);

  const t = useFm();

  const { query } = useRouter();
  const { contractType, symbol } = query;

  const columns = [
    {
      title: t('symbol'),
      dataIndex: 'symbolAlias',
      render: (_, record, index) => <span>{record?.symbolAlias}</span>
    },
    {
      title: t('single-symbol-total-maxvalue'),
      key: 'spMaxValueE8',
      render: (_, record) => (
        <span>
          {formatThousandDigit(
            BigNumber(record?.spMaxValueE8)?.dividedBy(1e8)?.toString()
          )}
          {' ' +
            (selectContractType === 'InversePerpetual'
              ? record?.baseCurrency
              : record?.quoteCurrency)}
        </span>
      )
    },
    {
      title: t('single-position-number-limit'),
      key: 'single-position-number-limit',
      render: (_, record) => (
        <span>{`${formatThousandDigit(record.spPosLimit)}`}</span>
      )
    },
    {
      title: t('margin-times'),
      key: 'spPosMaxLeverageE2',
      render: (_, record) => (
        <span>{transformNum(record.spPosMaxLeverageE2, 1e2, 'div')}X</span>
      )
    },
    {
      title: t('margin-ratio'),
      key: 'maintainMarginE8',
      render: (_, record) => (
        <span>{transformNum(record.spPosMmRateE4, 1e2, 'div')}%</span>
      )
    }
  ];

  useEffect(() => {
    // init
    if (symbol && contractType) {
      setSelectContractType(contractType);
      const list = allSymbols?.[contractType] || [];
      const symbols = list?.map((item) => ({
        label: item?.symbolAlias,
        value: item?.symbolName
      }));
      const mergeList = isMobile() ? symbols : [...symbols];
      setSymbolOptions(mergeList);
      setdata(allSymbols?.[contractType]);
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
      setdata(allSymbols?.[contractTypeMap.LinearPerpetual]);
      const mergeList = isMobile() ? symbols : [...symbols];
      setSymbolOptions(mergeList);
      setSelectContractType(contractTypeMap.LinearPerpetual);
      setSelectSymbolKey(mergeList[0]?.value);
    }
  }, [allSymbols, contractType, symbol]);

  const handleSymbol = (value) => {
    setSelectSymbolKey(value);
    if (value === 'all') {
      setdata(allSymbols?.[selectContractType]);
    } else {
      setdata(
        allSymbols?.[selectContractType]?.filter(
          (item) => item?.symbolName === value
        )
      );
    }
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
    const mergeList = isMobile() ? symbols : [...symbols];
    setSymbolOptions(mergeList);
    setSelectSymbolKey(mergeList[0]?.value);
    setdata(allSymbols?.[value]);
  };



  if (dynamicLoading) {
    return (
      <div className={styles['container']}>
        <div className={styles['loading-box']}>
          {/* <div className={styles['img']}></div> */}
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (isMobile()) {
    const record = data?.find((item) => item?.symbolName === selectSymbolKey);
    return (
      <div className={styles['container']}>
        <div className={styles['header']}>
          <div className={styles['title']}>
            {t('split-symbol-params-title')}
          </div>
          <div className={styles['desc']}>{t('split-symbol-params-desc')}</div>
        </div>
        <div className={styles['content']}>
          <div className={styles['actionSheet']}>
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
            <div
              className={styles['symbol']}
              onClick={() => setContractTypeVisible(true)}
            >
              {selectContractType && t(selectContractType)}
              <DownFill />
            </div>

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
            <div
              style={{ marginLeft: 16 }}
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
          <Descriptions className={styles['descriptions']} bordered>
            <Descriptions.Item label={t('symbol')}>
              {record?.symbolAlias}
            </Descriptions.Item>
            <Descriptions.Item label={t('single-symbol-total-maxvalue')}>
              {formatThousandDigit(
                BigNumber(record?.spMaxValueE8)?.dividedBy(1e8)?.toString()
              )}
              {' ' +
                (selectContractType === 'InversePerpetual'
                  ? record?.baseCurrency
                  : record?.quoteCurrency)}
            </Descriptions.Item>
            <Descriptions.Item label={t('single-position-number-limit')}>
              {`${formatThousandDigit(record?.spPosLimit)}`}
            </Descriptions.Item>
            <Descriptions.Item label={t('margin-times')}>
              {transformNum(record?.spPosMaxLeverageE2, 1e2, 'div')}X
            </Descriptions.Item>
            <Descriptions.Item label={t('margin-ratio')} span={2}>
              {transformNum(record?.spPosMmRateE4, 1e2, 'div')}%
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    );
  }
  return (
    <div className={styles['container']}>
      <div className={styles['wrapper']}>
        <div className={styles['header']}>
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
          <ActionSheet
            visible={contractTypeVisible}
            actions={contractTypeOptions}
            onClose={() => setContractTypeVisible(false)}
            onAction={(action) => {
              console.log('setSelectContractType', action);
              setContractTypeVisible(false);
              setSelectContractType(action.key.toString());
            }}
          />
          <ActionSheet
            visible={symbolVisible}
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
          <div className={styles['title']}>
            {t('split-symbol-params-title')}
          </div>
          <div className={styles['desc']}>{t('split-symbol-params-desc')}</div>
          <div className={styles['filter-select']}>
            <div className={styles['label']}>{t('futures-type')}</div>
            <Select
              className={cls(styles['select'], styles['select-contractType'])}
              options={contractTypeOptions.map((item) => ({
                label: t(item.label),
                value: item.value,
                key: item.value
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
          dataSource={data?.filter(
            (item) => item?.symbolName === selectSymbolKey
          )}
          rowKey={(record) => record.id}
        />
      </div>
    </div>
  );
};
export default SplitSymbol;
