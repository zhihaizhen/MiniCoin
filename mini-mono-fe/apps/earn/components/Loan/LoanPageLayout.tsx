import React from 'react';
import { AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import Header from './Header';
import { ConfigProvider } from 'antd';
import { AntThemeConfig } from '~/constants';
import { EarnDataProvider } from '~/context/EarnDataContext';
import { LoanCoinDataProvider } from '~/context/LoanCoinDataContext';
import { TransferModalRef, modalRef } from 'betterbit-ui';

export default function LoanPageLayout({headerStyle, children }: {headerStyle?: 'default' | 'second', children: React.ReactNode }) {
  useGlobalWidget();

  return (
    <AntdConfig>
      <ConfigProvider theme={AntThemeConfig}>
        <EarnDataProvider>
          <LoanCoinDataProvider>
            <Header headerStyle={headerStyle}/>
            {children}
            <TransferModalRef ref={modalRef} />
          </LoanCoinDataProvider>
        </EarnDataProvider>
        <Chat />
      </ConfigProvider>
    </AntdConfig>
  );
}
