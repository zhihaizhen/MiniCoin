// @ts-nocheck
import React, { FC, useCallback, useEffect } from 'react';
import clx from 'classnames';
import { isApp, isMobile } from '@better-bit-fe/base-utils';
import { IUserInfo } from '../types';
// import './index.less';

const CONTAINER_ID = 'common-header';
const LANGUAGE_MAP = {
  'de-DE': { label: 'Deutsche', lang: 'DE' },
  'en-US': { label: 'English', lang: 'EN' },
  'es-ES': { label: 'Español (España)', lang: 'ES' },
  'es-419': { label: 'Español (Internacional)', lang: '419' },
  'es-MX': { label: 'Español (México)', lang: 'MX' },
  'es-AR': { label: 'Español (Argentina)', lang: 'AR' },
  'fr-FR': { label: 'Français', lang: 'FR' },
  'id-ID': { label: 'Bahasa Indonesia', lang: 'ID' },
  'ja-JP': { label: '日本語', lang: 'JA' },
  // 'ko-KR': { label: '한국어', lang: 'KO' },
  'ru-RU': { label: 'Русский', lang: 'RU' },
  'th-TH': { label: 'ไทย', lang: 'TH' },
  'pt-BR': { label: 'Português (Brasil)', lang: 'BR' },
  'pt-PT': { label: 'Português (Portugal)', lang: 'PT' },
  'tr-TR': { label: 'Türkçe', lang: 'TR' },
  'vi-VN': { label: 'Tiếng Việt', lang: 'VI' },
  'zh-MY': { label: '中文 (马来西亚)', lang: 'ZH' },
  'zh-TW': { label: '中文繁體', lang: 'ZH' },
  'uk-UA': { label: 'Українська', lang: 'UK' },
  'kk-KZ': { label: 'қазақша', lang: 'KK' },
  'hi-IN': { label: 'हिन्दी', lang: 'HI' },
  'fil-PH': { label: 'Filipino', lang: 'FIL' },
  'ar-SA': { label: 'اَلْعَرَبِيَّةُ', lang: 'SA' },
  'pt-BR': { label: 'Português (Brasil)', lang: 'BR' },
  'uk-UA': { label: 'Українська', lang: 'UK' },
  'uz-UZ': { label: 'Oʻzbekcha', lang: 'UZ' },
  'es-LA': { label: 'Español (Latinoamérica)', lang: 'LA' },
  'th-TH': { label: 'ไทย', lang: 'TH' },
  'pl-PL': { label: 'Polski', lang: 'PL' },
  'az-AZ': { label: 'Azərbaycan', lang: 'AZ' },
  'si-LK': { label: 'සිංහල', lang: 'LK' },
  'sk-SK': { label: 'Slovenčina', lang: 'SK' },
  'sl-SI': { label: 'Slovenščina', lang: 'SI' },
  'lo-LA': { label: 'ລາວ', lang: 'LA' },
  'lv-LV': { label: 'Latviešu', lang: 'LV' },
  'hu-HU': { label: 'Magyar', lang: 'HU' },
  'el-GR': { label: 'Ελληνικά', lang: 'GR' },
  'cs-CZ': { label: 'Čeština', lang: 'CZ' },
  'bg-BG': { label: 'Български', lang: 'BG' },
  'sv-SE': { label: 'Svenska', lang: 'SE' },
  'da-DK': { label: 'Dansk', lang: 'DK' },
  'ro-RO': { label: 'Română', lang: 'RO' },
  'it-IT': { label: 'Italiano', lang: 'IT' }
};
export const localesFormatter = (
  locales: string[] = [],
  ignoreLocales: string[] = []
) =>
  locales
    .map((locale) => ({
      value: locale,
      ...LANGUAGE_MAP[locale]
    }))
    .filter((l) => ignoreLocales.indexOf(l.value) === -1);

export interface HeaderProps {
  req: any;
  host: string;
  locale?: string;
  locales?: string[];
  ignoreLocales?: string[];
  userInfo?: IUserInfo;
  onLanguageChange?: (locale: string) => void;
  onLogout?: () => void;
  navSettings?: React.CSSProperties;
  className?: string;
  autoHideInApp?: boolean;
  defaultContent?: string; // for SEO
}

export const execLogout = (host, req) => {
  return req(`${host}/logout`, {}, { method: 'POST' });
};

export const Header: FC<HeaderProps> = ({
  req,
  host,
  locale,
  locales,
  ignoreLocales,
  userInfo,
  onLogout,
  onLanguageChange,
  navSettings = {},
  className,
  autoHideInApp = false,
  defaultContent = ''
}) => {
  const languageChange = useCallback(
    (newLocale) => {
      onLanguageChange(newLocale);
      // Close branch journey
      const flag = window?.branch && !isApp() && process.browser && isMobile();
      if (flag) {
        window?.branch?.closeJourney();
      }
    },
    [onLanguageChange]
  );

  useEffect(() => {
    window &&
      // @ts-ignore
      window?.RegionFrame?.ready((uniframe) => {
        if (!uniframe) {
          return null;
        }
        const { header } = uniframe;
        header.init({
          containerId: CONTAINER_ID
        });
        header
          .setProperty('isHome', true)
          .subscribeEvent('languageChange', languageChange)
          .setProperty('userInfo', userInfo)
          .setProperty('locales', localesFormatter(locales, ignoreLocales))
          .setProperty('language', locale);
        /**
         * Note: Since there is a bug about the "ready" event, we can't setup userInfo while ready event trigger.
         */
        setTimeout(() => {
          uniframe.header.setProperty('userInfo', userInfo);
        }, 100);
      });
  }, [ignoreLocales, languageChange, locale, locales, userInfo]);

  // 单独处理登出的问题 避免多次注册登出事件多次调用接口
  // 注意: uniframe的ready方法如果被多次调用，会导致注册多个logout的回调, 所以这里的依赖空数组
  useEffect(() => {
    const wrapperEle = document.getElementById(CONTAINER_ID);
    if (wrapperEle && isApp() && autoHideInApp) {
      wrapperEle.style.display = 'none';
    }
    window &&
      // @ts-ignore
      window?.RegionFrame?.ready((uniframe) => {
        if (!uniframe) {
          return null;
        }
        const { header } = uniframe;
        header &&
          header.subscribeEvent('logout', async () => {
            try {
              await execLogout(host, req);
              onLogout();
            } catch (e) {
              console.error('logout error', e);
            }
          });
      });
  }, [autoHideInApp, host, onLogout, req]);

  useEffect(() => {
    localStorage.setItem('LANG', locale || 'zh-CN');
    // @ts-ignore
    if (window?.RegionFrame?.header) {
      // @ts-ignore
      window.RegionFrame.header.setProperty('language', locale);
    }
  }, [locale]);

  const deps = typeof window !== 'undefined' ? window?.RegionFrame?.header : '';
  useEffect(() => {
    // @ts-ignore
    if (window?.RegionFrame?.header && navSettings) {
      // @ts-ignore
      window.RegionFrame.header.setProperty('style', navSettings);
    }
  }, [navSettings, deps]);
  return (
    <div
      id={CONTAINER_ID}
      style={navSettings}
      className={className}
      dangerouslySetInnerHTML={{ __html: defaultContent }}
    />
  );
};
export { default as NonCryptoHeader } from './noncrypto';
