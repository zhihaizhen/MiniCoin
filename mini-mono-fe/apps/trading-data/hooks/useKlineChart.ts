// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { unixToFormat } from '~/utils/day';
import type { KlineListResponse, FetchKline } from '~/types/kline';

// 每根 K 线跨越的秒数，用于左滑加载更早历史数据时计算 from
const RESOLUTION_SECONDS = {
  1: 60,
  5: 300,
  30: 1800,
  60: 3600,
  D: 86400,
  W: 604800,
  M: 2592000
};

// 每次左滑补拉的 K 线根数
const LOAD_MORE_CHUNK_BARS = 300;
// 剩余可视根数小于该阈值时触发补拉
const LOAD_MORE_THRESHOLD_BARS = 50;

function timeToLocal(originalTime) {
  const d = new Date(originalTime * 1000);
  return (
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    ) / 1000
  );
}

function calculateNthPower(n) {
  return Math.pow(0.1, n).toFixed(n);
}

/**
 * 通用 K 线图 hook：负责创建/销毁 lightweight-charts 实例、拉取初始区间数据，
 * 并在左滑接近已加载数据的左边界时自动补拉更早的历史数据（补拉后保持可视范围不跳动）。
 *
 * 用回调 ref 拿到挂载好的容器节点（而不是依赖父组件的 loading 状态判断时机），
 * 从根源上避免"容器还没渲染出来就创建 chart"的时序问题。
 *
 * @param {Object} options
 * @param {HTMLElement | null} options.container 图表容器 DOM 节点（配合 useState + ref callback 使用）
 * @param {(params: { symbol: string; resolution: string; from: number; to: number }) => Promise<{ list: any[] }>} options.fetchKline K 线数据接口
 * @param {string} options.symbol 当前合约
 * @param {string} options.resolution 当前 K 线周期
 * @param {{ from: number; to: number }} options.dateRange 当前周期对应的初始拉取区间（秒级时间戳）
 * @param {number} [options.priceFraction] 价格精度，用于图表 priceFormat
 * @param {string} options.lang 当前语言，用于图表 locale
 * @param {(key: string, fallback?: string) => string} options.t 多语言函数，用于 tooltip 文案
 * @returns {{ loading: boolean }} loading 表示当前周期的整段数据是否正在加载中
 */
