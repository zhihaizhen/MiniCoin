//@ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo
} from 'react';
import { useRouter } from 'next/router';
import { Button, Modal, Select, Checkbox, Form, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCaptcha } from '~/hooks/useCaptcha';
import { emailValidate } from '~/utils/validation';
import useCountDown from '~/hooks/useCountDown';
import {
  postEmailCodeSend,
  postBindEmail,
  postPhoneCodeSend,
  postMultiBind
} from '~/api';
import { EmailCodeType } from '~/constant';
import Style from './index.module.less';
// export interface IBindEmailModalProps {}

type FieldType = {
  username?: string;
  phonePwd?: string;
  emailPwd?: string;
  googleAuthCode?: string;
};

function BindEmailModal(props, ref: any) {
  const { locale } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInp, setemailInp] = useState(''); // 用户输入的邮箱
  const [googleCode, setgoogleCode] = useState(''); // google验证码
  const [newphoneInp, setNewphoneInp] = useState(''); // 新增手机号
  const [emailCheckPass, setemailCheckPass] = useState(false); // 邮箱验证
  const [newemailInp, setNewemailInp] = useState('');
  const [emailPwdInp, setemailPwdInp] = useState('');
  const [captchaInfo, setcaptchaInfo] = useState({});
  const [isChangeEmail, setisChangeEmail] = useState<boolean>(false);
  const { countdown, isResendDisabled, resendTimeInterver, clearTimeInterver } =
    useCountDown();
  const {
    countdown: countdownEmail,
    isResendDisabled: isResendDisabledEmail,
    resendTimeInterver: resendTimeInterverEmail,
    clearTimeInterver: clearTimeInterverEmail
  } = useCountDown();
  const { updateUserInfo, userInfo } = useUserInfo();
  const formRef = useRef();
  const t = useFm();

  const captcha = useCaptcha();

  const onFinish = async (values: any) => {
    console.log('Success:', values);
    // call api
    const params = {
      scenes: 'bind_opt_scenes',
      operation: 'email',
      operation_data: {
        email: isChangeEmail ? values?.newEmail : values?.email,
        email_code: values?.emailPwd,
        country_code: userInfo?.country_code,
        area_code: userInfo?.area_code,
        mobile: userInfo?.mobile,
        mobile_code: values?.phonePwd,
        twofa_code: values?.googleAuthCode
      }
    };
    try {
      await postMultiBind({ ...params });
      updateUserInfo();
      handleCancel();
    } catch (error) {
      console.log(error, 'error');
    }
  };
  const changeModalVisible = (visible: boolean, changeEmail?: boolean) => {
    if (changeEmail) {
      setisChangeEmail(true);
    } else {
      setisChangeEmail(false);
    }
    setIsModalOpen(visible);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleCancel = () => {
    setNewemailInp('');
    setemailInp('');
    setgoogleCode('');
    formRef.current.resetFields();
    clearTimeInterver();
    clearTimeInterverEmail();
    setIsModalOpen(false);
    setisChangeEmail(false);
    setemailCheckPass(false);
  };

  async function sendCode(_captchaInfo) {
    if (userInfo?.vague_mobile) {
      await postPhoneCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        code_type: EmailCodeType.bind_opt_scenes,
        area_code: userInfo?.area_code,
        mobile: userInfo?.mobile
      });
    }
  }

  async function sendEmailCode(_captchaInfo) {
    if (emailInp) {
      await postEmailCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        email_type: EmailCodeType.bind_opt_scenes,
        email: emailInp,
        lang: locale
      });
    }
  }

  async function showCaptcha(type: 'phone' | 'email') {
    if (type === 'phone') {
      if (isResendDisabled) return;
      try {
        const _captchaInfo = await captcha.showCaptcha();
        setcaptchaInfo(_captchaInfo);
        resendTimeInterver();
        await sendCode(_captchaInfo);
      } catch (e) {
        setcaptchaInfo({});
        throw e;
      }
    } else if (type === 'email') {
      if (isResendDisabledEmail) return;
      if (!isChangeEmail && !emailInp) return;
      if (isChangeEmail && !newemailInp) return;
      try {
        const _captchaInfo = await captcha.showCaptcha();
        // setcaptchaInfo(_captchaInfo);
        resendTimeInterverEmail();
        await sendEmailCode(_captchaInfo);
      } catch (e) {
        setcaptchaInfo({});
        throw e;
      }
    }
  }

  // 验证邮箱
  function checkEmail() {
    const formData = formRef.current.getFieldsValue();
    if (isChangeEmail && !emailValidate(formData.newEmail)) {
      setemailCheckPass(false);
      return Promise.reject(t('emailInpMsg'));
    } else if (!isChangeEmail && !emailValidate(formData.email)) {
      setemailCheckPass(false);
      return Promise.reject(t('emailInpMsg'));
    }
    // 原来的邮箱和现在的邮箱不能重复,去除头尾空字符串
    if (isChangeEmail && formData?.newEmail?.trim() == userInfo?.email) {
      setemailCheckPass(false);
      return Promise.reject(t('emailInpSameMsg'));
    }
    setemailCheckPass(true);
    return Promise.resolve();
  }

  useEffect(() => {
    return () => {
      clearTimeInterver();
      clearTimeInterverEmail();
    };
  }, []);
  useImperativeHandle(ref, () => ({
    changeModalVisible
  }));

  const btnDisable = useMemo(() => {
    const formData = formRef?.current?.getFieldsValue();
    let isDisabled = false;
    for (const p in formData) {
      const v = formData[p];
      if (!v) {
        isDisabled = true;
      }
    }
    return isDisabled;
  });

  return (
    <div>
      <Modal
        width={425}
        title={
          isChangeEmail ? t('bindEmailModalChange') : t('bindEmailModal-title')
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className={Style.bindEmailContainer}
        wrapClassName={Style.modalWrapper}
      >
        <Form
          name="basic"
          ref={formRef}
          style={{ maxWidth: 600, margin: '24px 0' }}
          initialValues={{ email: '', newEmail: '', emailPwd: '' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          {/* 邮箱输入框 */}
          {!isChangeEmail ? (
            <Form.Item<FieldType>
              label=""
              name="email"
              rules={[
                { required: true, message: ' ' },
                { validator: checkEmail }
              ]}
            >
              <Input
                className={Style.userInp}
                placeholder={t('bindEmailModal-address')}
                value={emailInp}
                onChange={(event) => {
                  setemailInp(event.target.value);
                }}
              />
            </Form.Item>
          ) : null}
          {isChangeEmail ? (
            <Form.Item<FieldType>
              label=""
              name="newEmail"
              rules={[
                { required: true, message: ' ' },
                { validator: checkEmail }
              ]}
            >
              <Input
                className={Style.userInp}
                value={newemailInp}
                placeholder={t('bindEmailModal-newAddress')}
                onChange={(event) => {
                  setNewemailInp(event.target.value);
                }}
              />
            </Form.Item>
          ) : null}
          <Form.Item<FieldType>
            label=""
            name="emailPwd"
            rules={[{ required: true, message: t('emailCodeInpMsg') }]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('bindEmailModal-emailCode')}
              value={emailPwdInp}
              onChange={(Event) => {
                setemailPwdInp(Event.target.value);
              }}
              suffix={
                <div
                  className={Style.sentCodeBtn}
                  onClick={() => showCaptcha('email')}
                  disabled={!emailCheckPass}
                >
                  {isResendDisabledEmail
                    ? countdownEmail + ' s'
                    : t('bindEmailModal-sendBtn')}
                </div>
              }
            />
          </Form.Item>
          {/* <p className={Style.changeEmailDesc}>
            {isChangeEmail
              ? t('setup2FAModal-desc').replace(
                  '{value}',
                  userInfo?.vague_email
                )
              : t('setup2FAModal-desc').replace('{value}', '')}
          </p> */}
          {/* 手机号验证码输入框 */}
          {userInfo?.vague_mobile && !userInfo?.google2fa_is_enabled ? (
            <>
              {(countdown > 0 || countdown !== '00:00') && (
                <p className={Style.changeEmailDesc}>
                  {t('setup2FAModal-desc').replace(
                    '{value}',
                    userInfo?.vague_mobile
                  )}
                </p>
              )}
              <Form.Item<FieldType>
                label=""
                name="phonePwd"
                rules={[{ required: true, message: t('phoneCodeInpMsg') }]}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('bindPhoneModal-phoneCode')}
                  suffix={
                    <div
                      className={Style.sentCodeBtn}
                      onClick={() => showCaptcha('phone')}
                    >
                      {isResendDisabled
                        ? countdown + ' s'
                        : t('bindEmailModal-sendBtn')}
                    </div>
                  }
                />
              </Form.Item>
            </>
          ) : null}
          {/* Google Auth */}
          {userInfo?.google2fa_is_enabled ? (
            <Form.Item<FieldType>
              label=""
              name="googleAuthCode"
              rules={[{ required: true, message: t('2faInpMsg') }]}
            >
              <Input
                className={Style.userInp}
                placeholder={t('google2FA-inp')}
                value={googleCode}
                onChange={(Event) => {
                  setgoogleCode(Event.target.value);
                }}
              />
            </Form.Item>
          ) : null}
          <Form.Item style={{ marginTop: '35px' }}>
            <div className={Style.withdrawTips}>
              <div className={Style.tipsIcon} />
              <div className={Style.tipsText}>{t('withdrawTipsBindEmail')}</div>
            </div>
            <Button type="primary" htmlType="submit" disabled={btnDisable}>
              {t('confirmBtn')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default forwardRef(BindEmailModal);
