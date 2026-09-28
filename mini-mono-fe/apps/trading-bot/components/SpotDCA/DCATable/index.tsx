import React, { useState } from 'react';
import { ReactComponent as MoreIcon } from '~/public/icons/more.svg';
import EllipsisCell from '~/components/PublicPart/EllipsisCell';
import dayjs from 'dayjs';
import { Table, Popover, ConfigProvider, Tooltip, theme } from 'antd';
import { basePath } from '@better-bit-fe/base-utils';
import styles from './index.module.less';
import ReferralShareModal from '~/components/PublicPart/ReferralShareModal';
import { StopConfirmModal } from '../StopConfirmModal';
import { DcaConfirmModal } from '../DcaConfirmModal';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { getReferralInfo } from '~/api';
import { formatStrategyRuntime } from '~/utils';

export interface DcaStrategyData {
  id: string;
  strategyName: string;
  pnl: string;
  profitRate: string;
  totalMargin: string;
  coinConfig: string;
  investPerTime: string;
  status: {
    text: string;
    tone: 'active' | 'paused';
  };
  nextInvestTime: string;
  rawData?: any;
}

interface DcaStrategyTableProps {
  dataSource: DcaStrategyData[];
  onTerminate?: (record: DcaStrategyData) => void;
  onPause?: (record: DcaStrategyData) => void;
  onRename?: (record: DcaStrategyData) => void;
  onDetail?: (record: DcaStrategyData) => void;
  onShare?: (record: DcaStrategyData) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    onChange: (page: number, pageSize: number) => void;
  } | false;
}

export const DCATable: React.FC<DcaStrategyTableProps> = ({
  dataSource,
  onTerminate,
  onPause,
  onRename,
  onDetail,
  onShare,
  loading = false,
  pagination
}) => {
  const [sharedStrategy, setSharedStrategy] = useState<any>(null);
  const [referralInfo, setReferralInfo] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const t = useFm();
  const router = useRouter();
  const { locale } = router;

  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [stopStrategyId, setStopStrategyId] = useState('');
  const [stopRecord, setStopRecord] = useState<DcaStrategyData | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'pause' | 'resume'>('pause');
  const [confirmStrategyId, setConfirmStrategyId] = useState('');
  const [confirmRecord, setConfirmRecord] = useState<DcaStrategyData | null>(null);

  const fetchReferralInfo = async () => {
    const res = await getReferralInfo();
    setReferralInfo(res);
  };

  const handleShareClick = (record: DcaStrategyData) => {
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
    setPopoverOpen(null);
    fetchReferralInfo().then(() => setShowShareModal(true));
    onShare?.(record);
  };

  const handleDetailClick = (record: DcaStrategyData) => {
    const localePrefix = locale ? `/${locale}` : '';
    const detailPath = `${localePrefix}${basePath}/details/?id=${record.id}&type=dca&tab=running&sub=2`;
    window.location.href = detailPath;
    onDetail?.(record);
  };

  const handleTerminateClick = (record: DcaStrategyData) => {
    setStopStrategyId(record.id);
    setStopRecord(record);
    setStopModalOpen(true);
  };

  const handleStopConfirm = () => {
    setStopModalOpen(false);
    if (stopRecord) onTerminate?.(stopRecord);
  };

  const handlePauseResumeClick = (record: DcaStrategyData) => {
    setPopoverOpen(null);
    setConfirmStrategyId(record.id);
    setConfirmRecord(record);
    setConfirmMode(record.status.tone === 'paused' ? 'resume' : 'pause');
    setConfirmModalOpen(true);
  };

  const handleConfirmModalConfirm = () => {
    setConfirmModalOpen(false);
    if (confirmRecord) onPause?.(confirmRecord);
  };

  const handleRenameClick = (record: DcaStrategyData) => {
    setPopoverOpen(null);
    onRename?.(record);
  };

  const renderPopoverContent = (record: DcaStrategyData) => (
    <div className={styles.popoverMenu}>
      <div className={styles.popoverMenuItem} onClick={() => handleRenameClick(record)}>
        {t('rename-strategy')}
      </div>
      <div className={styles.popoverMenuItem} onClick={() => handlePauseResumeClick(record)}>
        {record.status.tone === 'paused' ? t('resume') : t('pause')}
      </div>
      <div className={styles.popoverMenuItem} onClick={() => handleShareClick(record)}>
        {t('share')}
      </div>
    </div>
  );

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
      width: 200,
      render: (value: { text: string; tone: 'active' | 'paused' }) => (
        <div className={styles.statusCell}>
          <span
            className={`${styles.statusDot} ${value.tone === 'active' ? styles.statusDotActive : styles.statusDotPaused}`}
          />
          <span className={styles.statusText}>{value.text}</span>
        </div>
      )
    },
    {
      title: t('next-invest-time'),
      dataIndex: 'nextInvestTime',
      width: 160,
      render: (val: string, record: DcaStrategyData) => {
        if (record.status.tone === 'paused') return '--';
        if (!val) return '--';
        const d = dayjs(`${val}Z`);
        return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : '--';
      }
    },
    {
      title: t('actions'),
      dataIndex: 'actions',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: DcaStrategyData) => (
        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={() => handleTerminateClick(record)}>
            {t('stop')}
          </button>
          <button className={styles.actionButton} onClick={() => handleDetailClick(record)}>
            {t('details')}
          </button>
          <Popover
            content={renderPopoverContent(record)}
            trigger="click"
            placement="bottomRight"
            open={popoverOpen === record.id}
            onOpenChange={(open) => setPopoverOpen(open ? record.id : null)}
            overlayClassName={styles.actionPopover}
          >
            <button className={styles.actionButton}><MoreIcon /></button>
          </Popover>
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
          className={styles.strategyTable}
          columns={columns}
          dataSource={dataSource}
          tableLayout="fixed"
          scroll={{ x: 1460 }}
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
      <StopConfirmModal
        visible={stopModalOpen}
        strategyId={stopStrategyId}
        onConfirm={handleStopConfirm}
        onCancel={() => setStopModalOpen(false)}
      />
      <DcaConfirmModal
        visible={confirmModalOpen}
        strategyId={confirmStrategyId}
        mode={confirmMode}
        onConfirm={handleConfirmModalConfirm}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </>
  );
};
