import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Input } from 'antd';
import { ReactComponent as SearchIcon } from '~/public/images/search.svg';
import Image from 'next/image';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { BorrowCoinConfig, PledgeCoinConfig } from '~/interface';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CheckIcon } from '~/public/images/check.svg';

type Option = BorrowCoinConfig | PledgeCoinConfig;

interface Iprops {
  visible: boolean;
  optionsList: Option[];
  selectedCoin?: string
  className?: string;
  onClose: () => void;
  onSelect: (coinfig) => void;
}

const CoinSelectDropDown = ({
  visible,
  optionsList,
  selectedCoin,
  onClose,
  onSelect,
  className
}: Iprops) => {
  const t = useFm();
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
      item.coin.toLowerCase().includes(searchLower)
    );
  }, [optionsList, searchValue]);

  const handleSelect = (config) => {
    onSelect(config);
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-10 top-14 w-[392px] max-h-[366px] p-4 flex flex-col gap-4 rounded-xl
      border border-[#EBEBEB] bg-white shadow-[0_4px_4.6px_0_rgba(0,0,0,0.10)] origin-top animate-[dropdown-enter_200ms_ease-out] ${className}`}
    >
      <Input
        className={'w-full h-10 border border-line-border-default! rounded-lg px-4'}
        placeholder={t('allCoins')}
        suffix={<SearchIcon />}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <div className="overflow-y-scroll">
        {filteredOptions.map((item) => (
          <div
            key={item.coin}
            onClick={() => handleSelect(item)}
            className={`w-full h-12 group flex justify-between items-center cursor-pointer hover:bg-bg-secondary px-2 py-4 rounded-lg ${selectedCoin === item.coin ? 'bg-bg-secondary' : ''}`}
          >
            <div className="flex items-center justify-start gap-2">
              <Image
                src={getSymbolUrl(item.coin)}
                alt={' '}
                width={20}
                height={20}
                loader={({ src }) => src}
              />
              <span className="text-sm text-text-primary font-medium">
                {item.coin}
              </span>
            </div>
            {selectedCoin === item.coin && (
              <CheckIcon />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinSelectDropDown;
