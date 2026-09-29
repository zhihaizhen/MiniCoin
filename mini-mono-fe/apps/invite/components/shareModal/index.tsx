import React, { useMemo } from 'react';
import { Modal } from 'antd';
import domtoimage from 'dom-to-image';
import QRCode from 'react-qr-code';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { isMobile as isMobileDevice, isApp } from '@better-bit-fe/base-utils';
import { SocialShareActions } from '@better-bit-fe/base-ui';
import { basePath } from '~/env';
import { getRandomId } from '~/utils/share';
import styles from './index.module.less';

interface ShareModalProps {
  modalOpen: boolean;
  referralInfo: {
    inviteCode?: string;
    inviteLink?: string;
  } | null;
  invitationRewardAmount?: string;
  rewardToken?: string;
  onClose?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  modalOpen,
  referralInfo,
  invitationRewardAmount = '0',
  rewardToken = 'USDT',
  onClose
}) => {
  const t = useFm();
  const downloadId = useMemo(() => getRandomId(), []);
  const isMobile = isMobileDevice();

  const handleClose = () => {
    onClose?.();
  };

  const handleDownload = async () => {
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
    // 第一次 toPng 会把所有图片资源拉取并缓存到内存，第二次调用时资源已就绪，截图就完整了
    await domtoimage.toPng(target, obj).catch(() => { });
    // 第二次调用生成正确截图
    domtoimage.toPng(target, obj).then((base64) => {
      if (isApp()) {
        const bridgeParams = {
          methodName: 'shareBase64',
          moduleName: '_b_bridge_Share_',
          uniqueId: null,
          params: { base64, text: '', title: '' }
        };
        (window as any)?.flutter_inappwebview?.callHandler(
          '_b_bridge_Share_',
          JSON.stringify(bridgeParams)
        );
        return;
      }
      const link = document.createElement('a');
      link.download = `invite_${referralInfo?.inviteCode || ''}.png`;
      link.href = base64;
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
      width={isMobile ? 'calc(100% - 32px)' : 608}
      footer={null}
    >
      <div className={styles.shareModal}>
        <div className={styles.contentWrapper}>
          <div className={styles.close} onClick={handleClose} />
          <div className={styles.body} id={downloadId}>
            <div className={styles.card}>
              <div className={styles.cardDesign}>
                <img
                  className={styles.logo}
                  src={`${basePath || ''}/image/logo.png`}
                  alt="EasiCoin"
                />
                <div className={styles.contentRow}>
                  <div className={styles.titleSection}>
                    <div
                      className={styles.title}
                      dangerouslySetInnerHTML={{
                        __html: t('share-text', {
                          amount: `<span class="${styles.highlight}">${invitationRewardAmount} ${rewardToken}</span>`
                        }) || `立即注册<br/>即领 <span class="${styles.highlight}">${invitationRewardAmount} ${rewardToken}</span>`
                      }}
                    />
                  </div>
                  <div className={styles.illustrationRight}>
                    <img
                      src={`${basePath || ''}/image/share-illustration.png`}
                      alt=""
                    />
                  </div>
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
                  </div>
                </div>
                <div className={styles.inviteInfo}>
                  <div className={styles.codeLabel}>
                    {t('share-invite-code') || '输入我的邀请码，加入EasiCoin'}
                  </div>
                  <div className={styles.codeValue}>
                    {referralInfo?.inviteCode || ''}
                  </div>
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
