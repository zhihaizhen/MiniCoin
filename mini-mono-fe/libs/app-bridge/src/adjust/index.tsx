import Cookie from 'js-cookie';
import { useEffect } from 'react';
import { isPhone, isApp } from '@better-bit-fe/base-utils';

import {
  ADJUST_APP_TOKEN,
  ADJUST_CDN_URL,
  ADJUST_WEB_TOKEN,
  DOM_ID,
  ADJUST,
  ENVIRONMENT,
  LOG_LEVEL,
  ADJUST_SMART_BANNER_TRACKER,
  CHANNEL_ATTR_PARAMS,
  DEFAULT_DEEPLINK_URL,
  LINK_BUTTON_STYLES,
  DELAY_TO_LOAD_TIME
} from './config';
import { getNativePath } from '../deeplink';

// Get env from url
const getDynamicEnv = () => {
  const { host } = window.location;
  let env = 'production';
  if (host.includes('testnet')) {
    env = 'testnet';
  } else if (host.includes('-test')) {
    env = 'test';
  } else if (host.includes('-dev')) {
    env = 'dev';
  } else if (host.includes('local')) {
    env = 'local';
  }
  return env;
};

// Get params by cookie from channel attr
const getParamsOfChannelAttr = () => {
  let env = getDynamicEnv();
  env = env === 'production' ? 'prod' : env;
  const cookieData = Cookie.get(`REG_REF_${env}`);
  let cookieFormatData = {};
  if (!cookieData) {
    return cookieFormatData;
  }
  try {
    cookieFormatData = JSON.parse(cookieData);
  } catch (e) {
    console.warn('[lib adjust] parse error', e, cookieData);
  }
  return cookieFormatData;
};

// Get url of deeplink with relative params
const getDeepLinkUrl = (
  href: string,
  isDeeplink: boolean
): {
  deeplinkUrl: string;
  deeplinkParams: { [key: string]: string };
} => {
  const attrs = getParamsOfChannelAttr();
  let deeplinkParams = '';
  const deeplinkParamsMap = {};
  Object.keys(attrs).forEach((key) => {
    if (CHANNEL_ATTR_PARAMS.includes(key)) {
      deeplinkParams += `&${key}=${attrs[key]}`;
      deeplinkParamsMap[key] = attrs[key];
    }
  });
  let deeplink = '';
  if (isDeeplink) {
    deeplink = href;
  } else {
    const nativePath = getNativePath(href);
    deeplink = nativePath ? nativePath.path : DEFAULT_DEEPLINK_URL;
  }
  if (!deeplink.includes('?')) {
    deeplinkParams = deeplinkParams.replace('&', '?');
  }
  return {
    deeplinkUrl: `${deeplink}${deeplinkParams}`,
    deeplinkParams: deeplinkParamsMap
  };
};

// Get adjust url of smart banner
export const getOpenUrlOfSmartBanner = (
  url = window.location.href,
  isDeeplink = false
): string => {
  const { deeplinkUrl, deeplinkParams } = getDeepLinkUrl(url, isDeeplink);
  const { source, medium, lang } = deeplinkParams;
  const baseLinkHref = `https://go.link?adj_t=${ADJUST_SMART_BANNER_TRACKER}`;
  let newLinkHref = `${baseLinkHref}&adj_deep_link=${encodeURIComponent(
    deeplinkUrl
  )}`;
  if (source) {
    newLinkHref += `&adj_campaign=${source}`;
  }
  if (medium) {
    newLinkHref += `&adj_adgroup=${medium}`;
  }
  if (lang) {
    newLinkHref += `&adj_creative=${lang}`;
  }
  return newLinkHref;
};

// Init smart banner
const initSmartBanner = () => {
  window?.Adjust?.initSmartBanner({ webToken: ADJUST_WEB_TOKEN });
};

// Add mutation observer for dynamically change the link of smart banner (ref: https://c1ey4wdv9g.larksuite.com/docx/doxusIKylQHjCF9p1s2jgdjyh5d)
const registerMutationObserver = () => {
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addedNodes = (mutation.addedNodes as any).values();
      for (const node of addedNodes) {
        const className = node.className || '';
        if (className.includes('adjust-smart-banner')) {
          node.className = `${node.className} adjust-smart-banner`;
          const linkElem = node.querySelector('a');
          Object.keys(LINK_BUTTON_STYLES).forEach((key) => {
            linkElem.style[key] = LINK_BUTTON_STYLES[key];
          });
          const newLinkHref = getOpenUrlOfSmartBanner();
          linkElem.href = newLinkHref;
          observer.disconnect();
        }
      }
    }
  });
  observer.observe(document.body, { childList: true });
};

/*
 *  Init Adjust SDK, relative params (ref: https://github.com/adjust/web_sdk/blob/master/docs/chinese/README.md#initialization )
 *  - appToken: get from adjust dashboard
 *  - environment: production / sandbox
 *    - sandbox: apply in env "local" / "test" / "testnet"
 *    - production:  apply in env "mainnet"
 *  - logLevel: "verbose" / "info" / "error" / "none"
 */
const initSDK = () => {
  const env = getDynamicEnv();
  window?.Adjust?.initSdk({
    appToken: ADJUST_APP_TOKEN,
    environment:
      env !== ENVIRONMENT.PRODUCTION
        ? ENVIRONMENT.SANDBOX
        : ENVIRONMENT.PRODUCTION,
    logLevel:
      env === ENVIRONMENT.PRODUCTION ? LOG_LEVEL.ERROR : LOG_LEVEL.VERBOSE
  });
};

// Load adjust script asynchronously
const loadScript = (notDelayLoad: boolean) => {
  return new Promise((resolve, reject) => {
    if (window[ADJUST]) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = DOM_ID;
    script.src = ADJUST_CDN_URL;
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      reject();
    };
    // Delay to append script avoiding lighthouse performance
    if (notDelayLoad) {
      document.body.appendChild(script);
    } else {
      setTimeout(() => {
        document.body.appendChild(script);
      }, DELAY_TO_LOAD_TIME);
    }
  });
};

export const Adjust = ({ notDelayLoad = false }) => {
  useEffect(() => {
    if (isPhone() && !isApp()) {
      // Step 1: Load script asynchronously, avoiding effect loading performance
      loadScript(notDelayLoad).then(() => {
        // Step 2: Init adjust sdk after script loaded
        initSDK();
        // Step 3: Register mutation observer for dynamic change the url of smart banner (hack solution from adjust team)
        registerMutationObserver();
        setTimeout(() => {
          // Step 4: Init smart banner after sdk init
          // Note: Since the params of channel attr come from cookie and the setup will be delay a while, delay to show the smart banner
          initSmartBanner();
        }, 100);
      });
    }
  }, [notDelayLoad]);

  return null;
};
