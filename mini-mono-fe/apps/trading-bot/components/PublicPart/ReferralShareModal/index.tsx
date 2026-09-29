import React, { useMemo } from 'react';
import { Modal } from 'antd';
import domtoimage from 'dom-to-image';
import QRCode from 'react-qr-code';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { getRandomId } from '~/utils/share';
import { isMobile as isMobileDevice } from '@better-bit-fe/base-utils';
import { SocialShareActions } from '@better-bit-fe/base-ui';

import styles from './index.module.less';

interface ReferralShareModalProps {
  modalOpen: boolean;
  referralInfo: {
    inviteCode?: string;
    inviteLink?: string;
  };
  onClose?: () => void;
  strategyData?: {
    symbol: string;
    profitRate: string;
    runningTime?: string;
    startedAt?: number | string;
    stoppedAt?: number | string;
    status: {
      text: string;
    };
  } | null;
  strategyTypeLabel: string;
  extraStatLabel: string;
  extraStatValue?: string;
}

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({
  modalOpen,
  referralInfo,
  onClose,
  strategyData,
  strategyTypeLabel,
  extraStatLabel,
  extraStatValue
}) => {
  const t = useFm();
  const downloadId = useMemo(() => getRandomId(), []);

  const isMobile = isMobileDevice();

  const displayRunningTime = useMemo(() => {
    if (strategyData?.runningTime) return strategyData.runningTime;
    if (!strategyData?.startedAt) return '--';
    const startedAtNum = typeof strategyData.startedAt === 'string'
      ? parseInt(strategyData.startedAt, 10)
      : strategyData.startedAt;
    if (isNaN(startedAtNum)) return '--';
    let endTime: number;
    if (strategyData.stoppedAt) {
      const stoppedAtNum = typeof strategyData.stoppedAt === 'string'
        ? parseInt(strategyData.stoppedAt, 10)
        : strategyData.stoppedAt;
      endTime = isNaN(stoppedAtNum) ? Math.floor(Date.now() / 1000) : stoppedAtNum;
    } else {
      endTime = Math.floor(Date.now() / 1000);
    }
    const runSeconds = endTime - startedAtNum;
    if (runSeconds <= 0) return '--';
    const days = Math.floor(runSeconds / 86400);
    const hours = Math.floor((runSeconds % 86400) / 3600);
    const minutes = Math.floor((runSeconds % 3600) / 60);
    return `${days}D ${hours}H ${minutes}M`;
  }, [strategyData]);

  const handleClose = () => {
    onClose?.();
  };

  const handleDownload = () => {
    const target = document.getElementById(downloadId);
    if (!target) return;
    const scale = 1.5;
    const obj = {
      height: target.offsetHeight * scale,
      width: target.offsetWidth * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`
      }
    };
    domtoimage.toPng(target, obj).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `referral_${referralInfo?.inviteCode || ''}.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  return (
    <Modal
      className={cls(styles.modalMask, { [styles.mobile]: isMobile })}
      open={modalOpen}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={isMobile ? '100%' : 608}
      footer={null}
    >
      <div className={styles.referralShareModal}>
        <div className={styles.content}>
          <div className={styles.contentWrapper}>
            <div className={styles.close} onClick={handleClose} />
            <div className={styles.body} id={downloadId}>
              <div className={styles.card}>
                <div className={styles.cardDesign}>
                  <div className={styles.logo} />
                  <div className={styles.contentRow}>
                    <div className={styles.strategyInfo}>
                      <div className={styles.strategyType}>{strategyTypeLabel}</div>
                      <div className={styles.strategySymbol}>{strategyData?.symbol}</div>

                      <div className={styles.profitSection}>
                        <div className={styles.profitLabel}>{t('profit-rate')}</div>
                        <div className={`${styles.profitValue} ${strategyData?.profitRate?.startsWith('-') ? styles.profitValueNegative : ''}`}>
                          {strategyData?.profitRate || '--'}
                        </div>
                      </div>

                      <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>{extraStatLabel}</span>
                          <span className={styles.statValue}>
                            {extraStatValue || '--'}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>{t('running-time')}</span>
                          <span className={styles.statValue}>
                            {displayRunningTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.illustrationRight} />
                  </div>
                </div>
                <div className={styles.invite}>
                  <div className={styles.qrcode}>
                    <div className={styles.qrcodeWrapper}>
                      <QRCode
                        level="H"
                        size={isMobile ? 49 : 56}
                        value={referralInfo?.inviteLink || ''}
                      />
                      <div className={styles.qrcodeLogo} />
                    </div>
                  </div>
                  <div className={styles.inviteInfo}>
                    <div className={styles.codeRow}>
                      <span className={styles.descLabel}>{t('share-invite-code')}</span>
                      <span className={styles.descText}>{referralInfo?.inviteCode || ''}</span>
                    </div>
                    <div className={styles.descSubtext}>{t('easicoin-slogan')}</div>
                  </div>
                </div>
              </div>
            </div>
            <SocialShareActions
              inviteLink={referralInfo?.inviteLink}
              inviteCode={referralInfo?.inviteCode}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </div>
    </Modal >
  );
};

export default ReferralShareModal;
