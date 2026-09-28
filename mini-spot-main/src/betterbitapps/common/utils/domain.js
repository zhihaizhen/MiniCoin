import { Env } from '@region-lib/env';
import { getLanguage } from '@region-lib/language';

const { HELP_HOST } = Env;
// 正向修改保证金链接
export const zLinearPositionMargin = (lang) => {
  const help = getLanguage();
  const link =
    {
      'en-US': `/${help}/articles/900000294083-Adjust-Margin-on-position-USDT-Contract-`,
      'zh-CN': `/${help}/articles/900000294083-调整仓位保证金-USDT永续-`,
      'zh-TW': `/${help}/articles/900000294083-調整倉位保證金-USDT-合約-`,
      'ja-JP': `/${help}/articles/900000294083--USDT無期限契約でのポジション証拠金の調整`,
      'ko-KR': `/${help}/articles/900000294083-USDT-무기한-계약-포지션-증거금-조정`,
      'ru-RU': `/${help}/articles/900000294083-Adjust-Margin-on-position-USDT-Contract-`,
    }[lang] ||
    `/${help}/articles/900000294083-Adjust-Margin-on-position-USDT-Contract-`;
  return `${HELP_HOST}${link}`;
};
