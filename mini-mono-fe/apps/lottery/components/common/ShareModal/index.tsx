import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'antd';
import domtoimage from 'dom-to-image';
import QRCode from 'react-qr-code';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { isMobile as isMobileDevice, isApp } from '@better-bit-fe/base-utils';
import { SocialShareActions } from '@better-bit-fe/base-ui';
import { basePath } from '~/env';
import { getRandomId } from '~/utils';
import styles from './index.module.less';
import { getUserInviteInfo } from '~/api';

interface ShareModalProps {
  isBlock?: boolean;
  modalOpen: boolean;
  title: string;
  subTitle?: string;
  onClose?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isBlock, modalOpen, title, subTitle, onClose }) => {
  const t = useFm();
  const downloadId = useMemo(() => getRandomId(), []);
  const isMobile = isMobileDevice();
  const [referralInfo, setReferralInfo] = useState({ inviteCode: '', inviteLink: '' });

  const handleDownload = async () => {
    const target = document.getElementById(downloadId);
    if (!target) return;
    const scale = 1.5;
    const opts = {
      height: target.offsetHeight * scale,
      width: target.offsetWidth * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`
      }
    };
    // First call caches all image resources; second call produces a complete screenshot
    await domtoimage.toPng(target, opts);
    domtoimage.toPng(target, opts).then((base64) => {
      if (isApp()) {
        (window as any)?.flutter_inappwebview?.callHandler(
          '_b_bridge_Share_',
          JSON.stringify({
            methodName: 'shareBase64',
            moduleName: '_b_bridge_Share_',
            uniqueId: null,
            params: { base64, text: '', title: '' }
          })
        );
        return;
      }
      const link = document.createElement('a');
      link.download = `invite_${referralInfo?.inviteCode || ''}.png`;
      link.href = base64;
      link.click();
    });
  };

  useEffect(() => {
    if (modalOpen) {
      getUserInviteInfo().then((res) => setReferralInfo(res));
    }
  }, [modalOpen]);

  const bannerSuffix = isMobile
    ? isBlock ? 'banner-block-h5' : 'banner-default-h5'
    : isBlock ? 'banner-block' : 'banner-default';

  return (
    <Modal
      className={cls(styles.modalMask, { [styles.mobile]: isMobile })}
      open={modalOpen}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={isMobile ? 'calc(100% - 32px)' : 608}
      footer={null}
    >
      <div className={styles.shareModal}>
        <div className={styles.contentWrapper}>
          <div className={styles.close} onClick={onClose} />
          <div className={styles.body} id={downloadId}>
            <div className={styles.card}>
              <div className={styles.cardDesign}>
                <img
                  className={styles.logo}
                  src={`${basePath || ''}/images/referral/logo.svg`}
                  alt="EasiCoin"
                />
                <div className={styles.contentRow}>
                  <div className={styles.titleSection}>
                    <h1 className={styles.title}>{title}</h1>
                    <h2 className={styles.subTitle}>{subTitle}</h2>
                  </div>
                </div>
                <div className={styles.bgImg}>
                  <img src={`${basePath || ''}/images/referral/${bannerSuffix}.png`} alt="" />
                </div>
              </div>
              <div className={styles.invite}>
                <div className={styles.qrcode}>
                  <div className={styles.qrcodeWrapper}>
                    <QRCode level="H" size={isMobile ? 49 : 56} value={referralInfo?.inviteLink || ''} />
                  </div>
                </div>
                <div className={styles.inviteInfo}>
                  <div className={styles.codeLabel}>{t('share-text-1')}</div>
                  <div className={styles.codeValue}>{t('share-text-2')}</div>
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
    </Modal>
  );
};

export default ShareModal;
