import React, { useState } from 'react';
import { Table, Button, message, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import { basePath } from '@better-bit-fe/base-utils';
import ReferralShareModal from '~/components/PublicPart/ReferralShareModal';
import CustomParamsModal from '../CustomParamsModal';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getReferralInfo, addSpotGrid } from '~/api';
import styles from './index.module.less';

export interface HistoryStrategyData {
  id: string;
  symbol: string;
  profit: string;
  profitRate: string;
  maxDrawDown: string;
  investment: string;
  arbitrage: string;
  stopRange: string;
  latestPrice: string;
  startedAt?: string | number;
  stoppedAt?: string | number;
  status: {
    text: string;
    tone: 'success' | 'stopped' | 'terminated';
  };
  rawData?: any; // 保存原始数据用于复制参数
}

interface HistoryStrategyTableProps {
  dataSource: HistoryStrategyData[];
  onRestart?: (record: HistoryStrategyData) => void;
  onDetail?: (record: HistoryStrategyData) => void;
  onShare?: (record: HistoryStrategyData) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    onChange: (page: number, pageSize: number) => void;
  } | false;
}

export const HistoryStrategyTable: React.FC<HistoryStrategyTableProps> = ({
  dataSource,
  onRestart,
  onDetail,
  onShare,
  loading = false,
  pagination
}) => {
  const t = useFm();
  const router = useRouter();
  const { locale } = router;
  const { isLogin, userInfo } = useUserInfo();
  const [referralInfo, setReferralInfo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedStrategy, setSharedStrategy] = useState<HistoryStrategyData | null>(null);
  const [showCustomParamsModal, setShowCustomParamsModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<HistoryStrategyData | null>(null);
  const [copyingParams, setCopyingParams] = useState(false);
  const [savedDisplayData, setSavedDisplayData] = useState<any>(null); // 保存显示数据

  const fetchReferralInfo = async () => {
    const res = await getReferralInfo();
    setReferralInfo(res);
  };

  const openShareModal = async () => {
    await fetchReferralInfo();
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const handleShareClick = (record: HistoryStrategyData) => {
    setSharedStrategy(record);
    openShareModal();
    onShare?.(record);
  };

  const handleDetailClick = (record: HistoryStrategyData) => {
    const localePrefix = locale ? `/${locale}` : '';
    const detailPath = `${localePrefix}${basePath}/details/?id=${record.id}&tab=history&sub=1`;
    window.location.href = detailPath;
    onDetail?.(record);
  };

  const handleRestartClick = (record: HistoryStrategyData) => {
    setSelectedStrategy(record);
    const { spotGrid, strategyType, useCount } = record.rawData || {};
    const {
      baseToken,
      quoteToken,
      nowPrice,
      todayProfitRate,
      priceLower,
      priceUpper,
      gridCount,
      gridType
    } = spotGrid || {};
    // 保存显示数据
    setSavedDisplayData({
      pairName: spotGrid ? `${baseToken}/${quoteToken}` : undefined,
      pairTag: strategyType === 1 ? t('spot-grid') : t('spot-dca'),
      useCount,
      coinPrice: nowPrice
        ? `$${nowPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : undefined,
      priceChange: todayProfitRate !== undefined
        ? `${todayProfitRate >= 0 ? '+' : ''}${(todayProfitRate * 100).toFixed(2)}%`
        : undefined,
      priceLower: priceLower?.toString(),
      priceUpper: priceUpper?.toString(),
      gridCount: gridCount?.toString(),
      gridType: gridType === 1 ? 'arithmetic' : 'geometric'
    });
    setShowCustomParamsModal(true);
    onRestart?.(record);
  };

  const handleCustomParamsConfirm = async () => {
    if (!selectedStrategy || !selectedStrategy.rawData) return;

    setCopyingParams(true);
    try {
      const spotGrid = selectedStrategy.rawData.spotGrid;
      if (!spotGrid) {
        message.error(t('strategy-data-incomplete'));
        return;
      }

      const {
        baseToken,
        quoteToken,
        priceLower,
        priceUpper,
        gridType,
        gridCount,
        investAmount,
        stopTakeProfit,
        stopLoss,
        stopBreakUpper,
        stopBreakLower
      } = spotGrid;

      // 构建参数，和详情页的逻辑一致
      const params: any = {
        base_token: baseToken,
        quote_token: quoteToken,
        price_lower: priceLower,
        price_upper: priceUpper,
        grid_type: gridType,
        grid_count: gridCount,
        investment_amount: investAmount,
        create_from: 1, // 1=复制
        template_id: selectedStrategy.rawData.id
      };

      // 如果有止盈止损设置，也带上
      if (stopTakeProfit) {
        params.stop_take_profit = stopTakeProfit;
      }
      if (stopLoss) {
        params.stop_loss = stopLoss;
      }
      if (stopBreakUpper) {
        params.stop_break_upper = stopBreakUpper;
      }
      if (stopBreakLower) {
        params.stop_break_lower = stopBreakLower;
      }

      await addSpotGrid(params);

      message.success({
        content: t('params-copied-success'),
        duration: 3
      });

      setShowCustomParamsModal(false);
      setSelectedStrategy(null);

      // 刷新列表（如果父组件提供了刷新方法）
      onRestart?.(selectedStrategy);
    } catch (error) {
      console.error('复制参数运行策略失败:', error);
      message.error(t('params-copied-failed'));
    } finally {
      setCopyingParams(false);
    }
  };

  const handleCustomParamsClose = () => {
    setShowCustomParamsModal(false);
    setSelectedStrategy(null);
  };
  const columns = [
    {
      title: t('strategy-name'),
      dataIndex: 'symbol',
      width: 120,
      fixed: 'left' as const,
      render: (value: string) => <span className={styles.strategyName}>{value}</span>
    },
    {
      title: `${t('total-profit')}（USDT）`,
      dataIndex: 'profit',
      width: 160,
      render: (value: string) => {
        const isNegative = value.trim().startsWith('-');
        return (
          <span className={isNegative ? styles.profitRateNegative : styles.profitRate}>
            {value}
          </span>
        );
      }
    },
    {
      title: t('profit-rate'),
      dataIndex: 'profitRate',
      width: 100,
      render: (value: string) => {
        const isNegative = value.trim().startsWith('-');
        return (
          <span className={isNegative ? styles.profitRateNegative : styles.profitRate}>
            {value}
          </span>
        );
      }
    },
    {
      title: `${t('total-investment')}（USDT）`,
      dataIndex: 'investment',
      width: 160
    },
    {
      title: t('arbitrage-count'),
      dataIndex: 'arbitrage',
      width: 100
    },
    {
      title: `${t('price-range')}（USDT）`,
      dataIndex: 'stopRange',
      width: 200
    },
    {
      title: t('status'),
      dataIndex: 'status',
      width: 120,
      render: (value: { text: string; tone: 'success' | 'stopped' | 'terminated' }) => (
        <div className={styles.statusCell}>
          <span
            className={`${styles.statusDot} ${value.tone === 'success'
              ? styles.statusDotSuccess
              : value.tone === 'stopped'
                ? styles.statusDotStopped
                : styles.statusDotTerminated
              }`}
          />
          <span className={styles.statusText}>{value.text}</span>
        </div>
      )
    },
    {
      title: t('create-time'),
      dataIndex: 'startedAt',
      width: 180,
      render: (value: string | number) => {
        if (!value) return '--';
        if (typeof value === 'string') return value;
        return dayjs.unix(value).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: t('stop-time'),
      dataIndex: 'stoppedAt',
      width: 180,
      render: (value: string | number) => {
        if (!value) return '--';
        if (typeof value === 'string') return value;
        return dayjs.unix(value).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: t('actions'),
      dataIndex: 'actions',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: HistoryStrategyData) => (
        <div className={styles.actionButtons}>
          <Button size="small" className={styles.actionButton} onClick={() => handleRestartClick(record)}>
            {t('copy-params')}
          </Button>
          <Button size="small" className={styles.actionButton} onClick={() => handleDetailClick(record)}>
            {t('details')}
          </Button>
          <Button size="small" className={styles.actionButton} onClick={() => handleShareClick(record)}>
            {t('share')}
          </Button>
        </div>
      )
    }
  ];

  if (dataSource.length === 0) {
    return (
      <div className={styles.emptyState}>
        <img src={`${basePath}/images/empty.png`} alt="empty" className={styles.emptyImage} />
        <div className={styles.emptyText}>{t('no-data')}</div>
      </div>
    );
  }

  return (
    <>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorBgContainer: '#070808' } }}>
        <Table
          className={styles.historyStrategyTable}
          columns={columns}
          scroll={{ x: 'max-content' }}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          rowKey="id"
        />
      </ConfigProvider>
      <ReferralShareModal
        referralInfo={referralInfo}
        modalOpen={showShareModal}
        onClose={closeShareModal}
        strategyData={sharedStrategy}
        strategyTypeLabel={t('grid-trading-bot')}
        extraStatLabel={t('7D-drawdown')}
        extraStatValue={sharedStrategy?.maxDrawDown}
      />
      <CustomParamsModal
        open={showCustomParamsModal}
        onClose={handleCustomParamsClose}
        onConfirm={handleCustomParamsConfirm}
        title={t('copy-params')}
        type="copy-params"
        isCustomParams={false}
        strategyDetail={selectedStrategy?.rawData}
        displayData={savedDisplayData}
      />
    </>
  );
};
