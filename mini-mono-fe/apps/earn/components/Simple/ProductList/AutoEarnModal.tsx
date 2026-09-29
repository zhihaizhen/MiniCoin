import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { postSimpleEarnSet } from '~/api';
import { ISimpleEarnProduct } from '~/interface';
import { ReactComponent as AutoEarnIcon } from '~/public/images/autoEarn.svg';

interface AutoEarnModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  type: 'all' | 'single';
  status: 'open' | 'close';
  product?: ISimpleEarnProduct;
}

const AutoEarnModal: React.FC<AutoEarnModalProps> = ({
  open,
  onCancel,
  onSuccess,
  type,
  status,
  product,
}) => {
  const t = useFm();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const params: any = {
        status,
        open_all: type === 'all',
      };
      if (type === 'single' && product) {
        params.product_id = product.id;
        params.product_coin = product.coin;
      }

      await postSimpleEarnSet(params);
      message.success(t('operationSuccess', '操作成功'));
      onSuccess();
    } catch (error) {
      // 错误处理由 request 统一拦截，这里只需停止 loading
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const isOpening = status === 'open';
    const isAll = type === 'all';

    if (isAll) {
      return isOpening
        ? t('openAllAutoEarnTitle')
        : t('closeAllAutoEarnTitle');
    }

    const coinName = product?.coin || '';
    return isOpening
      ? `${t('openSingleAutoEarnTitle')} - ${coinName}`
      : `${t('closeSingleAutoEarnTitle')} - ${coinName}`;
  };

  const getContent = () => {
    const isOpening = status === 'open';
    const isAll = type === 'all';

    if (isAll) {
      return isOpening
        ? t('openAllAutoEarnContent')
        : t('closeAllAutoEarnContent');
    }

    const coinName = product?.coin || '';

    return isOpening
      ? ''
      : t('closeSingleAutoEarnContent');
  };

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
          {getTitle()}
        </div>

        <div className="mt-2 flex justify-center items-center w-full">
          <AutoEarnIcon />
        </div>
        <div className="mt-4 text-xs text-text-primary leading-relaxed">
          {getContent()}
          {status === 'open' &&  <div>{t('simple-earn-auto-tip')}</div>}
        </div>
        <div className="mt-8 flex justify-between items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 btn-tertiary"
          >
            {t('cancel', '取消')}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-10 btn-primary"
          >
            {t('confirm', '确定')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AutoEarnModal;
