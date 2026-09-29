// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Table, Space, ConfigProvider, Button, Modal, message } from 'antd';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import {
  CopyOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { ENV, basePath } from '@better-bit-fe/base-utils';
import ViewApiModal from '~/components/viewApiModal';
import VerifyEmail2faModal from '~/components/verifyEmail2faModal';
import { IApiTableDataType } from '~/types';
import { postDelOpenApiKey, getOpenApiKeyList } from '~/api';
import Style from './index.module.less';

interface IApiTableListProps { }

const ApiTableList: React.FunctionComponent<IApiTableListProps> = (props) => {
  const router = useRouter();
  const t = useFm();
  const [isApiModalOpen, setisApiModalOpen] = useState<boolean>(false);
  const [curKeyDetail, setcurKeyDetail] = useState({});
  const [apiList, setapiList] = useState<IApiTableDataType[]>([]);
  const [delModalVisible, setdelModalVisible] = useState<boolean>(false);
  const verifyRef = useRef(null);
  const columns: ColumnsType<IApiTableDataType> = [
    {
      title: t('apiMgTable-name'),
      dataIndex: 'api_name',
      key: 'api_name'
      // render: (text) => <a>{text}</a>
    },
    {
      title: t('apiMgTable-key'),
      dataIndex: 'api_key',
      key: 'api_key',
      render: (val, record) => (
        <>
          <span
            style={{
              display: 'inline-block',
              minWidth: '85px'
            }}
          >
            {val.slice(0, 5) + '*****'}{' '}
          </span>
          <CopyOutlined
            style={{ color: '#8C8C8C', marginLeft: '8px' }}
            onClick={() => {
              copy(val);
              message.success(t('copyTips'));
            }}
          />
        </>
      )
    },
    {
      title: t('apiMgTable-permissions'),
      key: 'is_readonly',
      dataIndex: 'is_readonly',
      render: (val, record) => (
        <>
          {val === 1
            ? t('permission-reading')
            : `${t('permission-reading')}, ${t('permission-trading')}`}
        </>
      )
    },
    {
      title: t('apiMgTable-time'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val, record) => {
        return <>{dayjs(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</>;
      }
    },

    {
      title: t('apiMgTable-action'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <span
            className={Style.themeBtn}
            onClick={() => handleClickView(record)}
          >
            {t('action-view')}
          </span>
          <span
            className={Style.themeBtn}
            onClick={() => handleCreate('edit', record)}
          >
            {t('action-edit')}
          </span>
          <span
            className={Style.deleteBtn}
            onClick={() => handleConfirmDel(record)}
          >
            {t('action-delete')}
          </span>
        </Space>
      )
    }
  ];
  const customizeRenderEmpty = () => (
    <div style={{ textAlign: 'center' }}>
      <Image
        src={basePath + '/images/empty-box.svg'}
        alt="emptyBox"
        width={56}
        height={56}
      />
      <p>{t('empty-box')}</p>
    </div>
  );

  const handleClickView = (record: IApiTableDataType) => {
    //set keyid to query
    setcurKeyDetail(record);
    //set visible
    setisApiModalOpen(true);
  };

  const handleCreate = (
    mode: 'create' | 'edit',
    record?: IApiTableDataType
  ) => {
    // set create mode to query
    const query = mode === 'create' ? { mode } : { mode, id: record?.id };
    setcurKeyDetail(record);
    const locale = router.locale;
    router.push({
      pathname: `/${locale}${basePath}/api-management/create`,
      query
    });
  };

  const handleDelete = async (verifyVal: {
    emailCode: string;
    twoFaCode: string;
  }) => {
    await postDelOpenApiKey({
      id: curKeyDetail?.id,
      email_code: verifyVal.emailCode,
      '2fa_code': verifyVal.twoFaCode
    });
    message.success(t('tips-delete'));
    verifyRef.current?.changeModalVisible(false);
    getApiKeyList();
  };

  const handleConfirmDel = (record: IApiTableDataType) => {
    setcurKeyDetail(record);
    setdelModalVisible(true);
  };

  const getApiKeyList = async () => {
    const list: IApiTableDataType[] = await getOpenApiKeyList();
    const newList = list.map((item) => {
      return {
        ...item,
        key: item.id
      };
    });
    setapiList(newList);
  };

  useEffect(() => {
    // fetch api list
    getApiKeyList();
  }, []);

  return (
    <div className={Style.tableList}>
      <Modal
        width={400}
        title=""
        open={delModalVisible}
        onCancel={() => setdelModalVisible(false)}
        footer={null}
        wrapClassName={Style.modalWrap}
      >
        <div className={Style.deleteModalContainer}>
          <ExclamationCircleOutlined style={{ fontSize: '64px' }} />
          <p style={{ margin: '24px 0' }}>
            {t('deleteDesc').replace('{value}', curKeyDetail?.api_name)}
          </p>
          <div className={Style.btnContainer}>
            <Button
              className={Style.calBtn}
              onClick={() => setdelModalVisible(false)}
            >
              {t('cancelBtn')}
            </Button>
            <Button
              className={Style.delBtn}
              onClick={() => {
                setdelModalVisible(false);
                verifyRef.current?.changeModalVisible(true);
              }}
            >
              {t('deleteBtn')}
            </Button>
          </div>
        </div>
      </Modal>
      <VerifyEmail2faModal ref={verifyRef} handleConfirm={handleDelete} />
      <ViewApiModal
        isApiModalOpen={isApiModalOpen}
        handleCancel={() => setisApiModalOpen(false)}
        curKeyDetail={curKeyDetail}
      />
      <div className={Style.content}>
        <div className={Style.contentTitle}>
          <div>
            <div className={Style.title}>{t('apiMgTitle')}</div>
            <p
              className={Style.desc}
              dangerouslySetInnerHTML={{ __html: t('apiMgDesc') }}
            ></p>
            <div className={Style.apiLink}>
              <a
                href={`https://www.easicoin.io/apidocs/derivatives/contract/index.html#t-authentication`}
                target="_blank"
                rel="noreferrer"
              >
                {t('view-doc-btn')}
                <RightOutlined />
              </a>
            </div>
          </div>
          <Button
            type="primary"
            onClick={() => handleCreate('create')}
            disabled={apiList?.length >= 50}
          >
            <PlusOutlined />
            {t('create-title')}
          </Button>
        </div>
        <ConfigProvider renderEmpty={customizeRenderEmpty}>
          <Table columns={columns} dataSource={apiList} pagination={false} />
        </ConfigProvider>
      </div>
    </div>
  );
};

export default ApiTableList;
