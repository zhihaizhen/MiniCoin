import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Breadcrumb, Button, Spin, Pagination, Select } from 'antd';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { AntdConfig, Empty, withLayout } from '@better-bit-fe/base-ui';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useGlobalWidget, useFm } from '@better-bit-fe/base-hooks';
import { basePath, getSymbolUrl } from '@better-bit-fe/base-utils';
import { ReactComponent as CheckIcon } from '~/public/icons/check.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/icons/arrow-down.svg';

import {
  getDcaUserStrategyInfo,
  getDcaUserStrategyAssets,
  getDcaUserStrategyPlans,
  getDcaUserStrategyTrades,
  getReferralInfo
} from '~/api';
import { DcaTradeDetailModal } from '~/components/SpotDCA/TradeDetailModal';
import { StopConfirmModal } from '~/components/SpotDCA/StopConfirmModal';
import { DcaConfirmModal } from '~/components/SpotDCA/DcaConfirmModal';
import CustomParamsModal from '~/components/SpotDCA/CustomParamsModal';
import ReferralShareModal from '~/components/PublicPart/ReferralShareModal';
import { parseCronToText, formatStrategyRuntime } from '~/utils';
import styles from './index.module.less';

const ProfitChart = dynamic(
  () => import('../../components/PublicPart/ProfitChart').then(mod => mod.ProfitChart),
  { ssr: false }
);

const PAGE_SIZE = 10;

