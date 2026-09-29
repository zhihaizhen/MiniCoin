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

// export function getLang() {
//   const langReg = /([a-z]{2}-[A-Z]{2})/;
//   let refLang = location.href.match(langReg);
//   if (refLang) {
//     refLang = refLang[0];
//   }
//   const lang = refLang || localStorage.getItem('LANG_KEY') || 'zh-CN';
//   //获取到之后set
//   localStorage.setItem('LANG_KEY', lang);
//   return lang;
// }

// export const getUrlAfterLangChange = (path) => {
//   if (typeof window !== 'undefined') {
//     const langReg = /([a-z]{2}-[A-Z]{2,3})/;
//     let lang = getLang();
//     // 导航上有语言，直接拼接
//     //如果是en-US/aboutUs点击呢
//     // if (langReg.test(location.href)) {
//     //   lang = location.href.match(langReg)[0];
//     // }

//     const newUrl = `/${lang}${path}/`;
//     return newUrl;
//   }
//   console.log('newUrl no broswer', path);
//   return path;
// };

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
  console.log('login----loginPushRouter');
  if (ENV !== 'production' && ENV !== 'testnet' && ENV !== 'test') return;
  const urlSearchParams = new URLSearchParams(window.location.search);
  const return_page = urlSearchParams.get('return_page');
  const login_channel = urlSearchParams.get('login_channel');
  setTimeout(async () => {
    redirectAffiliate();
    return;
    if (return_page) {
      const returnBackQuery = window.atob(
        window.decodeURIComponent(return_page)
      );
      // whiteList for XSS attack
      const isInWhiteList = await isWhiteListDomain(returnBackQuery);
      if (!isInWhiteList) {
        window.location.href = '/trade/usdt/BTCUSDT';
        return;
      }
      // router.push(returnBackQuery);
      window.location.href = returnBackQuery;
    } else if (login_channel) {
      if (login_channel === 'affiliate') {
        redirectAffiliate();
      }
    } else {
      window.location.href = '/trade/usdt/BTCUSDT';
      // router.push('/trade/usdt/BTCUSDT');
    }
  }, 300);
};

export async function redirectAffiliate() {
  let lang = getLang();
  window.location.href = `/aff_management/jump?lang=${lang}`;
  return;
  const affiliateUrl = await getAffiliateUrl();
  if (affiliateUrl) {
    window.location.href = '/aff_management/jump';
  } else {
    window.location.href = '/trade/usdt/BTCUSDT';
  }
}

export function getLang() {
  const navigatorSupportMap = {
    en: 'en-US',
    zh: 'zh-TW',
    cn: 'zh-CN',
    vi: 'vi-VN',
    ko: 'ko-KR'
  };

  if (typeof window !== 'undefined' && window) {
    const defalueLang =
      window.location.host === 'affiliate.EasiCoin.inc' ? 'ko-KR' : 'en-US';
    //1. url上取
    const langReg = /([a-z]{2}-[A-Z]{2})/;
    let hrefLang = window.location.pathname.match(langReg);
    if (hrefLang) {
      // @ts-ignore
      hrefLang = hrefLang[0];
    }
    // 2.localstorage取
    const storageLang = localStorage.getItem('LANG_KEY');
    // 3.从系统语言上取
    const systemLang = navigatorSupportMap[navigator.language];
    // 4. 默认语言
    const lang = hrefLang || defalueLang || storageLang || systemLang;

    // alert(
    //   `getLang error: ${window.location.pathname},${hrefLang},${storageLang},${systemLang},${lang}`
    // );
    //获取到之后先重定向，再set保证其他页面也一致
    // @ts-ignore
    localStorage.setItem('LANG_KEY', lang);
    console.log(333, lang);
    return lang;
  } else {
    console.log(4444, defalueLang);
    return defalueLang;
  }
}
