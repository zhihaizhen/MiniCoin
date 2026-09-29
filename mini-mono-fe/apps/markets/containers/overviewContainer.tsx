// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import cls from 'classnames';
import { Input, Pagination, Table } from 'antd';
import { ReactComponent as LeftIcon } from '~/public/images/category-left.svg';
import { ReactComponent as RightIcon } from '~/public/images/category-right.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { useColorPreference } from '@better-bit-fe/base-provider';
import {
  useSpotQuoteTokenConfig,
  useAllSymbolQuote,
  useAllSpotQuote,
  useCollect
} from 'libs/ws-service';
import useFiatInfo from '~/hooks/useFiatInfo';
import { useUserInfo } from '@better-bit-fe/base-provider';
import MarketOverview from '~/components/MarketOverview';
import TableData from '~/components/TableData';
import EditFavorites from '~/containers/EditFavorites';
import { sortFun, sortByPre } from '~/utils/sort';
import { getSectionCategory, postFavoriteChange, getPreference } from '~/api';
import {
  commonList,
  favLayerList,
  categoryList,
  SECOND_FAV_LAYER,
  SECOND_LAYER,
  FIRST_LAYER,
  ALL_SECTION_ID,
} from '~/constants';
import { FUTURE_TYPE, isInverseBySymbol, LINEAR_CATEGORY_TYPE } from 'libs/ws-service/src/utils';
import styles from './index.module.less';

const DEFAULT_FUTURE_FAV = 'BTCUSDT,ETHUSDT';

export interface IOverviewContainerProps { }

