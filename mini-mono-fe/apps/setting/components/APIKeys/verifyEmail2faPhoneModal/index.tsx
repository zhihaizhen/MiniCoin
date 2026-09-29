// @ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import queryString from 'query-string';
import { Button, Modal, Checkbox, Form, Input, message } from 'antd';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCaptcha } from '~/hooks/useCaptcha';
// import { emailValidate } from '~/utils/validation';
import useCountDown from '~/hooks/useCountDown';
import { postEmailCodeSend, postPhoneCodeSend, postCreateOpenApiKey } from '~/api';
import { EmailCodeType, PhoneCodeType } from '~/constant';
import { ENV, basePath } from '@better-bit-fe/base-utils';
import { IResOpenApiDetail } from '~/types';
import Style from './index.module.less';

type FieldType = {
  emailCode?: string;
  phonePwd?: string;
  twoFaCode?: string;
};

type Email2faType = {
  api_name: string;
  is_readonly: Array<string> | number;
  ip_address?: string | Array<string>;
};

interface IVerfiyEmail2faModalProps {
  newApiDetail?: Email2faType;
  handleConfirm?: (val: any) => void;
  handleSetViewOpen?: (val: IResOpenApiDetail) => void;
  actionType?: 'create' | 'edit' | 'edit-submit' | 'delete' | 'detail';
}

