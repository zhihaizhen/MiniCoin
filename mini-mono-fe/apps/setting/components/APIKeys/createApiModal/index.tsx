import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Radio, Checkbox, Button, } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';

interface CreateApiModalProps {
  visible: boolean;
  mode?: 'create' | 'edit'; // 模式：创建或编辑
  initialData?: any; // 编辑时的初始数据
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const CreateApiModal: React.FC<CreateApiModalProps> = ({
  visible,
  mode = 'create',
  initialData,
  onClose,
  onSubmit
}) => {
  const t = useFm();
  const [form] = Form.useForm();
  const [selectAllChecked, setSelectAllChecked] = useState(false); // 全选状态
  const modalRef = useRef<HTMLDivElement>(null);
  const permissionType = (Form.useWatch('permission_type', form) as 'rw' | 'r' | undefined) || 'rw';

  // 监听弹框打开/关闭，设置表单数据
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        640
        // 编辑模式：设置初始数据
        const businessTypes = [];
        if (initialData.futures_order) businessTypes.push('futures_order');
        if (initialData.futures_position) businessTypes.push('futures_position');
        if (initialData.spot_trade) businessTypes.push('spot_trade');
        if (initialData.asset_transfer) businessTypes.push('asset_transfer');

        // 处理 IP 地址：可能是数组、字符串或 undefined
        let ipAddress = '';
        if (initialData.ips) {
          if (Array.isArray(initialData.ips)) {
            ipAddress = initialData.ips.join(',');
          } else if (typeof initialData.ips === 'string') {
            ipAddress = initialData.ips;
          }
        }

        form.setFieldsValue({
          name: initialData.name,
          permission_type: initialData.permission_type,
          businessTypes: businessTypes,
          ipAddress: ipAddress
        });
        setSelectAllChecked(businessTypes.length === 4);
      }
    } else {
      // 关闭时重置表单
      form.resetFields();
      setSelectAllChecked(false);
      // 重置滚动条
      setTimeout(() => {
        const modalBody = document.querySelector(`.${styles.createApiModal} .ant-modal-body`) as HTMLElement;
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
      }, 0);
    }
  }, [visible, mode, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
      // 手动滚动到第一个错误
      setTimeout(() => {
        const modalBody = document.querySelector(`.${styles.createApiModal} .ant-modal-body`) as HTMLElement;
        const firstError = document.querySelector(`.${styles.createApiModal} .ant-form-item-has-error`) as HTMLElement;
        if (modalBody && firstError) {
          // 计算错误元素相对于 modalBody 的位置
          const modalBodyRect = modalBody.getBoundingClientRect();
          const errorRect = firstError.getBoundingClientRect();
          const scrollTop = errorRect.top - modalBodyRect.top + modalBody.scrollTop - 80;
          modalBody.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const businessTypes = [
    {
      key: 'contract',
      title: t('api-business-contract'),
      items: [
        {
          key: 'futures_order',
          label: t('api-business-order'),
          desc: t('api-business-order-desc'),
          extra: t('api-business-order-extra')
        },
        {
          key: 'futures_position',
          label: t('api-business-position'),
          desc: t('api-business-position-desc'),
          extra: t('api-business-position-extra')
        }
      ]
    },
    {
      key: 'spot',
      title: t('api-business-spot'),
      items: [
        {
          key: 'spot_trade',
          label: t('api-business-trade'),
          desc: t('api-business-trade-desc'),
          extra: t('api-business-trade-extra')
        }
      ]
    },
    {
      key: 'fund',
      title: t('api-business-fund'),
      items: [
        {
          key: 'asset_transfer',
          label: t('api-business-query'),
          desc: t('api-business-query-desc'),
          extra: t('api-business-query-extra')
        },
      ]
    }
  ];

  const handleSelectAll = (e: any) => {
    const checked = e.target.checked;
    setSelectAllChecked(checked);
    if (checked) {
      const allKeys = businessTypes.flatMap((type) =>
        type.items.map((item) => item.key)
      );
      form.setFieldsValue({ businessTypes: allKeys });
    } else {
      form.setFieldsValue({ businessTypes: [] });
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={478}
      className={styles.createApiModal}
      centered
      maskClosable={false}
    >
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.title}>
            {mode === 'edit' ? t('edit-title') : t('api-create-title')}
          </div>
        </div>

        <div className={styles.formContainer}>
          <Form
            form={form}
            layout="vertical"
            className={styles.form}
          >
            {/* 备注名称 */}
            <Form.Item
              name="name"
              label={
                <span className={styles.label}>
                  {t('api-form-name')}
                </span>
              }
              rules={[
                { required: true, message: t('api-form-name-required') },
                {
                  pattern: /^[A-Za-z0-9][A-Za-z0-9_]{0,19}$/,
                  message: t('api-form-name-pattern-error')
                }
              ]}
            >
              <Input
                placeholder={t('api-form-name-placeholder')}
                className={styles.input}
              />
            </Form.Item>

            {/* API 权限 */}
            <Form.Item
              name="permission_type"
              label={
                <span className={styles.label}>
                  {t('api-form-permission')}
                </span>
              }
              initialValue={'rw'}
              rules={[
                { required: true, message: t('api-form-name-required') }
              ]}
            >
              <Radio.Group
                className={styles.radioGroup}
              >
                <Radio value={'rw'}>{t('api-permission-readwrite-radio')}</Radio>
                <Radio value={'r'}>{t('api-permission-readonly-radio')}</Radio>
              </Radio.Group>
            </Form.Item>

            {/* 业务类型 */}
            <div className={styles.businessTypeSection}>
              <div className={styles.businessTypeHeader}>
                <span className={styles.label}>
                  {t('api-form-business-type')}
                </span>
                <Checkbox
                  checked={selectAllChecked}
                  onChange={handleSelectAll}
                  className={styles.selectAll}
                >
                  {t('api-select-all')}
                </Checkbox>
              </div>

              <Form.Item
                name="businessTypes"
                rules={[
                  {
                    required: true,
                    message: t('api-form-business-type-required')
                  }
                ]}
              >
                <Checkbox.Group className={styles.checkboxGroup}>
                  {businessTypes.map((type) => (
                    <div key={type.key} className={styles.businessTypeGroup}>
                      <div className={styles.businessTypeTitle}>
                        {type.title}
                      </div>
                      {type.items.map((item) => (
                        <div key={item.key} className={styles.checkboxItem}>
                          <Checkbox value={item.key} className={styles.checkbox}>
                            <div className={styles.checkboxContent}>
                              <div className={styles.checkboxLabel}>
                                {item.label}
                              </div>
                              <div className={styles.checkboxDesc}>
                                {item.desc}
                                {permissionType === 'rw' && item.extra ? `；${item.extra}` : ''}
                              </div>
                            </div>
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  ))}
                </Checkbox.Group>
              </Form.Item>
            </div>

            {/* IP 地址 */}
            <Form.Item
              name="ipAddress"
              label={
                <span className={styles.label}>
                  {t('api-form-ip-address')}
                </span>
              }
              validateTrigger="onBlur"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value.trim() === '') {
                      return Promise.resolve();
                    }

                    // IP 地址用英文逗号分隔
                    const ips = value.split(',').map((ip: string) => ip.trim()).filter((ip: string) => ip);

                    // 检查数量
                    if (ips.length > 30) {
                      return Promise.reject(new Error('最多只能添加30个IP地址'));
                    }

                    // IPv4 正则表达式
                    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

                    // 检查每个 IP 的格式
                    for (let i = 0; i < ips.length; i++) {
                      const ip = ips[i];
                      if (!ipv4Regex.test(ip)) {
                        return Promise.reject(new Error(`IP地址格式不正确: ${ip}`));
                      }
                    }

                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input.TextArea
                placeholder={t('api-form-ip-placeholder')}
                className={styles.textarea}
                autoSize={{ minRows: 4, maxRows: 8 }}
              />
            </Form.Item>
          </Form>
        </div>

        <div className={styles.footer}>
          <Button
            type="primary"
            onClick={handleSubmit}
            className={styles.submitBtn}
            block
          >
            {t('api-form-submit')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateApiModal;

