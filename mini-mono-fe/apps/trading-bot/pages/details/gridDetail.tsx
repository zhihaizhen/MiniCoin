import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Breadcrumb, Button, Spin, Pagination, message } from 'antd';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { AntdConfig, Empty, withLayout } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useGlobalWidget, useFm } from '@better-bit-fe/base-hooks';

import { basePath, getSymbolUrl } from '@better-bit-fe/base-utils';

import { TradeDetailModal } from '~/components/SpotStrategy/TradeDetailModal';
import { StopConfirmModal } from '~/components/SpotStrategy/StopConfirmModal';
import CustomParamsModal from '~/components/SpotStrategy/CustomParamsModal';
import ReferralShareModal from '~/components/PublicPart/ReferralShareModal';
import { getStrategyInfoById, addSpotGrid, getUserStrategyOrder, getUserStrategyTrade, getStrategyProfitChart, getReferralInfo } from '~/api';
import { getTerminationConditionsText } from '~/utils';
import { getMinPricePrecision, formatPriceByPrecision } from '~/utils/priceFormatter';
import { QuoteTokensStore } from '~/store/QuoteTokens';
import styles from './index.module.less';

// 动态导入 ProfitChart，禁用 SSR（@ant-design/charts 不支持服务端渲染）
const ProfitChart = dynamic(
  () => import('../../components/PublicPart/ProfitChart').then(mod => mod.ProfitChart),
  { ssr: false }
);

// 获取数字的小数位数
const getDecimalPlaces = (value: number | string): number => {
  const num = Number(value);
  if (Number.isNaN(num) || num === 0) return 0;
  const str = num.toString();
  if (!str.includes('.')) return 0;
  return str.split('.')[1].length;
};

// 找出一组数字中的最大小数位数
const getMaxDecimalPlaces = (...values: (number | string)[]): number => {
  return Math.max(...values.map(v => getDecimalPlaces(v)));
};

// 按照指定小数位数格式化数字
const formatWithPrecision = (value: number | string, precision: number): string => {
  const num = Number(value);
  if (Number.isNaN(num)) return '--';
  return num.toFixed(precision);
};

