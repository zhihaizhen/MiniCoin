import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo
} from 'react';
import cls from 'classnames';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import Cookie from 'js-cookie';
import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Select,
  InputNumber
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ReactCountryFlag from 'react-country-flag';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { emailValidate } from '~/utils/validation';
import { getCountryList, getCurrentCountryCode, postWithPwdLogin } from '~/api';
import Style from './index.module.less';
import { loginPushRouter } from '~/utils';

type FieldType = {
  email?: string;
  mobile?: string;
  pwdCode?: string;
};

type walletDetailType = { visible: boolean; address: string };
interface IMultipleLoginProps {
  mode: 'login' | 'register';
  type: 'email' | 'mobile';
  walletDetail: {
    visible: boolean;
    address: string;
  };
  changeWalletDetail: (value: walletDetailType) => void;
}

// const { Option } = Select;

function MultipleLogin(props: IMultipleLoginProps, ref: any) {
  const { mode, type } = props;
  const [emailInp, setemailInp] = useState('');
  const [mobileInp, setmobileInp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwdLeftTimes, setPwdLeftTimes] = useState(); // 密码输入错误后的剩余次数
  const [emailCheckPass, setemailCheckPass] = useState(false);
  const [mobileCheckPass, setmobileCheckPass] = useState(false);
  const [referralCode, setreferralCode] = useState<string>('');
  // const [particleAddress, setparticleAddress] = useState('');
  const [loading, setloading] = useState<boolean>(false);
  const [agreementChecked, setagreementChecked] = useState<boolean>(true);
  const [countryCodeList, setcountryCodeList] = useState<Array<any>>([]);
  const [currentCodeInfo, setcurrentCodeInfo] = useState<{
    area_code: string;
    country: string;
  }>({ area_code: '86', country: 'CN' });
  const { updateUserInfo, userInfo } = useUserInfo();

  const formRef = useRef(null);
  const t = useFm();

  function mapOptionList(list) {
    return list.map((item) => ({
      label: (
        <div key={item?.code} className={Style.flagContainer}>
          <ReactCountryFlag
            countryCode={item?.code}
            style={{
              fontSize: '17px',
              lineHeight: '17px'
            }}
            svg
          />
          <span style={{ marginLeft: '5px' }}>+{item?.area_code}</span>
        </div>
      ),
      value: item?.area_code
    }));
  }
  const changeCountry = (v) => {
    const selectCountry = countryCodeList.find((item) => item?.area_code === v);
    setcurrentCodeInfo({ ...selectCountry, country: selectCountry.code });
  };

  function handleShowPassword() {
    setShowPassword((pre) => !pre);
  }

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        showSearch
        onChange={changeCountry}
        style={{ width: 100, height: '100%' }}
        options={mapOptionList(countryCodeList)}
        optionFilterProp="children"
        filterOption={(input, option) => {
          return (String(option?.value) ?? '').includes(input);
        }}
      />
    </Form.Item>
  );

  const getParams = () => {
    const isEmail = type === 'email';
    const formData = formRef?.current?.getFieldsValue();
    console.log('getParams', formData);
    const { email, mobile, prefix, verify_code, pwd: password } = formData;
    let params = {
      type: 'email',
      affiliate: 1,
      password,
      email
    };
    if (!isEmail) {
      params = {
        type: 'phone',
        country_code: currentCodeInfo?.country,
        area_code: prefix || currentCodeInfo?.area_code,
        affiliate: 1,
        password,
        mobile
      } as any;
    }
    Object.keys(params).forEach((it) => {
      if (!params[it]) {
        delete params[it];
      }
    });
    return params;
  };

  // 密码提交登录
  const handleWithPwdLoginSubmit = async (values: any) => {
    setloading(true);
    const params = getParams();
    try {
      await postWithPwdLogin(params);
      await updateUserInfo();
      setloading(false);
      message.success(t('loginTips'));
      loginPushRouter();
    } catch (error) {
      const { left_times } = error?.response?.data?.data || {};
      console.log(error, '密码提交接口error', left_times);
      if (error?.code === 20000103) {
        setPwdLeftTimes(left_times || -1);
      } else {
        setPwdLeftTimes(null);
      }
      setloading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  function checkEmail() {
    const formData = formRef?.current?.getFieldsValue();
    if (!emailValidate(formData.email)) {
      setemailCheckPass(false);
      return Promise.reject(t('emailInpMsg'));
    }
    setemailCheckPass(true);
    return Promise.resolve();
  }

  function checkPhoneNumber() {
    const formData = formRef?.current?.getFieldsValue();
    if (!formData.mobile) {
      setmobileCheckPass(false);
      return Promise.reject(t('mobileInpMsg'));
    }
    setmobileCheckPass(true);
    return Promise.resolve();
  }

  // useEffect(() => {
  //   console.log(userInfo?.address, particleAddress, 999);
  //   if (userInfo && particleAddress) {
  //     if (userInfo?.address !== particleAddress) {
  //       postProfileUpdate({ address: particleAddress });
  //     }
  //   }
  // }, [particleAddress, userInfo]);

  async function getCurrentIpDetail() {
    const countryList = await getCountryList();
    setcountryCodeList(countryList);
    const currentCode = await getCurrentCountryCode();
    setcurrentCodeInfo(currentCode);
    formRef?.current?.setFieldValue('prefix', currentCode?.area_code);
  }

  useEffect(() => {
    if (type === 'mobile') {
      getCurrentIpDetail();
    }
  }, [type]);

  // useEffect(() => {
  //   return () => {
  //     clearTimeInterver();
  //   };
  // }, []);

  useEffect(() => {
    if (mode !== 'register') return;
    const parsed = queryString.parse(location.search);
    const referralCode =
      parsed?.invite_code ||
      parsed?.inviteCode ||
      new URLSearchParams(window.location.search).get('inviteCode') ||
      new URLSearchParams(window.location.search).get('invite_code') ||
      Cookie.get('invite_code') ||
      Cookie.get('inviteCode');
    if (referralCode) {
      setreferralCode(referralCode as string);
    }
  }, [mode]);

  const pwdErrorText = useMemo(() => {
    let text; //剩下4次
    switch (pwdLeftTimes) {
      case 4:
        text = t('pwdError');
        break;
      case 3:
      case 2:
      case 1:
        text = t('pwdErrorrWithValue', { value: pwdLeftTimes });
        break;
      default:
        text = t('errorManyTimes');
        break;
    }
    if (pwdLeftTimes) {
      return <div className={Style.error}>{text}</div>;
    }
    return null;
  }, [pwdLeftTimes]);

  return (
    <div className={Style.email}>
      {/* <div className="title">{t('email-title')}</div> */}
      <Form
        name="email"
        ref={formRef as any}
        style={{ maxWidth: 600, margin: '32px 0' }}
        initialValues={{ remember: true }}
        onFinish={handleWithPwdLoginSubmit}
        onFinishFailed={onFinishFailed}
      >
        {type === 'email' ? (
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
              placeholder={t('email-address')}
              value={emailInp}
              onChange={(event) => {
                setemailInp(event.target.value);
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item<FieldType>
            label=""
            name="mobile"
            rules={[
              { required: true, message: ' ' },
              { validator: checkPhoneNumber }
            ]}
          >
            <Input
              addonBefore={prefixSelector}
              className={Style.addonInp}
              placeholder={t('mobile-placeholder')}
              value={mobileInp}
              onChange={(event) => {
                setmobileInp(event.target.value);
              }}
            />
          </Form.Item>
        )}
        {/* <Form.Item<FieldType>
          label=""
          name="pwdCode"
          rules={[
            {
              required: true,
              message: t('emailCodeInpMsg')
            }
          ]}
        >
          <div>
            <Input
              className={Style.userInp}
              placeholder={t('verification-code')}
              autoComplete="off"
              suffix={
                <div
                  className={`${Style.sentCodeBtn} ${
                    isDisabled ? Style.sentDisable : ''
                  }`}
                  onClick={showCaptcha}
                  // disabled={type === 'email' ? !emailCheckPass : !mobileCheckPass}
                >
                  {isResendDisabled ? countdown + ' s' : t('sendCode-btn')}
                </div>
              }
            />
          </div>
        </Form.Item> */}
        {mode === 'login' && (
          <Form.Item
            label=""
            name="pwd"
            rules={[
              {
                required: true,
                message: t('passwordTips')
              }
            ]}
            // validateTrigger="onBlur"
            validateStatus={pwdErrorText ? 'error' : ''}
            help={pwdErrorText}
          >
            <Input
              className={Style.userInp}
              placeholder={t('passwordPH')}
              autoComplete="off"
              type={showPassword ? 'text' : 'password'}
              suffix={
                <div
                  className={cls(Style.eyesIcon, {
                    [Style.unvisibleEyes]: !showPassword,
                    [Style.visibleEyes]: showPassword
                  })}
                  onClick={handleShowPassword}
                />
              }
            />
          </Form.Item>
        )}

        <Form.Item style={{ marginTop: '35px' }}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!agreementChecked && mode === 'register'}
          >
            {loading ? (
              <LoadingOutlined style={{ color: 'white' }} />
            ) : mode === 'login' ? (
              t('login-button')
            ) : (
              t('signup-button')
            )}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default MultipleLogin;
