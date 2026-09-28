import React, { useCallback } from 'react';
import { Modal } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, isMobile as isMobileDevice } from '@better-bit-fe/base-utils';
import ExportedImage from 'next-image-export-optimizer';

interface ReferralShareModalProps {
  modalOpen: boolean;
  onClose?: () => void;
}

const ContactDemoModal: React.FC<ReferralShareModalProps> = ({
  modalOpen,
  onClose
}) => {
  const t = useFm();
  const isMobile = isMobileDevice();

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);
  return (
    <Modal
      styles={{
        content: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          padding: 0
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
      <div className="banner-theme-dark bg-fill-modal px-6 py-5">
        <div className="flex justify-between items-center">
          <h1 className="text-text-primary text-lg">{t('view-demo', '查看示例')}</h1>
          <div
            className="w-6 h-6 cursor-pointer transition-opacity duration-200 hover:opacity-70"
            style={{ backgroundImage: `url(${basePath}/images/referral/ic-close.svg)` }}
            onClick={handleClose}
          />
        </div>
        <p className="text-text-secondary text-xs my-6">
          {t('telegram-description')}
        </p>
        <ExportedImage
          src={`${basePath}/images/vip/tg-demo.png`}
          alt="background"
          width={120}
          height={167}
          loading={'lazy'}
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg=="
          style={{ objectFit: 'contain' }} />

        <p className="text-text-secondary text-xs my-6">
          {t('whatsapp-description')}
        </p>
        <ExportedImage
          src={`${basePath}/images/vip/whatsapp-demo.png`}
          alt="background"
          width={120}
          height={167}
          loading={'lazy'}
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg=="
          style={{ objectFit: 'contain' }} />

      </div>
    </Modal>
  );
};

export default ContactDemoModal;
