// @ts-nocheck
// import { Adjust } from '@better-bit-fe/app-bridge';
import { useQuickLogin, useUserInfo } from '@better-bit-fe/base-provider';
import { apiHost, ENV, getUserToken, isApp } from '@better-bit-fe/base-utils';
import React, { useContext, useEffect, useRef } from 'react';
import { LayoutContainerProps } from './container';
// import { AdaBot } from '../ada';
import { getJsBridgeCdn, getUniFrameCdn } from '../cdn';
import { Footer as RenderFooter } from '../footer';
import { Header as RenderHeader } from '../header';
import { injectDeepLink } from 'libs/app-bridge/src/deeplink';

async function logout(url: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { UserToken: getUserToken() }
  });
  const json = await response.json();
  if (response.ok && json.ret_code === 0) {
    return json;
  }

  throw json;
}

interface Props extends LayoutContainerProps {
  locales: string[];
}

export function Body({
  locale,
  locales,
  children,
  hasLoadUniFrame,
  hasLoadJsBridge,
  hasRenderUniFrame
}: Props) {
  const { setUserInfo, userInfo } = useUserInfo();
  const { loginSuccess, registerSuccess } = useQuickLogin();

  const container = useRef<HTMLDivElement>();

  // Logout handler for reload page
  const onLogout = () => window.location.reload();

  // Language change handler for redirect the specific locale page
  const onLanguageChange = (newLocale: string) => {
    const reg = /\/[a-z]{2,3}-[a-zA-Z0-9]{2,3}\//;
    let path = window.location.pathname;
    if (path.search(reg) === -1) {
      // local env
      path = `/${newLocale}${path}`;
    } else {
      path = path.replace(reg, `/${newLocale}/`);
    }
    window.location.href = `${path}${window.location.search}`;
  };

  // Setup user info after login or register by quick-login component
  useEffect(() => {
    if (loginSuccess || registerSuccess) {
      setUserInfo();
    }
  }, [loginSuccess, registerSuccess, setUserInfo]);

  useEffect(() => {
    if (isApp() && container.current && container.current.style) {
      container.current.style.paddingTop = '0';
    }
  }, []);

  useEffect(() => {
    hasLoadJsBridge && injectDeepLink();
  }, []);

  return (
    <>
      {hasLoadUniFrame && <script src={getUniFrameCdn()} />}
      {hasLoadJsBridge && <script src={getJsBridgeCdn()} />}
      {hasLoadUniFrame && hasRenderUniFrame && (
        <RenderHeader
          req={logout}
          host={apiHost}
          locale={locale}
          locales={locales}
          ignoreLocales={['ed-ED']}
          userInfo={userInfo}
          onLanguageChange={onLanguageChange}
          onLogout={onLogout}
          autoHideInApp
        />
      )}
      {children}
      {hasLoadUniFrame && hasRenderUniFrame && <RenderFooter locale={locale} />}
      {/* {hasLoadUniFrame && <AdaBot locale={locale} userInfo={userInfo} />} */}
      {/* {hasLoadUniFrame && <Adjust />} */}
    </>
  );
}
