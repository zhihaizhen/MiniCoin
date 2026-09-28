import { Modal } from 'antd';
import React from 'react';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import ExportedImage from 'next-image-export-optimizer';
import { basePath } from '~/env';
import { useAwardInfo } from '~/hooks/useAwardInfo';
import { AwardItem } from '~/interface';
import { FormattedMessage } from 'react-intl';

interface RedeemConfirmDialogProps {
  award?: AwardItem;
  open: boolean;
  close: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const RedeemConfirmDialog: React.FC<RedeemConfirmDialogProps> = ({
  award,
  open,
  close,
  onConfirm,
  loading
}) => {
  const t = useFm();
  const { awardDesc, tokenStr, imageUrl } = useAwardInfo(award);

  return (
    <Modal
      open={open}
      centered
      maskClosable={false}
      onCancel={close}
      closeIcon={null}
      width={478}
      footer={null}
    >
      <div className="w-full">
        <div className="w-full flex items-center justify-end">
          <div className="cursor-pointer" onClick={close}>
            <CloseIcon />
          </div>
        </div>
        <div className="text-text-primary font-semibold text-xl text-center mt-2">
           {t('confirmRedeemTitle', { points: award?.points_cost })}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          <ExportedImage
            src={`${basePath}/images/gift/${imageUrl}`}
            alt="gift"
            width={92}
            height={92}
          />
          <div>
            <div className="text-base md:text-xl font-bold text-text-primary line-clamp-3 text-center">
              <FormattedMessage
                id="tokenformatredeemconfirm"
                defaultMessage={tokenStr}
                values={{
                  i: (chunks: React.ReactNode) => <span className="text-text-brand-default-web">{chunks}</span>,
                }}
              />
            </div>
            <div className="text-sm font-semibold text-text-secondary text-center">
              {awardDesc}
            </div>
          </div>

        </div>

        <div className="mt-8 flex gap-4">
          <button
            className="flex-1 h-12 bg-fill-button-tertiary-default hover:bg-fill-button-tertiary-hover cursor-pointer rounded-full
            text-sm font-semibold text-text-primary flex justify-center items-center border-none outline-none"
            onClick={close}
            disabled={loading}
          >
            {t('cancel')}
          </button>
          <button
            className="flex-1 h-12 bg-fill-button-green-default hover:bg-fill-button-green-hover cursor-pointer rounded-full
            text-sm font-semibold text-black flex justify-center items-center border-none outline-none disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {t('redeem')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RedeemConfirmDialog;
