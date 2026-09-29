//@ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useRouter } from 'next/router';
import { Button, Modal, Form, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { postBindInviteCode } from '~/api';
import { getLang } from '@better-bit-fe/base-utils';
import Style from './index.module.less';

type FieldType = {
  invite_code?: string;
};

function BindInviteCodeModal(props, ref: any) {
  const { locale } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codeInp, setCodeInp] = useState('');
  const formRef = useRef();
  const t = useFm();


  const onFinish = async (values: any) => {
    console.log('Success:', values);
    // call api
    const inviteCode = values.invite_code;
    try {
      await postBindInviteCode({ invite_code: inviteCode });
      message.success(t('BindInviteCodeSuccess'));
      handleCancel();
    } catch (error) {
      console.log(error, 'error');
    }
  };
  const changeModalVisible = (visible: boolean) => {
    setIsModalOpen(visible);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleCancel = () => {
    const lang = getLang();
    formRef.current.resetFields();
    setIsModalOpen(false);
    window.location.href = `/${lang}/trade/usdt/BTCUSDT`;
  };

  function checkInviteCode() {
    const formData = formRef.current.getFieldsValue();
    if (!formData?.invite_code?.trim()) {
      return Promise.reject(t('BindInviteCodeModalTitle'));
    }
    return Promise.resolve();
  }
  useImperativeHandle(ref, () => ({
    changeModalVisible
  }));

  return (
    <div>
      <Modal
        width={425}
        title={t('BindInviteCodeModalTitle')}
        open={isModalOpen}
        centered
        onCancel={handleCancel}
        maskClosable={false}
        footer={null}
        className={Style.bindInviteCodeContainer}
      >
        <Form
          name="basic"
          ref={formRef}
          style={{ maxWidth: 600, marginTop: '24px' }}
          initialValues={{ invite_code: '' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item<FieldType>
            label=""
            name="invite_code"
            // validateTrigger="onBlur"
            rules={[
              { required: true, message: ' ' },
              { validator: checkInviteCode }
            ]}
          >
            <Input
              className={Style.userInp}
              placeholder={t('BindInviteCodeModalTitle')}
              value={codeInp}
              onChange={(event) => {
                setCodeInp(event.target.value);
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '35px', marginBottom: '10px' }}>
            <Button
              type="primary"
              htmlType="submit"
            >
              {t('confirm-btn')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
export const inviteModal = {
  changeInviteModalVisible: (visible: boolean) => {
    modalRef.current.changeModalVisible(visible);
  }
};

export default forwardRef(BindInviteCodeModal);
export const modalRef = React.createRef();

