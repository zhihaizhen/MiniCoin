/**
 * VerifyFormModal — 表单层
 *
 * 职责：
 * 1. 根据 selectedVerifyTypes 动态渲染验证码输入表单（RENDER_MAP 驱动）
 * 2. 使用 useVerifyCode hook 管理极验 + 倒计时 + 发送 API
 * 3. 提交时根据 scene 调用 postMultiBind / postMultiUnbind 或通过 onVerifyComplete 回调
 * 4. 后端错误码自动映射到对应输入框并显示本地化错误提示
 */

import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useCallback
} from 'react';
import { Button, Modal, Select, Form, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import ReactCountryFlag from 'react-country-flag';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getLang } from '@better-bit-fe/base-utils';
import { phoneValidate, emailValidate } from '~/utils/validation';
import { postMultiBind, postMultiUnbind } from '~/api';
import { ReactComponent as TipSvg } from '~/public/images/tips.svg';
import {
  SCENE_TITLE_MAP,
  SCENE_OPERATION_MAP,
  SCENE_TIPS_MAP,
  SCENE_SUCCESS_MSG_MAP,
  ERROR_CODE_FIELD_MAP,
  COLLECT_ONLY_SCENES
} from './constants';
import { useVerifyCode } from './useVerifyCode';
import Style from './index.module.less';

import type { VerifyScene } from './types';


/** 表单字段类型，涵盖 bind / unbind / openapi 各场景可能用到的字段 */
type FieldType = {
  phone?: string;
  newPhone?: string;
  phonePwd?: string;
  email?: string;
  newEmail?: string;
  emailPwd?: string;
  twoFaCode?: string;
  prefix?: string;
};

interface VerifyFormModalProps {
  scene: VerifyScene;
  onSuccess?: () => void;
  /**
   * openapi / passkey 场景：只收集验证码回调给父组件，由父组件调实际接口
   * 返回 Promise：resolve 才关闭弹框，reject（携带后端错误 code）则保持弹框打开，
   * 由本组件统一按 ERROR_CODE_FIELD_MAP 把错误映射到对应输入框
   */
  onVerifyComplete?: (codes: Record<string, string>) => Promise<void> | void;
  /**
   * 操作类型，影响验证码类型：
   * - openapi：create / edit-submit / delete / detail
   * - passkey：create / delete
   */
  actionType?: string;
  /** 仅通行密钥：同步读取最新 actionType；openapi 不使用 */
  getActionType?: () => string | undefined;
  zIndex?: number;
}

export interface VerifyFormModalRef {
  /** 打开表单弹框，verifyTypes 决定渲染哪些输入项，isChangeOp 控制"修改"模式 */
  open: (verifyTypes: string[], isChangeOp?: boolean) => void;
  close: () => void;
}


