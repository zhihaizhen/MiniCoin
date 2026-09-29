import React, { useState, useRef } from 'react';
import { Button, ConfigProvider } from 'antd';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { getLang } from '@better-bit-fe/base-utils';
import { LeftOutlined } from '@ant-design/icons';
import Style from './index.module.less';
import Reset2FAModal from '~/components/reset2faModal';
import getConfig from 'next/config';
import { AntThemeConfig } from '~/constants';
import { useRouter } from 'next/dist/client/router';

const Reset2FA = () => {
  const router = useRouter();
  useGlobalWidget({
    isHideFooter: Boolean(router.isReady && router.query.isOauth),
    isHideHeader: Boolean(router.isReady && router.query.isOauth)
  });

  const { staticFolder } = getConfig().publicRuntimeConfig;
  const t = useFm();
  const lang = getLang();
  const [selectedOption, setSelectedOption] = useState<string>('google');
  const reset2faModalRef = useRef<any>(null);
  const [showModalProp, setShowModalProp] = useState(false);


  // 处理选项选择
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  // 处理提交
  const handleSubmit = () => {
    if (!selectedOption) {
      return;
    }
    // 打开弹窗
    reset2faModalRef.current?.changeModalVisible(true);
  };

  // 重置成功回调
  const handleResetSuccess = () => {
    console.log('Reset 2FA success');
  };

  // 联系客服回调
  const handleContactService = () => {
    setShowModalProp(true);
  };

  // 返回上一页
  const handleGoBack = () => {
    window.location.href = `/${lang}/account/login`;
  };

  return (
    <div className={Style['reset2faPage']}>
      <ConfigProvider theme={AntThemeConfig} autoInsertSpaceInButton={false}>
        <header className={Style['headerContent']}>
          <LeftOutlined className={Style['backIcon']} onClick={handleGoBack} />
        </header>
        <div className={Style['wrapper']}>
          <div className={Style['reset-container']}>
            <div className={Style['reset-content']}>
              {/* 标题 */}
              <div className={Style['header-section']}>
                <h1 className={Style['main-title']}>
                  {t('reset2faModal-title')}
                </h1>
              </div>

              {/* 警告提示 */}
              <div className={Style['content-section']}>
                <div className={Style['alert-notice']}>
                  <img
                    src={`${staticFolder}/images/ic-info.svg`}
                    alt="info"
                    className={Style['alert-icon']}
                  />
                  <span className={Style['alert-text']}>
                    {t('reset2faModal-desc')}
                  </span>
                </div>

                {/* 选择框 */}
                <div className={Style['selection-box']}>
                  <div className={Style['selection-header']}>
                    <h2 className={Style['selection-title']}>
                      {t('reset2faModal-select-title')}
                    </h2>
                  </div>

                  <div className={Style['selection-options']}>
                    <div
                      className={Style['option-item']}
                      onClick={() => handleOptionSelect('google')}
                    >
                      <div className={Style['option-label']}>
                        <img
                          src={`${staticFolder}/images/ic-google-verification.svg`}
                          alt="Google Verification"
                          className={Style['option-icon']}
                        />
                        <span className={Style['option-text']}>
                          {t('reset2faModal-option-text')}
                        </span>
                      </div>
                      <img
                        src={
                          selectedOption === 'google'
                            ? `${staticFolder}/images/radio-selected.svg`
                            : `${staticFolder}/images/radio-unselected.svg`
                        }
                        alt="radio"
                        className={Style['radio-icon']}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <Button
                className="w-full !h-12"
                type="primary"
                onClick={handleSubmit}
                disabled={!selectedOption}
              >
                {t('reset2faModal-submit-btn')}
              </Button>
            </div>
          </div>
        </div>

        <Chat showModalProp={showModalProp} />

        {/* Reset 2FA Modal */}
        <Reset2FAModal
          ref={reset2faModalRef}
          onSuccess={handleResetSuccess}
          onContactService={handleContactService}
        />
      </ConfigProvider>
    </div>
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
      path: `/${locale}/reset2fa/`
    }
  };
};

export default withLayout(Reset2FA);
