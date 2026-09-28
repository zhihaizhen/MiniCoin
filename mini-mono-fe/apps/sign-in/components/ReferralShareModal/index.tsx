import React, { useMemo } from 'react';
import { Modal } from 'antd';
import domtoimage from 'dom-to-image';
import QRCode from 'react-qr-code';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { getRandomId } from '~/utils/share';
import { isMobile as isMobileDevice, basePath } from '@better-bit-fe/base-utils';
import { SocialShareActions } from '@better-bit-fe/base-ui';
import { useCampaign } from '~/context';
import { formatThousandDigit } from '~/utils';

import styles from './index.module.less';

interface ReferralShareModalProps {
  modalOpen: boolean;
  referralInfo: {
    inviteCode?: string;
    inviteLink?: string;
  };
  onClose?: () => void;
  isSuccessShare?: boolean; // 是否是领取成功后的分享
  rewardAmount?: string; // 领取的奖励金额
}

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({
  modalOpen,
  referralInfo,
  onClose,
  isSuccessShare = false,
  rewardAmount
}) => {
  const t = useFm();
  const downloadId = useMemo(() => getRandomId(), []);
  const { campaignDetail, publicCampaignDetail } = useCampaign();

  const isMobile = isMobileDevice();

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

  // 获取最大单日奖励金额
  const maxRewardAmount = useMemo(() => {
    if (campaignDetail?.max_day_reward_amount) {
      return formatThousandDigit(campaignDetail.max_day_reward_amount);
    }
    return '--';
  }, [campaignDetail?.max_day_reward_amount]);

  // 生成分享文本 HTML
  const shareTextHtml = useMemo(() => {
    if (isSuccessShare) {
      // 领取成功后的分享文案
      const amount = rewardAmount || maxRewardAmount;
      // 多语言模板中已包含 HTML 标签，只需替换变量
      const template = t('share-success-text');
      return template
        .replace('{amount}', amount)
        .replace(/\\"/g, '"');
    }
    // 普通分享文案
    // 多语言模板中已包含 HTML 标签（<span class="highlight">），只需替换变量
    const template = t('share-text');
    return template
      .replace('{days}', totalDays)
      .replace('{amount}', maxRewardAmount)
      .replace(/\\"/g, '"');
  }, [t, totalDays, maxRewardAmount, isSuccessShare, rewardAmount]);

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
      onCancel={isMobile ? null : handleClose}
      closeIcon={null}
      keyboard={!isMobile}
      width={isMobile ? '100%' : 608}
      footer={null}
    >
      <div className={styles.referralShareModal}>
        <div className={styles.content}>
          <div className={styles.contentWrapper}>
            <div className={styles.close} onClick={handleClose}>
              <div className={styles.icon} />
            </div>
            <div className={styles.body} id={downloadId}>
              <div className={styles.card}>
                <div className={styles.cardDesign}>
                  <div className={styles.logo} />
                  <div className={styles.contentRow}>
                    <div className={styles.content}>
                      <div
                        className={styles.title}
                        dangerouslySetInnerHTML={{
                          __html: shareTextHtml
                        }}
                      />
                    </div>
                    {isSuccessShare ? (
                      // 领取成功后显示新图片
                      <div className={styles.illustrationSuccess}>
                        <img src={`${basePath}/images/success-share.png`} alt="success" />
                      </div>
                    ) : (
                      // 普通分享显示原图片
                      <div className={styles.illustrationRight} />
                    )}
                  </div>
                </div>
                {/* 邀请信息 */}
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
                    </div>
                    <div className={styles.descText}>{referralInfo?.inviteCode || ''}</div>
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
