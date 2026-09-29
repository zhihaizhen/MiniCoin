/**
 * VerifyModalGather — 编排层（入口组件）
 *
 * 职责：
 * 1. 已绑定 Passkey 且场景未豁免时，优先打开 PasskeyVerifyModal
 * 2. 否则调用 getVerifyQueue 获取当前 scene 的验证方式队列
 *    （passkey create 例外：固定邮箱 + 谷歌，不走 3 选 2）
 * 3. 按 mode（required / select）决定是否跳过选择弹框
 * 4. 管理 SelectVerifyModal / VerifyFormModal / PasskeyVerifyModal 的生命周期
 *
 * 对外通过 ref 暴露 changeModalVisible / openSelectVerifyModal 控制开关
 */

import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/router';
import { message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { getPasskeySceneConfig, getVerifyQueue } from '~/api';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { basePath } from '@better-bit-fe/base-utils';
import SelectVerifyModal from './SelectVerifyModal';
import VerifyFormModal from './VerifyFormModal';
import PasskeyVerifyModal from './PasskeyVerifyModal';
import {
  VERIFY_TYPE_ENABLED_MAP,
  SCENE_MODE_MAP,
  PASSKEY_EXEMPT_SCENES,
  VERIFY_SCENE_TO_PASSKEY_SCENE,
  PASSKEY_CREATE_QUEUE,
  pickPasskeySceneConfig
} from './constants';
import { getWebAuthnAssertionSupportStatus } from '~/utils/passkey/assertion';

import type { VerifyScene, VerifyMode, VerifyQueueData, VerifyQueueItem } from './types';
import type { SelectVerifyModalRef } from './SelectVerifyModal';
import type { VerifyFormModalRef } from './VerifyFormModal';
import type { PasskeyVerifyModalRef } from './PasskeyVerifyModal';

export type { VerifyScene, VerifyMode };
interface VerifyModalGatherProps {
  scene: VerifyScene;
  mode?: VerifyMode;
  onSuccess?: () => void;
  /**
   * openapi / passkey / reset_password：只收集验证码回调给父组件，由父组件调实际接口
   * 返回 Promise：resolve 才关闭弹框，reject（携带后端错误 code）则保持弹框打开并行内提示
   */
  onVerifyComplete?: (codes: Record<string, string>) => Promise<void> | void;
  /**
   * 操作类型，影响验证码 email_type / code_type：
   * - openapi：create / edit-submit / delete / detail
   * - passkey：create / delete（由通行密钥页传入）
   */
  actionType?: string;
  /**
   * 仅通行密钥使用：同步读取最新 actionType。
   * 解决 delete 时 setState 后立刻开弹框、发送验证码仍读到 create 的问题。
   * openapi 不传此参数，继续只用 actionType。
   */
  getActionType?: () => string | undefined;
  /** 弹框层级，openapi 场景需叠在 CreateApiModal 上方时传 2000 */
  zIndex?: number;
}

export interface VerifyModalGatherRef {
  /** 打开（true）或关闭（false）整个验证流程；isChange 为 true 时进入"修改已有绑定"模式 */
  changeModalVisible: (visible: boolean, isChange?: boolean) => void;
  /** 直接打开选择弹框（等同于 changeModalVisible(true)） */
  openSelectVerifyModal: (isChange?: boolean) => void;
}

/** required 模式下，过滤 strong_factor 只保留用户已验证的方式 */
function filterByUserInfo(items: VerifyQueueItem[] | undefined, userInfo: any): VerifyQueueItem[] {
  return (items || []).filter((item) => {
    const check = VERIFY_TYPE_ENABLED_MAP[item.type];
    return check ? check(userInfo) : true;
  });
}

/** 构建用户已验证方式的 Set */
function buildVerifiedTypes(userInfo: any): Set<string> {
  const set = new Set<string>();
  if (userInfo?.email_is_verified) set.add('email_code');
  if (userInfo?.mobile_is_verified) set.add('mobile_code');
  if (userInfo?.google2fa_is_verified) set.add('2fa_code');
  return set;
}

const UNBIND_CONTACT_SCENES = new Set<VerifyScene>(['unbind_mobile', 'unbind_email']);

function VerifyModalGather(props: VerifyModalGatherProps, ref: React.Ref<VerifyModalGatherRef>) {
  const { scene, mode: modeProp, onSuccess, onVerifyComplete, actionType, getActionType, zIndex } = props;
  const mode = (modeProp || SCENE_MODE_MAP[scene] || 'required') as VerifyMode;
  const t = useFm();
  const router = useRouter();
  const selectRef = useRef<SelectVerifyModalRef>(null);
  const formRef = useRef<VerifyFormModalRef>(null);
  const passkeyRef = useRef<PasskeyVerifyModalRef>(null);
  const isChangeRef = useRef(false);
  const skipPasskeyThisCycleRef = useRef(false);
  const { userInfo } = useUserInfo();

  const verifiedTypes = useMemo(() => buildVerifiedTypes(userInfo), [userInfo]);

  /** required 模式：过滤 strong_factor，≤1 项时跳过选择直接进表单 */
  const openRequiredMode = (data: VerifyQueueData) => {
    const filteredStrong = filterByUserInfo(data?.strong_factor, userInfo);
    const requiredTypes = (data?.required || []).map((i) => i.type);
    const strongTypes = filteredStrong.map((i) => i.type);

    if (filteredStrong.length <= 1) {
      formRef.current?.open([...requiredTypes, ...strongTypes], isChangeRef.current);
      return;
    }

    selectRef.current?.open({
      ...data,
      required: data?.required || [],
      strong_factor: filteredStrong
    });
  };

  /** select 模式：已验证项刚好 = minPass 时跳过选择直接进表单 */
  const openSelectMode = (data: VerifyQueueData) => {
    const allItems = data?.strong_factor || [];
    const minPass = data?.strong_factor_min_pass ?? 2;
    const verifiedItems = allItems.filter((item) => verifiedTypes.has(item.type));

    if (verifiedItems.length === minPass) {
      formRef.current?.open(verifiedItems.map((i) => i.type), isChangeRef.current);
      return;
    }

    selectRef.current?.open(data);
  };

  const openLegacyVerify = async () => {
    const resolvedAction = getActionType?.() ?? actionType;
    // 创建通行密钥：固定邮箱 + 谷歌，缺绑定走「去认证」，不再请求 3 选 2 队列
    if (scene === 'passkey' && resolvedAction === 'create') {
      openSelectMode(PASSKEY_CREATE_QUEUE);
      return;
    }

    try {
      const data = (await getVerifyQueue({ scene })) as unknown as VerifyQueueData;
      if (mode === 'required') {
        openRequiredMode(data);
      } else {
        openSelectMode(data);
      }
    } catch (error) {
      console.error('[VerifyModalGather] 获取验证队列失败:', error);
    }
  };

  /**
   * 核心流程入口：Passkey 优先判定 → 否则 getVerifyQueue 分发
   */
  const fetchAndOpen = async (isChange?: boolean) => {
    if (UNBIND_CONTACT_SCENES.has(scene)) {
      const contactCount = [userInfo?.email_is_verified, userInfo?.mobile_is_verified].filter(Boolean).length;
      if (contactCount <= 1) {
        message.error(t('unbindLastVerifyTip'));
        return;
      }
    }
    isChangeRef.current = !!isChange;

    const backendScene = VERIFY_SCENE_TO_PASSKEY_SCENE[scene];
    const canConsiderPasskey =
      !skipPasskeyThisCycleRef.current &&
      !PASSKEY_EXEMPT_SCENES.has(scene) &&
      !!backendScene &&
      userInfo?.passkey_is_verified === true &&
      getWebAuthnAssertionSupportStatus().ok;

    if (canConsiderPasskey && backendScene) {
      try {
        const configRes = await getPasskeySceneConfig(backendScene);
        const config = pickPasskeySceneConfig(configRes, backendScene);
        if (config?.enabled === true) {
          passkeyRef.current?.open(isChangeRef.current);
          return;
        }
      } catch {
        // scene-config 失败：静默降级到原验证码流程
      }
    }

    await openLegacyVerify();
  };

  /** SelectVerifyModal 点击确认后，将选中的验证类型传给 VerifyFormModal 打开表单 */
  const handleSelectConfirm = (types: string[]) => {
    formRef.current?.open(types, isChangeRef.current);
  };

  /** select 模式下未验证项点击「去认证」→ 关闭选择弹框并跳转安全设置；谷歌项带 ?2fa=1 自动打开绑定 */
  const handleGoToSecurity = (type?: string) => {
    selectRef.current?.close();
    const query = type === '2fa_code' ? '?2fa=1' : '';
    router.push(`/${router.locale}${basePath}/account-safe${query}`);
  };

  const handlePasskeyFallback = (isChange: boolean) => {
    skipPasskeyThisCycleRef.current = true;
    passkeyRef.current?.close();
    void fetchAndOpen(isChange);
  };

  useImperativeHandle(ref, () => ({
    changeModalVisible: (visible: boolean, isChange?: boolean) => {
      if (visible) {
        skipPasskeyThisCycleRef.current = false;
        void fetchAndOpen(isChange);
      } else {
        passkeyRef.current?.close();
        selectRef.current?.close();
        formRef.current?.close();
      }
    },
    openSelectVerifyModal: (isChange?: boolean) => {
      skipPasskeyThisCycleRef.current = false;
      void fetchAndOpen(isChange);
    }
  }));

  return (
    <>
      <PasskeyVerifyModal
        ref={passkeyRef}
        scene={scene}
        onVerifyComplete={onVerifyComplete}
        onFallback={handlePasskeyFallback}
        onSuccess={onSuccess}
        zIndex={zIndex}
      />
      <SelectVerifyModal
        ref={selectRef}
        mode={mode}
        verifiedTypes={verifiedTypes}
        onConfirm={handleSelectConfirm}
        onGoToSecurity={handleGoToSecurity}
        zIndex={zIndex}
      />
      <VerifyFormModal
        ref={formRef}
        scene={scene}
        onSuccess={onSuccess}
        onVerifyComplete={onVerifyComplete}
        actionType={actionType}
        getActionType={getActionType}
        zIndex={zIndex}
      />
    </>
  );
}

export default forwardRef(VerifyModalGather);
