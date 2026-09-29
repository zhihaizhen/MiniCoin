import React, { useState, useRef, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import { parseUrl, Env } from '@region-lib/env';
import cls from 'classnames';
import { isMobile, getLang, ENV, basePath } from '@better-bit-fe/base-utils';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useFm } from '@better-bit-fe/base-hooks';
import { getTmsMessages } from '@better-bit-fe/lang';
import { Form, Input, Button, Tooltip, message, Radio, Modal, Checkbox, ConfigProvider } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { emailValidate, pwdRuleList, pwdValidate } from '~/utils/validation';
import { useCaptcha } from '~/hooks/useCaptcha';
import useCountDown from '~/hooks/useCountDown';
import {
  getTradingViewSignalConfig,
  postEnableTradingViewSignal,
  postDisableTradingViewSignal
} from '~/api';
import Style from './index.module.less';
import styles from '../index.module.less';

function Page() {
  const t = useFm();
  const formRef = useRef(null);
  const captcha = useCaptcha();
  const { userInfo } = useUserInfo();
  const router = useRouter();

  const [signalOption, setSignalOption] = useState(1);
  const [signalConfig, setSignalConfig] = useState<{
    enabled: boolean;
    webhook_url: string;
    template_list: { action: string; content: string; name: string }[];
  }>({
    enabled: false,
    webhook_url: '',
    template_list: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curLink, setCurLink] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const contentItems = [
    {
      id: 1,
      title: t('itemTitle1'),
      desc: signalConfig.webhook_url
    },
    {
      id: 2,
      title: t('itemTitle2'),
      desc: signalConfig.template_list
    },
    {
      id: 3,
      title: t('itemTitle3'),
      desc: ''
    }
  ];

  const handleGoPre = () => {
    const locale = router.locale
    router.push(`/${locale}${basePath}/account-safe`);
  };


  const onChange = (e: RadioChangeEvent) => {
    setSignalOption(e.target.value);
    if (e.target.value === 1) {
      postEnableTradingViewSignal().then((res) => {
        message.success(t('enableSuccess'));
        getSingalConfig();
      }).catch(() => {
        message.error(t('enableFailed'));
      })
    } else {
      postDisableTradingViewSignal().then((res) => {
        message.success(t('disableSuccess'));
        getSingalConfig();
      }).catch(() => {
        message.error(t('disableFailed'));
      })
    }
  };

  const getSingalConfig = async () => {
    try {
      const res = await getTradingViewSignalConfig();
      setSignalConfig(res || {});
      // if (res?.code === 0) {
      //   message.success(t('getConfigSuccess'));
      //   // handle config data
      // } else {
      //   message.error(res?.message || t('getConfigFailed'));
      // }
    } catch (error) {
      console.error('get config error', error);
    }
  };

  const formatParamsString = (str: string) => {
    try {
      const obj = JSON.parse(str);
      const formatted = Object.entries(obj).map(([key, value]) => `${key}=${value}`).join(', ');
      return formatted;
    } catch (error) {
      return str;
    }
  }

  const handleGoMore = () => {
    window.open('https://easicoin.zendesk.com/hc/zh-cn/articles/16319627876751', '_blank');
  }

  const handleCopy = (text: string) => {
    copy(text);
    message.success(t('copyTips'));
  }
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleClick = () => {
    setIsModalOpen(false);
    handleCopy(curLink);
  }

  const handleOpenModal = (link: string) => {
    setIsModalOpen(true);
    setCurLink(link);
  }

  useEffect(() => {
    if (signalConfig.enabled) {
      setSignalOption(1);
    } else {
      setSignalOption(2);
    }
  }, [signalConfig.enabled]);

  useEffect(() => {
    getSingalConfig();
  }, []);


  return (
    <ConfigProvider
      theme={{
        components: {
          Checkbox: {
            colorPrimary: 'var(--fill-button-primary-default, #101112)',
            colorPrimaryHover: 'var(--fill-button-primary-default, #101112)',
          },
          Radio: {
            colorPrimary: 'var(--text-brand-default-web, #93c919)',
            colorPrimaryHover: 'var(--text-brand-default-web, #93c919)'
          },
        },
      }}
    >
      <div className={Style['tradingview-signal-page']}>
        <div className={Style.titleContainer}>
          <div className={Style.title1} onClick={handleGoPre}>
            {t('AccountInfo-title')} /{' '}
          </div>
          <div className={Style.title2}> {t('tradingviewSignal')}</div>
        </div>
        <div className={Style.mainTitle}>{t('tradingviewSignal')}</div>

        <div className={Style.content}>
          {
            contentItems.map((item: any, index) => {
              return (
                <div className={Style.contentItem} key={item.id}>
                  <div className={Style.contentItemTitle}>
                    <div className={Style.itemNumber}>{index + 1}</div>
                    <div className={Style.itemTitle}>{item.title}</div>
                  </div>

                  {index !== contentItems.length - 1 && index !== 0 &&

                    item.desc.map((descItem, descIndex) => (
                      <div key={descItem.action}>
                        <div className={Style.templateTitle}>{t(descItem.action)}</div>
                        <div className={Style.contentItemDesc} key={descIndex}>
                          <span>{formatParamsString(descItem.content)}</span>
                          <Button
                            type="primary"
                            className={Style.copyButton}
                            style={{ width: 'auto' }}
                            onClick={() => handleCopy(descItem.content)}
                          >{t('copy')}</Button>
                        </div>
                      </div>
                    ))
                  }
                  {index === 0 && (
                    <>
                      <div className={Style.contentItemDesc}>
                        <span>{item.desc}</span>
                        <Button type="primary" className={Style.copyButton} style={{ width: 'auto' }} onClick={() => handleOpenModal(item.desc)}>{t('copy')}</Button>
                      </div>
                      <div className={Style.Tips}>
                        <div className={Style.tipsIcon} />
                        <div className={Style.tipsText}>{t('alertTips')}</div>
                      </div>
                    </>
                  )}
                  {index === contentItems.length - 1 && (
                    <div style={{ marginLeft: 32 }}>
                      <Radio.Group
                        className={Style.radioGroup}
                        onChange={onChange}
                        value={signalOption}
                        options={[
                          { value: 1, label: t('enable') },
                          { value: 2, label: t('disable') },
                        ]}
                      />
                    </div>
                  )}
                </div>
              );
            })
          }
          <p className={Style.readMoreText} dangerouslySetInnerHTML={{ __html: t('readmore') }} onClick={handleGoMore} />
        </div>
        <Modal
          width={440}
          title={t('copyWebhookLink')}
          open={isModalOpen}
          maskClosable={false}
          onCancel={handleCancel}
          className={Style.webhookModal}
          footer={
            <div>
              <Button
                onClick={handleClick}
                type="primary"
                className={Style.copyButton}
                style={{ width: '100%' }}
                disabled={!isChecked}
              >
                {t('agreeAndCopy')}
              </Button>
            </div>
          }
        >
          <p className={Style.webhookWarningTips}>{t('webhookWarningTips')}</p>
          <div className={Style.webhookLink}>{formatParamsString(curLink)}</div>
          <Checkbox className={Style.confirmCheckbox} checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>{t('webhookConfirm')}</Checkbox>

        </Modal >

        <Chat chatCls={styles['chat']} />
      </div>
    </ConfigProvider>
  );
};

/**
 * https://nextjs.org/docs/basic-features/data-fetching/get-static-props
 *
 * 只在服务端执行，加载的语言内容最终会被打包生成到html中
 *
 * @param ctx
 * @returns
 */
export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['setting', 'error_code'],
    // project: 'demo', //要一一对应
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
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

export default withLayout(Page);
