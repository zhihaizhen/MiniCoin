/**
 * Index pages
 */
import React, { useCallback, useEffect, useState } from 'react';
import { withLayout } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { Header, TaskList, ActivityRules } from '~/components';
import styles from './index.module.less';
import { getCampaignDetail } from '~/api';
import { useUserInfo } from '@better-bit-fe/base-provider';
import getConfig from 'next/config';
import { isInApp } from '~/utils';

function Page() {
  useGlobalWidget();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isLogin } = useUserInfo();
  const {
    publicRuntimeConfig: { campaignId }
  } = getConfig();

  useEffect(() => {
    console.log('isInApp', isInApp());
    if (isInApp()) {
      // 隐藏头部和尾部
      const header = document?.getElementById('widget_header');
      const footer = document?.getElementById('widget_footer');
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
    }
  }, []);

  const updateCampaignDetail = useCallback(() => {
    if (isLogin === undefined) return;
    getCampaignDetail({ campaign_id: campaignId, isLogin }).then((res) => {
      setActivity(res);
      setLoading(false);
    });
  }, [campaignId, isLogin]);

  useEffect(() => {
    updateCampaignDetail();
  }, [campaignId, isLogin, updateCampaignDetail]);

  // if (loading || !activity) {
  //   return (
  //     <div className={styles['loading-box']}>
  //       <div className={styles['img']}></div>
  //     </div>
  //   );
  // }

  return (
    <div className={styles.page}>
      <Header
        activity={activity}
        updateCampaignDetail={() => updateCampaignDetail()}
      />
      <TaskList activity={activity} />
      <ActivityRules activity={activity} />
    </div>
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
    project: ['reward-landing', 'error_code', 'rewards-hub'],
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
