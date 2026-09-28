import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TIME_IN_FORCE } from 'common/packages-biz/global-settings/usdt-settings';

const useTimeInForce = () => {
  const [t] = useTranslation();

  return useMemo(
    () => [
      { value: TIME_IN_FORCE.GOOD_TILL_CANCEL, label: t('GTC') },
      { value: TIME_IN_FORCE.IMMEDIATE_OR_CANCEL, label: t('IOC') },
      { value: TIME_IN_FORCE.FILL_OR_KILL, label: t('FOK') },
    ],
    [t],
  );
};

export default useTimeInForce;
