import { useEffect, useRef, useState } from 'react';
import { message, Modal, Button } from 'antd';
import { ReactComponent as IconPasskey } from '~/public/images/passkey.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getLang, RequestError } from '@better-bit-fe/base-utils';
import {
  getWebAuthnSupportStatus,
  buildAssertionPublicKey,
  getAssertion,
  serializeAssertionCredential,
  isNotAllowedError,
  type WebAuthnSupportStatus
} from '~/utils/passkey/webauthn';
import { getOrCreatePasskeyDeviceId } from '~/utils/passkey/deviceId';
import {
  createInitialSilentFailureState,
  recordSilentFailure,
  resetSilentFailure,
  type SilentFailureState
} from '~/utils/passkey/silentFailureCounter';
import { postPasskeyLoginOptions, postPasskeyLogin } from '~/api';
import { CODE_PASSKEY_CREDENTIAL_GONE } from '~/constants';
import type { PasskeyLoginResponse } from '~/types/passkey';
import Style from './index.module.less';

export interface PasskeyLoginProps {
  referralCode?: string;
  checkIpRestriction?: () => Promise<boolean>;
  active?: boolean;
}

export default function PasskeyLogin({
  checkIpRestriction,
  active = true
}: PasskeyLoginProps) {
  const t = useFm();
  const lang = getLang();
  const { updateUserInfo } = useUserInfo();

  // 组件挂载时同步计算一次支持性检测结果（Requirement 2.1）
  const [supportStatus] = useState<WebAuthnSupportStatus>(() =>
    getWebAuthnSupportStatus()
  );
  const [webAuthnLoading, setWebAuthnLoading] = useState<boolean>(false);
  // 「Passkey 凭证已失效」提示 UI 展示状态（Requirement 6.2）
  const [credentialGoneVisible, setCredentialGoneVisible] =
    useState<boolean>(false);

  // 静默失败计数器（不触发重渲染，语义上是内存计数器，见 design.md「组件设计」）
  const silentFailureRef = useRef<SilentFailureState>(
    createInitialSilentFailureState()
  );
  // 记录上一次的 active 值，用于检测「离开当前 Tab」（true -> false）的边沿变化（Requirement 6.11）
  const prevActiveRef = useRef<boolean>(active);

  // active 由 true 变为 false（用户离开当前 Passkey 登录 Tab）时，重置静默失败计数器
  useEffect(() => {
    if (prevActiveRef.current && !active) {
      silentFailureRef.current = resetSilentFailure();
    }
    prevActiveRef.current = active;
  }, [active]);

  // 可点击态：支持 WebAuthn 且当前没有进行中的请求
  const clickable = supportStatus.ok && !webAuthnLoading;

  const handleSwitchMethod = () => {
    setCredentialGoneVisible(false);
  };

  const handleRebind = () => {
    setCredentialGoneVisible(false);
    message.info(t('passkey-login-rebind-hint'));
  };

  const handlePasskeyLogin = async () => {
    if (!supportStatus.ok) {
      message.error(t('passkey-login-unsupported'));
      return;
    }
    // 防止上一次请求未完成前重复点击产生并发请求（Requirement 3.8）
    if (webAuthnLoading) {
      return;
    }
    setWebAuthnLoading(true);
    try {
      if (checkIpRestriction) {
        const restricted = await checkIpRestriction();
        if (restricted) {
          setWebAuthnLoading(false);
          return;
        }
      }
      const deviceId = getOrCreatePasskeyDeviceId();
      const optionsRes = await postPasskeyLoginOptions({
        login_mode: 'discoverable',
        device_id: deviceId
      });
      // 组装 WebAuthn 断言请求参数（缺失字段或非法 base64url 会在此抛出异常）
      const { challengeId, publicKey } = buildAssertionPublicKey(optionsRes);

      // 调起系统凭据选择器进行断言（Requirement 4.5），单独 try/catch
      // 区分「用户主动取消」（NotAllowedError，静默处理）与其他异常
      let credential: PublicKeyCredential | null;
      try {
        credential = await getAssertion(publicKey);
      } catch (assertionError) {
        if (isNotAllowedError(assertionError)) {
          // 用户主动取消：静默处理，不展示任何提示，仅内部累加计数（Requirement 6.1, 6.6）
          const { state, shouldToast } = recordSilentFailure(
            silentFailureRef.current,
            Date.now()
          );
          silentFailureRef.current = state;
          if (shouldToast) {
            message.error(t('passkey-login-silent-failure-fallback'));
          }
          setWebAuthnLoading(false);
          return;
        }
        // 其他异常（如浏览器/系统层面错误）：展示通用失败提示（Requirement 6.5）
        console.error('[PasskeyLogin] WebAuthn 断言失败:', assertionError);
        message.error(t('passkey-login-webauthn-failed'));
        setWebAuthnLoading(false);
        return;
      }
      if (!credential) {
        message.error(t('passkey-login-webauthn-failed'));
        setWebAuthnLoading(false);
        return;
      }

      // 序列化断言结果并提交登录（Requirement 4.6, 5.1）
      const serialized = serializeAssertionCredential(credential);
      let loginRes: PasskeyLoginResponse | undefined;
      try {
        loginRes = await postPasskeyLogin({
          challenge_id: challengeId,
          ...serialized
        });
      } catch (loginError) {
        const errorCode =
          loginError instanceof RequestError ? loginError.code : undefined;
        if (errorCode === CODE_PASSKEY_CREDENTIAL_GONE) {
          // 凭证已失效：展示带两个入口的提示 UI，不使用普通 toast（Requirement 6.2）
          setCredentialGoneVisible(true);
          setWebAuthnLoading(false);
          return;
        }
        // 其他业务错误码（挑战过期/无效）或网络异常（Requirement 6.3, 6.4）
        console.error('[PasskeyLogin] 提交登录失败:', loginError);
        message.error(t('passkey-login-challenge-expired'));
        setWebAuthnLoading(false);
        return;
      }

      // fetch 拦截器已在 code !== 0 时 reject，能走到这里说明 code === 0（Requirement 5.2）
      if (loginRes?.user_id) {
        try {
          await updateUserInfo();
          // 登录成功：重置静默失败计数器（Requirement 6.10）
          silentFailureRef.current = resetSilentFailure();
          message.success(t('loginTips'));
          window.location.href = `/${lang}/trade/usdt/BTCUSDT`;
        } catch (syncError) {
          console.error('[PasskeyLogin] 同步用户信息失败:', syncError);
          message.error(t('passkey-login-sync-failed'));
          setWebAuthnLoading(false);
        }
      } else {
        message.error(t('passkey-login-failed'));
        setWebAuthnLoading(false);
      }
    } catch (error) {
      console.error('[PasskeyLogin] 获取登录挑战失败:', error);
      message.error(t('passkey-login-failed'));
      setWebAuthnLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={handlePasskeyLogin}
        className={`${Style['custom-login-button']} ${clickable ? '' : Style['custom-login-button-disabled']
          }`}
      >
        <div className={Style['custom-login-img']}>
          <IconPasskey aria-hidden="true" />
        </div>
        <span className={Style['custom-login-text']}>
          {t('passkey-login-button')}
        </span>
      </div>
      {/* Passkey 凭证已失效提示 UI，包含「改用其他登录方式」与「重新绑定 Passkey」两个入口（Requirement 6.2） */}
      <Modal
        open={credentialGoneVisible}
        title={t('passkey-login-credential-gone-title')}
        onCancel={handleSwitchMethod}
        footer={[
          <Button key="switch-method" onClick={handleSwitchMethod}>
            {t('passkey-login-switch-method')}
          </Button>,
          <Button key="rebind" type="primary" onClick={handleRebind}>
            {t('passkey-login-rebind')}
          </Button>
        ]}
      >
        <p>{t('passkey-login-credential-gone-desc')}</p>
      </Modal>
    </>
  );
}