function DcaDetail() {
  const t = useFm();
  useGlobalWidget();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [assetsData, setAssetsData] = useState<any[]>([]);
  const [planList, setPlanList] = useState<any[]>([]);
  const [planTotal, setPlanTotal] = useState(0);
  const [planPageNo, setPlanPageNo] = useState(1);
  const [planLoading, setPlanLoading] = useState(false);
  const [profitChartData, setProfitChartData] = useState<any[]>([]);
  const [tradeDetailVisible, setTradeDetailVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [tradeDetails, setTradeDetails] = useState<any[]>([]);
  const [tradeDetailLoading, setTradeDetailLoading] = useState(false);
  const [filterCoin, setFilterCoin] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const isRunning = strategyData?.executionStatus === 'running';
  const isPaused = strategyData?.executionStatus === 'paused';
  const isTerminated = strategyData?.executionStatus === 'terminated';
  const isActive = isRunning || isPaused;

  const fetchStrategyDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getDcaUserStrategyInfo({ strategy_id: id });
      if (res) {
        setStrategyData(res);
        // 解析收益曲线：profitCurve / roiCurve 格式均为 { dt: ms, value }，按索引一一对应
        try {
          const rawProfit = typeof res.profitCurve === 'string'
            ? JSON.parse(res.profitCurve)
            : res.profitCurve;
          const rawRoi = typeof res.roiCurve === 'string'
            ? JSON.parse(res.roiCurve)
            : res.roiCurve;
          if (Array.isArray(rawProfit) && rawProfit.length > 0) {
            const recent = rawProfit.slice(-10);
            const roiList: any[] = Array.isArray(rawRoi) ? rawRoi : [];
            const roiOffset = rawProfit.length - recent.length;
            const formattedData = recent.map((item: any, idx: number) => {
              const roiItem = roiList[roiOffset + idx];
              return {
                originTime: Math.floor(item.dt / 1000),
                time: dayjs(item.dt).format('MM/DD'),
                profit: Number((item.value || 0).toFixed(2)),
                rate: Number(((roiItem?.value || 0) * 100).toFixed(2))
              };
            });
            setProfitChartData(formattedData);
          }
        } catch {
          // 解析失败时保持空数据
        }
      }
    } catch (error) {
      console.error('获取DCA策略详情失败:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAssets = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getDcaUserStrategyAssets({ strategy_id: id });
      if (res && Array.isArray(res)) {
        setAssetsData(res);
      } else if (res?.records) {
        setAssetsData(res.records);
      }
    } catch (error) {
      console.error('获取DCA策略资产失败:', error);
    }
  }, [id]);

  const fetchPlans = useCallback(async () => {
    if (!id) return;
    setPlanLoading(true);
    try {
      const params: any = {
        strategy_id: id,
        pageNo: planPageNo,
        pageSize: PAGE_SIZE
      };
      if (filterCoin) params.token = filterCoin;
      if (filterStatus) params.exec_status = filterStatus;
      const res = await getDcaUserStrategyPlans(params);
      const records = res?.records || res?.data?.records || [];
      const total = res?.total || res?.data?.total || 0;
      setPlanList(records);
      setPlanTotal(total);
    } catch (error) {
      console.error('获取DCA执行计划失败:', error);
      setPlanList([]);
      setPlanTotal(0);
    } finally {
      setPlanLoading(false);
    }
  }, [id, planPageNo, filterCoin, filterStatus]);

  useEffect(() => {
    fetchStrategyDetail();
    if (isActive || !strategyData) {
      fetchAssets();
    }
  }, [id]);

  useEffect(() => {
    if (strategyData && isActive) {
      fetchAssets();
    }
  }, [strategyData?.executionStatus]);

  useEffect(() => {
    fetchPlans();
  }, [id, planPageNo, filterCoin, filterStatus]);

  const handleFilterCoinChange = (val: string) => {
    setFilterCoin(val);
    setPlanPageNo(1);
  };

  const handleFilterStatusChange = (val: string) => {
    setFilterStatus(val);
    setPlanPageNo(1);
  };

  const handleGoBack = () => {
    const lc = router.locale || '';
    const tab = router.query.tab || '';
    const sub = router.query.sub || '';
    const qs = tab ? `?tab=${tab}&sub=${sub}` : '';
    window.location.href = `${lc ? `/${lc}` : ''}${basePath}/my-strategy/${qs}`;
  };

  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'pause' | 'resume'>('pause');
  const [showCustomParamsModal, setShowCustomParamsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [sharedStrategy, setSharedStrategy] = useState<any>(null);

  const handleStopClick = () => {
    setStopModalVisible(true);
  };

  const handleStopConfirm = () => {
    setStopModalVisible(false);
    fetchStrategyDetail();
  };

  const handlePauseClick = () => {
    setConfirmMode('pause');
    setConfirmModalVisible(true);
  };

  const handleResumeClick = () => {
    setConfirmMode('resume');
    setConfirmModalVisible(true);
  };

  const handleConfirmModalConfirm = () => {
    setConfirmModalVisible(false);
    fetchStrategyDetail();
  };

  const handleRerun = () => {
    setShowCustomParamsModal(true);
  };

  const handleShare = async () => {
    if (!strategyData) return;
    const res = await getReferralInfo();
    setReferralInfo(res);

    const profitRateNum = Number(strategyData.profitRate || 0);
    const profitRateText = `${profitRateNum >= 0 ? '+' : ''}${(profitRateNum * 100).toFixed(2)}%`;
    const statusTextMap: Record<string, string> = {
      running: t('running'),
      paused: t('paused'),
      terminated: t('terminated')
    };

    const apyValue = Number(strategyData.apy || 0);
    const apyText = `${apyValue >= 0 ? '+' : ''}${(apyValue * 100).toFixed(2)}%`;
    setSharedStrategy({
      symbol: strategyData.relationCoin || '',
      profitRate: profitRateText,
      apy: apyText,
      runningTime: formatRunningTime(),
      status: { text: statusTextMap[strategyData.executionStatus] || '' }
    });
    setShowShareModal(true);
  };

  const handleViewTradeDetail = async (plan: any) => {
    setSelectedPlan(plan);
    setTradeDetailVisible(true);
    setTradeDetailLoading(true);
    try {
      const res = await getDcaUserStrategyTrades({
        strategy_id: id,
        strategy_exec_plan_id: plan.id
      });
      if (res && Array.isArray(res)) {
        setTradeDetails(res);
      } else if (res?.records) {
        setTradeDetails(res.records);
      } else {
        setTradeDetails([]);
      }
    } catch (error) {
      console.error('获取成交明细失败:', error);
      setTradeDetails([]);
    } finally {
      setTradeDetailLoading(false);
    }
  };

  const closeTradeDetail = () => {
    setTradeDetailVisible(false);
    setSelectedPlan(null);
    setTradeDetails([]);
  };

  const formatRunningTime = () => formatStrategyRuntime(strategyData?.strategyInterval);

  const formatTime = (value: any) => {
    if (!value) return '--';
    const utcVal = /[Z+]/.test(value) ? value : `${value}Z`;
    const d = dayjs(utcVal);
    return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : '--';
  };

  const profitColor = (text: string) => {
    if (text.startsWith('+')) return { color: 'var(--text-green, #72cc29)' };
    if (text.startsWith('-')) return { color: 'var(--text-red, #f43f5e)' };
    return undefined;
  };

  const formatProfit = (value: any) => {
    if (value === null || value === undefined || value === '') return '--';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    if (n === 0 || Object.is(n, -0)) return '0';
    const formatted = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    return n > 0 ? `+${formatted}` : formatted;
  };

  const parsePriceConfig = (priceConfig: any): any[] => {
    if (!priceConfig) return [];
    try {
      return typeof priceConfig === 'string' ? JSON.parse(priceConfig) : priceConfig;
    } catch {
      return [];
    }
  };

  const coinOptions = useMemo(() => {
    const configs = parsePriceConfig(strategyData?.priceConfig);
    return configs.map((c: any) => ({ label: c.coin, value: c.coin }));
  }, [strategyData?.priceConfig]);

  if (loading || !strategyData) {
    return (
      <AntdConfig className={styles.page}>
        <div className={styles.detailsPage} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </AntdConfig>
    );
  }

  const { roi, margin, pnl, totalMargin, apy, strategyCron, priceConfig, nextExecAt, createdAt, updatedAt, strategyName, execCount } = strategyData || {};

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
                  <div className={styles.strategyName}>
                    {strategyName || t('spot-dca')}
                  </div>
                </div>
                <div className={styles.strategyTags}>
                  <span className={styles.tag}>{t('spot-dca')}</span>
                  <span className={styles.tagWithDot}>
                    <span className={isActive ? styles.dot : styles.dotOrange}></span>
                    {isRunning ? t('running') : isPaused ? t('paused') : t('terminated')}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.strategyActionButtons}>
              {isRunning && (
                <Button className={styles.stopButton} onClick={handlePauseClick}>
                  {t('pause')}
                </Button>
              )}
              {isPaused && (
                <Button className={styles.stopButton} onClick={handleResumeClick}>
                  {t('resume')}
                </Button>
              )}
              {isActive && (
                <Button className={styles.stopButton} onClick={handleStopClick}>
                  {t('stop')}
                </Button>
              )}
              {isTerminated && (
                <Button className={styles.stopButton} onClick={handleRerun}>
                  {t('rerun')}
                </Button>
              )}
              <button className={styles.shareButton} onClick={handleShare}>
                <img src={`${basePath}/icons/share.svg`} alt="Share" width="20" height="20" />
              </button>
            </div>
          </div>
        </div>

        {/* 策略总览卡片 */}
        <div className={styles.detailCardsContainer}>
          <div className={styles.overviewCard}>
            <h2 className={styles.cardTitle}>{t('strategy-overview')}</h2>

            {/* 第一行：总收益 / 收益率（突出显示） */}
            <div className={styles.overviewTopRow}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>{t('total-profit')} (USDT)</div>
                {(() => { const txt = formatProfit(Number(pnl) || 0); return <div className={styles.overviewValue} style={profitColor(txt)}>{txt}</div>; })()}
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>{t('profit-rate')}</div>
                {(() => { const r = roi ? `${Number(roi) >= 0 ? '+' : ''}${(Number(roi) * 100).toFixed(2)}%` : '--'; return <div className={styles.overviewValue} style={r !== '+0.00%' ? profitColor(r) : undefined}>{r}</div>; })()}
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* 第二行：总投资额 / 年化收益率 / 创建时间 */}
            <div className={styles.overviewRow}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>{t('total-investment-1')}</div>
                <div className={styles.overviewValue}>
                  {totalMargin ? `${Number(totalMargin).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` : '0.00 USDT'}
                </div>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>{t('annual-yield')}</div>
                <div className={styles.overviewValue}>
                  {apy ? `${(Number(apy) * 100).toFixed(2)}%` : '0.00%'}
                </div>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>{t('create-time')}</div>
                <div className={styles.overviewValue}>{formatTime(createdAt)}</div>
              </div>
            </div>

            {/* 运行中第三行：运行时长 / 策略来源 / 投资账户 */}
            {!isTerminated && (
              <div className={styles.overviewRow}>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('running-time')}</div>
                  <div className={styles.overviewValue}>{formatRunningTime()}</div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('source')}</div>
                  <div className={styles.overviewValue}>{strategyData?.strategySource ? t(strategyData.strategySource) : '--'}</div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('investment-account')}</div>
                  <div className={styles.overviewValue}>{t('spot-account')}</div>
                </div>
              </div>
            )}

            {/* 已终止第三行：终止时间 / 终止原因 / 策略来源 */}
            {isTerminated && (
              <div className={styles.overviewRow}>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('stop-time')}</div>
                  <div className={styles.overviewValue}>{formatTime(updatedAt)}</div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('stop-reason')}</div>
                  <div className={styles.overviewValue}>{strategyData?.stopType ? t(`stop-reason-${strategyData.stopType}`) : '--'}</div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('source')}</div>
                  <div className={styles.overviewValue}>{strategyData?.strategySource ? t(strategyData.strategySource) : '--'}</div>
                </div>
              </div>
            )}

            {/* 已终止第四行：投资账户 */}
            {isTerminated && (
              <div className={styles.overviewRow}>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>{t('investment-account')}</div>
                  <div className={styles.overviewValue}>{t('spot-account')}</div>
                </div>
              </div>
            )}
          </div>

          {/* 收益变化卡片 */}
          <div className={styles.profitChangeCard}>
            <h2 className={styles.cardTitle}>{t('profit-change')}</h2>
            {profitChartData.length < 2 && (
              <div className={styles.emptyCenter}>
                <Empty title="no-data" icon={`${basePath}/images/noData.png`} size="small" />
              </div>
            )}
            {profitChartData.length >= 2 && <ProfitChart data={profitChartData} />}
          </div>
        </div>

        {/* 策略参数卡片 */}
        <div className={styles.strategyParamsCard}>
          <h2 className={styles.cardTitle}>{t('strategy-params')}</h2>

          {/* 币种配置：每个币种独立 tag，含 icon、占比、价格区间 */}
          <div className={styles.coinConfigSection}>
            <div className={styles.paramLabel}>{t('coin-config')}</div>
            <div className={styles.coinConfigTags}>
              {parsePriceConfig(priceConfig).map((c: any, idx: number) => {
                const ratio = `${c.ratio}%`;
                const priceRange = c.min && c.max
                  ? `${c.min}-${c.max}`
                  : c.min ? `≥${c.min}` : c.max ? `≤${c.max}` : (t('not-set'));
                return (
                  <div key={idx} className={styles.coinConfigTag}>
                    <img className={styles.tagCoinIcon} src={getSymbolUrl(c.coin)} alt={c.coin} />
                    <span className={styles.tagText}>{c.coin}</span>
                    <span className={styles.tagSep}>丨</span>
                    <span className={styles.tagText}>{ratio}</span>
                    <span className={styles.tagSep}>丨</span>
                    <span className={styles.tagText}>{priceRange}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 其余 4 个参数一行展示 */}
          <div className={styles.paramsRow}>
            <div className={styles.paramItem}>
              <div className={styles.paramLabel}>{t('invest-per-time')}</div>
              <div className={styles.paramValue}>{margin ? `${Number(margin)} USDT` : '--'}</div>
            </div>
            <div className={styles.paramItem}>
              <div className={styles.paramLabel}>{t('dca-cycle')}</div>
              <div className={styles.paramValue}>{parseCronToText(strategyCron, t)}</div>
            </div>
            {!isTerminated && (
              <div className={styles.paramItem}>
                <div className={styles.paramLabel}>{t('next-invest-time')}</div>
                <div className={styles.paramValue}>{isRunning ? formatTime(nextExecAt) : '--'}</div>
              </div>
            )}
            <div className={styles.paramItem}>
              <div className={styles.paramLabel}>{t('exec-count')}</div>
              <div className={styles.paramValue}>{execCount ?? strategyData?.executeCount ?? '--'}</div>
            </div>
          </div>
        </div>

        {/* 当前持仓卡片（仅运行中/暂停中显示） */}
        {isActive && assetsData.length > 0 && (
          <div className={styles.strategyParamsCard}>
            <h2 className={styles.cardTitle}>{t('current-holdings')}</h2>
            {assetsData.map((asset: any, idx: number) => (
              <div key={asset.tokenId || idx} className={styles.holdingsItem}>
                <div className={styles.paramsRow}>
                  <div className={styles.paramItem}>
                    <div className={styles.paramLabel}>{t('currency')}</div>
                    <div className={`${styles.paramValue} ${styles.paramValueWithIcon}`}>
                      <img
                        src={getSymbolUrl(asset.tokenId)}
                        alt={asset.tokenId}
                        className={styles.tokenIcon}
                      />
                      {asset.tokenId || '--'}
                    </div>
                  </div>
                  <div className={styles.paramItem}>
                    <div className={styles.paramLabel}>{t('avg-price')}</div>
                    <div className={styles.paramValue}>{asset.avgPrice != null ? `${Number(asset.avgPrice).toLocaleString('en-US', { maximumFractionDigits: 8 })} USDT` : '--'}</div>
                  </div>
                  <div className={styles.paramItem}>
                    <div className={styles.paramLabel}>{t('buy-quantity')}</div>
                    <div className={styles.paramValue}>{asset.qty != null ? Number(asset.qty).toLocaleString('en-US', { maximumFractionDigits: 8 }) : '--'}</div>
                  </div>
                  <div className={styles.paramItem}>
                    <div className={styles.paramLabel}>{t('total-investment-1')}</div>
                    <div className={styles.paramValue}>{asset.margin != null ? `${Number(asset.margin).toLocaleString()} USDT` : '--'}</div>
                  </div>
                </div>
                <div className={styles.paramsRow}>
                  <div className={styles.paramItem}>
                    <div className={styles.paramLabel}>{t('market-price')}</div>
                    <div className={styles.paramValue}>{asset.marketPrice != null ? `${Number(asset.marketPrice).toLocaleString('en-US', { maximumFractionDigits: 8 })} USDT` : '--'}</div>
                  </div>
                  <div className={styles.paramItem}>
                    <div className={styles.paramLabel}>{t('profit')}</div>
                    <div className={`${styles.paramValue} ${Number(asset.pnl) < 0 ? styles.valueRed : Number(asset.pnl) > 0 ? styles.valueGreen : ''}`}>
                      {asset.pnl != null ? `${formatProfit(asset.pnl)} USDT` : '--'}
                    </div>
                  </div>
                  <div className={styles.paramItem}>
                    <div className={styles.paramLabel}>{t('profit-rate')}</div>
                    <div className={`${styles.paramValue} ${Number(asset.roi) < 0 ? styles.valueRed : Number(asset.roi) > 0 ? styles.valueGreen : ''}`}>
                      {asset.roi != null ? `${Number(asset.roi) >= 0 ? '+' : ''}${(Number(asset.roi) * 100).toFixed(2)}%` : '--'}
                    </div>
                  </div>
                  <div className={styles.paramItem}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 成交记录卡片 */}
        <div className={styles.tradeRecordCard}>
          <div className={styles.tradeRecordCardHeader}>
            <h2 className={styles.cardTitle}>{t('trade-records')}({planTotal || planList.length})</h2>
            <div className={styles.tradeFilters}>
              <Select
                value={filterCoin}
                onChange={handleFilterCoinChange}
                className={styles.filterSelect}
                classNames={{ popup: { root: styles.filterDropdown } }}
                popupMatchSelectWidth={false}
                menuItemSelectedIcon={<CheckIcon />}
                suffixIcon={<ArrowDownIcon />}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={[
                  { label: t('all-coins'), value: '' },
                  ...coinOptions
                ]}
              />
              <Select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                className={styles.filterSelect}
                classNames={{ popup: { root: styles.filterDropdown } }}
                popupMatchSelectWidth={false}
                menuItemSelectedIcon={<CheckIcon />}
                suffixIcon={<ArrowDownIcon />}
                options={[
                  { label: t('all-status'), value: '' },
                  { label: t('invest-success'), value: 'success' },
                  { label: t('invest-failed'), value: 'failed' }
                ]}
              />
            </div>
          </div>

          <div className={styles.tradeTableContainer}>
            <div className={styles.tradeTableHeader}>
              <div className={styles.tradeTableCol1}>{t('invest-time')}</div>
              <div className={styles.tradeTableCol2}>{t('invest-coins')}</div>
              <div className={styles.tradeTableCol3}>{t('invest-status')}</div>
              <div className={styles.tradeTableCol3Right}>{t('actions')}</div>
            </div>

            {planLoading ? (
              <div className={styles.tradeLoadingWrapper}>
                <Spin />
              </div>
            ) : planList.length === 0 ? (
              <Empty title="no-data" icon={`${basePath}/images/noData.png`} size="small" />
            ) : planList.map((item: any, idx: number) => (
              <div key={item.id || idx} className={styles.tradeTableRow}>
                <div className={styles.tradeTableCol1}>{formatTime(item.planExecAt)}</div>
                <div className={styles.tradeTableCol2}>{item.symbolId || '--'}</div>
                <div className={styles.tradeTableCol3}>
                  {({ success: t('invest-success'), failed: t('invest-failed') }[item.execStatus as string] ?? '--')}
                </div>
                <div className={styles.tradeTableCol3Right}>
                  <span className={styles.tradeAction} onClick={() => handleViewTradeDetail(item)}>
                    {t('view-details')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {planTotal > PAGE_SIZE && (
            <div className={styles.tradePaginationWrapper}>
              <Pagination
                current={planPageNo}
                total={planTotal}
                pageSize={PAGE_SIZE}
                onChange={setPlanPageNo}
                showSizeChanger={false}
                className={styles.tradePagination}
              />
            </div>
          )}
        </div>

        {/* 成交明细弹框 */}
        <DcaTradeDetailModal
          visible={tradeDetailVisible}
          onClose={closeTradeDetail}
          trades={tradeDetails}
          loading={tradeDetailLoading}
          remarkCode={selectedPlan?.remarkCode}
          isActive={isActive}
          planExecAt={selectedPlan?.planExecAt}
          planSymbol={selectedPlan?.symbolId}
        />

        {/* 终止确认弹框 */}
        <StopConfirmModal
          visible={stopModalVisible}
          strategyId={id as string}
          onConfirm={handleStopConfirm}
          onCancel={() => setStopModalVisible(false)}
        />

        {/* 暂停/恢复确认弹框 */}
        <DcaConfirmModal
          visible={confirmModalVisible}
          strategyId={id as string}
          mode={confirmMode}
          onConfirm={handleConfirmModalConfirm}
          onCancel={() => setConfirmModalVisible(false)}
        />

        {/* 重新运行 - 自定义参数弹框 */}
        <CustomParamsModal
          open={showCustomParamsModal}
          onClose={() => setShowCustomParamsModal(false)}
          onConfirm={() => {
            setShowCustomParamsModal(false);
            fetchStrategyDetail();
          }}
          title={t('rerun')}
          mode="rerun"
          strategyDetail={strategyData}
        />

        {/* 分享弹框 */}
        <ReferralShareModal
          referralInfo={referralInfo || {}}
          modalOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          strategyData={sharedStrategy}
          strategyTypeLabel={t('spot-dca')}
          extraStatLabel={t('annualized-return')}
          extraStatValue={sharedStrategy?.apy}
        />
      </div>
    </AntdConfig>
  );
}

export { DcaDetail };

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

export default withLayout(DcaDetail);
