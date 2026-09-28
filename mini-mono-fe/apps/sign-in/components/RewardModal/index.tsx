import React, { useMemo } from 'react';
import { Modal } from 'antd';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';
import { useCampaign } from '~/context';
interface RewardModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onShare?: () => void;
  rewardAmount?: string;
  loading?: boolean;
  success?: boolean; // 是否领取成功
}

const RewardModal: React.FC<RewardModalProps> = ({
  open,
  onClose,
  onConfirm,
  onShare,
  rewardAmount = '--',
  loading = false,
  success = false
}) => {
  const t = useFm();
  const { campaignDetail, publicCampaignDetail } = useCampaign();

  // 跳转到资产历史页面
  const handleViewAssets = () => {
    goPage('tradeHistory');
    onClose?.();
  };

  // 获取活动总天数
  const totalDays = useMemo(() => {
    const detail = campaignDetail || publicCampaignDetail;
    if (detail?.max_day) {
      return detail.max_day;
    }
    if (detail?.task_items && detail.task_items.length > 0) {
      return String(detail.task_items.length);
    }
    return '7';
  }, [campaignDetail, publicCampaignDetail]);

  return (
    <Modal
      open={open}
      centered
      closable={false}
      footer={null}
      width={400}
      className={styles.rewardModal}
      maskClosable={false}
      onCancel={onClose}
      keyboard
    >
      <div className={styles.modalContent}>
        {/* 关闭按钮 */}
        <button className={styles.closeButton} onClick={onClose} disabled={loading}>
          <img src={`${basePath}/icons/close.svg`} alt="Close" />
        </button>

        {/* 顶部标题 */}
        <div className={styles.header}>
          <span className={styles.partyIcon}>🎉</span>
          <span className={styles.title}>
            {success ? t('reward-modal-success-title') : t('reward-modal-title', { days: totalDays })}
          </span>
        </div>

        {/* 奖励展示区 */}
        <div className={styles.rewardDisplay}>
          <div className={styles.coinIcon}>
            <img src={`${basePath}/images/usdt.png`} alt="usdt" />
          </div>
          <div className={styles.rewardAmount}>
            <div className={styles.amountText}>
              {rewardAmount} <span className={styles.unit}>USDT</span>
            </div>
          </div>
        </div>

        {/* 按钮区域 */}
        {success ? (
          // 领取成功后：显示分享和查看两个按钮
          <div className={styles.buttonGroup}>
            <button
              className={styles.shareButton}
              onClick={() => {
                onClose?.(); // 先关闭当前弹窗
                onShare?.(); // 再打开分享弹窗
              }}
            >
              {t('reward-modal-share-button')}
            </button>
            <button className={styles.viewButton} onClick={handleViewAssets}>
              {t('reward-modal-view-button')}
            </button>
          </div>
        ) : (
          // 领取前：显示立即领取按钮
          <button
            className={styles.confirmButton}
            onClick={onConfirm || onClose}
            disabled={loading}
          >
            {loading ? t('reward-modal-claiming-button') : t('reward-modal-confirm-button')}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default RewardModal;
