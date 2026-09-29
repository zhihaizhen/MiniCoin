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
import { postEmailCodeSend, postCreateOpenApiKey } from '~/api';
import { EmailCodeType } from '~/constant';
import { ENV, basePath } from '@better-bit-fe/base-utils';
import { IResOpenApiDetail } from '~/types';
import Style from './index.module.less';

type FieldType = {
  emailCode?: string;
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
}

function VerfiyEmail2faModal(props: IVerfiyEmail2faModalProps, ref: any) {
  const {
    newApiDetail = {},
    handleConfirm: handleDelConfirm,
    handleSetViewOpen
  } = props;
  const { api_name, is_readonly, ip_address } = newApiDetail;
  const { locale, push } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pwd, setpwd] = useState('');
  const [captchaInfo, setcaptchaInfo] = useState({});
  const [codeInput, setcodeInput] = useState<string>('');
  const [sendEmailType, setsendEmailType] = useState<
    | EmailCodeType.apiKey_2fa_create
    | EmailCodeType.apiKey_2fa_del
    | EmailCodeType.apiKey_2fa_edit
    | string
  >('');
  const { countdown, isResendDisabled, resendTimeInterver, clearTimeInterver } =
    useCountDown();
  const { updateUserInfo, userInfo } = useUserInfo();
  const formRef = useRef();
  const t = useFm();
  const { mode, id } = queryString.parse(window.location.search);

  const captcha = useCaptcha();

  const onFinish = async (values: any) => {
    console.log('Success:', values);
    const { twoFaCode, emailCode } = values;
    // call api
    if (ip_address?.length >= 50) {
      message.error(t('ip-length-msg'));
      return;
    }
    if (twoFaCode && emailCode) {
      if (handleDelConfirm) {
        handleDelConfirm({
          emailCode,
          twoFaCode
        });
        return;
      }
      const params = {
        id: Number(id),
        email_code: emailCode,
        '2fa_code': twoFaCode,
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
    }
  };
  const changeModalVisible = (visible: boolean) => {
    setIsModalOpen(visible);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleCancel = () => {
    setpwd('');
    formRef.current.resetFields();
    clearTimeInterver();
    setIsModalOpen(false);
  };

  async function sendCode(_captchaInfo) {
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

  async function showCaptcha() {
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
  }
  useEffect(() => {
    return () => {
      clearTimeInterver();
    };
  }, []);

  useEffect(() => {
    if (handleDelConfirm) {
      setsendEmailType(EmailCodeType.apiKey_2fa_del);
    } else {
      if (mode === 'create') {
        setsendEmailType(EmailCodeType.apiKey_2fa_create);
      } else if (mode === 'edit') {
        setsendEmailType(EmailCodeType.apiKey_2fa_edit);
      }
    }
  }, [handleDelConfirm]);

  useImperativeHandle(ref, () => ({
    changeModalVisible
  }));

  return (
    <div>
      <Modal
        width={425}
        title={t('AccountInfo-title-item6')}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className={Style.modalWrap}
      >
        <Form
          name="basic"
          ref={formRef}
          style={{ maxWidth: 600, margin: '32px 0' }}
          initialValues={{ emailCode: '', twoFaCode: '' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <p className={Style.desc}>
            {t('setup2FAModal-desc').replace('{value}', userInfo?.vague_email)}
          </p>
          <Form.Item<FieldType>
            label=""
            name="emailCode"
            rules={[{ required: true, message: t('emailCodeInpMsg') }]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('bindEmailModal-emailCode')}
              value={pwd}
              onChange={(Event) => {
                setpwd(Event.target.value);
              }}
              suffix={
                <div className={Style.sentCodeBtn} onClick={showCaptcha}>
                  {isResendDisabled
                    ? countdown + ' s'
                    : t('bindEmailModal-sendBtn')}
                </div>
              }
            />
          </Form.Item>
          <p className={Style['desc']}>{t('unbindModal-desc')}</p>
          <Form.Item<FieldType>
            label=""
            name="twoFaCode"
            rules={[{ required: true, message: t('2faInpMsg') }]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('google2FA-inp')}
              value={codeInput}
              onChange={(Event) => {
                setcodeInput(Event.target.value);
              }}
            />
            {/* <Button type="primary" onClick={handleConfirm}>
              {t('confirmBtn')}
            </Button> */}
          </Form.Item>

          <Form.Item style={{ marginTop: '35px' }}>
            <Button
              type="primary"
              htmlType="submit"
              // disabled={!isResendDisabled}
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
