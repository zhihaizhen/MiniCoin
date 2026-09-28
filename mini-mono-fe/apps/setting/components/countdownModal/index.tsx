//@ts-nocheck
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useRouter } from 'next/router';
import { Button, Modal, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import useCountDown from '~/hooks/useCountDown';
import { useUserInfo } from '@better-bit-fe/base-provider';
import {
  postEmailCodeSend,
  postEmailCodeVerify,
  postUnbind2fa,
  postPhoneCodeSend,
  postMobileCodeVerify
} from '~/api';
import { useCaptcha } from '~/hooks/useCaptcha';
import { EmailCodeType } from '~/constant';
import Style from './index.module.less';

export interface ICountdownProps {
  onFinish: () => void;
}

const digit = 6;
function Countdown(props: ICountdownProps, ref: any) {
  const { onFinish } = props;
  const { locale } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [captchaInfo, setcaptchaInfo] = useState();
  const [isUnbind, setisUnbind] = useState<boolean>(false);
  const [codeInput, setcodeInput] = useState<string>('');
  const [code, setcode] = useState<Array<number | string>>(
    Array(digit).fill('')
  );
  const [currentIndex, setcurrentIndex] = useState(0);
  const t = useFm();
  const { countdown, isResendDisabled, resendTimeInterver, clearTimeInterver } =
    useCountDown();
  const captcha = useCaptcha();
  const { updateUserInfo, userInfo } = useUserInfo();

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
  async function sendCode(_captchaInfo, _isUnbind?: boolean) {
    if (userInfo?.vague_email) {
      await postEmailCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        // email_type: _isUnbind
        //   ? EmailCodeType.unbind_2fa
        //   : EmailCodeType.bind_2fa,
        email_type: EmailCodeType.bind_opt_scenes,
        lang: locale
      });
    } else if (userInfo?.vague_mobile) {
      await postPhoneCodeSend({
        captcha_type: 'geetest',
        geetest_challenge: _captchaInfo?.geetest_challenge,
        geetest_validate: _captchaInfo?.geetest_validate,
        geetest_seccode: _captchaInfo?.geetest_seccode,
        code_type: EmailCodeType.bind_opt_scenes,
        area_code: userInfo?.area_code,
        mobile: userInfo?.mobile
      });
    }
  }

  // 点击重新发送验证码
  async function showCaptcha(param: { isUnbind: boolean }) {
    // 解决，在解绑时候点击发送验证码重新变成为绑定状态的问题
    const curIsUnbind = param?.isUnbind || isUnbind;
    if (curIsUnbind) {
      setisUnbind(true);
    } else {
      setisUnbind(false);
    }
    try {
      const _captchaInfo = await captcha.showCaptcha();
      setcaptchaInfo(_captchaInfo);
      await sendCode(_captchaInfo, curIsUnbind);

      setIsModalOpen(true);
      resendTimeInterver();
    } catch (e) {
      setcaptchaInfo({});
      console.log('_captchaInfo error', e)
      throw e;
    }
  }

  async function verify(type?: 'email' | 'mobile') {
    //1. verify email
    //2. go setting 2fa modal
    if (type === 'mobile') {
      try {
        await postMobileCodeVerify({
          country_code: userInfo?.country_code,
          area_code: userInfo?.area_code,
          mobile: userInfo?.mobile,
          mobile_code: code?.join(''),
          code_type: 'bind_opt_scenes'
        });
        setIsModalOpen(false);
        onFinish();
      } catch (error) {
        message.error(t(error.code));
      }
    } else {
      try {
        await postEmailCodeVerify({
          // email_type: 1,
          email_type: 3,
          email_code: code?.join('')
        });
        setIsModalOpen(false);
        onFinish();
      } catch (error) {
        message.error(t(error.code));
      }
    }
  }

  function handleFocus(index: number) {
    // const value = code[index];
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

  async function handleConfirm() {
    if (code.length === digit && codeInput !== '') {
      try {
        if (isUnbind) {
          const params = userInfo?.vague_email
            ? {
              email_code: code?.join(''),
              code: codeInput,
              code_type: EmailCodeType.bind_opt_scenes
            }
            : {
              mobile_code: code?.join(''),
              code: codeInput,
              code_type: EmailCodeType.bind_opt_scenes
            };
          await postUnbind2fa({ ...params });
          await updateUserInfo();
        } else {
          await onFinish();
        }
        handleCancel();
      } catch (error) {
        message.error(t(error.code));
      }
    } else {
      return;
    }
  }

  function handleInpChange(Event) {
    setcodeInput(Event.target.value);
  }

  function handleCancel() {
    setIsModalOpen(false);
    setcodeInput('');
    setcode(Array(digit).fill(''));
    setcurrentIndex(0);
    setisUnbind(false);
  }

  useEffect(() => {
    if (code.indexOf('') === -1 && !isUnbind) {
      // all code has typied
      if (userInfo?.vague_email) {
        verify();
        return;
      } else if (userInfo?.vague_mobile) {
        verify('mobile');
        return;
      }
    }
  }, [code]);

  useEffect(() => {
    if (isModalOpen) {
      setcode(Array(digit).fill(''));
      resendTimeInterver();
    }
    return () => {
      clearTimeInterver();
    };
  }, [isModalOpen]);

  useImperativeHandle(ref, () => ({
    changeModalVisible: (visible: boolean) => {
      setIsModalOpen(visible);
    },
    showCaptcha
  }));
  return (
    <div>
      <Modal
        width={424}
        title={isUnbind ? t('unbindModal-title') : t('setup2FAModal-title')}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className={Style.countdownModal}
      >
        <p className={Style.desc}>
          {t('setup2FAModal-desc').replace(
            '{value}',
            userInfo?.vague_email || userInfo?.vague_mobile
          )}
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
        <div className={Style.resend}>
          <span>{countdown}</span>
          <button
            disabled={isResendDisabled}
            className={Style.btn}
            onClick={showCaptcha}
          >
            {t('setup2FAModal-resend')}
          </button>
        </div>
        {isUnbind ? (
          <div>
            <div className={Style['inp-title']}>
              {t('unbindModal-desc').replace('{value}', userInfo?.vague_email)}
            </div>
            <Input
              className={Style.inp}
              placeholder={t('google2FA-inp')}
              value={codeInput}
              onChange={handleInpChange}
            />
            <Button type="primary" onClick={handleConfirm}>
              {t('confirmBtn')}
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default forwardRef(Countdown);
