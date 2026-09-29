/**
 * useVerifyCode — 验证码发送逻辑 hook
 *
 * 从 VerifyFormModal 中抽离，职责：
 * 1. 极验弹窗（useCaptcha） → 开始倒计时（useCountDown） → 调发送 API
 * 2. 管理国家区号列表获取（bind_mobile 场景需要用户选择区号）
 * 3. 根据 scene / actionType 自动判断 code_type（bind / unbind / openapi 各不同）
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useCaptcha } from '~/hooks/useCaptcha';
import useCountDown from '~/hooks/useCountDown';
import { useUserInfo } from '@better-bit-fe/base-provider';
import {
  postPhoneCodeSend,
  postEmailCodeSend,
  getCountryList,
  getCurrentCountryCode
} from '~/api';
import { EmailCodeType, PhoneCodeType } from '~/constant';
import {
  APIS_EMAIL_CODE_TYPE_MAP,
  APIS_PHONE_CODE_TYPE_MAP,
  PASSKEY_EMAIL_CODE_TYPE_MAP,
  PASSKEY_PHONE_CODE_TYPE_MAP
} from './constants';

import type { VerifyScene } from './types';

interface CountryCodeInfo {
  area_code: string;
  country: string;
}

interface UseVerifyCodeOptions {
  /** 当前验证场景 */
  scene: VerifyScene;
  /**
   * 操作类型（决定验证码类型）
   * openapi：create / edit-submit / delete / detail
   * passkey：create / delete
   */
  actionType?: string;
  /** 仅通行密钥：发送时优先用此函数读最新 actionType；openapi 不传 */
  getActionType?: () => string | undefined;
  /** 弹框是否可见，控制是否自动拉取区号列表 */
  isModalOpen: boolean;
  /** 当前选中的验证方式是否包含手机 */
  showPhone: boolean;
  /** 是否为绑定手机场景（需要用户手动输入手机号） */
  isBindMobile: boolean;
  /** collect-only：openapi、passkey 等不输入联系方式，由后端按登录态取号 */
  isCollectOnly: boolean;
  /** 获取当前手机号（bind 场景取用户输入，其他取 userInfo） */
  getPhoneMobile: () => string;
  /** 获取当前邮箱地址（bind 场景取用户输入，其他取 userInfo） */
  getEmailAddress: () => string;
  /** 手机号是否通过校验（控制发送按钮可点击状态） */
  phoneCheckPass: boolean;
  /** 邮箱是否通过校验 */
  emailCheckPass: boolean;
}

/**
 * 封装验证码发送逻辑：极验 → 倒计时 → 调 API
 * 同时管理国家区号列表的获取
 */
