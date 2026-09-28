import { useFm } from '@better-bit-fe/base-hooks';
import React, { useEffect, useState, useCallback } from 'react';
import cls from 'classnames';
import { Tabs, TabsProps } from 'antd';
import LeftRow from './rowLeft';
import RightRow from './rowRight';
import useAllSymbolQuote from '~/publicWS/useAllSymbolQuote';
import { ReactComponent as ArrowRightSVG } from '~/public/images/homePage/arrow-right.svg';
import { useSymbolConfig } from '~/context/symbolConfig';
import styles from './index.module.less';
import { useRouter } from 'next/router';
import { useColorPreference } from '@better-bit-fe/base-provider';


const HomeData = () => {
  const t = useFm();
  const { locale } = useRouter();

  const [upList, setUpList] = useState([]); //涨幅榜
  const [downList, setDownList] = useState([]); //跌幅榜
  const [hotData, setHotData] = useState([]); //热门榜
  const [activeTab, setActiveTab] = useState('up'); // 'up' 或 'down'

  const [hotSymbols, setHotSymbols] = useState([]); //热门币种名称
  // const [allKlinesDatas, setAllKlinesData] = useState({}); //热门币种的k线数据-用于走势图
  const allSymbolQuoteData = useAllSymbolQuote(); //所有行情数据
  const { symbolConfig } = useSymbolConfig();
  const { colorPreference } = useColorPreference();
  useEffect(() => {
    getHotSymbol();
  }, [symbolConfig]);

  const getHotSymbol = () => {
    const orderSymbol = symbolConfig && symbolConfig.sort(orderFun).slice(0, 6); //已经排序的数据
    const symbolNames = orderSymbol.map((it) => it.symbolName);
    // getAllKineData(symbolNames);
    setHotSymbols(symbolNames);
  };

  // 趋势图的数据只需要初始化一次即可
  // const getAllKineData = (symbolNames) => {
  //   const lineDatas = {};
  //   symbolNames.forEach(async (it) => {
  //     const data = await getKineDataBySymbol(it);
  //     lineDatas[it] = data;
  //   });
  //   setAllKlinesData(lineDatas);
  // };

  // const getKineDataBySymbol = async (symbolName) => {
  //   const to = dayjs().unix();
  //   const from = dayjs().subtract(1, 'day').unix(); //一天前
  //   const params = {
  //     symbol: symbolName,
  //     resolution: '60', //分钟
  //     from,
  //     to
  //   };
  //   const res = await getTrendKline(params);
  //   const closeList = res?.list.map((it) => it.close);
  //   // console.log('K线的数据', symbolName, res, closeList);
  //   return closeList;
  // };

  const getShowSymbol = () => {
    const res = [];
    hotSymbols.forEach(async (name) => {
      // 防止没有数据
      if (allSymbolQuoteData[name]) {
        res.push(allSymbolQuoteData[name]);
      }
    });
    setHotData(res);
    const allList = Object.values(allSymbolQuoteData); // 按照24小时涨跌幅排序
    const sortBy24Change: any = allList.sort(upFun);

    const list = sortBy24Change.filter((item) => {
      return hotSymbols.includes(item?.symbol);
    });
    const up = list.slice(-6).reverse();
    const down = list.slice(0, 6);
    setUpList(up);
    setDownList(down);
  };

  useEffect(() => {
    getShowSymbol();
  }, [allSymbolQuoteData, hotSymbols]);

  const orderFun = (a, b) => {
    return a.symbol - b.symbol;
  };

  const upFun = (a, b) => {
    // 如果a-b等于0，那就按照字母排序
    const v = Number(a.changeRate24H) - Number(b.changeRate24H);
    if (v === 0) {
      const v0 = a.symbol.charCodeAt(0) - b.symbol.charCodeAt(0);
      const v1 = a.symbol.charCodeAt(1) - b.symbol.charCodeAt(1);
      const v2 = a.symbol.charCodeAt(2) - b.symbol.charCodeAt(2);
      return v0 || v1 || v2;
    } else {
      return v; // 或者取changeRate24H
    }
  }; //从小到大

  const gotoTradePage = () => {
    location.href = `/${locale}/trade/usdt/BTCUSDT`;
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const rightItems: TabsProps['items'] = [
    {
      key: 'up',
      label: t('upList'),
    },
    {
      key: 'down',
      label: t('downList'),
    }];
  const leftItems: TabsProps['items'] = [
    {
      key: '1',
      label: t('hotFuture')

    }];

  return (
    <section className={cls(styles.homeData, colorPreference)}>
      <div className={styles.coreContent}>
        <h2 className={styles.title}>{t('hotCoins')}</h2>
        <div className={styles.marketWrapper}>
          <div className={styles.marketLeft}>
            <div className={styles.box}>
              <div className={styles.tabHeader}>
                <Tabs defaultActiveKey="1" items={leftItems} />
              </div>
              <div className={styles.tableContent}>
                <div className={styles.header}>
                  <div className={cls(styles.pairs, styles.left)}>
                    {t('pairs')}
                  </div>
                  <div className={cls(styles.change, styles.left)}>
                    {t('lastPrice')}
                  </div>
                  <div className={cls(styles.change, styles.left)}>
                    {t('24change')}
                  </div>

                  <div className={cls(styles.change, styles.left)}>
                    {t('24volumn')}
                  </div>
                  <div className={cls(styles.trade, styles.right)}>
                    {t('action')}
                  </div>

                  {/* h5才有 */}
                  <div className={cls(styles.change, styles.left, styles.h524Change,)}>
                    {t('lastPrice/24change')}
                  </div>
                </div>
                <div className={styles.content}>
                  {hotData.length
                    ? hotData.map((it, i) => (
                      <LeftRow
                        key={i}
                        {...it}
                        // line={allKlinesDatas?.[it?.symbol] || []}
                        colorPreference={colorPreference}
                      />
                    ))
                    : null}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.marketRight}>
            <div className={styles.box}>
              <div className={styles.tabHeader}>
                <Tabs defaultActiveKey="up" items={rightItems} onChange={handleTabChange} />
              </div>
              <div className={styles.tableContent}>
                <div className={styles.header}>
                  <div className={cls(styles.pairs, styles.left)}>
                    {t('pairs')}
                  </div>
                  <div className={cls(styles.change, styles.left)}>
                    {t('lastPrice')}
                  </div>
                  <div className={cls(styles.rate, styles.right)}>
                    {t('24change')}
                  </div>

                  {/* h5才有 */}
                  <div className={cls(styles.change, styles.left, styles.h524Change,)}>
                    {t('lastPrice/24change')}
                  </div>
                </div>

                <div className={styles.content}>
                  {activeTab === 'up' && upList.length
                    ? upList.map((it, i) => <RightRow key={i} {...it} />)
                    : null}
                  {activeTab === 'down' && downList.length
                    ? downList.map((it, i) => <RightRow key={i} {...it} />)
                    : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.more} onClick={gotoTradePage}>
          {t('more')}
          <ArrowRightSVG className={styles.moreIcon} />
        </div>

      </div>
    </section>
  );
};

export default HomeData;
