// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Breadcrumb, Spin, Modal, Button } from 'antd';
import Router from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import ApiTableList from '~/components/apiTableList';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Style from './index.module.less';

interface IApiMgContainerProps { }

const ApiMgContainer: React.FC<IApiMgContainerProps> = (props) => {
  const t = useFm();
  const [loading, setloading] = useState(true);
  const [isModalOpen, setisModalOpen] = useState(false);
  const { userInfo } = useUserInfo();
  const handleCancel = () => {
    setisModalOpen(false);
  };

  const handleConfirm = () => {
    window.location.href = `/${Router.locale}/setting`;
    handleCancel();
  };
  useEffect(() => {
    setloading(false);
  }, []);
  useEffect(() => {
    if (userInfo && !userInfo?.google2fa_is_enabled) {
      setisModalOpen(true);
    }
  }, [userInfo]);
  return (
    <div className={Style.MgContainer}>
      {loading ? (
        <div className={Style.loadingContainer}>
          <Spin
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: 48
                }}
              />
            }
            style={{ color: 'var(--fill-button-brand-default)' }}
          />
        </div>
      ) : (
        <>
          <Breadcrumb
            items={[
              {
                title: t('page-title')
              },
              {
                title: t('apiMgTitle')
              }
            ]}
          />
          <ApiTableList />
          <Modal
            title=""
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={400}
            wrapClassName={Style.modalWrap}
          >
            <div className={Style.modalContainer}>
              <ExclamationCircleOutlined style={{ fontSize: '64px' }} />
              <p
                className={Style.content}
                dangerouslySetInnerHTML={{ __html: t('tips-2fa') }}
              ></p>
              <Button
                style={{ width: '100%' }}
                type="primary"
                onClick={handleConfirm}
              >
                {t('confirmBtn')}
              </Button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default ApiMgContainer;
