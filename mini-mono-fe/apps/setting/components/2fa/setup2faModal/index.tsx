//@ts-nocheck
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect
} from 'react';
import { Button, Modal, message, Input } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import Image from 'next/image';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useCaptcha } from '~/hooks/useCaptcha';
import { EmailCodeType } from '~/constant';
import { postGet2fa, postBind2fa } from '~/api';
import { ReactComponent as TipSvg } from '~/public/images/tips.svg';
import Style from './index.module.less';

function Setup2faModal(props, ref: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [twoFaInfo, settwoFaInfo] = useState({
    google2fa_secret: '',
    qrcode_src: ''
  });
  const [codeInp, setcodeInp] = useState('');
  const t = useFm();
  const { updateUserInfo } = useUserInfo();

  function show2faModal(visible: boolean) {
    setIsModalOpen(visible);
  }

  function copyCode() {
    copy(twoFaInfo.google2fa_secret);
    message.success(t('copyTips'));
  }

  function handleChange(event) {
    setcodeInp(event.target.value);
  }

  async function handleConfirm() {
    try {
      const res = await postBind2fa({
        secret: twoFaInfo.google2fa_secret,
        code: codeInp,
        code_type: 'bind_opt_scenes'
      });
      setIsModalOpen(false);
      setcodeInp('');
      updateUserInfo();
      message.success(t('setupTips'));
    } catch (e) {
      message.error(t(e?.code));
    }
  }

  async function get2faInfo() {
    // const res = await postGet2fa({ type: 1 });
    const res = await postGet2fa({ type: 3 });
    settwoFaInfo(res);
  }

  useEffect(() => {
    if (isModalOpen) {
      get2faInfo();
    }
  }, [isModalOpen]);

  useImperativeHandle(ref, () => ({
    show2faModal
  }));
  return (
    <Modal
      width={480}
      title={t('2FAModal-title')}
      open={isModalOpen}
      onCancel={() => {
        show2faModal(false);
        setcodeInp('');
      }}
      footer={null}
      className={Style.twoFA}
      wrapClassName={Style.modalWrapper}
    >
      <div className={Style.twoFAItem}>
        <div>1</div>
        <div>
          <div className={Style.title}>{t('2FAModal-subtitle1')}</div>
          <p className={Style.content}>{t('2FAModal-subcontent1')}</p>
        </div>
      </div>
      <div className={Style.twoFAItem}>
        <div>2</div>
        <div>
          <div className={Style.title}>{t('2FAModal-subtitle2')}</div>
          <p className={Style.content}>{t('2FAModal-subcontent2')}</p>
          <div className={Style.codeContainer}>
            <Image
              src={twoFaInfo?.qrcode_src}
              alt={'2faCode'}
              width={160}
              height={160}
            />
            <span className={Style.tokenCode}>
              <span>{twoFaInfo.google2fa_secret}</span>
              <CopyOutlined
                width={16}
                height={16}
                style={{ color: 'var(--text-brand-default)', cursor: 'pointer' }}
                onClick={copyCode}
              />
            </span>
          </div>
        </div>
      </div>
      <div className={Style.twoFAItem}>
        <div>3</div>
        <div>
          <div className={Style.title}>{t('2FAModal-subtitle3')}</div>
          <Input
            className={Style.twofaCodeInp}
            placeholder={t('bindEmailModal-code')}
            value={codeInp}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={Style.withdrawTips}>
        <TipSvg className={Style.tipsIcon} />
        <div className={Style.tipsText}>{t('withdrawTipsBindGa')}</div>
      </div>
      <Button
        type="primary"
        className={Style.twoFAbtn}
        disabled={!codeInp.length}
        onClick={handleConfirm}
      >
        {t('confirmBtn')}
      </Button>
    </Modal>
  );
}

export default forwardRef(Setup2faModal);
