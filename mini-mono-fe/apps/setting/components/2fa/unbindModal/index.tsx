// @ts-nocheck
import React, {
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { Button, Modal, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { postUnBindTg } from '~/api';
import { useUserInfo } from '@better-bit-fe/base-provider';
import Style from './index.module.less';

interface IUnbindModalProps {
  onConfirm: () => void;
}

function UnbindModal(props: IUnbindModalProps, ref: any) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [type, settype] = useState('');
  const { updateUserInfo } = useUserInfo();
  const t = useFm();
  function changeUnbindModalVisible(visible: boolean, type?: 'tg' | '2fa') {
    setIsModalOpen(visible);
    if (type) {
      settype(type);
    }
  }

  const handleOk = async () => {
    setIsModalOpen(false);
    // showCaptcha();
    if (type === 'tg') {
      await postUnBindTg();
      await updateUserInfo();
    } else {
      props?.onConfirm();
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    settype('');
  };

  const dynamicTitleTxt = useMemo(() => {
    if (type === 'tg') {
      return t('unbindModal-tgTitle');
    } else if (type === '2fa') {
      return t('unbindModal-2faTitle');
    } else {
      return t('unbindConfirmModal-title');
    }
  }, [t, type]);

  const dynamicDescTxt = useMemo(() => {
    if (type === 'tg') {
      return t('unbindModal-tgDesc');
    } else if (type === '2fa') {
      return t('unbindModal-2faDesc');
    } else {
      return t('unbindConfirmModal-desc');
    }
  }, [t, type]);

  useImperativeHandle(ref, () => ({
    changeUnbindModalVisible
  }));
  return (
    <div>
      <Modal
        width={424}
        title={null}
        open={isModalOpen}
        footer={
          <div className={Style.btnRow}>
            <Button className={Style.secondaryButton} onClick={handleCancel}>{t('cancelBtn')}</Button>
            <Button className={Style.primaryButton} type="primary" onClick={handleOk}>
              {type === 'tg' ? t('confirmBtn') : t('continueBtn')}
            </Button>
          </div>
        }
        onCancel={handleCancel}
        className={Style.unbindModal}
        wrapClassName={Style.modalWrapper}
      >
        <div className={Style.container}>
          <div className={Style.iconRow}>
            <div className={Style.blueTipsIcon} />
          </div>
          <div className={Style.title}>{dynamicTitleTxt}</div>
          <p className={Style.desc}>{dynamicDescTxt}</p>

          <div className={Style.withdrawTips}>
            <div className={Style.tipsIcon} />
            <div className={Style.tipsText}>{t('withdrawTipsUnBindGa')}</div>
          </div>
        </div>
      </Modal>
      {/* <Countdown /> */}
    </div>
  );
}

export default forwardRef(UnbindModal);
