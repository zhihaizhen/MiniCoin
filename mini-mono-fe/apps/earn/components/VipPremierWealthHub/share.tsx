import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import domtoimage from 'dom-to-image';
import QRCode from 'react-qr-code';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, isMobile as isMobileDevice } from '@better-bit-fe/base-utils';
import { SocialShareActions } from '@better-bit-fe/base-ui';
import { ReactComponent as VipLogoIcon } from '~/public/images/vip/vip-logo.svg';

import { getUserInviteInfo } from '~/api';
import { FormattedMessage } from 'react-intl';

interface ReferralShareModalProps {
  modalOpen: boolean;
  onClose?: () => void;
}

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({
  modalOpen,
  onClose
}) => {
  const t = useFm();
  const cardRef = useRef<HTMLDivElement>(null);
  const [referralInfo, setReferralInfo] = useState({
    inviteCode: '',
    inviteLink: ''
  });

  const isMobile = isMobileDevice();

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleDownload = useCallback(() => {
    const target = cardRef.current;
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
  }, [referralInfo?.inviteCode]);

  useEffect(() => {
    if (modalOpen) {
      getUserInviteInfo().then((res) => setReferralInfo(res));
    }
  }, [modalOpen]);

  return (
    <Modal
      styles={{
        content: {
          backgroundColor: 'transparent',
          boxShadow: 'none'
        }
      }}
      className={isMobile ? '[&_.ant-modal]:max-w-full [&_.ant-modal]:m-0 [&_.ant-modal]:px-4' : ''}
      open={modalOpen}
      centered
      maskClosable={false}
      onCancel={handleClose}
      closeIcon={null}
      keyboard
      width={isMobile ? '100%' : 608}
      footer={null}
    >
      <div className="banner-theme-dark">
        <div className="flex flex-col relative">
          <div
            className="absolute top-4 right-4 ml-auto rounded-[24px] w-6 h-6 bg-no-repeat bg-center bg-size-[24px_24px] cursor-pointer transition-opacity duration-200 z-10 hover:opacity-70"
            style={{ backgroundImage: `url(${basePath}/images/referral/ic-close.svg)` }}
            onClick={handleClose}
          />
          <div
            className="mb-4 bg-[#080808] border border-[#28292a] rounded-xl overflow-hidden w-full max-w-full"
            ref={cardRef}
          >
            <div className="flex flex-col">
              <div className="w-full h-[400px]" style={{ backgroundImage: `url(${basePath}/images/vip/share-bg${isMobile ? '-h5' : ''}.png)`,backgroundSize:'contain' }}>
                <div className="flex flex-col items-start p-4 md:pt-4 md:px-6 md:pb-0 relative" >
                  <div className="w-[120px] h-7 bg-no-repeat bg-center bg-contain mb-6 md:mb-0" style={{ backgroundImage: `url(${basePath}/images/referral/logo.png)` }} />
                  <div className="flex flex-col items-center justify-between w-full gap-4 pt-4">
                     <div className="w-[137px] md:w-[235px]"> <VipLogoIcon /> </div>
                     <h1 className="text-[32px] font-medium md:font-bold text-white">{t('earn.wealth', '尊享财富管理')}</h1>
                     <div className="text-white text-xs md:text-sm">
                        <FormattedMessage id="earn.wealth.description" values={{ i: (chunks) => (<span className="text-[#FFD583]">{chunks}</span>) }} />
                     </div>
                  </div>
                </div>
              </div>
              {/* 邀请信息 */}
              <div className="w-full px-4 md:px-6 py-0 md:py-3 pb-3 md:pb-3 flex items-center md:items-start gap-3 md:gap-4">
                <div className="p-1 bg-white rounded-[2px] shrink-0 order-2 md:order-0">
                  <div className="relative flex leading-0">
                    <QRCode
                      level="H"
                      size={isMobile ? 49 : 56}
                      value={referralInfo?.inviteLink || ''}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[13px] h-[13px] bg-no-repeat bg-center bg-contain pointer-events-none" style={{ backgroundImage: `url(${basePath}/images/referral/qrcode-logo.png)` }} />
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-[6px] flex-1 max-w-full pt-0 md:pt-0">
                  <div className="flex flex-row items-baseline gap-[5px] h-6">
                    <span className="text-white text-xs leading-[18px]">
                      {t('share-invite-code')}
                    </span>
                  </div>
                  <div className="text-white text-[22px] font-bold leading-5">
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

export default ReferralShareModal;
