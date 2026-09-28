//@ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { getItem } from '~/utils/menu';
import { useRouter } from 'next/router';
import { Layout, Menu } from 'antd';
import { basePath } from '~/env';
import Styles from './index.module.less';
import { isMobile, isPC, getLang } from '@better-bit-fe/base-utils';

const { Sider, Content } = Layout;

const SettingLayout: React.FC = ({ children }) => {
  const t = useFm();
  const router = useRouter();
  const [defaultKey, setDefaultKeys] = useState();
  // 服务端 isPC() 恒为 false，客户端为 true；必须等挂载后再渲染，否则会 hydration mismatch
  const [showMenu, setShowMenu] = useState(false);
  const curLang = getLang();

  useEffect(() => {
    setShowMenu(isPC());
  }, []);

  const items = useMemo(() => {
    // 仅客户端会真正渲染菜单；此处兜底避免 SSR 访问 location
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    return [
      {
        key: 'position',
        label: (
          <a
            href={`${origin}/${curLang}${basePath}/position`}
            style={{ display: 'block', marginLeft: '24px' }}
          >
            {t('position-level-title')}
          </a>
        )
      },
      {
        key: 'split-symbol-params',
        label: (
          <a
            href={`${origin}/${curLang}${basePath}/split-symbol-params`}
            style={{ display: 'block', marginLeft: '24px' }}
          >
            {t('split-symbol-params-title')}
          </a>
        )
      },

      {
        key: 'price',
        label: (
          <a
            href={`${origin}/${curLang}${basePath}/price`}
            style={{ display: 'block', marginLeft: '24px' }}
          >
            {t('history-price-tag')}
          </a>
        )
      },
      {
        key: 'indexPrice',
        label: (
          <a
            href={`${origin}/${curLang}${basePath}/indexPrice`}
            style={{ display: 'block', marginLeft: '24px' }}
          >
            {t('index-price-tag', '指数价格')}
          </a>
        )
      },
      {
        key: 'fundfee',
        label: (
          <a
            href={`${origin}/${curLang}${basePath}/fundfee`}
            style={{ display: 'block', marginLeft: '24px' }}
          >
            {t('fundfee-title')}
          </a>
        )
      },
      {
        key: 'risk-reserve',
        label: (
          <a
            href={`${origin}/${curLang}${basePath}/risk-reserve`}
            style={{ display: 'block', marginLeft: '24px' }}
          >
            {t('risk-reserve-title')}
          </a>
        )
      }
    ];
  }, [defaultKey, t, curLang]);

  useEffect(() => {
    // 优先最长 key，避免 /indexPrice 误命中 price
    const matched = [...items]
      .sort((a, b) => b.key.length - a.key.length)
      .find((it) => router.pathname.includes(it.key));
    if (matched) {
      setDefaultKeys(matched.key);
    }
  }, []);
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleSwitchMenu = ({ key }) => {
    router.push(`/${curLang}${basePath}/${key}`, undefined, { shallow: true });
  };

  // 首屏 SSR / hydration 阶段统一返回 null，挂载后再按设备决定是否展示菜单
  if (!showMenu || isMobile()) {
    return children ? <div>{children}</div> : null;
  }

  return (
    <div className={Styles.menu}>
      <Menu
        mode="inline"
        theme="light"
        onClick={handleSwitchMenu}
        inlineCollapsed={collapsed}
        items={items}
        selectedKeys={[defaultKey]}
      />
    </div>
    // <Layout className={Styles.page} hasSider={true}>
    //   <Sider theme="light" trigger={null} collapsible collapsed={collapsed}>
    //     <div onClick={toggleCollapsed} className={Styles.collapsedIcon}>
    //       {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
    //     </div>
    //     <Menu
    //       mode="inline"
    //       theme="light"
    //       onClick={handleSwitchMenu}
    //       inlineCollapsed={collapsed}
    //       items={items}
    //       selectedKeys={[defaultKey]}
    //     />
    //   </Sider>
    //   <Content>{children}</Content>
    // </Layout>
  );
};

export default SettingLayout;
