import React, { useState, useEffect } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { Card, Select, Pagination, Popover, Spin } from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { TendChart, Empty } from '@better-bit-fe/base-ui';
import { basePath } from '@better-bit-fe/base-utils';
import TermsModal from '~/components/PublicPart/TermsModal';
import GridBotModal from '~/components/SpotStrategy/GridBotModal';
import CustomParamsModal from '~/components/SpotStrategy/CustomParamsModal';
import ConfirmOrderModal from '~/components/SpotStrategy/ConfirmOrderModal';
import { getStrategyList } from '~/api';
import { ReactComponent as CheckIcon } from '~/public/icons/check.svg';
import { ReactComponent as UserIcon } from '~/public/icons/users.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/icons/arrow-down.svg';
import styles from './index.module.less';

dayjs.extend(duration);

interface BotItem {
  id: number;
  pair: string;
  type: string;
  returnRate: string;
  returnRateDays: number;
  runtime: string;
  maxDrawdown7d: string;
  followers: string;
  chartData: number[];
  isUp: boolean;
  rawData: any;
}

interface BotMarketProps {
  onRefreshHeader?: () => void;
  createOpen?: boolean;
  onCreateClose?: () => void;
}

const BotMarket: React.FC<BotMarketProps> = ({ onRefreshHeader, createOpen, onCreateClose }) => {
  const t = useFm();
  const { userInfo } = useUserInfo();
  const [sortBy, setSortBy] = useState(0); // 0 默认排序
  const [runTime, setRunTime] = useState(0); // 0 全部
  const [profitRate, setProfitRate] = useState(0); // 0 全部
  const [currentPage, setCurrentPage] = useState(1);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isGridBotModalOpen, setIsGridBotModalOpen] = useState(false);
  const [isCustomParamsModalOpen, setIsCustomParamsModalOpen] = useState(false);
  const [strategyType, setStrategyType] = useState(0); // 0 全部
  const [loading, setLoading] = useState(false);
  const [botList, setBotList] = useState<BotItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedBotId, setSelectedBotId] = useState<number | null>(null); // 当前选中的策略ID
  const [isConfirmOrderOpen, setIsConfirmOrderOpen] = useState(false);
  const [strategyParams, setStrategyParams] = useState<any>(null);
  const pageSize = 9; // 每页 9 条数据

  // 格式化运行时长
  const formatRuntime = (seconds: number) => {
    const dur = dayjs.duration(seconds, 'seconds');
    const days = Math.floor(dur.asDays());
    const hours = dur.hours();
    const minutes = dur.minutes();
    return t('runtime-format', { days, hours, minutes });
  };

  // 格式化数字（添加千位分隔符）
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 解析图表数据并转换为百分比变化率
  const parseChartData = (raw: any): number[] => {
    if (!raw) return [];
    
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        return parsed
          .map(item => Number(item))
          .filter(item => !Number.isNaN(item))
          .map(value => (value - 1) * 100);
      }
    } catch (error) {
      console.error('解析图表数据失败:', error);
    }
    
    return [];
  };

  // 获取策略列表
  const fetchStrategyList = async () => {
    setLoading(true);
    try {
      const res = await getStrategyList({
        strategy_type: strategyType,
        filter_profit: profitRate,
        filter_run_time: runTime,
        sort_by: sortBy,
        pageNo: currentPage,
        pageSize
      });

      if (res?.records && Array.isArray(res.records)) {
        const { records, total } = res;
        // 转换数据格式
        const formattedList = records.map((item: any) => {
          const days = Math.floor(item.runSeconds / 86400);
          const chartData = parseChartData(item.chartData);
          const isUp = item.profitRate >= 0;

          return {
            id: item.id,
            pair: item.spotGrid ? `${item.spotGrid.baseToken}/${item.spotGrid.quoteToken}` : '-',
            type: item.strategyType === 1 ? t('spot-grid') : t('spot-dca'),
            returnRate: `${item.profitRate >= 0 ? '+' : ''}${(item.profitRate * 100).toFixed(2)}%`,
            returnRateDays: days, // 运行天数
            runtime: formatRuntime(item.runSeconds),
            maxDrawdown7d: `${(item.maxDrawDown * 100).toFixed(2)}%`,
            followers: formatNumber(item.useCount),
            chartData,
            isUp,
            rawData: item
          };
        });

        setBotList(formattedList);
        setTotal(total);
      }
    } catch (error) {
      console.error('获取策略列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (createOpen) {
      setIsCustomParamsModalOpen(true);
    }
  }, [createOpen]);

  // 监听筛选条件变化
  useEffect(() => {
    fetchStrategyList();
  }, [strategyType, profitRate, runTime, sortBy, currentPage]);

  const gridTermsKey = `trading-bot-terms-agreed:${userInfo?.id ?? ''}`;

  const handleUseBot = (botId: number) => {
    setSelectedBotId(botId);
    const hasAgreedTerms = localStorage.getItem(gridTermsKey);
    if (hasAgreedTerms === 'true') {
      setIsGridBotModalOpen(true);
    } else {
      setIsTermsModalOpen(true);
    }
  };

  const handleTermsConfirm = () => {
    localStorage.setItem(gridTermsKey, 'true');
    setIsTermsModalOpen(false);
    setIsGridBotModalOpen(true);
  };

  // 处理弹框关闭
  const handleTermsClose = () => {
    setIsTermsModalOpen(false);
  };

  // 处理现货网格弹框确认 - 接收策略参数
  const handleGridBotConfirm = (params: any) => {
    console.log('接收到的策略参数:', params);
    setStrategyParams(params);
    setIsGridBotModalOpen(false);
    setIsConfirmOrderOpen(true);
  };

  // 处理现货网格弹框关闭
  const handleGridBotClose = () => {
    setIsGridBotModalOpen(false);
  };

  // 处理自定义参数弹框确认（策略创建成功后的回调）
  const handleCustomParamsConfirm = () => {
    // CustomParamsModal 内部已经处理了关闭和打开 ConfirmOrderModal 的逻辑
    // 这里可以执行创建成功后的额外操作，例如刷新列表、显示成功提示等
    console.log('策略创建流程完成');
    // 可选：刷新策略列表
    // fetchStrategies();
  };

  // 处理自定义参数弹框关闭
  const handleCustomParamsClose = () => {
    setIsCustomParamsModalOpen(false);
    onCreateClose?.();
  };

  // 处理确认订单弹框关闭
  const handleConfirmOrderClose = () => {
    setIsConfirmOrderOpen(false);
  };

  // 处理确认订单弹框确认
  const handleConfirmOrderConfirm = () => {
    setIsConfirmOrderOpen(false);
    // 订单确认后的逻辑
  };

  return (
    <div className={styles.botMarket}>
      <div className={styles.container}>
        <div className={styles.filterSection}>
          <div className={styles.filterControls}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              className={styles.filterSelect}
              classNames={{
                popup: styles.filterDropdown
              }}
              popupMatchSelectWidth={false}
              menuItemSelectedIcon={<CheckIcon />}
              suffixIcon={<ArrowDownIcon />}
              options={[
                { label: t('default-sort'), value: 0 },
                { label: t('highest-return'), value: 1 },
                { label: t('most-copied'), value: 2 },
                { label: t('longest-runtime'), value: 3 },
              ]}
            />
            <Select
              value={runTime}
              onChange={setRunTime}
              className={styles.filterSelect}
              classNames={{
                popup: styles.filterDropdown
              }}
              popupMatchSelectWidth={false}
              menuItemSelectedIcon={<CheckIcon />}
              suffixIcon={<ArrowDownIcon />}
              optionLabelProp="label"
            >
              <Select.Option value={0} label={t('runtime')}>
                {t('all')}
              </Select.Option>
              <Select.Option value={1} label={t('within-1-day')}>{t('within-1-day')}</Select.Option>
              <Select.Option value={2} label={t('within-7-days')}>{t('within-7-days')}</Select.Option>
              <Select.Option value={3} label={t('within-15-days')}>{t('within-15-days')}</Select.Option>
              <Select.Option value={4} label={t('within-30-days')}>{t('within-30-days')}</Select.Option>
              <Select.Option value={5} label={t('over-30-days')}>{t('over-30-days')}</Select.Option>
            </Select>
            <Select
              value={profitRate}
              onChange={setProfitRate}
              className={styles.filterSelect}
              classNames={{
                popup: styles.filterDropdown
              }}
              popupMatchSelectWidth={false}
              menuItemSelectedIcon={<CheckIcon />}
              suffixIcon={<ArrowDownIcon />}
              optionLabelProp="label"
            >
              <Select.Option value={0} label={t('profit-rate')}>
                {t('all')}
              </Select.Option>
              <Select.Option value={1} label="≥ 100%">≥ 100%</Select.Option>
              <Select.Option value={2} label="50% - 100%">50% - 100%</Select.Option>
              <Select.Option value={3} label="10% - 50%">10% - 50%</Select.Option>
              <Select.Option value={4} label="0% - 10%">0% - 10%</Select.Option>
            </Select>
          </div>
        </div>

        <Spin spinning={loading}>
          <div className={styles.botGrid}>
            {botList.length === 0 && !loading && (
              <div style={{ gridColumn: '1 / -1', width: '100%' }}>
                <Empty title="no-data" icon={`${basePath}/images/empty.png`} />
              </div>
            )}
            {botList.map((bot, index) => (
              <Card key={bot.id || index} className={styles.botCard}>
                {/* 第一行：币对 + 标签 + 使用按钮 */}
                <div className={styles.row1}>
                  <div className={styles.botHeader}>
                    <div className={styles.botPair}>{bot.pair}</div>
                    <div className={styles.botType}>{bot.type}</div>
                  </div>
                  <button className={styles.useButton} onClick={() => handleUseBot(bot.id)}>{t('use')}</button>
                </div>

                {/* 第二行：回测收益率 + 图表（图表在整个右上角） */}
                <div className={styles.row2}>
                  <div className={styles.returnRate}>
                    <Popover
                      content={
                        <div className={styles.popoverContent}>
                          {t('backtest-tooltip', { days: bot.returnRateDays })}
                        </div>
                      }
                      trigger="hover"
                      placement="topLeft"
                      styles={{
                        body: {
                          background: 'var(--fill-fill-tooltip-web, #28292a)',
                          borderRadius: '4px',
                          padding: '8px 12px'
                        }
                      }}
                      arrow={{
                        pointAtCenter: true
                      }}
                    >
                      <div className={styles.returnLabel}>{t('backtest-return-rate', { days: bot.returnRateDays })}</div>
                    </Popover>
                    <div className={`${styles.returnValue} ${bot.returnRate.startsWith('-') ? styles.returnValueNegative : ''}`}>{bot.returnRate}</div>
                  </div>
                  <div className={styles.botChart}>
                    {bot.chartData.length > 0 ? (
                      <TendChart
                        chartDataList={bot.chartData.slice(-15)}
                        isUp={bot.isUp}
                        width={76}
                        height={34}
                      />
                    ) : (
                      <div style={{ width: 212, height: 48 }} />
                    )}
                  </div>
                </div>

                {/* 第三行：运行周期 + 7日最大回撤（垂直排列）+ 关注者 */}
                <div className={styles.row3}>
                  <div className={styles.infoGroup}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>{t('runtime-period')}</span>
                      <span className={styles.infoValue}>{bot.runtime}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>{t('max-drawdown-7d')}</span>
                      <span className={styles.infoValue}>{bot.maxDrawdown7d}</span>
                    </div>
                  </div>
                  <div className={styles.followers}>
                    <UserIcon /> {bot.followers}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Spin>

        <div className={styles.paginationWrapper}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
            className={styles.pagination}
          />
        </div>
      </div>

      {/* 条款同意弹框 */}
      <TermsModal
        open={isTermsModalOpen}
        onClose={handleTermsClose}
        onConfirm={handleTermsConfirm}
      />

      {/* 现货网格配置弹框 */}
      <GridBotModal
        open={isGridBotModalOpen}
        onClose={handleGridBotClose}
        onConfirm={handleGridBotConfirm}
        botId={selectedBotId}
      />

      {/* 自定义参数弹框 */}
      <CustomParamsModal
        open={isCustomParamsModalOpen}
        onClose={handleCustomParamsClose}
        onConfirm={handleCustomParamsConfirm}
        title={t('create-grid')}
      />

      {/* 确认订单弹框 */}
      <ConfirmOrderModal
        open={isConfirmOrderOpen}
        onClose={handleConfirmOrderClose}
        onConfirm={handleConfirmOrderConfirm}
        strategyParams={strategyParams}
        onRefresh={() => {
          fetchStrategyList();
          onRefreshHeader?.();
        }}
      />
    </div>
  );
};

export default BotMarket;
