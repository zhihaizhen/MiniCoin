import React, { useEffect } from 'react';
import { Modal } from 'antd';
import { isMobile, basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useAwardRecords } from '~/hooks/apiHooks';
import { useCampaign } from '~/context';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import styles from './index.module.less';

// 奖励类型映射
const REWARD_TYPE_MAP: Record<string, { icon: string; nameKey: string }> = {
  'PreGivenCash': { icon: 'gift-icon-experience.png', nameKey: 'reward-type-experience-cash' },
  'PostGivenCash': { icon: 'gift-icon-experience.png', nameKey: 'reward-type-experience-cash' },
  'ServiceCash': { icon: 'gift-icon-fee.png', nameKey: 'reward-type-service-cash' },
  'PhysicalAward': { icon: 'gift-icon-physical-award.png', nameKey: 'reward-type-physical-award' },
  'RealCash': { icon: 'gift-icon-cash.png', nameKey: 'reward-type-real-cash' }
};

interface AwardModalProps {
  visible: boolean;
  onClose: () => void;
}

const AwardListModal: React.FC<AwardModalProps> = ({
  visible,
  onClose
}) => {
  const isMb = isMobile();
  const t = useFm();
  const { campaignNo } = useCampaign();

  // 使用 useAwardRecords hook
  const { data: awardRecords, loading, run } = useAwardRecords();

  // 当弹窗打开且有 campaign_no 时，获取奖励记录
  useEffect(() => {
    if (visible && campaignNo) {
      run({
        page_num: 1,
        page_size: 30,
        campaign_no: campaignNo
      });
    }
  }, [visible, campaignNo, run]);

  // 使用真实数据
  const displayAwards = awardRecords || [];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMb ? 343 : 480}
      centered
      className={`${styles.modal} ${isMb ? styles.mobileModal : ''}`}
      styles={{
        content: {
          backgroundColor: 'var(--fill-fill-modal, #1D1D1D)',
          padding: '24px',
          borderRadius: '12px',
          overflow: 'hidden'
        },
        mask: {
          background: 'rgba(0, 0, 0, 0.80)'
        }
      }}
    >
      <div className={styles.modalContent}>
        {/* 标题栏 */}
        <div className={styles.header}>
          <h3 className={styles.title}>{t('award-modal-title')}</h3>
        </div>

        {/* 内容区域 */}
        <div className={styles.content}>
          {/* 表头 */}
          <div className={styles.tableHeader}>
            <div className={styles.headerLabel}>{t('award-table-header-prize')}</div>
            <div className={styles.headerLabel}>{t('award-table-header-amount')}</div>
          </div>

          {/* 分割线 */}
          <div className={styles.divider}></div>

          {/* 奖励列表 */}
          <div className={styles.listContainer}>
            {loading ? (
              <LoadingSpinner />
            ) : displayAwards.length > 0 ? (
              <div className={styles.list}>
                {displayAwards.map((award) => {
                  const rewardType = REWARD_TYPE_MAP[award.reward_type || ''];
                  return (
                    <div key={award.id} className={styles.listItem}>
                      <div className={styles.itemLeft}>
                        <div className={styles.iconWrapper}>
                          <img
                            src={`${basePath}/images/${rewardType.icon}`}
                            alt={t(rewardType.nameKey)}
                            className={styles.icon}
                          />
                        </div>
                        <span className={styles.itemName}>{t(rewardType.nameKey)}</span>
                      </div>
                      <div className={styles.itemAmount}>
                        {award.reward_amount || '0'} USDT
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <button className={styles.confirmButton} onClick={onClose}>
          {t('award-modal-confirm-button')}
        </button>
      </div>
    </Modal>
  );
};

export default AwardListModal;
