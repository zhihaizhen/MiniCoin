import React from 'react';
import { Modal } from 'antd';
import { isMobile } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserCashbackRecord } from '~/hooks/useUserCashbackRecord';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import RecordItem from './RecordItem';
import styles from './index.module.less';

// 返现记录数据类型
export interface CashbackRecord {
  id: string;
  amount: string;
  currency: string;
  time: string;
}

interface CashbackRecordModalProps {
  visible: boolean;
  onClose: () => void;
}

const CashbackRecordModal: React.FC<CashbackRecordModalProps> = ({
  visible,
  onClose
}) => {
  const isMb = isMobile();
  const t = useFm();
  const { userCashbackRecord, loading } = useUserCashbackRecord();

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMb ? 343 : 440}
      centered
      className={`${styles.modal} ${isMb ? styles.mobileModal : ''}`}
      styles={{
        content: {
          backgroundColor: 'var(--fill-fill-modal, #1D1D1D)',
          padding: 0,
          borderRadius: '12px',
          overflow: 'hidden',
          ...(isMb && { width: '343px' })
        },
        mask: {
          background: 'var(--fill-fill-mask, rgba(0, 0, 0, 0.80))'
        }
      }}
    >
      {/* PC端和H5通用布局 */}
      <div className="flex flex-col">
        {/* 标题栏 */}
        <div className={`${isMb ? 'px-4 py-6' : 'px-6 py-6'} flex items-center justify-between`}>
          <h3 className="text-base font-semibold text-white">
            {t('cashback-record-title')}
          </h3>
          <div className="w-5 h-5"></div>
        </div>

        {/* 表头 */}
        <div className={`${isMb ? 'px-4 pb-3' : 'px-6 pb-3'} flex items-center justify-between text-xs text-[#9CA3AF]`}>
          <div className="flex-1">{t('cashback-record-time')}</div>
          <div className="text-right">{t('cashback-record-amount')} (USDT)</div>
        </div>

        {/* 分割线 */}
        <div className={`border-b ${isMb ? 'mx-4' : 'mx-6'}`} style={{ borderColor: 'var(--line-divider-primary, var(--line-border-default))' }}></div>

        {/* 记录列表 */}
        <div className={`${isMb ? 'px-4 pb-6' : 'px-6 pb-6'} max-h-[400px] overflow-y-auto ${styles.scrollContainer}`}>
          {loading ? (
            <LoadingSpinner />
          ) : userCashbackRecord.length > 0 ? (
            <div className="space-y-0">
              {userCashbackRecord.map((record, index) => (
                <RecordItem
                  key={record.id}
                  record={record}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CashbackRecordModal;
