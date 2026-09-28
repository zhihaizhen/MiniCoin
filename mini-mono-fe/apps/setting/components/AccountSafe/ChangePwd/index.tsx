// @ts-nocheck
import React, { useState, useRef, useMemo } from 'react';
import cls from 'classnames';
import { getLang } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useFm } from '@better-bit-fe/base-hooks';
import { Form, Input, Button, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { pwdRuleList, pwdValidate } from '~/utils/validation';
import { ReactComponent as VisibleEyesIcon } from '~/public/images/accountSafe/visbileEyes.svg';
import { ReactComponent as UnvisibleEyesIcon } from '~/public/images/accountSafe/unVisbileEyes.svg';
import VerifyModalGather from '~/components/VerifyModalGather';
import type { VerifyModalGatherRef } from '~/components/VerifyModalGather';
import { postResetPwd } from '~/api';
import Style from './index.module.less';

type VerifyCodeParams = {
  email_code?: string;
  mobile_code?: string;
  '2fa_code'?: string;
  passkey_code?: string;
};

const ResetPwd = () => {
  const t = useFm();
  const formRef = useRef(null);
  const verifyRef = useRef<VerifyModalGatherRef>(null);
  const pendingPwdRef = useRef('');
  const { userInfo } = useUserInfo();
  const [pwd, setPwd] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPwd, setShowRepeatPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkPass, setCheckPass] = useState({
    pwd: false,
    repeatPwd: false
  });

  const handleCheckPwd = (val) => {
    setPwd(val);
    const isPass = pwdValidate(val);
    setCheckPass((prev) => ({
      ...prev,
      pwd: isPass
    }));
  };

  const checkPwd = () => {
    const nextPwd = formRef?.current?.getFieldValue('pwd');
    const isPass = pwdValidate(nextPwd);
    setCheckPass((prev) => ({
      ...prev,
      pwd: isPass
    }));
    return isPass ? Promise.resolve() : Promise.reject('');
  };

  const checkRepeatPwd = () => {
    const { pwd: nextPwd, pwdRepeat } = formRef?.current?.getFieldsValue();
    if (nextPwd && nextPwd === pwdRepeat) {
      setCheckPass((prev) => ({
        ...prev,
        repeatPwd: true
      }));
      return Promise.resolve();
    }
    setCheckPass((prev) => ({
      ...prev,
      repeatPwd: false
    }));
    return Promise.reject(
      pwdRepeat && nextPwd ? t('repeatPwdNotSameWithPwd') : t('passwordTips')
    );
  };

  const handleOpenVerify = async () => {
    try {
      await formRef?.current?.validateFields(['pwd', 'pwdRepeat']);
    } catch {
      return;
    }
    pendingPwdRef.current = formRef?.current?.getFieldValue('pwd') || '';
    if (!pendingPwdRef.current) return;
    verifyRef.current?.changeModalVisible(true);
  };

  const handleVerifyComplete = async (verifyData: VerifyCodeParams) => {
    const { area_code, country_code, mobile, email } = userInfo as any;
    const params: Record<string, string> = {
      type: 'email',
      password: pendingPwdRef.current
    };
    if (email) params.email = email;
    if (verifyData?.email_code) params.email_code = verifyData.email_code;
    if (verifyData?.mobile_code) {
      params.mobile_code = verifyData.mobile_code;
      if (area_code) params.area_code = area_code;
      if (country_code) params.country_code = country_code;
      if (mobile) params.mobile = mobile;
    }
    if (verifyData?.['2fa_code']) params.gfa_code = verifyData['2fa_code'];
    if (verifyData?.passkey_code) params.passkey_code = verifyData.passkey_code;

    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    setLoading(true);
    try {
      await postResetPwd(params);
      message.success(t('changePwdSuccess'));
      const lang = getLang();
      window.location.href = `/${lang}/account/login`;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const handleGoUserCenter = () => {
    const lang = getLang();
    window.location.href = `/${lang}/setting/dashboard`;
  };
  const handleGoPre = () => {
    const lang = getLang();
    window.location.href = `/${lang}/setting/account-safe`;
  };

  const handleShowPassword = () => {
    setShowPassword((pre) => !pre);
  };

  const handleShowRepeatPwd = () => {
    setShowRepeatPwd((pre) => !pre);
  };

  const pwdRulesContent = useMemo(() => {
    return pwdRuleList.map((it) => {
      const { checkRule, msg } = it;
      const isOk = checkRule(pwd);
      return (
        <div key={msg} className={Style.pwdRuleItem}>
          <div
            className={cls(Style.checkIcon, {
              [Style.checkOKIcon]: isOk,
              [Style.unCheckIcon]: !isOk
            })}
          />
          {t(msg)}
        </div>
      );
    });
  }, [pwd, t]);

  const btnDisabled = !checkPass.pwd || !checkPass.repeatPwd;

  return (
    <div className={Style['changePwd']}>
      <div className={Style.titleContainer}>
        <div className={Style.title0} onClick={handleGoUserCenter}>
          {t('user-center')} /{' '}
        </div>
        <div className={Style.title1} onClick={handleGoPre}>
          {t('accountSecurity')} /{' '}
        </div>
        <div className={Style.title2}> {t('changeLoginPassword')}</div>
      </div>
      <h1 className={Style.formTitle}>{t('changeLoginPassword')}</h1>
      <Form
        name="changePassword"
        requiredMark={false}
        colon={false}
        ref={formRef as any}
        style={{ maxWidth: 456, margin: '24px 0' }}
        initialValues={{ remember: true }}
      >
        <Form.Item
          className={Style.pwdFormItem}
          label={t('enterNewPassword')}
          name="pwd"
          rules={[
            {
              required: true,
              message: ''
            },
            { validator: checkPwd }
          ]}
        >
          <Input
            className="h-12! bg-fill-input! global-input-style"
            size="large"
            placeholder={t('plsEnter')}
            autoComplete="off"
            type={showPassword ? 'text' : 'password'}
            onChange={(event) => {
              handleCheckPwd(event.target.value);
            }}
            suffix={
              showPassword ? (
                <VisibleEyesIcon
                  className={Style.eyesIcon}
                  onClick={handleShowPassword}
                />
              ) : (
                <UnvisibleEyesIcon
                  className={Style.eyesIcon}
                  onClick={handleShowPassword}
                />
              )
            }
          />
        </Form.Item>
        <div className={Style.pwdRules}>{pwdRulesContent}</div>

        <Form.Item
          label={t('confirmNewPwd')}
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
            className="h-12! bg-fill-input! global-input-style"
            size="large"
            placeholder={t('plsEnter')}
            autoComplete="off"
            type={showRepeatPwd ? 'text' : 'password'}
            suffix={
              showRepeatPwd ? (
                <VisibleEyesIcon
                  className={Style.eyesIcon}
                  onClick={handleShowRepeatPwd}
                />
              ) : (
                <UnvisibleEyesIcon
                  className={Style.eyesIcon}
                  onClick={handleShowRepeatPwd}
                />
              )
            }
          />
        </Form.Item>

        <Form.Item style={{ marginTop: '35px' }}>
          <Button
            className={Style.nextBtn}
            type="primary"
            onClick={handleOpenVerify}
            disabled={btnDisabled}
          >
            {loading ? (
              <LoadingOutlined style={{ color: 'white' }} />
            ) : (
              t('confirm')
            )}
          </Button>
        </Form.Item>
      </Form>
      <VerifyModalGather
        ref={verifyRef}
        scene="reset_password"
        onVerifyComplete={handleVerifyComplete}
      />
    </div>
  );
};

export default ResetPwd;
