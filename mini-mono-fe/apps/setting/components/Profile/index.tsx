// @ts-nocheck
import React, { useRef } from 'react';
import { Button, message } from 'antd';
import dayjs from 'dayjs';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { basePath } from '@better-bit-fe/base-utils';
import SettingCard, { SettingRow } from '~/components/SettingCard';
import EditProfileModal from '~/components/editProfileModal';
import Style from './index.module.less';

const Profile: React.FC = () => {
  const t = useFm();
  const editProfileModalRef = useRef();
  const { userInfo, isLogin } = useUserInfo();

  function getCanEdit(time) {
    if (!time) return true;

    const today = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const lastDay = dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss');
    const intervalDay = dayjs(today).diff(lastDay, 'day');
    if (intervalDay < 7) {
      message.error(t('modifiedTip'));
      return false;
    }
    return true;
  }

  function handleEditProfile() {
    if (!isLogin) return;
    // 与 dashboard 一致：昵称/头像共用 7 天限制（取最近一次修改时间）
    const time =
      userInfo?.nick_name_last_updated_at || userInfo?.avatar_last_updated_at;
    if (getCanEdit(time)) {
      editProfileModalRef.current.changeEditModalVisible(true);
    }
  }

  return (
    <SettingCard title={t('personal-profile', 'Profile')}>
      <SettingRow
        label={t('AccountInfo-title-item3')}
        desc={t('nickname-desc', 'Set a custom nickname for your profile.')}
      >
        <span className={Style.nickName}>{userInfo?.nick_name}</span>
        <Button
          className={Style.secondaryButton}
          type="primary"
          onClick={handleEditProfile}
        >
          {t('AccountInfo-changeBtn')}
        </Button>
      </SettingRow>
      <SettingRow
        label={t('AccountInfo-title-item4')}
        desc={t('avatar-desc', 'Set an avatar to personalize your account.')}
      >
        <img
          className={Style.avatar}
          src={
            userInfo?.avatar
              ? userInfo?.avatar
              : basePath + '/images/default-avatar.svg'
          }
          alt="avatar"
        />
        <Button
          className={Style.secondaryButton}
          type="primary"
          onClick={handleEditProfile}
        >
          {t('AccountInfo-changeBtn')}
        </Button>
      </SettingRow>
      <EditProfileModal ref={editProfileModalRef} />
    </SettingCard>
  );
};

export default Profile;