function VerfiyEmail2faModal(props: IVerfiyEmail2faModalProps, ref: any) {
  const {
    newApiDetail = {},
    handleConfirm: handleDelConfirm,
    handleSetViewOpen,
    actionType
  } = props;
  const { api_name, is_readonly, ip_address } = newApiDetail;
  const { locale, push } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailPwd, setEmailPwd] = useState('');
  const [phonePwd, setPhonePwd] = useState('');
  const [codeInput, setCodeInput] = useState<string>('');
  const [sendEmailType, setSendEmailType] = useState<
    | EmailCodeType.apiKey_2fa_create
    | EmailCodeType.apiKey_2fa_del
    | EmailCodeType.apiKey_2fa_edit
    | EmailCodeType.apiKey_2fa_detail
  >('');

  const [sendPhoneType, setSendPhoneType] = useState<
    | PhoneCodeType.apiKey_2fa_create
    | PhoneCodeType.apiKey_2fa_del
    | PhoneCodeType.apiKey_2fa_detail
  >('');

  // 邮箱验证码倒计时
  const {
    countdown: countdownEmail,
    isResendDisabled: isResendDisabledEmail,
    resendTimeInterver: resendTimeInterverEmail,
    clearTimeInterver: clearTimeInterverEmail
  } = useCountDown();

  // 手机验证码倒计时
  const {
    countdown: countdownPhone,
    isResendDisabled: isResendDisabledPhone,
    resendTimeInterver: resendTimeInterverPhone,
    clearTimeInterver: clearTimeInterverPhone
  } = useCountDown();

  const { updateUserInfo, userInfo } = useUserInfo();
  const formRef = useRef();
  const t = useFm();
  const { mode, id } = typeof window !== 'undefined'
    ? queryString.parse(window.location.search)
    : { mode: undefined, id: undefined };

  const captcha = useCaptcha();

  const onFinish = async (values: any) => {
    console.log('Success:', values);
    const { twoFaCode, emailCode, phonePwd } = values;
    // call api
    if (ip_address?.length >= 50) {
      message.error(t('ip-length-msg'));
      return;
    }

    // 构建验证参数（三选二逻辑）
    const verificationParams: any = {};
    if (emailCode) verificationParams.email_code = emailCode;
    if (phonePwd) verificationParams.mobile_code = phonePwd; // 使用 mobile_code 参数名
    if (twoFaCode) verificationParams['2fa_code'] = twoFaCode;

    // 检查是否至少提供了两个验证码（Modal 已按三选二渲染并校验，这里兜底）
    const providedVerifications = Object.keys(verificationParams).length;
    if (providedVerifications < 2) return;

    if (handleDelConfirm) {
      handleDelConfirm(verificationParams);
      return;
    }

    const params = {
      id: Number(id),
      ...verificationParams,
      api_name,
      is_readonly,
      ips: ip_address
    };
    if (mode === 'create') delete params.id;

    try {
      const res = await postCreateOpenApiKey({ ...params });
      await updateUserInfo();
      handleCancel();
      if (mode === 'create') {
        handleSetViewOpen(res);
      } else if (mode === 'edit') {
        push({
          pathname: `/${locale}${basePath}/api-management`
        });
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const changeModalVisible = (visible: boolean) => {
    if (!visible) {
      // 关闭时清空内容
      setEmailPwd('');
      setPhonePwd('');
      formRef.current?.resetFields();
      clearTimeInterverEmail();
      clearTimeInterverPhone();
    }
    setIsModalOpen(visible);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleCancel = () => {
    setEmailPwd('');
    setPhonePwd('');
    formRef.current?.resetFields();
    clearTimeInterverEmail();
    clearTimeInterverPhone();
    setIsModalOpen(false);
  };

  // 发送邮箱验证码
  async function sendEmailCode(_captchaInfo) {
    if (userInfo?.vague_email) {
      await postEmailCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        email_type: sendEmailType,
        lang: locale
      });
    }
  }

  // 发送手机验证码
  async function sendPhoneCode(_captchaInfo) {
    if (userInfo?.vague_mobile) {
      await postPhoneCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        code_type: sendPhoneType,
        area_code: '',
        mobile: ''
      });
    }
  }

  async function showCaptcha(type: 'email' | 'phone') {
    if (type === 'email') {
      if (isResendDisabledEmail) return;
      try {
        const _captchaInfo = await captcha.showCaptcha();
        resendTimeInterverEmail();
        await sendEmailCode(_captchaInfo);
      } catch (e) {
        throw e;
      }
    } else if (type === 'phone') {
      if (isResendDisabledPhone) return;
      try {
        const _captchaInfo = await captcha.showCaptcha();
        resendTimeInterverPhone();
        await sendPhoneCode(_captchaInfo);
      } catch (e) {
        throw e;
      }
    }
  }
  useEffect(() => {
    return () => {
      clearTimeInterverEmail();
      clearTimeInterverPhone();
    };
  }, []);

  useEffect(() => {
    // 优先使用 actionType（从 newapi/index.tsx 传入）
    if (actionType) {
      if (actionType === 'create' || actionType === 'edit-submit') {
        // create 和 edit-submit 都使用 create 类型
        setSendEmailType(EmailCodeType.apiKey_2fa_create);
        setSendPhoneType(PhoneCodeType.apiKey_2fa_create);
      } else if (actionType === 'delete') {
        setSendEmailType(EmailCodeType.apiKey_2fa_del);
        setSendPhoneType(PhoneCodeType.apiKey_2fa_del);
      } else if (actionType === 'detail') {
        setSendEmailType(EmailCodeType.apiKey_2fa_detail);
        setSendPhoneType(PhoneCodeType.apiKey_2fa_detail);
      }
    } else if (handleDelConfirm) {
      // 兼容旧的 handleDelConfirm 方式
      setSendEmailType(EmailCodeType.apiKey_2fa_del);
      setSendPhoneType(PhoneCodeType.apiKey_2fa_del);
    } else if (mode) {
      // 兼容旧的 mode 方式
      if (mode === 'create') {
        setSendEmailType(EmailCodeType.apiKey_2fa_create);
        setSendPhoneType(PhoneCodeType.apiKey_2fa_create);
      } else if (mode === 'edit') {
        setSendEmailType(EmailCodeType.apiKey_2fa_edit);
        setSendPhoneType(PhoneCodeType.apiKey_2fa_detail);
      } else if (mode === 'detail') {
        setSendEmailType(EmailCodeType.apiKey_2fa_detail);
        setSendPhoneType(PhoneCodeType.apiKey_2fa_detail);
      }
    }
  }, [actionType, handleDelConfirm, mode]);

  useImperativeHandle(ref, () => ({
    changeModalVisible
  }));


  // 计算需要显示的验证方式（三选二）
  const hasEmail = !!userInfo?.vague_email;
  const hasPhone = !!userInfo?.vague_mobile;
  const has2FA = !!userInfo?.google2fa_is_verified;

  // 统计已绑定的验证方式数量
  const bindCount = [hasEmail, hasPhone, has2FA].filter(Boolean).length;

  // 确定显示哪两种验证方式
  let showEmail = false;
  let showPhone = false;
  let show2FA = false;

  if (bindCount >= 2) {
    // 三选二逻辑
    if (hasEmail && hasPhone && has2FA) {
      // 三个都有：邮箱 + 2FA
      showEmail = true;
      show2FA = true;
    } else if (hasEmail && hasPhone) {
      // 邮箱 + 手机
      showEmail = true;
      showPhone = true;
    } else if (hasEmail && has2FA) {
      // 邮箱 + 2FA
      showEmail = true;
      show2FA = true;
    } else if (hasPhone && has2FA) {
      // 手机 + 2FA
      showPhone = true;
      show2FA = true;
    }
  } else {
    // 少于2个，全部显示
    showEmail = hasEmail;
    showPhone = hasPhone;
    show2FA = has2FA;
  }

  return (
    <div>
      <Modal
        width={425}
        title={t('AccountInfo-title-item6')}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className={Style.modalWrap}
        zIndex={2000}
      >
        <Form
          name="basic"
          autoComplete="off"
          ref={formRef}
          style={{ maxWidth: 600, margin: '32px 0' }}
          initialValues={{ emailCode: '', phonePwd: '', twoFaCode: '' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          {/* 邮箱验证码 */}
          {showEmail && (
            <>
              <p className={Style.desc}>
                <span className={Style.verifyDescText}>
                  {isResendDisabledEmail ? t('hasBeenSentTo') : t('sendCodeTo')}
                </span>
                <span className={Style.verifyDescInfo}> {userInfo?.vague_email}</span>
              </p>
              <Form.Item<FieldType>
                label=""
                name="emailCode"
                rules={[{ required: true, message: t('emailCodeInpMsg') }]}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('countdownModal-desc-email')}
                  autoComplete="off"
                  onChange={(e) => setEmailPwd(e.target.value)}
                  suffix={
                    <div
                      className={Style.sentCodeBtn}
                      onClick={() => showCaptcha('email')}
                    >
                      {isResendDisabledEmail
                        ? `${countdownEmail} s`
                        : t('sendCode-btn')}
                    </div>
                  }
                />
              </Form.Item>
            </>
          )}

          {/* 2FA 验证码 */}
          {show2FA && (
            <>
              <p className={Style.desc}>{t('unbindModal-desc')}</p>
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
          )}

          {/* 手机验证码 */}
          {showPhone && (
            <>
              <p className={Style.desc}>
                <span className={Style.verifyDescText}>
                  {isResendDisabledPhone ? t('hasBeenSentTo') : t('sendCodeTo')}
                </span>
                <span className={Style.verifyDescInfo}>{userInfo?.vague_mobile}</span>
              </p>
              <Form.Item<FieldType>
                label=""
                name="phonePwd"
                rules={[{ required: true, message: t('phoneCodeInpMsg') }]}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('countdownModal-desc-phone')}
                  autoComplete="off"
                  onChange={(e) => setPhonePwd(e.target.value)}
                  suffix={
                    <div
                      className={Style.sentCodeBtn}
                      onClick={() => showCaptcha('phone')}
                    >
                      {isResendDisabledPhone
                        ? `${countdownPhone} s`
                        : t('sendCode-btn')}
                    </div>
                  }
                />
              </Form.Item>
            </>
          )}

          <Form.Item style={{ marginTop: '35px' }}>
            <Button
              type="primary"
              htmlType="submit"
            >
              {t('confirmBtn')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default forwardRef(VerfiyEmail2faModal);
