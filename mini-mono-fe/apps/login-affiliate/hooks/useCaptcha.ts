import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  Captcha as CaptchaValidation,
  getGuid
} from '@better-bit-fe/base-utils';
// 这里拿到多语言参数locale
export function useCaptcha() {
  const [captcha, setcaptcha] = useState<any>();
  const { locale } = useRouter();
  function showCaptcha() {
    return new Promise((resolve) => {
      captcha?.show(resolve);
    });
  }
  useEffect(() => {
    setcaptcha(
      new CaptchaValidation({
        lang: locale,
        guid: getGuid(),
        site_type: 'agent'
      })
    );
    const time = setInterval(() => {
      console.log('new CaptchaValidation');
      setcaptcha(
        new CaptchaValidation({
          lang: locale,
          guid: getGuid(),
          site_type: 'agent'
        })
      );
    }, 600000);
    return () => {
      clearInterval(time);
    };
  }, [locale, getGuid()]);

  return { captcha, showCaptcha };
}
