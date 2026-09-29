import React, { ChangeEvent } from 'react';
import { Input } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import Image from 'next/image';

interface AmountInputProps {
  coin: string;
  balance: string;
  amount: string;
  onAmountChange: (value: string) => void;
  onMaxClick: () => void;
  onAddClick: () => void;
  status: '' | 'warning' | 'error';
  errorMsg?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  coin,
  balance,
  amount,
  onAmountChange,
  onMaxClick,
  onAddClick,
  status,
  errorMsg
}) => {
  const t = useFm();

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-2">
        <div className="text-text-primary font-bold">
          {t('stakeAmount', '质押金额')}
        </div>
        <div className="text-text-secondary text-sm flex items-center gap-2">
          <span>{t('available', '可用')} {balance} {coin}</span>
          <div className="w-5 h-5 cursor-pointer" onClick={onAddClick}>
             <Image src="/images/add.svg" alt="add" width={20} height={20} loader={({src}) => src} />
          </div>
        </div>
      </div>
      <div className="relative group">
        <Input
          placeholder={t('inputAmount', '请输入金额')}
          value={amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onAmountChange(e.target.value)}
          status={status}
          className="h-14 bg-bg-secondary border-none rounded-xl text-lg font-medium pr-24 hover:bg-fill-fill-hover-1 focus:bg-bg-secondary"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <span className="text-text-primary font-bold">{coin}</span>
          <div className="w-px h-4 bg-line-divider-primary"></div>
          <button
            className="text-text-brand-default font-bold hover:opacity-80"
            onClick={onMaxClick}
          >
            {t('max', '最大')}
          </button>
        </div>
      </div>
      {errorMsg && (
        <div className="text-text-error text-xs mt-2">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default AmountInput;
