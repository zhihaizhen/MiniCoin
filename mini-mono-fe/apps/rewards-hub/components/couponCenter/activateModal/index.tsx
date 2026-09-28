import React from 'react';
import { Modal, Spin } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as IconClose } from '~/public/images/coupon/close.svg';
import styles from './index.module.less';

interface ActivateModalProps {
  open: boolean;
  couponType: string;
  rawCouponType: string;
  minTokenLimit?: number;
  token?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// 是否是体验券
const isExperienceCoupon = (rawCouponType: string) =>
  rawCouponType === 'PostGivenCash' || rawCouponType === 'PreGivenCash';

const ActivateModal = ({ open, couponType, rawCouponType, minTokenLimit, token, loading = false, onCancel, onConfirm }: ActivateModalProps) => {
  const t = useFm();
  const isExperience = isExperienceCoupon(rawCouponType);

  const title = isExperience
    ? t('activateModalTitleExperience', { couponType })
    : t('activateModalTitleDeduct', { couponType });

  const desc = isExperience
    ? t('activateModalDescExperience', { minTokenLimit: minTokenLimit ?? '', token: token ?? '' })
    : t('activateModalDescDeduct');

  const warning = isExperience
    ? t('activateModalWarningExperience')
    : t('activateModalWarningDeduct');

  return (
    <Modal
      open={open}
      centered
      footer={null}
      closeIcon={null}
      onCancel={onCancel}
      width={440}
      className={styles.modalWrap}
      maskClosable={false}
    >
      <div className={styles.modal}>
        <div className={styles.head}>
          <span className={styles.title}>{title}</span>
          <button className={styles.closeBtn} onClick={onCancel}>
            <IconClose />
          </button>
        </div>
        <div className={styles.body}>
          <p className={styles.desc}>{desc}</p>
          <p className={styles.warning}>{warning}</p>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {t('cancel')}
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? <Spin size="small" /> : t('activateNow')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivateModal;
