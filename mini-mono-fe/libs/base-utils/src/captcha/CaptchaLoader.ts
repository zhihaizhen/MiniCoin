import { hasScript } from './utils';
import type { Captcha } from './index';
import type { CaptchaConfig } from './index';

export const CONST = {
  KEY_VERSION: 'v2',
  /** 加载script状态 */
  /** 未加载 */
  SCRIPT_NOT_LOAD: 'notLoad',
  /** 已加载 */
  SCRIPT_LOADED: 'loaded',
  /** 加载中 */
  SCRIPT_LODING: 'loading'
};

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    ((obj.constructor && obj.constructor.name === 'Promise') ||
      typeof obj.then === 'function')
  );
}

/** 验证码加载器 */
class CaptchaLoader {
  /** 全局 script加载 队列 */
  scriptLoadedNotifyList: Captcha[] = [];
  /** 加载script状态 */
  scriptStatus = CONST.SCRIPT_NOT_LOAD;
  /** 已经注册的验证码 */
  registerCaptchaQueue = [];
  /** 当前使用的验证码索引 */
  useRegisterCaptchaIndex = 0;
  type = '';

  async loadScripts(
    scriptSrc = 'https://static.geetest.com/static/js/gt.0.4.9.js'
  ) {
    const index = this.useRegisterCaptchaIndex;
    const config = this.registerCaptchaQueue[index];
    if (!config) return '';
    const key = await this.loadScript(config.key, scriptSrc, {});
    return key;
  }

  loadScript(key, url, options) {
    return new Promise((resolve, reject) => {
      if (hasScript(url)) return resolve(key);
      const body = document.head || document.getElementsByTagName('body')[0];
      const script = document.createElement('script');
      script.async = true;
      script.src = url;
      Object.assign(script, options);
      body.appendChild(script);
      // 这里ie不支持onload事件，若未来支持IE需要修改
      script.onload = () => {
        // window?.dataLayer?.push({
        //   event: 'GAEvent',
        //   eventAction: 'onload',
        //   eventCategory: `CaptchaValidation_${key}_initiated`,
        //   eventLabel: `loaded.${key}`
        // })
        resolve(key);
      };
      script.onerror = () => {
        reject();
      };
    }).catch(() => {
      // window?.dataLayer?.push({
      //   event: 'GAEvent',
      //   eventAction: 'error',
      //   eventCategory: `CaptchaValidation_${key}_failed_load`,
      //   eventLabel: `error.${key}`
      // })
      //! 当前验证码lib获取失败则 往后继续加载的其它平台的验证码
      const index = this.useRegisterCaptchaIndex;
      if (index + 1 < this.registerCaptchaQueue.length) {
        console.warn(key, 'not loaded, loading next script.');
        this.useRegisterCaptchaIndex += 1;
        return this.loadScripts();
      } else {
        // window?.dataLayer?.push({
        //   event: 'GAEvent',
        //   eventAction: 'error',
        //   eventCategory: `CaptchaValidation_all_failed_load`,
        //   eventLabel: `error.captcha`
        // })
        console.warn('All captchas not loaded.');
      }
    });
  }

  getCurrentCaptchaSetting(type) {
    return this.registerCaptchaQueue.find((item) => {
      return item.key === type;
    });
  }

  notifyValidationsAndInit(type) {
    this.type = type;
    this.scriptLoadedNotifyList.forEach((instance) => {
      this.singleInit(instance, type);
    });
  }

  singleInit(instance: Captcha, type: string) {
    const curSetting = this.getCurrentCaptchaSetting(type);
    instance.captchaType = type;
    instance.setting = curSetting;
    instance.callbackHandler = function (data) {
      const resp = Object.assign(
        {},
        {
          type,
          key_version: CONST.KEY_VERSION
        },
        data
      );
      // 调用
      if (typeof instance.realCallback === 'function') {
        instance.realCallback.call(null, resp);
      }
    };
    const args = [instance, curSetting?.options, instance?.callbackHandler];
    // 调用配置中的init
    const initCall = curSetting.init.apply(null, args);
    if (isPromise(initCall)) {
      initCall
        .then(() => {
          instance.scriptReady = true;

          if (typeof instance.scriptReadyCallback === 'function') {
            instance.scriptReadyCallback.call(instance);
          }
        })
        .catch((e) => {
          console.error('Captcha.singleInit:', e);
          instance.scriptReady = false;
          this.errorNextCaptcha();
        });
    } else {
      instance.scriptReady = true;
      if (typeof instance.scriptReadyCallback === 'function') {
        instance.scriptReadyCallback.call(instance);
      }
    }
  }

  async errorNextCaptcha() {
    this.useRegisterCaptchaIndex += 1;
    this.scriptStatus = CONST.SCRIPT_LODING;
    const key = await this.loadScripts();
    this.scriptStatus = CONST.SCRIPT_LOADED;
    key && this.notifyValidationsAndInit(key);
  }

  registerCaptcha(config: CaptchaConfig) {
    const keyIndex = this.registerCaptchaQueue.findIndex(function (it) {
      return it.key === config.key;
    });

    if (keyIndex > -1) {
      console.warn('[Captcha Validation]: Duplicated captcha registry');
      return;
    }
    config.scriptId = 'script-' + String(Math.round(Math.random() * 10000));
    this.registerCaptchaQueue.push(config);
  }
}

export default CaptchaLoader;
