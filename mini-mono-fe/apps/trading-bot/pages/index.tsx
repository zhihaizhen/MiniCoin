/**
 * Index pages
 */
import React, { useRef, useState, useEffect } from 'react';
import { withLayout, AntdConfig, Chat } from '@better-bit-fe/base-ui';
import { useGlobalWidget, useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getTmsMessages } from '@better-bit-fe/lang';
import { ConfigProvider } from 'antd';
import { SpotQuoteTokenProvider } from 'libs/ws-service';
import { useRouter } from 'next/router';
import styles from './index.module.less';
import BotHeader, { BotHeaderRef } from '~/components/PublicPart/BotHeader';
import SpotStrategyBotMarket from '~/components/SpotStrategy/BotMarket';
import SpotDcaBotMarket from '~/components/SpotDCA/BotMarket';
import Broadcast from '~/components/PublicPart/Broadcast';
import TermsModal from '~/components/PublicPart/TermsModal';
import { ReactComponent as GridIcon } from '~/public/icons/grid.svg';
import { ReactComponent as InvestmentIcon } from '~/public/icons/investment.svg';
import { ReactComponent as FuturesIcon } from '~/public/icons/futures.svg';
import { ReactComponent as ChevronRightIcon } from '~/public/icons/chevron-right.svg';

// Ant Design 主题配置
const AntThemeConfig = {
  token: {
    colorPrimary: '#ABE127',
    colorBgContainer: '#1a1a1a',
    colorText: '#ffffff',
    colorBorder: 'rgba(255, 255, 255, 0.1)',
    colorTextPlaceholder: '#a8aaad',
    controlItemBgActive: 'rgba(171, 225, 39, 0.1)',
    controlItemBgHover: 'rgba(171, 225, 39, 0.05)',
    colorBgElevated: '#1d1d1d'
  },
  components: {
    Select: {
      selectorBg: '#1d1d1d',
      optionSelectedBg: '#1d1d1d',
      optionActiveBg: 'rgba(245, 245, 245, 0.1)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
      colorTextPlaceholder: '#f5f5f5',
      colorText: '#f5f5f5',
      controlOutline: 'transparent',
      controlOutlineWidth: 0,
      colorPrimaryHover: '#ABE127',
      optionPadding: '9.5px 8px'
    },
  }
};

type ActiveTab = 'spot-grid' | 'spot-dca';

const TYPE_TO_TAB: Record<string, ActiveTab> = {
  spotGrid: 'spot-grid',
  dca: 'spot-dca'
};

const TAB_TO_TYPE: Record<ActiveTab, string> = {
  'spot-grid': 'spotGrid',
  'spot-dca': 'dca'
};

