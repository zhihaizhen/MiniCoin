// @ts-nocheck
// 手机浏览器落地页，在浏览器访问交易页和资产页会跳转到当前页面
import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { tracing } from '@betterbit-library/tools';
import AppStatus from '~/components/appStatus';
import FixedFooterDownWealth from '~/components/fixedFooterDown/index_wealth';
import DownloadIcons from '~/components/downloadIcons';
import { getTmsMessages } from '@better-bit-fe/lang';
import getConfig from 'next/config';
import { getLang } from '@better-bit-fe/base-utils';
import { withLayout, Chat } from '@better-bit-fe/base-ui';
import { checkType } from '@better-bit-fe/base-utils';
import { IRefer } from '~/types';
import { getReferInfo, manualLogout } from '~/api';
import cls from 'classnames';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { ReactComponent as ChatSvg } from '~/icon/app/wealthVip/chat.svg';
import styles from '../index.module.less';


function Page() {
  const t = useFm();
  if (typeof window !== 'undefined') {
    document.getElementById('widget_header')?.style?.setProperty('display', 'none', 'important');
  }
  useGlobalWidget({
    isHideHeader: true
  });

  const { locale, query } = useRouter();
  const [showTips, setShowTips] = useState(false);
  const [isDemoTrade, setIsDemoTrade] = useState(false);
  const { isLogin, userInfo } = useUserInfo();

  const logout = async () => {
    await manualLogout()
    // window.location.reload();
  }

  useEffect(() => {
    if (isLogin) {
      logout();
    }
  }, [isLogin]);


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
      <div
        className={"fixed right-[16px] bottom-[100px] bg-text-brand-default p-[12px] flex items-center justify-center z-[100] cursor-pointer  rounded-lg"}
        onClick={() => { window.open('https://t.me/EasiCoin_XQ') }}
      >
        <ChatSvg className="w-[28px] h-[28px]" />
        {/* <span className="text-text-black ml-[4px] text-[14px] font-[500]">客服</span> */}
      </div>
      {/* H5 下载 */}
      <FixedFooterDownWealth />
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
