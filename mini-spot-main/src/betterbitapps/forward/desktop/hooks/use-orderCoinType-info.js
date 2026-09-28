import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@/store';

const useOrderCoinTypeInfo = (type, positionSymbol) => {
  const [t] = useTranslation();
  const [globalState] = useGlobalState();
  const {
    symbolFullName,
    coin,
    walletCoin,
    walletCoinOrderFraction,
    lotFraction, // 当前币种的小数位 如2
    lotSize, // 当前币种的最小值 如 0.01
    user: { orderCoinType },
  } = globalState;

  const infos = useMemo(() => {
    const val = orderCoinType?.[symbolFullName];
    const unitTick = lotSize; // 小数精度
    // 默认数量下单
    let key = 'openType-qty';
    let unitFraction = lotFraction; // 精度即保留的小数位
    let unit = coin;
    let isWalletCoinMode = false; // 价值下单，
    if (val === walletCoin) {
      key = 'openType-usdt';
      unitFraction = walletCoinOrderFraction;
      unit = walletCoin;
      isWalletCoinMode = true;
    }
    return {
      qtyInputPH: key,
      unitFraction,
      unitTick,
      unit,
      isWalletCoinMode,
    };
  }, [orderCoinType, type, symbolFullName]);
  return infos;
};

export default useOrderCoinTypeInfo;
