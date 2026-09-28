import React, { useEffect, useCallback, useState} from 'react';
import { message, Modal } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, isApp } from '@better-bit-fe/base-utils';
import { ReactComponent as DownloadIcon } from '~/public/images/share/download.svg';
import { LotteryChar } from '~/components/CollectGather';
import { postQrcodeRewards } from '~/api';
import { generatePhrasePoster } from '~/utils';

interface ReferralShareModalProps {
  modalOpen: boolean;
  phrase: LotteryChar;
  onClose?: () => void;
}

const INITIAL_SHARE_DATA = {
  source: 'rewards',
  type: 'api',
  action: 'claim_char_reward'
};

const generateQrCodeValue = (validId: string) => JSON.stringify({
  ...INITIAL_SHARE_DATA,
  params: { 'valid_id': validId }
});


const ReferralShareModal: React.FC<ReferralShareModalProps> = ({ modalOpen, phrase, onClose }) => {
  const t = useFm();
  const isapp = isApp();

  const [shareStr, setShareStr] = useState(() => generateQrCodeValue(''));
  const [base64Image, setBase64Image] = useState<string>('');

  useEffect(() => {
    if (!shareStr || !phrase?.charType) return;
    const charImgUrl = `${basePath}/images/${phrase?.charType}.png`;
    const bgImgUrl = `${basePath}/images/lottery_char_bg_share.png`;
    generatePhrasePoster(bgImgUrl,charImgUrl, shareStr).then((base64) => {
      setBase64Image(base64);
    });
  }, [phrase?.charType, shareStr]);

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
    if (modalOpen && phrase?.charType) {
      postQrcodeRewards({ char_type: phrase?.charType }).then(res => {
        setShareStr(generateQrCodeValue(res?.valid_id || ''));
      }).catch(err => {
         void message.error(t(err?.code || 'unknown-error'));
         setShareStr(generateQrCodeValue(''));
      });
    }
  }, [modalOpen, phrase?.charType, t]);

  return (
    <Modal
      className={'composed-dialog'}
      open={modalOpen}
      centered
      maskClosable={false}
      onCancel={handleClose}
      closeIcon={null}
      width={isapp ? '100%' : 364}
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
          <img src={base64Image} alt="Generated Poster" className="w-full" />
        )}

        <div className="w-full md:w-[343px] h-[102px] flex justify-start items-center bg-bg-secondary rounded-xl md:-translate-x-3 py-6 px-4">
          <div
            className="flex flex-col items-center justify-between gap-2 cursor-pointer"
            onClick={handleDownload}
          >
            <DownloadIcon />
            <span className="text-text-primary text-xs">{t('save-image')}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReferralShareModal;
