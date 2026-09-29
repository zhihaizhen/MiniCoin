import { toThousands } from '@unified/helpers'
import { TRADE_THEMES } from 'common/packages-biz/global-settings'
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DataChartCanvas from './DataCanvas';
import './PaneCanvas.css';

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
  position, // 鼠标位置
  buyList,
  sellList,
] = [];

const DeepChartCanvas = ({
  lastPrice,
  resize,
  list,
  currentTheme,
  tickSizeFraction,
  lotFraction,
}) => {
  const [t] = useTranslation();
  const canvasRef = useRef();
  const obAnimateRef = useRef();

  // theme 样式
  const rootStyle = getComputedStyle(document.querySelector(':root'));
  const getLineColor2 = useCallback(
    () => rootStyle.getPropertyValue('--text-tertiary'),
    [rootStyle],
  );
  const buyColor = rootStyle.getPropertyValue('--long');
  const sellColor = rootStyle.getPropertyValue('--short');
  const getPopperBgColor = useCallback(
    () => rootStyle.getPropertyValue('--bg-secondary'),
    [rootStyle],
  );
  const getFontColor = useCallback(
    () => rootStyle.getPropertyValue('--color-text-a'),
    [rootStyle],
  );

  // 计算y轴坐标
  const matchLineY = (v) => {
    if (!v) return chartY0;
    if (!chartMax || chartMax === chartMin) return chartY0;
    return Math.round(
      chartY0 - ((v - chartMin) * chartHeight) / (chartMax - chartMin),
    );
  };

  // 根据坐标计算，当前是数组内的index
  const matchLineX = (x, type) => {
    const halfChartWidth = chartWidth / 2 - chartPerW;
    const x0 = type === 'sell' ? canvasW / 2 + chartPerW : chartX0;
    return Math.floor(((x - x0) * listLen) / halfChartWidth);  // 每一个数据的X轴
  };

  const drawChartByMove = useCallback(() => {
    context.clearRect(0, 0, canvasW, canvasH);
    if (buyList.length < 1 || sellList.length < 1 || !position) return;
    const [x, y] = [position.x, position.y];
    // 如果鼠标在有效区域内
    if (x > chartX && x < canvasW - chartX) {
      let [buyData, sellData] = [];
      const toNum = (v) => {
        const n = Number(String(v ?? '').replace(/,/g, ''));
        return Number.isFinite(n) ? n : 0;
      };
      const safeLastPrice = toNum(lastPrice);
      if (!safeLastPrice) return;

      const labelColor = getLineColor2();
      const valueColor = getFontColor();

      const formatRange = (p) => {
        const price = toNum(p);
        const diff = ((price - safeLastPrice) * 100) / safeLastPrice;
        if (!Number.isFinite(diff)) return '0%';
        const fixed = diff.toFixed(1);
        return diff > 0 ? `+${fixed}%` : `${fixed}%`;
      };

      const drawDashedVLine = (x0) => {
        context.save();
        context.beginPath();
        context.setLineDash([6, 6]);
        context.strokeStyle = labelColor;
        context.moveTo(x0, chartY);
        context.lineTo(x0, chartY0 + 10);
        context.stroke();
        context.closePath();
        context.restore();
      };

      const drawPoint = (x0, y0, color) => {
        context.beginPath();
        context.arc(x0, y0, 6, 0, 2 * Math.PI, true);
        context.fillStyle = color;
        context.fill();
        context.closePath();
      };

      const drawTooltip = ({
        anchorX,
        anchorY,
        side, // 'left' | 'right'
        priceText,
        amountText,
      }) => {
        // 卡片尺寸（canvas 像素坐标系）
        const w = 260;
        const h = 92;
        const padX = 18;
        const rowH = 34;
        const radius = 10;

        // 位置：左侧卡片放在点的右边；右侧卡片放在点的左边
        let x0 = side === 'left' ? anchorX + 16 : anchorX - w - 16;
        let y0 = anchorY - h / 2;

        // 防止溢出
        x0 = Math.max(10, Math.min(x0, canvasW - w - 10));
        y0 = Math.max(10, Math.min(y0, canvasH - h - 10));

        // 背景（圆角矩形）
        context.save();
        context.beginPath();
        context.shadowOffsetX = 4;
        context.shadowOffsetY = 4;
        context.shadowBlur = 16;
        context.shadowColor = 'rgba(0, 0, 0, 0.18)';
        context.fillStyle = '#F5F6F7';
        context.moveTo(x0 + radius, y0);
        context.arcTo(x0 + w, y0, x0 + w, y0 + h, radius);
        context.arcTo(x0 + w, y0 + h, x0, y0 + h, radius);
        context.arcTo(x0, y0 + h, x0, y0, radius);
        context.arcTo(x0, y0, x0 + w, y0, radius);
        context.closePath();
        context.fill();
        context.restore();

        // 文案
        context.save();
        context.shadowColor = 'transparent';
        context.textBaseline = 'middle';
        context.font = '20px Verdana';

        // Range 行先不展示（当前 range 计算不稳定，避免误导）
        // Price 行
        const y2 = y0 + rowH / 2 + 10;
        context.textAlign = 'left';
        context.fillStyle = labelColor;
        context.fillText(t('bookSymbolLastTradePrice'), x0 + padX, y2);
        context.textAlign = 'right';
        context.fillStyle = valueColor;
        context.fillText(priceText, x0 + w - padX, y2);

        // Amount 行
        const y3 = y2 + rowH;
        context.textAlign = 'left';
        context.fillStyle = labelColor;
        context.fillText(t('transferMoney'), x0 + padX, y3);
        context.textAlign = 'right';
        context.fillStyle = valueColor;
        context.fillText(amountText, x0 + w - padX, y3);

        context.restore();
      };

      // 如果在Buy数据图表内
      if (x > chartX && x < canvasW / 2 - chartPerW) {
        const index = matchLineX(x);
        if (index < 0 || index > listLen - 1) return;
        const newIndex = listLen - index - 1;
        const buyItem = buyList[index];
        const sellItem = sellList[newIndex];
        if (!buyItem || !sellItem) return;
        buyData = {
          index,
          data: buyItem,
          x,
          y: matchLineY(buyItem.total),
        };
        sellData = {
          index: newIndex,
          data: sellItem,
          x: canvasW - x,
          y: matchLineY(sellItem.total),
        };
      }
      // 如果在 sell 图表
      if (x > canvasW / 2 + chartPerW && x < canvasW - chartX) {
        const index = matchLineX(x, 'sell');
        if (index < 0 || index > listLen - 1) return;
        const newIndex = listLen - index - 1;
        const sellItem = sellList[index];
        const buyItem = buyList[newIndex];
        if (!buyItem || !sellItem) return;
        buyData = {
          index: newIndex,
          data: buyItem,
          x: canvasW - x,
          y: matchLineY(buyItem.total),
        };
        sellData = {
          index,
          data: sellItem,
          x,
          y: matchLineY(sellItem.total),
        };
      }
      if (buyData && sellData) {
        // 两侧虚线 + 点
        drawDashedVLine(buyData.x);
        drawDashedVLine(sellData.x);

        const buyY = matchLineY(buyData.data.total);
        const sellY = matchLineY(sellData.data.total);
        drawPoint(buyData.x, buyY, buyColor);
        drawPoint(sellData.x, sellY, sellColor);

        // 两侧 tooltip（参考截图：Range / Price / Amount）
        drawTooltip({
          anchorX: buyData.x,
          anchorY: buyY,
          side: 'left',
          priceText: toThousands(buyData.data.price || 0, tickSizeFraction),
          amountText: toThousands(buyData.data.total || 0, lotFraction),
        });
        drawTooltip({
          anchorX: sellData.x,
          anchorY: sellY,
          side: 'right',
          priceText: toThousands(sellData.data.price || 0, tickSizeFraction),
          amountText: toThousands(sellData.data.total || 0, lotFraction),
        });
      }
    }
  }, [
    buyColor,
    getFontColor,
    getLineColor2,
    getPopperBgColor,
    lastPrice,
    lotFraction,
    sellColor,
    t,
    tickSizeFraction,
  ]);
  // 重置图表  resize 或者数据改变都会使用
  const resetData = () => {
    // hover 映射会同时访问 buyList[index] 和 sellList[newIndex]，因此用两侧最小长度避免越界
    const minLen = Math.min(buyList?.length || 0, sellList?.length || 0);
    listLen = Math.max(minLen - 1, 1);
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
  };

  const requestAnimationFrame = useCallback(
    (pos) => {
      position = pos;
      if (obAnimateRef.current) cancelAnimationFrame(obAnimateRef.current);
      obAnimateRef.current = window.requestAnimationFrame(() => {
        drawChartByMove();
      });
    },
    [drawChartByMove],
  );

  const moveEvent = useCallback(
    (e) => {
      const offsetX = e.offsetX || e.clientX;
      const offsetY = e.offsetY || e.clientY;
      const x = offsetX * ratio;
      const y = offsetY * ratio;
      requestAnimationFrame({ x, y });
    },
    [requestAnimationFrame],
  );

  useEffect(() => {
    canvas = canvasRef.current;
    context = canvas.getContext('2d');
    ratio = 2;
    canvas.addEventListener('mousemove', moveEvent, false);
    canvas.addEventListener(
      'mouseout',
      () => {
        requestAnimationFrame(null);
      },
      false,
    );
    return () => {
      canvas.removeEventListener('mousemove', moveEvent, false);
    };
  }, [moveEvent, requestAnimationFrame]);
  // 初始化数据
  useEffect(() => {
    [buyList, sellList] = [list[0], list[1]];
    if (buyList.length > 0 || sellList.length > 0) {
      resetData();
      requestAnimationFrame(position);
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
    resetData();
  }, [resize]);

  return (
    <div className="chart-viewport">
      <DataChartCanvas
        list={list}
        resize={resize}
        lastPrice={lastPrice}
        tickSizeFraction={tickSizeFraction}
        lotFraction={lotFraction}
        className="canvas-viewport"
      />
      {/* 鼠标操作层 */}
      <canvas className="canvas-viewport" ref={canvasRef} />
    </div>
  );
};

DeepChartCanvas.defaultProps = {
  list: [],
  lastPrice: 0,
  resize: {},
  currentTheme: TRADE_THEMES.LIGHT,
  tickSizeFraction: 1,
  lotFraction: 0,
};

DeepChartCanvas.propTypes = {
  list: PropTypes.array,
  lastPrice: PropTypes.number,
  resize: PropTypes.object,
  currentTheme: PropTypes.string,
  tickSizeFraction: PropTypes.number,
  lotFraction: PropTypes.number,
};

export default DeepChartCanvas;
