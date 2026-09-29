import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { Button } from 'antd';
import dayjs, { locale } from 'dayjs';
import { SECOND_FAV_LAYER } from '~/constants';
import { FUTURE_TYPE, LINEAR_CATEGORY_TYPE } from 'libs/ws-service/src/utils';
import {
  getFutureTrendKline,
  postFavoriteChange,
  getSpotTrendKline
} from '~/api';
import {
  useAllSymbolQuote,
  useSymbolConfig,
  useCollect,
  useAllSpotQuote
} from 'libs/ws-service';
import { useRouter } from 'next/router';
import FavItem from '~/components/FavItem';
import styles from './index.module.less';

export default function AddFavorites({
  curSecondFavLayer,
  // curFavSubFuLayer,
  spotRecommendList,
  searchVal,
  setSearchVal
}) {
  const t = useFm();
  const { locale } = useRouter();
  const [recommendNames, setRecommendNames] = useState([]); // 推荐的symbolname
  const [recommendList, setRecommendList] = useState([]);
  const [btnloading, setBtnloading] = useState(false);
  const [allKlinesDatas, setAllKlinesData] = useState({}); //k线数据-用于走势图
  const [postFavs, setPostFavs] = useState(''); // 提交的自选数据
  const { symbolConfig } = useSymbolConfig(); // context,获取值，合约的推荐
  const { allFutureList, futureListWithType } = useAllSymbolQuote(); //所有合约行情数据
  const { allSpotList } = useAllSpotQuote(); //所有现货行情数据
  const { getCollectList, futureCollect } = useCollect(); // hooks,获取方法

  const isZhTradfi = locale.includes('zh') && curSecondFavLayer === SECOND_FAV_LAYER.BLOCK;

  const isSpot = useMemo(() => {
    return curSecondFavLayer === SECOND_FAV_LAYER.SPOT;
  }, [curSecondFavLayer]);

  const isBlock = useMemo(() => {
    return curSecondFavLayer === SECOND_FAV_LAYER.BLOCK;
  }, [curSecondFavLayer]);

  useEffect(() => {
    getRecommondNames();
  }, [symbolConfig, curSecondFavLayer]); // layer切换

  const getRecommondNames = () => {
    let names;
    // 现货推荐
    if (isSpot) {
      names = spotRecommendList.map((it) => it.symbolName);
    } else {
      let blockList = [];
      let contractList = [];
      symbolConfig.forEach((it) => {
        if (it.symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK) {
          blockList.push(it);
        } else {
          contractList.push(it); // 此处包含正向和反向
        }
      });
      const listBySub = isBlock ? blockList : contractList;

      // // 合约推荐 &全部推荐
      // listBySub = symbolConfig.filter(
      //   (it) => it.contractType === curFavSubFuLayer  
      // );

      const sortList = listBySub.sort((a, b) => a.symbol - b.symbol); // 此处的symbol是数字，代表推荐值
      names = sortList.map((it) => it.symbolName);
    }
    const newNames = names.slice(0, 6);
    setRecommendNames(newNames);
    const nameStr = newNames.join(',');
    setPostFavs(nameStr);
  };

  // 动态数据
  useEffect(() => {
    let searchRes;
    if (searchVal) {
      searchRes = recommendNames.filter((it) => it.includes(searchVal));
    }
    getRecommondList(searchRes);
  }, [allFutureList, allSpotList, searchVal]);

  const getRecommondList = (searchNames) => {
    const list = searchNames || recommendNames;
    const names = [];
    const nameList = [];
    let wsData = allSpotList;
    if (!isSpot) {
      // 区分合约(正向和反向)和大宗
      if (curSecondFavLayer === SECOND_FAV_LAYER.BLOCK) {
        wsData = futureListWithType[FUTURE_TYPE.BLOCK];
      } else {
        wsData = futureListWithType[FUTURE_TYPE.INVERSE].concat(futureListWithType[FUTURE_TYPE.LINEAR]);
      }
    }
    // console.log('recommendNames', recommendNames);
    //  有可能出现推荐了6个币种，但wsData只返回了其5个数据，所以recommendNames为全部names, 生产不会遇到
    list.forEach((name) => {
      const data = wsData.find((it) => it?.symbol === name);
      if (nameList.length > 5) {
        return;
      }
      if (data) {
        nameList.push(data);
        names.push(name);
      }
    }); // 需要按照顺序来

    if (searchNames) {
      const nameStr = names.join(',');
      setPostFavs(nameStr);
    }
    // console.log('nameList3333', nameList);
    setRecommendList(nameList);
  };

  useEffect(() => {
    if (recommendList.length) {
      getAllKineData(recommendList);
    }
  }, [recommendList.length]);

  const getAllKineData = (showData) => {
    const lineDatas = {};
    const symbolNames = showData.map((it) => it?.symbol);
    const getKline = isSpot ? getSpKineData : getFuKineData;
    symbolNames.forEach(async (it) => {
      const data = await getKline(it);
      lineDatas[it] = data;
    });
    setAllKlinesData(lineDatas);
  };

  const getFuKineData = async (symbolName) => {
    const to = dayjs().unix();
    const from = dayjs().subtract(1, 'day').unix(); //一天前
    const params = {
      symbol: symbolName,
      resolution: '60', //分钟
      from,
      to
    };
    const res = await getFutureTrendKline(params);
    return res?.list.map((it) => it.close);
  };

  const getSpKineData = async (symbolName) => {
    const endTime = dayjs().valueOf();
    const startTime = dayjs().subtract(1, 'day').valueOf(); //一天前
    const params = {
      symbol: symbolName,
      interval: '1h',
      startTime,
      endTime,
      limit: 100
    };
    const res = await getSpotTrendKline(params);
    return res?.map((it) => it?.[4]);
  };

  const getFavChecked = (isChecked: boolean, symbolName: string) => {
    let favNames = postFavs.split(','); // 转为数组
    if (isChecked && !favNames.includes(symbolName)) {
      favNames.push(symbolName);
    } else {
      const idx = favNames.findIndex((name) => name === symbolName);
      favNames.splice(idx, 1);
    }
    const favStr = favNames.join(',');
    setPostFavs(favStr);
  };

  const handleAddFavorites = async () => {
    const key = isSpot ? 'spotBookSymbolSequence' : 'bookSymbolSequence';
    let data = postFavs;
    console.log('handleAddFavorite1111', data, futureCollect);
    if (!isSpot) {
      // 取并集，避免正反向合约冲掉
      // 需要区分合约和大宗
      data = postFavs + ',' + futureCollect;
    }
    const params = {
      upsert_keys: {
        [key]: data
      }
    };

    setBtnloading(true);
    await postFavoriteChange(params);
    await getCollectList();
    setBtnloading(false);
    setSearchVal(); // 清空搜索框
  };

  return (
    <>
      {recommendList.length > 0 ? (
        <div className={styles.favPage}>
          <div className={styles.recommend}>{t('recommendedForYou')}</div>
          <div className={styles.favItemWrapper}>
            {recommendList.map((it) => (
              <FavItem
                {...it}
                getFavChecked={getFavChecked}
                isZhTradfi={isZhTradfi}
                line={allKlinesDatas?.[it?.symbol] || []}
              />
            ))}
          </div>
          <div className={styles.favAddBtn}>
            <Button
              onClick={handleAddFavorites}
              type="primary"
              loading={btnloading}
            >
              {t('addFavorites')}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.nodata}>
          <div className={styles.nodataIcon} />
          <div className={styles.text}>{t('nodata')}</div>
        </div>
      )}
    </>
  );
}
