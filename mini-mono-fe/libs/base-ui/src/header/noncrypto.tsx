// @ts-nocheck
import React, { useState, useEffect } from 'react';
import clx from 'classnames';

import { localesFormatter } from '.';
// import './noncrypto.less';
import { isApp } from '@better-bit-fe/base-utils';
import { Modal } from '../modal';

const CONTAINER_ID = 'activity-noncrypto-header';

interface INonCryptoHeaderProps {
  locale: string;
  locales: string[];
  ignoreLocales?: string[];
  localeSelectorTitle: string; // 选择语言文本
  innerText: string; // 注册按钮文本
  redirectUrl: string; // 注册按钮跳转链接
  autoHideInApp?: boolean;
  onLanguageChange?: (locale: string) => void;
}

const LOGO_SRC = '';

const NonCryptoHeader: React.FC<INonCryptoHeaderProps> = (props) => {
  const {
    locale,
    locales,
    ignoreLocales = [],
    localeSelectorTitle = '',
    innerText = '',
    redirectUrl,
    autoHideInApp,
    onLanguageChange
  } = props;
  const localeList = localesFormatter(locales, ignoreLocales);
  const currentLocale = localeList.find(({ value }) => value === locale)?.lang;
  const [isModalVisible, setModalVisible] = useState(false);

  const handleClickSignUp = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_self');
    }
  };

  const setLocale = (lang: string) => {
    setModalVisible(false);
    onLanguageChange?.(lang);
  };

  useEffect(() => {
    const wrapperEle = document.getElementById(CONTAINER_ID);
    if (isApp() && wrapperEle && wrapperEle.style && autoHideInApp) {
      wrapperEle.style.display = 'none';
    }
  });

  return (
    <div className="non-crypto-header-wrapper" id={CONTAINER_ID}>
      <div className="non-crypto-header-left">
        <img src={LOGO_SRC} alt="logo" className="logo" />
      </div>

      <div className="non-crypto-header-right">
        <div className="header-sign-up" onClick={handleClickSignUp}>
          {innerText}
        </div>
        <div
          className="header-locale-selector"
          onClick={() => setModalVisible(true)}
        >
          {currentLocale}
        </div>
      </div>

      <Modal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title={localeSelectorTitle}
        className="lang-selector-modal"
      >
        <div className="lang-selector-list">
          {localeList.map(({ label, value }) => (
            <div
              key={value}
              className={clx('lang-selector-item', {
                active: value === locale
              })}
              onClick={() => setLocale(value)}
            >
              {label}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default NonCryptoHeader;