export function useVerifyCode(options: UseVerifyCodeOptions) {
  const {
    scene,
    actionType,
    getActionType,
    isModalOpen,
    showPhone,
    isBindMobile,
    isCollectOnly,
    getPhoneMobile,
    getEmailAddress,
    phoneCheckPass,
    emailCheckPass
  } = options;

  const { locale } = useRouter();
  const captcha = useCaptcha();
  const { userInfo } = useUserInfo();

  /** 解绑场景和绑定场景使用不同的 code_type / email_type */
  const isUnbindScene = scene.startsWith('unbind_');
  const isPasskey = scene === 'passkey';
  const isApis = scene === 'openapi';
  const isResetPassword = scene === 'reset_password';
  const sendCodeType = isUnbindScene
    ? EmailCodeType.unbind_opt_scenes
    : EmailCodeType.bind_opt_scenes;

  const [countryCodeList, setCountryCodeList] = useState<any[]>([]);
  const [currentCodeInfo, setCurrentCodeInfo] = useState<CountryCodeInfo>({
    area_code: '86',
    country: 'CN'
  });

  const {
    countdown: countdownPhone,
    isResendDisabled: isPhoneResendDisabled,
    resendTimeInterver: startPhoneCountdown,
    clearTimeInterver: clearPhoneCountdown
  } = useCountDown();

  const {
    countdown: countdownEmail,
    isResendDisabled: isEmailResendDisabled,
    resendTimeInterver: startEmailCountdown,
    clearTimeInterver: clearEmailCountdown
  } = useCountDown();

  /** 弹框打开且包含手机验证项时拉取区号列表（collect-only 不需要，后端自行取） */
  useEffect(() => {
    if (isModalOpen && showPhone && !isCollectOnly) {
      fetchCountryCode();
    }
  }, [isModalOpen, showPhone, isCollectOnly]);

  /** 组件卸载时清理倒计时定时器 */
  useEffect(() => {
    return () => {
      clearPhoneCountdown();
      clearEmailCountdown();
    };
  }, []);

  /** 获取国家区号列表 + 当前用户所在国家的默认区号 */
  const fetchCountryCode = async () => {
    const list = await getCountryList();
    setCountryCodeList(list);
    const current = await getCurrentCountryCode();
    setCurrentCodeInfo(current);
    return current;
  };

  /** 用户手动切换区号时同步更新 country 信息（给 postMultiBind 的 country_code 用） */
  const handleAreaCode = (val: string) => {
    const country = countryCodeList.find((it) => it.area_code == val)?.code;
    setCurrentCodeInfo({ area_code: val, country });
  };

  /**
   * 发送手机验证码
   * - passkey：带 userInfo 手机号 + passkey_* code_type
   * - openapi / 解绑：area_code、mobile 传空，后端按登录态取号
   * - 其他：传入用户输入或 userInfo 手机号
   */
  const resolvePhoneCodeType = () => {
    if (isResetPassword) {
      return PhoneCodeType.reset_pwd_sms;
    }
    if (isPasskey) {
      // 通行密钥专用；getActionType 避免 delete 时仍发 passkey_create
      const type = getActionType?.() || actionType || 'create';
      return PASSKEY_PHONE_CODE_TYPE_MAP[type] || PhoneCodeType.passkey_create;
    }
    if (isApis) {
      // openapi 只认 actionType prop，与通行密钥无关
      return APIS_PHONE_CODE_TYPE_MAP[actionType || 'create'] || PhoneCodeType.apiKey_2fa_create;
    }
    return sendCodeType;
  };

  const resolveEmailCodeType = () => {
    if (isResetPassword) {
      return EmailCodeType.find_password;
    }
    if (isPasskey) {
      const type = getActionType?.() || actionType || 'create';
      return PASSKEY_EMAIL_CODE_TYPE_MAP[type] || EmailCodeType.passkey_create;
    }
    if (isApis) {
      return APIS_EMAIL_CODE_TYPE_MAP[actionType || 'create'] || EmailCodeType.apiKey_2fa_create;
    }
    return sendCodeType;
  };

  async function sendPhoneCode(captchaInfo: any) {
    if (isPasskey || isResetPassword) {
      await postPhoneCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: captchaInfo?.geetest_challenge,
        geetest_validate: captchaInfo?.geetest_validate,
        geetest_seccode: captchaInfo?.geetest_seccode,
        code_type: resolvePhoneCodeType(),
        area_code: userInfo?.area_code || '',
        mobile: userInfo?.mobile || ''
      });
      return;
    }
    if (isCollectOnly || isUnbindScene) {
      await postPhoneCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: captchaInfo?.geetest_challenge,
        geetest_validate: captchaInfo?.geetest_validate,
        geetest_seccode: captchaInfo?.geetest_seccode,
        code_type: resolvePhoneCodeType(),
        area_code: '',
        mobile: ''
      });
      return;
    }
    const mobile = getPhoneMobile();
    if (!mobile) return;
    await postPhoneCodeSend({
      captcha_type: 'geetest',
      geetest_challenge: captchaInfo?.geetest_challenge,
      geetest_validate: captchaInfo?.geetest_validate,
      geetest_seccode: captchaInfo?.geetest_seccode,
      code_type: sendCodeType,
      area_code: isBindMobile ? currentCodeInfo.area_code : userInfo?.area_code,
      mobile
    });
  }

  /**
   * 发送邮箱验证码
   * - passkey / openapi / 解绑：不传 email，后端按登录态取邮箱
   * - 其他：传入用户输入或 userInfo 邮箱
   */
  async function sendEmailCode(captchaInfo: any) {
    if (isResetPassword) {
      await postEmailCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: captchaInfo?.geetest_challenge,
        geetest_validate: captchaInfo?.geetest_validate,
        geetest_seccode: captchaInfo?.geetest_seccode,
        email_type: resolveEmailCodeType(),
        email: userInfo?.email,
        lang: locale
      });
      return;
    }
    if (isCollectOnly || isUnbindScene) {
      await postEmailCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: captchaInfo?.geetest_challenge,
        geetest_validate: captchaInfo?.geetest_validate,
        geetest_seccode: captchaInfo?.geetest_seccode,
        email_type: resolveEmailCodeType(),
        lang: locale
      });
      return;
    }
    const email = getEmailAddress();
    if (!email) return;
    await postEmailCodeSend({
      captcha_type: 'geetest',
      geetest_challenge: captchaInfo?.geetest_challenge,
      geetest_validate: captchaInfo?.geetest_validate,
      geetest_seccode: captchaInfo?.geetest_seccode,
      email_type: sendCodeType,
      email,
      lang: locale
    });
  }

  /**
   * 统一入口：弹出极验 → 成功后启动倒计时 → 调用对应的发送 API
   * 由 VerifyFormModal 的"发送验证码"按钮触发
   */
  const showCaptchaAndSend = async (type: 'phone' | 'email') => {
    if (type === 'phone') {
      if (isPhoneResendDisabled) return;
      if (isBindMobile && !getPhoneMobile()) return;
      try {
        const captchaInfo = await captcha.showCaptcha();
        startPhoneCountdown();
        await sendPhoneCode(captchaInfo);
      } catch {
        // captcha cancelled or failed
      }
    } else {
      if (isEmailResendDisabled) return;
      try {
        const captchaInfo = await captcha.showCaptcha();
        startEmailCountdown();
        await sendEmailCode(captchaInfo);
      } catch {
        // captcha cancelled or failed
      }
    }
  };

  /** 重置所有倒计时（弹框关闭时由 VerifyFormModal 调用） */
  const resetCountdowns = () => {
    clearPhoneCountdown();
    clearEmailCountdown();
  };

  return {
    countryCodeList,
    currentCodeInfo,
    handleAreaCode,
    countdownPhone,
    countdownEmail,
    isPhoneResendDisabled,
    isEmailResendDisabled,
    showCaptchaAndSend,
    resetCountdowns,
    fetchCountryCode
  };
}
