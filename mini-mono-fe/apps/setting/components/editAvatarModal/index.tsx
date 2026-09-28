// @ts-nocheck
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef
} from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ImgCrop = dynamic(() => import('antd-img-crop'), { ssr: false });
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Button, Modal, Upload, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { basePath } from '@better-bit-fe/base-utils';
import { LoadingOutlined } from '@ant-design/icons';
import { postProfileUpdate } from '~/api';
import { Env } from '@region-lib/env';
import Style from './index.module.less';
const { API_HOST } = Env;
const { Dragger } = Upload;

const EditAvatarModal: React.FC = (props, ref) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [avatarUrl, setAvatarUrl] = useState();
  const { userInfo, updateUserInfo } = useUserInfo();
  const t = useFm();
  function changeEditModalVisible(visible: boolean) {
    setIsModalOpen(visible);
  }

  const uploadProps = {
    name: 'avatar',
    multiple: false,
    accept: '.png,.jpg,.jpeg',
    action: `${API_HOST}/user/private/v3/upload`,
    onChange({ file, fileList }) {
      const { status, response } = file;
      // 明明接口都返回回来了，但是status依然是uploading, response为undefined
      if (status === 'uploading') {
        setLoading(true);
        return;
      }
      if (status === 'done') {
        if (response?.code == 0) {
          setUploadSuccess(true);
          setAvatarUrl(response.data);
          message.success(t('uploadSuccess'));
        } else {
          message.error(t(response?.code) || t('default'));
        }
        setLoading(false);
        return;
      }
      if (status === 'error') {
        setLoading(false);
        message.error(t('uploadFailed'));
        return;
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    }
  };

  // 修改头像的接口
  async function handleConfirmClick() {
    await postProfileUpdate({ avatar: avatarUrl });
    setIsModalOpen(false);
    message.success(t('updateAvatarSuccess'));
    await updateUserInfo();
    // 修改成功之后刷新页面
  }

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      setUploadSuccess(false);
      setLoading(false);
      setAvatarUrl();
      // setAvatarUrl(userInfo?.avatar); //TODO 有头像，可以点击删除然后上传
    }
  }, [isModalOpen]);

  useImperativeHandle(ref, () => ({
    changeEditModalVisible
  }));
  return (
    <Modal
      width={424}
      title={
        <div>
          <div>{t('EditAvatarModal-title')}</div>
          <span>{t('modifiedTip')}</span>
        </div>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      wrapClassName={Style.editModalWrapper}
      className={Style.editModal}
    >
      <div className={Style.avatarContainer}>
        {/* Cropper组件跨域 */}

        {avatarUrl ? (
          <img className={Style.avatarImg} src={avatarUrl} />
        ) : (
          <ImgCrop
            rotationSlider
            resize
            modalClassName={Style.cropModalWrapper}
            modalTitle={t('EditAvatarModal-title')}
            modalOk={t('saveBtn')}
            modalCancel={t('cancelBtn')}
          >
            <Dragger {...uploadProps}>
              {loading ? (
                <div className={Style.loadingWrapper}>
                  <div>
                    <LoadingOutlined />
                  </div>
                  <div>{t('uploading')}</div>
                </div>
              ) : (
                <div>
                  <p className={Style.uploadIcon}></p>
                  <p className="ant-upload-text">{t('uploadTip')}</p>
                  <p className="ant-upload-hint">{t('uploadTypeTip')}</p>
                </div>
              )}
            </Dragger>
          </ImgCrop>
        )}
      </div>
      {uploadSuccess && (
        <div className={Style.btnWrapper}>
          <Button className={Style.cancelBtn} onClick={handleCancel}>
            {t('cancelBtn')}
          </Button>
          <Button type="primary" onClick={handleConfirmClick}>
            {t('saveBtn')}
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default forwardRef(EditAvatarModal);
