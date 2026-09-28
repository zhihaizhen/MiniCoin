import { Modal} from 'antd';
import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { ReactComponent as DepositIcon } from '~/public/images/deposit.svg';
import { ReactComponent as GroupIcon } from '~/public/images/goup.svg';
import { ReactComponent as TransferIcon } from '~/public/images/transfer.svg';
import { ReactComponent as RightArrowIcon } from '~/public/images/right-arrow.svg';
import { goPage } from '@better-bit-fe/base-utils';
import { TransferModal } from 'betterbit-ui';

interface AddAssetsModalProps {
  coin: string;
  open: boolean;
  close: () => void;
}

/**
 * 补充资产
 * @param open
 * @param coin
 * @param close
 * @constructor
 */
const SuccessModal: React.FC<AddAssetsModalProps> = ({coin, open, close}) => {
  const t = useFm()

  const handleGoPage = (page:string) => {
    if(page === 'transfer') {
       TransferModal.show({
         from:'FUNDING',
         to: 'SPOT',
         coin: coin,
         callback: () => {
          TransferModal.close();
          close();
         }});
      return;
    }
    goPage(page)
  }

  return (
    <Modal
      open={open}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={440}
      footer={null}
    >
      <div className="w-full">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-text-primary text-base font-semibold">
            {' '}
            {t('addUsdt')}
            {coin}
          </h1>

          <div className="cursor-pointer" onClick={close}>
            <CloseIcon />
          </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-2 mt-6 mb-4">
          <div
            className="w-full flex justify-between items-center border border-line-divider-primary rounded-lg p-4
              hover:border-text-brand-default cursor-pointer"
            onClick={() => handleGoPage('deposit')}
          >
            <div className="flex justify-start items-center gap-2">
              <DepositIcon />
              <div>
                <span className="text-text-primary text-sm font-bold leading-5">
                  {t('deposit')}
                </span>
                <p className="text-text-secondary text-xs leading-5">
                  {t('depositTip')}
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center w-8 h-4 rounded-sm bg-text-brand-default-web ">
              <RightArrowIcon className="text-[10px]" />
            </div>
          </div>
          <div
            className="w-full flex justify-between items-center border border-line-divider-primary rounded-lg p-4
              hover:border-text-brand-default cursor-pointer"
            onClick={() => handleGoPage('transfer')}
          >
            <div className="flex justify-start items-center gap-2">
              <TransferIcon />
              <div>
                <span className="text-text-primary text-sm font-bold leading-5">
                  {t('transfer')}
                </span>
                <p className="text-text-secondary text-xs leading-5">
                  {t('transferTip')}
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center w-8 h-4 rounded-sm bg-text-brand-default-web">
              <RightArrowIcon className="text-[10px]" />
            </div>
          </div>
          <div
            className="w-full flex justify-between items-center border border-line-divider-primary rounded-lg p-4
              hover:border-text-brand-default cursor-pointer"
            onClick={() => handleGoPage('spot')}
          >
            <div className="flex justify-start items-center gap-2">
              <GroupIcon />
              <div>
                <span className="text-text-primary text-sm font-bold leading-5">
                  {t('trade')}
                </span>
                <p className="text-text-secondary text-xs leading-5">
                  {t('tradeTip')}
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center w-8 h-4 rounded-sm bg-text-brand-default-web">
              <RightArrowIcon className="text-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SuccessModal;
