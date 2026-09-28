// @ts-nocheck
import { ENV } from '@better-bit-fe/base-utils';
import { getAffiliateUrl, getDomainWhiteList } from '~/api';
export function formatThousandDigit(val: string) {
  if (val?.includes('.')) {
    const splitValue = val.split('.');
    const formatInt = Number(splitValue[0]).toLocaleString();
    const decimals = splitValue[1];
    return formatInt + '.' + decimals;
  } else {
    return Number(val).toLocaleString();
  }
}

export function formatCryptoAddress(val: string) {
  if (val) {
    return val.slice(0, 4) + '***' + val.slice(-4);
  }
  return '';
}

export function emailCheck(val: string) {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val);
}

export function getLang() {
  const langReg = /([a-z]{2}-[A-Z]{2})/;
  let refLang = location.href.match(langReg);
  if (refLang) {
    refLang = refLang[0];
  }
  const lang = refLang || localStorage.getItem('LANG_KEY') || 'zh-CN';
  //获取到之后set
  localStorage.setItem('LANG_KEY', lang);
  return lang;
}

export const getUrlAfterLangChange = (path) => {
  if (typeof window !== 'undefined') {
    const langReg = /([a-z]{2}-[A-Z]{2,3})/;
    const lang = getLang();
    // 导航上有语言，直接拼接
    //如果是en-US/aboutUs点击呢
    // if (langReg.test(location.href)) {
    //   lang = location.href.match(langReg)[0];
    // }

    const newUrl = `/${lang}${path}/`;
    return newUrl;
  }
  console.log('newUrl no broswer', path);
  return path;
};

const isWhiteListDomain = async (url: string) => {
  try {
    const whiteList = await getDomainWhiteList();
    const host = url.split('?')[0];
    const isRelativePath = host.startsWith('/');
    return isRelativePath || whiteList.some((item) => host?.includes(item));
  } catch (error) {
    console.log(error, 'err');
    return false;
  }
};

export const loginPushRouter = () => {
  if (ENV !== 'production' && ENV !== 'testnet' && ENV !== 'test') return;
  const urlSearchParams = new URLSearchParams(window.location.search);
  const return_page = urlSearchParams.get('return_page');
  const isOauth = urlSearchParams.get('isOauth');
  const login_channel = urlSearchParams.get('login_channel');
  const lang = getLang();
  setTimeout(async () => {
    if (return_page) {
      const returnBackQuery = window.atob(
        window.decodeURIComponent(return_page)
      );
      // whiteList for XSS attack
      const isInWhiteList = await isWhiteListDomain(returnBackQuery);
      if (!isInWhiteList) {
        window.location.href = `/${lang}/trade/usdt/BTCUSDT`;
        return;
      }
      // router.push(returnBackQuery);
      window.location.href = returnBackQuery;
    } else if (isOauth) {
      window.location.href = `/${lang}/account/oauth${window.location.search}`;
      return;
    } else {
      window.location.href = `/${lang}/trade/usdt/BTCUSDT`;
      // router.push('/trade/usdt/BTCUSDT');
    }
  }, 300);
};

export async function redirectAffiliate() {
  const lang = getLang();
  const affiliateUrl = await getAffiliateUrl();
  if (affiliateUrl) {
    window.location.href = '/aff_management/jump';
  } else {
    window.location.href = `/${lang}/trade/usdt/BTCUSDT`;
  }
}
