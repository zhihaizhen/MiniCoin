import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Modal, Input, Select, Form, message, ConfigProvider, theme } from 'antd';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import { ReactComponent as EditIcon } from '~/public/icons/edit.svg';
import { ReactComponent as DelIcon } from '~/public/icons/delete.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/icons/arrow_down.svg';
import { ReactComponent as VectorIcon } from '~/public/icons/vector.svg';
import { ReactComponent as CheckIcon } from '~/public/icons/selected.svg';
import { ReactComponent as SwitchIcon } from '~/public/images/switch.svg';
import ConfirmOrderModal from '~/components/SpotStrategy/ConfirmOrderModal';
import AdvancedSettings, { AdvancedSettingsRef } from '~/components/PublicPart/AdvancedSettings';
import InvestmentInput from '~/components/PublicPart/InvestmentInput';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { useAllSpotQuote } from 'libs/ws-service';
import { getAsset, getStrategyAiConfig, getStrategyTradeConfig, preAddSpotGrid } from '~/api';
import { QuoteTokensStore } from '~/store/QuoteTokens';
import { calculateGridProfitRateNumber, calculateGridProfitRate } from '~/utils/gridCalculator';
import { limitDecimalPlaces, getMinPricePrecision, getPrecisionDecimals } from '~/utils/priceFormatter';
import { openTransferModal } from '~/utils';
import styles from './index.module.less';

interface CustomParamsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  isCustomParams?: boolean;
  type?: string
  strategyDetail?: any;
  // 格式化好的展示数据
  displayData?: {
    pairName?: string;        // 如 "BTC/USDT"
    pairTag?: string;         // 如 "现货网格"
    useCount?: number;        // 使用人数
    coinPrice?: string;       // 当前价格，如 "$45,123"
    priceChange?: string;     // 涨跌幅，如 "+1.84%"
    priceLower?: string;      // 最低价
    priceUpper?: string;      // 最高价
    gridCount?: string;       // 挂单数量
    gridType?: string;        // 网格模式: 'arithmetic' | 'geometric'
  };
}