function VerifyFormModal(props: VerifyFormModalProps, ref: React.Ref<VerifyFormModalRef>) {
  const { scene, onSuccess, onVerifyComplete, actionType, getActionType, zIndex } = props;
  const t = useFm();
  const { updateUserInfo, userInfo } = useUserInfo();
  const formRef = useRef<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChange, setIsChange] = useState(false);
  const [selectedVerifyTypes, setSelectedVerifyTypes] = useState<string[]>([]);

  const [phoneInp, setPhoneInp] = useState('');
  const [newPhoneInp, setNewPhoneInp] = useState('');
  const [phoneCheckPass, setPhoneCheckPass] = useState(false);
  const [emailInp, setEmailInp] = useState('');
  const [newEmailInp, setNewEmailInp] = useState('');
  const [emailCheckPass, setEmailCheckPass] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  /** 提交中：禁用确认按钮，避免重复提交；错误场景下不关闭弹框，只回填行内错误 */
  const [submitting, setSubmitting] = useState(false);

  // ─── 场景标志 ───
  const showPhone = selectedVerifyTypes.includes('mobile_code');
  const showEmail = selectedVerifyTypes.includes('email_code');
  const show2FA = selectedVerifyTypes.includes('2fa_code');
  const isBindMobile = scene === 'bind_mobile';  // 绑定手机（需用户输入新手机号）
  const isBindEmail = scene === 'bind_email';    // 绑定邮箱（需用户输入新邮箱）
  const isCollectOnly = COLLECT_ONLY_SCENES.has(scene); // openapi / passkey：后端自行获取联系方式

  /** 获取当前手机号：bind 场景取用户输入，其他取 userInfo.mobile */
  const getPhoneMobile = useCallback((): string => {
    if (isBindMobile) return isChange ? newPhoneInp : phoneInp;
    return userInfo?.mobile || '';
  }, [isBindMobile, isChange, newPhoneInp, phoneInp, userInfo?.mobile]);

  /** 获取当前邮箱地址：bind 场景取用户输入，其他取 userInfo.email */
  const getEmailAddress = useCallback((): string => {
    if (isBindEmail) return isChange ? newEmailInp : emailInp;
    return userInfo?.email || '';
  }, [isBindEmail, isChange, newEmailInp, emailInp, userInfo?.email]);

  const {
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
  } = useVerifyCode({
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
  });

  /** 区号信息变化时同步到表单的 prefix 字段（根据用户所在地填充默认区号） */
  useEffect(() => {
    if (currentCodeInfo?.area_code) {
      formRef.current?.setFieldValue('prefix', currentCodeInfo.area_code);
    }
  }, [currentCodeInfo]);

  // ─── Ref API ───

  useImperativeHandle(ref, () => ({
    open: (verifyTypes: string[], isChangeOp?: boolean) => {
      setSelectedVerifyTypes(verifyTypes);
      setIsChange(!!isChangeOp);
      setIsModalOpen(true);
    },
    close: () => handleCancel()
  }));


  /** 重置所有表单状态、输入值、校验状态、倒计时 */
  const resetState = () => {
    setPhoneInp('');
    setNewPhoneInp('');
    setEmailInp('');
    setNewEmailInp('');
    setCodeInput('');
    setPhoneCheckPass(false);
    setEmailCheckPass(false);
    setSelectedVerifyTypes([]);
    setIsChange(false);
    setFormValues({});
    formRef.current?.resetFields();
    resetCountdowns();
  };

  const handleCancel = () => {
    resetState();
    setIsModalOpen(false);
  };

  /** 安全验证项不可用 → 跳转重置 2FA 流程 */
  const handleHelpTextLink = () => {
    window.location.href = `/${getLang()}/account/reset2fa`;
  };


  /**
   * 构造 postMultiBind / postMultiUnbind 的 operation_data
   * bind 场景包含目标信息（email/mobile），unbind/其他场景只传验证码
   */
  const buildOperationData = (values: FieldType) => {
    const data: Record<string, any> = {};

    if (values?.twoFaCode) data.twofa_code = values.twoFaCode;
    if (values?.emailPwd) data.email_code = values.emailPwd;
    if (values?.phonePwd) data.mobile_code = values.phonePwd;

    if (isBindMobile) {
      data.country_code = currentCodeInfo?.country;
      data.area_code = values?.prefix;
      data.mobile = isChange ? values?.newPhone : values?.phone;
      data.email = userInfo?.email;
    } else if (isBindEmail) {
      data.email = isChange ? values?.newEmail : values?.email;
      data.country_code = userInfo?.country_code;
      data.area_code = userInfo?.area_code;
      data.mobile = userInfo?.mobile;
    }

    return data;
  };

  /** 后端错误码 → 表单字段行内提示；命中则回填错误并聚焦，未命中不处理（由上层 toast 兜底） */
  const applyFieldError = (error: any): boolean => {
    const code = String(error?.code || error?.data?.code || '');
    const errorInfo = ERROR_CODE_FIELD_MAP[code];
    if (!errorInfo) return false;
    formRef.current?.setFields([
      { name: errorInfo.field, errors: [t(errorInfo.msgKey)] }
    ]);
    formRef.current?.scrollToField(errorInfo.field);
    return true;
  };

  /**
   * 收集验证码 → 回调 or 调绑定/解绑接口
   * 无论走哪条分支：成功才关闭弹框；失败（尤其验证码错误）保持弹框打开，仅在对应输入框下方行内提示
   */
  const onFinish = async (values: FieldType) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (onVerifyComplete) {
        const codes: Record<string, string> = {};
        if (values?.emailPwd) codes.email_code = values.emailPwd;
        if (values?.phonePwd) codes.mobile_code = values.phonePwd;
        if (values?.twoFaCode) codes['2fa_code'] = values.twoFaCode;
        await onVerifyComplete(codes);
        handleCancel();
        return;
      }

      const operation = SCENE_OPERATION_MAP[scene] || scene;
      const isUnbind = scene.startsWith('unbind_');
      const submitFn = isUnbind ? postMultiUnbind : postMultiBind;
      const scenes = isUnbind ? 'unbind_opt_scenes' : 'bind_opt_scenes';

      await submitFn({
        scenes,
        operation,
        operation_data: buildOperationData(values)
      } as any);
      const successMsgKey = SCENE_SUCCESS_MSG_MAP[scene];
      if (successMsgKey) {
        message.success(t(successMsgKey));
      }
      updateUserInfo();
      handleCancel();
      onSuccess?.();
    } catch (error: any) {
      applyFieldError(error);
    } finally {
      setSubmitting(false);
    }
  };

  /** Antd Form 自定义校验器：手机号格式校验，同时控制 phoneCheckPass 影响发送按钮 */
  function checkPhone() {
    const formData = formRef.current?.getFieldsValue();
    const value = isChange ? formData?.newPhone : formData?.phone;
    if (!phoneValidate(value)) {
      setPhoneCheckPass(false);
      return Promise.reject(t('phoneInpMsg'));
    }
    setPhoneCheckPass(true);
    return Promise.resolve();
  }

  /** Antd Form 自定义校验器：邮箱格式 + 修改模式下新旧邮箱不能相同 */
  function checkEmail() {
    const formData = formRef.current?.getFieldsValue();
    const value = isChange ? formData?.newEmail : formData?.email;
    if (!emailValidate(value)) {
      setEmailCheckPass(false);
      return Promise.reject(t('emailInpMsg'));
    }
    if (isChange && value?.trim() === userInfo?.email) {
      setEmailCheckPass(false);
      return Promise.reject(t('emailInpSameMsg'));
    }
    setEmailCheckPass(true);
    return Promise.resolve();
  }


  /** 根据已选验证类型收集必填字段，有任一字段为空则禁用提交按钮 */
  const btnDisable = useMemo(() => {
    const fields: string[] = [];
    if (isBindMobile && showPhone) {
      fields.push(isChange ? 'newPhone' : 'phone', 'phonePwd');
    }
    if (isBindEmail && showEmail) {
      fields.push(isChange ? 'newEmail' : 'email', 'emailPwd');
    }
    if (!isBindMobile && showPhone) fields.push('phonePwd');
    if (!isBindEmail && showEmail) fields.push('emailPwd');
    if (show2FA) fields.push('twoFaCode');
    return fields.some((key) => !formValues[key]);
  }, [formValues, selectedVerifyTypes, isChange, showPhone, showEmail, show2FA, isBindMobile, isBindEmail]);


  /** 将国家区号列表转换为 Select 组件的 options 格式（带国旗图标） */
  const mapOptionList = (list: any[]) =>
    list.map((item) => ({
      label: (
        <div>
          <ReactCountryFlag
            countryCode={item?.code}
            style={{ fontSize: '17px', lineHeight: '17px' }}
          />
          <span style={{ marginLeft: '5px' }}>+{item?.area_code}</span>
        </div>
      ),
      value: item?.area_code
    }));

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        showSearch
        style={{ width: 100 }}
        options={mapOptionList(countryCodeList)}
        optionFilterProp="children"
        filterOption={(input, option) => (String(option?.value) ?? '').includes(input)}
        onChange={handleAreaCode}
      />
    </Form.Item>
  );

  /**
   * 渲染"发送验证码"按钮
   * @param isSecondary 辅助验证（非 bind 场景）时为 true，不受 phoneCheckPass / emailCheckPass 限制
   */
  const renderSendBtn = (type: 'phone' | 'email', isSecondary = false) => {
    let disabled = false;
    if (!isSecondary) {
      disabled = type === 'phone' ? !phoneCheckPass : !emailCheckPass;
    }
    const isResending = type === 'phone' ? isPhoneResendDisabled : isEmailResendDisabled;
    const cd = type === 'phone' ? countdownPhone : countdownEmail;
    return (
      <div
        className={Style.sentCodeBtn}
        onClick={() => !disabled && showCaptchaAndSend(type)}
        style={disabled ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
      >
        {isResending ? cd + ' s' : t('bindEmailModal-sendBtn')}
      </div>
    );
  };

  /** 已绑定手机/邮箱的描述文案（非 bind 场景辅助验证用） */
  const renderVerifyDesc = (type: 'phone' | 'email', isResending: boolean) => {
    const vagueValue = type === 'phone' ? userInfo?.vague_mobile : userInfo?.vague_email;
    if (isCollectOnly) {
      return (
        <p className={Style.desc}>
          <span className={Style.verifyDescText}>
            {isResending ? t('hasBeenSentTo') : t('sendCodeTo')}
          </span>
          <span className={Style.verifyDescInfo}> {vagueValue}</span>
        </p>
      );
    }
    return (
      <p className={Style.desc}>
        {t('setup2FAModal-desc').replace('{value}', vagueValue || '')}
      </p>
    );
  };


  /**
   * 验证类型 → 渲染函数映射
   * 按 selectedVerifyTypes 的顺序遍历此 map，保证接口返回的 priority 排序在 UI 中生效
   *
   * 每个类型内部自行区分 bind（需输入目标）和辅助验证（只需验证码）两种场景
   */
  const RENDER_MAP: Record<string, () => React.ReactNode> = {
    mobile_code: () => {
      if (!showPhone) return null;

      // bind 场景：需要输入新手机号
      if (isBindMobile) {
        const fieldName = isChange ? 'newPhone' : 'phone';
        const placeholder = isChange ? t('bindPhoneModal-newPhone') : t('bindPhoneModal-phone');
        const value = isChange ? newPhoneInp : phoneInp;
        const setter = isChange ? setNewPhoneInp : setPhoneInp;

        return (
          <>
            <Form.Item<FieldType>
              label=""
              name={fieldName}
              rules={[
                { required: true, message: ' ' },
                { validator: checkPhone }
              ]}
            >

              <Input
                addonBefore={prefixSelector}
                className={Style.addonInp}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
                autoComplete="off"
              />
            </Form.Item>
            <Form.Item<FieldType>
              label=""
              name="phonePwd"
              rules={[{ required: true, message: t('phoneCodeInpMsg') }]}
            >
              <Input
                className={Style.userInp}
                placeholder={t('bindPhoneModal-phoneCode')}
                suffix={renderSendBtn('phone')}
                autoComplete="off"
              />
            </Form.Item>
          </>
        );
      }

      // 辅助验证：已绑定手机
      const shouldShowDesc = isCollectOnly || isPhoneResendDisabled;
      return (
        <>
          {shouldShowDesc && renderVerifyDesc('phone', isPhoneResendDisabled)}
          <Form.Item<FieldType>
            label=""
            name="phonePwd"
            rules={[{ required: true, message: t('phoneCodeInpMsg') }]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('bindPhoneModal-phoneCode')}
              suffix={renderSendBtn('phone', true)}
              autoComplete="off"
            />
          </Form.Item>
        </>
      );
    },

    email_code: () => {
      if (!showEmail) return null;

      // bind 场景：需要输入新邮箱
      if (isBindEmail) {
        const fieldName = isChange ? 'newEmail' : 'email';
        const placeholder = isChange ? t('bindEmailModal-newAddress') : t('bindEmailModal-address');
        const value = isChange ? newEmailInp : emailInp;
        const setter = isChange ? setNewEmailInp : setEmailInp;

        return (
          <>
            <Form.Item<FieldType>
              label=""
              name={fieldName}
              rules={[
                { required: true, message: ' ' },
                { validator: checkEmail }
              ]}
            >
              <Input
                className={Style.userInp}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
                autoComplete="off"
              />
            </Form.Item>
            <Form.Item<FieldType>
              label=""
              name="emailPwd"
              rules={[{ required: true, message: t('emailCodeInpMsg') }]}
            >
              <Input
                className={Style.userInp}
                placeholder={t('bindEmailModal-emailCode')}
                suffix={renderSendBtn('email')}
                autoComplete="off"
              />
            </Form.Item>
          </>
        );
      }

      // 辅助验证：已绑定邮箱
      const shouldShowDesc = isCollectOnly || isEmailResendDisabled;
      return (
        <>
          {shouldShowDesc && renderVerifyDesc('email', isEmailResendDisabled)}
          <Form.Item<FieldType>
            label=""
            name="emailPwd"
            rules={[{ required: true, message: t('emailCodeInpMsg') }]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('bindPhoneModal-emailCode')}
              suffix={renderSendBtn('email', true)}
              autoComplete="off"
            />
          </Form.Item>
        </>
      );
    },

    '2fa_code': () => {
      if (!show2FA) return null;
      const descKey = scene === 'unbind_2fa' ? 'unbindModal-desc' : 'enter-authen-code';
      return (
        <>
          <p className={Style.desc}>{t(descKey)}</p>
          <Form.Item<FieldType>
            label=""
            name="twoFaCode"
            rules={[{ required: true, message: t('2faInpMsg') }]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('google2FA-inp')}
              autoComplete="off"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />
          </Form.Item>
        </>
      );
    }
  };


  const titleConfig = SCENE_TITLE_MAP[scene] || { default: 'bindPhoneModal-title', change: 'bindPhoneModalChange' };
  const title = isChange ? t(titleConfig.change) : t(titleConfig.default);
  const tipsKey = SCENE_TIPS_MAP[scene];
  const changeDesc = isChange && isBindMobile
    ? t('bindPhoneModalChange-desc').replace('{value}', userInfo?.vague_mobile || '')
    : null;

  return (
    <Modal
      width={425}
      title={title}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
      className={Style.bindEmailContainer}
      wrapClassName={Style.modalWrapper}
      zIndex={zIndex}
    >
      {changeDesc && <p className={Style.changeEmailDesc}>{changeDesc}</p>}
      <Form
        name="verifyForm"
        ref={formRef}
        style={{ maxWidth: 600, margin: '24px 0 0' }}
        initialValues={{}}
        onFinish={onFinish}
        onFinishFailed={(err) => console.log('Failed:', err)}
        onValuesChange={(_changed, allValues) => {
          setFormValues(allValues);
          const changedFields = Object.keys(_changed);
          if (changedFields.length > 0) {
            formRef.current?.setFields(
              changedFields.map((name) => ({ name, errors: [] }))
            );
          }
        }}
      >
        {selectedVerifyTypes.map((type) => (
          <React.Fragment key={type}>
            {RENDER_MAP[type]?.()}
          </React.Fragment>
        ))}

        <Form.Item style={{ margin: '24px 0 0' }}>
          {tipsKey && (
            <div className={Style.withdrawTips}>
              <TipSvg className={Style.tipsIcon} />
              <div className={Style.tipsText}>{t(tipsKey)}</div>
            </div>
          )}
          <Button type="primary" htmlType="submit" disabled={btnDisable || submitting} loading={submitting}>
            {t('confirmBtn')}
          </Button>
          <div className={Style.helpText}>
            <span className={Style.helpTextLink} onClick={handleHelpTextLink}>
              {t('helpTextLink2')}
            </span>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default forwardRef(VerifyFormModal);
