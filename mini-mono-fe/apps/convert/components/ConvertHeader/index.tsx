import React from 'react';

interface ConvertHeaderProps {
  t: (key: string, options?: any) => string;
  fromCoin: string;
  toCoin: string;
}

const ConvertHeader: React.FC<ConvertHeaderProps> = React.memo(({ t, fromCoin, toCoin }) => (
  <div className="flex-1 max-w-[600px] text-text-primary">
    <h1 className="text-[36px] md:text-[48px] font-bold leading-16 text-center md:text-left">
      {t('convert-tip', { fromCoin, toCoin })}
    </h1>
    <div className="text-xl font-medium leading-6 mt-4">
      {t('tip-convert')}
    </div>
  </div>
));

export default ConvertHeader;
