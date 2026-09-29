import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { message } from 'antd';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getTmsMessages } from '@better-bit-fe/lang';
import { basePath } from '@better-bit-fe/base-utils';
import { useLoginRedirect } from '~/hooks/useLoginRedirect';
import {
  getPasskeyList,
  getPasskeySupportConfig,
  postPasskeyDelete,
  postPasskeyEdit,
  postPasskeyRegister,
  postPasskeyRegisterOptions
} from '~/api';
import VerifyModalGather from '~/components/VerifyModalGather';
import type { VerifyModalGatherRef } from '~/components/VerifyModalGather';
import DisclaimerModal from '~/components/Passkey/DisclaimerModal';
import PasskeyList from '~/components/Passkey/PasskeyList';
import RenameModal from '~/components/Passkey/RenameModal';
import DeleteConfirmModal from '~/components/Passkey/DeleteConfirmModal';
import type { PasskeyListItem, PasskeySupportConfig } from '~/types/passkey';
import {
  getOrCreatePasskeyDeviceId,
  setCurrentPasskeyCredentialId
} from '~/utils/passkey/deviceId';
import {
  buildDefaultPasskeyName,
  getDeviceName,
  getOsVersion
} from '~/utils/passkey/naming';
import {
  buildCreationPublicKey,
  createPasskey,
  getWebAuthnSupportStatus,
  isNotAllowedError,
  serializeCredential
} from '~/utils/passkey/webauthn';
import { ReactComponent as IconFingerprint } from '~/public/images/passkey/ic-fingerprint.svg';
import { ReactComponent as IconSafe } from '~/public/images/passkey/ic-safe.svg';
import { ReactComponent as IconCrossDevice } from '~/public/images/passkey/ic-cross-device.svg';
import Style from './index.module.less';
import styles from '../index.module.less';

type PasskeyActionType = 'create' | 'delete';

type VerifyCodeParams = {
  email_code?: string;
  mobile_code?: string;
  '2fa_code'?: string;
};

/** 验证码已通过、options 已拿到，但 WebAuthn 因手势失效未弹出时，暂存待下一次点击调起 */
type PendingWebAuthnCreate = {
  publicKey: PublicKeyCredentialCreationOptions;
  challengeId: string;
  defaultName: string;
  deviceName: string;
  deviceId: string;
  osVersion: string;
};

function normalizeList(res: unknown): PasskeyListItem[] {
  if (Array.isArray(res)) return res as PasskeyListItem[];
  if (res && typeof res === 'object') {
    const obj = res as { list?: PasskeyListItem[]; items?: PasskeyListItem[] };
    if (Array.isArray(obj.list)) return obj.list;
    if (Array.isArray(obj.items)) return obj.items;
  }
  return [];
}

