import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { Input } from 'antd';
import { ReactComponent as SearchIcon } from '~/public/images/search.svg';
import Image from 'next/image';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { ISymbolSwapConfig } from '~/interface';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { toThousandsNumberNoZero } from '~/utils';

export interface Option {
  token: string;
  balance: string;
  balanceInFiat: string;
  balanceInUsd: string;
  selected: boolean;
  config: ISymbolSwapConfig;
}

interface Iprops {
  visible: boolean;
  optionsList: Option[];
  className?: string;
  onClose: () => void;
  onSelect: (config: ISymbolSwapConfig) => void;
}

const CoinSelectDropDown = ({
  visible,
  optionsList,
  onClose,
  onSelect,
  className
}: Iprops) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) return optionsList;

    const searchLower = searchValue.toLowerCase();
    return optionsList.filter((item) =>
      item.token.toLowerCase().includes(searchLower)
    );
  }, [optionsList, searchValue]);

  const handleSelect = (config: ISymbolSwapConfig) => {
    onSelect(config);
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-10 top-45 w-[476px] max-h-[366px] p-4 flex flex-col gap-4 rounded-xl
      border border-[#EBEBEB] bg-white shadow-[0_4px_4.6px_0_rgba(0,0,0,0.10)] origin-top animate-[dropdown-enter_200ms_ease-out] ${className}`}
    >
      <Input
        placeholder={t('search')}
        prefix={<SearchIcon />}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <div className="overflow-y-scroll">
        {filteredOptions.map((item) => (
          <div
            key={item.token}
            onClick={() => handleSelect(item.config)}
            className={`w-full h-12 group flex justify-between items-center cursor-pointer hover:bg-bg-secondary px-2 py-4 rounded-lg`}
          >
            <div className="flex items-center justify-start gap-2">
              <Image
                src={getSymbolUrl(item.token)}
                alt={' '}
                width={20}
                height={20}
                loader={({ src }) => src}
              />
              <span className="text-sm text-text-primary font-medium">
                {item.token}
              </span>
            </div>
            {isLogin && (
              <div className="flex flex-col items-end justify-center">
                <div className="text-xs text-text-primary font-medium">
                  {+item.balance === 0 ? '0.00' : toThousandsNumberNoZero(item.balance, 15)}
                </div>
                <div className="text-xs text-text-secondary font-medium">
                  ≈ {item.balanceInFiat}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinSelectDropDown;
