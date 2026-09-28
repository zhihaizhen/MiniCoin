
import React, { useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import styled from '@emotion/styled';

// 辅助函数：获取 CSS 变量的实际值
const getCSSVariable = (variableName, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  return value || fallback;
};

const Wrapper = styled.div`
  .ant-pagination-item,
  .ant-pagination-next,
  .ant-pagination-prev,
  .ant-pagination-disabled {
    border: 1px solid var(--line-border-default, #EBEDF1);
  }
  .ant-pagination-item-active, .ant-pagination-item-active:hover{
      font-weight: 400;
    a{
      color: var(--text-primary, #101112);
    }
   }

  .ant-tabs-tab{
    color: var(--text-secondary, #666A6C);
    font-size: 20px;
    font-weight: 500;
  }
  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn{
    color: var(--text-primary, #FFF);
  }
  .ant-tabs-top >.ant-tabs-nav::before{
    border-bottom: none;
  }
  .ant-checkbox .ant-checkbox-inner:after{
    border-color: var(--text-black, #101112) ;
  }

  @media (max-width: 767px) {
    .ant-tabs-tab {
      font-size: 16px;
    }
  }
`;


function AntdConfig({ children, ...otherProps }) {
  // 在运行时读取 CSS 变量的实际值
  const [colorPrimary, setColorPrimary] = useState('#ABE127');
  const [colorTextLightSolid, setColorTextLightSolid] = useState('#101112');
  const [itemActiveBg, setItemActiveBg] = useState('#93C919');

  const [ButtonDefaultBg, setButtonDefaultBg] = useState();
  const [ButtonDefaultHoverBg, setButtonDefaultHoverBg] = useState();
  const [ButtonDefaultDisabledBg, setButtonDefaultDisabledBg] = useState();
  const [ButtonDefaultColor, setButtonDefaultColor] = useState();



  useEffect(() => {
    // 读取 CSS 变量值
    const updateThemeColors = () => {
      setColorPrimary(getCSSVariable('--text-brand-default', '#ABE127'));
      setColorTextLightSolid(getCSSVariable('--text-white-to-black', '#101112'));
      setButtonDefaultBg(getCSSVariable('--fill-button-primary-default', '#101112'));
      setButtonDefaultColor(getCSSVariable('--text-white-to-black', '#F5F5F5'));
      setButtonDefaultHoverBg(getCSSVariable('--fill-button-primary-hover', '#666A6C'));
      setButtonDefaultDisabledBg(getCSSVariable('--fill-button-primary-disabled', '#666A6C'));
      setItemActiveBg(getCSSVariable('--fill-button-brand-default', '#93C919'));

    };

    // 初始化时读取
    updateThemeColors();

    // 监听主题变化（如果主题通过 class 切换）
    const observer = new MutationObserver(() => {
      updateThemeColors();
    });

    if (typeof window !== 'undefined' && document.documentElement) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "inherit", // 让 antd 继承全局字体
          colorPrimary, // 使用动态读取的实际颜色值
          colorTextLightSolid,
        },
        components: {
          // primary 绿底黑字， default 白色模式下，黑底白字；黑色模式下， 白色按钮黑色底
          Button: {
            primaryColor: '#101112', //var(--text-black)
            defaultBg: ButtonDefaultBg,
            defaultColor: ButtonDefaultColor,
            defaultHoverBg: ButtonDefaultHoverBg,
            defaultHoverColor: ButtonDefaultColor,
            // defaultBgDisabled: ButtonDefaultDisabledBg,

          },

          Pagination: {
            itemActiveBg,
            borderRadius: 8,
          }
        }
      }}
      {...otherProps}
    >
      <Wrapper>{children}</Wrapper>
    </ConfigProvider>
  );
}

export { AntdConfig };

