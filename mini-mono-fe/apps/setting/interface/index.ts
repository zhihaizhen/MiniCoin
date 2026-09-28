import React, { ReactNode } from 'react';
import cls from 'classnames';
import Style from '~/components/AccountSafe/DashBoard/index.module.less';

/**
 * KYC 认证状态
 */
export enum KycStatus {
  Unknown = 'unknown',
  Pending = 'pending',
  Passed = 'passed',
  Rejected = 'rejected',
}

/**
 * KYC 认证等级
 */
export enum KycLevel {
  Level0 = 0, // 未认证
  Level1 = 1, // 基础认证
  Level2 = 2, // 高级认证
}

export interface UserInfo {
  id?: string | number;
  avatar?: string;
  nick_name?: string;
  vague_email?: string;
  email?: string;
  vague_mobile?: string;
  kyc_level?: KycLevel;
  kyc_status?: KycStatus;
  passkey_is_verified: boolean;
  google2fa_is_verified: boolean;
  email_is_verified: boolean;
  mobile_is_verified: boolean;
  avatar_last_updated_at: number;
  nick_name_last_updated_at: number;
}

export interface EditNickNameModalRef {
  changeEditModalVisible: (visible: boolean, type?: string) => void;
}

export interface EditAvatarModalRef {
  changeEditModalVisible: (visible: boolean) => void;
}

export interface TwoFaRef {
  setUp2fa: () => void;
}

export interface TextFormatter {
  (key: string, fallback: string): string;
}

export interface InfoField {
  label: string;
  value: ReactNode;
}
