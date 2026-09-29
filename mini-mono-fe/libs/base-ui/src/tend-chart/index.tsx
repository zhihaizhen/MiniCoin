import React, { useId, useMemo } from 'react';

interface Props {
  colorPreference: string;
  /** 24小时的最近的价格数据 */
  chartDataList?: number[];
  /** svg 宽度 */
  width?: number;
  /** svg 高度 */
  height?: number;
  /** 折线颜色 */
  strokeColor?: string;
  /** 折线宽度 */
  strokeWidth?: number;
  /** 折线距顶部距离 顶部留白 */
  marginTop?: number;
  /** 折线区域底部起始高度 底部填充 */
  paddingBottom?: number;
  /** 用于控制区域背景色 支持渐变数组(固定从上往下) 和 颜色字符串 */
  isUp?: boolean;
}

const greenColor = 'var(--text-green)';
const redColor = 'var(--text-red)';
const blueColor = 'var(--text-blue)';
const redColor1 = 'var(--text-red)';
const greenBg = [
  { offset: '0%', color: greenColor, opacity: 0.5 },
  { offset: '90%', color: greenColor, opacity: 0 }
];

const redBg = [
  { offset: '0%', color: redColor, opacity: 0.5 },
  { offset: '90%', color: redColor, opacity: 0 }
]; //红色

const blueBg = [
  { offset: '0%', color: blueColor, opacity: 0.5 },
  { offset: '90%', color: blueColor, opacity: 0 }
]; //蓝色

const redBg1 = [
  { offset: '0%', color: redColor1, opacity: 0.5 },
  { offset: '90%', color: redColor1, opacity: 0 }
]; //红色


const colorMap = {
  'greenUpRedDown': {
    upColor: greenColor,
    downColor: redColor,
    upBackground: greenBg,
    downBackground: redBg,
  },
  'redUpGreenDown': {
    upColor: redColor,
    downColor: greenColor,
    upBackground: redBg,
    downBackground: greenBg,
  },
  'redUpBlueDown': {
    upColor: redColor1,
    downColor: blueColor,
    upBackground: redBg1,
    downBackground: blueBg
  }
}
export const TendChart = ({
  colorPreference = 'greenUpRedDown',
  chartDataList,
  width = 50,
  height = 20,
  strokeWidth = 1,
  marginTop = 4,
  paddingBottom = 4,
  isUp
}) => {
  const { upBackground, downBackground, upColor, downColor } = colorMap[colorPreference] || {};

  const strokeColor = isUp ? upColor : downColor;
  const background = isUp ? upBackground : downBackground;
  const toFixed = (num: number, count = 0) => +num.toFixed(count) || 0;
  const id = useId();
  const gradientId = `tend-chart-gradient-${id.replace(/:/g, '')}`;
  const finalPath = useMemo(() => {
    if (chartDataList?.length) {
      let stopDataList = [0, 0];
      const maxData = Math.max(...chartDataList) || 0;
      const minData = Math.min(...chartDataList) || 0;

      if (maxData !== minData) {
        const gap = maxData - minData;
        const maxStop = height - paddingBottom - marginTop;

        stopDataList = chartDataList.map((stop) =>
          toFixed(maxStop - ((stop - minData) / gap) * maxStop + marginTop, 2)
        ); //  stopDataList
      }
      const step = toFixed(width / (stopDataList.length - 1), 2);
      const pathStart = `M-1 ${height}L-1 ${stopDataList[0]}`;
      const pathEnd = `L${width + 1} ${height + 1} Z`;
      const pathArray = stopDataList.map(
        (n, index) => `L${toFixed(index * step, 2)} ${n}`
      );

      return `${pathStart}${pathArray.join('')}${pathEnd}`;
    }
    return '';
  }, [chartDataList, paddingBottom, marginTop]);

  return (
    <div>
      {chartDataList?.length ? (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width - strokeWidth} ${height - strokeWidth}`}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              {background.map((item, idx) => {
                return (
                  <stop
                    key={idx}
                    offset={item.offset}
                    stopColor={item.color}
                    stopOpacity={item.opacity}
                  />
                );
              })}
            </linearGradient>
          </defs>
          <path
            d={finalPath}
            fill={
              typeof background === 'string'
                ? background
                : `url(#${gradientId})`
            }
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      ) : null}
    </div>
  );
};


