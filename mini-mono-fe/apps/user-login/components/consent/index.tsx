import React, { useEffect, useState } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { logout, getAuthorize, postAuthorizeConfirm } from '~/api';
import { ReactComponent as CheckIcon } from '~/public/images/done.svg';
import { ReactComponent as ArrowRight } from '~/public/images/arrow-right.svg';
import { ReactComponent as BrandMarkIcon } from '~/public/images/consent-brand.svg';
import { ReactComponent as LinkIcon } from '~/public/images/consent-link.svg';
import { ReactComponent as ApiIcon } from '~/public/images/consent-api.svg';
import { ReactComponent as UserInfoIcon } from '~/public/images/consent-user.svg';
import Styles from './index.module.less';
import { useRouter } from 'next/dist/client/router';
import { message } from 'antd';

export interface IConsentPermission {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface IConsentProps {
  appName?: string;
  permissions?: IConsentPermission[];
}

export default function Consent(props: IConsentProps) {
  const t = useFm();
  const {
    appName = 'third',
    permissions,
  } = props;
  const { userInfo, isLogin } = useUserInfo();
  const [requestId, setRequestId] = useState<string | undefined>(undefined);
  const [avatarLogo, setAvatarLogo] = useState<string | undefined>(undefined);
  const router = useRouter();
  const defaultPermissions: IConsentPermission[] = [
    {
      key: 'api',
      icon: <ApiIcon className={Styles.itemIcon} />,
      title: t('consent-api-title'),
      description: t('consent-api-desc')
    },
    {
      key: 'user-info',
      icon: <UserInfoIcon className={Styles.itemIcon} />,
      title: t('consent-user-info-title'),
      description: t('consent-user-info-desc')
    }
  ];

  const list = permissions?.length ? permissions : defaultPermissions;

  const onSwitchAccount = async () => {
    await logout();
    // Redirect to login page or perform other actions after logout
    window.location.pathname = `/${router.locale}/account/login`;
  };

  const onConfirm = async () => {
    if (requestId) {
      try {
        const res = await postAuthorizeConfirm({ request_id: requestId });
        console.log('Authorization confirmed:', res);
        message.success(t('consent-confirm-success'));
        const redirect_uri = res.redirect_uri;
        if (redirect_uri) {
          window.location.href = redirect_uri;
        }
      } catch (error) {
        console.log('Failed to confirm authorization:', error);
      }
    }
  };

  const getAuthInfo = async () => {
    const params = router.query;
    try {
      const res = await getAuthorize(params);
      setRequestId(res.request_id);
      setAvatarLogo(res.avatar_url);
    } catch (error) {
      console.error('Failed to get authorization info:', error);
    }
  };

  useEffect(() => {
    if (isLogin === false) {
      router.push(`/${router.locale}/account/login?${new URLSearchParams(router.query as any).toString()}`);
      return;
    }
  }, [isLogin]);

  useEffect(() => {
    if (router.isReady) {
      getAuthInfo();
    }
  }, [router.isReady]);

  return (
    <div className={Styles.consentContainer}>
      <img className={Styles.brand} src="/static/image/header/brand.svg" alt="brand" />
      <div className={Styles.card}>
        <div className={Styles.title}>{t('consent-title')}</div>

        <div className={Styles.avatarRow}>
          <div className={Styles.brandAvatar}>
            <BrandMarkIcon className={Styles.brandMark} />
          </div>
          <div className={Styles.linkAvatar}>
            <LinkIcon className={Styles.linkIcon} />
          </div>
          <div className={Styles.appAvatar}>
            <img src={avatarLogo} alt={appName} />
          </div>
        </div>

        {isLogin && (
          <div className={Styles.accountRow}>
            <span className={Styles.accountText}>{userInfo?.username}</span>
            <span className={Styles.accountTag}>{t('consent-master-account')}</span>
          </div>
        )}

        {isLogin && (
          <div className={Styles.switchAccount} onClick={onSwitchAccount}>
            <span>{t('consent-switch-account')}</span>
            <ArrowRight className='ml-[4px]' />
          </div>
        )}

        <div className={Styles.permissionList}>
          {list.map((item) => (
            <div className={Styles.permissionItem} key={item.key}>
              <div className={Styles.itemIconWrap}>{item.icon}</div>
              <div className={Styles.itemBody}>
                <div className={Styles.itemTitle}>{item.title}</div>
                <div className={Styles.itemDesc}>{item.description}</div>
              </div>
              <CheckIcon className={Styles.itemCheck} />
            </div>
          ))}
        </div>

        <button className={Styles.confirmBtn} onClick={onConfirm}>
          {t('consent-confirm-btn')}
        </button>
      </div>
    </div>
  );
}
