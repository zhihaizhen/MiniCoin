import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';
import { getCurrentCountryCode, postProfileLanguageUpdate } from '~/api';
import { basePath } from '@better-bit-fe/base-utils';
import Image from 'next/image';
import { getCookie } from 'by-storage';
import { useUserInfo } from '@better-bit-fe/base-provider';

// store the lang switch banner status, if customer close the banner, set the value to the language code
const BANNER_SWITCH_CLOSED_KEY = 'BANNER_SWITCH_CLOSED_KEY';
const CHINA_AREA_CODE = '86';
const TAIWAN_AREA_CODE = '886';
const HK_AREA_CODE = '852';
const VIETNAM_AREA_CODE = '84';
const KOREA_AREA_CODE = '82';
const supportedLanguages = [
  {
    value: 'en-US',
    lang: 'en',
    area_code: '1'
  },
  {
    value: 'zh-CN',
    lang: 'zh',
    area_code: CHINA_AREA_CODE,
    intl: '简体中文'
  },
  {
    value: 'zh-TW',
    lang: 'zh',
    area_code: TAIWAN_AREA_CODE,
    intl: '繁體中文'
  },
  {
    value: 'zh-HK',
    lang: 'zh',
    area_code: HK_AREA_CODE,
    intl: '繁體中文'
  },
  {
    value: 'vi-VN',
    lang: 'vi',
    area_code: VIETNAM_AREA_CODE,
    intl: 'Tiếng Việt'
  },
  {
    value: 'ko-KR',
    lang: 'ko',
    area_code: KOREA_AREA_CODE,
    intl: '한국어'
  }
];
const supportedCountryLangs = supportedLanguages.map((item) => item.lang);

interface CountryInfo {
  area_code: string;
  country: string;
}

export function LangSwitchBanner() {
  const t = useFm();
  const [showBanner, setShowBanner] = useState(false);
  const [countryInfo, setCountryInfo] = useState<CountryInfo>({
    area_code: '',
    country: ''
  });
  const { isLogin } = useUserInfo();

  useEffect(() => {
    const urlLang = window.location.pathname.match(/([a-z]{2}-[A-Z]{2})/)?.[0];
    const urlLangWithoutRegion = urlLang?.split('-')[0]?.toLowerCase();
    const cookieLang = getCookie('language');
    const cookieLangWithoutRegion = cookieLang?.split('-')[0]?.toLowerCase();
    const browserLang = navigator.language;
    const browserLangWithoutRegion = browserLang?.split('-')[0]?.toLowerCase();
    const isLangSupported =
      supportedCountryLangs.includes(urlLangWithoutRegion) ||
      supportedCountryLangs.includes(cookieLangWithoutRegion) ||
      supportedCountryLangs.includes(browserLangWithoutRegion);

    // if the customer has closed the banner, and the language is supported, then don't show the banner
    if (localStorage.getItem(BANNER_SWITCH_CLOSED_KEY) === 'true') {
      setShowBanner(false);
    } else {
      //获取ip地理位置对应的语言
      getCurrentCountryCode().then((res) => {
        //area_code: "86"
        //country: "CN"
        if (
          (res.area_code === CHINA_AREA_CODE ||
            res.area_code === TAIWAN_AREA_CODE ||
            res.area_code === HK_AREA_CODE ||
            res.area_code === KOREA_AREA_CODE ||
            res.area_code === VIETNAM_AREA_CODE) &&
          !isLangSupported
        ) {
          setShowBanner(true);
          setCountryInfo(res);
        }
      });
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  const redirectToNewPathByLanguage = (targetLang) => {
    let newPath;
    const langReg = /([a-z]{2}-[A-Z]{2})/;
    if (langReg.test(location.href)) {
      newPath = location.pathname.replace(langReg, targetLang);
    } else {
      newPath = `${targetLang}${location.pathname}`;
    }
    location.pathname = newPath;
  };

  const handleLanguageSwitch = () => {
    const targetLang = supportedLanguages.find(
      (item) => item.area_code === countryInfo.area_code
    )?.value;

    if (!targetLang) {
      return;
    }

    localStorage.setItem('LANG_KEY', targetLang);
    localStorage.setItem(BANNER_SWITCH_CLOSED_KEY, 'true');

    // if already login, update BE status
    if (isLogin) {
      postProfileLanguageUpdate({ language: targetLang }).then((res) => {
        redirectToNewPathByLanguage(targetLang);
      });
    } else {
      redirectToNewPathByLanguage(targetLang);
    }
  };

  const handleCloseBanner = () => {
    localStorage.setItem(BANNER_SWITCH_CLOSED_KEY, 'true');
    setShowBanner(false);
  };

  const getTargetLangText = () => {
    return (
      supportedLanguages.find(
        (value) => value.area_code === countryInfo.area_code
      )?.intl ?? ''
    );
  };

  return (
    <div className={styles.langSwitchBanner}>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div>
            <Image
              width={18}
              height={18}
              alt="notify"
              src={basePath + '/images/homePage/notify.svg'}
            />
          </div>
          <div className={styles.notification}>
            The system detects that you may be using {getTargetLangText()},
            click to switch
          </div>
          <div onClick={handleLanguageSwitch} className={styles.action}>
            <span>{getTargetLangText()}</span>
          </div>
        </div>
        <div onClick={() => handleCloseBanner()} className={styles.closeButton}>
          ✕
        </div>
      </div>
    </div>
  );
}
