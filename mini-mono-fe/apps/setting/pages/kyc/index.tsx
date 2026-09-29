import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import styles from './index.module.less';
import { getTmsMessages } from '@better-bit-fe/lang';
import { Chat } from '@better-bit-fe/base-ui';
import { useFm } from '@better-bit-fe/base-hooks';
import KycEntrance from '~/components/KycEntrance';
import KycForm from '~/components/KycForm';
import ReviewStatusCard from '~/components/ReviewStatusCard';
import { getKycInfo } from '~/api';
import { useRouter } from 'next/router';
import { useCountryList } from '~/hooks/useCountryList';
import { useLoginRedirect } from '~/hooks/useLoginRedirect';
import { withSettingPage } from '~/hoc/withSettingPage';
import type { IKycData } from '~/types';
import {
  getBasicKycStatus,
  getAdvancedKycStatus,
  shouldShowStatusCard as shouldShowReviewCard,
  isAdvancedKycClickable,
  shouldShowRejectionAlert,
  getRejectionAlertMessageKey
} from '~/utils/kycHelper';

const Kyc = (props: any) => {
  const { locale: pageLocale } = props;
  const router = useRouter();
  const { countries } = useCountryList();
  const t = useFm();

  // 登录验证和重定向
  useLoginRedirect({ locale: pageLocale });

  // 控制显示KYC入口页还是认证表单页
  const [showKycForm, setShowKycForm] = useState(false);
  const [kycType, setKycType] = useState<'basic' | 'advanced'>('basic');

  const [kycData, setKycData] = useState<IKycData>({
    kyc_status: 'unknown'
  });
  const [isLoadingKycData, setIsLoadingKycData] = useState(true);

  const fetchKycInfo = async () => {
    setIsLoadingKycData(true);
    try {
      const res = await getKycInfo({});
      if (res) {
        setKycData(res);
      }
    } catch (error) {
      console.error("获取KYC信息失败:", error);
    } finally {
      setIsLoadingKycData(false);
    }
  };

  useEffect(() => {
    fetchKycInfo();
  }, []);

  // 监听路由变化，重置showKycForm状态
  useEffect(() => {
    const handleRouteChange = () => {
      setShowKycForm(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // 处理开始基础KYC认证
  const handleStartBasicKyc = () => {
    setKycType('basic');
    setShowKycForm(true);
  };

  // 处理开始高级KYC认证
  const handleStartAdvancedKyc = () => {
    setKycType('advanced');
    setShowKycForm(true);
  };

  // 根据 kyc_level 判断认证状态
  const basicKycStatus = getBasicKycStatus(kycData);
  const advancedKycStatus = getAdvancedKycStatus(kycData);

  // 判断是否显示审核状态卡片(审核中)
  const shouldShowStatusCard = shouldShowReviewCard(kycData);

  // 判断高级认证是否可点击(只有基础认证成功才可点击)
  const advancedClickable = isAdvancedKycClickable(kycData);

  // 判断是否显示拒绝提示
  const showRejectionAlert = shouldShowRejectionAlert(kycData);
  const rejectionAlertMessageKey = getRejectionAlertMessageKey(kycData);
  const rejectionAlertMessage = rejectionAlertMessageKey ? t(rejectionAlertMessageKey) : '';

  // 渲染加载状态
  const renderLoading = () => (
    <div className={styles.loadingContainer}>
      <Spin size="large" />
    </div>
  );

  // 渲染审核状态卡片
  const renderStatusCard = () => (
    <ReviewStatusCard
      kyc_status={kycData?.kyc_status}
      country={kycData?.country || ''}
      first_name={kycData?.first_name || ''}
      last_name={kycData?.last_name || ''}
      identity_number={kycData?.identity_number || ''}
      countries={countries}
    />
  );

  // 渲染入口页
  const renderEntrance = () => (
    <KycEntrance
      onStartBasicKyc={handleStartBasicKyc}
      onStartAdvancedKyc={handleStartAdvancedKyc}
      basicKycStatus={basicKycStatus}
      advancedKycStatus={advancedKycStatus}
      isAdvancedClickable={advancedClickable}
      showRejectionAlert={showRejectionAlert}
      rejectionAlertMessage={rejectionAlertMessage}
    />
  );

  // 渲染认证表单
  const renderForm = () => (
    <KycForm
      kycType={kycType}
      onSubmitSuccess={fetchKycInfo}
    />
  );

  // 主内容渲染逻辑
  const renderContent = () => {
    if (isLoadingKycData) return renderLoading();
    if (shouldShowStatusCard) return renderStatusCard();
    if (!showKycForm) return renderEntrance();
    return renderForm();
  };

  return (
    <>
      <div className={styles.container}>
        {renderContent()}
      </div>
      <Chat />
    </>
  );
};

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['setting', 'error_code', 'footer'],
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

export default withSettingPage(Kyc);
