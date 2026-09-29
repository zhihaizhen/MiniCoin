import React from 'react';
import { Modal } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { CategoryEnum } from '~/enums';

interface AutoRenewModalProps {
  open: boolean;
  checked: boolean;
  coin: string;
  category: CategoryEnum;
  onCancel: () => void;
  onConfirm: () => void;
}

const AutoRenewModal: React.FC<AutoRenewModalProps> = ({
  open,
  checked,
  coin,
  category,
  onCancel,
  onConfirm,
}) => {
  const t = useFm();

  const isFixed = category === CategoryEnum.FIXED;
  const prefix = isFixed ? 'autoRenew' : 'autoSub';

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
        <div className="text-lg font-semibold text-text-primary">
          {checked ? t(`${prefix}-open`) : t(`${prefix}-close`)} - {coin}
        </div>
        <div className="mt-4 text-sm text-text-secondary leading-relaxed">
          {checked
            ? t(`${prefix}-open-tip`)
            : t(`${prefix}-close-tip`)}
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

export default AutoRenewModal;
