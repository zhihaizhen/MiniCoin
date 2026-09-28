// import pushEvent from '@region/by-gtm';
import { Tooltip } from 'antd';
import { deepClone, intercept } from '@unified/helpers';
import { storage } from 'by-storage';
import cls from 'classnames';
import hotIcon from 'common/assets/images/symbol/HOT.svg';
import { ESymbolTags } from 'common/enums/symbol.enum';
import { SPOT_SYMBOLS_TABLE_SORT } from 'common/packages-biz/global-settings';
import { handleLoginUrl } from 'common/utils/url';
import useAllSymbolQuoteStream from 'common/public-ws/stream-hooks/use-allSymbolQuote-stream';
import { sortDown, sortUp } from 'common/utils/sort';
import { getSymbolUrl } from 'common/utils/symbol';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { types, useGlobalState } from '@/store/index';
import useSymbolStore from '@/store-hooks/use-bookSymbol-store';
import { updateUserPreferences } from '@/services/user.service';
import { ReactComponent as NoDataSvg } from 'common/assets/images/noData.svg';
import SymbolSort from '../SymbolSort';
import styles from './index.module.less';

const defaultSortMap = {
  symbol: 'NORMAL',
  lastPrice: 'NORMAL',
  changeRate24h: 'NORMAL',
  volume24h: 'NORMAL',
}; // {symbol: 'NORMAL', lastPrice: 'UP', changeRate24h: 'NORMAL', volume24h: 'NORMAL'}

