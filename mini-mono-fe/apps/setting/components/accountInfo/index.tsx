//@ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Drawer } from 'antd';
import copy from 'copy-to-clipboard';
import {
  CheckCircleOutlined,
  EditOutlined,
  CopyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useFm } from '@better-bit-fe/base-hooks';
import { formatAddress } from '@betterbit-library/tools';
import { ENV, basePath } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import TwoFa from '~/components/2fa';
import BindEmail from '~/components/bindEmail';
import EditModal from '~/components/editModal';
import EditAvatarModal from '~/components/editAvatarModal';
import { bot_id } from '~/constant';
import { postBindTg } from '~/api';
import Style from './index.module.less';

const AccountInfo: React.FC = (props) => {
  const t = useFm();
  const bindEmailRef = useRef();
  const TwoFaRef = useRef();
  const editModalRef = useRef();
  const editAvatarModalRef = useRef();
  const { userInfo, isLogin, updateUserInfo } = useUserInfo();
  const [loginType, setloginType] = useState<1 | 2 | 3>(); //1-email, 2-wallet 3-media
  const [accountInfo, setaccountInfo] = useState({
    uid: {
      title: '',
      value: ''
    },
    walletAddress: {
      title: '',
      value: ''
    },
    nickName: {
      title: '',
      value: ''
    },
    avatar: {
      title: '',
      value: ''
    }
  });
  const [openWallet, setopenWallet] = useState(false);
  const [particleWalletUrl, setparticleWalletUrl] = useState('');
  function setUp2fa() {
    if (!isLogin) return;
    TwoFaRef.current.setUp2fa();
  }

  function handleUnbind2fa() {
    if (!isLogin) return;
    TwoFaRef.current.changeUnbindModalVisible(true, '2fa');
  }

  function setupEmail(updateEmail = false) {
    if (!isLogin) return;
    bindEmailRef.current.changeModalVisible(true, updateEmail);
  }

  function initLoginType() {
    if (userInfo?.is_web2) {
      if (userInfo?.vague_email) {
        //email user
        setloginType(1);
      } else {
        //media user
        //tips for binding email
        setloginType(3);
      }
    } else {
      // wallet user
      // sign message
      setloginType(2);
    }
  }

  function handleEdit(type: string) {
    if (!isLogin) return;
    if (getCanEdit(userInfo.nick_name_last_updated_at)) {
      editModalRef.current.changeEditModalVisible(true, type);
    }
  }

  function getCanEdit(time) {
    const today = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const lastDay = dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss');
    const intervalDay = dayjs(today).diff(lastDay, 'day');
    if (intervalDay < 7) {
      message.error(t('modifiedTip'));
      return false;
    }
    return true;
  }

  function handleAvatarEdit() {
    if (!isLogin) return;
    if (getCanEdit(userInfo.avatar_last_updated_at)) {
      editAvatarModalRef.current.changeEditModalVisible(true);
    }
  }

  function handleCopy(value: string) {
    if (!isLogin) return;
    copy(value);
    message.success(t('copyTips'));
  }

  function updateWalletUrl() {
    ParticleSDK?.setAuthTheme({
      uiMode: 'dark'
    });
    const url = ParticleSDK?.buildWalletUrl({
      //optional: left top menu style, close or fullscreen
      //"fullscreen": wallet will be fullscreen when user click.
      //"close": developer need handle click event
      // topMenuType: 'close',
    });
    setparticleWalletUrl(url);
  }

  async function handleOpenWallet() {
    setopenWallet(true);
    if (window?.ParticleSDK) {
      if (ParticleSDK?.auth?.isLogin()) {
        updateWalletUrl();
      } else {
        const jwt = JSON.parse(
          localStorage.getItem('dex:address')
        )?.particle_token;
        if (!jwt) return;
        const particleUserInfo = await window?.ParticleSDK?.auth?.login(
          jwt
            ? {
              preferredAuthType: 'jwt',
              account: jwt,
              hideLoading: true
            }
            : undefined
        );
        updateWalletUrl();
      }
    }
  }

  function unbindTgAuth() {
    if (!isLogin) return;
    TwoFaRef.current.changeUnbindModalVisible(true, 'tg');
  }

  const tgAuth = function () {
    if (!isLogin) return;
    if (typeof window !== 'undefined') {
      window?.Telegram?.Login?.auth(
        {
          bot_id: bot_id[ENV],
          request_access: true
        },
        async (data) => {
          if (!data) return;
          await postBindTg(data);
          updateUserInfo();
        }
      );
    }
  };

  const onClose = () => {
    setopenWallet(false);
  };

  useEffect(() => {
    initLoginType();
    const updateInfo = {
      uid: {
        title: t('AccountInfo-title-item1'),
        value: userInfo?.id,
        icon: userInfo?.id ? (
          <CopyOutlined
            width={16}
            height={16}
            className={Style.icon}
            onClick={() => handleCopy(userInfo?.id)}
          />
        ) : null
      },
      walletAddress: {
        title: t('AccountInfo-title-item2'),
        value: formatAddress(userInfo?.address),
        icon: userInfo?.address ? (
          <CopyOutlined
            width={16}
            height={16}
            className={Style.icon}
            onClick={() => handleCopy(userInfo?.address)}
          />
        ) : null
      },
      nickName: {
        title: t('AccountInfo-title-item3'),
        value: userInfo?.nick_name,
        icon: (
          <EditOutlined
            width={16}
            height={16}
            className={Style.icon}
            onClick={() => handleEdit('nickName')}
          />
        )
      },
      avatar: {
        title: t('AccountInfo-title-item4'),
        value: (
          <img
            src={
              userInfo?.avatar
                ? userInfo?.avatar
                : basePath + '/images/default-avatar.svg'
            }
            alt="avatar"
            style={{ width: '24px', height: '24px', verticalAlign: 'middle' }}
          />
        ),
        icon: (
          <EditOutlined
            width={16}
            height={16}
            className={Style.icon}
            style={{ verticalAlign: 'middle' }}
            onClick={handleAvatarEdit}
          />
        )
      }
    };
    setaccountInfo(updateInfo);
  }, [userInfo]);

  useEffect(() => {
    const trigger2fa = new URLSearchParams(window.location.search).get('2fa');
    if (trigger2fa == 1 && loginType) {
      setTimeout(() => {
        setUp2fa();
      }, 1000);
    }
  }, [loginType]);

  return (
    <div className={Style.accountInfo}>
      <Drawer
        title=""
        placement="right"
        width={400}
        onClose={onClose}
        open={openWallet}
      >
        <iframe
          // src={`https://wallet.particle.network/?t=${+new Date()}&theme=dark`}
          src={particleWalletUrl}
          frameborder="0"
          style={{ height: '100%', width: '100%' }}
          allow="camera"
        ></iframe>
      </Drawer>
      <div className={Style.info}>
        <div className={Style.title}>{t('AccountInfo-title')}</div>
        <ul className={Style.content}>
          {Object.entries(accountInfo)?.map((item, index) => (
            <li key={index}>
              <span>{item[1]?.title}</span>
              <span>
                <span className={Style.walletInfo}>
                  {item[1]?.value}
                  {item[1]?.icon}
                </span>
                <span className={Style.ctaContainer}>
                  {item[0] === 'walletAddress' && userInfo?.wallet_type !== 1 && (
                    <Button
                      className={Style['accountInfo-btn']}
                      onClick={() => handleOpenWallet()}
                    >
                      {t('AccountInfo-openWallet')}
                    </Button>
                  )}
                </span>
              </span>
            </li>
          ))}
          <li>
            <span>{t('AccountInfo-title-item5')}</span>
            {userInfo?.vague_email ? (
              <div>
                <span>{userInfo?.vague_email}</span>
                <span className={Style.ctaContainer}>
                  <Button
                    className={Style['accountInfo-btn']}
                    type="primary"
                    onClick={() => setupEmail(true)}
                  >
                    {t('AccountInfo-changeBtn')}
                  </Button>
                </span>
              </div>
            ) : (
              <div>
                <span>{t('AccountInfo-notSet')}</span>
                <span className={Style.ctaContainer}>
                  <Button
                    className={Style['accountInfo-btn']}
                    type="primary"
                    onClick={() => setupEmail()}
                  >
                    {t('AccountInfo-setBtn')}
                  </Button>
                </span>
              </div>
            )}
          </li>
          {loginType !== 2 && isLogin ? (
            <li>
              <span>{t('AccountInfo-title-item6')}</span>
              {userInfo?.google2fa_is_enabled ? (
                <div>
                  <span>
                    <CheckCircleOutlined
                      width={12}
                      height={12}
                      style={{ color: 'var(--fill-button-brand-default)', marginRight: '4px' }}
                    />
                    {t('AccountInfo-bound')}
                  </span>
                  <span className={Style.ctaContainer}>
                    <Button
                      className={Style['accountInfo-btn']}
                      type="primary"
                      onClick={handleUnbind2fa}
                    >
                      {t('AccountInfo-unbindBtn')}
                    </Button>
                  </span>
                </div>
              ) : (
                <div>
                  <span>{t('AccountInfo-notSet')}</span>
                  <span className={Style.ctaContainer}>
                    <Button
                      className={Style['accountInfo-btn']}
                      type="primary"
                      onClick={setUp2fa}
                    >
                      {t('AccountInfo-setBtn')}
                    </Button>
                  </span>
                </div>
              )}
            </li>
          ) : null}
        </ul>
      </div>
      {userInfo?.wallet_type !== 1 ? (
        <div className={Style.info}>
          <div className={Style.title}>{t('socialAccount-title')}</div>
          <ul className={Style.content}>
            <li>
              <div className={Style.mediaTitle}>
                <Image
                  width={24}
                  height={24}
                  alt="telegram"
                  src={basePath + '/images/telegram.svg'}
                />
                <span>Telegram</span>
              </div>

              <div>
                {userInfo?.user_id_telegram ? (
                  <div>
                    <span>{userInfo?.user_name_telegram}</span>
                    <span className={Style.ctaContainer}>
                      <Button
                        className={`${Style['accountInfo-btn']} ${Style.changebtn}`}
                        onClick={unbindTgAuth}
                        disabled={!userInfo?.vague_email}
                      >
                        {t('AccountInfo-unbindBtn')}
                      </Button>
                    </span>
                  </div>
                ) : (
                  <div>
                    <span>{t('AccountInfo-noBound')}</span>
                    <span className={Style.ctaContainer}>
                      <Button
                        className={Style['accountInfo-btn']}
                        type="primary"
                        onClick={tgAuth}
                      >
                        {t('AccountInfo-bindBtn')}
                      </Button>
                    </span>
                  </div>
                )}
              </div>
            </li>
          </ul>
        </div>
      ) : null}

      <TwoFa ref={TwoFaRef} loginType={loginType} />
      <BindEmail ref={bindEmailRef} />
      <EditModal ref={editModalRef} />

      <EditAvatarModal ref={editAvatarModalRef} />
    </div>
  );
};

export default AccountInfo;