function StrategyDetails() {
  const t = useFm();
  useGlobalWidget();
  const router = useRouter();
  const { id } = router.query;
  const [tradeDetailVisible, setTradeDetailVisible] = useState(false);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [copyingParams, setCopyingParams] = useState(false);
  const [showCustomParamsModal, setShowCustomParamsModal] = useState(false);
  const [savedDisplayData, setSavedDisplayData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [tradeList, setTradeList] = useState<any[]>([]);
  const [tradeTotal, setTradeTotal] = useState(0);
  const [tradePageNo, setTradePageNo] = useState(1);
  const [tradePageSize] = useState(10);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [profitChartData, setProfitChartData] = useState<any[]>([]);
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedStrategy, setSharedStrategy] = useState<any>(null);

  // 获取策略详情
  useEffect(() => {
    if (!id) return;

    const fetchStrategyDetail = async () => {
      setLoading(true);
      try {
        const res = await getStrategyInfoById({
          strategy_id: Number(id)
        });
        if (res) {
          setStrategyData(res);
        }
      } catch (error) {
        console.error('获取策略详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategyDetail();

    // 获取挂单详情
    const fetchOrderDetail = async () => {
      try {
        const res = await getUserStrategyOrder({
          strategy_id: Number(id)
        });
        if (res) {
          setOrderData(res);
        }
      } catch (error) {
        console.error('获取挂单详情失败:', error);
      }
    };

    fetchOrderDetail();

    // 获取收益图表数据
    const fetchProfitChart = async () => {
      try {
        const res = await getStrategyProfitChart({
          strategy_id: Number(id)
        });
        if (res && Array.isArray(res)) {
          // 转换数据格式
          const formattedData = res.map((item: any) => ({
            originTime: item.profitTime,
            time: dayjs(item.profitTime * 1000).format('MM/DD HH'),
            profit: Number((item.profit || 0).toFixed(2)),
            rate: Number(((item.profitRate || 0) * 100).toFixed(2))
          }));
          setProfitChartData(formattedData);
        }
      } catch (error) {
        console.error('获取收益图表数据失败:', error);
      }
    };

    fetchProfitChart();
  }, [id]);

  // 获取成交记录（分页）
  useEffect(() => {
    if (!id) return;

    const fetchTradeList = async () => {
      setTradeLoading(true);
      try {
        const res = await getUserStrategyTrade({
          strategy_id: Number(id),
          pageNo: tradePageNo,
          pageSize: tradePageSize
        });

        const records = res?.records || res?.data?.records || [];
        const total = res?.total || res?.data?.total || 0;
        setTradeList(records);
        setTradeTotal(total);
      } catch (error) {
        console.error('获取成交记录失败:', error);
        setTradeList([]);
        setTradeTotal(0);
      } finally {
        setTradeLoading(false);
      }
    };

    fetchTradeList();
  }, [id, tradePageNo, tradePageSize]);

  const formatTradeTime = (value: any) => {
    if (!value) return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return '--';
    return dayjs(n > 1e12 ? n : n * 1000).format('YYYY-MM-DD HH:mm:ss');
  };

  const formatProfit = (value: any) => {
    if (value === null || value === undefined || value === '') return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    if (n === 0 || Object.is(n, -0)) return '0';
    const formatted = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    return n > 0 ? `+${formatted}` : formatted;
  };

  const formatPrice = (value: any) => {
    if (value === null || value === undefined || value === '') return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
  };

  const formatQty = (value: any) => {
    if (value === null || value === undefined || value === '') return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    if (n === 0 || Object.is(n, -0)) return '0';
    return n.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  // 获取 spotGrid 数据
  const spotGrid = strategyData?.spotGrid;
  const {
    baseToken,
    quoteToken,
    priceLower,
    priceUpper,
    gridType,
    gridCount,
    gridQty,
    nowPrice,
    allProfit,
    allProfitRate,
    arbitrageAmount,
    arbitrageCount,
    investAmount,
    baseTokenTotal,
    baseTokenLock,
    baseTokenFree,
    quoteTokenTotal,
    quoteTokenLock,
    quoteTokenFree
  } = spotGrid || {};
  const {
    status,
    strategyType,
    useCount: strategyUseCount,
    startedAt,
    stoppedAt,
    createFrom,
    createAt,
    maxDrawDown
  } = strategyData || {};
  const pairName = baseToken && quoteToken ? `${baseToken}/${quoteToken}` : '';

  const { quoteTokens } = QuoteTokensStore.useContainer();

  // 根据币对精度格式化价格
  const minPricePrecision = useMemo(() => {
    if (!spotGrid) return null;
    return getMinPricePrecision(pairName, quoteTokens);
  }, [spotGrid, quoteTokens]);

  const formatOrderPrice = (price: number): string => {
    if (price === null || price === undefined) return '';
    if (minPricePrecision) {
      return formatPriceByPrecision(String(price), minPricePrecision);
    }
    return String(price);
  };

  // 计算格式化后的 base 和 quote token 数据
  const formattedBaseToken = useMemo(() => {
    if (!spotGrid) return { total: 0, lock: 0, free: 0 };

    const lockNum = Number(baseTokenLock) || 0;
    const freeNum = Number(baseTokenFree) || 0;

    if (lockNum === 0 && freeNum === 0) {
      return {
        total: Number(baseTokenTotal) || 0,
        lock: 0,
        free: 0
      };
    }

    const maxPrecision = getMaxDecimalPlaces(baseTokenLock, baseTokenFree);

    return {
      total: formatWithPrecision(baseTokenTotal, maxPrecision),
      lock: formatWithPrecision(baseTokenLock, maxPrecision),
      free: formatWithPrecision(baseTokenFree, maxPrecision)
    };
  }, [spotGrid]);

  const formattedQuoteToken = useMemo(() => {
    if (!spotGrid) return { total: 0, lock: 0, free: 0 };

    const lockNum = Number(quoteTokenLock) || 0;
    const freeNum = Number(quoteTokenFree) || 0;

    if (lockNum === 0 && freeNum === 0) {
      return {
        total: Number(quoteTokenTotal) || 0,
        lock: 0,
        free: 0
      };
    }

    const maxPrecision = getMaxDecimalPlaces(quoteTokenLock, quoteTokenFree);

    return {
      total: formatWithPrecision(quoteTokenTotal, maxPrecision),
      lock: formatWithPrecision(quoteTokenLock, maxPrecision),
      free: formatWithPrecision(quoteTokenFree, maxPrecision)
    };
  }, [spotGrid]);

  const handleGoBack = () => {
    const lc = router.locale || '';
    const tab = router.query.tab || '';
    const sub = router.query.sub || '';
    const qs = tab ? `?tab=${tab}&sub=${sub}` : '';
    window.location.href = `${lc ? `/${lc}` : ''}${basePath}/my-strategy/${qs}`;
  };

  // 处理终止按钮点
  const handleStopClick = () => {
    setStopModalVisible(true);
  };

  const fetchReferralInfo = async () => {
    const res = await getReferralInfo();
    setReferralInfo(res);
  };

  const openShareModal = async () => {
    await fetchReferralInfo();
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const handleShare = () => {
    if (!spotGrid) {
      message.error(t('strategy-data-incomplete'));
      return;
    }

    const profitRateNum = Number(allProfitRate || 0);
    const profitRateText = `${profitRateNum >= 0 ? '+' : ''}${(profitRateNum * 100).toFixed(2)}%`;
    const maxDrawDownNum = Number(maxDrawDown || 0);
    const maxDrawDownText = `${(maxDrawDownNum * 100).toFixed(2)}%`;
    const statusTextMap: Record<number, string> = {
      0: t('not-started'),
      1: t('running'),
      2: t('completed'),
      3: t('terminated')
    };

    setSharedStrategy({
      symbol: pairName,
      profitRate: profitRateText,
      maxDrawDown: maxDrawDownText,
      runningTime: formatRunningTime(),
      status: { text: statusTextMap[status] || '' }
    });
    openShareModal();
  };

  // 终止策略确认
  const handleStopConfirm = async () => {
    // 关闭弹窗
    setStopModalVisible(false);

    // 刷新策略详情
    if (id) {
      try {
        const res = await getStrategyInfoById({
          strategy_id: Number(id)
        });
        if (res) {
          setStrategyData(res);
        }
      } catch (error) {
        console.error('获取策略详情失败:', error);
      }
    }
  };

  // 取消终止
  const handleStopCancel = () => {
    setStopModalVisible(false);
  };

  // 格式化运行时长
  const formatRunningTime = () => {
    if (!startedAt || status === 0) return '';
    const endTime = (status === 2 || status === 3)
      ? (stoppedAt || startedAt)
      : Math.floor(Date.now() / 1000);
    const runSeconds = Math.max(0, endTime - startedAt);
    const days = Math.floor(runSeconds / 86400);
    const hours = Math.floor((runSeconds % 86400) / 3600);
    const minutes = Math.floor((runSeconds % 3600) / 60);
    return t('runtime-format', { days, hours, minutes });
  };

  // 处理复制参数
  const handleCopyParams = () => {
    if (!spotGrid) return;

    // 保存显示数据
    setSavedDisplayData({
      pairName: `${baseToken}/${quoteToken}`,
      pairTag: strategyType === 1 ? t('spot-grid') : t('spot-dca'),
      useCount: strategyUseCount,
      coinPrice: nowPrice
        ? `$${nowPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`
        : undefined,
      priceChange: spotGrid.todayProfitRate !== undefined
        ? `${spotGrid.todayProfitRate >= 0 ? '+' : ''}${(spotGrid.todayProfitRate * 100).toFixed(2)}%`
        : undefined,
      priceLower: priceLower?.toString(),
      priceUpper: priceUpper?.toString(),
      gridCount: gridCount?.toString(),
      gridType: gridType === 1 ? 'arithmetic' : 'geometric'
    });
    setShowCustomParamsModal(true);
  };

  // 处理复制参数确认
  const handleCustomParamsConfirm = async () => {
    if (!strategyData) return;

    setCopyingParams(true);
    try {
      if (!spotGrid) {
        message.error(t('strategy-data-incomplete'));
        return;
      }

      const {
        stopTakeProfit,
        stopLoss,
        stopBreakUpper,
        stopBreakLower
      } = spotGrid;

      // 构建参数
      const params: any = {
        base_token: baseToken,
        quote_token: quoteToken,
        price_lower: priceLower,
        price_upper: priceUpper,
        grid_type: gridType,
        grid_count: gridCount,
        investment_amount: investAmount,
        create_from: 1, // 1=复制
        template_id: strategyData.id
      };

      if (stopTakeProfit) {
        params.stop_take_profit = stopTakeProfit;
      }
      if (stopLoss) {
        params.stop_loss = stopLoss;
      }
      if (stopBreakUpper) {
        params.stop_break_upper = stopBreakUpper;
      }
      if (stopBreakLower) {
        params.stop_break_lower = stopBreakLower;
      }

      await addSpotGrid(params);

      message.success({
        content: t('params-copied-success'),
        duration: 3
      });

      setShowCustomParamsModal(false);

      // 刷新策略详情
      if (id) {
        const res = await getStrategyInfoById({
          strategy_id: Number(id)
        });
        if (res) {
          setStrategyData(res);
        }
      }
    } catch (error) {
      console.error('复制参数运行策略失败:', error);
      message.error(t('params-copied-failed'));
    } finally {
      setCopyingParams(false);
    }
  };

  const handleCustomParamsClose = () => {
    setShowCustomParamsModal(false);
  };

  if (loading) {
    return (
      <AntdConfig className={styles.page}>
        <div className={styles.detailsPage} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </AntdConfig>
    );
  }

  const bidCount = orderData?.bids?.length || 0;
  const askCount = orderData?.asks?.length || 0;
  const totalOrderCount = bidCount + askCount;
  const bidFlexGrow = totalOrderCount > 0 ? bidCount : 1;
  const askFlexGrow = totalOrderCount > 0 ? askCount : 1;

  return (
    <AntdConfig className={styles.page}>
        <div className={styles.detailsPage}>
          <div className={styles.header}>
            <Breadcrumb
              className={styles.breadcrumb}
              separator="/"
              items={[
                {
                  title: (
                    <span className={styles.breadcrumbItem} onClick={handleGoBack}>
                      {t('my-strategies')}
                    </span>
                  )
                },
                {
                  title: <span className={styles.breadcrumbItemActive}>{t('strategy-details')}</span>
                }
              ]}
            />
            {/* 策略信息头部 */}
            <div className={styles.strategyHeader}>
              <div className={styles.strategyInfo}>
                <div className={styles.strategyMain}>
                  <div className={styles.strategyIcon}>
                    <img
                      src={getSymbolUrl(pairName)}
                      alt={baseToken}
                      className={styles.cryptoIcon}
                    />
                    <div className={styles.strategyName}>
                      {pairName}
                    </div>
                  </div>
                  <div className={styles.strategyTags}>
                    <span className={styles.tag}>
                      {strategyType === 1 ? t('spot-grid') : t('spot-dca')}
                    </span>
                    <span className={styles.tagWithDot}>
                      <span className={status === 1 ? styles.dot : styles.dotOrange}></span>
                      {status === 0 ? t('not-started') : status === 1 ? t('running') : status === 2 ? t('completed') : t('terminated')}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.strategyActionButtons}>
                {status === 1 && (
                  <Button
                    className={styles.stopButton}
                    onClick={handleStopClick}
                  >
                    {t('stop')}
                  </Button>
                )}
                {(status === 2 || status === 3) && (
                  <Button
                    className={styles.stopButton}
                    onClick={handleCopyParams}
                    loading={copyingParams}
                  >
                    {t('copy-params')}
                  </Button>
                )}
                <button className={styles.shareButton} onClick={handleShare}>
                  <img src={`${basePath}/icons/share.svg`} alt="Share" width="20" height="20" />
                </button>
              </div>
            </div>
          </div>

          {/* 资金概况卡片 */}
          {(status === 0 || status === 1) && (
            <div className={styles.fundOverviewCard}>
              <h2 className={styles.cardTitle}>{t('fund-overview')}</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>{t('currency')} ({quoteToken || 'USDT'})</div>
                  <div className={styles.statValue}>
                    {baseToken}
                  </div>
                  <div className={styles.statSubValue}>
                    {quoteToken}
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>{t('available-balance')}</div>
                  <div className={styles.statValue}>
                    {formattedBaseToken.free}
                  </div>
                  <div className={styles.statSubValue}>
                    {formattedQuoteToken.free}
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>{t('order-amount')}</div>
                  <div className={styles.statValue}>
                    {formattedBaseToken.lock}
                  </div>
                  <div className={styles.statSubValue}>
                    {formattedQuoteToken.lock}
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>{t('total')}</div>
                  <div className={styles.statValue}>
                    {formattedBaseToken.total}
                  </div>
                  <div className={styles.statSubValue}>
                    {formattedQuoteToken.total}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 策略详情卡片区域 */}
          <div className={styles.detailCardsContainer}>
            {/* 策略总览卡片 */}
            <div className={styles.overviewCard}>
              <h2 className={styles.cardTitle}>{t('strategy-overview')}</h2>

              {/* 第一行：三列数据 */}
              <div className={styles.overviewTopRow}>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('total-profit')} ({quoteToken || 'USDT'})</div>
                  <div className={styles.overviewValue}>
                    {allProfit > 0 ? '+' : ''}{allProfit}
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('profit-rate')}</div>
                  <div className={styles.overviewValue}>
                    {allProfitRate > 0 ? '+' : ''}{((allProfitRate || 0) * 100).toFixed(2)}%
                  </div>
                </div>
                <div className={styles.overviewItem}>
                </div>
              </div>

              <div className={styles.divider}></div>

              {/* 第二行：三列数据 */}
              <div className={styles.overviewRow}>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('grid-profit')}</div>
                  <div className={styles.overviewValue}>
                    {arbitrageAmount?.toFixed(2) || '0.00'} {quoteToken || 'USDT'}
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('total-investment-1')} ({quoteToken || 'USDT'})</div>
                  <div className={styles.overviewValue}>
                    {investAmount?.toLocaleString() || '0.00'}
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('arbitrage-count')}</div>
                  <div className={styles.overviewValue}>{arbitrageCount || 0}</div>
                </div>
              </div>

              {/* 第三行：三列数据 */}
              <div className={styles.overviewRow}>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('create-time')}</div>
                  <div className={styles.overviewValue}>
                    {startedAt ? dayjs.unix(startedAt).format('YYYY-MM-DD HH:mm:ss') : '--'}
                  </div>
                </div>
                {status === 1 ? (
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewLabel}>{t('running-time')}</div>
                    <div className={styles.overviewValue}>
                      {formatRunningTime() || t('not-started')}
                    </div>
                  </div>
                ) : (
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewLabel}>{t('stop-time')}</div>
                    <div className={styles.overviewValue}>
                      {stoppedAt ? dayjs.unix(stoppedAt).format('YYYY-MM-DD HH:mm:ss') : '--'}
                    </div>
                  </div>
                )}
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('source')}</div>
                  <div className={styles.overviewValue}>
                    {createFrom === 1 ? t('copied') : t('manual-created')}
                  </div>
                </div>
                <div className={styles.overviewItem}>
                </div>
              </div>
            </div>

            {/* 收益变化卡片 */}
            <div className={styles.profitChangeCard}>
              <h2 className={styles.cardTitle}>{t('profit-change')}</h2>
              {profitChartData.length < 2 && (<Empty title="no-data" icon={`${basePath}/images/noData.png`} size="small" className="py-11"/>)}
              {profitChartData.length >= 2 && < ProfitChart data={profitChartData} />}
            </div>
          </div>

          {/* 挂单详情卡片 */}
          {(status === 0 || status === 1) && (
            <div className={styles.orderDetailCard}>
              <h2 className={styles.cardTitle}>{t('order-details')}({(orderData?.bids?.length || 0) + (orderData?.asks?.length || 0)})</h2>

              {/* 顶部统计 */}
              <div className={styles.orderStats}>
                <div className={styles.orderStatItem}>
                  <span className={styles.orderStatLabel}>{t('current-price')} ({quoteToken || 'USDT'})</span>
                  <span className={styles.orderStatValue}>
                    {orderData?.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 }) || '0.00'}
                  </span>
                </div>
                <div className={styles.orderStatItem}>
                  <span className={styles.orderStatLabel}>{t('grid-trade-qty')} ({baseToken || '--'})</span>
                  <span className={styles.orderStatValue}>
                    {orderData?.grid_qty || '0.00'}
                  </span>
                </div>
              </div>

              <div className={styles.divider}></div>

              {/* 买单/卖单标签 */}
              <div className={styles.orderTabs}>
                <div
                  className={`${styles.orderTab} ${styles.orderTabBuy}`}
                  style={{ flexGrow: bidFlexGrow, flexBasis: 0 }}
                >
                  {t('buy-orders')}{bidCount}
                </div>
                <div
                  className={`${styles.orderTab} ${styles.orderTabSell}`}
                  style={{ flexGrow: askFlexGrow, flexBasis: 0 }}
                >
                  {t('sell-orders')}{askCount}
                </div>
              </div>

              {/* 表格区域 */}
              <div className={styles.orderTableContainer}>
                <div className={styles.orderTableHeader}>
                  <div className={styles.orderTableCol1}>{t('number')}</div>
                  <div className={styles.orderTableCol2}>{t('order-price')}</div>
                  <div className={styles.orderTableCol3}>
                    {t('change-to-fill')}
                  </div>
                  <div className={styles.orderTableCol4}>{t('order-price')}</div>
                  <div className={styles.orderTableCol5}>{t('number')}</div>
                </div>

                <div className={styles.orderTableBody}>
                  {(() => {
                    const bids = orderData?.bids || [];
                    const asks = orderData?.asks || [];
                    const maxLength = Math.max(bids.length, asks.length);
                    const currentPrice = orderData?.price || 0;

                    return Array.from({ length: maxLength }).map((_, i) => {
                      const bid = bids[i];
                      const ask = asks[i];

                      // 只有买单/卖单任意一侧有数据才渲染该行
                      if (!bid && !ask) return null;

                      const bidPercent =
                        bid && currentPrice > 0 ? ((bid.price - currentPrice) / currentPrice * 100) : null;
                      const askPercent =
                        ask && currentPrice > 0 ? ((ask.price - currentPrice) / currentPrice * 100) : null;
                      const showSeparator = bidPercent !== null || askPercent !== null;

                      return (
                        <div key={i} className={styles.orderTableRow}>
                          <div className={styles.orderTableCol1}>{bid ? i + 1 : ''}</div>
                          <div className={styles.orderTableCol2}>
                            {bid ? formatOrderPrice(bid.price) : ''}
                          </div>
                          <div className={styles.orderTableCol3}>
                            <div className={styles.changeCell}>
                              <span className={`${styles.changeSide} ${styles.changeLeft} ${styles.percentNegative}`}>
                                {bidPercent !== null ? `${bidPercent >= 0 ? '+' : ''}${bidPercent.toFixed(2)}%` : ''}
                              </span>
                              <span className={`${styles.separator} ${!showSeparator ? styles.separatorGhost : ''}`}></span>
                              <span className={`${styles.changeSide} ${styles.changeRight} ${styles.percentPositive}`}>
                                {askPercent !== null ? `${askPercent >= 0 ? '+' : ''}${askPercent.toFixed(2)}%` : ''}
                              </span>
                            </div>
                          </div>
                          <div className={styles.orderTableCol4}>
                            {ask ? formatOrderPrice(ask.price) : ''}
                          </div>
                          <div className={styles.orderTableCol5}>{ask ? i + 1 : ''}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* 成交记录卡片 */}
          <div className={styles.tradeRecordCard}>
            <h2 className={styles.cardTitle}>{t('trade-records')}({tradeTotal || tradeList.length})</h2>

            {/* 表格 */}
            <div className={styles.tradeTableContainer}>
              <div className={styles.tradeTableHeader}>
                <div className={styles.tradeTableCol1}>{t('completed-time')}</div>
                <div className={styles.tradeTableCol2}>{t('grid-profit')} (USDT)</div>
                <div className={styles.tradeTableCol3}>{t('actions')}</div>
              </div>

              {tradeLoading ? (
                <div className={styles.tradeLoadingWrapper}>
                  <Spin />
                </div>
              ) : tradeList.map((item: any, idx: number) => {
                const timeText = (() => {
                  // status: 1=待成交 2=已成交
                  if (item?.status === 1) {
                    return t('pending');
                  }
                  if (item?.status === 2) {
                    return formatTradeTime(item?.closeOrderTime);
                  }
                  return '--';
                })();
                const profitValue = item.closePnl;
                return (
                  <div key={item.id || idx} className={styles.tradeTableRow}>
                    <div className={styles.tradeTableCol1}>{timeText}</div>
                    <div className={styles.tradeTableCol2}>{formatProfit(profitValue)}</div>
                    <div className={styles.tradeTableCol3}>
                      <span className={styles.tradeAction} onClick={() => {
                        setSelectedTrade(item);
                        setTradeDetailVisible(true);
                      }}>
                        {t('view-details')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {tradeTotal > tradePageSize && (
              <div className={styles.tradePaginationWrapper}>
                <Pagination
                  current={tradePageNo}
                  total={tradeTotal}
                  pageSize={tradePageSize}
                  onChange={setTradePageNo}
                  showSizeChanger={false}
                  className={styles.tradePagination}
                />
              </div>
            )}
          </div>

          {/* 策略参数卡片 */}
          <div className={styles.strategyParamsCard}>
            <h2 className={styles.cardTitle}>{t('strategy-params')}</h2>

            {/* 第一行 */}
            <div className={styles.paramsRow}>
              <div className={styles.paramItem}>
                <div className={styles.paramLabel}>{t('price-range')} ({quoteToken || 'USDT'})</div>
                <div className={styles.paramValue}>
                  {formatPrice(priceLower)}~{formatPrice(priceUpper)}
                </div>
              </div>
              <div className={styles.paramItem}>
                <div className={styles.paramLabel}>{t('grid-quantity-1')}</div>
                <div className={styles.paramValue}>{gridCount ?? '--'}</div>
              </div>
              <div className={styles.paramItem}>
                <div className={styles.paramLabel}>{t('grid-trade-qty-amount')}</div>
                <div className={styles.paramValue}>
                  {formatQty(gridQty)} {baseToken || ''}
                </div>
              </div>
            </div>

            {/* 第二行 */}
            <div className={styles.paramsRow}>
              <div className={styles.paramItem}>
                <div className={styles.paramLabel}>{t('grid-mode')}</div>
                <div className={styles.paramValue}>
                  {gridType === 1 ? t('arithmetic') : gridType === 2 ? t('geometric') : '--'}
                </div>
              </div>
              <div className={styles.paramItem}>
                <div className={styles.paramLabel}>{t('stop-condition')}</div>
                <div className={styles.paramValue}>
                  {getTerminationConditionsText(spotGrid || {}, t)}
                </div>
              </div>
              <div className={styles.paramItem}>
                <div className={styles.paramLabel}>{t('create-time')}</div>
                <div className={styles.paramValue}>{formatTradeTime(createAt)}</div>
              </div>
            </div>
          </div>

          {/* 成交明细弹框 */}
          <TradeDetailModal
            visible={tradeDetailVisible}
            onClose={() => {
              setTradeDetailVisible(false);
              setSelectedTrade(null);
            }}
            tradeData={selectedTrade}
            minPricePrecision={minPricePrecision}
          />

          <StopConfirmModal
            visible={stopModalVisible}
            strategyName={pairName}
            runningTime={formatRunningTime()}
            strategyId={id as string}
            spotGrid={spotGrid ? {
              baseToken,
              quoteToken,
              baseTokenTotal,
              quoteTokenTotal
            } : undefined}
            onConfirm={handleStopConfirm}
            onCancel={handleStopCancel}
          />

          <CustomParamsModal
            open={showCustomParamsModal}
            onClose={handleCustomParamsClose}
            onConfirm={handleCustomParamsConfirm}
            title={t('copy-params')}
            isCustomParams={false}
            strategyDetail={strategyData}
            displayData={savedDisplayData}
          />

          <ReferralShareModal
            referralInfo={referralInfo || {}}
            modalOpen={showShareModal}
            onClose={closeShareModal}
            strategyData={sharedStrategy}
            strategyTypeLabel={t('grid-trading-bot')}
            extraStatLabel={t('7D-drawdown')}
            extraStatValue={sharedStrategy?.maxDrawDown}
          />
        </div>
    </AntdConfig>
  );
}

export { StrategyDetails };

export const getStaticProps = async (ctx: any) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['trading-bot', 'error_code', 'gitbook-url'],
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

export default withLayout(StrategyDetails);
