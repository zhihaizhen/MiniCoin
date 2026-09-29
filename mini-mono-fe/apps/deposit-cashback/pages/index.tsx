/**
 * Index pages
 */
import React, { useEffect, useState } from 'react';
import { withLayout, AntdConfig, Chat, Rules } from '@better-bit-fe/base-ui';
import { useFm, useGlobalWidget } from '@better-bit-fe/base-hooks';
import { Header } from '~/components';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useUserInfo } from '@better-bit-fe/base-provider';
import FooterBanner from '~/components/FooterBanner';
import ActivityContent from '~/components/ActivityContent';
import { getCampaignDetailsPublic } from '~/api';
import { LevelItem } from '~/components/TaskList';
import dayjs from 'dayjs';
import { isApp } from '@better-bit-fe/base-utils';

function Page() {
  useGlobalWidget({
    isHideHeader: isApp()
  });

  const { isLogin } = useUserInfo();
  const t = useFm();
  const [levelList, setLevelList] = useState<LevelItem[]>([]);
  const [actTimeStr, setActTimeStr] = useState<string>('');

  const [mainTitle, setMainTitle] = useState<string>('');
  const [subTitle, setSubTitle] = useState<string>('');

  useEffect(() => {
    getCampaignDetailsPublic().then((res) => {
      const beginTime = res?.campaign_begin_time
        ? dayjs
            .unix(+res?.campaign_begin_time)
            .utc()
            .format('YYYY-MM-DD HH:mm:ss')
        : '';
      const endTime = res?.campaign_end_time
        ? dayjs
            .unix(+res?.campaign_end_time)
            .utc()
            .format('YYYY-MM-DD HH:mm:ss')
        : '';

      setActTimeStr(`${beginTime}  ~  ${endTime} (UTC+0)`);
      setLevelList(res?.level_list || [])
    })
  }, []);


  return (
    <AntdConfig>
      <Header actTime={actTimeStr} title={mainTitle} subTitle={subTitle} />
      <ActivityContent levelList={levelList} />
      <Rules
        className="w-full md:max-w-[1200px] mx-auto mb-14 md:mb-[120px] px-4 md:px-0"
        headTitle={t('activtiy-rule')}
        campaignCode='deposit-cashback'
        onLoad={(res) => {
          setMainTitle(res.mainTitle);
          setSubTitle(res.subTitle);
        }}
      />
      {isLogin === false && <FooterBanner />}
      <Chat />
    </AntdConfig>
  );
}

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
    // 页面有加Footer组件 就必须加footer和gitbook-url
    // 页面有加Chat组件 就必须加footer
    project: ['deposit-cashback', 'error_code', 'gitbook-url', 'footer'],
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
      ogImage: '/static/image/ogImage.jpeg',
      path: `https://www.easicoin.io/${lc}/deposit-cashback/`
    }
  };
};

// // 加载了UniFrame，不加载JsBridge，但是不渲染头部尾部
// export default withLayout(Page, {
//   hasRenderUniFrame: false,
//   hasLoadJsBridge: false
// });

// // 不加载JsBridge,UniFrame，不渲染头部尾部
// export default withLayout(Page, {
//   hasRenderUniFrame: false,
//   hasLoadJsBridge: false,
//   hasLoadUniFrame: false
// });

export default withLayout(Page);
