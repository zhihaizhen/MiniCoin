import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { POSITION_ORDER_MODE } from 'common/packages-biz/global-settings';

const usePositionOrderMode = () => {
  const [t] = useTranslation();
  return useMemo(
    () => [
      { value: POSITION_ORDER_MODE.MERGE, label: t('merge') },
      { value: POSITION_ORDER_MODE.SPLIT, label: t('split') },
    ],
    [t],
  );
};

export default usePositionOrderMode;