const SymbolTable = (props) => {
  const {
    searchTxt,
    activeTab,
    activeSectionId,
    data,
    isLogin,
    theme,
  } = props;
  const { t, i18n } = useTranslation();
  const [globalState, globalDispatch] = useGlobalState();
  const { allSpotTokenConfig, symbolAlias } = globalState;
  
  const allSymbolQuoteData = useAllSymbolQuoteStream(); // 具体数据来自ws
  const { bookedSymbolList = [] } = useSymbolStore();
  const [symbolDataList, setSymbolDataList] = useState([]); // 展示的symbolData

  const allSymbolByTab = useMemo(() => {
    return data[activeTab];
  }, [data, activeTab]);

  const allSymbolByCategory = useMemo(() => {
    if (activeSectionId !== 1 && Array.isArray(allSymbolByTab)) {
      return allSymbolByTab.filter(item => item.sectionIds?.includes(activeSectionId));
    }
    return allSymbolByTab;
  }, [activeSectionId, allSymbolByTab]);

  const [sortMap, setSortMap] = useState(() => {
    const cacheSort = storage.get(SPOT_SYMBOLS_TABLE_SORT);
    let sortConfig = defaultSortMap;
    if (cacheSort) {
      try {
        sortConfig = JSON.parse(cacheSort);
        // eslint-disable-next-line no-empty
      } catch { }
    }
    return sortConfig;
  });

  const handleTradeVolNumFormat = (num) => {
    const unitMap = {
      1000: 'K',
      1000_000: 'M',
      1000_000_000: 'B',
    };

    let exponent = 1;
    Object.keys(unitMap)
      .reverse()
      .some((unit) => {
        if (num >= unit) {
          exponent = unit;
          return true;
        }
        return false;
      });

    const output = intercept(num / exponent, 2);
    const unitStr = `${unitMap[exponent] || ''}`;
    return unitStr ? `${output}${unitStr}` : `${output}`;
  };

  const handleSymbolClick = (bookSymbolRow, event) => {
    event.preventDefault();
    if (bookSymbolRow.symbolAlias === symbolAlias) return;
    const { walletCoin, coin } = bookSymbolRow;
    const symbolConfig = allSpotTokenConfig?.[walletCoin]?.[coin];
    if (symbolConfig) {
      globalDispatch({
        type: types.SET_SYMBOL_AND_COIN,
        symbolConfig,
      });
    }
  };

  // ['BTCUSDT','ETHUSDT']
  const currentBookedSymbolList = bookedSymbolList.slice();
  const isBooked = (symbol) => {
    return currentBookedSymbolList.indexOf(symbol) > -1;
  };

  const handleFavorClick = (symbol, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isLogin) {
      handleLoginUrl();
      return;
    }
    const action = isBooked(symbol) ? 'unBook' : 'book';
    if (action === 'book') {
      currentBookedSymbolList.push(symbol);
    } else if (action === 'unBook') {
      const index = currentBookedSymbolList.indexOf(symbol);
      currentBookedSymbolList.splice(index, 1);
    }
    let preferencesParam = '';
    if (currentBookedSymbolList.length) {
      preferencesParam = currentBookedSymbolList.join(',');
    }
    updateUserPreferences(preferencesParam, globalDispatch);
    globalDispatch({
      type: types.SET_BOOK_SYMBOL_LIST,
      data: preferencesParam,
    });
  };

  /**
   * 计算搜索匹配优先级，数值越小越靠前
   * 0: 精确匹配  1: 后缀匹配 2: 前缀匹配  3: 包含子串
   */
  const getSearchMatchPriority = useCallback((symbolName, searchTxt) => {
    if (!symbolName || !searchTxt) return 3;
    const name = symbolName.toUpperCase();
    const search = searchTxt.toUpperCase();
    if (name === search) return 0;
    if (name.endsWith(search)) return 1;
    if (name.startsWith(search)) return 2;
    return 3;
  }, []);

  // 搜索
  const getSearchResultList = useCallback(
    (searchTxt) => {
      let tempSymbolList = deepClone(allSymbolByCategory);
      if (bookedSymbolList.length) {
        // 已收藏检索
        tempSymbolList.forEach((item) => {
          item.isBooked = bookedSymbolList.includes(item.symbolAlias) ? 1 : 0;
        });
        tempSymbolList = sortDown(tempSymbolList, 'isBooked');
      }
      const searchKey = (searchTxt || '').toUpperCase();
      return tempSymbolList?.filter((item) => {
        const symbolName = (item.symbolFullName || item.symbolAlias || '').toUpperCase();
        return symbolName.includes(searchKey);
      });
    },
    [bookedSymbolList, allSymbolByCategory],
  );

  // 排序
  const setSortSymbolListData = useCallback(
    (searchTxt) => {
      const hasSearch = !!searchTxt;
      const tempSymbolList = deepClone(
        hasSearch ? getSearchResultList(searchTxt) : allSymbolByCategory || [],
      );
      //  取行情数据
      const quoteList = tempSymbolList.map((item) => {
        const quoteData = allSymbolQuoteData[item.symbolAlias] || {};
        const {
          formattedClosePrice = '',
          closePrice = 0,
          changeRate24h = 0,
          volume24h = 0,
        } = quoteData;
        return {
          ...item,
          formattedClosePrice,
          closePrice,
          changeRate24h,
          volume24h,
        };
      });
      let resultList = quoteList;
      let sortType;
      // 按照之前的排序方式处理数据
      const hasColumnSort = Object.keys(sortMap).some((item) => {
        sortType = sortMap[item];
        if (sortType !== 'NORMAL') {
          const sortField = item;
          resultList =
            sortType === 'UP'
              ? sortUp(quoteList, sortField)
              : sortDown(quoteList, sortField);
          return true;
        }
        return false;
      });
      // 无缓存(无列排序)且正在搜索时，按匹配精准度排序：精准/后缀/前缀/包含
      if (hasSearch && !hasColumnSort && resultList.length) {
        resultList = [...resultList].sort((a, b) => {
          const pa = getSearchMatchPriority(a.symbolFullName, searchTxt);
          const pb = getSearchMatchPriority(b.symbolFullName, searchTxt);
          if (pa !== pb) return pa - pb;
          return (a.symbolAlias || '').localeCompare(b.symbolAlias || '');
        });
      }
      setSymbolDataList(resultList);
    },
    [
      allSymbolQuoteData,
      getSearchResultList,
      getSearchMatchPriority,
      sortMap,
      allSymbolByCategory,
    ],
  );

  // 数据变化后 排序 搜索更新
  useEffect(() => {
    setSortSymbolListData(searchTxt);
  }, [data, sortMap, searchTxt, activeSectionId, setSortSymbolListData]);

  const onSort = (key, sortType) => {
    const sortConfig = { ...defaultSortMap, [key]: sortType };
    storage.set(SPOT_SYMBOLS_TABLE_SORT, JSON.stringify(sortConfig));
    // changeRate24h: "NORMAL",closePrice: "UP",symbol: "NORMAL",volume24h: "NORMAL"
    setSortMap(sortConfig);
  };

  const trs = [
    {
      name: t('Symbol'),
      key: 'symbolName',
      sortKey: 'symbol',
      render: (row) => {
        const { symbol, symbolFullName } = row;
        return (
          // 取消收藏和添加收藏
          <div className="book-symbol-table__symbol-bg">
            <Tooltip
              placement="topLeft"
              trigger="hover"
              title={
                isBooked(row.symbolAlias)
                  ? t('unbookSymbolAction')
                  : t('bookSymbolAction')
              }
              popoverClassName="book-symbol-table__popover-bg"
            >
              <div
                className="book-symbol-table__icon-favor-bg"
                onClick={(e) => handleFavorClick(row.symbolAlias, e)}
              >
                <span
                  className={cls(
                    'icon iconfont f-16 ',
                    isBooked(row.symbolAlias)
                      ? 'icon-favored star-flash-animation'
                      : 'icon-favor',
                  )}
                />
              </div>
            </Tooltip>

            <div className="book-symbol-table__symbol-box">
              <div className="book-symbol-table__symbol-type-bg">
                <span className="book-symbol-table__symbol f-14">
                  {symbolFullName}
                </span>
                <If
                  condition={row?.symbolTags?.indexOf(ESymbolTags.LSNEW) > -1}
                >
                  <span className="iconNew">{t('tag-new')} </span>
                </If>

                <If
                  condition={row?.symbolTags?.indexOf(ESymbolTags.LSHOT) > -1}
                >
                  <img src={hotIcon} alt="hot" style={{ marginLeft: '2px' }} />
                </If>

                <If condition={symbolFullName === 'USD1/USDT'}>
                  <span className="iconNew">{t('tag-0fee')}</span>
                </If>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: t('bookSymbolLastTradePrice'),
      key: 'closePrice',
      sortKey: 'closePrice',
      render: (row) => {
        return <span>{row.formattedClosePrice || 0}</span>;
      },
    },
    {
      name: t('24hChangeRate'),
      key: 'changeRate24h',
      sortKey: 'changeRate24h',
      render: (row) => {
        const changeRate24h = row.changeRate24h || 0;
        return (
          <span
            className={cls({
              long: changeRate24h > 0,
              short: changeRate24h < 0,
            })}
          >
            {changeRate24h > 0 ? '+' : ''}
            {changeRate24h}%
          </span>
        );
      },
    },
    {
      name: t('24hVolume'),
      key: 'volume24h',
      sortKey: 'volume24h',
      render: (row) => (
        <span>{handleTradeVolNumFormat(Number(row.volume24h || 0))}</span>
      ),
    },
  ];

  return (
    <div className={cls(`book-symbol-table__bg ${styles.bookSymbolTable}`)}>
      <If condition={symbolDataList && symbolDataList.length}>
        <div className="book-symbol-table__box">
          {/* 头部 */}
          <div className="book-symbol-table__thead text-secondary">
            <div className="book-symbol-table__thead-tr">
              <For each="th" of={trs} index="inx">
                {/* 排序 */}
                <SymbolSort
                  key={inx}
                  txt={th.name}
                  sortType={sortMap[th.sortKey]}
                  sortColumn={th.sortKey}
                  onSort={onSort}
                />
              </For>
            </div>
          </div>
          {/* 数据 */}
          <div className={cls('book-symbol-table__tbody')}>
            <For index="inx" of={symbolDataList} each="trData">
              <a
                href={getSymbolUrl(trData)}
                key={inx}
                style={{ textDecoration: 'none', color: 'inherit' }}
                className={cls('book-symbol-table__tbody-tr', {
                  'book-symbol-table__tbody-tr-active':
                    trData.symbolAlias === symbolAlias,
                })}
                onClick={(event) => handleSymbolClick(trData, event)}
              >
                <For index="trInx" each="tr" of={trs}>
                  <div
                    key={`${inx}${trInx}`}
                    className="book-symbol-table__tbody-td f-14"
                    style={tr.tdStyle || tr.style}
                  >
                    <If condition={tr.render}>{tr.render(trData)}</If>
                    <If condition={!tr.render}>{trData[tr.key]}</If>
                  </div>
                </For>
              </a>
            </For>
          </div>
        </div>
      </If>
      {/* 以下是异常情况 */}
      <If condition={!symbolDataList || !symbolDataList?.length}>
        <div className="book-symbol-table__box book-symbol-table__no-data-bg">
          <NoDataSvg className="nodata-icon" />
          <p className="book-symbol-table__no-data-txt nowrap">
            {t('bookSymbolNoData')}
          </p>
        </div>
      </If>
      <If condition={!allSymbolByTab?.length && activeTab !== 'book'}>
        <div className="book-symbol-table__box book-symbol-table__load-fail-bg">
          <span className="book-symbol-table__load-fail-txt f-14">
            {t('bookSymbolLoadFail')}
          </span>
        </div>
      </If>
    </div>
  );
};

SymbolTable.defaultProps = {
  searchTxt: '',
  activeTab: undefined,
  activeSectionId: 1,
  theme: undefined,
  data: {},
  isLogin: undefined,
};

SymbolTable.propTypes = {
  searchTxt: PropTypes.string,
  activeTab: PropTypes.string, // 一级tab栏 收藏/全部/usdt/usdc
  activeSectionId: PropTypes.number, // 二级分类板块ID，1代表全部
  theme: PropTypes.string,
  data: PropTypes.object,
  isLogin: PropTypes.bool,
};

export default SymbolTable;
