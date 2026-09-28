// @ts-nocheck
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { isMobile, getLang } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { Tabs, Form, Input, Select, Button, Tooltip, message } from 'antd';
import ReactCountryFlag from 'react-country-flag';
import { LoadingOutlined } from '@ant-design/icons';

import { emailValidate, pwdRuleList, pwdValidate } from '~/utils/validation';
import { EmailCodeType } from '~/constants';
import useCountDown from '~/hooks/useCountDown';
import { useCurCaptcha } from '~/context/captchaContext';
import {
  postCodeSend,
  postEmailCodeSend,
  postUserCertifications,
  postResetPwd,
  postResetVertifyCode,
  postResetVertifyCodeMulti,
  getCountryList,
  getCurrentCountryCode
} from '~/api';
import Style from './index.module.less';

const vertifyDefaultError = {
  email: false,
  phone: false,
  gfa: false,
  leftTimes: ''
};
const ResetPwd = () => {
  const t = useFm();
  const lang = getLang();
  const formRef = useRef(null);
  const captcha = useCurCaptcha();
  const { countdown, isResendDisabled, resendTimeInterver, clearTimeInterver } =
    useCountDown();
  const {
    countdown: phoneCountdown,
    isResendDisabled: phoneIsResendDisabled,
    resendTimeInterver: phoneResendTimeInterver,
    clearTimeInterver: phoneClearTimeInterver
  } = useCountDown(); //以上是step1

  const {
    countdown: countdown2,
    isResendDisabled: isResendDisabled2,
    resendTimeInterver: resendTimeInterver2,
    clearTimeInterver: clearTimeInterver2
  } = useCountDown();

  const {
    countdown: phoneCountdown2,
    isResendDisabled: phoneIsResendDisabled2,
    resendTimeInterver: phoneResendTimeInterver2,
    clearTimeInterver: phoneClearTimeInterver2
  } = useCountDown();

  const { locale } = useRouter();
  const [step, setStep] = useState(1);
  const [vertifyErrorInfo, setVertifyErrorInfo] = useState(vertifyDefaultError); // 验证码错误的信息
  const [pwd, setPwd] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPwd, setShowRepeatPwd] = useState(false);
  const [tabValue, setTabValue] = useState('email');
  const [resetToken, setResetToken] = useState();

  const [isSend, setIsSend] = useState({
    email: false,
    phone: false
  }); // 是否已发送验证码
  const [hiddleInfo, setHiddleInfo] = useState({
    email: '',
    phone: ''
  }); // 打码后的用户信息
  const [bind2fa, setBind2fa] = useState({
    email: false,
    phone: false,
    gfa: false
  });
  const [captchaInfo, setcaptchaInfo] = useState({});
  const [countryCodeList, setcountryCodeList] = useState([]);
  const [currentCodeInfo, setcurrentCodeInfo] = useState({
    area_code: '86',
    country: 'CN'
  });
  const [step1Loading, setStep1Loading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwdPop, setShowPwdPop] = useState(false);
  const [checkPass, setCheckPass] = useState({
    email: false,
    mobile: false,
    pwd: false,
    repeatPwd: false
  });

  {
    /* 验证类方法 */
  }
  const handleCheckPwd = (val) => {
    setShowPwdPop(true);
    setPwd(val);
    return Promise.resolve();
  };

  const checkValuePass = (v, type) => {
    setCheckPass({
      ...checkPass,
      [type]: v
    });
  };

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
    if (!formData.mobile) {
      setCheckPass({
        ...checkPass,
        mobile: false
      });
      return Promise.reject(t('mobileInpMsg'));
    }
    setCheckPass({
      ...checkPass,
      mobile: true
    });
    return Promise.resolve();
  };

  const checkPwd = () => {
    const pwd = formRef?.current?.getFieldValue('pwd');
    const isPass = pwdValidate(pwd);
    setCheckPass({
      ...checkPass,
      pwd: isPass
    });
    return isPass
      ? Promise.resolve()
      : Promise.reject(pwd ? t('pwdNotMatchRule') : t('passwordTips'));
  };

  const checkRepeatPwd = () => {
    const { pwd, pwdRepeat } = formRef?.current?.getFieldsValue();
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

  const getParams = () => {
    const formData = formRef?.current?.getFieldsValue();
    const { email, mobile, prefix, email_code, mobile_code, gfa_code, pwd } =
      formData;
    let params = {
      gfa_code: checkPass?.gfa_code || gfa_code, // formData更新不及时
      mobile_code: checkPass?.mobile_code || mobile_code,
      email_code: checkPass?.email_code || email_code,
      password: pwd,
      reset_token: resetToken
    };
    // console.log(2222, formData);
    // tabValue是邮箱的话
    if (tabValue === 'email') {
      params = {
        ...params,
        type: 'email',
        email
      } as any;
    } else {
      params = {
        ...params,
        type: 'phone',
        country_code: currentCodeInfo?.country,
        area_code: prefix,
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

  const handleResetPwdSubmit = async (values: any) => {
    setLoading(true);
    const params = getParams();
    // console.log('33333', params);
    try {
      await postResetPwd(params);
      setLoading(false);
      message.success(t('changePwdSuccess'));
      window.location.href = `/${lang}/account/login${window.location.search}`;
    } catch (error) {
      console.log(error, '重置密码接口error');
      const { left_times } = error?.response?.data?.data || {};
      const vertifyCodeError = [20007009, 20007004, 20005001]; //邮箱，手机，ga
      const idx = vertifyCodeError.findIndex((it) => it === error?.code);
      if (idx > -1) {
        let newInfo = {};
        switch (idx) {
          case 0:
            newInfo = {
              email: true
            };
            break;
          case 1:
            newInfo = {
              phone: true
            };
            break;
          default:
            newInfo = {
              gfa: true
            };
            break;
        }
        setVertifyErrorInfo({
          ...vertifyDefaultError,
          ...newInfo,
          leftTimes: left_times || -1
        });
      } else {
        setVertifyErrorInfo(vertifyDefaultError);
      }
      setLoading(false);
    }
  };

  const hanldeTabChange = (val) => {
    setTabValue(val);
    if (val === 'mobile') {
      getCurrentIpDetail();
    }
  };

  const handleGoLogin = () => {
    window.location.href = `/${lang}/account/login`;
  };

  // 重置数据
  const handleGoStep1 = () => {
    setStep(1);
    formRef?.current?.setFieldsValue({
      email_code: '',
      mobile_code: '',
      gfa_code: '',
      pwdRepeat: '',
      pwd: ''
    });
    setIsSend({
      phone: false,
      email: false
    });
    setVertifyErrorInfo(vertifyDefaultError);
    //
    clearTimeInterver();
    phoneClearTimeInterver();
    clearTimeInterver2();
    phoneClearTimeInterver2();
  };

  // 获取用户绑定情况
  const handleGoStep2 = async () => {
    setStep1Loading(true);
    const isEmail = tabValue === 'email';
    const formData = formRef?.current?.getFieldsValue();
    const { email, mobile, prefix } = formData;
    // TODO 需要去除空格吗》？
    let params = {
      type: 'email',
      verify_code: checkPass.email_code_step1,
      email
    };
    if (!isEmail) {
      params = {
        type: 'phone',
        country_code: currentCodeInfo?.country,
        area_code: prefix,
        verify_code: checkPass.mobile_code_step1,
        mobile
      } as any;
    }
    try {
      const res = await postUserCertifications(params);
      const {
        is_bind_gfa,
        is_bind_mobile,
        is_bind_email,
        vague_email,
        vague_mobile,
        reset_token
      } = res;
      setBind2fa({
        email: is_bind_email,
        phone: is_bind_mobile,
        gfa: is_bind_gfa
      });
      setResetToken(reset_token);

      setHiddleInfo({
        email: vague_email,
        phone: vague_mobile
      });
      setStep1Loading(false);
      setStep(2);
    } catch (error) {
      console.log(error, '验证接口error');
      const { left_times } = error?.response?.data?.data || {};
      // 邮箱验证码错误
      if (tabValue == 'email' && error?.code == 20007009) {
        setVertifyErrorInfo({
          ...vertifyDefaultError,
          email: true,
          leftTimes: left_times || -1
        });
      } else if (tabValue == 'mobile' && error?.code == 20007004) {
        setVertifyErrorInfo({
          ...vertifyDefaultError,
          phone: true,
          leftTimes: left_times || -1
        });
      } else {
        setVertifyErrorInfo(vertifyDefaultError);
      }

      if (error?.code === 20012022 || error?.code === 20012021) {
        window.location.href = `/${lang}/account/register${window.location.search}`;
      }
      setStep1Loading(false);
    }
  };

  const changeCountry = (v) => {
    const selectCountry = countryCodeList.find((item) => item?.area_code === v);
    setcurrentCodeInfo({ ...selectCountry, country: selectCountry.code });
  };

  const mapOptionList = (list) => {
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
  };

  const handleShowPassword = () => {
    setShowPassword((pre) => !pre);
  };

  const handleShowRepeatPwd = () => {
    setShowRepeatPwd((pre) => !pre);
  };

  {
    /* 接口类方法 */
  }
  // 获取国家相关
  const getCurrentIpDetail = async () => {
    const countryList = await getCountryList();
    setcountryCodeList(countryList);
    const currentCode = await getCurrentCountryCode();
    setcurrentCodeInfo(currentCode);
    formRef?.current?.setFieldValue('prefix', currentCode?.area_code);
  };

  // 极验
  const handleCaptcha = async (type) => {
    if (step === 1) {
      if (type === 'email' && isResendDisabled) return;
      if (type == 'mobile' && phoneIsResendDisabled) return;
    } else {
      if (type === 'email' && isResendDisabled2) return;
      if (type == 'mobile' && phoneIsResendDisabled2) return;
    }

    // console.log('极验-type-step', type, step);
    try {
      const _captchaInfo = await captcha.showCaptcha();
      hanldeSendCode(_captchaInfo, type);
    } catch (e) {
      setcaptchaInfo({});
      throw e;
    }
  };

  const sendMatchCode = async (params, formData) => {
    const { email, mobile, prefix } = formData;
    if (tabValue === 'email') {
      await postEmailCodeSend({
        ...params,
        email_type: EmailCodeType.reset_email,
        email,
        lang: locale
      });
      //  验证码发送成功再倒计时

      step === 1 ? resendTimeInterver() : resendTimeInterver2();
      if (step === 2) {
        setIsSend({
          ...isSend,
          email: true
        });
      }
    } else {
      await postCodeSend({
        ...params,
        code_type: 'reset_pwd_sms',
        mobile,
        country_code: currentCodeInfo?.country,
        area_code: prefix
      });
      step === 1 ? phoneResendTimeInterver() : phoneResendTimeInterver2();
      if (step === 2) {
        setIsSend({
          ...isSend,
          phone: true
        });
      }
    }
  };

  // 邮箱发手机号的验证码
  const sendNotMatchCode = async (params, formData) => {
    const { email, mobile, prefix } = formData;
    if (tabValue === 'email') {
      await postResetVertifyCodeMulti({
        ...params,
        type: 'email',
        email,
        code_type: 'reset_password',
        lang: locale
      });
      // 这里要反一下的哈
      step === 1 ? phoneResendTimeInterver() : phoneResendTimeInterver2();
      if (step === 2) {
        setIsSend({
          ...isSend,
          mobile: true
        });
      }
    } else {
      const newParams = {
        ...params,
        type: 'phone',
        code_type: 'reset_password',
        country_code: currentCodeInfo?.country,
        area_code: prefix,
        mobile
      };
      await postResetVertifyCodeMulti(newParams);
      step === 1 ? resendTimeInterver() : resendTimeInterver2();
      if (step === 2) {
        setIsSend({
          ...isSend,
          email: true
        });
      }
    }
  };

  // 发送验证码
  const hanldeSendCode = async (_captchaInfo, type) => {
    const formData = formRef?.current?.getFieldsValue();
    const { geetest_challenge, geetest_validate, geetest_seccode } =
      _captchaInfo || captchaInfo;
    const params = {
      captcha_type: 'geetest',
      geetest_challenge,
      geetest_validate,
      geetest_seccode
    };

    const isMatch =
      (tabValue === 'email' && type === 'email') ||
      (tabValue === 'mobile' && type === 'mobile');
    if (isMatch) {
      sendMatchCode(params, formData);
    } else {
      sendNotMatchCode(params, formData);
    }
  };

  const errorText = useMemo(() => {
    const { leftTimes } = vertifyErrorInfo;
    let text;
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
  }, [vertifyErrorInfo.leftTimes]);

  // 手机号prefix
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

  const items = [
    {
      key: 'email',
      label: t('signUp-emailTab'),
      children: (
        <>
          <Form.Item
            label=""
            name="email"
            // validateTrigger="onBlur"
            rules={[
              { required: true, message: ' ' },
              { validator: checkEmail }
            ]}
          >
            <Input placeholder={t('email-address')} />
          </Form.Item>

          <Form.Item
            label=""
            name="email_code_step1"
            rules={[
              {
                required: true,
                message: t('phoneCodeInpMsg')
              }
            ]}
            validateStatus={vertifyErrorInfo.email && errorText ? 'error' : ''}
            help={vertifyErrorInfo.email && errorText}
          >
            <Input
              className={Style.userInp}
              placeholder={t('plsEnter')}
              autoComplete="off"
              onChange={(event) => {
                checkValuePass(event.target.value, 'email_code_step1');
              }}
              suffix={
                <div
                  className={Style.sentCodeBtn}
                  onClick={() => handleCaptcha('email')}
                >
                  {isResendDisabled ? countdown + ' s' : t('sendCode-btn')}
                </div>
              }
            />
          </Form.Item>
        </>
      )
    },
    {
      key: 'mobile',
      label: t('signUp-mobileTab'),
      children: (
        <>
          <Form.Item
            name="mobile"
            // validateTrigger="onBlur"
            label=""
            rules={[
              { required: true, message: ' ' },
              { validator: checkPhoneNumber }
            ]}
            validateStatus={vertifyErrorInfo.phone && errorText ? 'error' : ''}
            help={vertifyErrorInfo.phone && errorText && errorText}
          >
            <Input
              addonBefore={prefixSelector}
              className={Style.addonInp}
              placeholder={t('mobile-placeholder')}
            />
          </Form.Item>

          <Form.Item
            label=""
            name="mobile_code_step1"
            rules={[
              {
                required: true,
                message: t('phoneCodeInpMsg')
              }
            ]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('plsEnter')}
              autoComplete="off"
              onChange={(event) => {
                checkValuePass(event.target.value, 'mobile_code_step1');
              }}
              suffix={
                <div
                  className={Style.sentCodeBtn}
                  onClick={() => handleCaptcha('mobile')}
                >
                  {phoneIsResendDisabled
                    ? phoneCountdown + ' s'
                    : t('sendCode-btn')}
                </div>
              }
            />
          </Form.Item>
        </>
      )
    }
  ];

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

  const step1BtnDisabled = useMemo(() => {
    let isPass = true;
    if (tabValue === 'email') {
      isPass = checkPass.email && checkPass.email_code_step1;
    } else {
      isPass = checkPass.mobile && checkPass.mobile_code_step1;
    }
    return !isPass;
  }, [checkPass, tabValue]);

  const showEmail = useMemo(() => {
    return bind2fa.email && tabValue === 'mobile';
  }, [bind2fa, tabValue]);

  const showPhone = useMemo(() => {
    return bind2fa.phone && tabValue === 'email' && !bind2fa.gfa;
  }, [bind2fa, tabValue]);

  const showGa = useMemo(() => {
    return tabValue === 'email' && bind2fa.gfa;
  }, [bind2fa, tabValue]);

  const step2BtnDisabled = useMemo(() => {
    const { pwd, repeatPwd, email_code, mobile_code, gfa_code } = checkPass;
    let pass = pwd && repeatPwd;

    if (showEmail) {
      pass = pass && email_code;
    }

    if (showPhone) {
      pass = pass && mobile_code;
    }
    if (showGa) {
      pass = pass && gfa_code;
    }
    return !pass;
  }, [checkPass]);

  useEffect(() => {
    return () => {
      clearTimeInterver();
      phoneClearTimeInterver();
      clearTimeInterver2();
      phoneClearTimeInterver2();
    };
  }, []);

  return (
    <div className={Style['right-part']}>
      {step === 1 && (
        <div className={Style.titleContainer} onClick={handleGoLogin}>
          <div className={Style['backIcon']} />
          <div className={Style.title}>{t('resetPassword')}</div>
        </div>
      )}
      {step === 2 && (
        <div className={Style.titleContainer} onClick={handleGoStep1}>
          <div className={Style['backIcon']} />
          <span className={Style.title}>{t('changePwd')}</span>
        </div>
      )}
      <Form
        name="resetPassword"
        colon={false}
        requiredMark={false}
        ref={formRef as any}
        style={{ maxWidth: 600, margin: '32px 0' }}
        initialValues={{ remember: true }}
      >
        <div className={Style.withdrawTips}>
          <div className={Style.tipsIcon} />
          <div className={Style.tipsText}>{t('withdrawTipsAfterReset')}</div>
        </div>

        <div className={step === 2 && Style.disVisible}>
          <Tabs
            defaultActiveKey="email"
            items={items}
            onChange={hanldeTabChange}
          />
          <Form.Item style={{ marginTop: '8px' }}>
            <Button
              className={Style.nextBtn}
              type="primary"
              disabled={step1BtnDisabled}
              onClick={handleGoStep2}
            >
              {step1Loading ? (
                <LoadingOutlined style={{ color: 'white' }} />
              ) : (
                t('next')
              )}
            </Button>
          </Form.Item>
        </div>

        {step === 2 && (
          <div>
            {/* 输入新密码 */}
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
                label={t('enterNewPassword')}
                name="pwd"
                // validateTrigger="onBlur"
                rules={[
                  {
                    required: true,
                    message: ''
                  },
                  { validator: checkPwd }
                ]}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('plsEnter')}
                  autoComplete="off"
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
            {/* 再次输入密码 */}
            <Form.Item
              label={t('confirmNewPwd')}
              name="pwdRepeat"
              // validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: ''
                },
                { validator: checkRepeatPwd }
              ]}
            >
              <Input
                className={Style.userInp}
                placeholder={t('plsEnter')}
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
            {/* 2FA验证= 邮箱 + (GA + 手机号)，即 GA和手机号二选一或者都有*/}
            {/* 规则，邮箱>GA>手机号 */}
            {/* 当用户邮箱，手机号，GA都有。用户输入邮箱 =邮箱 + GA,用户输入手机号 =邮箱 + 手机号*/}

            {/* 邮箱验证*/}
            {showEmail && (
              <Form.Item
                label={
                  isSend.email
                    ? t('vertifyCodeHasResend', { value: hiddleInfo.email })
                    : t('emailVertify')
                }
                name="email_code"
                // validateTrigger="onBlur"
                rules={[
                  {
                    required: true,
                    message: t('phoneCodeInpMsg')
                  }
                ]}
                validateStatus={
                  vertifyErrorInfo.email && errorText ? 'error' : ''
                }
                help={vertifyErrorInfo.email && errorText}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('plsEnter')}
                  autoComplete="off"
                  onChange={(event) => {
                    checkValuePass(event.target.value, 'email_code');
                  }}
                  suffix={
                    <div
                      className={Style.sentCodeBtn}
                      onClick={() => handleCaptcha('email')}
                    // disabled={type === 'email' ? !emailCheckPass : !mobileCheckPass}
                    >
                      {isResendDisabled2
                        ? countdown2 + ' s'
                        : t('sendCode-btn')}
                    </div>
                  }
                />
              </Form.Item>
            )}

            {/* 手机号验证 */}
            {showPhone && (
              <Form.Item
                label={
                  isSend.phone
                    ? t('vertifyCodeHasResend', { value: hiddleInfo.phone })
                    : t('mobileVertify')
                }
                name="mobile_code"
                // validateTrigger="onBlur"
                rules={[
                  {
                    required: true,
                    message: t('phoneCodeInpMsg')
                  }
                ]}
                validateStatus={
                  vertifyErrorInfo.phone && errorText ? 'error' : ''
                }
                help={vertifyErrorInfo.phone && errorText}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('plsEnter')}
                  autoComplete="off"
                  onChange={(event) => {
                    checkValuePass(event.target.value, 'mobile_code');
                  }}
                  suffix={
                    <div
                      className={Style.sentCodeBtn}
                      onClick={() => handleCaptcha('mobile')}
                    >
                      {phoneIsResendDisabled2
                        ? phoneCountdown2 + ' s'
                        : t('sendCode-btn')}
                    </div>
                  }
                />
              </Form.Item>
            )}

            {/* GA的验证 */}
            {showGa && (
              <Form.Item
                label={t('2faVertify')}
                name="gfa_code"
                rules={[
                  {
                    required: true,
                    message: t('2faTips')
                  }
                ]}
                validateStatus={
                  vertifyErrorInfo.gfa && errorText ? 'error' : ''
                }
                help={vertifyErrorInfo.gfa && errorText}
              >
                <Input
                  className={Style.userInp}
                  placeholder={t('plsEnter')}
                  autoComplete="off"
                  onChange={(event) => {
                    checkValuePass(event.target.value, 'gfa_code');
                  }}
                />
              </Form.Item>
            )}

            <Form.Item style={{ marginTop: '35px' }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={handleResetPwdSubmit}
                disabled={step2BtnDisabled}
              >
                {loading ? (
                  <LoadingOutlined style={{ color: 'white' }} />
                ) : (
                  t('next')
                )}
              </Button>
            </Form.Item>
          </div>
        )}
      </Form>
    </div>
  );
};

export default ResetPwd;
