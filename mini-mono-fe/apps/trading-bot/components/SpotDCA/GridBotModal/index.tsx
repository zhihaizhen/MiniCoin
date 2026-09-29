import React, { useState, useEffect, useMemo } from 'react';
import { Modal, message } from 'antd';
import dynamic from 'next/dynamic';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import { ReactComponent as ChevronRightIcon } from '~/public/icons/chevron-right2.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/icons/arrow_down.svg';
import InvestmentInput from '~/components/PublicPart/InvestmentInput';
import { ReactComponent as AddIcon } from '~/public/icons/add.svg';
import CustomParamsModal from '~/components/SpotDCA/CustomParamsModal';
import PlanNameModal from '~/components/SpotDCA/CustomParamsModal/PlanNameModal';
import PriceRangeModal from '~/components/SpotDCA/CustomParamsModal/PriceRangeModal';
import { getDcaStrategyInfo, getAsset } from '~/api';
import { useMinInvestAmount } from '~/hooks/useMinInvestAmount';
import ConfirmOrderModal from '~/components/SpotDCA/ConfirmOrderModal';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';

import { openTransferModal, parseCronToText } from '~/utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { goPage, getSymbolUrl } from '@better-bit-fe/base-utils';

const ProfitChart = dynamic(() => import('./ProfitChart'), { ssr: false });

dayjs.extend(duration);

interface GridBotModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (params?: any) => void;
  botId?: number | null;
}

