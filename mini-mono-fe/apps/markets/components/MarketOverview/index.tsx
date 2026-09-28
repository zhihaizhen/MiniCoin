import React, { useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { useColorPreference } from '@better-bit-fe/base-provider';
import { useAllSymbolQuote } from 'libs/ws-service';
import { FUTURE_TYPE } from 'libs/ws-service/src/utils';
import { getFutureTrendKlineData } from '~/api';
import MarketCard from '~/components/MarketCard';
import RankBoard, { RankItem } from '~/components/RankBoard';
import MarketOverviewSkeleton from './Skeleton';
import styles from './index.module.less';

const FIXED_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
const RANK_LIMIT = 6;

const MarketOverview = () => {
  const t = useFm();
  const { colorPreference } = useColorPreference();
  const { allFutureData, futureListWithType } = useAllSymbolQuote();
  const [klineMap, setKlineMap] = useState<Record<string, number[]>>({});

  const cardList = useMemo(() => {
    return FIXED_SYMBOLS.map((symbol) => allFutureData?.[symbol]).filter(
      Boolean
    );
  }, [allFutureData]);

  const linearList = useMemo(() => {
    return futureListWithType?.[FUTURE_TYPE.LINEAR] || [];
  }, [futureListWithType]);

  const gainersList = useMemo(() => {
    return [...linearList]
      .sort((a, b) => Number(b.changeRate24H) - Number(a.changeRate24H))
      .slice(0, RANK_LIMIT);
  }, [linearList]);

  const turnoverList = useMemo(() => {
    return [...linearList]
      .sort((a, b) => Number(b.turnover24h) - Number(a.turnover24h))
      .slice(0, RANK_LIMIT);
  }, [linearList]);

  useEffect(() => {
    if (!cardList.length) return;
    let cancelled = false;

    const fetchKlines = async () => {
      try {
        const res = await getFutureTrendKlineData();
        const list = Array.isArray(res) ? res : res?.data || [];
        const nextMap: Record<string, number[]> = {};
        list.forEach((item) => {
          if (!item?.symbol) return;
          nextMap[item.symbol] =
            item.list?.map((kline) => Number(kline.close)) || [];
        });
        if (!cancelled) {
          setKlineMap(nextMap);
        }
      } catch {
        if (!cancelled) {
          setKlineMap({});
        }
      }
    };

    fetchKlines();
    return () => {
      cancelled = true;
    };
  }, [cardList.length]);

  const renderChange = (item: RankItem) => {
    const rate = Number(item.changeRate24H) || 0;
    const isUp = !(rate < 0);
    return (
      <span
        className={cls({
          upColor: isUp,
          downColor: !isUp
        })}
      >
        {rate >= 0 ? `+${rate}` : rate}%
      </span>
    );
  };

  const renderTurnover = (item: RankItem) => {
    return <span>{item.formattedTurnover24h || '--'}</span>;
  };

  // WS 行情未就绪时展示骨架，避免空卡片 / 空榜单闪烁
  const isLoading = linearList.length === 0;

  return (
    <div className={styles.marketOverview}>
      <h2 className={styles.title}>{t('marketOverview')}</h2>
      {isLoading ? (
        <MarketOverviewSkeleton />
      ) : (
        <>
          <div className={styles.cardRow}>
            {FIXED_SYMBOLS.map((symbol) => {
              const data = allFutureData?.[symbol];
              if (!data) return null;
              return (
                <MarketCard
                  key={symbol}
                  {...data}
                  line={klineMap[symbol] || []}
                  colorPreference={colorPreference}
                />
              );
            })}
          </div>
          <div className={styles.rankRow}>
            <RankBoard
              title={t('gainersList')}
              list={gainersList}
              renderThird={renderChange}
            />
            <RankBoard
              title={t('turnoverList')}
              list={turnoverList}
              renderSecond={renderTurnover}
              renderThird={renderChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MarketOverview;
