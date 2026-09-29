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
import { Button, Modal, Form, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCaptcha } from '~/hooks/useCaptcha';
import useCountDown from '~/hooks/useCountDown';
import { postEmailCodeSendByUserId, postCodeSendByUserId, postUnbind2fa } from '~/api';
import { EmailCodeType } from '~/constants';
import { ReactComponent as TipSvg } from '~/public/images/tips.svg';
import ApplicationCodeModal from '~/components/applicationCodeModal';
import Style from './index.module.less';

type FieldType = {
  emailPwd?: string;
  phonePwd?: string;
};

interface Reset2FAModalProps {
  onSuccess?: () => void;
  onContactService?: () => void;
}

function Reset2FAModal(props: Reset2FAModalProps, ref: any) {
  const { onSuccess, onContactService } = props;
  const { locale } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailPwd, setEmailPwd] = useState('');
  const [phonePwd, setPhonePwd] = useState('');
  // 从localStorage获取vague_email和vague_mobile
  const [vagueEmail, setVagueEmail] = useState<string>('');
  const [vagueMobile, setVagueMobile] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const {
    countdown: countdownEmail,
    isResendDisabled: isResendDisabledEmail,
    resendTimeInterver: resendTimeInterverEmail,
    clearTimeInterver: clearTimeInterverEmail
  } = useCountDown();

  const {
    countdown: countdownPhone,
    isResendDisabled: isResendDisabledPhone,
    resendTimeInterver: resendTimeInterverPhone,
    clearTimeInterver: clearTimeInterverPhone
  } = useCountDown();

  const formRef = useRef();
  const applicationCodeModalRef = useRef();
  const t = useFm();
  const captcha = useCaptcha();

  const changeModalVisible = (visible: boolean) => {
    setIsModalOpen(visible);
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
    if (vagueEmail) {
      await postEmailCodeSendByUserId({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        lang: locale,
        email_type: "unbind_2fa",
        user_id: userId,
      });
    }
  }

  // 发送手机验证码
  async function sendPhoneCode(_captchaInfo) {
    if (vagueMobile) {
      await postCodeSendByUserId({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        code_type: "unbind_2fa",
        user_id: userId,
      });
    }
  }

  async function showCaptcha(type: 'phone' | 'email') {
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

  const onFinish = async (values: any) => {
    try {
      // 构建解绑2FA的请求参数
      const params: any = {
        user_id: userId,
      };

      if (vagueEmail && values.emailPwd) {
        params.email_code = (values.emailPwd).trim();
      }

      if (vagueMobile && values.phonePwd) {
        params.mobile_code = (values.phonePwd).trim();
      }

      // 调用解绑2FA接口
      const res = await postUnbind2fa(params);
      const applicationCode = res?.code;

      if (applicationCode) {
        // 关闭当前弹框
        handleCancel();

        // 显示申请码弹框
        applicationCodeModalRef.current?.changeModalVisible(true, applicationCode);

        // 调用成功回调
        if (onSuccess) {
          onSuccess();
        }

        updateUserInfo();
      }

    } catch (e) {
      message.error(t(e?.code));
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    return () => {
      clearTimeInterverEmail();
      clearTimeInterverPhone();
    };
  }, []);

  useEffect(() => {
    const storedVagueEmail = localStorage.getItem('vague_email');
    const storedVagueMobile = localStorage.getItem('vague_mobile');
    const storedUserId = localStorage.getItem('userId');
    if (storedVagueEmail) setVagueEmail(storedVagueEmail);
    if (storedVagueMobile) setVagueMobile(storedVagueMobile);
    if (storedUserId) setUserId(Number(storedUserId));
  }, []);

  useImperativeHandle(ref, () => ({
    changeModalVisible
  }));

  const btnDisable = useMemo(() => {
    const formData = formRef?.current?.getFieldsValue();
    if (!formData) return true;

    let isDisabled = false;
    for (const p in formData) {
      const v = formData[p];
      if (!v) {
        isDisabled = true;
      }
    }
    return isDisabled;
  }, [formRef?.current?.getFieldsValue()]);

  return (
    <>
      <Modal
        width={425}
        title={t('reset2faModal-title')}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className={Style.reset2faModalContainer}
        wrapClassName={Style.modalWrapper}
      >
        <Form
          name="reset2fa"
          ref={formRef}
          style={{ maxWidth: 600 }}
          initialValues={{ emailPwd: '', phonePwd: '' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <div className={Style.withdrawTips}>
            <TipSvg className={Style.tipsIcon} />
            <div className={Style.tipsText}>{t('reset2faModal-tips')}</div>
          </div>

          {/* 邮箱验证码 */}
          {vagueEmail && (
            <>
              <p className={Style.verifyDesc}>
                <span className={Style.verifyDescText}>
                  {isResendDisabledEmail ? t('hasBeenSentTo') : t('sendCodeTo')}
                </span>
                <span className={Style.verifyDescInfo}>{vagueEmail}</span>
              </p>
              <Form.Item
                name="emailPwd"
                rules={[{ required: true, message: t('emailCodeInpMsg') }]}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('countdownModal-desc-email')}
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

          {/* 手机验证码 */}
          {vagueMobile && (
            <>
              <p className={Style.verifyDesc}>
                <span className={Style.verifyDescText}>
                  {isResendDisabledPhone ? t('hasBeenSentTo') : t('sendCodeTo')}
                </span>
                <span className={Style.verifyDescInfo}>{vagueMobile}</span>
              </p>
              <Form.Item
                name="phonePwd"
                rules={[{ required: true, message: t('phoneCodeInpMsg') }]}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('countdownModal-desc-phone')}
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

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              className="w-full !h-12"
              type="primary"
              htmlType="submit"
              disabled={btnDisable}
            >
              {t('confirm-btn')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 申请码弹框 */}
      <ApplicationCodeModal
        ref={applicationCodeModalRef}
        onContactService={onContactService}
      />
    </>
  );
}

export default forwardRef(Reset2FAModal);
