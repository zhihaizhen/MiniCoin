import { initGlobalWidget } from '@better-bit-fe/global-widget';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { parseUrl, Env } from '@region-lib/env';
import { http } from '@better-bit-fe/base-utils';
import { isMobile } from '@better-bit-fe/base-utils';
import { truncateSync } from 'fs';

const apiHost = Env.API_HOST;

const useGlobalWidget = () => {
  // 根据ua判断是否是app内的h5
  // const isAppWebview = () => {
  //   if (typeof navigator === 'undefined') return false;
  //   const ua = navigator.userAgent;
  //   return /bit_app/i.test(ua);
  // };

  const { componentHeader, componentFooter } = initGlobalWidget({
    hideFooter: false,
    hideHeader: false
  });
  const { setUserInfo, userInfo } = useUserInfo();

  // 切换多语言
  const onLanguageChangeCallBack = (val) => {
    let newUrl;
    const langReg = /([a-z]{2}-[A-Z]{2})/;
    if (langReg.test(location.href)) {
      newUrl = location.href.replace(langReg, val);
    } else {
      newUrl = `${location.origin}/${val}${location.pathname}${location.search}`;
    }
    location.href = newUrl;
    localStorage.setItem('LANG_KEY', val);
  };
  // @ts-ignore
  const logout = async () => http.post(`${apiHost}/logout`); //退出登录
  const handleLogout = () => {
    logout();
    setUserInfo(); //重置用户信息
  };

  componentHeader?.then((res) => {
    const {
      user,
      loginChecked,
      setLang,
      assets,
      currencyInfo,
      showConnectDialog,
      showDepositDialog,
      showWithdrawDialog,
      onBeforeLanguageChange,
      onLanguageChange,
      onLogin,
      onLoginChecked,
      onUserChange,
      onLogout,
      onAssetChange,
      onCurrencyChange,
      onDexInfoChange
    } = res;

    onLanguageChange((lang) => {
      onLanguageChangeCallBack(lang);
    });
    onLogout(() => {
      handleLogout();
      window.location.reload();
    });
  });

  componentFooter?.then((res) => {
    console.log('Footer Rendered');
  });
};

export default useGlobalWidget;
