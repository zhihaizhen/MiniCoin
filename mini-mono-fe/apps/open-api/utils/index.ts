import { getLang } from '@better-bit-fe/base-utils';

export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

// 跳转到登录页面，并携带返回页面参数
export const handleLoginJumpWithReturnPage = () => {
  const lang = getLang();
  const origin = window.location.origin;
  const returnPageParam = window.btoa(
    `${location.origin}/${lang}/open-api`
  );
  window.location.href = `${origin}/${lang}/account/login?return_page=${returnPageParam}`;
};