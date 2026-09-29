/*
1. 用户点击 Apple 登录按钮
2. 优先尝试使用 Apple ID SDK 弹窗登录
3. 如果 SDK 不可用或失败，回退到重定向登录
4. 获取授权码和 ID Token
5. 调用后端 OAuth 登录接口
6. 处理登录结果（成功跳转或显示邀请码弹窗）
*/

import { useEffect } from 'react';
import { message } from 'antd';
import Image from 'next/image';
import queryString from 'query-string';
import { appleInit, appleLogin, appleLoginRedirect } from '~/utils/apple-login';
import { postOauthLogin } from '~/api';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { inviteModal } from '~/components/bindInviteCode';
import { getLang } from '@better-bit-fe/base-utils';
import Style from "../googleLogin/index.module.less";

interface AppleLoginProps {
  referralCode?: string;
  checkIpRestriction?: () => Promise<boolean>;
}

export default function AppleLogin({ referralCode, checkIpRestriction }: AppleLoginProps) {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const lang = getLang();

  // 检查 URL 中的 Apple 登录回调参数
  useEffect(() => {
    if (isLogin === false) {
      const parsed = queryString.parse(location.search);
      console.log('Apple login parsed:', parsed);

      // 处理 Apple 重定向回调
      if (parsed.code && parsed.state) {
        const savedState = sessionStorage.getItem('apple_login_state');
        if (savedState === parsed.state) {
          loginOauth(parsed.code as string, parsed.id_token as string);
          sessionStorage.removeItem('apple_login_state');
        } else {
          console.error('Apple login state mismatch');
          message.error('登录验证失败，请重试');
        }
      }
    }
  }, [isLogin]);

  // 初始化 Apple ID SDK
  useEffect(() => {
    const clientId =
      process.env.APPLE_CLIENT_ID || process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    const redirectURI =
      (process.env.NEXT_PUBLIC_APPLE_REDIRECT_URL as string) ||
      `https://${window.location.hostname}/account/login/`;

    if (clientId) {
      // 根据当前语言设置Apple SDK的语言
      const currentLang = lang || 'en-US';
      const appleLocale = currentLang.replace('-', '_'); // Apple SDK使用下划线格式，如 en_US, zh_CN

      // 动态加载 Apple ID SDK
      const script = document.createElement('script');
      script.src =
        `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/${appleLocale}/appleid.auth.js`;
      script.onload = () => {
        appleInit(clientId, redirectURI);
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [lang]);

  // Apple OAuth2.0 登录处理
  const loginOauth = async (code: string, identityToken?: string) => {
    try {
      const parsedReferralCode =
        referralCode || localStorage.getItem('REFERRAL_CODE_TEMP');
      const params = parsedReferralCode
        ? {
          type: 'apple',
          access_code: code,
          // id_token: identityToken, // Apple 特有的 id_token
          referral_code: parsedReferralCode
        }
        : {
          type: 'apple',
          access_code: code,
          // id_token: identityToken
        };

      const res = await postOauthLogin({
        ...params
      });

      message.success(t('loginTips'));

      if (res?.is_new_user) {
        localStorage.setItem('isNewUserFromThirdParty', res?.is_new_user);
        localStorage.setItem('bind_token', res?.bind_token);
        // 跳转到authThird状态页
        window.location.href = `/${lang}/account/authThird?type=apple`;
      }

      if (res?.is_new_user && !res?.referral_code) {
        inviteModal.changeInviteModalVisible(true);
      } else {
        setTimeout(() => {
          window.location.href = `/${lang}/trade/usdt/BTCUSDT`;
        }, 500);
      }

      localStorage.removeItem('REFERRAL_CODE_TEMP');
    } catch (error) {
      console.error('Apple login failed:', error);
      message.error(t('loginFailed') || 'Login failed');
    }
  }

  const handleAppleLogin = async () => {
    try {
      if (checkIpRestriction) {
        const restricted = await checkIpRestriction();
        if (restricted) return;
      }
      if (referralCode) {
        localStorage.setItem('REFERRAL_CODE_TEMP', referralCode);
      }

      // 优先尝试使用 SDK 弹窗登录
      if (typeof window !== 'undefined' && window.AppleID) {
        try {
          const response = await appleLogin();
          const { authorization } = response;
          await loginOauth(authorization.code, authorization.id_token);
        } catch (error: any) {
          // 检查是否是用户主动取消
          if (error?.userCancelled) {
            // console.log('用户取消了 Apple 登录');
            // 用户取消操作，不显示错误信息，也不回退到重定向
            return;
          }

          console.log('SDK login failed, falling back to redirect:', error);
          // 如果是其他错误，回退到重定向方式
          appleLoginRedirect(lang);
        }
      } else {
        // 如果 SDK 未加载，直接使用重定向方式
        appleLoginRedirect(lang);
      }
    } catch (error) {
      console.error('Apple login failed:', error);
      message.error(t('loginFailed') || 'Login failed');
    }
  };

  return (
    <div onClick={handleAppleLogin} className={Style['custom-login-button']}>
      <div className={Style['custom-login-img']}>
        <Image
          src={basePath + '/images/appleLogo.svg'}
          alt={'apple-logo'}
          width={18}
          height={23}
        />
      </div>
      <span className={Style['custom-login-text']}>{t('continueWithApple')}</span>
    </div>
  );
}
