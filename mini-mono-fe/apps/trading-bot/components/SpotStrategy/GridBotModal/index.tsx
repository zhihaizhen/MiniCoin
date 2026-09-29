import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, message } from 'antd';
import dynamic from 'next/dynamic';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import { ReactComponent as SwitchIcon } from '~/public/images/switch.svg';
import CustomParamsModal from '~/components/SpotStrategy/CustomParamsModal';
import AdvancedSettings, { AdvancedSettingsRef } from '~/components/PublicPart/AdvancedSettings';
import InvestmentInput from '~/components/PublicPart/InvestmentInput';
import { getStrategyInfoDetail, getStrategyTradeConfig, getAsset, preAddSpotGrid } from '~/api';
import { QuoteTokensStore } from '~/store/QuoteTokens';

// 动态导入 ProfitChart，禁用 SSR（@ant-design/charts 不支持服务端渲染）
const ProfitChart = dynamic(() => import('./ProfitChart'), { ssr: false });
import { calculateGridStep, calculateGridProfitRate, calculateGridProfitRateNumber } from '~/utils/gridCalculator';
import { getMinPricePrecision } from '~/utils/priceFormatter';
import { useAllSpotQuote } from 'libs/ws-service';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { openTransferModal } from '~/utils';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';


interface GridBotModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (params: any) => void;
  botId?: number | null;
}

