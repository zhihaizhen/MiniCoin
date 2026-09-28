//@ts-nocheck
import React, { ReactElement } from 'react';
import { IntlProvider } from 'react-intl';
import {
  LocalesProvider,
  UserInfoProvider
} from '@better-bit-fe/base-provider';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { LayoutContainer } from '../../../libs/base-ui/src/layout/container';
import SettingLayout from '~/components/settingLayout';

/**
 * Next.js Pages Router 持久化布局：
 * 跨页切换时复用同一 SettingLayout，避免侧栏卸载/重挂导致抖动。
 * 必须由 _app 调用 Component.getLayout，不能写在页面 JSX 里。
 */
export function getSettingLayout(
  page: ReactElement,
  pageProps: Record<string, unknown> = {}
) {
  const { locale, locales, messages, title, description, ogImage, ogTitle, ogType, path, canonical } =
    pageProps;

  return (
    <LocalesProvider initialState={{ locales }}>
      <IntlProvider
        messages={messages}
        locale={locale}
        onError={() => {}}
      >
        <UserInfoProvider>
          <LayoutContainer
            locale={locale}
            locales={locales}
            title={title}
            description={description}
            ogImage={ogImage}
            ogTitle={ogTitle}
            ogType={ogType}
            path={path}
            canonical={canonical}
          >
            <SettingLayout>{page}</SettingLayout>
          </LayoutContainer>
        </UserInfoProvider>
      </IntlProvider>
    </LocalesProvider>
  );
}

/** 侧栏页面用这个替代 withLayout */
export function withSettingPage(PageComponent) {
  PageComponent.getLayout = getSettingLayout;
  return PageComponent;
}
