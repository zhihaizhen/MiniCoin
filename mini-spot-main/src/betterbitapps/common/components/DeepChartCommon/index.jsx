import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useThrottleEffect } from 'ahooks';
import PaneCanvas from './components/PaneCanvas';

const DEFAULT_INTERVAL = 500; // 深度图默认频率

const DeepChart = ({
  resize,
  tickSizeFraction,
  lotFraction,
  listLen,
  lastPrice,
  depthKineData,
  loaded,
  tickSize,
}) => {
  const [list, setList] = useState([[], []]);

  useThrottleEffect(
    () => {
      // - 直接使用 ws 推送的 bids/asks（最多各 100 条）
      // - 对每侧做累计 total，用于绘制 Y 轴
      const safeLastPrice = Number(lastPrice) || 0;
      const safeLimit = Math.min(Number(listLen) || 100, 100);
      const { rxBuyList = [], rxSellList = [] } = depthKineData || {};

      if (!safeLastPrice || safeLimit < 1) {
        setList([[], []]);
        return;
      }

      const withinRange = (price) => {
        // 过滤掉偏离 lastPrice 超过 60% 的点，避免坐标被极端点拉爆
        const diffRate = Math.abs((Number(price) - safeLastPrice) / safeLastPrice);
        return diffRate <= 0.6;
      };

      // 买盘：期望价格从大到小（靠近 lastPrice 的在前），便于累计从“中心->外侧”
      const buyRaw = (rxBuyList || [])
        .map((it) => ({ price: Number(it?.price), size: Number(it?.size) || 0 }))
        .filter((it) => Number.isFinite(it.price) && it.price <= safeLastPrice && withinRange(it.price))
        .sort((a, b) => b.price - a.price)
        .slice(0, safeLimit);

      // 卖盘：期望价格从小到大（靠近 lastPrice 的在前）
      const sellRaw = (rxSellList || [])
        .map((it) => ({ price: Number(it?.price), size: Number(it?.size) || 0 }))
        .filter((it) => Number.isFinite(it.price) && it.price >= safeLastPrice && withinRange(it.price))
        .sort((a, b) => a.price - b.price)
        .slice(0, safeLimit);

      // 累计（从靠近 lastPrice 的档位向外累计）
      let buyRunning = 0;
      const buyCumNearToFar = buyRaw.map((it) => {
        buyRunning += it.size;
        return {
          // 深度图内部统一使用 number，避免带逗号的字符串导致 Range 计算异常
          price: it.price,
          size: it.size,
          total: buyRunning,
        };
      });

      let sellRunning = 0;
      const sellCumNearToFar = sellRaw.map((it) => {
        sellRunning += it.size;
        return {
          // 深度图内部统一使用 number，避免带逗号的字符串导致 Range 计算异常
          price: it.price,
          size: it.size,
          total: sellRunning,
        };
      });

      // 适配 DataCanvas：
      // - buy: x 从左到右接近中心，因此需要“外侧->中心”排列（价格递增）
      // - sell: x 从中心到右侧，因此保持“中心->外侧”（价格递增）
      const bList = buyCumNearToFar.reverse();
      const sList = sellCumNearToFar;

      setList([bList, sList]);
    },
    [depthKineData, listLen, lastPrice, tickSizeFraction],
    { wait: DEFAULT_INTERVAL },
  );

  return (
    <PaneCanvas
      resize={resize}
      list={list}
      loaded={loaded}
      lastPrice={lastPrice}
      tickSizeFraction={tickSizeFraction}
      lotFraction={lotFraction}
    />
  );
};

DeepChart.defaultProps = {
  resize: {},
  tickSizeFraction: 1,
  lotFraction: 0,
  listLen: 100, // 默认保持60档位
  lastPrice: 0,
  depthKineData: {},
  loaded: false,
  tickSize: 0,
};

DeepChart.propTypes = {
  resize: PropTypes.object,
  tickSizeFraction: PropTypes.number,
  lotFraction: PropTypes.number,
  listLen: PropTypes.number,
  lastPrice: PropTypes.number,
  depthKineData: PropTypes.object,
  loaded: PropTypes.bool,
  tickSize: PropTypes.number,
};

export default DeepChart;