const GridBotModal: React.FC<GridBotModalProps> = ({ open, onClose, onConfirm, botId }) => {


  const [investAmount, setInvestAmount] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [takeProfitType, setTakeProfitType] = useState('');
  const [stopLossType, setStopLossType] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [customParamsOpen, setCustomParamsOpen] = useState(false);
  const [strategyDetail, setStrategyDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savedDisplayData, setSavedDisplayData] = useState<any>(null); // 保存显示数据
  const [feeRate, setFeeRate] = useState<number>(0); // 手续费率
  const [spotBalance, setSpotBalance] = useState<string>('0.00'); // 现货余额
  const [sliderValue, setSliderValue] = useState(0); // Slider 值
  const [confirming, setConfirming] = useState(false); // 确认中状态
  const advancedSettingsRef = useRef<AdvancedSettingsRef>(null);
  const t = useFm();
  const { allSpotList } = useAllSpotQuote();
  const { quoteTokens } = QuoteTokensStore.useContainer();

  const spotGrid = strategyDetail?.spotGrid;
  const {
    baseToken,
    quoteToken,
    priceLower,
    priceUpper,
    gridType,
    gridCount,
    nowPrice,
    todayProfitRate
  } = spotGrid || {};
  const { strategyType, useCount } = strategyDetail || {};
  const pairName = baseToken && quoteToken ? `${baseToken}/${quoteToken}` : '';

  // 获取当前币对的实时行情数据
  const currentPairData = useMemo(() => {
    if (!spotGrid || !allSpotList || allSpotList.length === 0) return null;

    const pairInfo = allSpotList.find((item: any) => {
      const symbolAlias = item?.symbolAlias || `${item?.baseTokenId || ''}/${item?.quoteTokenId || ''}`;
      return symbolAlias === pairName;
    });

    if (!pairInfo) return null;

    const changeNum = Number(pairInfo?.changeRate24H || 0);
    return {
      name: pairName,
      price: pairInfo?.formattedLastPrice || '--',
      lastPriceNumber: Number(pairInfo?.lastPriceNumber) || 0,
      change: `${changeNum >= 0 ? '+' : ''}${pairInfo?.changeRate24H || '0'}%`,
      isPositive: changeNum >= 0,
      icon: getSymbolUrl(pairName)
    };
  }, [spotGrid, allSpotList]);

  // 计算推荐最小投入金额
  const recommendMinAmount = useMemo(() => {
    if (!spotGrid || !quoteTokens || quoteTokens.length === 0 || !allSpotList || allSpotList.length === 0) {
      return '';
    }

    // 从 quoteTokens 中找到对应的计价币种配置
    const quoteTokenConfig = quoteTokens.find((item: any) => item.tokenId === quoteToken);
    if (!quoteTokenConfig || !quoteTokenConfig.quoteTokenSymbols) {
      return '';
    }

    // 从 quoteTokenSymbols 中找到对应的交易对配置
    const symbolConfig = quoteTokenConfig.quoteTokenSymbols.find(
      (symbol: any) => symbol.baseTokenName === baseToken
    );
    if (!symbolConfig) {
      return '';
    }

    // 获取币种最小买入量
    const minTradeQuantity = Number(symbolConfig.minTradeQuantity || 0);
    if (minTradeQuantity === 0) {
      return '';
    }

    // 从 WebSocket 数据中获取当前价格
    const pairInfo = allSpotList.find((item: any) => {
      const symbolAlias = item?.symbolAlias || `${item?.baseTokenId || ''}/${item?.quoteTokenId || ''}`;
      return symbolAlias === pairName;
    });

    if (!pairInfo) {
      return '';
    }

    // 使用 lastPriceNumber 字段获取数字类型的价格
    const currentPrice = Number(pairInfo.lastPriceNumber);
    if (!currentPrice || currentPrice === 0 || isNaN(currentPrice)) {
      return '';
    }

    const gridCountNum = Number(gridCount || 0);

    // 计算推荐最小投入金额 = 币种最小买入量 * 当前价格 * (挂单数量 + 1)
    const calculatedMinAmount = minTradeQuantity * currentPrice * (gridCountNum + 1);

    // 保留2位小数
    return calculatedMinAmount.toFixed(2);
  }, [spotGrid, quoteTokens, allSpotList]);

  // 获取当前币对的 minPricePrecision
  const minPricePrecision = useMemo(() => {
    if (!spotGrid) return null;
    return getMinPricePrecision(pairName, quoteTokens);
  }, [spotGrid, quoteTokens]);

  const handleSwitchAccount = () => {
    openTransferModal(() => {
      // 划转成功后刷新现货余额
      fetchSpotBalance();
    });
  };

  // 获取手续费率和现货余额
  useEffect(() => {
    if (open) {
      fetchFeeRate();
      fetchSpotBalance();
    }
  }, [open]);

  // 获取策略详情，详情变化后重新获取余额
  useEffect(() => {
    if (open && botId) {
      fetchStrategyDetail();
    } else if (!open) {
      // 弹框关闭时重置数据
      resetFormData();
    }
  }, [open, botId]);

  // 策略详情加载后，根据币对重新获取余额
  useEffect(() => {
    if (quoteToken) {
      fetchSpotBalance();
    }
  }, [quoteToken]);

  const fetchFeeRate = async () => {
    try {
      const res = await getStrategyTradeConfig({});
      if (res?.feeRate) {
        setFeeRate(Number(res.feeRate));
      }
    } catch (error) {
      console.error('获取手续费率失败:', error);
    }
  };

  // 获取现货余额
  const fetchSpotBalance = async () => {
    try {
      const res = await getAsset({});
      // 从 strategyDetail 中提取 quoteToken (例如 BTC/USDT -> USDT)
      const tokenName = quoteToken || 'USDT';

      // 从返回的资产列表中找到对应币种的余额
      const asset = res?.find((item: any) => item.tokenName === tokenName);
      const balance = asset?.free ? (Math.floor(Number(asset.free) * 100) / 100).toFixed(2) : '0.00';
      setSpotBalance(balance);
    } catch (error) {
      console.error('获取现货余额失败:', error);
      setSpotBalance('0.00');
    }
  };

  // 重置表单数据
  const resetFormData = () => {
    setInvestAmount('');
    setSliderValue(0);
    setAdvancedOpen(false);
    setTakeProfitType('');
    setStopLossType('');
    setTakeProfitPrice('');
    setStopLossPrice('');
    setStrategyDetail(null);
    setSpotBalance('0.00');
  };

  const fetchStrategyDetail = async () => {
    if (!botId) return;

    setLoading(true);
    try {
      const res = await getStrategyInfoDetail({
        strategy_id: botId
      });
      if (res) {
        setStrategyDetail(res);
      }
    } catch (error) {
      console.error('获取策略详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!spotGrid) {
      message.error(t('strategy-params-incomplete'));
      return;
    }

    if (!investAmount || Number(investAmount) <= 0) {
      message.error(t('enter-valid-investment'));
      return;
    }

    // 校验止盈止损（只要选中了止盈或止损类型就校验）
    if (takeProfitType || stopLossType) {
      const isValid = advancedSettingsRef.current?.validate();
      if (!isValid) {
        return;
      }
    }

    const params = buildStrategyParams();
    if (!params) {
      message.error(t('params-error'));
      return;
    }

    const {
      base_token,
      quote_token,
      price_lower,
      price_upper,
      grid_type,
      grid_count,
      investment_amount,
      create_from,
      template_id,
      stop_take_profit,
      stop_loss,
      stop_break_upper,
      stop_break_lower
    } = params;

    // 校验单格收益率
    const profitRate = calculateGridProfitRateNumber(
      {
        priceLower: Number(price_lower),
        priceUpper: Number(price_upper),
        gridCount: Number(grid_count),
        gridType: Number(grid_type)
      },
      feeRate
    );

    if (profitRate !== null && profitRate < 0) {
      message.error(t('profit-rate-too-low'));
      return;
    }

    // 调用预添加接口试算 buyQty
    setConfirming(true);
    try {
      const preAddParams: any = {
        base_token,
        quote_token,
        price_lower,
        price_upper,
        grid_type,
        grid_count,
        investment_amount,
        create_from,
        template_id
      };

      // 添加可选参数
      if (stop_take_profit) {
        preAddParams.stop_take_profit = stop_take_profit;
      }
      if (stop_loss) {
        preAddParams.stop_loss = stop_loss;
      }
      if (stop_break_upper) {
        preAddParams.stop_break_upper = stop_break_upper;
      }
      if (stop_break_lower) {
        preAddParams.stop_break_lower = stop_break_lower;
      }

      const res = await preAddSpotGrid(preAddParams);

      const finalParams = {
        ...params,
        buyQty: res?.buyQty || 0,
        feeRate,
        minPricePrecision
      };

      onClose();
      onConfirm(finalParams);
    } catch (error) {
      console.error('预添加失败:', error);
    } finally {
      setConfirming(false);
    }
  };

  // 构建创建策略的参数
  const buildStrategyParams = () => {
    if (!spotGrid) {
      return null;
    }

    const params: any = {
      base_token: baseToken,
      quote_token: quoteToken,
      price_lower: priceLower,
      price_upper: priceUpper,
      grid_type: gridType,
      grid_count: gridCount,
      investment_amount: Number(investAmount),
      create_from: 1, // 1、复制
      template_id: botId,
      strategy_type: strategyType || 1 // 1=现货网格，2=现货定投
    };

    // 止盈设置
    if (takeProfitType === 'stop_take_profit' && takeProfitPrice) {
      params.stop_take_profit = Number(takeProfitPrice);
    } else if (takeProfitType === 'stop_break_upper') {
      params.stop_break_upper = priceUpper;
    }

    // 止损设置
    if (stopLossType === 'stop_loss' && stopLossPrice) {
      params.stop_loss = Number(stopLossPrice);
    } else if (stopLossType === 'stop_break_lower') {
      params.stop_break_lower = priceLower;
    }

    return params;
  };

  const handleCustomParams = () => {
    // 保存当前的显示数据
    setSavedDisplayData({
      pairName: spotGrid ? pairName : undefined,
      pairTag: strategyType === 1 ? t('spot-grid') : t('spot-dca'),
      useCount,
      coinPrice: nowPrice
        ? `$${nowPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : undefined,
      priceChange: todayProfitRate !== undefined
        ? `${todayProfitRate >= 0 ? '+' : ''}${(todayProfitRate * 100).toFixed(2)}%`
        : undefined
    });
    onClose();
    setCustomParamsOpen(true);
  };

  const handleCustomParamsConfirm = () => {
    onClose();
    onConfirm({});
  };

  const handleValueChange = (amount: string, slider: number) => {
    setInvestAmount(amount);
    setSliderValue(slider);
  };


  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        closeIcon={null}
        width={800}
        className={styles.gridBotModal}
        centered
        maskClosable={false}
      >
        <div className={styles.modalContent}>
          {/* 头部 */}
          <div className={styles.head}>
            <h3 className={styles.title}>{t('use-spot-grid')}</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          {/* 币对信息 */}
          <div className={styles.pairSection}>
            <div className={styles.pairTopRow}>
              <div className={styles.pairLeft}>
                <span className={styles.pairName}>
                  {spotGrid ? pairName : '-'}
                </span>
                <span className={styles.pairTag}>
                  {strategyType === 1 ? t('spot-grid') : t('spot-dca')}
                </span>
              </div>
              <div className={styles.pairRight}>
                <div className={styles.coinIcon}>
                  <img
                    className={styles.coinIconImage}
                    src={currentPairData?.icon || getSymbolUrl(pairName || 'BTC/USDT')}
                    alt={currentPairData?.name || 'coin'}
                  />
                </div>
                <span className={styles.coinPair}>
                  {currentPairData?.price || '--'}
                </span>
                <span className={`${styles.coinPrice} ${currentPairData?.isPositive ? '' : styles.priceChangeNegative}`}>
                  {currentPairData?.change || '--'}
                </span>
              </div>
            </div>
            <div className={styles.pairBottomRow}>
              <span className={styles.followers}>{t('users-count')}: {useCount || 0}</span>
            </div>
          </div>

          {/* 主体内容 */}
          <div className={styles.bodySection}>
            {/* 左侧：策略概况和参数详情 */}
            <div className={styles.leftPanel}>
              {/* 策略概况 */}
              <div className={styles.strategyOverview}>
                <h4 className={styles.sectionTitle}>{t('strategy-overview')}</h4>
                {/* 收益图表卡片 */}
                <ProfitChart
                  chartData={strategyDetail?.chartData || []}
                  currentRate={strategyDetail?.profitRate}
                />
              </div>

              {/* 参数详情 */}
              <div className={styles.paramDetails}>
                <h4 className={styles.sectionTitle}>{t('parameter-details')}</h4>
                <div className={styles.paramGrid}>
                  <div className={styles.paramRow}>
                    <div className={styles.paramItem}>
                      <div className={styles.paramLabel}>{t('price-range-usdt')}</div>
                      <div className={styles.paramValue}>
                        {spotGrid
                          ? `${priceLower} - ${priceUpper}`
                          : '-'}
                      </div>
                    </div>
                    <div className={styles.paramItem}>
                      <div className={styles.paramLabel}>
                        {t('grid-quantity')} ({gridType === 1 ? t('arithmetic') : t('geometric')})
                      </div>
                      <div className={styles.paramValue}>
                        {gridCount || '-'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.paramRow}>
                    <div className={styles.paramItem}>
                      <div className={styles.paramLabel}>{t('grid-spacing')}</div>
                      <div className={styles.paramValue}>
                        {spotGrid
                          ? calculateGridStep(spotGrid, minPricePrecision)
                          : '-'}
                      </div>
                    </div>
                    <div className={styles.paramItem}>
                      <div className={styles.paramLabel}>{t('profit-per-grid')}</div>
                      <div className={styles.paramValue}>
                        {spotGrid && feeRate
                          ? calculateGridProfitRate(spotGrid, feeRate)
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：投资金额输入 */}
            <div className={styles.rightPanel}>
              <InvestmentInput
                investAmount={investAmount}
                sliderValue={sliderValue}
                spotBalance={spotBalance}
                tokenSymbol={quoteToken || 'USDT'}
                onValueChange={handleValueChange}
                onSwitchAccount={handleSwitchAccount}
                recommendMinAmount={recommendMinAmount}
                actionIcon={<SwitchIcon />}
              />

              {/* 高级设置 */}
              <AdvancedSettings
                ref={advancedSettingsRef}
                open={advancedOpen}
                onToggle={() => setAdvancedOpen(!advancedOpen)}
                takeProfitType={takeProfitType}
                onTakeProfitTypeChange={setTakeProfitType}
                takeProfitPrice={takeProfitPrice}
                onTakeProfitPriceChange={setTakeProfitPrice}
                stopLossType={stopLossType}
                onStopLossTypeChange={setStopLossType}
                stopLossPrice={stopLossPrice}
                onStopLossPriceChange={setStopLossPrice}
                baseToken={baseToken}
                quoteToken={quoteToken}
                useStopPrefix
                currentPrice={currentPairData?.lastPriceNumber}
                minPricePrecision={minPricePrecision}
              />
            </div>
          </div>

          {/* 底部按钮 */}
          <div className={styles.btnGroup}>
            <button className={styles.cancelBtn} onClick={handleCustomParams} disabled={confirming}>
              {t('custom-params')}
            </button>
            <button
              className={`${styles.confirmBtn} ${confirming ? styles.loading : ''}`}
              onClick={handleConfirm}
              disabled={confirming || (!!recommendMinAmount && Number(investAmount) < Number(recommendMinAmount))}
            >
              {t('use-strategy')}
            </button>
          </div>
        </div>
      </Modal>

      <CustomParamsModal
        open={customParamsOpen}
        onClose={() => setCustomParamsOpen(false)}
        onConfirm={handleCustomParamsConfirm}
        title={t('custom-params')}
        isCustomParams={true}
        strategyDetail={strategyDetail}
        displayData={savedDisplayData}
      />
    </>
  );
};

export default GridBotModal;
