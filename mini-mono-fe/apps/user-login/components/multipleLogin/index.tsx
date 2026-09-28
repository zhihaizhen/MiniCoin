// @ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo
} from 'react';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import cls from 'classnames';
import Cookie from 'js-cookie';
import {
  Button,
  Modal,
  Checkbox,
  Form,
  Input,
  message,
  Select,
  Tooltip
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ReactCountryFlag from 'react-country-flag';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCurCaptcha } from '~/context/captchaContext';
import {
  VagueMobile,
  emailShow,
  emailValidate,
  pwdRuleList,
  pwdValidate
} from '~/utils/validation';
import useCountDown from '~/hooks/useCountDown';
import {
  postEmailCodeSend,
  postCodeSend,
  getCountryListFilteredByIp,
  getCurrentCountryCode,
  postNoPwdLogin,
  postWithPwdRegister,
  postWithPwdLogin,
  postPwdAuth,
  postPwdAuthLogin,
  postBindAccount
} from '~/api';
import { getLang, isPC } from '@better-bit-fe/base-utils';
import CountdownModal from '~/components/countdownModal';
import { EmailCodeType, STORAGE_ADDRESS, ISNEWUSER } from '~/constants';
import { phoneValidate } from '~/utils/validation';
import Style from './index.module.less';
import { getCookie } from 'by-storage';
import GoogleLogin from '../googleLogin';
import AppleLogin from '../appleLogin';
import PasskeyLogin from '../passkeyLogin';

interface IMultipleLoginProps {
  mode: 'login' | 'register';
  type: 'email' | 'mobile';
  getNextInfo: (value: number) => void;
  isBindMode?: boolean;
  fixedReferralCode?: string;
  isRestricted?: boolean;
  checkIpRestriction?: () => Promise<boolean>;
  active?: boolean;
}