function Page() {
  const t = useFm();
  const router = useRouter();
  const { userInfo, updateUserInfo } = useUserInfo();
  const verifyRef = useRef<VerifyModalGatherRef>(null);

  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [list, setList] = useState<PasskeyListItem[]>([]);
  const [supportConfig, setSupportConfig] = useState<PasskeySupportConfig | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState<PasskeyActionType>('create');
  const actionTypeRef = useRef<PasskeyActionType>('create');
  const setPasskeyActionType = (type: PasskeyActionType) => {
    actionTypeRef.current = type;
    setActionType(type);
  };
  const [pendingDeleteItem, setPendingDeleteItem] = useState<PasskeyListItem | null>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [renameItem, setRenameItem] = useState<PasskeyListItem | null>(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const [pendingWebAuthn, setPendingWebAuthn] = useState<PendingWebAuthnCreate | null>(
    null
  );
  const [webAuthnLoading, setWebAuthnLoading] = useState(false);

  useLoginRedirect();

  const refreshList = useCallback(async () => {
    const res = await getPasskeyList();
    setList(normalizeList(res));
  }, []);

  // 从「安全设置」点「绑定」跳转过来时（尚未绑定 passkey），带 skipList=1，
  // 明确已知列表为空，无需再打一次 list 接口
  const skipList = router.query.skipList === '1';

  useEffect(() => {
    if (!router.isReady) return;
    let cancelled = false;
    const bootstrap = async () => {
      setLoading(true);

      if (skipList) {
        try {
          const configRes = await getPasskeySupportConfig();
          if (cancelled) return;
          setSupportConfig((configRes || null) as PasskeySupportConfig | null);
          setList([]);
        } catch (e) {
          console.error('Passkey support-config failed:', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      // 配置与列表解耦：list 失败时不能丢掉已成功的 support-config，
      // 否则后续创建会因 !supportConfig?.rp_id 直接报「添加失败」且不发 register/options
      const [configResult, listResult] = await Promise.allSettled([
        getPasskeySupportConfig(),
        getPasskeyList()
      ]);
      if (cancelled) return;

      if (configResult.status === 'fulfilled') {
        setSupportConfig(
          (configResult.value || null) as PasskeySupportConfig | null
        );
      } else {
        console.error('Passkey support-config failed:', configResult.reason);
      }

      if (listResult.status === 'fulfilled') {
        setList(normalizeList(listResult.value));
      } else {
        console.error('Passkey list failed:', listResult.reason);
      }

      if (!cancelled) setLoading(false);
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, skipList]);

  const handleGoSecurity = () => {
    const locale = router.locale;
    router.push(`/${locale}${basePath}/account-safe`);
  };

  const maxCount = supportConfig?.max_passkey_count ?? 10;

  const handleOpenDisclaimer = () => {
    setDisclaimerOpen(true);
  };

  /** 点击添加：校验环境后直接打开验证码弹框，不再经过免责声明 */
  const handleStartAddPasskey = () => {
    const support = getWebAuthnSupportStatus();
    if (support.ok === false) {
      // 本地 http://自定义域名 属于非安全上下文，易被误判为「浏览器不支持」
      message.error(
        support.reason === 'insecure'
          ? t('passkey-insecure-context')
          : t('passkey-unsupported')
      );
      return;
    }
    if (list.length >= maxCount) {
      message.error(t('passkey-max-count', { count: maxCount }));
      return;
    }
    setPasskeyActionType('create');
    setPendingDeleteItem(null);
    verifyRef.current?.changeModalVisible(true);
  };

  const handleRename = (item: PasskeyListItem) => {
    setRenameItem(item);
  };

  const handleRenameConfirm = async (name: string) => {
    if (!renameItem) return;
    setRenameLoading(true);
    try {
      await postPasskeyEdit({ passkey_id: renameItem.passkey_id, name });
      message.success(t('passkey-rename-success'));
      setRenameItem(null);
      await refreshList();
    } catch (e) {
      console.error('Passkey rename failed:', e);
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDeleteClick = (item: PasskeyListItem) => {
    setPendingDeleteItem(item);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setPasskeyActionType('delete');
    verifyRef.current?.changeModalVisible(true);
  };

  const finishWebAuthnCreate = async (pending: PendingWebAuthnCreate) => {
    const cred = await createPasskey(pending.publicKey);
    if (!cred) {
      message.error(t('passkey-create-failed'));
      return;
    }

    const serialized = serializeCredential(cred);
    await postPasskeyRegister({
      challenge_id: pending.challengeId,
      name: pending.defaultName,
      device_name: pending.deviceName,
      device_id: pending.deviceId,
      os_version: pending.osVersion,
      ...serialized
    });

    setCurrentPasskeyCredentialId(serialized.raw_id);
    setPendingWebAuthn(null);
    message.success(t('passkey-add-success'));
    await refreshList();
    updateUserInfo?.();
  };

  /** 手势失效后：直接点页面主按钮，在新的用户点击里调起原生 Passkey 窗 */
  const handleContinueWebAuthn = async () => {
    if (!pendingWebAuthn || webAuthnLoading) return;
    setWebAuthnLoading(true);
    try {
      await finishWebAuthnCreate(pendingWebAuthn);
    } catch (e) {
      if (isNotAllowedError(e)) {
        // 用户主动取消原生窗：清理 pending，不 toast
        setPendingWebAuthn(null);
        return;
      }
      console.error('Passkey continue webauthn failed:', e);
      message.error(t('passkey-create-failed'));
    } finally {
      setWebAuthnLoading(false);
    }
  };

  const handlePrimaryAddClick = () => {
    if (pendingWebAuthn) {
      handleContinueWebAuthn();
      return;
    }
    handleStartAddPasskey();
  };

  /**
   * 用验证码换取 WebAuthn 创建所需的 options / challenge
   * 验证码错误会在 postPasskeyRegisterOptions 处 throw，交由验证弹框行内提示且保持弹框打开；
   * 不在这里调起 credentials.create()（原生窗不能叠在验证弹框上，需等弹框关闭后再触发）
   */
  const preparePasskeyCreate = async (
    codes: VerifyCodeParams
  ): Promise<PendingWebAuthnCreate> => {
    let config = supportConfig;
    if (!config?.rp_id) {
      try {
        config = (await getPasskeySupportConfig()) as PasskeySupportConfig;
        setSupportConfig(config || null);
      } catch (e) {
        console.error('Passkey support-config refetch failed:', e);
      }
    }
    if (!config?.rp_id) {
      throw new Error('passkey-support-config-missing');
    }
    if (list.length >= maxCount) {
      throw new Error('passkey-max-count-reached');
    }

    const defaultName = buildDefaultPasskeyName();
    const deviceName = getDeviceName();
    const osVersion = getOsVersion();
    const deviceId = getOrCreatePasskeyDeviceId();

    const optRes = await postPasskeyRegisterOptions({
      name: defaultName,
      device_name: deviceName,
      os_version: osVersion,
      device_id: deviceId,
      email_code: codes.email_code,
      mobile_code: codes.mobile_code,
      twofa_code: codes['2fa_code']
    });

    const { challengeId, publicKey } = buildCreationPublicKey(
      optRes as any,
      config,
      userInfo?.id
        ? { id: String(userInfo.id), name: userInfo.email || userInfo.username || String(userInfo.id) }
        : undefined
    );

    return {
      publicKey,
      challengeId,
      defaultName,
      deviceName,
      deviceId,
      osVersion
    };
  };

  /** 验证码校验通过、弹框已关闭后，正式唤起 WebAuthn 原生窗完成创建 */
  const startWebAuthnCreate = async (pending: PendingWebAuthnCreate) => {
    console.info('[Passkey] 调起 WebAuthn create', {
      rpId: pending.publicKey.rp?.id,
      origin: typeof window !== 'undefined' ? window.location.origin : '',
      isSecureContext:
        typeof window !== 'undefined' ? window.isSecureContext : false
    });
    setWebAuthnLoading(true);
    try {
      await finishWebAuthnCreate(pending);
    } catch (e) {
      // 异步请求后用户手势常已失效，Chrome 抛 NotAllowedError 且不弹窗；暂存后点主按钮重试
      if (isNotAllowedError(e)) {
        setPendingWebAuthn(pending);
        return;
      }
      console.error('Passkey create failed:', e);
      message.error(t('passkey-create-failed'));
    } finally {
      setWebAuthnLoading(false);
    }
  };

  const handleDeletePasskey = async (codes: VerifyCodeParams) => {
    if (!pendingDeleteItem) return;
    await postPasskeyDelete({
      passkey_id: pendingDeleteItem.passkey_id,
      email_code: codes.email_code,
      mobile_code: codes.mobile_code,
      twofa_code: codes['2fa_code']
    });
    message.success(t('passkey-delete-success'));
    setPendingDeleteItem(null);
    await refreshList();
    updateUserInfo?.();
  };

  /**
   * 传给 VerifyModalGather 的 onVerifyComplete：
   * - throw（如验证码错误）→ 验证弹框行内提示且不关闭
   * - resolve → 验证弹框自行关闭；create 场景在关闭后的下一帧再唤起 WebAuthn 原生窗
   */
  const handleVerifyComplete = async (codes: VerifyCodeParams) => {
    const currentAction = actionTypeRef.current;

    if (currentAction === 'delete') {
      await handleDeletePasskey(codes);
      setPasskeyActionType('create');
      return;
    }

    const pending = await preparePasskeyCreate(codes);
    // 验证码已确认正确：等验证弹框关闭、原生窗不再与其叠加后，再唤起 WebAuthn
    requestAnimationFrame(() => {
      void startWebAuthnCreate(pending);
    });
  };

  const featureItems = [
    {
      id: 'fingerprint',
      icon: <IconFingerprint className={Style.featureIcon} />,
      title: t('passkey-feature-1-title'),
      desc: t('passkey-feature-1-desc')
    },
    {
      id: 'safe',
      icon: <IconSafe className={Style.featureIcon} />,
      title: t('passkey-feature-2-title'),
      desc: t('passkey-feature-2-desc')
    },
    {
      id: 'cross-device',
      icon: <IconCrossDevice className={Style.featureIcon} />,
      title: t('passkey-feature-3-title'),
      desc: t('passkey-feature-3-desc')
    }
  ];

  const hasPasskeys = list.length > 0;

  return (
    <div className={Style.passkeyPage}>
      <div className={Style.headerBlock}>
        <div className={Style.breadcrumb}>
          <span className={Style.crumbMuted}>{t('passkey-breadcrumb-profile')}</span>
          <span className={Style.crumbSep}>/</span>
          <span className={Style.crumbLink} onClick={handleGoSecurity}>
            {t('passkey-breadcrumb-security')}
          </span>
          <span className={Style.crumbSep}>/</span>
          <span className={Style.crumbCurrent}>{t('passkey-title')}</span>
        </div>
        <div className={Style.titleSection}>
          <div className={Style.titleRow}>
            <h1 className={Style.mainTitle}>{t('passkey-title')}</h1>
            {hasPasskeys ? (
              <button
                type="button"
                className={Style.headerAddBtn}
                disabled={webAuthnLoading}
                onClick={handlePrimaryAddClick}
              >
                {t('passkey-add-btn')}
              </button>
            ) : null}
          </div>
          <p className={Style.pageDesc}>{t('passkey-page-desc')}</p>
        </div>
      </div>

      {!loading && !hasPasskeys ? (
        <div className={Style.card}>
          <div className={Style.cardBody}>
            <div className={Style.illustration}>
              <img
                src={`${basePath}/images/passkey/illustration.png`}
                alt=""
                width={120}
                height={120}
              />
            </div>
            <div className={Style.featureList}>
              {featureItems.map((item) => (
                <div className={Style.featureItem} key={item.id}>
                  <div className={Style.featureTitleRow}>
                    {item.icon}
                    <span className={Style.featureTitle}>{item.title}</span>
                  </div>
                  <div className={Style.featureDesc}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={Style.cardFooter}>
            <p className={Style.agreeText}>
              <span>{t('passkey-agree-prefix')}</span>
              <span className={Style.agreeLink} onClick={handleOpenDisclaimer}>
                {t('passkey-agree-link')}
              </span>
            </p>
            <button
              type="button"
              className={Style.addBtn}
              disabled={webAuthnLoading}
              onClick={handlePrimaryAddClick}
            >
              {t('passkey-add-btn')}
            </button>
          </div>
        </div>
      ) : null}

      {!loading && hasPasskeys ? (
        <div className={Style.listWrap}>
          <PasskeyList
            list={list}
            onRename={handleRename}
            onDelete={handleDeleteClick}
          />
        </div>
      ) : null}

      <DisclaimerModal
        visible={disclaimerOpen}
        onConfirm={() => setDisclaimerOpen(false)}
        onCancel={() => setDisclaimerOpen(false)}
      />

      <RenameModal
        visible={!!renameItem}
        initialName={renameItem?.name || renameItem?.device_name || ''}
        loading={renameLoading}
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameItem(null)}
      />

      <DeleteConfirmModal
        visible={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setPendingDeleteItem(null);
        }}
      />

      <VerifyModalGather
        ref={verifyRef}
        scene="passkey"
        actionType={actionType}
        getActionType={() => actionTypeRef.current}
        onVerifyComplete={handleVerifyComplete}
      />

      <Chat chatCls={styles['chat']} />
    </div>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['setting', 'error_code', 'verify-modal', 'passKey'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

export default withLayout(Page);
