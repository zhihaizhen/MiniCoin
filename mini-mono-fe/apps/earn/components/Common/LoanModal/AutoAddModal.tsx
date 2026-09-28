import React from 'react';
import { Modal } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import ExportedImage from 'next-image-export-optimizer';
import { basePath } from '@better-bit-fe/base-utils';

interface AutoAddModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isClose?: boolean;
}

const AutoAddModal: React.FC<AutoAddModalProps> = ({
  isClose,
  open,
  onCancel,
  onConfirm,
}) => {
  const t = useFm();

  return (
    <Modal
      open={open}
      centered
      onCancel={onCancel}
      footer={null}
      closable={false}
      width={440}
    >
      <div className="py-1">
        <div className="text-base font-semibold text-text-primary">
          {isClose ? t('loan.autoadd.modal.title.close', '关闭自动补仓') : t('loan.autoadd.modal.title.open', '开启自动补仓')}
        </div>

        <div className="relative w-[120px] h-[120px] mt-2 mx-auto">
           <ExportedImage
              src={`${basePath}/images/loan/autoAdd.png`}
              alt="autoadd"
              fill
            />
        </div>
        <div className="mt-4 text-xs text-text-primary leading-relaxed">
          {isClose ? t('loan.autoadd.modal.close.tip') : t('loan.autoadd.tip')}
        </div>
        <div className="mt-8 flex justify-between items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 btn-tertiary"
          >
            {t('cancel', '取消')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 btn-primary"
          >
            {t('confirm', '确定')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AutoAddModal;
