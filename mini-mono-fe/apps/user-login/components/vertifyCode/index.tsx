//@ts-nocheck
import React, { useState, useEffect, forwardRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Button, Modal, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import useCountDown from '~/hooks/useCountDown';
import { VagueMobile, emailShow } from '~/utils/validation';
import { postEmailCodeSend, postCodeSend } from '~/api';
import { useCaptcha } from '~/hooks/useCaptcha';
import { EmailCodeType } from '~/constants';
import Style from './index.module.less';
import { useCurCaptcha } from '~/context/captchaContext';

export interface IVertifyCodeProps {
  handleRegister: () => void;
  account: string;
  type: string;
}

const digit = 6;
function VertifyCode(props: IVertifyCodeProps, ref: any) {
  const { handleRegister, account, type, areaCode } = props;
  const { locale } = useRouter();
  const [captchaInfo, setcaptchaInfo] = useState();
  const [code, setcode] = useState<Array<number | string>>(
    Array(digit).fill('')
  );
  const [currentIndex, setcurrentIndex] = useState(0);
  const t = useFm();
  const { countdown, isResendDisabled, resendTimeInterver, clearTimeInterver } =
    useCountDown();
  const captcha = useCurCaptcha();

  const handleChange = (index: number, Event) => {
    if (currentIndex >= digit) return;
    const newCode = [...code];
    const newVal = Event.target.value;
    newCode[currentIndex] = newVal.length ? newVal[newVal.length - 1] : '';
    const newindex = newVal !== '' ? (currentIndex % 6) + 1 : currentIndex % 6;
    setcurrentIndex(newindex);
    focus(newindex);
    setcode(newCode);
  };

  function focus(index) {
    const elemFocus = document.getElementsByClassName(
      Style['verification-input-wrapper-box']
    )[index] as HTMLElement;
    if (elemFocus && elemFocus?.focus) {
      elemFocus.focus();
    }
  }

  function handlePaste(ev: ClipboardEvent) {
    const e = ev as ClipboardEvent & {
      originalEvent: { clipboardData: DataTransfer };
    };
    e.preventDefault();
    let data = null;
    let clipboardData = e.clipboardData;
    if (!clipboardData) {
      clipboardData = e?.originalEvent.clipboardData;
    }
    data = clipboardData.getData('Text');
    data = data.replace(/\D/g, '');
    data = data.substring(0, digit);
    // setcurrentIndex(0);
    let dataIndex = 0;
    const newCode = Array(digit).fill('');
    for (let i = 0; i < digit; i += 1) {
      const value = data[dataIndex];
      if (value !== null && value !== undefined) {
        newCode[dataIndex] = value;
      }
      dataIndex += 1;
    }
    if (dataIndex <= digit) {
      setcurrentIndex(dataIndex - 1);
      focus(dataIndex - 1);
    }
    setcode(newCode);
  }

  // 点击重新发送验证码
  async function handleCaptcha() {
    try {
      const _captchaInfo = await captcha.showCaptcha();
      await sendCode(_captchaInfo);
      resendTimeInterver();
    } catch (e) {
      setcaptchaInfo({});
      throw e;
    }
  }

  //  注册时候发送验证码
  async function sendCode(_captchaInfo) {
    // console.log('发送验证码2', account, type, areaCode);
    if (type === 'email') {
      await postEmailCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        email_type: EmailCodeType.login_code,
        email: account,
        lang: locale
      });
    } else {
      await postCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        code_type: 'login_mobile',
        area_code: areaCode,
        mobile: account
      });
    }
  }

  // 提交注册
  const handleNext = () => {
    handleRegister(code);
  };

  function handleFocus(index: number) {
    setcurrentIndex(index);
    focus(index);
  }

  function handleDelete(index: number, Event) {
    if (Event?.keyCode === 8) {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setcode(newCode);
        setcurrentIndex(index);
        setTimeout(() => {
          focus(index);
        }, 0);
      } else {
        focus(index - 1);
        setcurrentIndex(index - 1);
      }
    }
  }

  // useEffect(() => {
  //   if (code.indexOf('') === -1) {
  //   }
  // }, [code]);

  // 初始化就开始倒计时
  useEffect(() => {
    resendTimeInterver();
  }, []);

  useEffect(() => {
    return () => {
      clearTimeInterver();
    };
  }, []);

  const showAccount = useMemo(() => {
    return type === 'email' ? emailShow(account) : VagueMobile(account); //打码
  }, [account, type]);

  const nextBtnDisable = useMemo(() => {
    const hascode = code.filter((it) => it || it === 0);
    return hascode.length !== digit;
  }, [code]);

  return (
    <div className={Style.vertifyPart}>
      <p className={Style.title}>{t('phoneCodeInpMsg')}</p>
      <p className={Style.desc}>
        {t('vertifyCodeHasResend', { value: showAccount })}
      </p>
      <div className={Style['verification-input']}>
        {code.map((item, index) => (
          <div className={Style['verification-input-wrapper']} key={index}>
            <input
              className={Style['verification-input-wrapper-box']}
              type="number"
              title="code"
              maxLength="1"
              value={item}
              onChange={(Event) => handleChange(index, Event)}
              onFocus={() => handleFocus(index)}
              autoFocus={index === currentIndex}
              onPaste={handlePaste}
              onKeyDown={(Event) => handleDelete(index, Event)}
            />
          </div>
        ))}
      </div>
      <div className={Style.resendRowFlex}>
        <div>
          {countdown !== '00:00' && <span>{countdown}</span>}
          <button
            disabled={isResendDisabled}
            className={Style.btn}
            onClick={handleCaptcha}
          >
            {t('sendCode-btn')}
          </button>
        </div>
      </div>

      <Button type="primary" onClick={handleNext} disabled={nextBtnDisable}>
        {t('next')}
      </Button>
    </div>
  );
}

export default forwardRef(VertifyCode);
