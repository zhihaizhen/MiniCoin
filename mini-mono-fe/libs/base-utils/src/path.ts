//  @ts-nocheck
import { navigate } from 'libs/app-bridge/src/deeplink';
import { isApp } from './browser';
import { basePath, getHost } from './config';
export const fillPath = (base: string) => (relative: string) => {
  base = base.endsWith('/') ? base.replace(/\/$/, '') : base;
  relative = relative.startsWith('/') ? relative : `/${relative}`;

  return `${base}${relative}`;
};

export const fillImagePath = fillPath(`${basePath}/images`);
export const fillFontsPath = fillPath(`${basePath}/fonts`);
export const fillIconsPath = fillPath(`${basePath}/icons`);
export const fillAssetsPath = fillPath(`${basePath}/assets`);
export const fillStaticPath = fillPath(`${basePath}/static`);

// for background-image url property in css filling function
//
// [usage]
// fillImageUrl('bg.png') => `url('${BASE_PATH}/images/bg.png')`
export const fillBackgroundUrlPath = (image: string) => {
  image = fillImagePath(image);
  return `url('${image}')`;
};

/**
 * 获取href地址，只有在浏览器环境中才有效果
 *
 */
export const I18N_URL_REGEX = /^(?:\/([a-z]{2,3}-[a-zA-Z0-9]{2,3}))?(\/.*)?/;

export const getHref = (href: string, isI18N = true) => {
  if (isI18N) {
    const matches = window.location.pathname.match(I18N_URL_REGEX);
    let language = matches?.[1] ? matches?.[1] : 'en-US';

    // url of builder pages starts with '/builder' or '/promo' and should use
    // lowercase language
    if (href.startsWith('/promo') || href.startsWith('/builder')) {
      language = language.toLowerCase();
    }
    return `${getHost()}/${language}` + href;
  } else {
    return `${getHost()}` + href;
  }
};

/**
 * 为了兼容app端的deeplink
 * @param path
 * @param isOpenWindow
 * @returns
 */
export function goHref(path: string, isOpenWindow = false): string {
  if (isApp()) {
    navigate(path, { newTab: isOpenWindow });
  } else {
    if (window.location.href === path) return null;
    if (isOpenWindow) {
      window.open(path);
    } else {
      window.location.assign(path);
    }
  }
}

// 跳转到登录页
export const goLoginPage = (href = window.location.href) =>
  goHref(getHref('/login?redirect_url=' + encodeURIComponent(href)));

// 跳转到注册页
export const goSignUp = (href = window.location.href) =>
  goHref(getHref('/register?redirect_url=' + encodeURIComponent(href)));


export const getSymbolUrl = (name: string, style: 'dark' | 'light' = 'dark') => {
  let coin = name;

  // 格式1: btc/usdt、btc/usdc、usd1/usdt (包含斜杠)
  if (name.includes('/')) {
    coin = name.split('/')[0];
  }
  // 格式2:匹配末尾 USD/USDT/USDC/USD1 且不是单独币种
  else if (/USD[A-Z0-9]$/i.test(name) && !/^usdt?c?1?$/i.test(name)) {
    coin = name.replace(/USD[A-Z0-9]$/i, '');
  }
  // 格式3: btc、usdt、usd1、usdc (单个币种,不做处理)
  coin = coin || 'usdt';
  const publicUrl = 'https://cdn.easicoin.io';
  return `/icon/${style}/${coin?.toLowerCase()}.png`;
};
