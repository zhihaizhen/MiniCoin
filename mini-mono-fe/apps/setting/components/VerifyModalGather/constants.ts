/**
 * VerifyModalGather 配置常量集中管理
 *
 * 三层组件（编排层 / 选择层 / 表单层）共用的静态映射全部定义在此文件，
 * 新增 scene 或调整 UI 映射时只需改这一处。
 */

import React from 'react';
import { EmailCodeType, PhoneCodeType } from '~/constant';
import { ReactComponent as EmailIcon } from '~/public/images/accountSafe/email-icon.svg';
import { ReactComponent as MobileIcon } from '~/public/images/accountSafe/phone.svg';
import { ReactComponent as GoogleIcon } from '~/public/images/accountSafe/2fa.svg';
import type { VerifyQueueData, VerifyScene } from './types';
import type { PasskeySceneConfigItem } from '~/types/passkey';

// ─── 编排层 (index.tsx) ───

/** 验证类型 → 用户是否已开启该验证方式（从 userInfo 判断） */
export const VERIFY_TYPE_ENABLED_MAP: Record<string, (u: any) => boolean> = {
  email_code: (u) => !!u?.email_is_verified,
  mobile_code: (u) => !!u?.mobile_is_verified,
  '2fa_code': (u) => !!u?.google2fa_is_verified
};

/** scene → mode 自动推导映射，也可通过 props.mode 显式覆盖 */
export const SCENE_MODE_MAP: Record<string, string> = {
  bind_mobile: 'required',
  bind_email: 'required',
  unbind_mobile: 'required',
  unbind_email: 'required',
  unbind_2fa: 'required',
  reset_password: 'select',
  withdraw: 'select',
  openapi: 'select',
  passkey: 'select'
};

/** 不走 Passkey 优先验证：管理页新增/删除、绑定手机/邮箱（仍需目标值） */
export const PASSKEY_EXEMPT_SCENES = new Set<VerifyScene>([
  'passkey',
  'bind_mobile',
  'bind_email'
]);

/** 前端 VerifyScene → 后端 passkey scene；仅接入场景出现在此表 */
export const VERIFY_SCENE_TO_PASSKEY_SCENE: Partial<Record<VerifyScene, string>> = {
  unbind_mobile: 'change_mobile',
  unbind_email: 'change_email',
  unbind_2fa: 'google_authenticator',
  openapi: 'api_key',
  reset_password: 'change_password'
};

export function pickPasskeySceneConfig(
  res: unknown,
  backendScene: string
): PasskeySceneConfigItem | undefined {
  if (!res || typeof res !== 'object') return undefined;
  const obj = res as {
    configs?: PasskeySceneConfigItem[];
    scene?: string;
    enabled?: boolean;
  };
  const list = Array.isArray(obj.configs)
    ? obj.configs
    : Array.isArray(res)
      ? (res as PasskeySceneConfigItem[])
      : [];
  const matched = list.find((item) => item.scene === backendScene);
  if (matched) return matched;
  if (obj.scene === backendScene) {
    return obj as PasskeySceneConfigItem;
  }
  return undefined;
}

// ─── 选择层 (SelectVerifyModal.tsx) ───

/** 验证类型 → 展示名称的 i18n key */
export const VERIFY_LABEL_MAP: Record<string, string> = {
  mobile_code: 'phoneVerify',
  email_code: 'emailVertify',
  '2fa_code': 'google2faVerify'
};

/** 需要展示"推荐"标签的验证类型 */
export const VERIFY_RECOMMEND_TYPES = new Set(['2fa_code']);

/** 验证类型 → 图标组件 */
export const VERIFY_ICON_MAP: Record<string, React.ReactNode> = {
  mobile_code: React.createElement(MobileIcon),
  email_code: React.createElement(EmailIcon),
  '2fa_code': React.createElement(GoogleIcon)
};

// ─── 表单层 (VerifyFormModal.tsx) ───

/**
 * scene → 弹框标题 i18n key
 * - default: 首次绑定/操作时的标题
 * - change:  修改已有绑定时的标题（如"更换手机号"）
 */
export const SCENE_TITLE_MAP: Record<string, { default: string; change: string }> = {
  bind_mobile: { default: 'bindPhoneModal-title', change: 'bindPhoneModalChange' },
  bind_email: { default: 'bindEmailModal-title', change: 'bindEmailModalChange' },
  unbind_mobile: { default: 'unbindPhoneModal-title', change: 'unbindPhoneModal-title' },
  unbind_email: { default: 'unbindEmailModal-title', change: 'unbindEmailModal-title' },
  unbind_2fa: { default: 'unbindModal-title', change: 'unbindModal-title' },
  reset_password: { default: 'changePwd-title', change: 'changePwd-title' },
  openapi: { default: 'safe-verify', change: 'safe-verify' },
  withdraw: { default: 'safe-verify', change: 'safe-verify' },
  passkey: { default: 'safe-verify', change: 'safe-verify' }
};

