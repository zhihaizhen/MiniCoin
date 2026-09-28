import React, { useState } from 'react';
import { Table, Button, ConfigProvider, theme } from 'antd';
import { basePath } from '@better-bit-fe/base-utils';
import { StopConfirmModal } from '../StopConfirmModal';
import styles from './index.module.less';
import ReferralShareModal from '~/components/PublicPart/ReferralShareModal';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getReferralInfo } from '~/api';

export interface StrategyData {
  id: string;
  symbol: string;
  profit: string;
  profitRate: string;
  investment: string;
  arbitrage: string;
  stopRange: string;
  latestPrice: string;
  startedAt?: number;
  maxDrawDown: string;
  status: {
    text: string;
    tone: 'active' | 'idle';
  };
  spotGrid?: {
    baseToken: string;
    quoteToken: string;
    baseTokenTotal: number;
    quoteTokenTotal: number;
  };
}

interface StrategyTableProps {
  dataSource: StrategyData[];
  onStop?: (record: StrategyData) => void;
  onDetail?: (record: StrategyData) => void;
  onShare?: (record: StrategyData) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    onChange: (page: number, pageSize: number) => void;
  } | false;
}

export const StrategyTable: React.FC<StrategyTableProps> = ({
  dataSource,
  onStop,
  onDetail,
  onShare,
  loading = false,
  pagination
}) => {
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyData | null>(null);
  const [sharedStrategy, setSharedStrategy] = useState<StrategyData | null>(null);
  const t = useFm();
  const router = useRouter();
  const { locale } = router;
  const { isLogin, userInfo } = useUserInfo();
  const [referralInfo, setReferralInfo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchReferralInfo = async () => {
    const res = await getReferralInfo();
    setReferralInfo(res);
  }

  const openShareModal = async () => {
    await fetchReferralInfo();
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const handleShareClick = (record: StrategyData) => {
    setSharedStrategy(record);
    openShareModal();
    onShare?.(record);
  };

  const handleDetailClick = (record: StrategyData) => {
    const localePrefix = locale ? `/${locale}` : '';
    const detailPath = `${localePrefix}${basePath}/details/?id=${record.id}&tab=running&sub=1`;
    window.location.href = detailPath;
    onDetail?.(record);
  };

  const handleStopClick = (record: StrategyData) => {
    setSelectedStrategy(record);
    setStopModalVisible(true);
  };

  const handleStopConfirm = () => {
    if (selectedStrategy) {
      onStop?.(selectedStrategy);
      setStopModalVisible(false);
      setSelectedStrategy(null);
    }
  };

  const handleStopCancel = () => {
    setStopModalVisible(false);
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
      title: t('latest-price'),
      dataIndex: 'latestPrice',
      width: 120
    },
    {
      title: t('status'),
      dataIndex: 'status',
      width: 200,
      render: (value: { text: string; tone: 'active' | 'idle' }) => (
        <div className={styles.statusCell}>
          <span
            className={`${styles.statusDot} ${value.tone === 'active' ? styles.statusDotActive : styles.statusDotIdle}`}
          />
          <span className={styles.statusText}>{value.text}</span>
        </div>
      )
    },
    {
      title: t('actions'),
      dataIndex: 'actions',
      width: 170,
      fixed: 'right' as const,
      render: (_: any, record: StrategyData) => (
        <div className={styles.actionButtons}>
          <Button size="small" className={styles.actionButton} onClick={() => handleStopClick(record)}>
            {t('stop')}
          </Button>
          <Button size="small" className={styles.actionButton} onClick={() => handleDetailClick(record)}>
            {t('details')}
          </Button>
          <Button size="small" className={styles.actionButton} onClick={() => handleShareClick(record)}>
            {t('share')}
          </Button>
        </div>
      ),
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
          className={styles.strategyTable}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: 'max-content' }}
          pagination={pagination}
          loading={loading}
          rowKey="id"
        />
      </ConfigProvider>
      <StopConfirmModal
        visible={stopModalVisible}
        strategyName={selectedStrategy?.symbol || ''}
        runningTime={selectedStrategy?.status.text.replace(t('running') + ' ', '') || ''}
        strategyId={selectedStrategy?.id || ''}
        spotGrid={selectedStrategy?.spotGrid}
        onConfirm={handleStopConfirm}
        onCancel={handleStopCancel}
      />
      <ReferralShareModal
        referralInfo={referralInfo}
        modalOpen={showShareModal}
        onClose={closeShareModal}
        strategyData={sharedStrategy}
        strategyTypeLabel={t('grid-trading-bot')}
        extraStatLabel={t('7D-drawdown')}
        extraStatValue={sharedStrategy?.maxDrawDown}
      />
    </>
  );
};
