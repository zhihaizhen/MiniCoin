import { USER_SETTINGS } from '../common/packages-biz/by-global-settings';
import { getAbResult } from '../common/utils/util';
import { useGlobalState } from '../store';

const useUserStore = () => {
  const [state] = useGlobalState();
  const { baseCoin } = state;
  const {
    info = {},
    language,
    wallet,
    riskLimit,
    abTestResult,
    bookSymbolSetStatus,
    copyTrading
  } = state?.user;
  const { double_confirm = '', profileApiLoaded } = info; // eslint-disable-line

  const loggedIn = info?.id > 0;
  return {
    profileApiLoaded,
    loggedIn,
    language,
    wallet,
    bookSymbolSetStatus,
    riskLimit,
    needPreCreate: double_confirm.indexOf(USER_SETTINGS.ORDER_CONFIRM) > -1,
    needObAnimation:
      loggedIn && double_confirm.indexOf(USER_SETTINGS.OB_ANIMATION) > -1,
    cancelAllConfirm:
      loggedIn && double_confirm.indexOf(USER_SETTINGS.CANCEL_ALL_CONFIRM) > -1,
    doubleConfirm: double_confirm,
    successAudio:
      loggedIn && double_confirm.indexOf(USER_SETTINGS.SUCCESS_AUDIO) > -1,
    baseCoinWallet: wallet?.[baseCoin] || {},
    abResult: getAbResult(info?.id, baseCoin, abTestResult),
    isCopyTradingLeader: info?.is_copy_trading_leader,
    copyTradingInfo: copyTrading
  };
};

export default useUserStore;