/** scene → postMultiBind/postMultiUnbind 的 operation 参数 */
export const SCENE_OPERATION_MAP: Record<string, string> = {
  bind_mobile: 'mobile',
  bind_email: 'email',
  unbind_mobile: 'mobile',
  unbind_email: 'email',
  unbind_2fa: 'twofa'
};

/**
 * 后端错误码 → 对应表单字段名 + 前端错误提示 i18n key
 * 用于 onFinish catch 中自动聚焦到出错的输入框并显示本地化错误信息
 *
 * 2001248  — 邮箱验证码错误
 * 2001249  — 手机验证码错误
 * 20005001 — 2FA 验证码错误
 */
export const ERROR_CODE_FIELD_MAP: Record<string, { field: string; msgKey: string }> = {
  '2001248': { field: 'emailPwd', msgKey: 'verifyError-email' },
  '2001249': { field: 'phonePwd', msgKey: 'verifyError-phone' },
  '20005001': { field: 'twoFaCode', msgKey: 'verifyError-2fa' },
  '20007009': { field: 'emailPwd', msgKey: 'verifyError-email' },
  '20007004': { field: 'phonePwd', msgKey: 'verifyError-phone' }
};

/** scene → 操作成功后的 message.success 提示 i18n key */
export const SCENE_SUCCESS_MSG_MAP: Record<string, string> = {
  bind_mobile: 'bindPhoneSuccess',
  bind_email: 'bindEmailSuccess',
  unbind_mobile: 'unbindPhoneSuccess',
  unbind_email: 'unbindEmailSuccess',
  unbind_2fa: 'unbind2faSuccess'
};

/** scene → 底部风险提示 i18n key（无配置则不展示 tips） */
export const SCENE_TIPS_MAP: Record<string, string> = {
  bind_mobile: 'withdrawTipsBindPhone',
  bind_email: 'withdrawTipsBindEmail',
  unbind_mobile: 'withdrawTipsUnBindPhone',
  unbind_email: 'withdrawTipsUnBindEmail',
  unbind_2fa: 'withdrawTipsUnBindGa',
  reset_password: 'withdrawTipsAfterChange'
};

/**
 * openapi 场景根据 actionType 确定邮箱验证码发送类型
 * actionType 由 newapi 页面传入，对应 API Key 的 CRUD 操作
 */
export const APIS_EMAIL_CODE_TYPE_MAP: Record<string, string> = {
  create: EmailCodeType.apiKey_2fa_create,
  'edit-submit': EmailCodeType.apiKey_2fa_create,
  delete: EmailCodeType.apiKey_2fa_del,
  detail: EmailCodeType.apiKey_2fa_detail
};

/** openapi 场景根据 actionType 确定手机验证码发送类型 */
export const APIS_PHONE_CODE_TYPE_MAP: Record<string, string> = {
  create: PhoneCodeType.apiKey_2fa_create,
  'edit-submit': PhoneCodeType.apiKey_2fa_create,
  delete: PhoneCodeType.apiKey_2fa_del,
  detail: PhoneCodeType.apiKey_2fa_detail
};

/**
 * 收集验证码后由父组件继续业务的场景（联系方式取自 userInfo，不走 bind 输入）
 */
export const COLLECT_ONLY_SCENES = new Set(['openapi', 'passkey', 'reset_password']);

/** passkey 场景邮箱验证码类型（按 actionType：create / delete） */
export const PASSKEY_EMAIL_CODE_TYPE_MAP: Record<string, string> = {
  create: EmailCodeType.passkey_create,
  delete: EmailCodeType.passkey_delete
};

/** passkey 场景手机验证码类型（按 actionType：create / delete） */
export const PASSKEY_PHONE_CODE_TYPE_MAP: Record<string, string> = {
  create: PhoneCodeType.passkey_create,
  delete: PhoneCodeType.passkey_delete
};

/**
 * 创建通行密钥：只走邮箱 + 谷歌，不再 3 选 2。
 * 两项都已绑定时跳过选择层直接进表单；缺绑定时走 select 的「去认证」。
 */
export const PASSKEY_CREATE_QUEUE: VerifyQueueData = {
  required: [],
  strong_factor: [
    { id: 'email_code', type: 'email_code', priority: 1, send_required: true },
    { id: '2fa_code', type: '2fa_code', priority: 2, send_required: false }
  ],
  strong_factor_min_pass: 2
};
