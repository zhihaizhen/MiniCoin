import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PRICE_TYPE } from 'common/packages-biz/global-settings/usdt-settings';

const usePriceType = () => {
  const [t] = useTranslation();

  return useMemo(
    () => [
      { value: PRICE_TYPE.MARKET, label: t('marketPrice') }, // 最新成交价=市场价格
      { value: PRICE_TYPE.MARK, label: t('markPrice') }, // 标记价格
    ],
    [t],
  );
};

export default usePriceType;
