import { useEffect, useRef } from 'react';
import { initGlobalWidget } from '@better-bit-fe/global-widget';
import { useUserInfo } from '@better-bit-fe/base-provider';

export const useGlobalWidget = (options?: {
  returnPageUrl?: string;
  isHideHeader?: boolean;
  isHideFooter?: boolean;
  footerType?: 'small' | 'large' | 'none';
  footerProps?: Record<string, unknown>;
  handleLogin?: (newInfo?: any) => void;
}) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const initializedRef = useRef(false);

  const { setUserInfo } = useUserInfo();

  // 切换多语言
  const onLanguageChangeCallBack = (val) => {
    let newUrl: string;
    const langReg = /([a-z]{2}-[A-Z]{2})/;
    if (langReg.test(window?.location?.href)) {
      newUrl = window?.location.href.replace(langReg, val);
    } else {
      newUrl = `${window?.location.origin}/${val}${window?.location.pathname}${window?.location.search}`;
    }
    window.location.href = newUrl;
    localStorage.setItem('LANG_KEY', val);
  };

  const handleLogout = () => {
    setUserInfo();
  };

  const handleLogin = (newInfo?: any) => {
    optionsRef.current?.handleLogin?.(newInfo);
  };

  useEffect(() => {
    // 避免组件重复 render 时重复注册事件
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 只在客户端初始化；不要依赖 SSR 阶段的 isApp() 结果
    const footerType = optionsRef.current?.footerType ?? 'large';

    const { componentHeader, componentFooter } = initGlobalWidget({
      type: footerType,
      footerProps: optionsRef.current?.footerProps
    });

    componentHeader.then((res) => {
      // header 创建完成后再隐藏，避免异步创建导致第一次找不到 DOM
      if (optionsRef.current?.isHideHeader) {
        const header = document?.getElementById('widget_header');
        if (header) header.style.display = 'none';
      }

      const {
        loginChecked,
        onLanguageChange,
        onLogin,
        onUserChange,
        onLogout,
        setReturnPage,
        goLoginPage
      } = res;

      const maybeSetReturnPage = () => {
        const url = optionsRef.current?.returnPageUrl;
        if (url) setReturnPage(url);
      };

      // 首次进入如果已登录，同步一次登录态回调
      setTimeout(() => {
        if (loginChecked.value) {
          handleLogin();
        }
      }, 0);

      maybeSetReturnPage();

      onLanguageChange((lang) => {
        onLanguageChangeCallBack(lang);
      });

      onLogout(() => {
        handleLogout();
        goLoginPage();
      });

      onLogin((val, originVal) => {
        if (originVal) {
          handleLogin(originVal);
          setUserInfo(originVal);
        }
        // 跳转到下载页面
        maybeSetReturnPage();
      });

      onUserChange((val) => {
        if (val) {
          handleLogin();
        }
      });
    });

    componentFooter.then(() => {
      if (optionsRef.current?.isHideFooter) {
        const footer = document?.getElementById('widget_footer');
        if (footer) footer.style.display = 'none';
      }
    });
  }, [setUserInfo]);
};