const MultipleLogin = (props: IMultipleLoginProps, ref: any) => {
  const { mode, type, getNextInfo, isBindMode, fixedReferralCode, isRestricted, checkIpRestriction, active } = props;
  const [emailInp, setemailInp] = useState('');
  const [mobileInp, setmobileInp] = useState('');
  const lang = getLang();
  const [checkPass, setCheckPass] = useState({
    email: false,
    mobile: false,
    pwd: false,
    repeatPwd: false,
    verify_code: false,
    mobileError: ''
  });

  const [referralCode, setreferralCode] = useState<string>('');
  const [pwd, setPwd] = useState('');
  const [pwdLeftTimes, setPwdLeftTimes] = useState(); // 密码输入错误后的剩余次数
  const [pwdStep2LeftTimes, setStep2PwdLeftTimes] = useState(); // 密码输入验证码弹窗错误后的剩余次数
  const [leftTimes, setLeftTimes] = useState(); // 验证码输入错误后的剩余次数
  const [pwdToken, setPwdToken] = useState();
  const [noPwdLogin, setNoPwdLogin] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPwd, setShowRepeatPwd] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false); // 设置密码的弹窗
  const [showPwdPop, setShowPwdPop] = useState(false); // 展示密码规则的提示
  const [loading, setloading] = useState<boolean>(false);
  const [modalBtnLoading, setModalBtnLoading] = useState<boolean>(false);
  const [agreementChecked, setagreementChecked] = useState<boolean>(true);
  const [countryCodeList, setcountryCodeList] = useState<Array<any>>([]);
  const [currentCodeInfo, setcurrentCodeInfo] = useState<{
    area_code: string;
    country: string;
  }>({ area_code: '86', country: 'CN' });
  const { updateUserInfo, userInfo } = useUserInfo();
  const { countdown, isResendDisabled, resendTimeInterver, clearTimeInterver } =
    useCountDown();
  const formRef = useRef(null);
  const formPwdRef = useRef(null);
  const countdownRef = useRef(null);

  const t = useFm();
  const { locale, isReady, query } = useRouter();
  const captcha = useCurCaptcha();
  const [isDisableReferral, setIsDisableReferral] = useState(false);

  // 向外部暴露注册函数
  useImperativeHandle(ref, () => ({
    handleRegister: handleRegisterSubmit
  }));

  async function countdownFinish(params) {
    // 过滤不需要的参数字段
    const { next, password, vague_email, vague_mobile, ...requireParams } = params;

    // 获取绑定token
    const bindToken = isBindMode ? localStorage.getItem('bind_token') : null;

    try {
      await postPwdAuthLogin(
        requireParams,
        ...(isBindMode && bindToken ? [{ 'auth_token': bindToken }] : [])
      );

      await updateUserInfo();
      setloading(false);

      if (isBindMode) {
        message.success(t('linkTips'));
        // 清除localStorage中的第三方登录标记
        localStorage.removeItem('isNewUserFromThirdParty');
        localStorage.removeItem('bind_token');
      } else {
        message.success(t('loginTips'));
      }
    } catch (error) {
      const { left_times } = error?.response?.data?.data || {};

      // 定义需要设置剩余次数的错误码
      const errorCodesForLeftTimes = [20000103, 20005011, 20007009, 20007004];

      if (errorCodesForLeftTimes.includes(error?.code)) {
        setStep2PwdLeftTimes(left_times || -1);
      } else {
        setStep2PwdLeftTimes();
      }

      if (error?.code === 20000089) {
        countdownRef.current?.changeModalVisible(false, {});
      }

      setloading(false);
    }
  }

  const isVerifyCodeDisabled = useMemo(() => {
    return type === 'email' ? !checkPass.email : !checkPass.mobile;
  }, [checkPass, type]);

  function handleShowPassword() {
    setShowPassword((pre) => !pre);
  }

  function handleShowRepeatPwd() {
    setShowRepeatPwd((pre) => !pre);
  }

  function handleShowReferral() {
    setShowReferral((pre) => !pre);
  }

  //
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
    checkPhoneNumber();
  };

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
    const { email, mobile, prefix, verify_code, pwd: password } = formData;
    let params = {
      type: 'email',
      referral_code: referralCode,
      verify_code,
      password,
      email
    };
    if (!isEmail) {
      params = {
        type: 'phone',
        country_code: currentCodeInfo?.country,
        area_code: prefix,
        referral_code: referralCode,
        verify_code,
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

  // 关闭弹窗之后
  const handleClosePwdModal = () => {
    setShowPwdModal(false);
    window.location.href = `/${lang}/account/login`;
  };

  const handleForgetPwd = () => {
    window.location.href = `/${lang}/account/resetPwd${window.location.search}`;
  };

  const gotoRegister = (error) => {
    // 没有注册时，给提示
    if (error?.code === 20012022 || error?.code === 20012021) {
      window.location.href = `/${lang}/account/register`;
    }
  };

  // 免密登录 & 确定是否已经设置密码
  const handleNoPwdPreLogin = async () => {
    setloading(true);
    const params = getParams();
    try {
      const loginData = await postNoPwdLogin(params);
      const { pwd_token } = loginData;
      if (pwd_token) {
        setShowPwdModal(true);
        setPwdToken(pwd_token);
      } else {
        message.success(t('loginTips')); // 登陆成功
        await updateUserInfo();
      }
      setloading(false);
    } catch (error) {
      const { left_times } = error?.response?.data?.data || {};
      if (error?.code === 20007009 || error?.code === 20007004) {
        setLeftTimes(left_times || -1);
      } else {
        setLeftTimes();
      }
      gotoRegister(error);
      setloading(false);
    }
  };

  // 点击登录或注册
  const onFinish = async (values) => {
    if (checkIpRestriction) {
      const restricted = await checkIpRestriction();
      if (restricted) return;
    }

    // 注册模式：发送验证码
    if (mode === 'register') {
      handleCaptcha();
      return;
    }

    // 绑定现有账号模式 等同于带token的登录，直接使用密码登录流程
    if (isBindMode) {
      handleWithPwdLoginSubmit(values);
      return;
    }

    // 普通登录模式：根据是否免密选择不同的登录方式
    if (noPwdLogin) {
      handleNoPwdPreLogin();
    } else {
      handleWithPwdLoginSubmit(values);
    }
  };

  {
    /* 接口类方法 */
  }

  // 发送验证码
  async function handleCaptcha() {
    if (isResendDisabled || isVerifyCodeDisabled) return;
    if (!emailInp && type === 'email') return;
    if (!mobileInp && type === 'mobile') return;
    try {
      const _captchaInfo = await captcha.showCaptcha();
      // setcaptchaInfo(_captchaInfo);
      resendTimeInterver();
      // 去到输入验证码的页面

      if (mode === 'register') {
        const account = type === 'email' ? emailInp : mobileInp;
        const areaCode = formRef?.current?.getFieldValue('prefix');

        getNextInfo({
          step: 2,
          type,
          account,
          areaCode
        });
      }
      await handleSendCode(_captchaInfo);
    } catch (e) {
      // setcaptchaInfo({});
      throw e;
    }
  }

  const handleSendCode = async (_captchaInfo) => {
    if (emailInp && type === 'email') {
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
    if (mobileInp && type === 'mobile') {
      const formData = formRef?.current?.getFieldsValue();
      const { prefix } = formData;
      await postCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        code_type: 'login_mobile',
        mobile: mobileInp,
        // country_code: currentCodeInfo?.country,
        area_code: prefix
      });
    }
  };

  // 提交注册
  const handleRegisterSubmit = async (verify_code) => {
    setloading(true);
    const params = getParams();
    // 获取绑定token
    const bindToken = isBindMode ? localStorage.getItem('bind_token') : null;
    const newParams = {
      ...params,
      verify_code
    };
    try {
      const res = await postWithPwdRegister(
        newParams,
        ...(isBindMode && bindToken ? [{ 'auth_token': bindToken }] : [])
      );
      setloading(false);
      const { is_new_user } = res;
      localStorage.setItem(ISNEWUSER, is_new_user);
      await updateUserInfo();
      message.success(t('loginTips'));

      // 清除localStorage中的第三方登录标记
      localStorage.removeItem('isNewUserFromThirdParty');
      localStorage.removeItem('bind_token');
    } catch (error) {
      console.log(error, '注册接口error');
      if (error?.code === 20000022 || error?.code === 20000033) {
        // 邮箱|手机号已经注册的用户
        setTimeout(() => {
          window.location.href = `/${lang}/account/login`;
        }, 1000);
      }
      setloading(false);
    }
  };

  // 密码提交登录
  const handleWithPwdLoginSubmit = async (values: any) => {
    setloading(true);
    const params = getParams();
    try {
      const pwdAuthRes = await postPwdAuth({ ...params });
      const { next, email: vague_email, mobile: vague_mobile, user_id: userId } = pwdAuthRes;

      // 存储vague_email和vague_mobile，供reset2fa页面使用
      if (vague_email) {
        localStorage.setItem('vague_email', vague_email);
      }
      if (vague_mobile) {
        localStorage.setItem('vague_mobile', vague_mobile);
      }
      if (userId) {
        localStorage.setItem('userId', userId);
      }

      // 展示安全验证弹窗，并且光标聚焦到第一个输入框
      countdownRef.current?.changeModalVisible(true, { ...params, next, vague_email, vague_mobile });
      setPwdLeftTimes(null);
      setStep2PwdLeftTimes(null);
      // if(next === 1){
      //   // 2fa
      //   countdownRef.current.changeModalVisible(true, type);
      // }
      // if(next === 2){
      //   //email code
      // }
      // if(next ===3){
      //   // mobile code
      // }
    } catch (error) {
      // message.error(t(error.code));
      const { left_times } = error?.response?.data?.data || {};
      if (error?.code === 20000103) {
        setPwdLeftTimes(left_times || -1);
      } else {
        setPwdLeftTimes();
      }
      setloading(false);
    }
    /*
    try {
      await postWithPwdLogin(params);
      await updateUserInfo();
      setloading(false);
      message.success(t('loginTips'));
    } catch (error) {
      const { left_times } = error?.response?.data?.data || {};
      console.log(error, '密码提交接口error', left_times);
      if (error?.code === 20000103) {
        setPwdLeftTimes(left_times || -1);
      } else {
        setPwdLeftTimes();
      }
      setloading(false);
    }
      */
  };

  // 免密登录,设置密码
  const handleNoPwdLoginSubmit = async (values) => {
    setModalBtnLoading(true);
    const params = getParams();
    const password = formPwdRef?.current?.getFieldValue('pwd');
    try {
      await postNoPwdLogin({ ...params, password, pwd_token: pwdToken });
      setModalBtnLoading(false);
      message.success(t('pwdSetSuccessPlsLogin'));
      setShowPwdModal(false);
      setTimeout(() => {
        window.location.href = `/${lang}/account/login`;
      }, 2000);
    } catch (error) {
      console.log(error, 'error');
      setModalBtnLoading(false);
    }
  };

  {
    /* 验证类方法 */
  }

  function handleCheckPwd(val) {
    if (!val) {
      setShowPwdPop(false);
    } else {
      setShowPwdPop(true);
    }

    setPwd(val);
    return Promise.resolve();
  }

  const checkEmail = () => {
    const formData = formRef?.current?.getFieldsValue();
    if (!emailValidate(formData.email)) {
      setCheckPass({
        ...checkPass,
        email: false
      });
      return Promise.reject(t('emailInpMsg'));
    }
    setCheckPass({
      ...checkPass,
      email: true
    });
    return Promise.resolve();
  };

  const checkPhoneNumber = () => {
    const formData = formRef?.current?.getFieldsValue();
    if (formData.mobile && !phoneValidate(formData.mobile, formData.prefix)) {
      setCheckPass({
        ...checkPass,
        mobile: false,
        mobileError: t('phone-error')
      });
      return Promise.reject(t('phone-error'));
    } else if (!formData.mobile) {
      setCheckPass({
        ...checkPass,
        mobile: false,
        mobileError: t('mobileInpMsg')
      });
      return Promise.reject(t('mobileInpMsg'));
    } else {
      setCheckPass({
        ...checkPass,
        mobile: true,
        mobileError: ''
      });
      return Promise.resolve('');
    }
  };

  const checkPwd = () => {
    const pwd = formRef?.current?.getFieldValue('pwd');
    let isPass;
    // 密码登陆的时候不做校验
    if (mode === 'login' && !noPwdLogin && pwd) {
      isPass = true;
    } else {
      isPass = pwdValidate(pwd);
    }

    setCheckPass({
      ...checkPass,
      pwd: isPass
    });

    return isPass
      ? Promise.resolve()
      : Promise.reject(pwd ? t('pwdNotMatchRule') : t('passwordTips'));
  };

  const checkRepeatPwd = () => {
    const { pwdRepeat, pwd } = formRef?.current?.getFieldsValue();
    if (pwd && pwd === pwdRepeat) {
      setCheckPass({
        ...checkPass,
        repeatPwd: true
      });
      return Promise.resolve();
    }
    setCheckPass({
      ...checkPass,
      repeatPwd: false
    });

    return Promise.reject(
      pwdRepeat && pwd ? t('repeatPwdNotSameWithPwd') : t('passwordTips')
    );
  };

  const checkValuePass = (v, type) => {
    setCheckPass({
      ...checkPass,
      [type]: v
    });
  };

  const checkModalPwd = () => {
    const pwd = formPwdRef?.current?.getFieldValue('pwd');
    const isPass = pwdValidate(pwd);
    return isPass
      ? Promise.resolve()
      : Promise.reject(pwd ? t('pwdNotMatchRule') : t('passwordTips'));
  };

  const checkModalRepeatPwd = () => {
    const { pwd, pwdRepeat } = formPwdRef?.current?.getFieldsValue() || {};
    if (pwd && pwd === pwdRepeat) {
      return Promise.resolve();
    }
    return Promise.reject(
      pwdRepeat && pwd ? t('repeatPwdNotSameWithPwd') : t('passwordTips')
    );
  };

  const supportedLanguages = [
    {
      value: 'en-US',
      country: 'US',
      lang: 'en',
      area_code: '1'
    },
    {
      value: 'zh-CN',
      country: 'CN',
      lang: 'zh',
      area_code: '86'
    },
    {
      value: 'zh-TW',
      country: 'TW',
      lang: 'zh',
      area_code: '886'
    },
    {
      value: 'vi-VN',
      country: 'VN',
      lang: 'vi',
      area_code: '84'
    },
    {
      value: 'ko-KR',
      country: 'KR',
      lang: 'ko',
      area_code: '82'
    }
  ];

  const getCurrentIpDetail = async () => {
    const countryList = await getCountryListFilteredByIp({ from: mode });
    setcountryCodeList(countryList);

    // ---- check country code from cookie
    const cookieLang = getCookie('language');
    // cookie lang is like zh-CN, zh-TW, en-US, vi-VN, ko-KR
    // get area code by cookie lang
    const cookieLangCode = supportedLanguages.find(
      (item) => item.value === cookieLang
    );

    // ---- check country code from browser
    const browserLang = navigator.language;
    const browserLangRegion = browserLang?.split('-')[1]?.toLowerCase();
    const browserCountry = browserLangRegion
      ? countryList.find(
        (item) =>
          item.code?.toLowerCase() === browserLangRegion?.toLowerCase()
      )
      : null;
    const browserCountryAreaCode = browserCountry?.area_code ?? '';

    //country code from API(based on IP)
    const apiAreaCode = await getCurrentCountryCode();
    let areaCode = '86';
    let country = 'CN';

    //country code from API(based on IP) 优先级最高
    if (apiAreaCode?.area_code) {
      areaCode = apiAreaCode?.area_code;
      country = apiAreaCode?.country;
    } else if (cookieLangCode?.area_code) {
      areaCode = cookieLangCode?.area_code;
      country = cookieLangCode?.country;
    } else if (browserCountryAreaCode) {
      areaCode = browserCountryAreaCode?.area_code;
      country = browserCountry;
    }
    setcurrentCodeInfo({
      country: country,
      area_code: areaCode
    });
    formRef?.current?.setFieldValue('prefix', areaCode);
  };

  useEffect(() => {
    if (type === 'mobile') {
      getCurrentIpDetail();
    }
  }, [type]);

  useEffect(() => {
    return () => {
      clearTimeInterver();
    };
  }, []);

  useEffect(() => {
    if (mode !== 'register') return;
    const parsed = queryString.parse(location.search);
    const referralCode = fixedReferralCode ||
      parsed?.invite_code ||
      parsed?.inviteCode ||
      new URLSearchParams(window.location.search).get('inviteCode') ||
      new URLSearchParams(window.location.search).get('invite_code') ||
      Cookie.get('invite_code') ||
      Cookie.get('inviteCode');
    console.log(
      '---invite_code or inviteCode: ' + Cookie.get('invite_code') ||
      Cookie.get('inviteCode')
    );
    console.log(
      '---search inviteCode: ' +
      new URLSearchParams(window.location.search).get('inviteCode') ||
      new URLSearchParams(window.location.search).get('invite_code')
    );
    if (referralCode) {
      setreferralCode(referralCode as string);
      setIsDisableReferral(true);
      setShowReferral(true);
    } else {
      setIsDisableReferral(false);
      setShowReferral(false);
    }
    if (parsed?.username) {
      setemailInp(parsed?.username);
      formRef?.current?.setFieldValue('email', parsed?.username);
    }
  }, [mode]);

  const pwdRulesContent = useMemo(() => {
    if (pwd) {
      const pass = pwdValidate(pwd);
      setShowPwdPop(!pass);
      setCheckPass({
        ...checkPass,
        pwd: pass
      });
    }
    return pwdRuleList.map((it) => {
      const { checkRule, msg } = it;
      return (
        <div className={Style.pwdRuleItem}>
          <div
            className={cls(Style.checkIcon, {
              [Style.checkOKIcon]: checkRule(pwd),
              [Style.unCheckIcon]: !checkRule(pwd)
            })}
          />
          {t(msg)}
        </div>
      );
    });
  }, [pwd]);
  const pwdErrorModalText = useMemo(() => {
    let text; //剩下4次
    switch (pwdStep2LeftTimes) {
      case 4:
      case 3:
      case 2:
      case 1:
        text = t('pwdErrorrWithValue', { value: pwdStep2LeftTimes });
        break;
      default:
        text = t('errorManyTimes');
        break;
    }
    if (pwdStep2LeftTimes) {
      return text;
    }
    return null;
  }, [pwdStep2LeftTimes]);

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

  const identifyCodeErrorText = useMemo(() => {
    let text; //剩下4次
    switch (leftTimes) {
      case 4:
        text = t('identifyCodeError');
        break;
      case 3:
      case 2:
      case 1:
        text = t('identifyCodeErrorWithValue', { value: leftTimes });
        break;
      default: // 错误次数太多
        text = t('errorManyTimes');
        break;
    }
    if (leftTimes) {
      return <div className={Style.error}>{text}</div>;
    }
    return null;
  }, [leftTimes]);

  const submitBtnDisabled = useMemo(() => {
    const { email, verify_code, pwd, repeatPwd, mobile } = checkPass;
    let isPass = type === 'email' ? email : mobile;
    if (mode === 'register') {
      // isPass = isPass && repeatPwd && agreementChecked;
      isPass = isPass && agreementChecked;
    }

    if (noPwdLogin) {
      isPass = isPass && verify_code;
    } else {
      isPass = isPass && pwd;
    }

    // 密码登录的时候，不做禁用，解决自动填充问题
    if (mode === 'login' && !noPwdLogin) {
      isPass = true;
    }
    return !isPass;
  }, [type, mode, checkPass, agreementChecked]);


  const agreementText = t('agreement').replace('{{url-service-condition}}', t('url-service-condition')).replace('{{url-privacy-policy}}', t('url-privacy-policy'))
  return (
    <>
      <div className={Style.email}>
        {/* 安全验证弹窗 */}
        <CountdownModal
          ref={countdownRef}
          onFinish={countdownFinish}
          cancelLoading={() => setloading(false)}
          Step2PwdLeftTimes={pwdStep2LeftTimes}
          pwdErrorModalText={pwdErrorModalText}
        />
        <Form
          name="email"
          ref={formRef as any}
          style={{ maxWidth: 600, margin: '12px 0' }}
          initialValues={{ remember: true, email: emailInp }}
          onFinish={onFinish}
        >
          {type === 'email' ? (
            <Form.Item
              label=""
              name="email"
              validateTrigger="onBlur"
              rules={[
                { required: true, message: ' ' },
                { validator: checkEmail }
              ]}
            >
              <Input
                // className={Style.userInp}
                placeholder={t('email-address')}
                value={emailInp}
                onChange={(event) => {
                  setemailInp(event.target.value);
                  if (pwdLeftTimes) {
                    setPwdLeftTimes(null);
                  }
                }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="mobile"
              label=""
              // validateTrigger="onBlur"
              help={checkPass.mobileError}
              validateStatus={
                checkPass.mobileError && !checkPass.mobile ? 'error' : 'success'
              }
              rules={[
                { required: true, message: ' ' }
                // { validator: checkPhoneNumber }
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                type="number"
                // className={Style.addonInp}
                placeholder={t('mobile-placeholder')}
                value={mobileInp}
                onChange={(event) => {
                  setmobileInp(event.target.value);
                  if (pwdLeftTimes) {
                    setPwdLeftTimes(null);
                  }
                  checkPhoneNumber();
                }}
              />
            </Form.Item>
          )}
          {/* 免密登录的验证码 */}
          {noPwdLogin && (
            <Form.Item
              label=""
              name="verify_code"
              rules={[
                {
                  required: true,
                  message: t('phoneCodeInpMsg')
                }
              ]}
              validateStatus={identifyCodeErrorText ? 'error' : ''}
              help={identifyCodeErrorText}
            >
              <Input
                // className={Style.userInp}
                placeholder={t('verification-code')}
                autoComplete="off"
                onChange={(event) => {
                  checkValuePass(event.target.value, 'verify_code');
                }}
                suffix={
                  <div
                    className={`${Style.sentCodeBtn} ${isVerifyCodeDisabled ? Style.sentDisable : ''
                      }`}
                    onClick={handleCaptcha}
                  >
                    {isResendDisabled ? countdown + ' s' : t('sendCode-btn')}
                  </div>
                }
              />
            </Form.Item>
          )}
          {/* 密码登录 */}
          {!noPwdLogin && mode === 'login' && (
            <Form.Item
              label=""
              name="pwd"
              rules={[
                {
                  required: true,
                  message: ''
                },
                { validator: checkPwd }
              ]}
              // validateTrigger="onBlur"
              validateStatus={pwdErrorText ? 'error' : ''}
              help={pwdErrorText}
            >
              <Input
                // className={Style.userInp}
                placeholder={t('passwordPH')}
                autoComplete="off"
                type={showPassword ? 'text' : 'password'}
                onChange={(event) => {
                  handleCheckPwd(event.target.value);
                  if (pwdLeftTimes) {
                    setPwdLeftTimes();
                  }
                }}
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
          {/* 注册输入密码 */}
          {mode === 'register' && (
            <Tooltip
              overlayClassName={Style.rulePop}
              open={showPwdPop}
              placement="bottomLeft"
              title={pwdRulesContent}
              align={{
                offset: [0, -10]
              }}
            >
              <Form.Item
                label=""
                name="pwd"
                rules={[
                  {
                    required: true,
                    message: ''
                  },
                  { validator: checkPwd }
                ]}
                validateStatus={pwdErrorText ? 'error' : ''}
                help={pwdErrorText}
              >
                <Input
                  // className={Style.userInp}
                  placeholder={t('passwordPH')}
                  autoComplete="new-password"
                  type={showPassword ? 'text' : 'password'}
                  onChange={(event) => {
                    handleCheckPwd(event.target.value);
                  }}
                  onBlur={() => {
                    setShowPwdPop(false);
                  }}
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
            </Tooltip>
          )}
          {/* 再次输入密码 */}
          {/* {mode === 'register' && (
            <Form.Item
              label=""
              name="pwdRepeat"
              rules={[
                {
                  required: true,
                  message: ''
                },
                { validator: checkRepeatPwd }
              ]}
            >
              <Input
                // className={Style.userInp}
                placeholder={t('passwordRepeatPH')}
                autoComplete="off"
                type={showRepeatPwd ? 'text' : 'password'}
                suffix={
                  <div
                    className={cls(Style.eyesIcon, {
                      [Style.unvisibleEyes]: !showRepeatPwd,
                      [Style.visibleEyes]: showRepeatPwd
                    })}
                    onClick={handleShowRepeatPwd}
                  />
                }
              />
            </Form.Item>
          )} */}

          {/* refercode */}
          {mode === 'register' && (
            <div className={Style.referral}>
              <div className={Style.referralTitle} onClick={handleShowReferral}>
                {t('referralCode-title')}
                <span
                  className={cls(Style.commonIcon, Style.exandIcon, {
                    [Style.expandUpIcon]: showReferral
                  })}
                />
              </div>
              {showReferral && (
                <Input
                  disabled={isDisableReferral}
                  value={referralCode}
                  placeholder={t('referralCode-inp')}
                  // className={Style.userInp}
                  onChange={(Event) => setreferralCode(Event.target.value)}
                />
              )}
            </div>
          )}

          {/* 免密登录 & 忘记密码 */}
          {mode === 'login' && !noPwdLogin && (
            <div className={Style.loginWay}>
              {/* <div onClick={() => setNoPwdLogin(true)}>
                {t('noPasswordLogin')}
              </div> */}
              <div onClick={handleForgetPwd}>{t('forgetPassword')}</div>
            </div>
          )}
          {/* 密码登录 */}
          {mode === 'login' && noPwdLogin && (
            <div className={Style.loginWay}>
              <div onClick={() => setNoPwdLogin(false)}>
                {t('passwordLogin')}
              </div>
            </div>
          )}
          {mode === 'register' && (
            <Checkbox
              defaultChecked={agreementChecked}
              value={agreementChecked}
              onChange={(Event) => {
                setagreementChecked(Event?.target?.checked);
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: agreementText }} />
            </Checkbox>
          )}

          <Form.Item style={{ marginTop: '35px' }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={submitBtnDisabled}
            >
              {loading ? (
                <LoadingOutlined style={{ color: 'white' }} />
              ) : isBindMode ? (
                t('linkAccount')
              ) : mode === 'login' ? (
                t('login-button')
              ) : (
                t('signup-button')
              )}
            </Button>
          </Form.Item>
        </Form>
        {!isBindMode && isReady && !query.isOauth && (
          <div className={Style.thirdPartyLogin}>
            <div className={Style['custom-login-container']}>
              <div className={Style['custom-login-desc']}>
                <span className={Style['custom-login-line']} />
                <span className={Style['custom-login-text']}>{t('otherMethods')}</span>
                <span className={Style['custom-login-line']} />
              </div>
              <div className={Style['custom-button-group-container']}>
                {isPC() && (
                  <PasskeyLogin checkIpRestriction={checkIpRestriction} active={active} />
                )}
                <AppleLogin referralCode={referralCode} checkIpRestriction={checkIpRestriction} />
                <GoogleLogin referralCode={referralCode} checkIpRestriction={checkIpRestriction} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 登录后设置密码 */}
      <Modal
        width={440}
        wrapClassName={Style.pwdModal}
        title={t('settingPasswordTitle')}
        open={showPwdModal}
        destroyOnHidden={true}
        footer={null}
        centered
        onCancel={handleClosePwdModal}
      >
        <div className={Style.withdrawTips}>
          <div>
            <div className={Style.tipsIcon} />
          </div>
          <div className={Style.tipsText}>{t('withdrawTipsAfterSetPwd')}</div>
        </div>
        <Form
          name="pwd"
          ref={formPwdRef as any}
          initialValues={{ remember: true }}
          onFinish={handleNoPwdLoginSubmit}
        >
          {/* 设置密码 */}
          <Tooltip
            overlayClassName={Style.rulePop}
            open={showPwdPop}
            placement="bottomLeft"
            title={pwdRulesContent}
            align={{
              offset: [0, -10]
            }}
          >
            <Form.Item
              label=""
              name="pwd"
              // validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: ''
                },
                { validator: checkModalPwd }
              ]}
            >
              <Input
                // className={Style.userInp}
                placeholder={t('passwordPH')}
                autoComplete="off"
                type={showPassword ? 'text' : 'password'}
                onChange={(event) => {
                  handleCheckPwd(event.target.value);
                }}
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
          </Tooltip>

          {/* <Form.Item
            label=""
            name="pwdRepeat"
            // validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: ''
              },
              { validator: checkModalRepeatPwd }
            ]}
          >
            <div>
              <Input
                // className={Style.userInp}
                placeholder={t('passwordRepeatPH')}
                autoComplete="off"
                type={showRepeatPwd ? 'text' : 'password'}
                suffix={
                  <div
                    className={cls(Style.eyesIcon, {
                      [Style.unvisibleEyes]: !showRepeatPwd,
                      [Style.visibleEyes]: showRepeatPwd
                    })}
                    onClick={handleShowRepeatPwd}
                  />
                }
              />
            </div>
          </Form.Item> */}
          <Form.Item style={{ marginBottom: '0px' }}>
            <Button type="primary" htmlType="submit">
              {modalBtnLoading ? (
                <LoadingOutlined style={{ color: 'white' }} />
              ) : (
                t('submit')
              )}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default forwardRef(MultipleLogin);
