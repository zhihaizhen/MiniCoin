// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Modal, Button, message } from 'antd';
import queryString from 'query-string';
import { CopyOutlined } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import { ENV, basePath } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { IResOpenApiDetail } from '~/types';
import { getOpenApiKeyDetail } from '~/api';
import Style from './index.module.less';

interface IViewApiModalProps {
  isApiModalOpen: boolean;
  handleCancel: () => void;
  curKeyDetail?: IResOpenApiDetail;
  isRedirect?: boolean;
}

const ViewApiModal: React.FC<IViewApiModalProps> = (props) => {
  const { isApiModalOpen, handleCancel, curKeyDetail, isRedirect } = props;
  const [viewData, setviewData] = useState<IResOpenApiDetail>({
    api_key: '',
    api_name: '',
    is_readonly: 0,
    api_secret: '',
    ips: []
  });
  const { mode } = queryString.parse(window.location.search);
  const t = useFm();
  const { locale, push } = useRouter();

  const handleOk = () => {
    handleCancel();
  };

  const getDetailData = async () => {
    if (mode === 'create') {
      setviewData(curKeyDetail);
    } else {
      const res = await getOpenApiKeyDetail({ id: curKeyDetail.id });
      setviewData(res);
    }
  };

  useEffect(() => {
    if (isApiModalOpen) {
      // fetch api curKeyDetail
      getDetailData();
    }
  }, [isApiModalOpen]);
  const handleConfirm = () => {
    if (isRedirect) {
      push({
        pathname: `/${locale}${basePath}/api-management`
      });
    }
    handleCancel();
  };

  return (
    <Modal
      title={mode === 'create' ? t('view-title-created') : t('view-title')}
      open={isApiModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      wrapClassName={Style.modalWrap}
      width={424}
      footer={null}
    >
      <div className={Style.apiContainer}>
        <div className={Style.apiItem}>
          <span className={Style.apiItemTitle}>{t('apiMgTable-name')}</span>
          <span className={Style.apiItemContent}>{viewData.api_name}</span>
        </div>
        <div className={Style.apiItem}>
          <span className={Style.apiItemTitle}>{t('apiMgTable-key')}</span>
          <span className={Style.apiItemContent}>
            <span>{viewData.api_key}</span>
            <CopyOutlined
              style={{ color: '#8C8C8C', marginLeft: '8px' }}
              onClick={() => {
                copy(viewData.api_key);
                message.success(t('copyTips'));
              }}
            />
          </span>
        </div>
        <div className={Style.apiItem}>
          <span className={Style.apiItemTitle}>
            {t('apiMgTable-permissions')}
          </span>
          <span className={Style.apiItemContent}>
            {viewData.is_readonly === 1
              ? t('permission-reading')
              : `${t('permission-reading')}, ${t('permission-trading')}`}
          </span>
        </div>
        <div className={Style.apiItem}>
          <span className={Style.apiItemTitle}>{t('secretKey')}</span>
          <span className={Style.apiItemContent}>
            {viewData.api_secret || '******'}
            {viewData.api_secret ? (
              <CopyOutlined
                style={{ color: '#8C8C8C', marginLeft: '8px' }}
                onClick={() => {
                  copy(viewData.api_secret);
                  message.success(t('copyTips'));
                }}
              />
            ) : null}
          </span>
        </div>

        <div className={Style.apiItem}>
          <span className={Style.apiItemTitle}>{t('ip-address')}</span>
          <p className={Style.apiItemContent}>
            {viewData.ips[0] === '*' ? '-' : viewData.ips?.join(', ')}
          </p>
        </div>
      </div>
      <Button type="primary" style={{ width: '100%' }} onClick={handleConfirm}>
        {t('confirmBtn')}
      </Button>
    </Modal>
  );
};

export default ViewApiModal;
