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

interface QrCodeModalProps {
  modalOpen: boolean;
  referralInfo: {
    inviteCode?: string;
    inviteLink?: string;
  };
  onClose?: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({
  modalOpen,
  referralInfo,
  onClose
}) => {
  const t = useFm();
  const downloadId = useMemo(() => getRandomId(), []);

  const isMobile = isMobileDevice();

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
              <div className={styles.logo} />
              <div className={styles.card}>
                <div className={styles.cardDesign}>
                  <div className={styles.content}>
                    <div
                      className={styles.title}
                      dangerouslySetInnerHTML={{
                        __html: t('share-text')
                      }}
                    />
                    <div className={styles.illustration} />
                  </div>
                </div>
                {/* 邀请信息 */}
                <div className={styles.invite}>
                  <div className={styles.qrcode}>
                    <div className={styles.qrcodeWrapper}>
                      <QRCode
                        size={140}
                        value={referralInfo?.inviteLink || ''}
                        level="H"
                      />
                      <div className={styles.qrcodeLogo} />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.inviteInfo}>
                <div className={styles.codeRow}>
                  <span className={styles.descLabel}>{t('share-invite-code')}</span>
                </div>
                <div className={styles.descText}>{referralInfo?.inviteCode || ''}</div>
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

export default QrCodeModal;