export default function OverviewContainer(props: IOverviewContainerProps) {
  const t = useFm();
  const { locale } = useRouter();
  const { colorPreference } = useColorPreference();

  const { isLogin, userInfo } = useUserInfo();
  const { allFutureList, futureListWithType } = useAllSymbolQuote(); //所有合约行情数据
  const { allSpotList } = useAllSpotQuote(); //所有现货行情数据

  const { spotCollect, futureCollect, getCollectList } = useCollect(); //收藏的symbol
  const { spotDySymbolConfig } = useSpotQuoteTokenConfig(); // 现货分类数据

  const { userFiatInfo } = useFiatInfo(locale);

  const [curAllCategoryData, setCurAllCategoryData] = useState([]); // 当前分类的所有数据
  const [curCategoryData, setCurCategoryData] = useState([]); // 当前分类的展示页的数据，用于table

  const [pageLoading, setPageLoading] = useState(true);
  const [sortInfo, setSortInfo] = useState({
    key: 'vol',
    direction: 'Up'
  });
  const [pages, setPages] = useState({
    total: 0,
    current: 1,
    pageSize: 10
  });
  const futureType = FUTURE_TYPE.LINEAR;  // 默认合约只有正向
  // 一级分类：默认合约
  const [curFirstCategory, setCurFirstCategory] = useState(FIRST_LAYER.FUTURE);
  // 二级分类，走后端接口
  const [curSecondLayer, setCurSecondLayer] = useState(ALL_SECTION_ID);
  const [curSecondFavLayer, setCurSecondFavLayer] = useState(SECOND_FAV_LAYER.FUTURE);

  const [favData, setFavData] = useState([]); // 收藏的数据
  const [showEdit, setShowEdit] = useState(false);
  const [searchVal, setSearchVal] = useState(); //
  const [secondCategory, setSecondCategory] = useState({
    [FIRST_LAYER.SPOT]: [],
    [FIRST_LAYER.FUTURE]: [],
    [FIRST_LAYER.BLOCK]: [],
  }); // 板块分类

  const secondCategoryRef = useRef<HTMLDivElement>(null);
  const defaultFavWrittenRef = useRef(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const updateSecondCategoryArrows = useCallback(() => {
    const el = secondCategoryRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const currentSecondCategoryList = useMemo(() => {
    if (curFirstCategory === FIRST_LAYER.FAV) return [];
    return secondCategory[curFirstCategory] || [];
  }, [secondCategory, curFirstCategory]);

  useEffect(() => {
    updateSecondCategoryArrows();
  }, [currentSecondCategoryList, updateSecondCategoryArrows]);

  useEffect(() => {
    const el = secondCategoryRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(updateSecondCategoryArrows);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [updateSecondCategoryArrows, curFirstCategory]);

  const scrollSecondCategory = useCallback(
    (dir: number) => {
      const el = secondCategoryRef.current;
      if (!el) return;
      const count = currentSecondCategoryList.length;
      let scrollCount;
      if (count <= 10) {
        scrollCount = 1;
      } else {
        scrollCount = 2;
      }
      const itemWidth = el.scrollWidth / Math.max(count, 1);
      const step = Math.min(
        Math.max(itemWidth * scrollCount, 60),
        el.clientWidth * 0.55
      );
      el.scrollBy({ left: dir * step, behavior: 'smooth' });
    },
    [currentSecondCategoryList.length]
  );

  const spotLayerList = useMemo(() => {
    const all = [
      {
        tokenId: 'all',
        tokenName: 'all'
      }
    ];
    return all.concat(spotDySymbolConfig);
  }, [spotDySymbolConfig]);

  const supportBlock = !!(userInfo as any)?.support_block;

  const filteredCommonList = useMemo(() => {
    return supportBlock ? commonList : commonList.filter((it) => it.value !== FIRST_LAYER.BLOCK);
  }, [supportBlock]);

  const filteredFavLayerList = useMemo(() => {
    return supportBlock ? favLayerList : favLayerList.filter((it) => it.value !== FIRST_LAYER.BLOCK);
  }, [supportBlock]);

  const categoryUsedList = useMemo(() => {
    if (!isLogin) return filteredCommonList;
    return supportBlock ? categoryList : categoryList.filter((it) => it.value !== FIRST_LAYER.BLOCK);
  }, [isLogin, supportBlock, filteredCommonList]);

  // 行情推送刷新时保留当前二级板块筛选，避免覆盖已筛选结果
  const refreshFutureCategoryData = () => {
    setPageLoading(false);
    let layerData = futureListWithType?.[futureType] || [];
    if (curFirstCategory === FIRST_LAYER.BLOCK) {
      layerData = futureListWithType?.[FUTURE_TYPE.BLOCK] || [];
    }
    const data =
      curSecondLayer === ALL_SECTION_ID
        ? layerData
        : layerData.filter((it) => it?.sectionIds?.includes(curSecondLayer));
    setPages((prev) => ({
      ...prev,
      total: data.length
    }));
    sortDynamicData(data);
  };

  // 处理分类数据
  const handleChangeCategory = (val = curFirstCategory) => {
    setCurFirstCategory(val);
    setCurSecondLayer(ALL_SECTION_ID);
    setSearchVal();
    resetSort(val);
    if (val === FIRST_LAYER.FUTURE) {
      changeCategoryData(futureListWithType?.[futureType]);
      return;
    }
    if (val === FIRST_LAYER.SPOT) {
      changeCategoryData(allSpotList);
      return;
    }
    if (val === FIRST_LAYER.BLOCK) {
      changeCategoryData(futureListWithType?.[FUTURE_TYPE.BLOCK]);
      return;
    }
    handleChangeFavLayer(SECOND_FAV_LAYER.FUTURE); // 收藏默认二级：合约
  };

  // 1.排序 2.设置第一页数据  3.重置pages
  const changeCategoryData = (data: Array[]) => {
    setCurAllCategoryData(data);
    const { key = 'vol', direction = 'Up' } = sortInfo || {};
    const curData = sortByPre([...data], key, direction);
    const { pageSize } = pages;
    const showData = curData.slice(0, pageSize);
    setCurCategoryData(showData);
    resetPages(data.length);
  };

  const sortDynamicData = (data) => {
    let curData = [...data];
    setCurAllCategoryData(data);
    if (searchVal) {
      curData = data.filter((it) => {
        return (
          it.symbol.includes(searchVal) || it.symbolAlias.includes(searchVal)
        );
      });
    }
    // fav没有sortInfo,按照原始收藏顺序排序既可
    if (sortInfo) {
      const { key, direction } = sortInfo;
      curData = sortByPre(curData, key, direction);
    }
    const { current, pageSize } = pages;
    // 如果是搜索，那一定是回到第一页
    if (searchVal) {
      const showData = curData.slice(0, pageSize);
      resetPages();
      setCurCategoryData(showData);
    } else {
      const startNum = (current - 1) * pageSize;
      const endNum = current * pageSize;
      const showData = curData.slice(startNum, endNum);
      setCurCategoryData(showData);
    }
  };

  const resetPages = (len) => {
    setPages({
      current: 1,
      total: len,
      pageSize: 10
    });
  };

  const resetSort = (curFirstCategory) => {
    if (curFirstCategory === FIRST_LAYER.FAV) {
      setSortInfo();
      return;
    }
    setSortInfo({
      key: 'vol',
      direction: 'Up'
    });
  };

  // 处理排序,设置当前页面的排序顺序
  const handleSortData = (key, direction) => {
    setSortInfo({
      key,
      direction
    });
    const allData = [...curAllCategoryData];
    const { current, pageSize } = pages;
    allData.sort((a, b) => {
      return sortFun(a, b, key, direction);
    });

    const startNum = (current - 1) * pageSize;
    const endNum = current * pageSize;
    const showData = allData.slice(startNum, endNum);
    setCurCategoryData(showData);
  };

  // 处理翻页
  const handleChangePage = (page: number, size: number) => {
    let pageSize = pages.pageSize;
    if (size !== pageSize) {
      pageSize = size;
    }
    const startNum = (page - 1) * pageSize;
    const endNum = page * pageSize;
    const show = curAllCategoryData.slice(startNum, endNum);
    setCurCategoryData(show);
    setPages({
      ...pages,
      pageSize,
      current: page
    });
  };

  // 处理收藏数据
  const handleFavData = (
    favLayer = curSecondFavLayer,
    needPageReset = false,
  ) => {
    const { fuList = [], spList = [], blockList = [] } = getCollectData;
    let typeData = [];
    if (favLayer === SECOND_FAV_LAYER.FUTURE) {
      typeData = fuList[futureType] || [];
    } else if (favLayer === SECOND_FAV_LAYER.SPOT) {
      typeData = spList;
    } else if (favLayer === SECOND_FAV_LAYER.BLOCK) {
      typeData = blockList;
    }
    setFavData(typeData);
    sortDynamicData(typeData);
    if (needPageReset) {
      resetPages(typeData.length);
    }
  };

  const handleChangeFavLayer = (val) => {
    setCurSecondFavLayer(val);
    // setCurFavSubFuLayer(FUTURE_TYPE.LINEAR); // 每次切换fav都重置
    handleFavData(val, true);
    setSearchVal();
  };

  const handleChangeSecondLayer = (sectionId) => {
    setCurSecondLayer(sectionId);
    handleSecondData(sectionId);
    setSearchVal();
  };


  const handleSecondData = (sectionId) => {
    if (curFirstCategory === FIRST_LAYER.SPOT) {
      handleSpotData(sectionId);
    } else if (curFirstCategory === FIRST_LAYER.FUTURE || curFirstCategory === FIRST_LAYER.BLOCK) {
      handleFutureData(sectionId);
    }
    setSearchVal();
  };

  const handleSpotData = (id, needResetPage = true) => {
    let belongData = allSpotList;
    if (id !== ALL_SECTION_ID) {
      belongData = allSpotList.filter((it) => it?.sectionIds.includes(id));
    }
    sortDynamicData(belongData);
    if (needResetPage) {
      resetPages(belongData.length);
    }
  };

  const handleFutureData = (id) => {
    let layerData = futureListWithType?.[futureType];
    if (curFirstCategory === FIRST_LAYER.BLOCK) {
      layerData = futureListWithType?.[FUTURE_TYPE.BLOCK];
    }
    let belongData = layerData;
    if (id !== ALL_SECTION_ID) {
      belongData = layerData.filter((it) => it?.sectionIds.includes(id));
    }
    sortDynamicData(belongData);
    resetPages(belongData.length);
  };

  const getCollectData = useMemo(() => {
    const fuList = {
      [FUTURE_TYPE.INVERSE]: [],
      [FUTURE_TYPE.LINEAR]: [],
      allList: []
    };
    const spList = [];
    const blockList = [];
    const allFuList = []; // 包含正向，反向，大宗

    futureCollect.forEach((name) => {
      const data = allFutureList.filter((it) => it.symbol === name)?.[0];
      if (data) {
        if (data.symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK) {
          blockList.push(data);
          if (supportBlock) {
            allFuList.push(data);
          }
        } else {
          allFuList.push(data);
          fuList.allList.push(data);
          isInverseBySymbol(data.contractType)
            ? fuList[FUTURE_TYPE.INVERSE].push(data)
            : fuList[FUTURE_TYPE.LINEAR].push(data);
        }
      }
    });
    spotCollect.forEach((name) => {
      const data = allSpotList.filter((it) => it.symbol === name)?.[0];
      if (data) {
        spList.push(data);
      }
    });
    const allList = allFuList.concat(spList);
    return {
      allList,
      fuList,
      spList,
      blockList,
    };
  }, [spotCollect, futureCollect, allFutureList, allSpotList, supportBlock]);

  const favLength = useMemo(() => {
    const { fuList = {}, spList = [], blockList } = getCollectData;
    const fuLen = fuList.allList?.length;
    const spLen = spList?.length;
    const blockLen = blockList?.length;
    return {
      futures: fuLen,
      spot: spLen,
      block: blockLen
    };
  }, [getCollectData]);

  useEffect(() => {
    if (curFirstCategory === FIRST_LAYER.FAV) {
      handleFavData();
    }
  }, [getCollectData]);

  // 登录后仍默认停留在合约；合约自选为空时持久化写入 BTC/ETH
  useEffect(() => {
    if (!isLogin) {
      defaultFavWrittenRef.current = false;
      return;
    }
    setPageLoading(false);
    if (defaultFavWrittenRef.current) return;

    const ensureDefaultFutureFav = async () => {
      defaultFavWrittenRef.current = true;
      try {
        const res = await getPreference();
        const futureFavList = (
          res?.preferences?.bookSymbolSequence?.split(',') || []
        ).filter(Boolean);
        if (futureFavList.length > 0) return;
        await postFavoriteChange({
          upsert_keys: {
            bookSymbolSequence: DEFAULT_FUTURE_FAV
          }
        });
        await getCollectList();
      } catch {
        defaultFavWrittenRef.current = false;
      }
    };
    ensureDefaultFutureFav();
  }, [isLogin, getCollectList]);

  useEffect(() => {
    if (curFirstCategory === FIRST_LAYER.FUTURE) {
      refreshFutureCategoryData();
    }
  }, [allFutureList, curFirstCategory]);

  // 行情推送刷新时保留当前二级板块筛选，避免覆盖已筛选结果（现货同步于合约的处理方式）
  const refreshSpotCategoryData = () => {
    setPageLoading(false);
    const data =
      curSecondLayer === ALL_SECTION_ID
        ? allSpotList
        : allSpotList.filter((it) => it?.sectionIds?.includes(curSecondLayer));
    setPages((prev) => ({
      ...prev,
      total: data.length
    }));
    sortDynamicData(data);
  };

  useEffect(() => {
    if (curFirstCategory === FIRST_LAYER.SPOT) {
      refreshSpotCategoryData();
    }
  }, [allSpotList, curFirstCategory]);

  const handleEditFav = () => {
    setShowEdit((pre) => !pre);
  };

  // 关闭编辑自选
  const handleEditCancel = () => {
    setShowEdit(false);
  };

  //
  const handleSearch = (e) => {
    const val = e.target.value.toUpperCase();
    setSearchVal(val);
    const searchRes = curAllCategoryData.filter((it) => {
      return it.symbol.includes(val) || it.symbolAlias.includes(val);
    });
    setCurCategoryData(searchRes);
    setPages({
      ...pages,
      current: 1,
      total: searchRes.length
    });
  };

  useEffect(() => {
    fetchSectionCategory(); // 板块分类
  }, []);

  const fetchSectionCategory = async () => {
    const res = await getSectionCategory();
    const itemAll = {
      languageCode: SECOND_LAYER.ALL,
      sectionId: ALL_SECTION_ID, // 前端定义的假的,表示全部
      showWeight: 100000, // 权重越大越靠前
    }
    const spot = [itemAll];
    const future = [itemAll];
    const block = [itemAll];
    res.forEach((it) => {
      if (it.symbolCategory === 'contract') {
        future.push(it);
      } else if (it.symbolCategory === 'spot') {
        spot.push(it);
      } else if (it.symbolCategory === 'block') {
        block.push(it);
      }
    });

    setSecondCategory({
      [FIRST_LAYER.SPOT]: spot.sort((a, b) => b.showWeight - a.showWeight),
      [FIRST_LAYER.FUTURE]: future.sort((a, b) => b.showWeight - a.showWeight),
      [FIRST_LAYER.BLOCK]: block.sort((a, b) => b.showWeight - a.showWeight),
    });
  };

  return (
    <div className={cls(styles.containers, colorPreference)}>
      <MarketOverview />
      <div className={styles.contents}>
        {/* 一级分类 */}
        <div className={styles.row1}>
          <div className={styles.category}>
            {categoryUsedList.map((it) => (
              <span
                key={it.value}
                className={cls(styles.item, {
                  [styles.itemActive]: it.value === curFirstCategory
                })}
                onClick={() => handleChangeCategory(it.value)}
              >
                {t(it.label)}
              </span>
            ))}
          </div>
          <Input
            value={searchVal}
            addonBefore={<span className={styles.seachIcon} />}
            placeholder={t('search')}
            className={styles.input}
            onChange={handleSearch}
          />
        </div>
        {/* 二级分类 */}
        {curFirstCategory === FIRST_LAYER.FAV && (
          <div className={styles.row2}>
            <div className={styles.favoriteLayer}>
              {filteredFavLayerList.map((it) => (
                <span
                  key={it.value}
                  className={cls(styles.item, {
                    [styles.itemActive]: it.value === curSecondFavLayer
                  })}
                  onClick={() => handleChangeFavLayer(it.value)}
                >
                  {`${t(it.label)}(${favLength[it.value]})`}
                </span>
              ))}
            </div>
            {/* {favData.length > 0 && (
              <div className={styles.favoriteEdit} onClick={handleEditFav}>
                <div className={styles.editIcon} />
                {t('edit')}
              </div>
            )} */}
          </div>
        )}
        {curFirstCategory !== FIRST_LAYER.FAV && <div className={styles.row2}>
          <div className={styles.categoryWrapper}>
            <div
              ref={secondCategoryRef}
              className={styles.favoriteLayer}
              onScroll={updateSecondCategoryArrows}
            >
              {secondCategory[curFirstCategory].map((it) => (
                <span
                  key={it.sectionId}
                  className={cls(styles.item, {
                    [styles.itemActive]: it.sectionId === curSecondLayer
                  })}
                  onClick={() => handleChangeSecondLayer(it.sectionId)}
                >
                  {t(it.languageCode)}
                </span>
              ))}
            </div>
            {showLeftArrow && (
              <>
                <div className={cls(styles.mask, styles.maskLeft)} />
                <LeftIcon
                  className={cls(styles.arrow, styles.arrowLeft)}
                  onClick={() => scrollSecondCategory(-1)}
                />
              </>
            )}
            {showRightArrow && (
              <>
                <div className={cls(styles.mask, styles.maskRight)} />
                <RightIcon
                  className={cls(styles.arrow, styles.arrowRight)}
                  onClick={() => scrollSecondCategory(1)}
                />
              </>
            )}
          </div>
        </div>}
        <div>
          <TableData
            data={curCategoryData}
            changeSort={handleSortData}
            curSecondFavLayer={curSecondFavLayer}
            curFirstCategory={curFirstCategory}
            userFiatInfo={userFiatInfo}
            sortInfo={sortInfo}
            isLogin={isLogin}
            loading={pageLoading}
          />
          {pages.total > 10 && (
            <div className={styles.pages}>
              <Pagination
                className={styles.pagination}
                current={pages.current}
                total={pages.total}
                pageSize={pages.pageSize}
                onChange={handleChangePage}
                pageSizeOptions={[10, 20]}
                showSizeChanger={{
                  showSearch: false,
                  popupClassName: styles.paginationDropdown
                }}
              />
            </div>
          )}
        </div>
        {showEdit && <EditFavorites open={showEdit} handleEditCancel={handleEditCancel} />}
      </div>
    </div>
  );
}
