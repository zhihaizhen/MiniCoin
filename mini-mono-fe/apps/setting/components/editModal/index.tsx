// @ts-nocheck
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';
import Image from 'next/image';
import { Button, Modal, Input, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { basePath } from '@better-bit-fe/base-utils';
import { postProfileUpdate, postFetchSymbolList } from '~/api';
import Style from './index.module.less';

type ModalType = 'nickName' | 'avatar';

const EditModal: React.FC = (props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<string>('nickName');
  const [inpVal, setinpVal] = useState<string>('');
  const [coinUrl, setcoinUrl] = useState<string>(
    basePath + '/images/default-avatar.svg'
  );
  const { userInfo, updateUserInfo } = useUserInfo();
  const t = useFm();
  function changeEditModalVisible(visible: boolean, type?: ModalType) {
    setIsModalOpen(visible);
    setType(type);
  }

  function handleChange(Event) {
    setinpVal(Event.target.value);
  }
  async function handleClick() {
    if (type === 'nickName') {
      if (inpVal?.length > 20) {
        message.warning('Nickname should be limited to 20 characters or less');
        return;
      }
      await postProfileUpdate({ nick_name: inpVal });
    } else {
      await postProfileUpdate({ avatar: coinUrl });
    }
    await updateUserInfo();
    setIsModalOpen(false);
  }

  const handleGenerateClick = async () => {
    const { LinearPerpetual } = await postFetchSymbolList();
    const randomPick =
      LinearPerpetual[Math.floor(Math.random() * LinearPerpetual?.length)];
    const coin = randomPick?.baseCurrency?.toLowerCase();
    const randomAvatar = `https://cdn.easicoin.io/static/app/images/coin/${coin}.png`;
    setcoinUrl(randomAvatar);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setinpVal('');
  };

  useEffect(() => {
    if (isModalOpen) {
      setinpVal(userInfo?.nick_name);
      setcoinUrl(
        userInfo?.avatar
          ? userInfo?.avatar
          : basePath + '/images/default-avatar.svg'
      );
    }
  }, [isModalOpen, userInfo?.avatar, userInfo?.nick_name]);

  useImperativeHandle(ref, () => ({
    changeEditModalVisible
  }));
  return (
    <Modal
      width={424}
      title={
        type === 'nickName'
          ? t('changeNameModal-title')
          : t('EditAvatarModal-title')
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={
        <div className={Style.btnRow} >
          <Button onClick={handleCancel}>{t('cancelBtn')}</Button>
          <Button onClick={handleClick} type="primary">
            {t('saveBtn')}
          </Button>
        </div >
      }
      className={Style.editModal}
    >
      {type === 'nickName' ? (
        <Input
          value={inpVal}
          onChange={handleChange}
          className={Style['editModal-inp']}
          placeholder={userInfo?.nick_name ? t('editModal-placeholder') : ''}
          maxLength={20}
        />
      ) : (
        <div className={Style.avatarContainer} onClick={handleGenerateClick}>
          <img
            src={coinUrl}
            alt="avatarImg"
            style={{ width: '80px', height: '80px' }}
          />
          <div className={Style.avatarBtn}>
            <Image
              alt="avatarImg"
              src={basePath + '/images/btnImage.svg'}
              width={24}
              height={24}
            />
            <span className={Style.txt}>
              {t('EditAvatarModal-generateBtn')}
            </span>
          </div>
        </div>
      )}
    </Modal >
  );
};

export default forwardRef(EditModal);