export function useKlineChart({
  container,
  fetchKline,
  symbol,
  resolution,
  dateRange,
  priceFraction,
  lang,
  t
}) {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const noMoreHistoryRef = useRef(false);
  const isPrependingRef = useRef(false);
  const lastBarCountRef = useRef(0);
  // fitContent() 会把已加载数据整体压缩进可视区域，导致 barsBefore 必然为 0，
  // 从而误触发一次不必要的自动补拉；用该标记跳过这一次
  const skipAutoLoadRef = useRef(false);
  // 当前已加载数据里最早一根的 startAt，用 ref 同步维护（不经过 setState/渲染）。
  // loadMoreHistory 用它计算下一次补拉边界：避免依赖 state 的 data 造成的渲染延迟——
  // 上一次补拉的 Promise resolve 后会立刻重置 loadingMoreRef，但 setData 触发的重渲染
  // 要等到下一个事件循环才完成；如果这期间用户仍在连续拖拽触发新的补拉，
  // 读取到的还是渲染前的旧 data，会用同一个 earliest 发出参数完全相同的重复请求，
  // 而重复请求的响应合并时必然「无新增数据」，从而被误判为「已到最早历史」。
  const earliestRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = useCallback(() => {
    if (!symbol) return;
    setLoading(true);
    fetchKline({
      symbol,
      resolution,
      from: Math.floor(dateRange.from),
      to: Math.floor(dateRange.to)
    }).then((res: KlineListResponse) => {
      setLoading(false);
      const list = res?.list || [];
      setData(list);
      earliestRef.current = list.length
        ? Math.min(...list.map((it) => it.startAt))
        : null;
      // 初始区间本身就已命中后端历史访问上限时，直接跳过后续补拉，
      // 而不是等用户左滑触发一次注定拿不到数据的补拉请求
      noMoreHistoryRef.current = res?.enableCache ?? false;
    });
  }, [fetchKline, symbol, resolution, dateRange]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 切换合约/周期时，重置左滑加载历史数据的状态
  useEffect(() => {
    loadingMoreRef.current = false;
    noMoreHistoryRef.current = false;
    earliestRef.current = null;
  }, [symbol, resolution]);

  // 左滑接近最早一根 K 线时，向前补拉更早的历史数据
  const loadMoreHistory = useCallback(() => {
    if (!symbol || loadingMoreRef.current || noMoreHistoryRef.current) return;
    // 用发起本次请求时刻的 earliest 计算边界，同时也作为响应回来后判断
    // 「是否真的有更早数据」的基准（而不是依赖当时可能还没更新完的 state）
    const earliestBeforeRequest = earliestRef.current;
    if (!earliestBeforeRequest) return;
    const barSeconds = RESOLUTION_SECONDS[resolution] || 60;
    const to = earliestBeforeRequest - 1;
    const from = to - barSeconds * LOAD_MORE_CHUNK_BARS;
    loadingMoreRef.current = true;
    (fetchKline as FetchKline)({ symbol, resolution, from, to })
      .then((res: KlineListResponse) => {
        const enableCache = res?.enableCache ?? false;

        if (enableCache) {
          // 后端已标记达到历史数据访问上限，停止继续向前补拉，
          // 且不再进入后续的 data 合并逻辑，保留已有数据不被清除或覆盖
          noMoreHistoryRef.current = true;
          return;
        }

        const older = (res?.list || []).filter(
          (it) => it.startAt < earliestBeforeRequest
        );
        if (!older.length) {
          noMoreHistoryRef.current = true;
          return;
        }
        // 必须在 setData 之前、同步地推进 earliestRef：
        // setData 触发的重渲染是异步的，而下一次 loadMoreHistory 调用
        // （哪怕来自尚未更新的旧闭包）读取的都是这里同步写入的最新值，
        // 从根源上避免用旧 earliest 重复发出同一个区间的请求
        earliestRef.current = Math.min(...older.map((it) => it.startAt));
        isPrependingRef.current = true;
        setData((prev) => [...older, ...prev]);
      })
      .catch(() => {
        // 网络异常不标记为 noMoreHistory，允许下次滑动重试
      })
      .finally(() => {
        loadingMoreRef.current = false;
      });
  }, [fetchKline, symbol, resolution]);

  // 用 ref 保存最新的 loadMoreHistory，供图表的滚动回调调用，避免闭包过期
  const loadMoreHistoryRef = useRef(loadMoreHistory);
  useEffect(() => {
    loadMoreHistoryRef.current = loadMoreHistory;
  }, [loadMoreHistory]);

  // 创建/销毁 chart：仅在容器、合约、精度、语言变化时重建
  useEffect(() => {
    if (!container) return;
    container.innerHTML = '';
    const chart = createChart(container, {
      layout: {
        textColor: '#71757A',
        background: { type: 'solid', color: '#F7F7F7' }
      },
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: true,
        barSpacing: 13
      }
    });
    const toolTipWidth = 80;
    const toolTipHeight = 80;
    const toolTipMargin = 15;

    const candleSeries = chart.addCandlestickSeries({});
    candleSeries.applyOptions({
      priceFormat: {
        type: 'price',
        precision: priceFraction || 2,
        minMove: calculateNthPower(priceFraction) || 0.01
      },
      upColor: '#ABE127', // 绿色主题色
      downColor: '#FA465B', // 绿色主题色
      borderUpColor: '#ABE127',
      borderDownColor: '#FA465B'
    });
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lastBarCountRef.current = 0;

    // Create and style the tooltip html element
    const toolTip = document.createElement('div');
    toolTip.style = `width: 200px; height: 88px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border: 1px solid; border-radius: 2px;`;
    toolTip.style.background = 'white';
    toolTip.style.color = 'black';
    toolTip.style.borderColor = '#EBEBEB';
    container.appendChild(toolTip);

    // update tooltip
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        toolTip.style.display = 'none';
      } else {
        toolTip.style.display = 'block';
        const barData = param.seriesData.get(candleSeries);
        const price = barData.close;
        const tm = param?.time * 1000;
        const timestampMinusEightHours = tm - 8 * 60 * 60 * 1000;

        // #101112 为--text-primary   #EBEBEB--line-divider-primary
        toolTip.innerHTML = `<div style="color: ${'#5E626E'}; border-bottom: ${'1px solid #EBEBEB'};padding: 4px;">
          ${t('open')}: <span style="color: ${'#101112'};">${
          barData.open
        }</span>
          ${t('close')}: <span style="color: ${'#101112'};">${
          barData.close
        }</span>
          </div>

          <div style="color: ${'#5E626E'}; border-bottom: ${'1px solid #EBEBEB'}; padding: 4px">
          ${t('high')}: <span style="color: ${'#101112'};">${
          barData.high
        }</span>
          ${t('low')}: <span style="color: ${'#101112'};">${barData.low}</span>
          </div>

          <div style="color: ${'#5E626E'};  padding: 4px">
          ${t('time')}: <span style="color: ${'#101112'}">${unixToFormat(
          timestampMinusEightHours
        )}</span>
          </div>`;

        const coordinate = candleSeries.priceToCoordinate(price);
        if (coordinate === null) return;
        let shiftedCoordinate = Math.max(
          0,
          Math.min(container.clientWidth - toolTipWidth, param.point.x - 50)
        );
        const coordinateY =
          coordinate - toolTipHeight - toolTipMargin > 0
            ? coordinate - toolTipHeight - toolTipMargin
            : Math.max(
                0,
                Math.min(
                  container.clientHeight - toolTipHeight - toolTipMargin,
                  coordinate + toolTipMargin
                )
              );
        toolTip.style.left = shiftedCoordinate + 'px';
        toolTip.style.top = coordinateY + 'px';
      }
    });

    chart.applyOptions({
      localization: {
        locale: lang,
        dateFormat: 'zh-CN' === lang ? 'yyyy-MM-dd' : "dd MMM 'yy"
      }
    });

    // 左滑接近已加载数据的左边界（剩余 K 线 < 阈值）时，拉取更早的历史数据
    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange((newVisibleLogicalRange) => {
        if (!newVisibleLogicalRange || !candleSeriesRef.current) return;
        if (skipAutoLoadRef.current) {
          // 本次可视范围变化是 setData()/fitContent() 程序触发的（可能连续触发多次），
          // 不代表用户左滑到了边界；跳过窗口由 setTimeout 统一复位，不在此处复位
          return;
        }
        const barsInfo = candleSeriesRef.current.barsInLogicalRange(
          newVisibleLogicalRange
        );
        if (
          barsInfo !== null &&
          barsInfo.barsBefore < LOAD_MORE_THRESHOLD_BARS
        ) {
          loadMoreHistoryRef.current?.();
        }
      });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [container, lang, symbol, priceFraction]);

  // 仅在数据变化时更新已有的图表数据，不重建整个 chart，避免左滑加载后视图跳动
  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    if (!chart || !candleSeries) return;

    const sorted = [...data].sort((a, b) => a.startAt - b.startAt);
    const formatted = sorted.map((item) => ({
      ...item,
      time: timeToLocal(item.startAt)
    }));

    if (isPrependingRef.current) {
      // 追加的是更早的历史数据：保持当前可视范围不跳动
      const prevRange = chart.timeScale().getVisibleLogicalRange();
      const addedBars = formatted.length - lastBarCountRef.current;
      candleSeries.setData(formatted);
      if (prevRange && addedBars > 0) {
        chart.timeScale().setVisibleLogicalRange({
          from: prevRange.from + addedBars,
          to: prevRange.to + addedBars
        });
      }
      isPrependingRef.current = false;
    } else {
      // 初次加载/切换合约或周期：展示完整数据范围
      // setData()/fitContent() 触发的可视范围变化事件不应被判定为"用户左滑到边界"，
      // 用 setTimeout 把跳过窗口延长到这一批同步 DOM/图表操作全部结束之后再关闭
      skipAutoLoadRef.current = true;
      candleSeries.setData(formatted);
      chart.timeScale().fitContent();
      setTimeout(() => {
        skipAutoLoadRef.current = false;
      }, 0);
    }
    lastBarCountRef.current = formatted.length;
    // container 也作为依赖：chart 刚创建时（container 变化）需要立即把当前
    // data 灌入新的 series，不能只等 data 自身变化才触发
  }, [data, container]);

  return { loading };
}

export default useKlineChart;
