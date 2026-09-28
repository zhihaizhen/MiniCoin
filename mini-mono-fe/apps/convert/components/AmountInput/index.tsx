import Image from 'next/image';
import React, { ChangeEvent } from 'react';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { ReactComponent as AddIcon } from '~/public/images/add.svg';
import { ReactComponent as SelectSuffixIcon } from '~/public/images/select-suffix.svg';
import { toThousandsNumberNoZero } from '~/utils';

interface AmountInputProps {
  label: string;
  coin: string;
  amount: string;
  placeholder: string;
  validStr: string;
  showBalance?: boolean;
  balance?: string;
  loading?: boolean;
  onAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCoinClick?: () => void;
  onAddAssets?: () => void;
  onMaxBalance?: () => void;
  t: (key: string) => string;
  showDropDown?: boolean;
  active: boolean
}

const AmountInput: React.FC<AmountInputProps> = React.memo(
  ({
    label,
    coin,
    amount,
    active,
    placeholder,
    validStr,
    showBalance,
    balance = '0',
    loading,
    onAmountChange,
    onCoinClick,
    onAddAssets,
    onMaxBalance,
    showDropDown,
    t
  }) => (
    <div className={`relative w-full h-[120px] flex justify-between items-center bg-fill-input rounded-2xl py-6 px-4 border hover:border-line-border-hover ${active && amount ? 'border-line-border-hover':'border-fill-input'}`}>
      <div className="h-full flex flex-col justify-center gap-4 text-text-primary">
        <div className="text-sm">{label}</div>
        {loading ? (
          <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse" />
        ) : (
          <div
            className="h-6 flex justify-start items-center gap-2 cursor-pointer"
            onClick={onCoinClick}
          >
            <Image
              src={getSymbolUrl(coin)}
              alt={coin}
              width={32}
              height={32}
              loader={({ src }) => src}
            />
            <div className="flex justify-start items-center gap-1">
               <strong className="text-base font-semibold">{coin}</strong>
              {showDropDown ? <div className="rotate-180"><SelectSuffixIcon /></div> : <SelectSuffixIcon />}
            </div>
          </div>
        )}
      </div>
      <div className="h-full flex-1 flex flex-col justify-end items-end">
        {showBalance && (
          <div className="flex justify-end items-center text-xs text-text-primary gap-1">
            <div>
              <span className="text-text-secondary">{t('available')}</span>
              <span className="text-text-secondary font-medium">
                {toThousandsNumberNoZero(balance, 8)}
              </span>
            </div>
            <AddIcon className="cursor-pointer" onClick={onAddAssets} />
            {Number(balance) > 0 && (
              <div
                className="text-text-brand-default-web text-xs leading-5 cursor-pointer"
                onClick={onMaxBalance}
              >
                {t('max')}
              </div>
            )}
          </div>
        )}
        <input
          value={amount}
          className="outline-none focus:outline-none w-full h-10 pl-3 bg-transparent text-text-primary text-right text-xl font-bold placeholder:text-text-tertiary"
          type="text"
          placeholder={placeholder}
          onChange={onAmountChange}
        />
        <div className="absolute bottom-[5px] text-text-red text-xs leading-5">
          {validStr}
        </div>
      </div>
    </div>
  )
);

AmountInput.displayName = 'AmountInput';

export default AmountInput;
