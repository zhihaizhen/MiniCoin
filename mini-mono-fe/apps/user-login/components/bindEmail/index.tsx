//@ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useRouter } from 'next/router';
import { Button, Modal, Checkbox, Form, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCurCaptcha } from '~/context/captchaContext';
import { emailValidate } from '~/utils/validation';
import useCountDown from '~/hooks/useCountDown';
import { postBindEmail, postBindEmailCodeSend } from '~/api';
import { EmailCodeType } from '~/constants';
import { loginPushRouter } from '~/utils';
import Style from './index.module.less';

type FieldType = {
  username?: string;
  password?: string;
};

function BindEmailModal(props, ref: any) {
  const { locale } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInp, setemailInp] = useState('');
  const [emailCheckPass, setemailCheckPass] = useState(false);
  const [newemailInp, setNewemailInp] = useState('');
  const [pwd, setpwd] = useState('');
  const [captchaInfo, setcaptchaInfo] = useState({});
  const [isChangeEmail, setisChangeEmail] = useState<boolean>(false);
  const { countdown, isResendDisabled, resendTimeInterver, clearTimeInterver } =
    useCountDown();
  const { updateUserInfo, userInfo, isLogin } = useUserInfo();
  const formRef = useRef();
  const t = useFm();

  const captcha = useCurCaptcha();

  const onFinish = async (values: any) => {
    console.log('Success:', values);
    // call api
    const params = isChangeEmail
      ? {
          email: values.newEmail,
          email_code: values.password
        }
      : {
          email: values.email,
          email_code: values.password
        };
    try {
      await postBindEmail({ ...params });
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
    setemailInp('');
    setNewemailInp('');
    setpwd('');
    formRef.current.resetFields();
    clearTimeInterver();
    setIsModalOpen(false);
    setisChangeEmail(false);
    setemailCheckPass(false);
    if (isLogin) {
      loginPushRouter();
    }
  };

  async function sendCode(_captchaInfo) {
    if (isChangeEmail) {
      if (newemailInp) {
        await postBindEmailCodeSend({
          captcha_type: 'geetest',
          geetest_challenge: _captchaInfo?.geetest_challenge,
          geetest_validate: _captchaInfo?.geetest_validate,
          geetest_seccode: _captchaInfo?.geetest_seccode,
          email_type: EmailCodeType.bind_email,
          email: newemailInp,
          lang: locale
        });
      }
    } else {
      if (emailInp) {
        await postBindEmailCodeSend({
          captcha_type: 'geetest',
          geetest_challenge: _captchaInfo?.geetest_challenge,
          geetest_validate: _captchaInfo?.geetest_validate,
          geetest_seccode: _captchaInfo?.geetest_seccode,
          email_type: EmailCodeType.bind_email,
          email: emailInp,
          lang: locale
        });
      }
    }
  }

  async function showCaptcha() {
    if (isResendDisabled) return;
    if (isChangeEmail && !newemailInp) return;
    if (!isChangeEmail && !emailInp) return;
    try {
      const _captchaInfo = await captcha.showCaptcha();
      setcaptchaInfo(_captchaInfo);
      resendTimeInterver();
      await sendCode(_captchaInfo);
    } catch (e) {
      setcaptchaInfo({});
      throw e;
    }
  }

  function checkEmail() {
    const formData = formRef.current.getFieldsValue();
    if (isChangeEmail && !emailValidate(formData.newEmail)) {
      setemailCheckPass(false);
      return Promise.reject(t('emailInpMsg'));
    } else if (!isChangeEmail && !emailValidate(formData.email)) {
      setemailCheckPass(false);
      return Promise.reject(t('emailInpMsg'));
    }
    setemailCheckPass(true);
    return Promise.resolve();
  }

  function handleChange(Event) {
    const checked = Event.target.checked;
    localStorage.setItem('showBindEmail', Number(!checked));
  }

  useEffect(() => {
    return () => {
      clearTimeInterver();
    };
  }, []);
  useImperativeHandle(ref, () => ({
    changeModalVisible
  }));

  return (
    <div>
      <Modal
        width={425}
        title={isChangeEmail ? t('bindEmailModalChange') : t('bindEmail-title')}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className={Style.bindEmailContainer}
      >
        <p className={Style.changeEmailDesc}>{t('bindEmail-desc')}</p>
        <Form
          name="basic"
          ref={formRef}
          style={{ maxWidth: 600, margin: '32px 0' }}
          initialValues={{ email: '', newEmail: '', password: '' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          {!isChangeEmail ? (
            <Form.Item<FieldType>
              label=""
              name="email"
              // validateTrigger="onBlur"
              rules={[
                { required: true, message: ' ' },
                { validator: checkEmail }
              ]}
            >
              <Input
                className={Style.userInp}
                placeholder={t('email-address')}
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
              // validateTrigger="onBlur"
              rules={[
                { required: true, message: ' ' },
                { validator: checkEmail }
              ]}
            >
              <Input
                className={Style.userInp}
                value={newemailInp}
                placeholder={t('email-address')}
                onChange={(event) => {
                  setNewemailInp(event.target.value);
                }}
              />
            </Form.Item>
          ) : null}

          <Form.Item<FieldType>
            label=""
            name="password"
            rules={[{ required: true, message: t('emailCodeInpMsg') }]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('verification-code')}
              autoComplete="off"
              value={pwd}
              onChange={(Event) => {
                setpwd(Event.target.value);
              }}
              suffix={
                <button
                  className={Style.sentCodeBtn}
                  onClick={showCaptcha}
                  disabled={!emailCheckPass}
                >
                  {isResendDisabled ? countdown + ' s' : t('sendCode-btn')}
                </button>
              }
            />
          </Form.Item>

          <Checkbox onChange={handleChange}>{t('bindEmail-showBtn')}</Checkbox>

          <Form.Item style={{ marginTop: '35px' }}>
            <div className={Style.withdrawTips}>
              <div className={Style.tipsIcon} />
              <div className={Style.tipsText}>{t('withdrawTipsBindEmail')}</div>
            </div>
            <Button
              type="primary"
              htmlType="submit"
              // disabled={!isResendDisabled}
            >
              {t('confirm-btn')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default forwardRef(BindEmailModal);
