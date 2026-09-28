// @ts-nocheck
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';
import dynamic from 'next/dynamic';
import { Button, Modal, Input, Upload, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { basePath } from '@better-bit-fe/base-utils';
import { LoadingOutlined } from '@ant-design/icons';
import { postProfileUpdate } from '~/api';
import { Env } from '@region-lib/env';
import Style from './index.module.less';
import {ReactComponent as EditIcon} from '~/public/images/edit.svg';

const { API_HOST } = Env;
const ImgCrop2 = dynamic(() => import('antd-img-crop'), { ssr: false });

const EditProfileModal: React.FC = (props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickName, setNickName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { userInfo, updateUserInfo } = useUserInfo();
  const t = useFm();

  function changeEditModalVisible(visible: boolean) {
    setIsModalOpen(visible);
  }

  useEffect(() => {
    if (isModalOpen) {
      setNickName(userInfo?.nick_name);
      setAvatarUrl(
        userInfo?.avatar
          ? userInfo?.avatar
          : basePath + '/images/default-avatar.svg'
      );
    }
  }, [isModalOpen, userInfo?.avatar, userInfo?.nick_name]);

  const uploadProps = {
    name: 'avatar',
    multiple: false,
    accept: '.png,.jpg,.jpeg',
    action: `${API_HOST}/user/private/v3/upload`,
    showUploadList: false,
    onChange({ file }) {
      const { status, response } = file;
      if (status === 'uploading') {
        setUploading(true);
        return;
      }
      if (status === 'done') {
        if (response?.code == 0) {
          setAvatarUrl(response.data);
          message.success(t('uploadSuccess'));
        } else {
          message.error(t(response?.code) || t('default'));
        }
        setUploading(false);
        return;
      }
      if (status === 'error') {
        setUploading(false);
        message.error(t('uploadFailed'));
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  async function handleConfirm() {
    if (nickName?.length > 20) {
      message.warning('Nickname should be limited to 20 characters or less');
      return;
    }
    const nickNameChanged = nickName !== userInfo?.nick_name;
    const avatarChanged =
      avatarUrl !== userInfo?.avatar &&
      avatarUrl !== `${basePath}/images/default-avatar.svg`;

    if (!nickNameChanged && !avatarChanged) {
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    try {
      // 昵称、头像共用同一接口但需分参调用，不可合并为一次请求
      if (nickNameChanged) {
        await postProfileUpdate({ nick_name: nickName });
      }
      if (avatarChanged) {
        await postProfileUpdate({ avatar: avatarUrl });
      }
      await updateUserInfo();
      message.success(t('setupTips'));
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  useImperativeHandle(ref, () => ({
    changeEditModalVisible
  }));

  return (
    <Modal
      width={424}
      title={t('EditProfileModal-title', '编辑个人资料')}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={
        <div className={Style.btnRow}>
          <Button className={Style.secondaryButton} type="primary" onClick={handleCancel}>{t('cancelBtn')}</Button>
          <Button className={Style.primaryButton} type="primary" onClick={handleConfirm} loading={saving}>
            {t('saveBtn')}
          </Button>
        </div>
      }
      className={Style.editProfileModal}
    >
      <div className={Style.avatarSection}>
        <ImgCrop2
          rotationSlider
          resize
          modalTitle={t('EditAvatarModal-title')}
          modalOk={t('saveBtn')}
          modalCancel={t('cancelBtn')}
        >
          <Upload {...uploadProps}>
            <div className={Style.avatarContainer}>
              <img
                className={Style.avatarImg}
                src={avatarUrl}
                alt="avatar"
              />
              <div
                className={`${Style.avatarEditMask} ${uploading ? Style.uploading : ''}`}
              >
                {uploading ? (
                  <LoadingOutlined className={Style.editIcon} />
                ) : (
                  <EditIcon className={Style.editIcon} />
                )}
              </div>
            </div>
          </Upload>
        </ImgCrop2>
        <div className={Style.avatarTip}>{t('modifiedTip')}</div>
      </div>
      <div className={Style.nickNameSection}>
        <div className={Style.label}>{t('AccountInfo-title-item3')}</div>
        <Input
          className="h-12! bg-fill-input! global-input-style"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
          placeholder={
            userInfo?.nick_name ? t('editModal-placeholder') : ''
          }
          maxLength={20}
        />
      </div>
    </Modal>
  );
};

export default forwardRef(EditProfileModal);
