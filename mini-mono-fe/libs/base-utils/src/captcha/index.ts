import CaptchaLoader, { CONST } from './CaptchaLoader';
import geetestCaptcha from './geetestCaptcha';
// import qqCaptcha from './qqCaptcha'
// import reCaptcha from './reCaptcha'

export interface CaptchaConfig {
  show: (context: Captcha) => void;
  init: (context: Captcha, options: any, callback: any) => Promise<unknown>;
  [key: string]: any;
}

const captchaLoader = new CaptchaLoader();
captchaLoader.registerCaptcha(geetestCaptcha);
// captchaLoader.registerCaptcha(reCaptcha)
// captchaLoader.registerCaptcha(qqCaptcha)

export class Captcha {
  /** 标识是否已加载script lib */
  scriptReady: boolean;
  /** 验证码类型 */
  captchaType: string;
  /** 实例化后的 随机数id */
  id: string;
  /** 语言en-US... */
  lang: string;
  guid: string;

  options: any;
  site_type: string;
  callbackHandler: (data?: any) => void;
  /** 真实由外部传入的回调 */
  realCallback: () => void;

  setting: CaptchaConfig;

  config = {
    /** 加载script状态 */
    /** 未加载 */
    SCRIPT_NOT_LOAD: 'notLoad',
    /** 已加载 */
    SCRIPT_LOADED: 'loaded',
    /** 加载中 */
    SCRIPT_LODING: 'loading'
  };
  scriptSrc: string;
  /** 初始化后 挂载的第三方实例(qq captcha 有) */
  captcha?: any;
  /** 初始化完毕后的回调 */
  scriptReadyCallback: () => void;

  constructor(options) {
    console.log('极验step2 实例化')
    const { lang, guid, site_type, scriptSrc } = options;
    this.lang = lang;
    this.guid = guid;
    this.scriptReady = false;
    this.captchaType = '';
    this.id = 'captcha-' + String(Math.round(Math.random() * 10000));
    this.site_type = site_type;
    this.scriptSrc = scriptSrc;
    // 极验初始化功能关闭
    this.init();
  }

  /**
   * 初始化极验
   */
  async init() {
    if (captchaLoader.scriptStatus === CONST.SCRIPT_NOT_LOAD) {
      captchaLoader.scriptStatus = CONST.SCRIPT_LODING;
      captchaLoader.scriptLoadedNotifyList.push(this);
      const key = await captchaLoader.loadScripts(this.scriptSrc);
      captchaLoader.scriptStatus = CONST.SCRIPT_LOADED;
      captchaLoader.notifyValidationsAndInit(key);
    } else if (captchaLoader.scriptStatus === CONST.SCRIPT_LODING) {
      captchaLoader.scriptLoadedNotifyList.push(this);
    } else {
      captchaLoader.singleInit(this, captchaLoader.type);
    }
  }

  show(cb, logger?) {
    this.realCallback = cb;
    if (!this.scriptReady) {
      console.error('还未初始化完毕！');
      return;
    }
    this.setting.show.call(null, this);

    // signup action record
    logger && logger('exposure', 'captcha_open');
  }
}
