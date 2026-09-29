import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Row, Col, Typography, Divider, Alert, DatePicker, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';
import ImageUpload from '~/components/ImageUpload';
import { submitKycInfo, getKycImg } from '~/api';
import { useCaptcha } from '~/hooks/useCaptcha';
import dayjs from 'dayjs';
import Image from 'next/image';
import { basePath } from '@better-bit-fe/base-utils';
import { ReactComponent as WarnIconSvg } from '~/public/images/kyc/warn-icon.svg';
import { useCountryList } from '~/hooks/useCountryList';
import { useKycImageUpload } from '~/hooks/useKycImageUpload';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// 定义证件类型与占位图片的映射关系
const DOCUMENT_PLACEHOLDER_IMAGES = {
  passport: {
    front: basePath + '/images/kyc/placeholder-passport-front.png',
    back: basePath + '/images/kyc/placeholder-passport-back.png',
  },
  id_card: {
    front: basePath + '/images/kyc/placeholder-idcard-front.png',
    back: basePath + '/images/kyc/placeholder-idcard-back.png',
  },
  drivers: {
    front: basePath + '/images/kyc/placeholder-driver-license-front.png',
    back: basePath + '/images/kyc/placeholder-driver-license-back.png',
  },
  default: {
    front: basePath + '/images/kyc/placeholder-passport-front.png',
    back: basePath + '/images/kyc/placeholder-passport-back.png',
  }
};

interface BasicKycFormProps {
  kycData: any;
  onSubmitSuccess?: () => void;
}