function Page() {
  useGlobalWidget();
  const t = useFm();
  const router = useRouter();
  const { userInfo } = useUserInfo();
  const botHeaderRef = useRef<BotHeaderRef>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('spot-grid');
  const [gridModalOpen, setGridModalOpen] = useState(false);
  const [dcaModalOpen, setDcaModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [pendingOnOpen, setPendingOnOpen] = useState<(() => void) | null>(null);
  const [termsType, setTermsType] = useState<'grid' | 'dca'>('grid');

  useEffect(() => {
    const type = router.query.type as string;
    if (type && TYPE_TO_TAB[type]) {
      setActiveTab(TYPE_TO_TAB[type]);
    }
  }, [router.query.type]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    router.replace({ query: { ...router.query, type: TAB_TO_TYPE[tab] } }, undefined, { shallow: true });
  };

  const handleRefreshHeader = () => {
    botHeaderRef.current?.refresh();
  };

  const marketCards = [
    {
      icon: <GridIcon />,
      title: t('spot-grid'),
      description: t('spot-grid-desc'),
      disabled: false,
      termsType: 'grid' as const,
      termsKey: `trading-bot-terms-agreed:${userInfo?.id ?? ''}`,
      onOpen: () => setGridModalOpen(true)
    },
    {
      icon: <InvestmentIcon />,
      title: t('spot-dca'),
      description: t('spot-dca-desc'),
      disabled: false,
      termsType: 'dca' as const,
      termsKey: `dca-terms-agreed:${userInfo?.id ?? ''}`,
      onOpen: () => setDcaModalOpen(true)
    },
    {
      icon: <FuturesIcon />,
      title: t('futures-grid'),
      description: t('futures-grid-desc'),
      disabled: true,
      comingSoon: true,
      termsType: undefined,
      termsKey: undefined,
      onOpen: undefined
    }
  ];

  const handleMarketCardClick = (card: typeof marketCards[0]) => {
    if (card.disabled) return;
    if (!card.termsKey || !card.termsType) {
      card.onOpen?.();
      return;
    }
    const hasAgreedTerms = localStorage.getItem(card.termsKey);
    if (hasAgreedTerms === 'true') {
      card.onOpen?.();
    } else {
      setTermsType(card.termsType);
      setPendingOnOpen(() => card.onOpen ?? null);
      setIsTermsModalOpen(true);
    }
  };

  const handleTermsConfirm = () => {
    const termsKey = termsType === 'grid'
      ? `trading-bot-terms-agreed:${userInfo?.id ?? ''}`
      : `dca-terms-agreed:${userInfo?.id ?? ''}`;
    localStorage.setItem(termsKey, 'true');
    setIsTermsModalOpen(false);
    pendingOnOpen?.();
    setPendingOnOpen(null);
  };

  const handleTermsClose = () => {
    setIsTermsModalOpen(false);
    setPendingOnOpen(null);
  };

  return (
    <AntdConfig className={styles.page}>
      <ConfigProvider theme={AntThemeConfig}>
        <SpotQuoteTokenProvider useTickersWs>
          <BotHeader ref={botHeaderRef} />

          <div className={styles.sharedSection}>
            <div className={styles.broadcastSection}>
              <Broadcast />
            </div>

            <div className={styles.marketCardsRow}>
              {marketCards.map((card, index) => (
                <div
                  key={index}
                  className={`${styles.marketCard} ${card.disabled ? styles.marketCardDisabled : ''}`}
                  onClick={() => handleMarketCardClick(card)}
                >
                  <div className={styles.cardIconWrapper}>
                    <div className={styles.cardIcon}>{card.icon}</div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardTitleRow}>
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      {card.comingSoon && (
                        <span className={styles.comingSoonTag}>{t('coming-soon')}</span>
                      )}
                    </div>
                    <p className={styles.cardDesc}>{card.description}</p>
                  </div>
                  <div className={styles.cardArrow}>
                    {!card.comingSoon ? <ChevronRightIcon /> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.strategyMarketSection}>
            <h2 className={styles.strategyMarketTitle}>{t('strategy-market')}</h2>
            <div className={styles.tabBar}>
              <div
                className={`${styles.tabItem} ${activeTab === 'spot-grid' ? styles.tabItemActive : ''}`}
                onClick={() => handleTabChange('spot-grid')}
              >
                {t('spot-grid')}
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 'spot-dca' ? styles.tabItemActive : ''}`}
                onClick={() => handleTabChange('spot-dca')}
              >
                {t('spot-dca')}
              </div>
            </div>

            <div style={{ display: activeTab === 'spot-grid' ? 'block' : 'none' }}>
              <SpotStrategyBotMarket
                createOpen={gridModalOpen}
                onCreateClose={() => setGridModalOpen(false)}
                onRefreshHeader={handleRefreshHeader}
              />
            </div>
            <div style={{ display: activeTab === 'spot-dca' ? 'block' : 'none' }}>
              <SpotDcaBotMarket
                createOpen={dcaModalOpen}
                onCreateClose={() => setDcaModalOpen(false)}
                onRefreshHeader={handleRefreshHeader}
              />
            </div>
          </div>

          <Chat />

          <TermsModal
            type={termsType}
            open={isTermsModalOpen}
            onClose={handleTermsClose}
            onConfirm={handleTermsConfirm}
          />
        </SpotQuoteTokenProvider>
      </ConfigProvider>
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
    project: ['trading-bot', 'error_code', 'gitbook-url',],
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
      path: `https://www.easicoin.io/${lc}/trading-bot/`
    }
  };
};

export default withLayout(Page);
