import { getCaptchaInfo } from './api/captcha';
import CryptoJS from 'crypto-js';
import { Captcha } from './index';
import { sendReportData } from '../monitor.service';
import { basePath } from '../config';
import { message } from 'antd';
// https://docs.geetest.com/sensebot/apirefer/api/web#lang
export const langMap = {
  'en-US': 'en',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'id-ID': 'id',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'ru-RU': 'ru',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
  'de-DE': 'de',
  'vi-VN': 'vi',
  'pt-PT': 'pt',
  'ar-SA': 'ar',
  'th-TH': 'th',
  'pt-BR': 'pt-pt',
  'es-LA': 'es',
  'it-IT': 'it',
  'tr-TR': 'tr'
};

/** 极验 */
const geetestCaptcha = {
  key: 'geecaptcha',
  src: `/js/gt.0.4.9.js`,
  async init(context: Captcha, options, callback) {
    console.log('极验step3 加载文件');
    const params = {
      type: 'geetest',
      // login_name: ''
      login_name: CryptoJS.MD5(context.guid).toString(),
      site_type: context?.site_type
    };
    const data: any = await getCaptchaInfo(params);
    if (!data) {
      throw new Error('geetest error');
      return;
    }
    return new Promise((resolve) => {
      (<any>window)?.initGeetest(
        {
          // captchaId: 'baee87eb24c772b9321214204dd04d1e',
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: data.new_captcha,
          lang: langMap[context.lang] || 'en',
          product: 'bind',
          hideSuccess: true,
          hideClose: true,
          hideRefresh: true
        },
        function (captchaObj) {
          context.captcha = captchaObj;
          captchaObj.onSuccess(function () {
            const validateRes = captchaObj.getValidate();
            callback({ ...validateRes });
          });

          captchaObj.onError(function (err) {
            const code = err['error_code'].split('_')[1];
            console.log('geetest Error', code, err);
            // message.error(JSON.stringify(err));
            // sendReportData({
            //   type: 'geetest',
            //   businessType: 'login',
            //   err: err
            // });
          });

          // captchaObj.onFail(function (err) {
          //   const code = err['error_code'].split('_')[1];
          //   console.log('geetest Error', code, err);
          //   message.error(JSON.stringify(err));
          //   sendReportData({
          //     type: 'geetest',
          //     businessType: 'login',
          //     err: err
          //   });
          // });

          captchaObj.onReady(function () {
            console.log('geetest ready');
          });

          resolve(true);
        }
      );
    });
  },

  show(context: Captcha) {
    try {
      context.captcha.verify();
    } catch (e) {
      console.error('Geetest Show', e);
    }
  }
};

export default geetestCaptcha;