const CustomParamsModal: React.FC<CustomParamsModalProps> = ({ open, onClose, onConfirm, title = '', isCustomParams = false, strategyDetail, displayData, type }) => {
  const t = useFm();
  const router = useRouter();

  const [form] = Form.useForm();
  const [confirmOrderOpen, setConfirmOrderOpen] = React.useState(false);
  const [pairDropdownOpen, setPairDropdownOpen] = React.useState(false);
  const [spotBalance, setSpotBalance] = React.useState<string>('0.00');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiParamsFilled, setAiParamsFilled] = React.useState(false);
  const [strategyParams, setStrategyParams] = React.useState<any>(null);
  const [feeRate, setFeeRate] = React.useState<number>(0);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const advancedSettingsRef = useRef<AdvancedSettingsRef>(null);
  const priceRangeRef = useRef<HTMLDivElement>(null);
  const gridCountRef = useRef<HTMLDivElement>(null);
  const investRef = useRef<HTMLDivElement>(null);
  const { allSpotList } = useAllSpotQuote();
  const { quoteTokens } = QuoteTokensStore.useContainer();

  const normalizePair = (pair?: string) => (pair || '').replace('/', '').toUpperCase();

  // 从 Form 中获取当前值
  const selectedPair = Form.useWatch('selectedPair', form) || '';
  const sliderValue = Form.useWatch('sliderValue', form) || 0;
  const investAmount = Form.useWatch('investAmount', form) || '';
  const gridCount = Form.useWatch('gridCount', form) || '';
  const gridMode = Form.useWatch('gridMode', form) || 'arithmetic';  // 1=等差, 2=等比
  const priceLowerWatch = Form.useWatch('priceLower', form) || '';
  const priceUpperWatch = Form.useWatch('priceUpper', form) || '';
  const takeProfitType = Form.useWatch('takeProfitType', form) || '';
  const takeProfitPrice = Form.useWatch('takeProfitPrice', form) || '';
  const stopLossType = Form.useWatch('stopLossType', form) || '';
  const stopLossPrice = Form.useWatch('stopLossPrice', form) || '';

  // 获取当前交易对的计价币种
  const quoteToken = selectedPair.split('/')[1] || 'USDT';

  // 获取当前币对的 minPricePrecision
  const minPricePrecision = useMemo(() => {
    return getMinPricePrecision(selectedPair, quoteTokens);
  }, [selectedPair, quoteTokens]);

  const precisionDecimals = useMemo(() => {
    return getPrecisionDecimals(minPricePrecision);
  }, [minPricePrecision]);

  const handleSwitchAccount = () => {
    openTransferModal(() => {
      // 划转成功后刷新现货余额
      fetchSpotBalance();
    });
  };

  const pairList = useMemo(() => {
    return (allSpotList || []).map((item: any) => {
      const name = item?.symbolAlias || `${item?.baseTokenId || ''}/${item?.quoteTokenId || ''}`;
      const changeNum = Number(item?.changeRate24H || 0);
      return {
        name,
        price: item?.formattedLastPrice || '--',
        change: `${changeNum >= 0 ? '+' : ''}${item?.changeRate24H || '0'}%`,
        isPositive: changeNum >= 0,
        icon: getSymbolUrl(name)
      };
    }).filter((item) => Boolean(item.name));
  }, [allSpotList]);

  const selectedPairData = useMemo(() => {
    const normalizedSelected = normalizePair(selectedPair);
    return pairList.find((pair) => normalizePair(pair.name) === normalizedSelected) || null;
  }, [pairList, selectedPair]);

  // 计算推荐最小投入金额：币种最小买入量 * 当前价格 * (挂单数量 + 1)
  const recommendMinAmount = useMemo(() => {
    if (!selectedPair || !quoteTokens || quoteTokens.length === 0 || !allSpotList || allSpotList.length === 0) {
      return '';
    }

    const [baseToken, quoteToken] = selectedPair.split('/');
    if (!baseToken || !quoteToken) return '';

    const gridCountNum = Number(gridCount);
    if (!gridCountNum || gridCountNum <= 0 || isNaN(gridCountNum)) return '';

    const quoteTokenConfig = quoteTokens.find((item: any) => item.tokenId === quoteToken);
    if (!quoteTokenConfig || !quoteTokenConfig.quoteTokenSymbols) return '';

    const symbolConfig = quoteTokenConfig.quoteTokenSymbols.find(
      (symbol: any) => symbol.baseTokenName === baseToken || symbol.baseTokenId === baseToken
    );
    if (!symbolConfig) return '';

    const minTradeQuantity = Number(symbolConfig.minTradeQuantity || 0);
    if (!minTradeQuantity || minTradeQuantity <= 0 || isNaN(minTradeQuantity)) return '';

    const pairInfo = allSpotList.find((item: any) => normalizePair(item?.symbolAlias) === normalizePair(selectedPair));
    if (!pairInfo) return '';

    const currentPrice = Number(pairInfo.lastPriceNumber);
    if (!currentPrice || currentPrice <= 0 || isNaN(currentPrice)) return '';

    const calculatedMinAmount = minTradeQuantity * currentPrice * (gridCountNum + 1);
    return calculatedMinAmount.toFixed(2);
  }, [selectedPair, gridCount, quoteTokens, allSpotList]);

  // 计算每格利润
  const gridProfitRate = useMemo(() => {
    return calculateGridProfitRate(
      {
        priceLower: Number(priceLowerWatch),
        priceUpper: Number(priceUpperWatch),
        gridCount: Number(gridCount),
        gridType: gridMode === 'arithmetic' ? 1 : 2
      },
      feeRate
    );
  }, [priceLowerWatch, priceUpperWatch, gridCount, gridMode, feeRate]);

  // 打开弹窗时立即设置币对
  useEffect(() => {
    if (!open) return;

    const strategyPair = strategyDetail?.spotGrid
      ? `${strategyDetail.spotGrid.baseToken}/${strategyDetail.spotGrid.quoteToken}`
      : '';
    const preferredPair = displayData?.pairName || strategyPair;

    // 如果有推荐的币对，立即设置
    if (preferredPair) {
      form.setFieldValue('selectedPair', preferredPair);
    }
  }, [open, displayData?.pairName, strategyDetail?.spotGrid, form]);

  // pairList 加载后，检查币对是否有效
  useEffect(() => {
    if (!open || !pairList.length) return;

    const currentPair = form.getFieldValue('selectedPair');
    const hasCurrent = currentPair && pairList.some((item) => normalizePair(item.name) === normalizePair(currentPair));

    // 如果当前币对不在列表中，设置为第一个
    if (!hasCurrent) {
      form.setFieldValue('selectedPair', pairList[0].name);
    }
  }, [open, pairList, form]);

  // 当弹框打开且有价格区间时，填充到表单
  useEffect(() => {
    if (open && displayData) {
      const fieldsToSet: any = {};
      if (displayData.priceLower) fieldsToSet.priceLower = displayData.priceLower;
      if (displayData.priceUpper) fieldsToSet.priceUpper = displayData.priceUpper;
      if (displayData.gridCount) fieldsToSet.gridCount = displayData.gridCount;
      if (displayData.gridType) fieldsToSet.gridMode = displayData.gridType;

      if (Object.keys(fieldsToSet).length > 0) {
        form.setFieldsValue(fieldsToSet);
      }
    }
  }, [open, displayData, form]);

  // 关闭弹框时重置表单
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setPairDropdownOpen(false);
      setSpotBalance('0.00');
      setAdvancedOpen(false);
      setAiParamsFilled(false);
    }
  }, [open, form]);

  // 获取现货余额
  const fetchSpotBalance = useCallback(async () => {
    try {
      const res = await getAsset({});
      // 从 selectedPair 中提取 quoteToken (例如 BTC/USDT -> USDT)
      const quoteToken = selectedPair.split('/')[1] || 'USDT';

      // 从返回的资产列表中找到对应币种的余额
      const asset = res?.find((item: any) => item.tokenName === quoteToken);
      const balance = asset?.free ? (Math.floor(Number(asset.free) * 100) / 100).toFixed(2) : '0.00';
      setSpotBalance(balance);
    } catch (error) {
      console.error('获取现货余额失败:', error);
      setSpotBalance('0.00');
    }
  }, [selectedPair]);

  // 获取现货余额和手续费率
  useEffect(() => {
    if (!open) return;

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

    fetchSpotBalance();
    fetchFeeRate();
  }, [open, selectedPair, isCustomParams, strategyDetail, fetchSpotBalance]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPairDropdownOpen(false);
      }
    };

    if (pairDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pairDropdownOpen]);

  const handlePairClick = () => {
    setPairDropdownOpen(!pairDropdownOpen);
  };

  const handleSelectPair = (pair: string) => {
    form.setFieldValue('selectedPair', pair);
    setPairDropdownOpen(false);
  };

  const handleValueChange = (amount: string, slider: number) => {
    form.setFieldValue('investAmount', amount);
    form.setFieldValue('sliderValue', slider);
  };

  // 处理价格输入变化（最低价）
  const handlePriceLowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = limitDecimalPlaces(e.target.value, precisionDecimals ?? 8);
    form.setFieldValue('priceLower', value);
  };

  // 处理价格输入变化（最高价）
  const handlePriceUpperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = limitDecimalPlaces(e.target.value, precisionDecimals ?? 8);
    form.setFieldValue('priceUpper', value);
  };

  // 处理网格数量输入变化（只允许 2-100 之间的整数）
  const handleGridCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value) {
      const num = parseInt(value, 10);
      if (num > 100) {
        value = '100';
      }
    }

    form.setFieldValue('gridCount', value);
  };

  const handleGridCountBlur = () => {
    const value = form.getFieldValue('gridCount');
    if (value && parseInt(value, 10) < 2) {
      form.setFieldValue('gridCount', '2');
    }
  };

  // 处理 AI 参数
  const handleAiParams = async () => {
    // 如果已经填充了 AI 参数，则清除
    if (aiParamsFilled) {
      form.setFieldsValue({
        priceLower: '',
        priceUpper: '',
        gridCount: ''
      });
      setAiParamsFilled(false);
      return;
    }

    // 否则获取并填充 AI 参数
    setAiLoading(true);
    try {
      // 从 selectedPair 中提取 baseToken 和 quoteToken
      const [baseToken, quoteToken] = selectedPair.split('/');

      const res = await getStrategyAiConfig({
        base_token: baseToken,
        quote_token: quoteToken
      });

      if (res) {
        // 填充价格区间
        form.setFieldsValue({
          priceLower: res.recommentLower?.toString() || '',
          priceUpper: res.recommentUpper?.toString() || '',
          gridCount: res.recommentCount?.toString() || ''
        });
        setAiParamsFilled(true);
      }
    } catch (error) {
      console.error('获取 AI 参数失败:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // 获取当前行情价格（数值）
  const currentMarketPrice = useMemo(() => {
    if (!selectedPair || !allSpotList || allSpotList.length === 0) return 0;
    const pairInfo = allSpotList.find((item: any) => normalizePair(item?.symbolAlias) === normalizePair(selectedPair));
    return Number(pairInfo?.lastPriceNumber) || 0;
  }, [selectedPair, allSpotList]);

  const scrollToAndFocus = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = ref.current?.querySelector('input');
    input?.focus();
  };

  const handleConfirm = async () => {
    const values = form.getFieldsValue();
    const [baseToken, quoteToken] = selectedPair.split('/');

    const priceLower = Number(values.priceLower);
    const priceUpper = Number(values.priceUpper);
    const gridCountNum = Number(values.gridCount);
    const investAmountNum = Number(values.investAmount);

    // 校验价格区间
    if (!priceLower || !priceUpper || priceLower <= 0 || priceUpper <= 0 || priceLower >= priceUpper) {
      message.error(t('invalid-price-range'));
      scrollToAndFocus(priceRangeRef);
      return;
    }

    // 校验挂单数量
    if (!gridCountNum || gridCountNum < 2 || gridCountNum > 100 || !Number.isInteger(gridCountNum)) {
      message.error(t('invalid-grid-count'));
      scrollToAndFocus(gridCountRef);
      return;
    }

    // 校验投资金额
    if (!investAmountNum || investAmountNum <= 0) {
      message.error(t('enter-valid-investment'));
      scrollToAndFocus(investRef);
      return;
    }

    // 校验止盈止损（只要选中了止盈或止损类型就校验）
    if (takeProfitType || stopLossType) {
      const isValid = advancedSettingsRef.current?.validate();
      if (!isValid) {
        return;
      }
    }

    // 校验单格收益率
    if (!feeRate) {
      message.error(t('fee-rate-loading'));
      return;
    }

    const profitRate = calculateGridProfitRateNumber(
      {
        priceLower,
        priceUpper,
        gridCount: gridCountNum,
        gridType: values.gridMode === 'arithmetic' ? 1 : 2
      },
      feeRate
    );

    if (profitRate !== null && profitRate < 0) {
      message.error(t('profit-rate-too-low'));
      return;
    }

    const params: any = {
      base_token: baseToken,
      quote_token: quoteToken,
      price_lower: priceLower,
      price_upper: priceUpper,
      grid_type: values.gridMode === 'arithmetic' ? 1 : 2,
      grid_count: gridCountNum,
      investment_amount: investAmountNum,
      create_from: 2,
      strategy_type: 1
    };

    if (advancedOpen) {
      if (values.takeProfitType === 'price' && values.takeProfitPrice) {
        params.stop_take_profit = Number(values.takeProfitPrice);
      } else if (values.takeProfitType === 'breakUpper') {
        params.stop_break_upper = priceUpper;
      }

      if (values.stopLossType === 'price' && values.stopLossPrice) {
        params.stop_loss = Number(values.stopLossPrice);
      } else if (values.stopLossType === 'breakLower') {
        params.stop_break_lower = priceLower;
      }
    }

    // 调用预添加接口试算 buyQty
    setConfirming(true);
    try {
      const preAddParams: any = {
        base_token: params.base_token,
        quote_token: params.quote_token,
        price_lower: params.price_lower,
        price_upper: params.price_upper,
        grid_type: params.grid_type,
        grid_count: params.grid_count,
        investment_amount: params.investment_amount,
        create_from: params.create_from
      };

      // 添加可选参数
      if (params.stop_take_profit) {
        preAddParams.stop_take_profit = params.stop_take_profit;
      }
      if (params.stop_loss) {
        preAddParams.stop_loss = params.stop_loss;
      }
      if (params.stop_break_upper) {
        preAddParams.stop_break_upper = params.stop_break_upper;
      }
      if (params.stop_break_lower) {
        preAddParams.stop_break_lower = params.stop_break_lower;
      }

      const res = await preAddSpotGrid(preAddParams);

      const finalParams = {
        ...params,
        buyQty: res?.buyQty || 0,
        feeRate,
        minPricePrecision
      };

      setStrategyParams(finalParams);
      onClose();
      setConfirmOrderOpen(true);
    } catch (error) {
      console.error('预添加失败:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleOrderConfirm = () => {
    setConfirmOrderOpen(false);
    onConfirm();
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        closeIcon={null}
        width={440}
        className={styles.customParamsModal}
        centered
        maskClosable={false}
      >
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
          <div className={`${styles.modalContent} ${isCustomParams || type === 'copy-params' ? styles.modalContentCustom : styles.modalContentSimple}`}>
            {/* 头部 */}
            <div className={styles.head}>
              <h3 className={styles.title}>{title}</h3>
              <button className={styles.closeBtn} onClick={onClose}>
                <CloseIcon />
              </button>
            </div>

            {/* 币对信息 */}
            <div className={styles.pairSection}>
              {isCustomParams ? (
                <>
                  <div className={styles.pairHeaderWrapper}>
                    <div className={styles.pairHeaderLeft}>
                      <div className={styles.pairHeader}>
                        <div className={styles.pairLeft}>
                          <span className={styles.pairName}>
                            {displayData?.pairName || '--'}
                          </span>
                          <span className={styles.pairTag}>
                            {displayData?.pairTag || t('spot-grid')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.priceSection}>
                      <div className={styles.coinIcon}>
                        <img
                          className={styles.coinIconImage}
                          src={selectedPairData?.icon || getSymbolUrl(displayData?.pairName || 'BTC/USDT')}
                          alt={displayData?.pairName || selectedPair || 'coin'}
                        />
                      </div>
                      <span className={styles.coinPrice}>
                        {selectedPairData?.price || '--'}
                      </span>
                      <span className={`${styles.priceChange} ${selectedPairData?.isPositive ? '' : styles.priceChangeNegative}`}>
                        {selectedPairData?.change || '--'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.pairSelectorContainer} ref={dropdownRef}>
                  <div className={styles.pairHeaderSimple} onClick={handlePairClick}>
                    <div className={styles.pairLeftSimple}>
                      <img
                        className={styles.cryptoIcon}
                        src={selectedPairData?.icon || getSymbolUrl(selectedPair || 'BTC/USDT')}
                        alt={selectedPair || 'coin'}
                      />
                      <span className={styles.pairNameSimple}>{selectedPairData?.name || selectedPair || ''}</span>
                      <ArrowDownIcon className={`${styles.arrowDownIcon} ${pairDropdownOpen ? styles.arrowRotated : ''}`} />
                    </div>
                    <div className={styles.priceRight}>
                      <span className={styles.coinPriceSimple}>
                        {selectedPairData?.price || '--'}
                      </span>
                      <span className={`${styles.priceChangeSimple} ${selectedPairData?.isPositive ? '' : styles.priceChangeNegative}`}>
                        {selectedPairData?.change || '--'}
                      </span>
                    </div>
                  </div>

                  {/* 币对下拉列表 */}
                  {pairDropdownOpen && (
                    <div className={styles.pairDropdown}>
                      <div className={styles.pairDropdownContent}>
                        {pairList.map((pair) => (
                          <div
                            key={pair.name}
                            className={`${styles.pairOption} ${selectedPair === pair.name ? styles.pairOptionSelected : ''}`}
                            onClick={() => handleSelectPair(pair.name)}
                          >
                            <div className={styles.pairOptionLeft}>
                              <img className={styles.cryptoIcon} src={pair.icon} alt={pair.name} />
                              <span className={styles.pairOptionName}>{pair.name}</span>
                            </div>
                            <div className={styles.pairOptionRight}>
                              <span className={styles.pairOptionPrice}>{pair.price}</span>
                              <span className={`${styles.pairOptionChange} ${pair.isPositive ? '' : styles.priceChangeNegative}`}>
                                {pair.change}
                              </span>
                            </div>
                            {selectedPair === pair.name && (
                              <CheckIcon className={styles.selectedIcon} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 主体内容 */}
            <div className={styles.bodySection}>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  selectedPair: 'BTC/USDT',
                  gridMode: 'arithmetic',
                  investAmount: '',
                  sliderValue: 0,
                  priceLower: '',
                  priceUpper: '',
                  gridCount: '',
                  takeProfitType: '',
                  takeProfitPrice: '',
                  stopLossType: '',
                  stopLossPrice: ''
                }}
              >
                <div className={styles.formSection}>
                  {/* 价格区间 */}
                  <div ref={priceRangeRef} className={styles.formGroup}>
                    <div className={styles.formLabelRow}>
                      <div className={styles.formLabel}>{t('price-range')}</div>
                      <button
                        className={styles.aiButton}
                        onClick={handleAiParams}
                        disabled={aiLoading}
                        type="button"
                      >
                        {aiParamsFilled ? <DelIcon /> : <EditIcon />}
                        <span>{aiLoading ? t('loading') : (aiParamsFilled ? t('clear-params') : t('ai-params'))}</span>
                      </button>
                    </div>
                    <div className={styles.priceRange}>
                      <div className={styles.inputWrapper}>
                        <Form.Item name="priceLower" noStyle>
                          <Input
                            placeholder={t('lowest-price')}
                            suffix={quoteToken}
                            autoComplete="off"
                            onChange={handlePriceLowerChange}
                          />
                        </Form.Item>
                      </div>
                      <span className={styles.rangeSeparator}>-</span>
                      <div className={styles.inputWrapper}>
                        <Form.Item name="priceUpper" noStyle>
                          <Input
                            placeholder={t('highest-price')}
                            suffix={quoteToken}
                            autoComplete="off"
                            onChange={handlePriceUpperChange}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>

                  {/* 网格数量 */}
                  <div ref={gridCountRef} className={styles.formGroup}>
                    <div className={styles.formLabel}>{t('grid-quantity')}</div>
                    <div className={styles.gridInputWrapper}>
                      <Form.Item name="gridCount" noStyle>
                        <Input
                          placeholder="2-100"
                          className={styles.gridInput}
                          autoComplete="off"
                          onChange={handleGridCountChange}
                          onBlur={handleGridCountBlur}
                        />
                      </Form.Item>
                      <Form.Item name="gridMode" noStyle>
                        <Select
                          className={styles.gridModeSelect}
                          style={{ width: 'auto' }}
                          suffixIcon={<span className={styles.selectIcon}><VectorIcon /></span>}
                          options={[
                            { value: 'arithmetic', label: t('arithmetic') },
                            { value: 'geometric', label: t('geometric') }
                          ]}
                        />
                      </Form.Item>
                    </div>
                    {gridProfitRate !== '-' && (
                      <div className={styles.gridProfitRow}>
                        <span className={styles.gridProfitLabel}>{t('profit-per-grid-text')}</span>
                        <span className={styles.gridProfitValue}>{gridProfitRate}</span>
                      </div>
                    )}
                  </div>

                  {/* 投资额 - 使用隐藏的 Form.Item 来存储值 */}
                  <Form.Item name="selectedPair" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name="investAmount" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name="sliderValue" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name="takeProfitType" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name="takeProfitPrice" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name="stopLossType" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item name="stopLossPrice" noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <div ref={investRef}>
                    <InvestmentInput
                      investAmount={investAmount}
                      sliderValue={sliderValue}
                      spotBalance={spotBalance}
                      tokenSymbol={quoteToken}
                      onValueChange={handleValueChange}
                      onSwitchAccount={handleSwitchAccount}
                      recommendMinAmount={recommendMinAmount}
                      actionIcon={<SwitchIcon />}
                    />
                  </div>

                  {/* 高级设置 */}
                  <AdvancedSettings
                    ref={advancedSettingsRef}
                    open={advancedOpen}
                    onToggle={() => {
                      const next = !advancedOpen;
                      setAdvancedOpen(next);
                      if (next) {
                        requestAnimationFrame(() => {
                          advancedSettingsRef.current?.scrollIntoView?.();
                        });
                      }
                    }}
                    takeProfitType={takeProfitType}
                    onTakeProfitTypeChange={(value) => form.setFieldValue('takeProfitType', value)}
                    takeProfitPrice={takeProfitPrice}
                    onTakeProfitPriceChange={(value) => form.setFieldValue('takeProfitPrice', value)}
                    stopLossType={stopLossType}
                    onStopLossTypeChange={(value) => form.setFieldValue('stopLossType', value)}
                    stopLossPrice={stopLossPrice}
                    onStopLossPriceChange={(value) => form.setFieldValue('stopLossPrice', value)}
                    baseToken={selectedPair.split('/')[0]}
                    quoteToken={quoteToken}
                    currentPrice={currentMarketPrice}
                    minPricePrecision={minPricePrecision}
                  />
                </div>
              </Form>
            </div>

            {/* 底部按钮 */}
            <div className={styles.btnGroup}>
              <button
                className={`${styles.confirmBtn} ${confirming ? styles.loading : ''}`}
                onClick={handleConfirm}
                disabled={confirming || (!!recommendMinAmount && Number(investAmount) < Number(recommendMinAmount))}
              >
                {t('run-grid')}
              </button>
            </div>
          </div>
        </ConfigProvider>
      </Modal>

      <ConfirmOrderModal
        open={confirmOrderOpen}
        onClose={() => setConfirmOrderOpen(false)}
        onConfirm={handleOrderConfirm}
        strategyParams={strategyParams}
      />
    </>
  );
};

export default CustomParamsModal;
