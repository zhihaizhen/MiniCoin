// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Breadcrumb, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import queryString from 'query-string';
import { useFm } from '@better-bit-fe/base-hooks';
import CreateApiForm from '~/components/createApiForm';
import Style from './index.module.less';

interface IApiMgCreateContainerProps { }

const ApiMgCreateContainer: React.FC<IApiMgCreateContainerProps> = (props) => {
  const router = useRouter();
  const t = useFm();
  const [curMode, setcurMode] = useState<string>('');
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const { mode } = queryString.parse(window.location.search);
    setcurMode(mode);
    setloading(false);
  }, []);

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
                title: t('apiMgTitle'),
                href: `/${router.locale}/setting/api-management`
              },
              {
                title: curMode === 'edit' ? t('edit-title') : t('create-title')
              }
            ]}
          />
          <div className={Style.content}>
            <div className={Style.title}>
              {curMode === 'edit' ? t('edit-title') : t('create-title')}
            </div>
            <div
              className={Style.desc}
              dangerouslySetInnerHTML={{ __html: t('create-desc') }}
            ></div>
            <CreateApiForm />
          </div>
        </>
      )}
    </div>
  );
};

export default ApiMgCreateContainer;
