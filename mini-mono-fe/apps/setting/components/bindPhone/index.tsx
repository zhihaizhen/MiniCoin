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
import { Button, Modal, Select, Form, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import ReactCountryFlag from 'react-country-flag';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCaptcha } from '~/hooks/useCaptcha';
import { phoneValidate } from '~/utils/validation';
import useCountDown from '~/hooks/useCountDown';
import {
  postPhoneCodeSend,
  postBindPhone,
  getCountryList,
  getCurrentCountryCode,
  postEmailCodeSend,
  postMultiBind
} from '~/api';
import { EmailCodeType } from '~/constant';
import { ReactComponent as TipSvg } from '~/public/images/tips.svg';
import Style from './index.module.less';

type FieldType = {
  username?: string;
  phonePwd?: string;
  emailPwd?: string;
  googleAuthCode?: string;
};

function BindPhoneModal(props, ref: any) {
  const { locale } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailPwd, setemailPwd] = useState(''); // 用户输入的邮箱
  const [phoneInp, setphoneInp] = useState(''); // 用户输入的手机号
  const [newphoneInp, setNewphoneInp] = useState(''); // 新增手机号
  const [phoneCheckPass, setphoneCheckPass] = useState(false); // 手机号验证
  const [captchaInfo, setcaptchaInfo] = useState({});
  const [countryCodeList, setcountryCodeList] = useState<Array<any>>([]);
  const [currentCodeInfo, setcurrentCodeInfo] = useState<{
    area_code: string;
    country: string;
  }>({ area_code: '86', country: 'CN' }); //选中的区号信息

  const [isChangePhone, setIschangePhone] = useState<boolean>(false);
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

  useEffect(() => {
    if (isModalOpen) {
      getCurrentIpDetail();
    }
  }, [isModalOpen]);

  const getCurrentIpDetail = async () => {
    const countryList = await getCountryList();
    setcountryCodeList(countryList);
    const currentCode = await getCurrentCountryCode(); //area_code: '86', country: 'CN'
    setcurrentCodeInfo(currentCode);

    formRef?.current?.setFieldValue('prefix', currentCode?.area_code);
  };

  // changePhone是否更新手机号
  const changeModalVisible = (visible: boolean, changePhone?: boolean) => {
    if (changePhone) {
      setIschangePhone(true);
    } else {
      setIschangePhone(false);
    }
    setIsModalOpen(visible);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleCancel = () => {
    setphoneInp('');
    setNewphoneInp('');

    formRef.current.resetFields();
    clearTimeInterver();
    clearTimeInterverEmail();
    setIsModalOpen(false);
    setIschangePhone(false);
    setphoneCheckPass(false);
  };

  // 发送验证码
  // isChangePhone表示是修改
  async function sendCode(_captchaInfo) {
    if (isChangePhone) {
      if (newphoneInp) {
        await postPhoneCodeSend({
          captcha_type: 'geetest',
          geetest_challenge: _captchaInfo?.geetest_challenge,
          geetest_validate: _captchaInfo?.geetest_validate,
          geetest_seccode: _captchaInfo?.geetest_seccode,
          code_type: EmailCodeType.bind_opt_scenes, //都是bind
          area_code: currentCodeInfo.area_code,
          mobile: newphoneInp
        });
      }
    } else {
      // 绑定手机号
      if (phoneInp) {
        await postPhoneCodeSend({
          captcha_type: 'geetest',
          geetest_challenge: _captchaInfo?.geetest_challenge,
          geetest_validate: _captchaInfo?.geetest_validate,
          geetest_seccode: _captchaInfo?.geetest_seccode,
          code_type: EmailCodeType.bind_opt_scenes,
          area_code: currentCodeInfo.area_code,
          mobile: phoneInp
        });
      }
    }
  }

  async function sendEmailCode(_captchaInfo) {
    if (userInfo?.vague_email) {
      await postEmailCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        email_type: EmailCodeType.bind_opt_scenes,
        email: userInfo?.email,
        lang: locale
      });
    }
  }

  async function showCaptcha(type: 'phone' | 'email') {
    if (type === 'phone') {
      if (isResendDisabled) return;
      if (isChangePhone && !newphoneInp) return;
      if (!isChangePhone && !phoneInp) return;
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

  // 确定绑定
  const onFinish = async (values: any) => {
    const params = {
      scenes: 'bind_opt_scenes',
      operation: 'mobile',
      operation_data: {
        email: userInfo?.email,
        email_code: values?.emailPwd,
        country_code: currentCodeInfo?.country,
        area_code: values?.prefix,
        mobile: isChangePhone ? values?.newPhone : values?.phone,
        mobile_code: values?.phonePwd,
        twofa_code: values?.googleAuthCode
      }
    };
    try {
      //TODO  replace with new API
      await postMultiBind({ ...params });
      updateUserInfo();
      handleCancel();
    } catch (error) {
      console.log(error, 'error');
    }
  };

  // 验证手机号
  function checkPhone() {
    const formData = formRef.current.getFieldsValue();
    if (isChangePhone && !phoneValidate(formData.newPhone)) {
      setphoneCheckPass(false);
      return Promise.reject(t('phoneInpMsg'));
    } else if (!isChangePhone && !phoneValidate(formData.phone)) {
      setphoneCheckPass(false);
      return Promise.reject(t('phoneInpMsg'));
    }
    setphoneCheckPass(true);
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

  function mapOptionList(list) {
    return list.map((item) => ({
      label: (
        <div>
          <ReactCountryFlag
            countryCode={item?.code}
            style={{
              fontSize: '17px',
              lineHeight: '17px'
            }}
          />
          <span style={{ marginLeft: '5px' }}>+{item?.area_code}</span>
        </div>
      ),
      value: item?.area_code
    }));
  }
  // 区号修改
  const handleAreaCode = (val) => {
    const country = countryCodeList.find((it) => it.area_code == val)?.code;
    setcurrentCodeInfo({
      area_code: val,
      country
    });
  };

  // 区号
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        showSearch
        style={{ width: 100 }}
        options={mapOptionList(countryCodeList)}
        optionFilterProp="children"
        filterOption={(input, option) => {
          return (String(option?.value) ?? '').includes(input);
        }}
        onChange={handleAreaCode}
      />
    </Form.Item>
  );

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
          isChangePhone ? t('bindPhoneModalChange') : t('bindPhoneModal-title')
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className={Style.bindEmailContainer}
        wrapClassName={Style.modalWrapper}
      >
        {isChangePhone ? (
          <p className={Style.changeEmailDesc}>
            {t('bindPhoneModalChange-desc').replace(
              '{value}',
              userInfo?.vague_mobile
            )}
          </p>
        ) : null}

        <Form
          name="basic"
          ref={formRef}
          style={{ maxWidth: 600, margin: '24px 0' }}
          initialValues={{ phone: '', newPhone: '', phonePwd: '' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          {/* 手机号输入框 */}
          {!isChangePhone ? (
            <Form.Item<FieldType>
              label=""
              name="phone"
              rules={[
                { required: true, message: ' ' },
                { validator: checkPhone }
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                className={Style.addonInp}
                placeholder={t('bindPhoneModal-phone')}
                value={phoneInp}
                onChange={(event) => {
                  setphoneInp(event.target.value);
                }}
              />
            </Form.Item>
          ) : null}

          {isChangePhone ? (
            <Form.Item<FieldType>
              label=""
              name="newPhone"
              rules={[
                { required: true, message: ' ' },
                { validator: checkPhone }
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                value={newphoneInp}
                className={Style.addonInp}
                placeholder={t('bindPhoneModal-newPhone')}
                onChange={(event) => {
                  setNewphoneInp(event.target.value);
                }}
              />
            </Form.Item>
          ) : null}
          {/* 手机号验证码输入框 */}
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
                  disabled={!phoneCheckPass}
                >
                  {isResendDisabled
                    ? countdown + ' s'
                    : t('bindEmailModal-sendBtn')}
                </div>
              }
            />
          </Form.Item>
          {/* 邮箱验证码输入框 */}
          {userInfo?.vague_email ? (
            <>
              {isResendDisabledEmail ? (
                <p className={Style.changeEmailDesc}>
                  {t('setup2FAModal-desc').replace(
                    '{value}',
                    userInfo?.vague_email
                  )}
                </p>
              ) : null}
              <Form.Item<FieldType>
                label=""
                name="emailPwd"
                rules={[{ required: true, message: t('emailCodeInpMsg') }]}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('bindPhoneModal-emailCode')}
                  onChange={(event) => {
                    setemailPwd(event.target.value);
                  }}
                  suffix={
                    <div
                      className={Style.sentCodeBtn}
                      onClick={() => showCaptcha('email')}
                    >
                      {isResendDisabledEmail
                        ? countdownEmail + ' s'
                        : t('bindEmailModal-sendBtn')}
                    </div>
                  }
                />
              </Form.Item>
            </>
          ) : null}

          <Form.Item style={{ marginTop: '35px' }}>
            <div className={Style.withdrawTips}>
              <TipSvg className={Style.tipsIcon} />
              <div className={Style.tipsText}>{t('withdrawTipsBindPhone')}</div>
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

export default forwardRef(BindPhoneModal);
