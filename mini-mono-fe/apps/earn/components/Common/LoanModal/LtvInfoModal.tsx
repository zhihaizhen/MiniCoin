import React from 'react';
import { Modal } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { FormattedMessage } from 'react-intl';
import { goPage } from '@better-bit-fe/base-utils';

interface LtvInfoModalProps {
  open: boolean;
  onCancel: () => void;
}

const LtvInfoModal: React.FC<LtvInfoModalProps> = ({
  open,
  onCancel,
}) => {
  const t = useFm();
  const onPage = () => {
    goPage('loanMaterial', 'tab=pledge')
  }

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
          {t('loan.ltvinfo.modal.title', '质押率说明')}
        </div>

        <div className="w-full mt-6 text-base font-medium text-text-brand-default min-h-10 bg-[#F5FBE5] rounded-lg leading-relaxed
          flex items-center justify-center">
          {t('loan.ltvinfo.modal.toptitle')}
        </div>

        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          <FormattedMessage
            id={'loan.ltvinfo.modal.topcontent'}
            values={{
              i: (chunks: React.ReactNode) => <strong className="text-text-brand-default font-normal cursor-pointer" onClick={onPage}>{chunks}</strong>,
            }}
          />
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 text-sm text-text-primary leading-relaxed">
          <section>
            <h2>{t('loan.initial_pledge_rate')}</h2>
            <p className="text-text-secondary">{t('loan.initial_pledge_rate_desc')} </p>
          </section>

          <section>
            <h2>{t('loan.early_warning_pledge_rate')}</h2>
            <p className="text-text-secondary">{t('loan.early_warning_pledge_rate_desc')} </p>
          </section>

          <section>
            <h2>{t('loan.force_liquidate_pledge_rate')}</h2>
            <p className="text-text-secondary">{t('loan.force_liquidate_pledge_rate_desc')} </p>
          </section>
        </div>

        <div className="mt-8 flex justify-between items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 btn-primary"
          >
            {t('confirm', '确定')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LtvInfoModal;
