import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
// import {
//   fetchUserInfoJsBridge,
//   getIsAppSupportJsBridge,
//   navigateLoginJsBridge,
//   navigateRegisterJsBridge
// } from '@better-bit-fe/app-bridge';
import { isApp } from '@better-bit-fe/base-utils';
import { jsBridgeLogin, jsBridgeRegister } from './gtm';
import { configLang } from './config';
import { Spin } from 'antd';
// import './index.less';

interface ModalOptions {
  regEmail?: string;
  showReg?: boolean;
  regPhone?: string;
}

interface ILoginRegisterAppParams {
  regEmail?: string;
  regPhone?: string;
  disableSwitch?: boolean;
  preAction?: boolean;
}

const updateParam = (param: string, paramName: string, originalSrc: string) => {
  let iframeSrc = originalSrc;
  if (param) {
    const encodedData = encodeURIComponent(param);
    if (iframeSrc.includes(`${paramName}=`)) {
      const splitUrl = iframeSrc.split(`${paramName}=`);
      const isNotLast = splitUrl.length > 1 && splitUrl[1].includes('&');
      const currentRegex = new RegExp(
        isNotLast ? `${paramName}.*.&` : `${paramName}.*`
      );
      iframeSrc = iframeSrc.replace(
        currentRegex,
        `${paramName}=${encodedData}${isNotLast ? '&' : ''}`
      );
    } else {
      iframeSrc = iframeSrc.concat(
        `${iframeSrc.includes('?') ? '&' : '?'}${paramName}=${encodedData}`
      );
    }
  } else {
    if (iframeSrc.includes(`${paramName}=`)) {
      const splitUrl = iframeSrc.split(`${paramName}=`);
      const isNotLast = splitUrl.length > 1 && splitUrl[1].includes('&');
      const currentRegex = new RegExp(
        isNotLast ? `${paramName}.*.&` : `&${paramName}.*`
      );
      iframeSrc = iframeSrc.replace(currentRegex, '');
    }
  }
  return iframeSrc;
};

export const QuickLoginContext = React.createContext({
  openModel: (options?) => {
    return;
  },
  closeModel: () => {
    return;
  },
  loginSuccess: false,
  registerSuccess: false,
  loginClose: false,
  registerClose: false
});
QuickLoginContext.displayName = 'QuickLoginContext';

