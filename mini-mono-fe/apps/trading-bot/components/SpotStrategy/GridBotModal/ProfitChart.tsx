import React, { useMemo } from 'react';
// @ts-ignore
import { Line } from '@ant-design/charts';
import dayjs from 'dayjs';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface ProfitChartProps {
  chartData?: number[] | string;
  currentRate?: number;
}

// @ts-ignore
const ProfitChart: React.FC<ProfitChartProps> = ({ chartData = [] }) => {
  const t = useFm();

  const data = useMemo(() => {
    const source: number[] = Array.isArray(chartData)
      ? chartData
      : String(chartData || '')
        .split(',')
        .map(item => Number(item.trim()))
        .filter(item => !Number.isNaN(item));

    return source.map((value, index) => {
      const daysAgo = source.length - 1 - index;
      return {
        index,
        fullDate: dayjs().subtract(daysAgo, 'day').startOf('day').format('YYYY-MM-DD'),
        date: dayjs().subtract(daysAgo, 'day').format('MM/DD'),
        value: (value - 1) * 100
      };
    });
  }, [chartData]);

  const yMin = data.length ? Math.min(...data.map(item => item.value)) : 0;
  const yMax = data.length ? Math.max(...data.map(item => item.value)) : 0;
  const ySpan = Math.max(yMax - yMin, 0.01);
  const yPadding = ySpan * 0.03;
  const yDomainMin = yMin - yPadding;
  const yDomainMax = yMax + yPadding;

  // @ts-ignore
  const config = useMemo(() => {
    const returnRateLabel = t('return-rate');

    return {
      data,
      xField: 'index',
      yField: 'value',
      smooth: true,
      animation: false,
      color: '#abe127',
      point: false,
      style: {
        stroke: '#abe127',
        lineWidth: 2
      },
      padding: 'auto' as const,
      paddingRight: 12,
      scale: {
        x: {
          nice: false
        },
        y: {
          domain: [yDomainMin, yDomainMax],
          tickCount: 3,
          nice: false
        }
      },
      axis: {
        x: {
          title: false,
          tickCount: 5,
          labelAutoRotate: false,
          labelAutoHide: false,
          labelFill: '#FFFFFF',
          labelFontSize: 12,
          line: true,
          lineStroke: '#FFFFFF',
          tick: true,
          tickStroke: '#FFFFFF',
          grid: false,
          labelFormatter: (v: string) => {
            if (!data.length) return '';
            const raw = Number(v);
            if (Number.isNaN(raw)) return '';
            const maxIndex = data.length - 1;
            const idx = Math.round(Math.min(maxIndex, Math.max(0, raw)));
            return data[idx]?.date || '';
          }
        },
        y: {
          title: true,
          titleText: t('return-rate'),
          titlePosition: 'left' as const,
          titleSpacing: 6,
          titleFill: '#FFFFFF',
          titleFontSize: 12,
          labelFill: '#FFFFFF',
          labelFontSize: 12,
          line: true,
          lineStroke: '#FFFFFF',
          tick: true,
          tickStroke: '#FFFFFF',
          grid: true,
          gridStroke: '#2B2E33',
          gridLineDash: [4, 4],
          labelFormatter: (v: string) => `${Number(v).toFixed(2)}%`
        }
      },
      tooltip: {
        title: false,
        items: [
          (datum: any) => ({
            name: returnRateLabel,
            value: datum.value,
            fullDate: datum.fullDate
          })
        ]
      },
      interaction: {
        tooltip: {
          render: (_: any, { items }: any) => {
            const item = items?.[0] || {};
            const value = Number(item.value) || 0;
            const fullDate = item.fullDate || '--';
            const valueColor = value >= 0 ? '#abe127' : '#ff4d4f';
            return `<div>
            <div style="margin-bottom:4px;">${fullDate}</div>
            <div>${returnRateLabel}: <span style="color:${valueColor};font-weight:500;">${value >= 0 ? '+' : ''}${value.toFixed(2)}%</span></div>
          </div>`;
          },
          css: {
            '.g2-tooltip': {
              background: '#28292A',
              'border-radius': '8px',
              padding: '8px 12px',
              'box-shadow': '0 2px 8px rgba(0,0,0,0.15)',
              color: '#f5f5f5',
              'font-size': '12px',
              'line-height': '18px'
            }
          }
        }
      },
      legend: false
    };
  }, [data, yDomainMin, yDomainMax, t]);

  return (
    <div className={styles.chartCard}>
      {data.length > 0 ? (
        <div className={styles.chartArea}>
          <div className={styles.chartPlot}>
            <div className={styles.chartTitle}>{t('return-rate')}</div>
            <Line {...config} />
          </div>
        </div>
      ) : (
        <div className={styles.emptyChart}>{t('no-data')}</div>
      )}
    </div>
  );
};

export default React.memo(ProfitChart);
