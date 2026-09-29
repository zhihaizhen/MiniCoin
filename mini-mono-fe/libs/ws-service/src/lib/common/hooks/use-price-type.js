import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PRICE_TYPE } from '../constants/reverseTypes';

const usePriceType = () => {
  const [t] = useTranslation();

  return useMemo(
    () => [
      { value: PRICE_TYPE.MARKET, label: t('last') },
      { value: PRICE_TYPE.INDEX, label: t('index') },
      { value: PRICE_TYPE.MARK, label: t('mark') }
    ],
    [t]
  );
};

export default usePriceType;
