import useRecentTradeStream from 'common/public-ws/stream-hooks/use-recentTrade-stream';
import React, { useEffect, useState, useMemo } from 'react';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@/store';
import useUserStore from '@/store-hooks/use-user-store';
import useOrderCoinTypeInfo from '@/hooks/use-orderCoinType-info';
import List from './List';
import './react-trade.css';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';

const RecentTrade = () => {
  const [t] = useTranslation();
  const { loaded, list } = useRecentTradeStream();
  const { unit } = useOrderCoinTypeInfo()
  const [state] = useGlobalState();
  const { orderCoinTypeValue } = useUserStore();
  const { symbol, coin, walletCoin } = state;
  const { lotFraction, priceFraction, balanceFraction } = useCurSymbolConfig(symbol);

  const [data, setData] = useState([])

  const tranformData = (it) => {
    const item = {
      ...it
    }
    const { execPrice, execQty } = item;
    if (orderCoinTypeValue !== coin) {
      item.execQty = Number(execQty) * Number(execPrice)
    }
    return item
  }

  // 数据处理
  useEffect(() => {
    if (loaded && list) {
      const len = list.length;
      const rtData = [];
      for (let i = 0; i < len; i += 1) {
        const it = tranformData(list[i])
        rtData.push(it);
      }
      setData(rtData)
    }
  }, [list, orderCoinTypeValue])

  const qtyPrecision = useMemo(() => {
    let res = lotFraction
    if (orderCoinTypeValue !== coin) {
      res = 2; // USD 固定2位小数
    }
    return res
  }, [orderCoinTypeValue, lotFraction, balanceFraction])
  // console.log("data:", data,list);

  return (
    <div className="list-wrapper">
      <Choose>
        <When condition={loaded}>
          <div className="list-thead">
            <span className="rt__row-left">{t('price')}</span>
            <span className="rt__row-center">{`${t('quantity')}(${unit})`}</span>
            <span className="rt__row-right">{t('Time')}</span>
          </div>
          <List
            list={data}
            qtyPrecision={qtyPrecision}
            lastPricePrecision={priceFraction}
          />
        </When>
        <Otherwise>
          <div className="flex ob-loading">
            <Spin />
          </div>
        </Otherwise>
      </Choose>
    </div>

  );
};

export default RecentTrade;
