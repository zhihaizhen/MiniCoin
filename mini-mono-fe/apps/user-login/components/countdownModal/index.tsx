//@ts-nocheck
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo
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
  postMobileCodeVerify,
  postPwdAuthCodeSend
} from '~/api';
import { useCaptcha } from '~/hooks/useCaptcha';
import { EmailCodeType } from '~/constants';
import Style from './index.module.less';
import classNames from 'classnames';
import { useCurCaptcha } from '~/context/captchaContext';
import { pasteFromClipboard } from '~/utils/paste-from-clipboard';
import { getLang } from '@better-bit-fe/base-utils';

export interface ICountdownProps {
  onFinish: () => void;
  cancelLoading?: () => void;
  Step2PwdLeftTimes?: number | undefined;
  pwdErrorModalText?: any;
}

type curParamsType = {
  type: 'email' | 'mobile';
  next: 1 | 2 | 3;
  password: string; //密码，加密串
  email?: string; //邮箱注册必填
  //以下是手机号登陆使用字段
  country_code?: string;
  area_code?: string;
  mobile?: string;
};

const digit = 6;
function Countdown(props: ICountdownProps, ref: any) {
  const { onFinish, cancelLoading, Step2PwdLeftTimes, pwdErrorModalText } =
    props;
  const { locale } = useRouter();
  const lang = getLang();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codeInputShow, setCodeInputShow] = useState(false); // 验证码输入框
  const [curType, setcurType] = useState<curParamsType>({});
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
  const captcha = useCurCaptcha();
  const { updateUserInfo, userInfo } = useUserInfo();
  const [btnLoading, setBtnLoading] = useState(false);

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
    const _curType = { ...curType };
    if (_curType.next) delete _curType.next;
    if (_curType.password) delete _curType.password;
    const params = {
      ..._curType,
      geetest_challenge: _captchaInfo.geetest_challenge,
      geetest_validate: _captchaInfo.geetest_validate,
      geetest_seccode: _captchaInfo.geetest_seccode
    };
    await postPwdAuthCodeSend(params);
    // if (userInfo?.vague_email) {
    //   await postEmailCodeSend({
    //     captcha_type: 'geetest',
    //     geetest_challenge: _captchaInfo?.geetest_challenge,
    //     geetest_validate: _captchaInfo?.geetest_validate,
    //     geetest_seccode: _captchaInfo?.geetest_seccode,
    //     email_type: EmailCodeType.login_code,
    //     lang: locale
    //   });
    // } else if (userInfo?.vague_mobile) {
    //   await postPhoneCodeSend({
    //     captcha_type: 'geetest',
    //     geetest_challenge: _captchaInfo?.geetest_challenge,
    //     geetest_validate: _captchaInfo?.geetest_validate,
    //     geetest_seccode: _captchaInfo?.geetest_seccode,
    //     code_type: EmailCodeType.login_code,
    //     area_code: userInfo?.area_code,
    //     mobile: userInfo?.mobile
    //   });
    // }
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
      setCodeInputShow(true); // 真正打开验证码输入框
      // 极验之后，光标聚焦到第一个输入框
      focusFirstInput();
      resendTimeInterver();
    } catch (e) {
      setcaptchaInfo({});
      throw e;
    }
  }

  async function verify(type?: 'email' | 'phone') {
    //1. verify email
    //2. go setting 2fa modal
    setBtnLoading(true);
    const params = {
      ...curType,
      code: code.join('')
    };
    if (type === 'phone') {
      try {
        await onFinish(params);
      } catch (error) {
        message.error(t(error.code));
      }
    } else {
      try {
        await onFinish(params);
      } catch (error) {
        message.error(t(error.code));
      }
    }
    setBtnLoading(false);
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

  async function handleConfirmCode() {
    if (nextBtnDisable) return;
    setBtnLoading(true);
    const joinCode = code.join('');
    if (joinCode.length === digit) {
      const params = {
        ...curType,
        code: joinCode
      };
      if (params?.next) delete params.next;
      if (params?.password) delete params.password;
      try {
        const res = await onFinish(params);
        console.log(res, 'res');
      } catch (error) {
        console.log(error, 'code input error');
      }
      setBtnLoading(false);
    }
  }

  function handleInpChange(Event) {
    setcodeInput(Event.target.value);
  }

  function handleCancel() {
    setIsModalOpen(false);
    setCodeInputShow(false); // 确保验证码输入框也被隐藏
    setcodeInput('');
    setcode(Array(digit).fill(''));
    setcurrentIndex(0);
    setisUnbind(false);
    cancelLoading && cancelLoading();
    // clearTimeInterver();
  }

  useEffect(() => {
    if (code.indexOf('') === -1 && !isUnbind) {
      // all code has typied
      if (curType?.next === 1) {
        // 2fa
        handleConfirmCode();
        return;
      }
      if (curType?.type === 'email') {
        verify();
        return;
      } else if (curType?.type === 'phone') {
        verify('phone');
        return;
      }
    }
  }, [code]);

  useEffect(() => {
    if (isModalOpen) {
      setcode(Array(digit).fill(''));
      // resendTimeInterver();
      if (curType?.next === 1) {
        focusFirstInput();
        // 2fa
        return;
      } else if (curType?.next === 2 || curType?.next === 3) {
        // if (countdown === '00:00') {
        //   showCaptcha();
        // }
        showCaptcha();

      }
    }
    return () => {
      clearTimeInterver();
    };
  }, [isModalOpen]);

  const focusFirstInput = () => {
    setcurrentIndex(0);
    setTimeout(() => {
      focus(0);
    }, 0);
  }

  useImperativeHandle(ref, () => ({
    changeModalVisible: (visible: boolean, params: curParamsType) => {
      setIsModalOpen(visible);
      setcurType(params);
    },
    showCaptcha
  }));

  // 登陆的时候，必须是极验验证之后，在输入验证码
  const getShow = () => {
    if (curType?.next === 2 || curType?.next === 3) {
      return codeInputShow
    } else {
      return isModalOpen
    }
  }

  const handlePasteCode = async () => {
    try {
      // 使用统一的粘贴工具方法
      const pastedText = await pasteFromClipboard(t('paste-error'));

      // 处理粘贴的内容
      if (pastedText) {
        // 只保留数字
        const cleanText = pastedText.replace(/\D/g, '');

        if (cleanText.length === 0) {
          message.warning(t('countdownModal-paste-warning'));
          return;
        }

        // 截取前6位
        const codeArray = cleanText.substring(0, digit).split('');
        const newCode = Array(digit).fill('');

        codeArray.forEach((char, index) => {
          if (index < digit) {
            newCode[index] = char;
          }
        });

        // 更新验证码
        setcode(newCode);

        // 设置光标位置到最后一个输入的位置
        const lastIndex = Math.max(0, Math.min(codeArray.length - 1, digit - 1));
        setcurrentIndex(lastIndex);

        // 聚焦到最后一个输入框
        setTimeout(() => {
          focus(lastIndex);
        }, 50);

      } else {
        message.info(t('countdownModal-paste-info'));
      }
    } catch (error) {
      console.error('粘贴操作失败:', error);
      // 如果自动粘贴失败，提示用户手动粘贴并聚焦到第一个输入框
      message.warning(t('countdownModal-paste-error'));
      focus(0);
    }
  }

  const handleHelpTextLink = () => {
    window.location.href = `/${lang}/account/reset2fa`;
  }

  const nextBtnDisable = useMemo(() => {
    const hascode = code.filter((it) => it || it === 0);
    return hascode.length !== digit;
  }, [code]);

  return (
    <div>
      <Modal
        width={424}
        title={t('countdownModal-title')}
        maskClosable={false}
        open={getShow()}
        onCancel={handleCancel}
        footer={null}
        className={Style.countdownModal}
      >
        <div className={Style.subTitle}>
          {curType?.next === 1 && t('countdownModal-desc-2fa')}
          {/*{curType?.next === 2 && t('countdownModal-desc-email')}*/}
          {/*{curType?.next === 3 && t('countdownModal-desc-phone')}*/}
        </div>
        <p className={Style.desc}>
          {curType?.next === 2 &&
            t('emailSetup2FAModal-desc', { value: curType?.vague_email })}
          {curType?.next === 3 &&
            t('phoneSetup2FAModal-desc', { value: curType?.vague_mobile })}
        </p>
        <div className={Style['verification-input']}>
          {code.map((item, index) => (
            <div className={Style['verification-input-wrapper']} key={index}>
              <input
                className={classNames(Style['verification-input-wrapper-box'], {
                  [Style['verification-input-wrapper-box-error']]:
                    pwdErrorModalText && code.join('')?.length === digit
                })}
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
        {curType?.next === 1 && (
          <div className={Style.helpText}>
            <span className={Style.helpTextLink} onClick={handleHelpTextLink}>
              {t('helpTextLink')}
            </span>
            <span className={Style.paste} onClick={handlePasteCode}>
              {t('paste')}
            </span>
          </div>
        )}
        {pwdErrorModalText && (
          <div className={Style.error}>{pwdErrorModalText}</div>
        )}
        {curType?.next !== 1 && (
          <div className={Style.resend}>
            <span style={{ color: 'var(--text-brand-default)' }}>
              {countdown !== '00:00' ? countdown : ''}
            </span>
            <button
              disabled={isResendDisabled}
              className={Style.btn}
              onClick={showCaptcha}
            >
              {t('setup2FAModal-resend')}
            </button>
          </div>
        )}
        {/* <div className={Style.error}>{pwdErrorModalText}</div> */}
        <div className={Style.confrimBtn}>
          <Button
            type="primary"
            onClick={handleConfirmCode}
            loading={btnLoading}
          >
            {!btnLoading && t('confirm-btn')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default forwardRef(Countdown);
