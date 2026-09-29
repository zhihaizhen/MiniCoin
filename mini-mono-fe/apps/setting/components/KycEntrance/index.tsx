import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';
import { ReactComponent as KycAdvancedIconSvg } from '~/public/images/kyc/kyc-advanced-icon.svg';
import { ReactComponent as VerifiedCheckIconSvg } from '~/public/images/kyc/verified-check.svg';
import { ReactComponent as LockIconSvg } from '~/public/images/kyc/lock.svg';
import { Alert } from 'antd';
import type { KycStatus } from '~/types';

interface KycEntranceProps {
  onStartBasicKyc: () => void;
  onStartAdvancedKyc: () => void;
  basicKycStatus?: KycStatus;
  advancedKycStatus?: KycStatus;
  isAdvancedClickable?: boolean; // 高级认证是否可点击
  showRejectionAlert?: boolean; // 是否显示拒绝提示
  rejectionAlertMessage?: string; // 拒绝提示文案
}

const KycEntrance: React.FC<KycEntranceProps> = ({
  onStartBasicKyc,
  onStartAdvancedKyc,
  basicKycStatus = 'unknown',
  advancedKycStatus = 'unknown',
  isAdvancedClickable = false,
  showRejectionAlert = false,
  rejectionAlertMessage = ''
}) => {
  const t = useFm();

  // 判断是否为成功状态
  const isSuccessStatus = (status: KycStatus) => status === 'passed';

  // 判断是否为已认证状态(成功或审核中)
  const isVerifiedStatus = (status: KycStatus) =>
    isSuccessStatus(status) || status === 'pending';

  const isBasicKycVerified = isVerifiedStatus(basicKycStatus);
  const isAdvancedKycVerified = isVerifiedStatus(advancedKycStatus);
  const isBasicKycSuccess = isSuccessStatus(basicKycStatus);
  const isBasicKycRejected = basicKycStatus === 'rejected';
  const isAdvancedKycRejected = advancedKycStatus === 'rejected';

  // 获取基础认证按钮文案
  const getBasicButtonText = () => {
    if (isBasicKycVerified) return t('setting.verified');
    if (isBasicKycRejected) return t('setting.reVerify');
    return t('setting.toVerify');
  };

  // 获取高级认证按钮文案
  const getAdvancedButtonText = () => {
    if (isAdvancedKycVerified) return t('setting.verified');
    if (!isAdvancedClickable) return t('setting.completeBasicFirst');
    if (isAdvancedKycRejected) return t('setting.reVerify');
    return t('setting.toVerify');
  };

  // 获取基础认证按钮样式
  const getBasicButtonClassName = () => {
    return `${styles.actionButton} ${isBasicKycVerified ? styles.verified : styles.primary}`;
  };

  // 获取高级认证按钮样式
  const getAdvancedButtonClassName = () => {
    if (isAdvancedKycVerified) return `${styles.actionButton} ${styles.verified}`;
    if (isAdvancedClickable) return `${styles.actionButton} ${styles.primary}`;
    return `${styles.actionButton} ${styles.disabled}`;
  };

  return (
    <div className={styles.kycEntranceContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('setting.idAuth')}</h2>
      </div>
      {showRejectionAlert && (
        <div className={styles.alertWrapper}>
          <Alert
            message={rejectionAlertMessage}
            banner
            type="error"
          />
        </div>
      )}

      <div className={styles.cardsWrapper}>
        {/* KYC 基础认证 */}
        <div className={`${styles.kycCard} ${!isBasicKycVerified ? styles.active : ''}`}>
          <div className={styles.iconWrapper}>
            <KycAdvancedIconSvg />
          </div>

          <div className={styles.cardContent}>
            <h3 className={`${styles.cardTitle} ${!isBasicKycVerified ? styles.activeTitle : ''}`}>
              {t('setting.basicAuth')}
            </h3>

            <button
              className={getBasicButtonClassName()}
              onClick={onStartBasicKyc}
              disabled={isBasicKycVerified}
            >
              {isBasicKycVerified && <VerifiedCheckIconSvg />}
              <span>{getBasicButtonText()}</span>
            </button>
          </div>
        </div>

        {/* KYC 高级认证 */}
        <div className={`${styles.kycCard} ${isAdvancedClickable && !isAdvancedKycVerified ? styles.active : ''}`}>
          <div className={styles.iconWrapper}>
            <KycAdvancedIconSvg />
          </div>

          <div className={styles.cardContent}>
            <h3 className={`${styles.cardTitle} ${isAdvancedClickable && !isAdvancedKycVerified ? styles.activeTitle : ''}`}>
              {t('setting.advancedAuth')}
            </h3>

            <button
              className={getAdvancedButtonClassName()}
              onClick={onStartAdvancedKyc}
              disabled={!isAdvancedClickable}
            >
              {isAdvancedKycVerified && <VerifiedCheckIconSvg />}
              {!isBasicKycSuccess && <LockIconSvg />}
              <span>{getAdvancedButtonText()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycEntrance;

