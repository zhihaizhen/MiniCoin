import React, { useState, useEffect, useRef } from 'react';
import { Tabs, ConfigProvider, message } from 'antd';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { withLayout, AntdConfig } from '@better-bit-fe/base-ui';
import { useGlobalWidget, useFm } from '@better-bit-fe/base-hooks';
import { basePath } from '@better-bit-fe/base-utils';
import { getTmsMessages } from '@better-bit-fe/lang';
import { SpotQuoteTokenProvider } from 'libs/ws-service';
import { StrategyStats } from '~/components/PublicPart/StrategyStats';
import { StrategyTable, StrategyData } from '~/components/SpotStrategy/StrategyTable';
import { HistoryStrategyTable, HistoryStrategyData } from '~/components/SpotStrategy/HistoryStrategyTable';
import { DCATable, DcaStrategyData } from '~/components/SpotDCA/DCATable';
import { DCAHistoryTable, DcaHistoryStrategyData } from '~/components/SpotDCA/DCAHistoryTable';
import CustomParamsModal from '~/components/SpotDCA/CustomParamsModal';
import { SubTabs } from '~/components/PublicPart/SubTabs';
import { getUserTotalInfo, getUserStrategyList, getDcaUserStrategies, updateDcaStrategyName } from '~/api';
import PlanNameModal from '~/components/SpotDCA/CustomParamsModal/PlanNameModal';
import { ReactComponent as BackIcon } from '~/public/icons/back.svg';
import { parseCronToText, formatStrategyRuntime } from '~/utils';
import styles from './index.module.less';

const PAGE_SIZE = 10;

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
    Tabs: {
      titleFontSize: 14,
      titleFontSizeLG: 14,
      titleFontSizeSM: 14,
      inkBarColor: '#f5f5f5',
      itemColor: '#808588',
      itemHoverColor: '#f5f5f5',
      itemActiveColor: '#f5f5f5',
      itemSelectedColor: '#f5f5f5',
      horizontalItemPadding: '12px 0',
      horizontalItemPaddingLG: '12px 0',
      horizontalItemPaddingSM: '12px 0'
    },
    Select: {
      selectorBg: '#1d1d1d',
      optionSelectedBg: 'rgba(171, 225, 39, 0.2)',
      optionActiveBg: 'rgba(171, 225, 39, 0.1)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
      colorTextPlaceholder: '#f5f5f5',
      colorText: '#f5f5f5',
      controlOutline: 'transparent',
      controlOutlineWidth: 0,
      colorPrimaryHover: '#ABE127',
      optionPadding: '9.5px 8px'
    }
  }
};

// 千分位格式化，根据 tickSize 补足小数位
const formatPriceWithThousands = (val: number | string | undefined, tickSize?: string): string => {
  const str = String(val ?? '');
  const num = Number(str);
  if (isNaN(num) || !str) return str;
  const decimals = tickSize?.includes('.') ? tickSize.split('.')[1].length : null;
  const fixed = decimals !== null ? num.toFixed(decimals) : str;
  const parts = fixed.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
};

