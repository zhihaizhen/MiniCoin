import { message, Modal } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { ReactComponent as CompleteIcon } from '~/public/images/complete.svg';
import { ReactComponent as RightArrowIcon } from '~/public/images/right-arrow.svg';
import { getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import Image from 'next/image';
import { SwapStatusEnum } from '~/enums';
import { ISymbolSwapQuoteInfo } from '~/interface';
import dayjs from 'dayjs';

import BigNumber from 'bignumber.js';
import { getSymbolSwap } from '~/api';

interface ConfirmSwapModalProps {
  swapQuote: ISymbolSwapQuoteInfo;
  countdown: number;
  cycleNum: number;
  open: boolean;
  update: () => void;
  close: () => void;
  complete: () => void;
}

const TokenAmount: React.FC<{
  token: string;
  quantity: string;
  label: string;
  size?: 'small' | 'large';
}> = ({ token, quantity, label, size = 'large' }) => {
  const t = useFm();
  const iconSize = size === 'large' ? 28 : 16;

  return (
    <div className="flex flex-col justify-center items-center">
      <Image
        src={getSymbolUrl(token)}
        alt={token}
        width={iconSize}
        height={iconSize}
        loader={({ src }) => src}
      />
      <div className="text-text-secondary text-xs leading-5 mt-1">{t(label)}</div>
      <strong className="text-text-primary text-sm font-bold leading-5">
        {new BigNumber(quantity || 0).toFixed()} {token}
      </strong>
    </div>
  );
};

const SwapPreview: React.FC<{ quote: ISymbolSwapQuoteInfo }> = ({ quote }) => (
  <div className="w-full h-[100px] flex justify-between items-center border border-line-divider-primary rounded-xl p-4 mb-4">
    <TokenAmount
      token={quote?.from_token || ''}
      quantity={quote?.from_token_quantity}
      label="from"
    />
    <RightArrowIcon />
    <TokenAmount
      token={quote?.to_token || ''}
      quantity={quote?.to_token_quantity}
      label="to"
    />
  </div>
);

const SwapSuccess: React.FC<{ quote: ISymbolSwapQuoteInfo }> = ({ quote }) => {
  const t = useFm();

  return (
    <div className="w-full flex flex-col items-center">
      <CompleteIcon />
      <div className="text-text-primary text-[24px] font-semibold leading-8">
        {new BigNumber(quote?.to_token_quantity || 0).toFixed()} {quote?.to_token}
      </div>
      <div className="text-sm text-text-primary pb-7">{t('exchange-success')}</div>

      {[
        { label: 'from', token: quote?.from_token, quantity: quote?.from_token_quantity },
        { label: 'to', token: quote?.to_token, quantity: quote?.to_token_quantity }
      ].map(({ label, token, quantity }) => (
        <div key={label} className="w-full flex justify-between items-center mt-2">
          <div className="text-sm text-text-secondary leading-5">{t(label)}</div>
          <div className="flex items-center justify-end gap-2">
            <div className="text-sm font-medium text-text-primary leading-5">
              {new BigNumber(quantity || 0).toFixed()} {token}
            </div>
            <Image
              src={getSymbolUrl(token)}
              alt={token}
              width={16}
              height={16}
              loader={({ src }) => src}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ConfirmSwapModal: React.FC<ConfirmSwapModalProps> = ({
  swapQuote,
  countdown,
  cycleNum,
  open,
  close,
  update,
  complete
}) => {
  const t = useFm();

  const [loading, setLoading] = useState(false);
   const [isSwapComplete, setIsSwapComplete] = useState<boolean>(false);
  const [quote, setQuote] = useState<ISymbolSwapQuoteInfo | undefined>(swapQuote);

  const executeSwap = useCallback(async () => {
    if (!quote?.swap_id) return;
    try {
      setLoading(true);
      const response = await getSymbolSwap({ swap_id: quote.swap_id });
      setQuote(response);
      setIsSwapComplete(response?.swap_status === SwapStatusEnum.SUCCESS);
      return response;
    } catch (error) {
      message.error(t(error?.response?.data?.code));
    } finally {
      setLoading(false);
    }
  }, [quote?.swap_id, t]);


  const buttonText =
    countdown > 0 ? `${t('confirm')}(${countdown}s)` : t('refresh-rate');

  const handleConfirm = async () => {
    if (loading) return;
    if (countdown > 0) {
      const res = await executeSwap();
      if (res?.swap_status === SwapStatusEnum.SUCCESS) {
        complete();
      }
    } else {
      update()
    }
  };
  const handleComplete = () => {
    setQuote(null);
    close();
  };

  useEffect(() => {
    setQuote(swapQuote)
  }, [swapQuote]);

  useEffect(() => {
    setIsSwapComplete(false)
  }, [open]);

  return (
    <Modal
      open={open}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={430}
      footer={null}
    >
      <div className="w-full">


        {
          !isSwapComplete &&
          <div className="w-full flex items-center justify-between">
            <h1 className="text-text-primary text-base font-semibold">
              {t('confirm-convert')}
            </h1>
            <div className="cursor-pointer" onClick={close}>
              <CloseIcon />
            </div>
          </div>
        }


        <div className={`w-full flex flex-col justify-center items-center gap-2  mb-3 ${isSwapComplete ? 'mt-0' : 'mt-6'}`}>
          {isSwapComplete ? (
            <SwapSuccess quote={quote} />
          ) : (
            <SwapPreview quote={quote} />
          )}

          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-text-secondary leading-5">
              {t('rate')}
            </div>
            <div className="text-sm font-medium text-text-primary leading-5">
              1 {quote?.from_token} ≈ {new BigNumber(quote?.swap_rate || 0).toFixed()} {quote?.to_token}
            </div>
          </div>

          {!isSwapComplete && (
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-text-secondary leading-5">
                {t('pay-method')}
              </div>
              <div className="text-sm font-medium text-text-primary leading-5">
                {t('spot-acc')}
              </div>
            </div>
          )}

          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-text-secondary leading-5">
              {t('fees')}
            </div>
            <div className="text-sm text-text-primary leading-5">
              <span className="p-1 text-text-black text-[9px] font-medium bg-text-brand-default rounded-sm">
                {new BigNumber(quote?.symbol_swap_fee_rate || 0).toFixed()} {t('fees')}
              </span>
            </div>
          </div>

          {isSwapComplete && (
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-text-secondary leading-5">
                {t('time')}
              </div>
              <div className="text-sm font-medium text-text-primary leading-5">
                {dayjs(String(quote?.time).length > 10 ? quote?.time : quote?.time * 1000).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
          )}
        </div>
        {!isSwapComplete ? (
          <button
            onClick={handleConfirm}
            className={`w-full h-12 btn-primary mt-6 flex items-center justify-center gap-2 ${loading ? 'btn-primary-disabled text-text-quaternary!' : ''}`}
            disabled={loading}
          >
            {buttonText}
          </button>
        ) : (
          <div className="w-full flex justify-between items-center gap-2 mt-6">
            <button
              className="w-full h-10 btn-tertiary text-sm! rounded-lg!"
              onClick={handleComplete}
            >
              {t('confirm')}
            </button>
            <button
              className="w-full h-10 btn-primary text-sm! rounded-lg!"
              onClick={() => goPage('convertOrder')}
            >
              {t('exchange-records')}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmSwapModal;
