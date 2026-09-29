import { USER_SETTINGS } from 'common/packages-biz/global-settings';
import { getAbResult } from 'common/utils/monitor/abTest';
import { useGlobalState } from '@/store';

const useUserStore = () => {
  const [state] = useGlobalState();
  const { coin, symbolFullName } = state;
  const {
    info = {},
    orderCoinType,
    walletCoin,
    language,
    wallet, // src/betterbitapps/forward/desktop/store/user.store.js
    abTestResult,
    bookSymbolSetStatus,
  } = state?.user;
  const { double_confirm = '', profileApiLoaded } = info; // eslint-disable-line
  const loggedIn = info?.id > 0;
  const list = double_confirm.split(',');
  const curOrderCoinType = orderCoinType?.[symbolFullName];
  return {
    profileApiLoaded,
    orderCoinTypeValue: curOrderCoinType,
    loggedIn,
    language,
    wallet,

    bookSymbolSetStatus,
    needPreCreate: list?.includes(USER_SETTINGS.ORDER_CONFIRM),
    needObAnimation: loggedIn && list?.includes(USER_SETTINGS.OB_ANIMATION),
    cancelAllConfirm:
      loggedIn && list?.includes(USER_SETTINGS.CANCEL_ALL_CONFIRM),
    doubleConfirm: double_confirm,
    playSuccessAudio: loggedIn && list?.includes(USER_SETTINGS.SUCCESS_AUDIO),
    walletCoinWallet: wallet?.[walletCoin] || {},
    coinWallet: wallet?.[coin] || {},
    abResult: getAbResult(info?.id, walletCoin, abTestResult),
  };
};

export default useUserStore;
