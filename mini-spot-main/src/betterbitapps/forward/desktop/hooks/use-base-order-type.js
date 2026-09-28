import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ORDER_TYPE } from 'common/packages-biz/global-settings/usdt-settings';

const useBaseOrderType = () => {
  const [t] = useTranslation();

  return useMemo(
    () => [
      { value: ORDER_TYPE.LIMIT, label: t('limitOrder') },
      { value: ORDER_TYPE.MARKET, label: t('marketOrder') },
    ],
    [t],
  );
};

export default useBaseOrderType;