const GridBotModal: React.FC<GridBotModalProps> = ({ open, onClose, onConfirm, botId }) => {


  const t = useFm();
  const { isLogin } = useUserInfo();
  const [investAmount, setInvestAmount] = useState('');
  const [investAmountError, setInvestAmountError] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [strategyDetail, setStrategyDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [spotBalance, setSpotBalance] = useState<string>('0.00');
  const [planName, setPlanName] = useState('');
  const [priceConfig, setPriceConfig] = useState<any[]>([]);
  const [customParamsOpen, setCustomParamsOpen] = useState(false);
  const [planNameModalOpen, setPlanNameModalOpen] = useState(false);
  const [priceRangeModalOpen, setPriceRangeModalOpen] = useState(false);
  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false);
  const [confirmOrderParams, setConfirmOrderParams] = useState<any>(null);

  const relationCoin = strategyDetail?.relationCoin || '';
  const coinList = useMemo(() => relationCoin.split(',').filter(Boolean), [relationCoin]);
  const coinTitle = coinList.join('+');
  const useCount = strategyDetail?.useCount || 0;

  // 左侧参数详情展示用，来自 API 原始数据，与用户手动设置的 priceConfig 无关
  const strategyPriceConfig = useMemo<any[]>(() => {
    if (!strategyDetail?.priceConfig) return [];
    try {
      const config = typeof strategyDetail.priceConfig === 'string'
        ? JSON.parse(strategyDetail.priceConfig)
        : strategyDetail.priceConfig;
      return Array.isArray(config) ? config : [];
    } catch {
      return [];
    }
  }, [strategyDetail?.priceConfig]);

  const formatRuntime = (seconds: number) => {
    if (!seconds) return '-';
    const dur = dayjs.duration(seconds, 'seconds');
    const days = Math.floor(dur.asDays());
    const hours = dur.hours();
    const minutes = dur.minutes();
    return `${days}D ${hours}H ${minutes}M`;
  };

  const formatPriceRange = (item: { min?: number | string; max?: number | string }) => {
    const min = item.min != null && item.min !== '' ? Number(item.min) : null;
    const max = item.max != null && item.max !== '' ? Number(item.max) : null;
    if (min != null && max != null) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min != null) return `≥${min.toLocaleString()}`;
    if (max != null) return `≤${max.toLocaleString()}`;
    return '-';
  };

  const formatCron = (cron: string) => parseCronToText(cron, t) || '-';

  useEffect(() => {
    if (open && botId) {
      fetchStrategyDetail();
      fetchSpotBalance();
    } else if (!open) {
      resetFormData();
    }
  }, [open, botId]);

  const fetchStrategyDetail = async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const res = await getDcaStrategyInfo({ strategy_id: botId });
      if (res) {
        setStrategyDetail(res);
      }
    } catch (error) {
      console.error('获取 DCA 策略详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpotBalance = async () => {
    try {
      const res = await getAsset({});
      const asset = res?.find((item: any) => item.tokenName === 'USDT');
      const balance = asset?.free ? (Math.floor(Number(asset.free) * 100) / 100).toFixed(2) : '0.00';
      setSpotBalance(balance);
    } catch (error) {
      setSpotBalance('0.00');
    }
  };

  const resetFormData = () => {
    setInvestAmount('');
    setInvestAmountError('');
    setSliderValue(0);
    setAdvancedOpen(false);
    setStrategyDetail(null);
    setSpotBalance('0.00');
    setPlanName('');
    setPriceConfig([]);
    setPlanNameModalOpen(false);
    setPriceRangeModalOpen(false);
  };

  const handleConfirm = () => {
    if (!isLogin) {
      goPage('login');
      return;
    }

    if (!investAmount || Number(investAmount) <= 0 || Number(investAmount) < recommendMinAmount) {
      setInvestAmountError(t('invest-amount-too-low', { min: recommendMinAmount }));
      return;
    }

    const params: any = {
      strategy_id: botId,
      margin: Number(investAmount),
      execute_immediately: 'Y',
      timezone: `UTC${new Date().getTimezoneOffset() <= 0 ? '+' : '-'}${Math.abs(new Date().getTimezoneOffset() / 60)}`,
      relation_coin: relationCoin,
      strategy_cron: strategyDetail?.strategyCron || ''
    };

    if (planName) {
      params.strategy_name = planName;
    } else {
      params.strategy_name = coinTitle;
    }

    if (strategyPriceConfig.length > 0) {
      params.price_config = strategyPriceConfig.map((item: any) => {
        const userItem = priceConfig.find((pc: any) => pc.symbol === item.coin);
        const hasUserPrice = userItem && (userItem.priceLower || userItem.priceUpper);
        return {
          coin: item.coin,
          ratio: item.ratio,
          ...(hasUserPrice && userItem.priceLower ? { min: Number(userItem.priceLower) } : (item.min != null ? { min: Number(item.min) } : {})),
          ...(hasUserPrice && userItem.priceUpper ? { max: Number(userItem.priceUpper) } : (item.max != null ? { max: Number(item.max) } : {}))
        };
      });
    }

    setConfirmOrderParams(params);
    onClose();
    setConfirmOrderOpen(true);
  };

  const handleConfirmOrderSuccess = () => {
    setConfirmOrderOpen(false);
    onClose();
    onConfirm(confirmOrderParams);
  };

  const handleValueChange = (amount: string, slider: number) => {
    setInvestAmount(amount);
    setSliderValue(slider);
    if (investAmountError) setInvestAmountError('');
  };

  const handleInvestAmountBlur = () => {
    if (investAmount && Number(investAmount) < recommendMinAmount) {
      setInvestAmountError(t('invest-amount-too-low', { min: recommendMinAmount }));
    } else {
      setInvestAmountError('');
    }
  };

  const handleSwitchAccount = () => {
    openTransferModal(() => {
      // 划转成功后刷新现货余额
      fetchSpotBalance();
    });
  };

  const handleCustomParams = () => {
    onClose();
    setCustomParamsOpen(true);
  };

  const handleCustomParamsClose = () => {
    setCustomParamsOpen(false);
  };

  const handleCustomParamsConfirm = () => {
    setCustomParamsOpen(false);
    onConfirm();
  };

  const priceRangeDisplay = useMemo(() => {
    // priceConfig 格式: {coin, min, max, ratio}，兼容 {priceLower, priceUpper}
    const hasPrice = (pc: any) =>
      pc.min != null || pc.max != null || pc.priceLower || pc.priceUpper;
    const validConfigs = priceConfig.filter(hasPrice);
    if (validConfigs.length === 0) return t('not-set');
    if (priceConfig.length > 1 && validConfigs.length > 0) return t('already-set');
    const single = validConfigs[0];
    const lo = single.min ?? single.priceLower;
    const hi = single.max ?? single.priceUpper;
    if (lo != null && lo !== '' && hi != null && hi !== '') return `${lo} - ${hi}`;
    if (lo != null && lo !== '') return `≥${lo}`;
    if (hi != null && hi !== '') return `≤${hi}`;
    return t('not-set');
  }, [priceConfig, t]);

  const coinListWithRatio = useMemo(() => {
    return coinList.map((symbol) => {
      const config = strategyPriceConfig.find((c: any) => c.coin === symbol);
      const ratio = config?.ratio ? (Number(config.ratio) > 1 ? config.ratio : Number(config.ratio) * 100) : 100 / coinList.length;
      return { symbol, ratio: String(ratio) };
    });
  }, [coinList, strategyPriceConfig]);

  const recommendMinAmount = useMinInvestAmount(open, coinListWithRatio);

  const roiCurveData = useMemo(() => {
    if (!strategyDetail?.runTimeRoiCurve) return [];
    try {
      const parsed = typeof strategyDetail.runTimeRoiCurve === 'string'
        ? JSON.parse(strategyDetail.runTimeRoiCurve)
        : strategyDetail.runTimeRoiCurve;
      return parsed;
    } catch (e) {
      return [];
    }
  }, [strategyDetail]);

  return (
    <>
      <Modal
        open={open && !planNameModalOpen && !priceRangeModalOpen}
        onCancel={onClose}
        footer={null}
        closeIcon={null}
        width={800}
        className={styles.gridBotModal}
        centered
        maskClosable={false}
      >
        <div className={styles.modalContent}>
          <div className={styles.head}>
            <h3 className={styles.title}>{t('use-spot-dca')}</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className={styles.pairSection}>
            <div className={styles.pairTopRow}>
              <div className={styles.pairLeft}>
                <span className={styles.pairName}>{coinTitle || '-'}</span>
                <span className={styles.pairTag}>{t('spot-dca')}</span>
              </div>
            </div>
            <div className={styles.pairBottomRow}>
              <span className={styles.followers}>{t('users-count')}: {useCount}</span>
            </div>
          </div>

          <div className={styles.bodySection}>
            <div className={styles.leftPanel}>
              <div className={styles.strategyOverview}>
                <h4 className={styles.sectionTitle}>{t('strategy-overview')}</h4>
                <ProfitChart
                  chartData={roiCurveData}
                  currentRate={strategyDetail?.roi}
                />
              </div>

              <div className={styles.paramDetails}>
                <h4 className={styles.sectionTitle}>{t('parameter-details')}</h4>
                <div className={styles.paramGrid}>
                  <div className={styles.paramRow}>
                    <div className={styles.paramItem}>
                      <div className={styles.paramLabel}>{t('strategy-source')}</div>
                      <div className={styles.paramValue}>{strategyDetail?.strategyType ? t(strategyDetail.strategyType) : '--'}</div>
                    </div>
                    <div className={styles.paramItem}>
                      <div className={styles.paramLabel}>{t('running-time')}</div>
                      <div className={styles.paramValue}>
                        {formatRuntime(strategyDetail?.strategyInterval)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.paramRow}>
                    <div className={styles.paramItem}>
                      <div className={styles.paramLabel}>{t('max-drawdown-7d-rate')}</div>
                      <div className={styles.paramValue}>
                        {strategyDetail?.retracement
                          ? `${(strategyDetail.retracement * 100).toFixed(2)}%`
                          : '-'}
                      </div>
                    </div>
                    <div className={styles.paramItem}>
                      <div className={styles.paramLabel}>{t('dca-cycle')}</div>
                      <div className={styles.paramValue}>
                        {formatCron(strategyDetail?.strategyCron)}
                      </div>
                    </div>
                  </div>
                  {strategyPriceConfig.length > 0 && (
                    <div className={styles.paramRow}>
                      <div className={styles.paramItem}>
                        <div className={styles.paramLabel}>{t('coin-config')}</div>
                        <div className={styles.paramCoinList}>
                          {strategyPriceConfig.map((item, idx) => {
                            const ratio = Number(item.ratio);
                            const ratioText = `${ratio > 1 ? ratio.toFixed(0) : (ratio * 100).toFixed(0)}%`;
                            return (
                              <div key={idx} className={styles.paramCoinRow}>
                                <img
                                  className={styles.paramCoinIcon}
                                  src={item.coin ? getSymbolUrl(item.coin) : ''}
                                  alt={item.coin}
                                />
                                <span className={styles.paramValue}>{item.coin}</span>
                                <span className={styles.paramValue}>{ratioText}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className={styles.paramItem}>
                        <div className={styles.paramLabel}>{t('buy-price-range')}</div>
                        <div className={styles.paramCoinList}>
                          {strategyPriceConfig.map((item, idx) => (
                            <div key={idx} className={styles.paramPriceRow}>
                              <span className={styles.paramValue}>{formatPriceRange(item)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.rightPanel}>
              <InvestmentInput
                investAmount={investAmount}
                sliderValue={sliderValue}
                spotBalance={spotBalance}
                tokenSymbol="USDT"
                onValueChange={handleValueChange}
                onSwitchAccount={handleSwitchAccount}
                recommendMinAmount={String(recommendMinAmount)}
                actionIcon={<AddIcon />}
                errorMsg={investAmountError}
                onBlur={handleInvestAmountBlur}
              />

              <div></div>

              <div className={styles.advancedSection}>
                <div className={styles.advancedHeader} onClick={() => setAdvancedOpen(!advancedOpen)}>
                  <span className={styles.advancedTitle}>{t('advanced-settings')}</span>
                  <ArrowDownIcon className={`${styles.advancedArrow} ${advancedOpen ? styles.advancedArrowOpen : ''}`} />
                </div>
                {advancedOpen && (
                  <div className={styles.advancedBody}>
                    <div className={styles.advancedItem}>
                      <span className={styles.advancedLabel}>{t('dca-plan-name')}</span>
                      <div className={styles.advancedAction} onClick={() => setPlanNameModalOpen(true)}>
                        <span className={styles.advancedValue}>
                          {planName || t('not-set')}
                        </span>
                        <ChevronRightIcon className={styles.advancedChevron} />
                      </div>
                    </div>
                    <div className={styles.advancedItem}>
                      <span className={styles.advancedLabel}>{t('buy-price-range')}</span>
                      <div className={styles.advancedAction} onClick={() => setPriceRangeModalOpen(true)}>
                        <span className={styles.advancedValue}>
                          {priceRangeDisplay}
                        </span>
                        <ChevronRightIcon className={styles.advancedChevron} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={handleCustomParams}>
              {t('custom-params')}
            </button>
            <button
              className={styles.confirmBtn}
              onClick={handleConfirm}
            >
              {t('use-strategy')}
            </button>
          </div>
        </div>
      </Modal>

      <CustomParamsModal
        open={customParamsOpen}
        onClose={handleCustomParamsClose}
        onConfirm={handleCustomParamsConfirm}
        title={t('custom-params')}
        mode="custom"
        strategyDetail={strategyDetail}
      />

      <PlanNameModal
        open={planNameModalOpen}
        onClose={() => setPlanNameModalOpen(false)}
        onConfirm={(name) => {
          setPlanName(name);
          setPlanNameModalOpen(false);
        }}
        initialValue={planName}
      />

      <PriceRangeModal
        open={priceRangeModalOpen}
        onClose={() => setPriceRangeModalOpen(false)}
        onConfirm={(config) => {
          // config 格式: [{symbol, priceLower, priceUpper}]，直接存储用户手动设置的值
          setPriceConfig(config);
          setPriceRangeModalOpen(false);
        }}
        coinList={coinList}
        initialConfig={priceConfig}
      />

      <ConfirmOrderModal
        open={confirmOrderOpen}
        onClose={() => setConfirmOrderOpen(false)}
        onConfirm={handleConfirmOrderSuccess}
        strategyParams={confirmOrderParams}
      />
    </>
  );
};

export default GridBotModal;
