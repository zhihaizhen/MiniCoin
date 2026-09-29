// @ts-nocheck
import {
  UserInfoProvider,
  LocalesProvider
} from '@better-bit-fe/base-provider';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Nested } from '../Nested';
import { LayoutContainer } from './container';

export function withLayout(Component, options?: any) {
  return function LayoutHOC(props) {
    const { locale, locales } = props;
    // const providers = [
    //   ({ children }) => (
    //     <LocalesProvider initialState={{ locales }}>{children}</LocalesProvider>
    //   ),
    //   ({ children }) => (
    //     <IntlProvider
    //       messages={props.messages}
    //       locale={props.locale}
    //       onError={(err) => {}}
    //     >
    //       {children}
    //     </IntlProvider>
    //   ),
    //   ({ children }) => <UserInfoProvider>{children}</UserInfoProvider>
    // ];
    return (
      // <Nested components={providers}>
      <LocalesProvider initialState={{ locales }}>
        <IntlProvider
          messages={props.messages}
          locale={props.locale}
          onError={(err) => {}}
        >
          <UserInfoProvider>
            <LayoutContainer {...props}>
              <Component {...props} />
            </LayoutContainer>
          </UserInfoProvider>
        </IntlProvider>
      </LocalesProvider>
      // </Nested>
    );
  };
}
