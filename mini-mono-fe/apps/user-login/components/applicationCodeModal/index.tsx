//@ts-nocheck
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';
import { Button, Modal, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import Style from './index.module.less';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';

export interface IApplicationCodeModalProps {
  onClose?: () => void;
  onContactService?: () => void;
}

const digit = 6;

const ApplicationCodeModal = (props: IApplicationCodeModalProps, ref: any) => {
  const { onClose, onContactService } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationCode, setApplicationCode] = useState<string>('');
  const [code, setCode] = useState<Array<number | string>>(Array(digit).fill(''));
  const t = useFm();

  const handleCancel = () => {
    setIsModalOpen(false);
    setApplicationCode('');
    setCode(Array(digit).fill(''));
    if (onClose) {
      onClose();
    }
  };

  const handleCopyCode = () => {
    applicationCode && copy(applicationCode);
    message.success(t('copyTips'));
  };

  useEffect(() => {
    if (applicationCode && applicationCode.length === digit) {
      const codeArray = applicationCode.split('');
      setCode(codeArray);
    }
  }, [applicationCode]);

  useImperativeHandle(ref, () => ({
    changeModalVisible: (visible: boolean, code?: string) => {
      setIsModalOpen(visible);
      if (code) {
        setApplicationCode(code);
      }
    }
  }));

  const handleContactService = () => {
    // 关闭当前弹窗
    handleCancel();
    // 调用父组件传入的回调
    if (onContactService) {
      onContactService();
    }
  };

  return (
    <div>
      <Modal
        width={440}
        title={t('applicationCodeModal')}
        maskClosable={false}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className={Style.applicationCodeModal}
      >
        <div className={Style.subTitle}>
          {t('applicationCodeModal-desc')}
        </div>

        <div className={Style.codeContainer}>
          <div className={Style['verification-input']}>
            {code.map((item, index) => (
              <div className={Style['verification-input-wrapper']} key={index}>
                <div
                  className={classNames(Style['verification-input-wrapper-box'])}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={Style.actionButtons}>
          <Button
            type="default"
            onClick={handleContactService}
            className={Style.contactBtn}
          >
            {t('contact-service-btn')}
          </Button>
          <Button
            type="primary"
            onClick={handleCopyCode}
            className={Style.copyBtn}
          >
            {t('copy-btn')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default forwardRef(ApplicationCodeModal);

