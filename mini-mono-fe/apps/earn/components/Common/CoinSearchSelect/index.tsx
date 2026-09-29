import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as SearchIcon } from '~/public/images/search.svg';
import { getQuoteTokens } from '~/api';

interface Props {
  onChange: (value: string) => void;
  className?: string;
}

const CoinSearchSelect: React.FC<Props> = ({ onChange, className = 'w-full md:w-[220px] h-10' }) => {
  const t = useFm();
  const [coinOptions, setCoinOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchCoinOptions = async () => {
      const res = await getQuoteTokens();
      const symbols = res?.[0]?.quoteTokenSymbols;
      if (!Array.isArray(symbols)) return;
      const uniqueNames = Array.from(
        new Set<string>(symbols.flatMap((item) => [item.quoteTokenName, item.baseTokenName]))
      );
      setCoinOptions(uniqueNames.map((name) => ({ label: name, value: name })));
    };

    void fetchCoinOptions();
  }, []);

  return (
    <Select
      className={className}
      size="large"
      showSearch
      prefix={<SearchIcon className="text-[#A0A3A7]" />}
      suffixIcon={null}
      allowClear
      placeholder={t('search-by-icon')}
      options={coinOptions}
      onChange={(value?: string) => onChange(value ?? '')}
    />
  );
};

export default CoinSearchSelect;
