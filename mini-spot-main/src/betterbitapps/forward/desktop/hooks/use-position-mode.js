import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { POSITION_MODE } from 'common/packages-biz/global-settings';
import { isDex } from '../../../common/utils/env';

const usePositionMode = () => {
  const [t] = useTranslation();
  return useMemo(
    () => [
      { value: POSITION_MODE.CROSS, label: t('cross') },
      { value: POSITION_MODE.ISOLATE, label: t('isolated') },
    ],
    [t],
  );
};

export default usePositionMode;
