import { isApp, getLang } from '@better-bit-fe/base-utils';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';


const APP_PAGE_ID_MAP: Record<string, string> = {
  home: 'niucoin://home',
  login: 'loginpage',
  register: 'register',
  trade: 'niucoin://contract?symbol=', //BTCUSDT
  blockTrade: 'easicoin://contract?type=blockTrade', //大宗交易
  spot: 'niucoin://spot?symbol=', //BTCUSDT
  download: 'downloadApp', // 用不到
  deposit: 'niucoin://deposit',
  withdrawal: 'niucoin://withdraw', // 未待确认
  transfer: 'niucoin://transfer?coin=USDT&from=FUNDING&to=TRADING',
  assetsHistory: 'niucoin://finance/distribute',
  tradeHistory: 'contract_fund_record',
  financeAcc:
    'niucoin://subscription_detail?coin=COIN&productType=PRODUCT_TYPE&productTag=PRODUCT_TAG',
  financeOrder: 'niucoin://finance/distribute', // 未用到待确认
  convertOrder: 'niucoin://finance/distribute', // 未用到待确认
  loan: 'niucoin://todo', // 未用到待确认
  loanMaterial: 'niucoin://todo', // 未用到待确认
  loanBorrowHistory: 'niucoin://todo', // 未用到待确认
  loanRepayHistory: 'niucoin://todo', // 未用到待确认
  loanLtvAdjustHistory: 'niucoin://todo', // 未用到待确认
  loanPersonal: 'niucoin://todo', // 未用到待确认
  academy: 'academy/' // 未用到待确认
};

const WEB_PAGE_PATH_MAP: Record<string, string> = {
  home: '/',
  login: 'account/login',
  register: 'account/register',
  trade: 'trade/usdt/', //BTCUSDT
  blockTrade: 'tradfi/XAUUSD',
  spot: 'spot/exchange/', //BTC/USDT
  download: 'downloadApp',
  deposit: 'assets/deposit',
  withdrawal: 'assets/withdrawal',
  transfer: 'assets/spot-account?from=financePage',
  assetsHistory: 'assets/history/funding-transaction',
  tradeHistory: 'assets/history/trading-transaction',
  financeAcc: 'assets/earn-account',
  financeOrder: 'assets/history/earn-order',
  convertOrder: 'assets/history/convert-order',
  loan: 'earn/loan',
  loanMaterial: 'earn/loan/material',
  loanBorrowHistory: 'assets/history/loan-borrow-history',
  loanRepayHistory: 'assets/history/loan-repay-history',
  loanLtvAdjustHistory: 'assets/history/loan-ltv-adjust-history',
  loanPersonal: 'earn/loan/personal',
  academy: 'academy/'
};

/**
 * 页面跳转，兼容 App 内部跳转与 Web 跳转
 */
export const goPage = (pageId: string, params?: string) => {
  if (typeof window === 'undefined') return;

  const lang = getLang();
  let defaultParams = params;
  if (['trade', 'spot'].includes(pageId) && !params) {
    defaultParams = 'BTC/USDT';
  }

  if (isApp()) {
    let appPath = APP_PAGE_ID_MAP[pageId];
    if (['trade', 'spot'].includes(pageId) && defaultParams) {
      const formattedParams = defaultParams.replace('/', '');
      appPath = `${appPath}${formattedParams}`;
    } else if (defaultParams) {
      appPath = `${appPath}${appPath?.includes('?') ? '&' : '?'}${defaultParams}`;
    }

    if (appPath) {
      handleGoAppPage(appPath, '');
    }
    return;
  }

  let path = WEB_PAGE_PATH_MAP[pageId];
  if (pageId === 'trade' && defaultParams) {
    path = `${path}${defaultParams.replace('/', '')}`;
  } else if (pageId === 'spot' && defaultParams) {
    path = `${path}${defaultParams}`;
  } else if (defaultParams) {
    path = `${path}${path?.includes('?') ? '&' : '?'}${defaultParams}`;
  }

  if (!path) return;

  // 处理需要携带返回地址的特殊页面
  if (pageId === 'login' || pageId === 'register') {
    try {
      const returnPageParam = window.btoa(window.location.href);
      path += `${path.includes('?') ? '&' : '?'}return_page=${returnPageParam}`;
    } catch (e) {
      console.error('Failed to encode return_page', e);
    }
  }

  window.location.href = `${window.location.origin}/${lang}/${path}`;
};
