//@ts-nocheck

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { Layout, Menu, ConfigProvider } from 'antd';
import { basePath } from '~/env';
import { ReactComponent as DashboardSvg } from '~/public/images/menu/dashboard.svg';
import { ReactComponent as SettingSvg } from '~/public/images/menu/setting.svg';
import { ReactComponent as KycSvg } from '~/public/images/menu/kyc.svg';
import { ReactComponent as SafeSvg } from '~/public/images/menu/safe.svg';
import { ReactComponent as ApiSvg } from '~/public/images/menu/apis.svg';
import Styles from './index.module.less';
import { getLang } from '@better-bit-fe/base-utils';

interface SettingLayoutProps {
  children: React.ReactNode;
}

const MENU_KEYS = ['dashboard', 'account-safe', 'kyc', 'basic', 'newapi'] as const;

const getSelectedKey = (pathname = '') => {
  if (pathname.includes('/change-password')) {
    return 'account-safe';
  }
  return MENU_KEYS.find((key) => pathname.includes(key)) || 'dashboard';
};

const SettingLayout: React.FC<SettingLayoutProps> = ({ children }) => {
  const t = useFm();
  const router = useRouter();
  const curLang = getLang();
  const [selectedKey, setSelectedKey] = useState(() =>
    getSelectedKey(router.pathname)
  );

  const items = useMemo(() => {
    return [
      {
        key: 'dashboard',
        icon: <DashboardSvg />,
        label: t('dashboard')
      },
      {
        key: 'account-safe',
        icon: <SafeSvg />,
        label: t('safeCenter')
      },
      {
        key: 'kyc',
        icon: <KycSvg />,
        label: t('setting.idAuth')
      },
      {
        key: 'newapi',
        icon: <ApiSvg />,
        label: t('API Keys')
      },
      {
        key: 'basic',
        icon: <SettingSvg />,
        label: t('page-title')
      },
    ];
  }, [t]);

  useEffect(() => {
    setSelectedKey(getSelectedKey(router.pathname));
  }, [router.pathname]);

  // 预取侧栏路由，减少切换白屏/抖动
  useEffect(() => {
    MENU_KEYS.forEach((key) => {
      router.prefetch(`/${curLang}${basePath}/${key}`);
    });
  }, [curLang, router]);

  const handleSwitchMenu = useCallback(
    ({ key }) => {
      if (key === selectedKey) return;
      // 先更新选中态，避免等路由完成才高亮造成闪动
      setSelectedKey(key);
      router.push(`/${curLang}${basePath}/${key}`);
    },
    [curLang, router, selectedKey]
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ABE127',
          colorTextLightSolid: '#101112'
        },
        components: {
          Button: {
            primaryColor: '#101112'
          },
          Checkbox: {
            colorPrimary: '#ABE127',
            colorPrimaryHover: '#ABE127',
            colorWhite: '#101112'
          }
        }
      }}
    >
      <Layout className={`${Styles.page} setting-layout`} hasSider>
        <Menu
          className={Styles.menu}
          style={{
            position: 'sticky',
            top: 0,
            width: 248,
            flexShrink: 0,
            padding: '16px',
            overflowY: 'auto'
          }}
          mode="inline"
          theme="light"
          onClick={handleSwitchMenu}
          items={items}
          selectedKeys={[selectedKey]}
        />
        <div className={Styles.content}>{children}</div>
      </Layout>
    </ConfigProvider>
  );
};

export default SettingLayout;