const BasicKycForm: React.FC<BasicKycFormProps> = ({ kycData, onSubmitSuccess }) => {
  const [form] = Form.useForm();
  const t = useFm();
  const captcha = useCaptcha();
  const [submitting, setSubmitting] = useState(false);

  // 使用自定义 hooks
  const { countries, loadingCountries } = useCountryList();
  const {
    idFrontState,
    idBackState,
    setIdFrontState,
    setIdBackState,
    handleCustomImageSelect,
    genericUploadSuccessHandler,
    genericUploadErrorHandler
  } = useKycImageUpload(form);

  // 证件类型对应上传区域 label 文案
  const IDENTITY_LABELS = {
    passport: {
      front: t('setting.upPasport'),
      back: t('setting.backDoc'),
    },
    id_card: {
      front: t('setting.upIdCardF'),
      back: t('setting.upIdCardB'),
    },
    drivers: {
      front: t('setting.upDriveF'),
      back: t('setting.upDriveB'),
    },
    default: {
      front: t('setting.upDocF'),
      back: t('setting.backDoc'),
    },
  };

  // 获取表单中 "identity_type" 和 "country" 字段的当前值
  const identity_type = Form.useWatch('identity_type', form);
  const country = Form.useWatch('country', form);

  // 当国家为中国且证件类型为身份证或驾照时，姓/名只能包含中文字符
  const chineseNameValidator = (_: any, value: string) => {
    if (
      country === 'CN' &&
      (identity_type === 'id_card' || identity_type === 'drivers') &&
      value &&
      !/^[\u4e00-\u9fa5]+$/.test(value)
    ) {
      return Promise.reject(new Error(t('setting.cnNameOnlyChinese')));
    }
    return Promise.resolve();
  };

  // 状态，用于存储当前证件类型对应的占位图
  const [currentPlaceholders, setCurrentPlaceholders] = useState(
    DOCUMENT_PLACEHOLDER_IMAGES.passport
  );

  // 获取当前证件类型对应的 label 文案
  const currentLabels =
    IDENTITY_LABELS[identity_type as keyof typeof IDENTITY_LABELS] ||
    IDENTITY_LABELS.default;

  useEffect(() => {
    const loadKycImages = async () => {
      if (kycData) {
        form.setFieldsValue({
          ...kycData,
          dob: kycData?.dob ? dayjs(kycData?.dob) : null
        });

        // 加载图片预览
        if (kycData?.identity_front) {
          try {
            const frontImg = await getKycImg({ file_path: kycData.identity_front });
            setIdFrontState({
              file: null,
              preview: frontImg,
              error: null,
              serverPath: kycData.identity_front
            });
          } catch (error) {
            console.error('加载前面图片失败:', error);
          }
        }

        if (kycData?.identity_back) {
          try {
            const backImg = await getKycImg({ file_path: kycData.identity_back });
            setIdBackState({
              file: null,
              preview: backImg,
              error: null,
              serverPath: kycData.identity_back
            });
          } catch (error) {
            console.error('加载后面图片失败:', error);
          }
        }
      }
    };

    loadKycImages();
  }, [kycData]);

  useEffect(() => {
    if (form && identity_type) {
      setCurrentPlaceholders(
        DOCUMENT_PLACEHOLDER_IMAGES[identity_type as keyof typeof DOCUMENT_PLACEHOLDER_IMAGES] || DOCUMENT_PLACEHOLDER_IMAGES.default
      );
    } else if (form) {
      const initialDocType = form.getFieldValue('identity_type');
      setCurrentPlaceholders(
        DOCUMENT_PLACEHOLDER_IMAGES[initialDocType as keyof typeof DOCUMENT_PLACEHOLDER_IMAGES] || DOCUMENT_PLACEHOLDER_IMAGES.passport
      );
    }
  }, [identity_type, form]);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);

      // 表单校验
      try {
        await form.validateFields();
      } catch (error) {
        console.error('表单校验失败:', error);
        setSubmitting(false);
        return;
      }

      // 显示极验验证码
      const captchaResult = await captcha.showCaptcha();
      console.log('captchaResult', captchaResult);
      if (!captchaResult) {
        message.error(t('setting.verifyFl'));
        setSubmitting(false);
        return;
      }

      // 提交表单数据
      await handleSubmitWithCaptcha(values, captchaResult);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 处理带验证码的表单提交
  const handleSubmitWithCaptcha = async (values: any, captchaResult: any) => {
    const formattedDob = values.dob ? values.dob.format('YYYY-MM-DD') : null;

    const params = {
      ...values,
      kyc_level: 1, // 基础认证
      dob: formattedDob,
      captcha_type: 'geetest',
      geetest_challenge: captchaResult?.geetest_challenge,
      geetest_validate: captchaResult?.geetest_validate,
      geetest_seccode: captchaResult?.geetest_seccode
    };

    try {
      await submitKycInfo(params);
      onSubmitSuccess?.();
    } catch (error) {
      console.error('提交失败:', error);
      throw error;
    }
  };

  const genReason = (reason) => {
    const reasonHtml = `${t('setting.authFail')} ${reason ? t(`${reason}_user`) : ''}`;
    return (<div className={styles.rejectReason} dangerouslySetInnerHTML={{ __html: reasonHtml }} />)
  }

  const genCustomReason = (reason) => {
    const reasonHtml = `${t('setting.cus_rej_reason')} ${reason ? reason : ''}`;
    return (<div className={styles.rejectReason} dangerouslySetInnerHTML={{ __html: reasonHtml }} />)
  }

  return (
    <div className={styles.kycFormContainer}>
      <Title level={4} className={styles.mainTitle}>
        {t('setting.basicAuth')}
      </Title>

      <div className={styles.photoRequirements}>
        <Paragraph strong className={styles.requirementTitle}>{t('setting.photoReq')}:</Paragraph>
        <Paragraph className={styles.requirementText}>{`1. ${t('setting.req3')}`}</Paragraph>
        <Paragraph className={styles.requirementText}>{`2. ${t('setting.req4')}`}</Paragraph>
        {kycData?.kyc_status === 'rejected' && (
          <Alert
            message={kycData?.reject_reason_custom ? genCustomReason(kycData?.reject_reason_custom) : genReason(kycData?.reject_reason)}
            type="warning"
            showIcon
            icon={<WarnIconSvg />}
            style={{
              margin: '24px 0 8px',
              backgroundColor: '#FFF5EC',
              border: '1px solid #FFDABE',
              color: '#FC8A29'
            }}
            className={styles.customAlert}
          />
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles.identityForm}
        initialValues={{
          ...kycData,
          dob: kycData?.dob ? dayjs(kycData?.dob) : null
        }}
      >
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="country"
              label={t('setting.country')}
              rules={[{ required: true, message: t('setting.selCountry') }]}
            >
              <Select
                suffixIcon={<Image src={basePath + "/images/kyc/select-arrow.svg"} alt="arrow-down" width={12} height={12} style={{ verticalAlign: 'middle' }} />}
                placeholder={t('setting.plsSel')}
                loading={loadingCountries}
                disabled={loadingCountries}
                options={countries}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} sm={6}>
            <Form.Item
              name="last_name"
              label={t('setting.surname')}
              rules={[
                { required: true, message: t('setting.inpSurname') },
                { validator: chineseNameValidator }
              ]}
            >
              <Input placeholder={t('setting.inpSurname')} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="first_name"
              label={t('setting.name')}
              rules={[
                { required: true, message: t('setting.inpName') },
                { validator: chineseNameValidator }
              ]}
            >
              <Input placeholder={t('setting.inpName')} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="dob"
              label={t('setting.birth')}
              rules={[{ required: true, message: t('setting.selBirth') }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                placeholder={t('setting.selBirth')}
                allowClear
                className={styles.datePickerWrapper}
                suffixIcon={<Image src={basePath + "/images/kyc/select-arrow.svg"} alt="calendar-icon" width={12} height={12} style={{ verticalAlign: 'middle' }} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="identity_type"
              label={t('setting.docType')}
              rules={[{ required: true, message: t('setting.selDocType') }]}
            >
              <Select suffixIcon={<Image src={basePath + "/images/kyc/select-arrow.svg"} alt="arrow-down" width={12} height={12} style={{ verticalAlign: 'middle' }} />} placeholder={t('setting.plsSel')}>
                <Option value="passport">{t('setting.passport')}</Option>
                <Option value="id_card">{t('setting.idCard')}</Option>
                <Option value="drivers">{t('setting.license')}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="identity_number"
              label={t('setting.docNum')}
              rules={[{ required: true, message: t('setting.inpDocNum') }]}
            >
              <Input placeholder={t('setting.inpDocNum')} />
            </Form.Item>
          </Col>
        </Row>

        <Divider className={styles.divider} />

        <Row gutter={{ xs: 8, sm: 16, md: 24 }} className={styles.uploadSectionWrapper}>
          <Col xs={24} md={12} className={styles.uploadCol}>
            <Form.Item
              label={currentLabels.front}
              name="identity_front"
              rules={[{ required: true, message: t('setting.upDocFront') }]}
              className={styles.uploadFormItem}
            >
              <ImageUpload
                id="identity_front"
                labelText={currentLabels.front}
                placeholderImage={currentPlaceholders.front}
                onImageSelect={handleCustomImageSelect}
                previewImageUrl={idFrontState.preview}
                error={idFrontState.error}
                isSuccess={!!idFrontState.serverPath && !idFrontState.error}
                className={styles.imageUploader}
                action="/user/private/v3/upload-kyc-file"
                onUploadSuccess={(response) => genericUploadSuccessHandler('identity_front', response)}
                onUploadError={(error) => genericUploadErrorHandler('identity_front', error)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} className={styles.uploadCol}>
            <Form.Item
              label={currentLabels.back}
              name="identity_back"
              rules={[{ required: true, message: t('setting.upDocBack') }]}
              className={styles.uploadFormItem}
            >
              <ImageUpload
                id="identity_back"
                labelText={currentLabels.back}
                placeholderImage={currentPlaceholders.back}
                onImageSelect={handleCustomImageSelect}
                previewImageUrl={idBackState.preview}
                error={idBackState.error}
                isSuccess={!!idBackState.serverPath && !idBackState.error}
                className={styles.imageUploader}
                action="/user/private/v3/upload-kyc-file"
                onUploadSuccess={(response) => genericUploadSuccessHandler('identity_back', response)}
                onUploadError={(error) => genericUploadErrorHandler('identity_back', error)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className={styles.submitButtonContainer}>
          <Button
            size='large'
            type="primary"
            htmlType="submit"
            className={styles.submitButton}
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? t('setting.verifying') : kycData?.kyc_status === 'rejected' ? t('setting.resubmit') : t('setting.submit')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BasicKycForm;

