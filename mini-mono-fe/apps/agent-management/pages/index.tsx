//  @ts-nocheck
import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState
} from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { withLayout } from '@better-bit-fe/base-ui';
import { getLang } from '@better-bit-fe/base-utils';
import { Button } from 'antd';
import { getTmsMessages } from '@better-bit-fe/lang';
import { TransactionHistoryProvider } from '~/context/transactionHistoryContext';
import ReferralInfoCard from '~/components/referral-info-card';
import OverviewSummaryCard from '~/components/overview-summary-card';
import CommissionSummaryCard from '~/components/commission-summary-card';
import ErrorBoundary from '~/components/ErrorBoundary';
import styles from './index.module.less';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isMobile, isApp } from '@better-bit-fe/base-utils';
import Loading from '~/components/loading';
import { NavBar, Space, SafeArea, Toast } from 'antd-mobile';
import { REFERRAL_PATH } from '~/constants/path';
import { isBrowser, isProd } from '~/env';
import { keepUrlQueryParams, jumpToUrl, goPrePageInAPP } from '~/utils/url';
import { getAppScreenHeight, getAppToken } from '~/utils/jsbHelper';
import { Sentry } from '@better-bit-fe/base-utils';

function HomePage() {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(null);
  const childRef1 = useRef(null);
  const childRef2 = useRef(null);
  const childRef3 = useRef(null);

  // const showVconsole = () => {
  //   if (isBrowser && window.VConsole && !isProd) {
  //     window.vconsole = new VConsole();
  //   }
  // };

  useEffect(() => {
    getLang(); // 保证其他页面也一致
  }, []);

  const handleRedirectTransactionHistory = useCallback(() => {
    const url = keepUrlQueryParams(REFERRAL_PATH.transactionHistory);
    jumpToUrl(keepUrlQueryParams(REFERRAL_PATH.transactionHistory));
  }, []);

  const handleRefresh = () => {
    if (timer) {
      clearTimeout(timer);
    }
    setLoading(true);
    childRef1.current?.handleRefresh();
    childRef2.current?.handleRefresh();
    childRef3.current?.handleRefresh();
    const timers = setTimeout(() => {
      setLoading(false);
    }, 100);
    setTimer(timers);
  };

  const right = useMemo(
    () => (
      <div className={styles.rightWrapper}>
        <span className={styles.refreshIcon} onClick={handleRefresh} />
        <span
          className={styles.recordIcon}
          onClick={handleRedirectTransactionHistory}
        />
      </div>
    ),
    []
  );

  useEffect(() => {
    Sentry.init('agent-management');
    setTimeout(() => {
      throw new Error('agent-management-test');
    }, 4000);
  }, []);

  return (
    <TransactionHistoryProvider>
      <div className={styles.referral}>
        <SafeArea position="top" />
        <div className={styles.referral_head}>
          <NavBar right={right} onBack={goPrePageInAPP}>
            {t('affiliateManagement')}
          </NavBar>
        </div>
        {/* <Button onClick={showVconsole}>点击vconsole</Button> */}
        <div className={styles.referral_wrapper}>
          {loading ? (
            <Loading />
          ) : (
            <>
              <OverviewSummaryCard ref={childRef1} />
              <CommissionSummaryCard ref={childRef2} />
              <ReferralInfoCard ref={childRef3} />
            </>
          )}
        </div>
      </div>
    </TransactionHistoryProvider>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: 'agent-management', //
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

export default withLayout(HomePage, {
  hasLoadJsBridge: true
});
