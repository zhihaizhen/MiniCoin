// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Button, Checkbox, Form, Input, Tooltip } from 'antd';
import ipRegex from 'ip-regex';
import queryString from 'query-string';
import { useFm } from '@better-bit-fe/base-hooks';
import { QuestionCircleOutlined } from '@ant-design/icons';
import VerifyEmail2faModal from '~/components/verifyEmail2faModal';
import ViewApiModal from '~/components/viewApiModal';
import { IResOpenApiDetail } from '~/types';
import { getOpenApiKeyDetail } from '~/api';
import Style from './index.module.less';

// interface ICreateApiFormProps {}

type FieldType = {
  api_name: string;
  is_readonly: Array<string> | number;
  ip_address?: string | Array<string>;
};

const CreateApiForm: React.FC = (props) => {
  const [form] = Form.useForm();
  const [detail, setDetail] = useState<FieldType>({
    api_name: '',
    is_readonly: 1,
    ip_address: ''
  });
  const [createdKeyDetail, setcreatedKeyDetail] = useState<IResOpenApiDetail>(
    {}
  );
  const [isApiModalOpen, setisApiModalOpen] = useState<boolean>(false);
  const t = useFm();
  const verifyRef = useRef(null);

  const options = [
    { label: t('enable-read'), value: 'enableRead', disabled: true },
    { label: t('enable-trade'), value: 'enableTrade' }
  ];

  const getDetailData = async () => {
    const { mode, id } = queryString.parse(window.location.search);
    if (mode !== 'edit') return;
    const res = await getOpenApiKeyDetail({ id });
    form.setFieldsValue({
      api_name: res.api_name,
      is_readonly: res.is_readonly
        ? ['enableRead']
        : ['enableRead', 'enableTrade'],
      ip_address: res.ips?.filter((item) => item !== '*').join(',')
    });
  };

  const handleSetViewOpen = (val: IResOpenApiDetail) => {
    setisApiModalOpen(true);
    setcreatedKeyDetail(val);
  };

  function handleCheckIp() {
    const ipData = form.getFieldValue('ip_address');
    if (ipData === '') return Promise.resolve();
    const ips = ipData?.split(',');
    const ipValidated = ips?.every((item) =>
      ipRegex({ exact: true }).test(item.trim())
    );
    const is50length = ips?.length <= 50;
    if (!ipValidated) return Promise.reject(t('ip-error'));
    if (!is50length) return Promise.reject(t('ip-length-msg'));
    return Promise.resolve();
  }

  const onFinish = (values: any) => {
    console.log('Success:', values);
    const { api_name, is_readonly, ip_address } = values;
    const _ip_address = ip_address
      ? ip_address?.split(',').map((item) => item.trim())
      : [];
    if (api_name && is_readonly) {
      // verify email and 2fa
      setDetail({
        api_name,
        is_readonly: Number(
          is_readonly.includes('enableRead') &&
          !is_readonly.includes('enableTrade')
        ),
        ip_address: _ip_address
      });
      verifyRef.current?.changeModalVisible(true);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    getDetailData();
  }, []);

  return (
    <>
      <div className={Style.createContainer}>
        <div>
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            // style={{ maxWidth: 600 }}
            initialValues={{
              api_name: '',
              is_readonly: ['enableRead'],
              ip_address: ''
            }}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            form={form}
          // autoComplete="off"
          >
            <div className={Style.formItemContainer}>
              <Form.Item<FieldType>
                label={t('apiMgTable-name')}
                name="api_name"
                className={Style.formItem}
                rules={[{ required: true, message: ' ' }]}
              >
                <Input placeholder={t('api-name-placeholder')} />
              </Form.Item>

              <Form.Item<FieldType>
                className={Style.formItem}
                label={t('apiMgTable-permissions')}
                name="is_readonly"
              >
                <Checkbox.Group
                  options={options}
                // defaultValue={['enableRead']}
                />
              </Form.Item>

              <Form.Item<FieldType>
                className={Style.formItem}
                rules={[{ message: ' ' }, { validator: handleCheckIp }]}
                label={
                  <>
                    <span>{t('ip-address')}</span>
                    <Tooltip
                      placement="top"
                      title={t('ip-address-tips')}
                      className={Style.tips}
                    >
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </>
                }
                name="ip_address"
              >
                <Input.TextArea
                  rows={4}
                  placeholder={t('ap-address-placeholder')}
                />
              </Form.Item>
            </div>

            <Form.Item className={Style.formItem}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '240px' }}
              >
                {t('saveBtn')}
              </Button>
            </Form.Item>
          </Form>
        </div>
        <ViewApiModal
          isApiModalOpen={isApiModalOpen}
          handleCancel={() => setisApiModalOpen(false)}
          curKeyDetail={createdKeyDetail}
          isRedirect={true}
        />
        <div className={Style.rightRemind}>
          <div className={Style.title}>{t('create-remind-title')}</div>
          <div className={Style.descRemind}>
            <p>· {t('remind-content-1')}</p>
            <p className={Style.highLight}>· {t('remind-content-2')}</p>
            <p className={Style.highLight}>· {t('remind-content-3')}</p>
            <p>· {t('remind-content-4')}</p>
          </div>
        </div>
      </div>

      <VerifyEmail2faModal
        ref={verifyRef}
        newApiDetail={detail}
        handleSetViewOpen={handleSetViewOpen}
      />
    </>
  );
};

export default CreateApiForm;
