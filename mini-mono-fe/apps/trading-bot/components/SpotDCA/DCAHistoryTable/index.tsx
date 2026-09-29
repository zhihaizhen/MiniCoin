import React, { useState } from 'react';
import { Table, Button, message, ConfigProvider, theme } from 'antd';
import EllipsisCell from '~/components/PublicPart/EllipsisCell';
import dayjs from 'dayjs';
import { basePath } from '@better-bit-fe/base-utils';
import ReferralShareModal from '~/components/PublicPart/ReferralShareModal';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { getReferralInfo } from '~/api';
import { formatStrategyRuntime } from '~/utils';
import styles from './index.module.less';

export interface DcaHistoryStrategyData {
  id: string;
  strategyName: string;
  pnl: string;
  profitRate: string;
  totalMargin: string;
  coinConfig: string;
  investPerTime: string;
  status: {
    text: string;
    tone: 'terminated';
  };
  createdAt: string;
  stoppedAt: string;
  rawData?: any;
}

interface DcaHistoryTableProps {
  dataSource: DcaHistoryStrategyData[];
  onRestart?: (record: DcaHistoryStrategyData) => void;
  onDetail?: (record: DcaHistoryStrategyData) => void;
  onShare?: (record: DcaHistoryStrategyData) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    onChange: (page: number, pageSize: number) => void;
  } | false;
}

export const DCAHistoryTable: React.FC<DcaHistoryTableProps> = ({
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
  const [referralInfo, setReferralInfo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedStrategy, setSharedStrategy] = useState<any>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchReferralInfo = async () => {
    const res = await getReferralInfo();
    setReferralInfo(res);
  };

  const handleShareClick = (record: DcaHistoryStrategyData) => {
    const raw = record.rawData || {};
    const apyValue = Number(raw.apy || 0);
    const apyText = `${apyValue >= 0 ? '+' : ''}${(apyValue * 100).toFixed(2)}%`;
    const runningTime = formatStrategyRuntime(raw.strategyInterval);
    setSharedStrategy({
      symbol: record.coinConfig || '',
      profitRate: record.profitRate || '0%',
      apy: apyText,
      runningTime,
      status: record.status
    });
    fetchReferralInfo().then(() => setShowShareModal(true));
    onShare?.(record);
  };

  const handleDetailClick = (record: DcaHistoryStrategyData) => {
    const localePrefix = locale ? `/${locale}` : '';
    const detailPath = `${localePrefix}${basePath}/details/?id=${record.id}&type=dca&tab=history&sub=2`;
    window.location.href = detailPath;
    onDetail?.(record);
  };

  const handleRestartClick = (record: DcaHistoryStrategyData) => {
    onRestart?.(record);
  };

  const getProfitClass = (value: string) => {
    const n = parseFloat(value);
    if (isNaN(n) || n === 0) return styles.profitRateZero;
    return n > 0 ? styles.profitRate : styles.profitRateNegative;
  };

  const columns = [
    {
      title: t('strategy-name'),
      dataIndex: 'strategyName',
      width: 140,
      fixed: 'left' as const,
      ellipsis: true,
      render: (value: string) => <EllipsisCell text={value} />
    },
    {
      title: `${t('total-profit')}（USDT）`,
      dataIndex: 'pnl',
      width: 140,
      render: (value: string) => (
        <span className={getProfitClass(value)}>{value ?? '--'}</span>
      )
    },
    {
      title: t('profit-rate'),
      dataIndex: 'profitRate',
      width: 100,
      render: (value: string) => (
        <span className={getProfitClass(value)}>{value}</span>
      )
    },
    {
      title: `${t('total-investment')}（USDT）`,
      dataIndex: 'totalMargin',
      width: 140
    },
    {
      title: t('coin-config'),
      dataIndex: 'coinConfig',
      width: 180,
      ellipsis: true,
      render: (text: string) => <EllipsisCell text={text} />
    },
    {
      title: t('invest-per-time'),
      dataIndex: 'investPerTime',
      width: 180,
      ellipsis: true
    },
    {
      title: t('status'),
      dataIndex: 'status',
      width: 100,
      render: (value: { text: string; tone: 'terminated' }) => (
        <div className={styles.statusCell}>
          <span className={`${styles.statusDot} ${styles.statusDotTerminated}`} />
          <span className={styles.statusText}>{value.text}</span>
        </div>
      )
    },
    {
      title: t('create-time'),
      dataIndex: 'createdAt',
      width: 160,
      render: (value: string) => {
        if (!value) return '--';
        const d = dayjs(`${value}Z`);
        return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : '--';
      }
    },
    {
      title: t('stop-time'),
      dataIndex: 'stoppedAt',
      width: 160,
      render: (value: string) => {
        if (!value) return '--';
        const d = dayjs(`${value}Z`);
        return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : '--';
      }
    },
    {
      title: t('actions'),
      dataIndex: 'actions',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: DcaHistoryStrategyData) => (
        <div className={styles.actionButtons}>
          <Button size="small" className={styles.actionButton} onClick={() => handleRestartClick(record)}>
            {t('rerun')}
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
      {contextHolder}
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorBgContainer: '#070808' } }}>
        <Table
          className={styles.historyStrategyTable}
          columns={columns}
          tableLayout="fixed"
          scroll={{ x: 1520 }}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          rowKey="id"
        />
      </ConfigProvider>
      <ReferralShareModal
        referralInfo={referralInfo}
        modalOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        strategyData={sharedStrategy}
        strategyTypeLabel={t('spot-dca')}
        extraStatLabel={t('annualized-return')}
        extraStatValue={sharedStrategy?.apy}
      />
    </>
  );
};
