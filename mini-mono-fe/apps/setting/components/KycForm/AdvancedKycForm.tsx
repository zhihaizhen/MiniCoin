import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Typography, Alert, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from './index.module.less';
import ImageUpload from '~/components/ImageUpload';
import { submitKycInfo, getKycImg } from '~/api';
import { useCaptcha } from '~/hooks/useCaptcha';
import { basePath } from '@better-bit-fe/base-utils';
import { ReactComponent as WarnIconSvg } from '~/public/images/kyc/warn-icon.svg';
import { useKycImageUpload } from '~/hooks/useKycImageUpload';

const { Title, Paragraph } = Typography;

// 手持证件照片占位图
const HANDHELD_PLACEHOLDER_IMAGES = {
  passport: basePath + '/images/kyc/passport_hold.png',
  id_card: basePath + '/images/kyc/id_card_hold.png',
  drivers: basePath + '/images/kyc/driver_hold.png',
  default: basePath + '/images/kyc/passport_hold.png',
};

interface AdvancedKycFormProps {
  kycData: any;
  onSubmitSuccess?: () => void;
}

const AdvancedKycForm: React.FC<AdvancedKycFormProps> = ({ kycData, onSubmitSuccess }) => {
  const [form] = Form.useForm();
  const t = useFm();
  const captcha = useCaptcha();
  const [submitting, setSubmitting] = useState(false);

  // 使用自定义 hooks
  const {
    handheldState,
    setHandheldState,
    handleCustomImageSelect,
    genericUploadSuccessHandler,
    genericUploadErrorHandler
  } = useKycImageUpload(form);

  // 获取当前证件类型
  const identityType = kycData?.identity_type || 'passport';

  // 获取手持证件照片占位图
  const handheldPlaceholder = HANDHELD_PLACEHOLDER_IMAGES[identityType as keyof typeof HANDHELD_PLACEHOLDER_IMAGES] || HANDHELD_PLACEHOLDER_IMAGES.default;

  useEffect(() => {
    const loadHandheldImage = async () => {
      if (kycData?.identity_person) {
        try {
          const personImg = await getKycImg({ file_path: kycData.identity_person });
          setHandheldState({
            file: null,
            preview: personImg,
            error: null,
            serverPath: kycData.identity_person
          });
          form.setFieldsValue({
            identity_person: kycData.identity_person
          });
        } catch (error) {
          console.error('加载手持证件照片失败:', error);
        }
      }
    };

    loadHandheldImage();
  }, [kycData]);

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
    const params = {
      // ...kycData, // 包含基础认证的所有信息
      ...values,
      kyc_level: 2, // 高级认证
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
        {t('setting.advancedAuth')}
      </Title>

      <div className={styles.photoRequirements}>
        <Paragraph strong className={styles.requirementTitle}>{t('setting.photoReq')}:</Paragraph>
        <Paragraph className={styles.requirementText}> {t('advancedKyc.require1')}</Paragraph>
        <Paragraph className={styles.requirementText}> {t('advancedKyc.require2')}</Paragraph>
        <Paragraph className={styles.requirementText}> {t('advancedKyc.require3')}</Paragraph>
        <Paragraph className={styles.requirementText}> {t('advancedKyc.require4')}</Paragraph>
        <Paragraph className={styles.requirementText}> {t('advancedKyc.require5')}</Paragraph>
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
      >
        <Row gutter={{ xs: 8, sm: 16, md: 24 }} className={styles.uploadSectionWrapper}>
          <Col xs={24} md={12} className={styles.uploadCol}>
            <Form.Item
              label={t('setting.holdDoc')}
              name="identity_person"
              rules={[{ required: true, message: t('setting.upHoldDoc') }]}
              className={styles.uploadFormItem}
            >
              <ImageUpload
                id="identity_person"
                labelText={t('setting.upHold')}
                placeholderImage={handheldPlaceholder}
                onImageSelect={handleCustomImageSelect}
                previewImageUrl={handheldState.preview}
                error={handheldState.error}
                isSuccess={!!handheldState.serverPath && !handheldState.error}
                className={styles.imageUploader}
                action="/user/private/v3/upload-kyc-file"
                onUploadSuccess={(response) => genericUploadSuccessHandler('identity_person', response)}
                onUploadError={(error) => genericUploadErrorHandler('identity_person', error)}
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

export default AdvancedKycForm;

