/**
 * Dynamic Campaign Page
 */
import React from 'react';
import { withLayout, AntdConfig } from '@better-bit-fe/base-ui';
import { useGlobalWidget } from '@better-bit-fe/base-hooks';
import { HeroBanner, DailyChallenge, ActivityRules } from '~/components';
import { getTmsMessages } from '@better-bit-fe/lang';
import { CampaignProvider, useCampaign } from '~/context';
import { getCampaignListForBuild } from '~/api';
import styles from './[campaign_path].module.less';
import { isApp } from '@better-bit-fe/base-utils';

interface PageProps {
  campaignNo: string;
  locale: string;
  locales: string[];
  messages: any;
  title: string;
  description: string;
  ogImage: string;
  path: string;
}

function PageContent() {
  const { campaignDetail } = useCampaign();

  // 判断是否已报名
  const isRegistered = campaignDetail?.is_register === '1';

  return (
    <div
      className={styles.page}
      style={{ paddingBottom: isRegistered ? 0 : 166 }}
    >
      <HeroBanner />
      <DailyChallenge />
      <ActivityRules />
    </div>
  );
}

function Page({ campaignNo }: PageProps) {
  useGlobalWidget({
    isHideHeader: isApp()
  });

  return (
    <AntdConfig>
      <CampaignProvider campaignNo={campaignNo}>
        <PageContent />
      </CampaignProvider>
    </AntdConfig>
  );
}

// export const getStaticPaths = async () => {
//   return {
//     paths: [{ campaign_path: 'sign-in2' }, { campaign_path: 'sign-in1' }].map(slug => ({ params: { campaign_path: slug.campaign_path, campaignNo: slug.campaignNo } })),
//     fallback: false,
//   };
// };

export const getStaticPaths = async ({ locales }) => {
  console.log('[getStaticPaths] locales:', locales);
  try {
    // 调用服务端专用接口获取活动列表
    const response = (await getCampaignListForBuild()) || [];
    console.log('response~~~~', response);

    // 过滤出有效的 campaign_path
    const validCampaigns = response?.filter(item => item.campaign_path && item.campaign_path.trim() !== '')
      .map(item => ({
        campaign_path: item.campaign_path
      }));

    const paths = [];

    validCampaigns.forEach(item => {
      locales.forEach(locale => {
        paths.push({
          params: { campaign_path: item.campaign_path },
          locale
        });
      });
    });

    console.log('[getStaticPaths] 总生成路径:', paths);


    return {
      paths,
      fallback: false // 只允许预渲染的路径，其他返回 404
    };
  } catch (error) {
    console.error('[getStaticPaths] 获取活动列表失败:', error);
    // 失败时返回空路径，避免构建失败
    return {
      paths: [],
      fallback: false
    };
  }
};

/**
 * https://nextjs.org/docs/basic-features/data-fetching/get-static-props
 *
 * 只在服务端执行，加载的语言内容最终会被打包生成到html中
 */
export const getStaticProps = async (ctx) => {
  const { params, locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const { campaign_path } = params;

  console.log('[getStaticProps] 处理 campaign_path:', campaign_path);

  try {
    // // 调用接口获取活动列表
    const response = (await getCampaignListForBuild()) || [];

    // 根据 campaign_path 找到对应的 campaign
    const campaign = response?.find(item => item.campaign_path === campaign_path);

    if (!campaign) {
      console.error('[getStaticProps] 未找到匹配的活动:', campaign_path);
      return {
        notFound: true
      };
    }

    console.log('[getStaticProps] 找到活动, campaignNo:', campaign.campaign_no);

    // 获取多语言消息
    // 页面有加 Footer 组件就必须加 footer 和 gitbook-url
    const messages = await getTmsMessages({
      project: ['sign-in', 'error_code', 'gitbook-url', 'footer'],
      entry: import.meta.url,
      locale: lc,
      additions: ['title', 'description']
    });

    return {
      props: {
        campaignNo: campaign.campaign_no,
        locale: lc,
        locales,
        messages,
        title: messages.title,
        description: messages.description,
        ogImage: '/static/image/ogImage.jpeg',
        path: `https://www.easicoin.io/${lc}/activity-center/sign-in/${campaign_path}/`
      }
    };
  } catch (error) {
    console.error('[getStaticProps] 处理失败:', error);
    return {
      notFound: true
    };
  }
};

export default withLayout(Page);

