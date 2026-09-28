import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import zhTW from 'antd/locale/zh_TW';
import viVN from 'antd/locale/vi_VN';
import koKR from 'antd/locale/ko_KR';
import idID from 'antd/locale/id_ID';
import esEs from 'antd/locale/es_ES';
import ruRU from 'antd/locale/ru_RU';
import ptPT from 'antd/locale/pt_PT';
import arSA from 'antd/locale/ar_EG';
import thTH from 'antd/locale/th_TH';

// 用于en-US 变成 en-us，帮助中心路径
export const normalizeLocale = (locale) =>
  locale.replace(
    /([a-z]{2})-([A-Z]{2})/,
    (_, lang, region) => `${lang}-${region.toLowerCase()}`
  );

export const antdLocaleMap = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'zh-TW': zhTW,
  'vi-VN': viVN,
  'ko-KR': koKR,
  'id-ID': idID,
  'es-ES': esEs,
  'ru-RU': ruRU,
  'pt-PT': ptPT,
  'ar-SA': arSA,
  'th-TH': thTH
};

export const getAntdLocale = (locale: string) => {
  return antdLocaleMap[locale] || enUS;
};

export function getLang() {
  const navigatorSupportMap = {
    en: 'en-US',
    zh: 'zh-TW',
    cn: 'zh-CN',
    vi: 'vi-VN',
    ko: 'ko-KR',
    id: 'id-ID',
    es: 'es-ES',
    ru: 'ru-RU',
    pt: 'pt-PT',
    ar: 'ar-SA',
    th: 'th-TH'
  };
  const defalueLang = 'en-US';
  if (typeof window !== 'undefined' && window) {
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
    const lang = hrefLang || storageLang || systemLang || defalueLang;

    // alert(
    //   `getLang error: ${window.location.pathname},${hrefLang},${storageLang},${systemLang},${lang}`
    // );
    //获取到之后先重定向，再set保证其他页面也一致
    // @ts-ignore
    localStorage.setItem('LANG_KEY', lang);
    return lang;
  } else {
    return defalueLang;
  }
}

// login-affiliate项目用到
export const langList = [
  {
    key: 'zh-CN',
    label: '简体中文'
  },
  {
    key: 'en-US',
    label: 'English'
  },
  {
    key: 'zh-TW',
    label: '繁體中文'
  },
  {
    key: 'ko-KR',
    label: '한국어'
  },
  {
    key: 'vi-VN',
    label: 'Tiếng Việt'
  },
  {
    key: 'id-ID',
    label: 'Bahasa Indonesia'
  },
  {
    key: 'es-ES',
    label: 'Español (España)'
  },
  {
    key: 'ru-RU',
    label: 'Русский'
  },
  {
    key: 'pt-PT',
    label: 'Português (Portugal)'
  },
  {
    key: 'ar-SA',
    label: 'العربية'
  },
  {
    key: 'th-TH',
    label: 'ไทย'
  },
  {
    key: 'pt-BR',
    label: 'Português (Brasil)'
  },
  {
    key: 'uk-UA',
    label: 'Українська'
  },
  {
    key: 'uz-UZ',
    label: "O'zbekcha"
  },
  {
    key: 'es-LA',
    label: 'Español (Latinoamérica)'
  },
  {
    key: 'pl-PL',
    label: 'Polski'
  },
  {
    key: 'az-AZ',
    label: 'Azərbaycan'
  },
  {
    key: 'si-LK',
    label: 'සිංහල'
  },
  {
    key: 'sk-SK',
    label: 'Slovenčina'
  },
  {
    key: 'sl-SI',
    label: 'Slovenščina'
  },
  {
    key: 'lo-LA',
    label: 'ລາວ'
  },
  {
    key: 'lv-LV',
    label: 'Latviešu'
  },
  {
    key: 'hu-HU',
    label: 'Magyar'
  },
  {
    key: 'el-GR',
    label: 'Ελληνικά'
  },
  {
    key: 'cs-CZ',
    label: 'Čeština'
  },
  {
    key: 'bg-BG',
    label: 'Български'
  },
  {
    key: 'sv-SE',
    label: 'Svenska'
  },
  {
    key: 'da-DK',
    label: 'Dansk'
  },
  {
    key: 'ro-RO',
    label: 'Română'
  }
];

//

export const langKeyList = [
  'en-US',
  'zh-TW',
  'zh-CN',
  'vi-VN',
  'ko-KR',
  'id-ID',
  'es-ES',
  'ru-RU',
  'pt-PT',
  'ar-SA',
  'pt-BR',
  'fr-FR',
  'uk-UA',
  'uz-UZ',
  'es-LA',
  'th-TH',
  'pl-PL',
  'az-AZ',
  'kk-KZ',
  'si-LK',
  'sk-SK',
  'sl-SI',
  'lo-LA',
  'lv-LV',
  'hu-HU',
  'el-GR',
  'cs-CZ',
  'bg-BG',
  'sv-SE',
  'da-DK',
  'ro-RO'
];

// udesk 语言映射
// https://www.udesk.cn/doc/thirdparty/webim/#-_4
// https://udesk.udesk.cn/hc/articles/46387
export const udesk_lang_map = {
  'en-US': 'en-us',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-TW',
  'vi-VN': 'vi',
  'ko-KR': 'ko',
  'id-ID': 'id',
  'es-ES': 'es',
  'es-LA': 'es',
  'fr-FR': 'fr',
  'ru-RU': 'ru',
  'pt-PT': 'pt',
  'pt-BR': 'pt',
  'ar-SA': 'ar',
  'th-TH': 'th'
};

export const trade_color_lang_map = {
  'ko-KR': 'redUpBlueDown',
  default: 'greenUpRedDown'
};

export const LOCALE_CURRENCY_MAP = {
  'ko-KR': 'KRW',
  'zh-CN': 'CNY',
  'en-US': 'USD',
  'zh-TW': 'USD',
  'vi-VN': 'VND',
  'id-ID': 'IDR',
  'es-ES': 'EUR',
  'ru-RU': 'RUB',
  'pt-PT': 'EUR',
  'ar-SA': 'SAR',
  'pt-BR': 'BRL',
  'fr-FR': 'EUR',
  'uk-UA': 'UAH',
  'uz-UZ': 'UZS',
  'es-LA': 'USD',
  'th-TH': 'THB',
  'pl-PL': 'PLN',
  'az-AZ': 'AZN',
  'kk-KZ': 'KZT',
  'si-LK': 'LKR',
  'sk-SK': 'EUR',
  'sl-SI': 'EUR',
  'lo-LA': 'LAK',
  'lv-LV': 'EUR',
  'hu-HU': 'HUF',
  'el-GR': 'EUR',
  'cs-CZ': 'CZK',
  'bg-BG': 'BGN',
  'sv-SE': 'SEK',
  'da-DK': 'DKK',
  'ro-RO': 'RON'
};

export const getGlobalLocaleMsg = () => {
  if (typeof window !== 'undefined') {
    let storeData = {};
    try {
      const innerText =
        document.getElementById('__NEXT_DATA__')?.innerText || '{}';
      storeData =
        innerText && JSON.parse(innerText)
          ? JSON.parse(innerText)?.props?.pageProps?.messages || {}
          : {};
    } catch (error) {
      console.log(error);
    }
    return storeData;
  }
  return {};
};
