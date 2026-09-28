import { useEffect } from "react";
import { message } from "antd";
import Image from 'next/image';
import queryString from "query-string";
import { gapiLogin } from "~/utils/google-login";
import { postOauthLogin } from '~/api';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { inviteModal } from '~/components/bindInviteCode';
import Style from "./index.module.less";
import { basePath, getLang } from '@better-bit-fe/base-utils';

export default function GoogleLogin({ referralCode, checkIpRestriction }: { referralCode?: string; checkIpRestriction?: () => Promise<boolean> }) {
  const t = useFm();
  const lang = getLang();
  const { isLogin } = useUserInfo();

  // Login Oauth2.0
  async function loginOauth(code: string) {
    try {
      const parsedReferralCode = referralCode || localStorage.getItem('REFERRAL_CODE_TEMP');
      const params = parsedReferralCode ? {
        type: 'google',
        access_code: code,
        referral_code: parsedReferralCode,
      } : {
        type: 'google',
        access_code: code,
      };
      const res = await postOauthLogin({
        ...params
      });
      message.success(t('loginTips'));
      if (res?.is_new_user) {
        localStorage.setItem('isNewUserFromThirdParty', res?.is_new_user);
        localStorage.setItem('bind_token', res?.bind_token);
        // 跳转到authThird状态页
        window.location.href = `/${lang}/account/authThird?type=google`;
      }
      // TODO: 后续需要优化, 新用户邀请码
      if (res?.is_new_user && !res?.referral_code) {
        inviteModal.changeInviteModalVisible(true);
      } else {
        setTimeout(() => {
          window.location.href = `/${lang}/trade/usdt/BTCUSDT`;
        }, 500);
      }
      localStorage.removeItem('REFERRAL_CODE_TEMP');
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  useEffect(() => {
    if (isLogin === false) {
      const parsed = queryString.parse(location.search);
      console.log('parsed', parsed);
      if (parsed.code && typeof parsed.code === 'string' && parsed.authuser) {
        loginOauth(parsed.code);
      }
    }
  }, [isLogin]);

  const handleGoogleLogin = async () => {
    try {
      if (checkIpRestriction) {
        const restricted = await checkIpRestriction();
        if (restricted) return;
      }
      if (referralCode) {
        localStorage.setItem('REFERRAL_CODE_TEMP', referralCode);
      }
      await gapiLogin(lang);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div onClick={handleGoogleLogin} className={Style['custom-login-button']}>
      <div className={Style['custom-login-img']}>
        <Image
          src={basePath + '/images/googleLogo.svg'}
          alt={'google-logo'}
          width={21}
          height={21}
        />
      </div>
      <span className={Style['custom-login-text']}>{t('continueWithGoogle')}</span>
    </div>
  );
}