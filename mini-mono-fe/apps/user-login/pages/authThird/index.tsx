import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, theme } from 'antd';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { withLayout, } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { getLang, getQueryParams } from '@better-bit-fe/base-utils';
import Style from './index.module.less';
import queryString from 'query-string';
import { AntThemeConfig } from '~/constants';

const AuthThird = () => {
  useGlobalWidget();
  const t = useFm();
  const lang = getLang();
  const [type, setType] = useState('google');

  // 处理绑定现有账户按钮点击
  const handleLinkExistingAccount = () => {
    localStorage.setItem('loginFromAuthThird', 'true');
    // 去登录页绑定
    window.location.href = `/${lang}/account/login`;
  };

  // 处理创建新账户按钮点击
  const handleCreateNewAccount = () => {
    localStorage.setItem('loginFromAuthThird', 'true');
    // 跳转到注册页面
    window.location.href = `/${lang}/account/register`;
  };

  useEffect(() => {
    const { type } = queryString.parse(window.location.search);
    setType(type as string);
  }, []);

  return (
    <ConfigProvider theme={AntThemeConfig}>
      <div className={Style['authThirdPagePage']}>
        <div className={Style['wrapper']}>
          <div className={Style['reset-container']}>
            <div className={Style['auth-third-content']}>
              <div className={Style['header-section']}>
                <h1 className={Style['main-title']}>{t('signUpAndLinkAccount')}</h1>
                <p className={Style['subtitle']}>{type === 'google' ? t('googleBindTips') : t('appleBindTips')}</p>
              </div>

              <div className={Style['buttons-section']}>
                <Button
                  type="primary"
                  className={Style['primary-button']}
                  onClick={handleLinkExistingAccount}
                >
                  {t('linkExistingAccount')}
                </Button>

                <button
                  className={Style['secondary-button']}
                  onClick={handleCreateNewAccount}
                >
                  {t('createNewAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['user-login', 'error_code', 'footer'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png',
      path: `/${locale}/authThird/`
    }
  };
};

export default withLayout(AuthThird);
