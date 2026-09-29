/** @file qq验证未启用，代码暂时保留 */
import type { Captcha } from './index';

function getQQCaptchaKey() {
  const qqCaptchaMap = {
    '': '1234567890'
  };
  const hostname = window.location.hostname || 'www.easicoin.io';
  const captchaKey = hostname.split('.').slice(-2).join('.');
  const mainDomain = hostname.replace(/^www|m|testnet/, '');
  const qqCaptchaKey = qqCaptchaMap[captchaKey] || '1234567890';
  return qqCaptchaKey;
}

/** qq验证码 */
const qqCaptcha = {
  key: 'qqcaptcha',
  src: 'https://ssl.captcha.qq.com/TCaptcha.js',
  options: {
    key: getQQCaptchaKey()
  },
  init(context: Captcha, options, callback) {
    try {
      context.captcha = new window.TencentCaptcha(options.key, function cb(
        resp
      ) {
        if (resp.ret === 0) {
          callback({
            ticket: resp.ticket,
            randstr: resp.randstr
          });
        }
        if (resp.ret !== 0) {
          window?.dataLayer?.push({
            event: 'GAEvent',
            eventAction: 'error',
            eventCategory: 'CaptchaValidation_qqcaptcha_ontrigger_error',
            eventLabel: `error.qqcaptcha.${resp?.errorMessage || 'none'}`
          });
        }
      });
    } catch (e) {
      console.error('QQ Captcha Init', e);
    }
  },
  show(context: Captcha) {
    try {
      context.captcha.show();
    } catch (e) {
      console.error('QQ Captcha Show Error', e);
    }
  }
};

export default qqCaptcha;
