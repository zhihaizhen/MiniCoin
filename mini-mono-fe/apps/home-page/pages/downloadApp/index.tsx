// @ts-nocheck
// 手机浏览器落地页，在浏览器访问交易页和资产页会跳转到当前页面
import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { tracing } from '@betterbit-library/tools';
import AppStatus from '~/components/appStatus';
import FixedFooterDown from '~/components/fixedFooterDown';
import DownloadIcons from '~/components/downloadIcons';
import { getTmsMessages } from '@better-bit-fe/lang';
import getConfig from 'next/config';
import { getLang } from '@better-bit-fe/base-utils';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { checkType } from '@better-bit-fe/base-utils';
import { IRefer } from '~/types';
import { getReferInfo } from '~/api';
import Cookie from 'js-cookie';
import cls from 'classnames';
import styles from './index.module.less';


function Page() {
  const t = useFm();
  useGlobalWidget();

  const { locale, query } = useRouter();
  const [showTips, setShowTips] = useState(false);
  const [isDemoTrade, setIsDemoTrade] = useState(false);
  // const [referUserInfo, setReferUserInfo] = useState<IRefer>({
  //   icon: '',
  //   nickName: ''
  // });

  // const [isRefer, setIsRefer] = useState(false);


  // useEffect(() => {
  //   if (localStorage.getItem('isNewUser')) {
  //     setShowTips(true);
  //     const timer = setTimeout(() => {
  //       setShowTips(false);
  //     }, 10000);
  //     return () => {
  //       clearTimeout(timer);
  //     };
  //   }
  //   tracing.init({
  //     project_type: 'Download',
  //     project_name: 'DownloadAppPage'
  //   });
  //   tracing.push('event', 'PageView', {});
  // }, []);

  // useEffect(() => {
  //   const refferCode =
  //     new URLSearchParams(window.location.search).get('inviteCode') ||
  //     Cookie.get('invite_code');
  //   if (refferCode) {
  //     bindInviteCode(refferCode);
  //   }
  // }, []);


  useEffect(() => {
    const { type } = query || {}
    if (type?.toLowerCase() === 'demotrade') {
      setIsDemoTrade(true);
    }
  }, [query]);

  const title = isDemoTrade ? t('demoTrade-title1') : t('download-title1');

  return (
    <div className={styles['page-wrapper']}>
      <div className={styles.contentWrapper}>
        <div className={styles.left}>
          <div className={styles.text}>
            <div className={styles.downBrand}>
              <div dangerouslySetInnerHTML={{ __html: title }}></div>
              <div>
                {isDemoTrade ? t('demoTrade-title2') : t('download-title2')}
              </div>

            </div>
            {!isDemoTrade && <div
              className={styles.desc}
              dangerouslySetInnerHTML={{ __html: t('download-des') }}
            ></div>}
            <div className={styles.downIcons}>
              <DownloadIcons />
            </div>
            {/* <div className={styles.appStatus}>
              <AppStatus />
            </div> */}
          </div>
        </div>
        <div className={styles.right}>
          {/* <img
            className={styles.img}
            src='/images/downloadApp/kv.png'
            loading="eager"
            alt="EasiCoin-Download"
          /> */}
          <img
            className={styles.img1}
            src='/images/downloadApp/kv.png'
            loading="eager"
            alt="EasiCoin-Download"
          />
          <img
            className={styles.img1}
            src='/images/downloadApp/kv.png'
            loading="eager"
            alt="EasiCoin-Download"
          />
          <img
            className={styles.img1}
            src='/images/downloadApp/kv.png'
            loading="eager"
            alt="EasiCoin-Download"
          />
        </div>
      </div>
      <Chat chatCls={styles['chat']} modalCls={styles['chat-modal']} />
      {/* H5 下载 */}
      <FixedFooterDown />
    </div>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['home-page', 'footer'],
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
      path: `/${locale}/downloadApp/`
    }
  };
};

export default withLayout(Page);
