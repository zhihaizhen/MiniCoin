import React, { useState, useEffect } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { Card, Select, Pagination, Popover, Spin } from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { TendChart, Empty } from '@better-bit-fe/base-ui';
import { getSymbolUrl, basePath } from '@better-bit-fe/base-utils';
import TermsModal from '~/components/PublicPart/TermsModal';
import GridBotModal from '~/components/SpotDCA/GridBotModal';
import CustomParamsModal from '~/components/SpotDCA/CustomParamsModal';
import { getDcaRecommendList } from '~/api';
import { ReactComponent as CheckIcon } from '~/public/icons/check.svg';
import { ReactComponent as UserIcon } from '~/public/icons/users.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/icons/arrow-down.svg';
import styles from './index.module.less';

dayjs.extend(duration);


interface DcaBotItem {
  id: number;
  strategyName: string;
  relationCoin: string;
  coinList: string[];
  roi: number;
  roiPercent: string;
  retracement: string;
  apy: number;
  runtime: string;
  useCount: string;
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
  const [sortBy, setSortBy] = useState(0);
  const [runTime, setRunTime] = useState(0);
  const [profitRate, setProfitRate] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isGridBotModalOpen, setIsGridBotModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [botList, setBotList] = useState<DcaBotItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedBotId, setSelectedBotId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pageSize = 9;

