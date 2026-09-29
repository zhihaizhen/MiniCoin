import { toThousands } from '@unified/helpers';
import { TRADE_THEMES } from 'common/packages-biz/global-settings';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';

let [
  canvas,
  context,
  ratio,
  chartX, // 图表x轴间距
  chartY, // 图表y轴间距
  chartX0, // 图表x轴0点坐标
  chartY0, // 图表y轴0点坐标
  canvasW, // 画布宽度
  canvasH, // 画布高度
  listLen, // 数据的length
  buyMax, // 买方最大
  sellMax, // 卖方最大
  chartMin, // 数据的最小值 Y轴
  chartMax, // 数据的最大值 Y轴
  chartPerW, // X轴每一段的长度
  chartWidth, // 图表长度
  chartHeight, // 图表高度
  buyList,
  sellList,
] = [];
const rootStyle = getComputedStyle(document.querySelector(':root'));
const getLineColor = () =>
  rootStyle.getPropertyValue('--line-border-default').trim() || '#28292A';
const getLineColor1 = () =>
  rootStyle.getPropertyValue('--line-border-default').trim() || '#28292A';
const getBuyLineColor = () => rootStyle.getPropertyValue('--long');
const getSellLineColor = () => rootStyle.getPropertyValue('--short');
const getFontColor = () => rootStyle.getPropertyValue('--text-primary');
const fontSize = rootStyle.getPropertyValue('--font-size-20');
const getBuyFillColor = () =>
  rootStyle.getPropertyValue('--text-green').trim() || '#ABE127';
const getSellFillColor = () =>
  rootStyle.getPropertyValue('--text-red').trim() || '#F43F5E';

