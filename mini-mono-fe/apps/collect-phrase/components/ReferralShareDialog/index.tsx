import React, { useEffect, useCallback, useState } from 'react';
import { Modal } from 'antd';
import {
  basePath,
  isApp,
  isMobile
} from '@better-bit-fe/base-utils';
import { getUserInviteInfo } from '~/api';
import { SocialShareActions } from '@better-bit-fe/base-ui';
import { generatePoster } from '~/utils';

interface ReferralShareModalProps {
  modalOpen: boolean;
  onClose?: () => void;
}

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({
  modalOpen,
  onClose
}) => {
  const isapp = isApp();
  const isMb = isMobile();
  const [referralInfo, setReferralInfo] = React.useState({
    inviteCode: '',
    inviteLink: ''
  });
  const [base64Image, setBase64Image] = useState<string>('');

  useEffect(() => {
    const qrContent = referralInfo?.inviteLink  || 'unknown';
    const bgImgUrl = `${basePath}/images/share/${isMb ? 'shareBgH5': 'shareBg'}.png`;
    generatePoster(bgImgUrl, qrContent, referralInfo?.inviteCode, isMb).then(
      (base64) => {
        setBase64Image(base64);
      }
    );
  }, [isMb, referralInfo?.inviteCode, referralInfo?.inviteLink]);

  const handleClose = useCallback(() => onClose?.(), [onClose]);
  const handleDownload = useCallback(async () => {
    if (isapp) {
      const bridgeParams = {
        methodName: 'shareBase64',
        moduleName: '_b_bridge_Share_',
        uniqueId: null,
        params: {
          base64: base64Image,
          text: '',
          title: ''
        }
      };
      (window as any)?.flutter_inappwebview?.callHandler(
        '_b_bridge_Share_',
        JSON.stringify(bridgeParams)
      );
      return;
    }

    const link = document.createElement('a');
    link.download = `share_${Date.now()}.png`;
    link.href = base64Image;
    link.click();
  }, [isapp, base64Image]);

  useEffect(() => {
    if (modalOpen) {
      getUserInviteInfo().then((res) => setReferralInfo(res));
    }
  }, [modalOpen]);

  return (
    <Modal
      className={'composed-dialog'}
      open={modalOpen}
      centered
      maskClosable={false}
      onCancel={handleClose}
      closeIcon={null}
      width={isMb ? '100%' : 608}
      footer={null}
    >
      <div className="flex flex-col gap-4">
        <div
          className="ml-auto rounded-3xl w-6 h-6 cursor-pointer transition-opacity hover:opacity-70"
          style={{
            background: `url(${basePath}/images/referral/ic-close.svg) no-repeat center`,
            backgroundSize: '24px 24px'
          }}
          onClick={handleClose}
        />

        {base64Image && (
          <div className="md:border rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={base64Image} alt="Generated Poster" className="w-full" />
          </div>
        )}
        <SocialShareActions
          inviteLink={referralInfo?.inviteLink}
          inviteCode={referralInfo?.inviteCode}
          onDownload={handleDownload}
        />
      </div>
    </Modal>
  );
};

export default ReferralShareModal;