export const QuickLoginProvider = ({
  children,
  locale,
  defaultQuery = {} as any,
  disableSwitch = false,
  preAction = false,
  useJsBridgeInApp = false
}) => {
  const modalRef = useRef(null);
  const iframeRef = useRef(null);
  const [showRegState, setShowRegState] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [isAppSupportJsBridge, setAppSupportJsBridge] = useState(false);

  const navigateJsBridgeRef = useRef(false); // 防止 multi-click 打开多个登录注册窗口
  const closeModel = () => {
    const dom = modalRef.current;
    dom.style.visibility = 'hidden';
  };
  const openModelWeb = (options?: ModalOptions) => {
    const iframe = iframeRef.current;
    if (!iframe) {
      console.error(`quick-login: iframe load fail`);
      return;
    }

    let iframeSrc = initIframe();
    const { regEmail, showReg, regPhone } = options || {};

    iframeSrc = updateParam(regEmail, 'regEmail', iframeSrc);
    iframeSrc = updateParam(regPhone, 'regPhone', iframeSrc);

    if (showReg) {
      if (!iframeSrc.includes('showReg=1')) {
        iframeSrc = iframeSrc.concat(
          `${iframeSrc.includes('?') ? '&' : '?'}showReg=1`
        );
      }
      setShowRegState(true);
    } else {
      if (iframeSrc.includes('showReg=1')) {
        iframeSrc = iframeSrc.replace(
          iframeSrc.includes('&showReg=1') ? '&showReg=1' : 'showReg=1',
          ''
        );
      }
    }

    iframe.src = iframeSrc;
    const dom = modalRef.current;
    dom.style.visibility = 'visible';

    // Reset status
    setTimeout(() => {
      setIframeLoading(false);
    }, 500);
    setLoginClose(false);
    setRegisterClose(false);
  };

  const openModelApp = (options?: ModalOptions) => {
    const isRegister = options?.showReg;

    if (navigateJsBridgeRef.current) {
      return;
    }

    const params: ILoginRegisterAppParams = {};
    if (isRegister) {
      if (options?.regEmail) {
        params.regEmail = options.regEmail;
      }
      if (options?.regPhone) {
        params.regPhone = options.regPhone;
      }
    }
    if (preAction) {
      params.preAction = true;
    }
    if (disableSwitch) {
      params.disableSwitch = true;
    }

    const errorCallback = () => {
      navigateJsBridgeRef.current = false;
      openModelWeb(options);
    };

    // 当 navigate login / register 返回之后，不确定是否 login/register 成功，需要再次调用 fetchUserInfo，如果返回有值，则表示成功
    const loginRegisterSuccessCallback = () => {
      // fetchUserInfoJsBridge({
      //   successCallback: (res) => {
      //     if (res?.code === 0) {
      //       const token = res.params?.userToken;
      //       if (typeof token !== 'undefined' && token !== null) {
      //         isRegister ? setRegisterSuccess(true) : setLoginSuccess(true);
      //       }
      //     }
      //   }
      // });
    };

    navigateJsBridgeRef.current = true;
    if (isRegister) {
      // navigateRegisterJsBridge({
      //   params,
      //   successCallback: (res) => {
      //     navigateJsBridgeRef.current = false;
      //     if (res?.code === 0) {
      //       loginRegisterSuccessCallback();
      //     }
      //   },
      //   errorCallback
      // });
    } else {
      // navigateLoginJsBridge({
      //   params,
      //   successCallback: (res) => {
      //     navigateJsBridgeRef.current = false;
      //     if (res?.code === 0) {
      //       loginRegisterSuccessCallback();
      //     }
      //   },
      //   errorCallback
      // });
    }
  };

  const openModel = useCallback(
    (options?: ModalOptions) => {
      if (isApp() && useJsBridgeInApp && isAppSupportJsBridge) {
        openModelApp(options);
      } else {
        // Render iframe
        if (!firstLoaded) {
          setFirstLoaded(true);
        }
        // Open model (delay to open for wait dom ready)
        setIframeLoading(true);
        setTimeout(() => {
          openModelWeb(options);
        }, 50);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAppSupportJsBridge]
  );

  // useEffect(() => {
  //   getIsAppSupportJsBridge({
  //     successCallback: (res) => {
  //       const isAppSupportJsBridge = res?.params?.isAppSupportJsBridge;
  //       setAppSupportJsBridge(isAppSupportJsBridge);
  //     }
  //   });
  // }, []);

  const adaptSpecialChar = () => {
    const { href } = window.location;
    const formatSearch = href.includes('?') ? `?${href.split('?')[1]}` : '';
    return formatSearch;
  };

  const initIframe = () => {
    // const { search } = window.location;
    const search = adaptSpecialChar();
    console.log('[debug quick login] search foramt: ', search);

    let queryParams = search || '';
    queryParams = `?ts=${Date.now()}&${queryParams.replace('?', '')}`; // @todo: optimize

    if (!search.includes('medium') && defaultQuery?.medium) {
      queryParams = queryParams.concat(
        `${queryParams.includes('?') ? '&' : '?'}medium=${defaultQuery?.medium}`
      );
    }
    if (!search.includes('source') && defaultQuery?.source) {
      queryParams = queryParams.concat(
        `${queryParams.includes('?') ? '&' : '?'}source=${defaultQuery?.source}`
      );
    }
    // Disable to switch login / register
    if (disableSwitch) {
      queryParams = queryParams.concat(
        `${queryParams.includes('?') ? '&' : '?'}disableSwitch=1`
      );
    }
    // Execute the following steps of user guidance flow after register successfully
    if (preAction) {
      queryParams = queryParams.concat(
        `${queryParams.includes('?') ? '&' : '?'}preAction=1`
      );
    }

    console.log(
      '[debug quick login] final url: ',
      `${configLang(window, locale).url}${queryParams}`
    );

    return `${configLang(window, locale).url}${queryParams}`;
  };

  function receiveMessageListener() {
    window.addEventListener('message', receiveMessage, false);
  }
  function receiveMessage(event: any = {}) {
    const { data } = event;
    if (data === 'exchangeLogin') {
      setShowRegState(false);
    }
    if (data === 'exchangeRegister') {
      setShowRegState(true);
    }
    if (data === 'loginClose') {
      closeModel();
      setTimeout(() => {
        setLoginClose(true);
      }, 50);
    }
    if (data === 'registerClose') {
      closeModel();
      setTimeout(() => {
        setRegisterClose(true);
      }, 50);
    }
    if (data === 'loginSuccess') {
      closeModel();
      setLoginSuccess(true);
    }
    if (data === 'registerSuccess') {
      closeModel();
      setRegisterSuccess(true);
    }
  }

  const [loginSuccess, setLoginSuccess] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [loginClose, setLoginClose] = useState(false);
  const [registerClose, setRegisterClose] = useState(false);

  useEffect(() => {
    receiveMessageListener();
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []);

  return (
    // @ts-ignore
    <QuickLoginContext.Provider
      value={{
        loginSuccess,
        registerSuccess,
        loginClose,
        registerClose,
        openModel: openModel,
        closeModel: closeModel
      }}
    >
      <div
        ref={modalRef}
        style={{ visibility: 'hidden' }}
        className="modal_background"
      >
        {firstLoaded && (
          <>
            {/* @ts-ignore */}
            <Spin className="iframe-loading-spin" spinning={iframeLoading} />
            <iframe
              ref={iframeRef}
              loading="lazy"
              scrolling="no"
              className={`login-frame ${showRegState ? 'reg' : ''}`}
              title="Sign in"
            />
          </>
        )}
      </div>
      {children}
    </QuickLoginContext.Provider>
  );
};

export const useQuickLogin = () => {
  const context = useContext(QuickLoginContext);
  return context;
};