function MyStrategy() {
  const t = useFm();
  useGlobalWidget();
  const router = useRouter();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsClientReady(true);
    }, 300);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const subTabs = [
    { key: '1', label: t('spot-grid') },
    { key: '2', label: t('spot-dca') }
  ];

  const [activeTab, setActiveTab] = useState('running');
  const [runningSubTab, setRunningSubTab] = useState('1');
  const [historySubTab, setHistorySubTab] = useState('1');

  // 仅在首次 router ready 时从 URL 恢复 tab 状态，恢复后立即清除参数
  const hasConsumedUrlParams = useRef(false);
  useEffect(() => {
    if (!router.isReady || hasConsumedUrlParams.current) return;
    const tab = router.query.tab as string | undefined;
    const sub = router.query.sub as string | undefined;
    if (!tab && !sub) return;
    hasConsumedUrlParams.current = true;
    if (tab) setActiveTab(tab);
    if (sub) {
      if ((tab || 'running') === 'running') {
        setRunningSubTab(sub);
      } else {
        setHistorySubTab(sub);
      }
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('tab');
    url.searchParams.delete('sub');
    window.history.replaceState({}, '', url.toString());
  }, [router.isReady, router.query.tab, router.query.sub]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(PAGE_SIZE);
  const [todayProfit, setTodayProfit] = useState('0.00');
  const [totalInvestment, setTotalInvestment] = useState('0.00');
  const [runningData, setRunningData] = useState<StrategyData[]>([]);
  const [runningTotal, setRunningTotal] = useState(0);
  const [historyData, setHistoryData] = useState<HistoryStrategyData[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [dcaRunningData, setDcaRunningData] = useState<DcaStrategyData[]>([]);
  const [dcaRunningTotal, setDcaRunningTotal] = useState(0);
  const [dcaHistoryData, setDcaHistoryData] = useState<DcaHistoryStrategyData[]>([]);
  const [dcaHistoryTotal, setDcaHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showRerunModal, setShowRerunModal] = useState(false);
  const [rerunStrategyDetail, setRerunStrategyDetail] = useState<any>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameRecord, setRenameRecord] = useState<DcaStrategyData | null>(null);

  useEffect(() => {
    const fetchUserTotalInfo = async () => {
      try {
        const res = await getUserTotalInfo({});
        if (res) {
          const { daily_profit, total_amount, active_count } = res;
          setTodayProfit(daily_profit || '0.00');
          setTotalInvestment(total_amount || '0.00');
          setActiveCount(active_count || 0);
        }
      } catch (error) {
        console.error('获取用户总览数据失败:', error);
      }
    };

    fetchUserTotalInfo();
  }, []);

  // 获取运行中的策略列表
  const fetchRunningStrategies = async () => {
    setLoading(true);
    try {
      const res = await getUserStrategyList({
        type: 1,
        strategy_type: Number(runningSubTab),
        pageNo: currentPage,
        pageSize: pageSize
      });

      if (res?.records && Array.isArray(res.records)) {
        const formattedData: StrategyData[] = res.records.map((item: any) => {
          const { id, status, startedAt, maxDrawDown, spotGrid } = item;
          const {
            baseToken,
            quoteToken,
            allProfit,
            allProfitRate,
            investAmount,
            arbitrageCount,
            priceLower,
            priceUpper,
            nowPrice,
            tickSize,
            baseTokenTotal,
            quoteTokenTotal
          } = spotGrid || {};

          const profit = allProfit || 0;
          const profitRate = allProfitRate || 0;

          // 计算运行时长
          let statusText = t('pending-start');
          if (status === 1 && startedAt) {
            const runSeconds = Math.floor(Date.now() / 1000) - startedAt;
            const days = Math.floor(runSeconds / 86400);
            const hours = Math.floor((runSeconds % 86400) / 3600);
            const minutes = Math.floor((runSeconds % 3600) / 60);
            statusText = `${t('running')} ${t('runtime-format', { days, hours, minutes })}`;
          }

          return {
            id: String(id),
            symbol: `${baseToken}/${quoteToken}`,
            profit: `${profit >= 0 ? '+' : ''}${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
            profitRate: `${profitRate > 0 ? '+' : ''}${(profitRate * 100).toFixed(2)}%`,
            maxDrawDown: `${(maxDrawDown * 100).toFixed(2)}%`,
            investment: `${Number(investAmount || 0).toLocaleString()}`,
            arbitrage: String(arbitrageCount || 0),
            stopRange: `${formatPriceWithThousands(priceLower)}-${formatPriceWithThousands(priceUpper)}`,
            latestPrice: formatPriceWithThousands(nowPrice, tickSize) || '--',
            startedAt,
            status: {
              text: statusText,
              tone: status === 0 ? 'idle' : 'active'
            },
            spotGrid: spotGrid ? {
              baseToken,
              quoteToken,
              baseTokenTotal: baseTokenTotal || 0,
              quoteTokenTotal: quoteTokenTotal || 0
            } : undefined
          };
        });

        setRunningData(formattedData);
        setRunningTotal(res.total || 0);
      } else {
        setRunningData([]);
        setRunningTotal(0);
      }
    } catch (error) {
      console.error('获取运行中策略失败:', error);
      setRunningData([]);
      setRunningTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 获取历史策略列表
  const fetchHistoryStrategies = async () => {
    setLoading(true);
    try {
      const res = await getUserStrategyList({
        type: 2,
        strategy_type: Number(historySubTab),
        pageNo: historyCurrentPage,
        pageSize: historyPageSize
      });

      if (res?.records && Array.isArray(res.records)) {
        const formattedData: HistoryStrategyData[] = res.records.map((item: any) => {
          const { id, status, startedAt, stoppedAt, maxDrawDown, spotGrid } = item;
          const {
            baseToken,
            quoteToken,
            allProfit,
            allProfitRate,
            investAmount,
            arbitrageCount,
            priceLower,
            priceUpper,
            nowPrice,
            tickSize
          } = spotGrid || {};

          const profit = allProfit || 0;
          const profitRate = allProfitRate || 0;

          return {
            id: String(id),
            symbol: `${baseToken}/${quoteToken}`,
            profit: `${profit >= 0 ? '+' : ''}${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
            profitRate: `${profitRate >= 0 ? '+' : ''}${(profitRate * 100).toFixed(2)}%`,
            maxDrawDown: `${((maxDrawDown || 0) * 100).toFixed(2)}%`,
            investment: `${Number(investAmount || 0).toLocaleString()}`,
            arbitrage: String(arbitrageCount || 0),
            stopRange: `${formatPriceWithThousands(priceLower)}-${formatPriceWithThousands(priceUpper)}`,
            latestPrice: formatPriceWithThousands(nowPrice, tickSize) || '--',
            startedAt,
            stoppedAt,
            status: (() => {
              const statusMap = {
                0: { text: t('not-started'), tone: 'stopped' as const },
                2: { text: t('completed'), tone: 'stopped' as const },
                3: { text: t('terminated'), tone: 'terminated' as const }
              };
              return statusMap[status] || { text: t('unknown'), tone: 'stopped' as const };
            })(),
            rawData: item
          };
        });

        setHistoryData(formattedData);
        setHistoryTotal(res.total || 0);
      } else {
        setHistoryData([]);
        setHistoryTotal(0);
      }
    } catch (error) {
      console.error('获取历史策略失败:', error);
      setHistoryData([]);
      setHistoryTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 获取运行中的 DCA 策略列表
  const fetchDcaRunningStrategies = async () => {
    setLoading(true);
    try {
      const res = await getDcaUserStrategies({
        execution_status: 'running,paused',
        page_no: currentPage,
        page_size: pageSize
      });

      if (res?.records && Array.isArray(res.records)) {
        const formattedData: DcaStrategyData[] = res.records.map((item: any) => {
          const {
            id, strategyName, roi, margin, pnl, totalMargin, relationCoin,
            priceConfig, strategyCron, executionStatus,
            nextExecAt
          } = item;

          const roiValue = roi || 0;
          const marginValue = Number(margin) || 0;
          const pnlValue = Number(pnl) || 0;

          // 解析币种配置
          let coinConfigStr = '';
          try {
            const configs = typeof priceConfig === 'string' ? JSON.parse(priceConfig) : priceConfig;
            if (Array.isArray(configs)) {
              coinConfigStr = configs.map(c => `${c.coin} ${c.ratio}%`).join(' | ');
            }
          } catch {
            coinConfigStr = relationCoin || '';
          }

          // 每次投入文案
          const cronText = parseCronToText(strategyCron, t);
          const investPerTimeStr = `${marginValue} USDT丨${cronText}`;

          let statusText = '';
          let statusTone: 'active' | 'paused' = 'active';
          if (executionStatus === 'paused') {
            statusText = t('paused');
            statusTone = 'paused';
          } else {
            statusTone = 'active';
            const durationText = formatStrategyRuntime(item.strategyInterval, '');
            statusText = durationText
              ? `${t('running')} ${durationText}`
              : t('running');
          }

          return {
            id: String(id),
            strategyName: strategyName || `${t('spot-dca')}`,
            pnl: `${pnlValue >= 0 ? '+' : ''}${pnlValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
            profitRate: `${roiValue >= 0 ? '+' : ''}${(roiValue * 100).toFixed(2)}%`,
            totalMargin: totalMargin ?? '--',
            coinConfig: coinConfigStr,
            investPerTime: investPerTimeStr,
            status: { text: statusText, tone: statusTone },
            nextInvestTime: nextExecAt || '--',
            rawData: item
          };
        });

        setDcaRunningData(formattedData);
        setDcaRunningTotal(res.total || 0);
      } else {
        setDcaRunningData([]);
        setDcaRunningTotal(0);
      }
    } catch (error) {
      console.error('获取运行中 DCA 策略失败:', error);
      setDcaRunningData([]);
      setDcaRunningTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 获取历史 DCA 策略列表
  const fetchDcaHistoryStrategies = async () => {
    setLoading(true);
    try {
      const res = await getDcaUserStrategies({
        execution_status: 'terminated',
        page_no: historyCurrentPage,
        page_size: historyPageSize
      });

      if (res?.records && Array.isArray(res.records)) {
        const formattedData: DcaHistoryStrategyData[] = res.records.map((item: any) => {
          const {
            id, strategyName, roi, margin, pnl, totalMargin, relationCoin,
            priceConfig, strategyCron, createdAt, updatedAt
          } = item;

          const roiValue = roi || 0;
          const marginValue = Number(margin) || 0;
          const pnlValue = Number(pnl) || 0;

          let coinConfigStr = '';
          try {
            const configs = typeof priceConfig === 'string' ? JSON.parse(priceConfig) : priceConfig;
            if (Array.isArray(configs)) {
              coinConfigStr = configs.map(c => `${c.coin} ${c.ratio}%`).join(' | ');
            }
          } catch {
            coinConfigStr = relationCoin || '';
          }

          const cronText = parseCronToText(strategyCron, t);
          const investPerTimeStr = `${marginValue} USDT丨${cronText}`;

          return {
            id: String(id),
            strategyName: strategyName || `${t('spot-dca')}`,
            pnl: `${pnlValue >= 0 ? '+' : ''}${pnlValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
            profitRate: `${roiValue >= 0 ? '+' : ''}${(roiValue * 100).toFixed(2)}%`,
            totalMargin: totalMargin ?? '--',
            coinConfig: coinConfigStr,
            investPerTime: investPerTimeStr,
            status: { text: t('terminated'), tone: 'terminated' as const },
            createdAt: createdAt || '--',
            stoppedAt: updatedAt || '--',
            rawData: item
          };
        });

        setDcaHistoryData(formattedData);
        setDcaHistoryTotal(res.total || 0);
      } else {
        setDcaHistoryData([]);
        setDcaHistoryTotal(0);
      }
    } catch (error) {
      console.error('获取历史 DCA 策略失败:', error);
      setDcaHistoryData([]);
      setDcaHistoryTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 监听运行中策略的筛选条件变化
  useEffect(() => {
    if (activeTab === 'running') {
      if (runningSubTab === '1') {
        fetchRunningStrategies();
      } else {
        fetchDcaRunningStrategies();
      }
    }
  }, [runningSubTab, currentPage, pageSize, activeTab]);

  // 监听历史策略的筛选条件变化
  useEffect(() => {
    if (activeTab === 'history') {
      if (historySubTab === '1') {
        fetchHistoryStrategies();
      } else {
        fetchDcaHistoryStrategies();
      }
    }
  }, [historySubTab, historyCurrentPage, historyPageSize, activeTab]);

  const refreshUserTotal = async () => {
    try {
      const res = await getUserTotalInfo({});
      if (res) {
        const { daily_profit, total_amount, active_count } = res;
        setTodayProfit(daily_profit || '0.00');
        setTotalInvestment(total_amount || '0.00');
        setActiveCount(active_count || 0);
      }
    } catch (error) {
      console.error('获取用户总览数据失败:', error);
    }
  };

  const handleStop = () => {
    fetchRunningStrategies();
    refreshUserTotal();
  };

  const handleRestart = () => {
    fetchHistoryStrategies();
  };

  const handleDcaTerminate = () => {
    fetchDcaRunningStrategies();
    refreshUserTotal();
  };

  const handleDcaPause = () => {
    fetchDcaRunningStrategies();
  };

  const handleDcaRestart = (record?: DcaHistoryStrategyData) => {
    if (record?.rawData) {
      setRerunStrategyDetail(record.rawData);
      setShowRerunModal(true);
    }
  };

  const handleDcaRename = (record: DcaStrategyData) => {
    setRenameRecord(record);
    setShowRenameModal(true);
  };

  const handleRenameConfirm = async (name: string) => {
    if (!renameRecord) return;
    try {
      await updateDcaStrategyName({
        strategy_id: renameRecord.id,
        strategy_name: name
      });
      setShowRenameModal(false);
      setRenameRecord(null);
      fetchDcaRunningStrategies();
      message.success(t('rename-success'));
    } catch (error) {
      console.error('修改策略名称失败:', error);
      message.error(t('rename-failed'));
    }
  };

  const handleBack = () => {
    router.push(basePath || '/');
  };

  return (
    <AntdConfig className={styles.page}>
      <SpotQuoteTokenProvider useTickersWs>
        <ConfigProvider theme={AntThemeConfig}>
          <div className={styles.myStrategyPage}>
            <div className={styles.header}>
              <div className={styles.backButton} onClick={handleBack}>
                <BackIcon className={styles.backIcon} />
                <span>{t('back')}</span>
              </div>
            </div>

            <StrategyStats todayProfit={todayProfit} totalInvestment={totalInvestment} />

            <div className={styles.divider}></div>

            <div className={styles.tabSection}>
              {isClientReady ? (
                <Tabs
                  activeKey={activeTab}
                  onChange={(key) => {
                    setActiveTab(key);
                  }}
                  className={styles.mainTabs}
                  items={[
                    {
                      key: 'running',
                      label: `${t('running-strategies')} (${activeCount})`,
                      children: (
                        <div className={styles.tabContent}>
                          <SubTabs tabs={subTabs} activeKey={runningSubTab} onChange={(key) => { setRunningSubTab(key); setCurrentPage(1); }} />
                          {runningSubTab === '1' ? (
                            <StrategyTable
                              dataSource={runningData}
                              onStop={handleStop}
                              loading={loading}
                              pagination={runningTotal > PAGE_SIZE ? {
                                current: currentPage,
                                pageSize: pageSize,
                                total: runningTotal,
                                showSizeChanger: false,
                                onChange: (page, size) => {
                                  setCurrentPage(page);
                                  setPageSize(size);
                                }
                              } : false}
                            />
                          ) : (
                            <DCATable
                              dataSource={dcaRunningData}
                              onTerminate={handleDcaTerminate}
                              onPause={handleDcaPause}
                              onRename={handleDcaRename}
                              loading={loading}
                              pagination={dcaRunningTotal > PAGE_SIZE ? {
                                current: currentPage,
                                pageSize: pageSize,
                                total: dcaRunningTotal,
                                showSizeChanger: false,
                                onChange: (page, size) => {
                                  setCurrentPage(page);
                                  setPageSize(size);
                                }
                              } : false}
                            />
                          )}
                        </div>
                      )
                    },
                    {
                      key: 'history',
                      label: t('history-strategies'),
                      children: (
                        <div className={styles.tabContent}>
                          <SubTabs tabs={subTabs} activeKey={historySubTab} onChange={(key) => { setHistorySubTab(key); setHistoryCurrentPage(1); }} />
                          {historySubTab === '1' ? (
                            <HistoryStrategyTable
                              dataSource={historyData}
                              onRestart={handleRestart}
                              loading={loading}
                              pagination={historyTotal > PAGE_SIZE ? {
                                current: historyCurrentPage,
                                pageSize: historyPageSize,
                                total: historyTotal,
                                showSizeChanger: false,
                                onChange: (page, size) => {
                                  setHistoryCurrentPage(page);
                                  setHistoryPageSize(size);
                                }
                              } : false}
                            />
                          ) : (
                            <DCAHistoryTable
                              dataSource={dcaHistoryData}
                              onRestart={handleDcaRestart}
                              loading={loading}
                              pagination={dcaHistoryTotal > PAGE_SIZE ? {
                                current: historyCurrentPage,
                                pageSize: historyPageSize,
                                total: dcaHistoryTotal,
                                showSizeChanger: false,
                                onChange: (page, size) => {
                                  setHistoryCurrentPage(page);
                                  setHistoryPageSize(size);
                                }
                              } : false}
                            />
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              ) : (
                <div className={styles.tabSkeleton}>
                  <div className={styles.skeletonTitleRow}>
                    <span className={styles.skeletonTitleItem} />
                    <span className={styles.skeletonTitleItem} />
                  </div>
                  <div className={styles.skeletonSubTabs}>
                    <span className={styles.skeletonSubItem} />
                    <span className={styles.skeletonSubItem} />
                  </div>
                  <div className={styles.skeletonTable}>
                    <span className={styles.skeletonLine} />
                    <span className={styles.skeletonLine} />
                    <span className={styles.skeletonLine} />
                  </div>
                </div>
              )}
            </div>

          </div>
        </ConfigProvider>

        <CustomParamsModal
          open={showRerunModal}
          onClose={() => setShowRerunModal(false)}
          onConfirm={() => {
            setShowRerunModal(false);
            fetchDcaHistoryStrategies();
          }}
          title={t('rerun')}
          mode="rerun"
          strategyDetail={rerunStrategyDetail}
        />

        <PlanNameModal
          open={showRenameModal}
          mode="edit"
          initialValue={renameRecord?.strategyName || ''}
          onClose={() => { setShowRenameModal(false); setRenameRecord(null); }}
          onConfirm={handleRenameConfirm}
        />
      </SpotQuoteTokenProvider>
    </AntdConfig>
  );
}

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['trading-bot', 'error_code', 'gitbook-url',],
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
      path: `https://www.easicoin.io/${lc}/trading-bot/my-strategy`
    }
  };
};

export default withLayout(MyStrategy);
