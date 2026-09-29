export const getScrollHeight = () => {
  if (typeof window !== 'undefined') {
    return document.body.scrollHeight;
  }
};

export const getBaseWidth = () => {
  if (typeof window !== 'undefined') {
    const screenWidth = document.body.clientWidth;
    return screenWidth;
  }
  return;
};

/**
 * 宽度小于等于767
 */
export const isMobile = () => {
  if (typeof window !== 'undefined') {
    const baseWidth = getBaseWidth();
    return baseWidth <= 767;
  }
};

export const isPC = () => {
  if (typeof window !== 'undefined') {
    const ua = navigator.userAgent;
    const isAndroid = /(?:Android)/.test(ua);
    const isFireFox = /(?:Firefox)/.test(ua);
    const isTablet =
      /(?:iPad|PlayBook)/.test(ua) ||
      (isAndroid && !/(?:Mobile)/.test(ua)) ||
      (isFireFox && /(?:Tablet)/.test(ua));
    const isIPhone = /(?:iPhone)/.test(ua) && !isTablet;
    return !isIPhone && !isAndroid;
  }
  return false;
};

/**
 * 宽度在768(包含)到1280(包含)之间
 */
export const isTablet = () => {
  if (typeof window !== 'undefined') {
    const baseWidth = getBaseWidth();
    return baseWidth > 767 && baseWidth <= 1280;
  }
};

/**
 * 判断是否app
 */
export function isApp() {
  if (typeof window !== 'undefined') {
    return !!navigator.userAgent.match(/bit_app/i);
  }
  return false;
}

export function isPhone() {
  if (typeof window === undefined) return false;
  return (
    /(iPhone|iPod|Android)/i.test(navigator.userAgent) &&
    window.screen.width < 768
  );
}

export function parseSearch(search: string): Record<string, string> {
  if (!search || search === '?') return {};
  return search
    .slice(1)
    .split('&')
    .reduce((prev, cur) => {
      const [key, value] = cur.split('=');
      return { ...prev, [key]: decodeURIComponent(value) };
    }, {});
}
