import React, { useMemo } from 'react';
import { Line } from '@ant-design/charts';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';
import dayjs from 'dayjs';

interface ChartData {
  originTime: number;
  time: string;
  profit: number;
  rate: number;
}

interface ProfitChartProps {
  data?: ChartData[];
}

const ProfitChartComponent: React.FC<ProfitChartProps> = ({ data }) => {
  const t = useFm();
  // 默认数据
  const chartData = data || [];

  const config = useMemo(() => {
    return {
      data: chartData,
      xField: 'time',
      yField: 'profit',
      smooth: true,
      animation: false,
      color: '#abe127',
      point: false,
      style: {
        stroke: '#abe127',
        lineWidth: 2
      },
      padding: 'auto' as const,
      paddingRight: 24,
      axis: {
        x: {
          title: false,
          labelAutoRotate: false,
          labelAutoHide: false,
          labelFill: '#FFFFFF',
          labelFontSize: 12,
          line: true,
          lineStroke: '#FFFFFF',
          tick: true,
          tickStroke: '#FFFFFF',
          grid: false
        },
        y: {
          title: false,
          labelFill: '#FFFFFF',
          labelFontSize: 12,
          line: true,
          lineStroke: '#FFFFFF',
          tick: true,
          tickStroke: '#FFFFFF',
          grid: true,
          gridStroke: '#2B2E33',
          gridLineDash: [4, 4],
          labelFormatter: (value: string) => Number(value).toFixed(2)
        }
      },
      interaction: {
        tooltip: {
          render: (e: any, { title, items }: any) => {
            const dataItem = chartData.find(d => d.time === title);
            if (!dataItem) return '';

            return `
              <div class="${styles.customTooltip}">
                <div class="${styles.tooltipTime}">${dayjs(dataItem.originTime * 1000).format('MM/DD HH:mm:ss')}</div>
                <div class="${styles.tooltipRow}">
                  <span class="${styles.tooltipLabel}">${t('profit')}:</span>
                  <span class="${styles.tooltipValue} ${styles.tooltipValueProfit}">${dataItem.profit} USDT</span>
                </div>
                <div class="${styles.tooltipRow}">
                  <span class="${styles.tooltipLabel}">${t('profit-rate')}:</span>
                  <span class="${styles.tooltipValue}">${dataItem.rate} %</span>
                </div>
              </div>
            `;
          },
          css: {
            '.g2-tooltip': {
              background: '#28292a',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              boxShadow: 'none',
              minWidth: '180px',
              whiteSpace: 'nowrap'
            },
            '.g2-tooltip-title': {
              display: 'none'
            },
            '.g2-tooltip-list': {
              margin: 0,
              padding: 0
            },
            '.g2-tooltip-list-item': {
              display: 'none'
            }
          }
        }
      },
      theme: {
        background: 'transparent'
      }
    };
  }, [chartData, t]);

  return (
    <div className={styles.chartContainer}>
      <Line {...config} />
    </div>
  );
};

export const ProfitChart = React.memo(ProfitChartComponent);
