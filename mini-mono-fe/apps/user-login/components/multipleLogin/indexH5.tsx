//@ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useRouter } from 'next/router';
import { Button, Modal, Form, Input, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCurCaptcha } from '~/context/captchaContext';
import { emailValidate } from '~/utils/validation';
import useCountDown from '~/hooks/useCountDown';
import { useParticle } from '~/hooks/useParticle';
import { postEmailCodeSend, postLoginEmail, postProfileUpdate } from '~/api';
import { EmailCodeType, STORAGE_ADDRESS, ISNEWUSER } from '~/constants';
import Style from './index.module.less';

type FieldType = {
  username?: string;
  password?: string;
};
interface IEmailH5 {
  referralCode?: string;
  changeWalletDetail: ({ visible: boolean, address: string }) => void;
  walletDetail: {
    visible: boolean;
    address: string;
  };
}

function EmailH5(props: IEmailH5, ref: any) {
  const { referralCode, changeWalletDetail, walletDetail } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInp, setemailInp] = useState('');
  const [captchaInfo, setcaptchaInfo] = useState({});
  const [emailCheckPass, setemailCheckPass] = useState(false);
  const [loading, setloading] = useState<boolean>(false);
  const { countdown, isResendDisabled, resendTimeInterver, clearTimeInterver } =
    useCountDown();
  const { updateUserInfo, userInfo } = useUserInfo();
  const formRef = useRef();
  const t = useFm();
  const { locale } = useRouter();
  const captcha = useCurCaptcha();
  const { connect, logout: particleLogout, getAddress } = useParticle();

  const changeModalVisible = (visibility: boolean) => {
    setIsModalOpen(visibility);
  };

  const onFinish = async (values: any) => {
    console.log('Success:', values);
    setloading(true);
    const params = referralCode
      ? {
        referral_code: referralCode,
        email: values.email,
        email_code: values.password
      }
      : { email: values.email, email_code: values.password };
    try {
      const loginData = await postLoginEmail({ ...params });
      const { is_new_user, particle_token } = loginData;
      localStorage.setItem(ISNEWUSER, is_new_user);
      localStorage.setItem(
        STORAGE_ADDRESS,
        JSON.stringify({
          address: '',
          walletName: 'email',
          particle_token
        })
      );
      const newUserInfo = await updateUserInfo();
      const isWalletLoadingOpen =
        is_new_user ||
        // previous unipass users
        (newUserInfo?.address && newUserInfo.wallet_type === 2) ||
        !newUserInfo?.address;

      if (isWalletLoadingOpen) {
        changeWalletDetail({
          visible: true,
          address: walletDetail.address
        });
        setloading(false);
      }
      message.success(t('loginTips'));
      if (newUserInfo?.wallet_type === 3) {
        const _particleAddress = newUserInfo?.address;
        changeWalletDetail({
          visible: isWalletLoadingOpen,
          address: _particleAddress
        });
      } else {
        // connect particle
        await connect({ jwt: particle_token });
        const _particleAddress = await getAddress();
        changeWalletDetail({
          visible: isWalletLoadingOpen,
          address: _particleAddress
        });
      }
      // open particle address loading modal
      setloading(false);
      handleCancel();
    } catch (error) {
      setloading(false);
      console.log(error, 'error');
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const handleCancel = () => {
    formRef.current.resetFields();
    clearTimeInterver();
    setIsModalOpen(false);
    setemailCheckPass(false);
  };

  async function sendCode(_captchaInfo) {
    if (emailInp) {
      await postEmailCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        email_type: EmailCodeType.login_code,
        email: emailInp,
        lang: locale
      });
    }
  }

  async function showCaptcha() {
    if (isResendDisabled) return;
    if (!emailInp) return;
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
    if (!emailValidate(formData.email)) {
      setemailCheckPass(false);
      return Promise.reject(t('emailInpMsg'));
    }
    setemailCheckPass(true);
    return Promise.resolve();
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
        width={'80%'}
        title={t('email-title')}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        className={Style.email}
      >
        <Form
          name="emailH5"
          ref={formRef}
          style={{ maxWidth: 600, margin: '32px 0' }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item<FieldType>
            label=""
            name="email"
            rules={[
              { required: true, message: ' ' },
              { validator: checkEmail }
            ]}
            style={{ margin: '40px 0 32px' }}
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

          <Form.Item<FieldType>
            label=""
            name="password"
            rules={[{ required: true, message: t('emailCodeInpMsg') }]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('verification-code')}
              autoComplete="off"
              suffix={
                <div
                  className={Style.sentCodeBtn}
                  onClick={showCaptcha}
                  disabled={!emailCheckPass}
                >
                  {isResendDisabled ? countdown + ' s' : t('sendCode-btn')}
                </div>
              }
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '76px' }}>
            <Button
              type="primary"
              htmlType="submit"
            // disabled={!isResendDisabled}
            >
              {loading ? (
                <LoadingOutlined style={{ color: 'white' }} />
              ) : (
                t('confirm-btn')
              )}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default forwardRef(EmailH5);
