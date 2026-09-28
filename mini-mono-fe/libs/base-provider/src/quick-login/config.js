export const LEARN_LANG_MAP = {
  en: 'en-US',
  'zh-tw': 'zh-TW',
  ja: 'ja-JP',
  // 'ko-KR',
  ru: 'ru-RU',
  es: 'es-ES',
  vi: 'vi-VN',
  tr: 'tr-TR',
  'pt-br': 'pt-BR',
  fr: 'fr-FR',
  id: 'id-ID'
  // 'ar-AE',
};

export function configLang(ctx, lang) {
  const { protocol, hostname = '' } = ctx.location;
  let language = lang;

  const testUrl = ['www.test.bitrunfinance.com'];
  const localTestUrl = ['test.bitrunfinance.com'];
  let formatHostname = hostname;
  // special process for blog
  if (hostname.includes('blog.')) {
    const splitArray = hostname.split('blog.');
    formatHostname = hostname.includes('testnet')
      ? `${splitArray[0].replace('-new', '')}.${splitArray[1]}`
      : `www.${splitArray[1]}`;
  }

  // special handling for learn and learn-temp

  if (hostname.includes('learn.') || hostname.includes('learn-temp.')) {
    language = LEARN_LANG_MAP[lang];
    let splitArray = '';
    if (hostname.includes('learn.')) {
      splitArray = hostname.split('learn.');
    } else {
      splitArray = hostname.split('learn-temp.');
    }

    formatHostname = hostname.includes('testnet')
      ? `${splitArray[0].replace('-', '')}.${splitArray[1]}`
      : `www.${splitArray[1]}`;
  }

  // special handling for announcement
  if (hostname.includes('announcement.')) {
    const splitArray = hostname.split('announcement.');
    formatHostname = hostname.includes('testnet')
      ? `${splitArray[0].replace('-', '')}.${splitArray[1]}`
      : `www.${splitArray[1]}`;
  }

  // special handling for announcements
  if (hostname.includes('announcements.')) {
    const splitArray = hostname.split('announcements.');
    formatHostname = hostname.includes('testnet')
      ? `${splitArray[0].replace('-', '')}.${splitArray[1]}`
      : `www.${splitArray[1]}`;
  }

  /** 
    to format hostname for iframe src when you develop locally
    (local.serval-test-1.A.com => www.serval-test-1.A.com)
  */
  if (!testUrl.includes(formatHostname)) {
    localTestUrl.forEach((e) => {
      if (formatHostname.includes(e)) {
        let hostArr = formatHostname.split('.');
        hostArr[0] = 'www';
        formatHostname = hostArr.join('.');
        return;
      }
    });
  }

  return {
    url: `${protocol}//${formatHostname}/${language}/activities-signup`
  };
}
export function getQueryParams() {
  if (process.browser) {
    const { search } = window.location;
    if (!search) return {};
    return search
      .slice(1)
      .split('&')
      .reduce((prev, cur) => {
        const [key, value] = cur.split('=');
        return { ...prev, [key]: decodeURIComponent(value) };
      }, {});
  }
}
export function getAllQueryParams() {
  const { affiliate_id, ref, language, group_id, group_type } =
    getQueryParams();
  // 代理商的id最高权限优先判定
  if (affiliate_id) {
    return `?affiliate_id=${affiliate_id}&language=${language}&group_id=${group_id}&group_type=${group_type}&ref=${ref}`;
  }
  // 然后在判定是否有邀请好友的id
  else if (ref) {
    return `?ref=${ref}`;
  } else {
    return '';
  }
}