const DataChartCanvas = ({
  resize,
  list,
  className,
  lastPrice,
  currentTheme,
  tickSizeFraction,
  lotFraction,
}) => {
  const canvasRef = useRef();
  const obAnimateRef = useRef();

  const isFiniteNumber = (n) => Number.isFinite(n);
  const isGeometryReady = () =>
    [
      ratio,
      chartX,
      chartY,
      chartX0,
      chartY0,
      canvasW,
      canvasH,
      chartWidth,
      chartHeight,
    ].every(isFiniteNumber) &&
    canvasW > 0 &&
    canvasH > 0 &&
    chartWidth > 0 &&
    chartHeight > 0;

  // function
  // 计算y轴坐标
  const matchLineY = (v) => {
    if (!v) return chartY0;
    if (!chartMax || chartMax === chartMin) return chartY0;
    return Math.round(
      chartY0 - ((v - chartMin) * chartHeight) / (chartMax - chartMin),
    );
  };

  // 纵轴数值格式化：
  // - 大数用 K/M
  // - 小数按量精度展示，并去掉尾随 0，避免出现“00003/99999”这种不友好的观感
  const formatYAxisTotal = useCallback(
    (v) => {
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) return '0';
      if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
      if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
      const p = Number.isFinite(lotFraction) ? Math.min(Math.max(lotFraction, 0), 8) : 4;
      return n
        .toFixed(p)
        .replace(/(\.\d*?)0+$/, '$1')
        .replace(/\.$/, '');
    },
    [lotFraction],
  );

  const drawChart = useCallback(() => {
    // 注意：chartPerW 由 resetData() 计算，因此这里不能把它作为“初始化就绪”的前置条件
    if (!context || !isGeometryReady() || !Number.isFinite(chartPerW) || chartPerW <= 0) return;
    context.font = `${fontSize} Verdana`;
    context.fillStyle = getFontColor();
    // 生成buy数据图表
    if (buyList.length > 0) {
      // 描边：保留内部阶梯竖线，去掉两端封口竖线
      context.beginPath();
      context.strokeStyle = getBuyLineColor();
      context.lineWidth = 1 * ratio;
      for (let i = 0; i < buyList.length - 1; i += 1) {
        const x0 = chartX0 + chartPerW * i;
        const x1 = x0 + chartPerW;
        const y0 = matchLineY(buyList[i].total);
        if (i === 0) {
          context.moveTo(x0, y0); // 从数据高度开始，跳过左侧封口竖线
        } else {
          context.lineTo(x0, y0); // 内部阶梯竖向连接，保留
        }
        context.lineTo(x1, y0); // 水平线
        // 最后一步不补 lineTo(x1, chartY0)，跳过右侧封口竖线
      }
      context.stroke();
      context.closePath();

      // 填充（完整封闭路径用于 fill 正确封口，不 stroke）
      context.beginPath();
      context.moveTo(chartX0, chartY0);
      for (let i = 0; i < buyList.length - 1; i += 1) {
        const x0 = chartX0 + chartPerW * i;
        const x1 = x0 + chartPerW;
        const y0 = matchLineY(buyList[i].total);
        context.lineTo(x0, y0);
        context.lineTo(x1, y0);
        if (i === buyList.length - 2) {
          context.lineTo(x1, chartY0);
        }
      }
      context.globalAlpha = 0.1;
      context.fillStyle = getBuyFillColor();
      context.fill();
      context.globalAlpha = 1;
      context.closePath();

      // x轴 数据
      context.textAlign = 'center';
      context.font = `${fontSize} Verdana`;
      context.fillStyle = getFontColor();
      context.fillText(
        toThousands(buyList[0].price || 0, tickSizeFraction),
        chartX0,
        chartY0 + 30,
      );
    }
    // 生成sell数据图表
    if (sellList.length > 0) {
      const chartSellX0 = canvasW / 2 + chartPerW;

      // 描边：保留内部阶梯竖线，去掉两端封口竖线
      context.beginPath();
      context.strokeStyle = getSellLineColor();
      context.lineWidth = 1 * ratio;
      for (let i = 0; i < sellList.length - 1; i += 1) {
        const x0 = chartSellX0 + chartPerW * i;
        const x1 = x0 + chartPerW;
        const y0 = matchLineY(sellList[i].total);
        if (i === 0) {
          context.moveTo(x0, y0); // 从数据高度开始，跳过左侧封口竖线
        } else {
          context.lineTo(x0, y0); // 内部阶梯竖向连接，保留
        }
        context.lineTo(x1, y0); // 水平线
        // 最后一步不补 lineTo(x1, chartY0)，跳过右侧封口竖线
      }
      context.stroke();
      context.closePath();

      // 填充（完整封闭路径用于 fill 正确封口，不 stroke）
      context.beginPath();
      context.moveTo(chartSellX0, chartY0);
      for (let i = 0; i < sellList.length - 1; i += 1) {
        const x0 = chartSellX0 + chartPerW * i;
        const x1 = x0 + chartPerW;
        const y0 = matchLineY(sellList[i].total);
        context.lineTo(x0, y0);
        context.lineTo(x1, y0);
        if (i === sellList.length - 2) {
          context.lineTo(x1, chartY0);
        }
      }
      context.globalAlpha = 0.1;
      context.fillStyle = getSellFillColor();
      context.fill();
      context.globalAlpha = 1;
      context.closePath();

      // x轴 数据
      context.textAlign = 'center';
      context.font = `${fontSize} Verdana`;
      context.fillStyle = getFontColor();
      context.fillText(
        toThousands([...sellList].pop().price || 0, tickSizeFraction),
        chartWidth + chartX,
        chartY0 + 30,
      );
    }

    // 生成 Y 轴数据
    context.textAlign = 'right';
    context.font = `${fontSize} Verdana`;
    context.fillStyle = getFontColor();
    context.fillText('0', chartX0 - 10, chartY0);
    if (chartMax > 0) {
      context.fillText(`${formatYAxisTotal(chartMax)}-`, chartX0, chartY);
    }
    const buyMaxY = matchLineY(buyMax);
    if (buyMax > chartMax / 3 && buyMax < chartMax) {
      context.fillText(`${formatYAxisTotal(buyMax)}-`, chartX0, buyMaxY);
    }
    if (sellMax > chartMax / 3 && sellMax < chartMax) {
      const sellMaxY = matchLineY(sellMax);
      // buy 和 sell 高度差距超过20才会显示sell
      if (Math.abs(buyMaxY - sellMaxY) > 20) {
        context.fillText(`${formatYAxisTotal(sellMax)}-`, chartX0, sellMaxY);
      }
    }
    // X 轴市价
    context.textAlign = 'center';
    context.fillText(
      toThousands(lastPrice || 0, tickSizeFraction),
      canvasW / 2,
      chartY0 + 30,
    );

    // 创建 市价纵轴
    context.beginPath();
    context.strokeStyle = getLineColor();
    context.moveTo(canvasW / 2, chartY0 + 10);
    context.lineTo(canvasW / 2, chartY);
    context.stroke();
    context.closePath();

    // X轴
    context.beginPath();
    context.strokeStyle = getLineColor1();
    context.moveTo(chartX0 - 10, chartY0);
    context.lineTo(canvasW - chartX + 20, chartY0);
    context.stroke();
    context.closePath();

    // 创建图表的Y轴
    context.beginPath();
    context.strokeStyle = getLineColor1();
    context.moveTo(chartX0, chartY0 + 10);
    context.lineTo(chartX0, chartY - 20);
    context.stroke();
    context.closePath();
  }, [formatYAxisTotal, lastPrice, tickSizeFraction]);

  const resetData = () => {
    if (!context || !isGeometryReady()) return;
    // 重置图表
    const buyLen = Array.isArray(buyList) ? buyList.length : 0;
    const sellLen = Array.isArray(sellList) ? sellList.length : 0;
    // DataCanvas 的绘制循环用的是 length - 1，所以这里至少要保证 >=1，否则会出现除零/Infinity
    listLen = Math.max(buyLen, sellLen) - 1;
    if (!Number.isFinite(listLen) || listLen < 1) {
      listLen = 1;
    }
    buyMax =
      buyList.length > 0
        ? buyList.reduce((a, b) => (b.total > a.total ? b : a)).total
        : 0;
    sellMax =
      sellList.length > 0
        ? sellList.reduce((a, b) => (b.total > a.total ? b : a)).total
        : 0;
    const max = Math.max(buyMax, sellMax);
    chartPerW = chartWidth / (listLen * 2 + 2); // 中间间隔2个宽度
    chartMin = 0;
    chartMax = Number.isFinite(max) ? max * 1.2 : 0; // Y轴最大值是最大值的20%
    context.clearRect(0, 0, canvasW, canvasH);
  };

  const requestAnimationFrame = useCallback(() => {
    if (obAnimateRef.current) cancelAnimationFrame(obAnimateRef.current);
    obAnimateRef.current = window.requestAnimationFrame(() => {
      if (!context || !isGeometryReady()) return;
      resetData();
      drawChart();
    });
  }, [drawChart]);

  useEffect(() => {
    canvas = canvasRef.current;
    context = canvas.getContext('2d');
    ratio = 2;
  }, []);
  useEffect(() => {
    [buyList, sellList] = [list[0], list[1]];
    if (buyList.length > 0 || sellList.length > 0) {
      requestAnimationFrame();
    }
  }, [list, currentTheme, requestAnimationFrame]);

  useEffect(() => {
    const parentStyle = canvas.parentNode.getBoundingClientRect();
    const bodyWidth = parentStyle.width;
    const bodyHeight = parentStyle.height;
    canvas.style.width = `${bodyWidth}px`;
    canvas.style.height = `${bodyHeight}px`;
    canvas.width = bodyWidth * ratio;
    canvas.height = bodyHeight * ratio;
    const scaleX = bodyWidth / 862;
    const scaleY = bodyHeight / 544;
    chartX = 50 * ratio * scaleX;
    chartY = 30 * ratio * scaleY;
    canvasW = canvas.width;
    canvasH = canvas.height;
    chartX0 = chartX;
    chartY0 = canvasH - chartY;
    chartWidth = canvasW - chartX * 2; // canvas 宽度减去左右间距
    chartHeight = canvasH - chartY * 2; // canvas 高度减去上下边距
    requestAnimationFrame();
  }, [requestAnimationFrame, resize]);

  return <canvas ref={canvasRef} className={className} />;
};

DataChartCanvas.defaultProps = {
  list: [],
  resize: {},
  className: 'canvas-viewport',
  lastPrice: 0,
  tickSizeFraction: 1,
  currentTheme: TRADE_THEMES.LIGHT,
  lotFraction: 4,
};

DataChartCanvas.propTypes = {
  list: PropTypes.array,
  resize: PropTypes.object,
  className: PropTypes.string,
  lastPrice: PropTypes.number,
  tickSizeFraction: PropTypes.number,
  currentTheme: PropTypes.string,
  lotFraction: PropTypes.number,
};

export default DataChartCanvas;