  const formatRuntime = (seconds: number) => {
    const dur = dayjs.duration(seconds, 'seconds');
    const days = Math.floor(dur.asDays());
    const hours = dur.hours();
    const minutes = dur.minutes();
    return t('runtime-format', { days, hours, minutes });
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseRoiCurve = (raw: any): number[] => {
    if (!raw) return [];
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          const value = typeof item === 'object' ? item.value : Number(item);
          return Number(value) * 100;
        });
      }
    } catch (error) {
      console.error('Parse roiCurve failed:', error);
    }
    return [];
  };

  const getSortByParam = (val: number) => {
    const map: Record<number, string> = { 0: '', 1: 'roi', 2: 'use_count', 3: 'strategy_interval' };
    return map[val] || '';
  };

  // 运行时间筛选 -> filter_interval JSON 字符串
  // 0: 全部, 1: 1天内(<=86400s), 2: 7天内(<=604800s), 3: 15天内(<=1296000s), 4: 30天内(<=2592000s), 5: 30天以上(>2592000s)
  const getFilterInterval = (val: number): string | undefined => {
    const map: Record<number, object[]> = {
      1: [{ notation: '<=', value: '86400' }],
      2: [{ notation: '<=', value: '604800' }],
      3: [{ notation: '<=', value: '1296000' }],
      4: [{ notation: '<=', value: '2592000' }],
      5: [{ notation: '>', value: '2592000' }]
    };
    return val > 0 ? JSON.stringify(map[val]) : undefined;
  };

  // 收益率筛选 -> filter_roi JSON 字符串
  // 0: 全部, 1: >=100%(>=1), 2: 50%-100%(>=0.5,<=1), 3: 10%-50%(>=0.1,<=0.5), 4: 0%-10%(>=0,<=0.1)
  const getFilterRoi = (val: number): string | undefined => {
    const map: Record<number, object[]> = {
      1: [{ notation: '>=', value: '1' }],
      2: [{ notation: '>=', value: '0.5' }, { notation: '<=', value: '1' }],
      3: [{ notation: '>=', value: '0.1' }, { notation: '<=', value: '0.5' }],
      4: [{ notation: '>=', value: '0' }, { notation: '<=', value: '0.1' }]
    };
    return val > 0 ? JSON.stringify(map[val]) : undefined;
  };

  const fetchDcaList = async () => {
    setLoading(true);
    try {
      const filterInterval = getFilterInterval(runTime);
      const filterRoi = getFilterRoi(profitRate);
      const res = await getDcaRecommendList({
        sort_by: getSortByParam(sortBy),
        ...(filterInterval ? { filter_interval: filterInterval } : {}),
        ...(filterRoi ? { filter_roi: filterRoi } : {}),
        page_no: currentPage,
        page_size: pageSize
      });

      if (res?.records && Array.isArray(res.records)) {
        const { records, total: resTotal } = res;
        const formattedList: DcaBotItem[] = records.map((item: any) => {
          const coinList = (item.relationCoin || '').split(',').filter(Boolean);
          const chartData = parseRoiCurve(item.roiCurve);
          const isUp = item.roi >= 0;

          return {
            id: item.id,
            strategyName: item.strategyName,
            relationCoin: item.relationCoin,
            coinList,
            roi: item.roi,
            roiPercent: `${item.roi >= 0 ? '+' : ''}${(item.roi * 100).toFixed(2)}%`,
            retracement: `${(item.retracement * 100).toFixed(2)}%`,
            apy: item.apy,
            runtime: formatRuntime(item.strategyInterval || 0),
            useCount: formatNumber(item.useCount || 0),
            chartData,
            isUp,
            rawData: item
          };
        });

        setBotList(formattedList);
        setTotal(resTotal);
      }
    } catch (error) {
      console.error('获取 DCA 策略列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (createOpen) {
      setIsCreateModalOpen(true);
    }
  }, [createOpen]);

  useEffect(() => {
    fetchDcaList();
  }, [sortBy, runTime, profitRate, currentPage]);

  const dcaTermsKey = `dca-terms-agreed:${userInfo?.id ?? ''}`;

  const handleUseBot = (botId: number) => {
    setSelectedBotId(botId);
    const hasAgreedTerms = localStorage.getItem(dcaTermsKey);
    if (hasAgreedTerms === 'true') {
      setIsGridBotModalOpen(true);
    } else {
      setIsTermsModalOpen(true);
    }
  };

  const handleTermsConfirm = () => {
    localStorage.setItem(dcaTermsKey, 'true');
    setIsTermsModalOpen(false);
    setIsGridBotModalOpen(true);
  };

  const handleTermsClose = () => {
    setIsTermsModalOpen(false);
  };

  const handleGridBotConfirm = () => {
    setIsGridBotModalOpen(false);
    fetchDcaList();
    onRefreshHeader?.();
  };

  const handleGridBotClose = () => {
    setIsGridBotModalOpen(false);
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
              classNames={{ popup: { root: styles.filterDropdown } }}
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
              classNames={{ popup: { root: styles.filterDropdown } }}
              popupMatchSelectWidth={false}
              menuItemSelectedIcon={<CheckIcon />}
              suffixIcon={<ArrowDownIcon />}
              optionLabelProp="label"
            >
              {[
                { value: 0, label: t('runtime'), text: t('all') },
                { value: 1, label: t('within-1-day') },
                { value: 2, label: t('within-7-days') },
                { value: 3, label: t('within-15-days') },
                { value: 4, label: t('within-30-days') },
                { value: 5, label: t('over-30-days') }
              ].map(({ value, label, text }) => (
                <Select.Option key={value} value={value} label={label}>
                  {text ?? label}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={profitRate}
              onChange={setProfitRate}
              className={styles.filterSelect}
              classNames={{ popup: { root: styles.filterDropdown } }}
              popupMatchSelectWidth={false}
              menuItemSelectedIcon={<CheckIcon />}
              suffixIcon={<ArrowDownIcon />}
              optionLabelProp="label"
            >
              {[
                { value: 0, label: t('profit-rate'), text: t('all') },
                { value: 1, label: '≥ 100%' },
                { value: 2, label: '50% - 100%' },
                { value: 3, label: '10% - 50%' },
                { value: 4, label: '0% - 10%' }
              ].map(({ value, label, text }) => (
                <Select.Option key={value} value={value} label={label}>
                  {text ?? label}
                </Select.Option>
              ))}
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
                <div className={styles.row1}>
                  <div className={styles.botHeader}>
                    {bot.coinList.length > 3 ? (
                      <Popover
                        content={
                          <div className={styles.coinListPopover}>
                            {bot.coinList.join(' + ')}
                          </div>
                        }
                        trigger="hover"
                        placement="bottomLeft"
                        styles={{
                          body: {
                            background: 'var(--fill-fill-tooltip-web, #28292a)',
                            borderRadius: '4px',
                            padding: '8px 12px'
                          }
                        }}
                        arrow={false}
                      >
                        <div className={styles.botPair}>
                          {bot.coinList.slice(0, 3).join('+')}+...
                        </div>
                      </Popover>
                    ) : (
                      <div className={styles.botPair}>{bot.coinList.join('+')}</div>
                    )}
                    <div className={styles.botType}>{t('spot-dca')}</div>
                  </div>
                  <button className={styles.useButton} onClick={() => handleUseBot(bot.id)}>
                    {t('use')}
                  </button>
                </div>

                <div className={styles.row2}>
                  <div className={styles.returnRate}>
                    <Popover
                      content={
                        <div className={styles.popoverContent}>
                          {t('dca-backtest-tooltip')}
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
                      arrow={{ pointAtCenter: true }}
                    >
                      <div className={styles.returnLabel}>{t('30d-backtest-return')}</div>
                    </Popover>
                    <div className={`${styles.returnValue} ${!bot.isUp ? styles.returnValueNegative : ''}`}>
                      {bot.roiPercent}
                    </div>
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
                      <div style={{ width: 76, height: 34 }} />
                    )}
                  </div>
                </div>

                <div className={styles.row3}>
                  <div className={styles.infoGroup}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>{t('runtime-period')}</span>
                      <span className={styles.infoValue}>{bot.runtime}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>{t('max-drawdown-7d')}</span>
                      <span className={styles.infoValue}>{bot.retracement}</span>
                    </div>
                  </div>
                  <div className={styles.followers}>
                    <UserIcon /> {bot.useCount}
                  </div>
                </div>

                {bot.coinList.length > 3 ? (
                  <div className={styles.stackedIconsRow}>
                    {bot.coinList.map((coin, idx) => (
                      <div
                        key={idx}
                        className={styles.stackedIconWrapper}
                        style={{ zIndex: bot.coinList.length - idx, marginLeft: idx > 0 ? '-6px' : 0 }}
                      >
                        <img
                          className={styles.coinIcon}
                          src={getSymbolUrl(coin)}
                          alt={coin}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.row4}>
                    {bot.coinList.map((coin, idx) => (
                      <div key={idx} className={styles.coinItem}>
                        <img
                          className={styles.coinIcon}
                          src={getSymbolUrl(coin)}
                          alt={coin}
                        />
                        <span className={styles.coinName}>{coin}</span>
                      </div>
                    ))}
                  </div>
                )}
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

      <TermsModal
        type="dca"
        open={isTermsModalOpen}
        onClose={handleTermsClose}
        onConfirm={handleTermsConfirm}
      />

      <GridBotModal
        open={isGridBotModalOpen}
        onClose={handleGridBotClose}
        onConfirm={handleGridBotConfirm}
        botId={selectedBotId}
      />

      <CustomParamsModal
        open={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); onCreateClose?.(); }}
        onConfirm={() => {
          setIsCreateModalOpen(false);
          onCreateClose?.();
          fetchDcaList();
          onRefreshHeader?.();
        }}
        mode="create"
      />
    </div>
  );
};

export default BotMarket;
