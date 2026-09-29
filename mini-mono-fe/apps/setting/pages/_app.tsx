//@ts-nocheck
import React from 'react';
import { ConfigProvider } from 'antd';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import './styles.less';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import 'libs/base-ui/src/styles/tailwind-global-styles.css'

/**
 * https://nextjs.org/docs/advanced-features/custom-app
 * 初始化页面、数据，服务端渲染
 * 添加全局的css
 *
 * getLayout：跨页复用同一布局壳（如 SettingLayout），避免侧栏切换抖动
 */
function CustomApp({ Component, pageProps }: any) {
  useGlobalWidget();
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ConfigProvider
      autoInsertSpaceInButton={false}
      theme={{
        components: {
          Button: {
            defaultShadow: 'none',
            primaryShadow: 'none',
            dangerShadow: 'none'
          }
        }
      }}
    >
      <div className="app">
        <div
          id="widget_header"
          style={{ height: '64px', background: '#070808', borderBottom: '1px solid #28292A' }}
        />
        {getLayout(<Component {...pageProps} />, pageProps)}
        <div id="widget_footer"></div>
      </div>
    </ConfigProvider>
  );
}

export default CustomApp;
