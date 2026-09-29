import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Modal, Input, Select, Checkbox, message, ConfigProvider, theme, TimePicker } from 'antd';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/icons/arrow_down.svg';
import { ReactComponent as DelIcon } from '~/public/icons/delete.svg';
import { ReactComponent as AddIcon } from '~/public/icons/add.svg';
import { getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import dayjs from 'dayjs';
import { getAsset } from '~/api';
import { useMinInvestAmount } from '~/hooks/useMinInvestAmount';
import PlanNameModal from './PlanNameModal';
import PriceRangeModal from './PriceRangeModal';
import CoinSelectModal from './CoinSelectModal';
import ConfirmOrderModal from '~/components/SpotDCA/ConfirmOrderModal';
import { openTransferModal } from '~/utils';
import styles from './index.module.less';
import { ReactComponent as ChevronRightIcon } from '~/public/icons/chevron-right2.svg';

interface CoinItem {
  symbol: string;
  ratio: string;
}

interface PriceConfigItem {
  symbol: string;
  priceLower: string;
  priceUpper: string;
}

type CycleType = 'month' | 'week' | 'day' | 'hour';

interface CustomParamsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  mode?: 'create' | 'custom' | 'rerun';
  strategyDetail?: any;
}

const CustomParamsModal: React.FC<CustomParamsModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  mode = 'create',
  strategyDetail
}) => {
  const t = useFm();
  const router = useRouter();

  const { isLogin } = useUserInfo();

  // 币种配置
  const [coinList, setCoinList] = useState<CoinItem[]>([]);
  const [coinSelectModalOpen, setCoinSelectModalOpen] = useState(false);
  const [ratioManualEdited, setRatioManualEdited] = useState(false);

  // 投资金额
  const [investAmount, setInvestAmount] = useState('');
  const [investAmountError, setInvestAmountError] = useState('');
  const [spotBalance, setSpotBalance] = useState('0.00');

  // 定投周期
  const [cycleType, setCycleType] = useState<CycleType>('day');
  const [cycleValue, setCycleValue] = useState('1');
  const [cycleHour, setCycleHour] = useState('12');
  const [cycleMinute, setCycleMinute] = useState('00');
  const [executeImmediately, setExecuteImmediately] = useState(true);
  const [cycleExpanded, setCycleExpanded] = useState(true);

  const bodySectionRef = useRef<HTMLDivElement>(null);

  // 高级设置
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [priceConfig, setPriceConfig] = useState<PriceConfigItem[]>([]);
  const [planNameModalOpen, setPlanNameModalOpen] = useState(false);
  const [priceRangeModalOpen, setPriceRangeModalOpen] = useState(false);

  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false);
  const [confirmOrderParams, setConfirmOrderParams] = useState<any>(null);


  // 已选币种的符号集合
  const selectedSymbols = useMemo(() => coinList.map(c => c.symbol), [coinList]);

  // 总百分比
  const totalRatio = useMemo(() => {
    return coinList.reduce((sum, item) => sum + (Number(item.ratio) || 0), 0);
  }, [coinList]);

  const remainingRatio = 100 - totalRatio;

  const minInvestAmount = useMinInvestAmount(open, coinList);

  // 初始化
  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    if ((mode === 'custom' || mode === 'rerun') && strategyDetail) {
      const coins = (strategyDetail.relationCoin || '').split(',').filter(Boolean);
      const ratios = (strategyDetail.coinRatios || '').split(',');
      const items: CoinItem[] = coins.map((symbol: string, idx: number) => ({
        symbol,
        ratio: ratios[idx] || String(Math.floor(100 / coins.length))
      }));
      setCoinList(items);

      if (strategyDetail.margin) {
        setInvestAmount(String(strategyDetail.margin));
      }

      if (strategyDetail.priceConfig) {
        try {
          const parsed = typeof strategyDetail.priceConfig === 'string'
            ? JSON.parse(strategyDetail.priceConfig)
            : strategyDetail.priceConfig;
          if (Array.isArray(parsed)) {
            // 接口返回格式: { coin, min, max }，转换为内部格式: { symbol, priceLower, priceUpper }
            const converted: PriceConfigItem[] = parsed.map((pc: any) => ({
              symbol: pc.coin || pc.symbol || '',
              priceLower: pc.min != null ? String(pc.min) : (pc.priceLower || ''),
              priceUpper: pc.max != null ? String(pc.max) : (pc.priceUpper || '')
            }));
            setPriceConfig(converted);
          }
        } catch {
          // priceConfig 解析失败则忽略
        }
      }

      setPlanName(strategyDetail.strategyName || '');

      if (strategyDetail.strategyCron) {
        const parts = strategyDetail.strategyCron.split(' ');
        if (parts.length >= 6) {
          const [, minute, hour, dayOfMonth, , dayOfWeek] = parts;
          if (hour.includes('/')) {
            setCycleType('hour');
            setCycleValue(hour.split('/')[1] || '1');
          } else if (dayOfWeek !== '?' && dayOfWeek !== '*') {
            setCycleType('week');
            setCycleValue(dayOfWeek);
            setCycleHour(hour);
            setCycleMinute(minute);
          } else if (dayOfMonth !== '*' && dayOfMonth !== '?' && !dayOfMonth.includes('/')) {
            setCycleType('month');
            setCycleValue(dayOfMonth);
            setCycleHour(hour);
            setCycleMinute(minute);
          } else {
            setCycleType('day');
            setCycleValue(dayOfMonth.includes('/') ? dayOfMonth.split('/')[1] : '1');
            setCycleHour(hour);
            setCycleMinute(minute);
          }
        }
      }
    }
  }, [open, mode, strategyDetail]);

  useEffect(() => {
    if (open) {
      fetchSpotBalance();
    }
  }, [open]);

  const resetForm = () => {
    setCoinList([]);
    setInvestAmount('');
    setInvestAmountError('');
    setSpotBalance('0.00');
    setCycleType('day');
    setCycleValue('1');
    setCycleHour('12');
    setCycleMinute('00');
    setExecuteImmediately(true);
    setAdvancedOpen(false);
    setPlanName('');
    setPriceConfig([]);
    setCoinSelectModalOpen(false);
    setRatioManualEdited(false);
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

  // 币种操作
  const evenDistribute = (items: CoinItem[]): CoinItem[] => {
    if (items.length === 0) return items;
    const base = Math.floor(100 / items.length);
    const remainder = 100 - base * items.length;
    return items.map((item, idx) => ({
      ...item,
      ratio: String(base + (idx < remainder ? 1 : 0))
    }));
  };

  const handleCoinSelectConfirm = (symbols: string[]) => {
    const existing = coinList.filter(c => symbols.includes(c.symbol));
    const newSymbols = symbols.filter(s => !selectedSymbols.includes(s));

    if (ratioManualEdited) {
      const newItems = newSymbols.map(s => ({ symbol: s, ratio: '5' }));
      setCoinList([...existing, ...newItems]);
    } else {
      const newItems = newSymbols.map(s => ({ symbol: s, ratio: '' }));
      const merged = [...existing, ...newItems];
      setCoinList(evenDistribute(merged));
    }
    setCoinSelectModalOpen(false);
  };

  const handleRemoveCoin = (index: number) => {
    const next = [...coinList];
    next.splice(index, 1);
    if (ratioManualEdited) {
      setCoinList(next);
    } else {
      setCoinList(evenDistribute(next));
    }
  };

  const handleRatioChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    const num = Number(cleaned);
    if (num > 100) return;
    const next = [...coinList];
    next[index] = { ...next[index], ratio: cleaned };
    setCoinList(next);
    setRatioManualEdited(true);
  };

  const handleEvenDistribute = () => {
    if (coinList.length === 0) return;
    setCoinList(evenDistribute(coinList));
    setRatioManualEdited(false);
  };

  // 定投周期生成 cron
  const generateCron = useCallback(() => {
    const minute = cycleMinute;
    const hour = cycleHour;
    const value = cycleValue;

    switch (cycleType) {
      case 'month':
        // 每月第N天 HH:mm 执行
        return `0 ${minute} ${hour} ${value} * ?`;
      case 'week':
        // 每周第N天 HH:mm 执行（1=周日, 2=周一 ... 7=周六）
        return `0 ${minute} ${hour} ? * ${value}`;
      case 'day':
        // 每N天 HH:mm 执行
        return `0 ${minute} ${hour} */${value} * ?`;
      case 'hour':
        // 每N小时整点执行
        return `0 0 */${value} * * ?`;
      default:
        return `0 ${minute} ${hour} * * ?`;
    }
  }, [cycleType, cycleValue, cycleHour, cycleMinute]);

  // 格式化周期显示（cycleValue 未填时不展示 summary）
  const timeDisplay = `${cycleHour.padStart(2, '0')}:${cycleMinute.padStart(2, '0')}`;
  const cycleSummary = useMemo(() => {
    if (!cycleValue) return '';
    switch (cycleType) {
      case 'month':
        return `${t('every-month')}${cycleValue}${t('month-day-unit')} ${timeDisplay}`;
      case 'week': {
        const weekDays = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];
        const dayName = weekDays[Number(cycleValue) - 1] || cycleValue;
        return `${t('every')}${dayName} ${timeDisplay}`;
      }
      case 'day':
        return `${t('every')}${cycleValue}${t('day-unit')} ${timeDisplay}`;
      case 'hour':
        return `${t('every')}${cycleValue}${t('hour-unit')}`;
      default:
        return '';
    }
  }, [cycleType, cycleValue, timeDisplay, t]);

  const handleSwitchAccount = () => {
    openTransferModal(() => {
      // 划转成功后刷新现货余额
      fetchSpotBalance();
    });
  };

  // 提交
  const handleConfirm = () => {
    if (!isLogin) {
      goPage('login');
      return;
    }

    if (coinList.length === 0) {
      message.error(t('please-add-coin'));
      return;
    }

    if (totalRatio !== 100) {
      message.error(t('ratio-must-100'));
      return;
    }

    if (!investAmount || Number(investAmount) <= 0 || Number(investAmount) < minInvestAmount) {
      setInvestAmountError(t('invest-amount-too-low', { min: minInvestAmount }));
      return;
    }

    if (!cycleValue) {
      if (!cycleExpanded) setCycleExpanded(true);
      message.error(t('please-fill-cycle'));
      return;
    }

    // 构建参数，打开确认弹框
    const priceConfigMap = priceConfig.reduce<Record<string, PriceConfigItem>>((acc, pc) => {
      acc[pc.symbol] = pc;
      return acc;
    }, {});

    const price_config = coinList.map(c => {
      const pc = priceConfigMap[c.symbol];
      return {
        coin: c.symbol,
        ratio: Number(c.ratio),
        ...(pc?.priceLower ? { min: Number(pc.priceLower) } : {}),
        ...(pc?.priceUpper ? { max: Number(pc.priceUpper) } : {})
      };
    });

    const params: any = {
      relation_coin: coinList.map(c => c.symbol).join(','),
      margin: Number(investAmount),
      strategy_cron: generateCron(),
      execute_immediately: executeImmediately ? 'Y' : 'N',
      timezone: `UTC${new Date().getTimezoneOffset() <= 0 ? '+' : '-'}${Math.abs(new Date().getTimezoneOffset() / 60)}`,
      price_config
    };

    if (planName) {
      params.strategy_name = planName;
    } else {
      params.strategy_name = coinList.map(c => c.symbol).join('+');
    }

    setConfirmOrderParams(params);
    onClose();
    setConfirmOrderOpen(true);
  };

  const handleConfirmOrderSuccess = () => {
    setConfirmOrderOpen(false);
    onClose();
    onConfirm();
  };

  // 格式化价格区间显示文案
  const priceRangeDisplay = useMemo(() => {
    const hasPrice = (pc: PriceConfigItem) => pc.priceLower || pc.priceUpper;
    const validConfigs = priceConfig.filter(hasPrice);
    if (validConfigs.length === 0) return t('not-set');
    // 多个币对设置了价格区间，直接显示"已设置"
    if (priceConfig.length > 1 && validConfigs.length > 0) return t('already-set');
    const single = validConfigs[0];
    if (single.priceLower && single.priceUpper) {
      return `${single.priceLower} - ${single.priceUpper}`;
    }
    if (single.priceLower) return `≥${single.priceLower}`;
    if (single.priceUpper) return `≤${single.priceUpper}`;
    return t('not-set');
  }, [priceConfig, t]);

  // 时间值
  const timeValue = useMemo(() => {
    return dayjs(`${cycleHour.padStart(2, '0')}:${cycleMinute.padStart(2, '0')}`, 'HH:mm');
  }, [cycleHour, cycleMinute]);

  const handleTimeChange = (time: any) => {
    if (time) {
      setCycleHour(String(time.hour()));
      setCycleMinute(String(time.minute()).padStart(2, '0'));
    }
  };

  const weekOptions = [
    { value: '1', label: t('monday') },
    { value: '2', label: t('tuesday') },
    { value: '3', label: t('wednesday') },
    { value: '4', label: t('thursday') },
    { value: '5', label: t('friday') },
    { value: '6', label: t('saturday') },
    { value: '7', label: t('sunday') }
  ];

  const modalTitle = title || (mode === 'create' ? t('create-spot-dca') : t('custom-params'));

  return (
    <>
      <Modal
        open={open && !coinSelectModalOpen && !planNameModalOpen && !priceRangeModalOpen}
        onCancel={onClose}
        footer={null}
        closeIcon={null}
        width={440}
        className={styles.customParamsModal}
        centered
        maskClosable={false}
      >
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
          <div className={styles.modalContent}>
            <div className={styles.head}>
              <h3 className={styles.title}>{modalTitle}</h3>
              <button className={styles.closeBtn} onClick={onClose}>
                <CloseIcon />
              </button>
            </div>

            {/* 币种标题 */}
            {coinList.length > 0 && (
              <div className={styles.pairSection}>
                <span className={styles.pairName}>{coinList.map(c => c.symbol).join(', ')}</span>
                <span className={styles.pairTag}>{t('spot-dca')}</span>
                {mode !== 'rerun' && strategyDetail?.useCount !== undefined && (
                  <span className={styles.useCount}>{t('users-count')}: {strategyDetail.useCount}</span>
                )}
              </div>
            )}

            <div className={styles.bodySection} ref={bodySectionRef}>
              {/* 币种配置 */}
              <div className={styles.sectionGroup}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>{t('coin-config')}</span>
                  {coinList.length > 0 && (
                    <span className={styles.addCoinBtn} onClick={() => setCoinSelectModalOpen(true)}>
                      {t('add-coin')}
                    </span>
                  )}
                </div>

                {coinList.length === 0 && (
                  <div className={styles.addCoinPlaceholder} onClick={() => setCoinSelectModalOpen(true)}>
                    {t('add-coin')}
                  </div>
                )}

                {coinList.map((item, index) => (
                  <div key={item.symbol} className={styles.coinRow}>
                    <div className={styles.coinMain}>
                      <div className={styles.coinInfo} onClick={() => setCoinSelectModalOpen(true)}>
                        <img className={styles.coinIcon} src={getSymbolUrl(item.symbol)} alt={item.symbol} />
                        <span className={styles.coinName}>{item.symbol}</span>
                        <ArrowDownIcon className={styles.coinArrow} />
                      </div>
                      <div className={styles.coinRatioWrapper}>
                        <Input
                          className={styles.ratioInput}
                          value={item.ratio}
                          onChange={(e) => handleRatioChange(index, e.target.value)}
                          suffix="%"
                          size="small"
                        />
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => handleRemoveCoin(index)}>
                      <DelIcon />
                    </button>
                  </div>
                ))}

                {ratioManualEdited && coinList.length > 0 && totalRatio !== 100 && (
                  <div className={styles.ratioWarning}>
                    {t('ratio-warning')}
                  </div>
                )}

                {ratioManualEdited && coinList.length > 0 && (
                  <div className={styles.ratioFooter}>
                    <span className={styles.remainingRatio}>
                      {t('remaining-ratio')}: {remainingRatio}%
                    </span>
                    <span className={styles.evenDistribute} onClick={handleEvenDistribute}>
                      {t('even-distribute')}
                    </span>
                  </div>
                )}
              </div>

              {/* 每次投入 */}
              <div className={styles.sectionGroup}>
                <div className={styles.sectionTitle}>{t('invest-per-time')}</div>
                <div className={styles.investInputWrapper}>
                  <Input
                    className={styles.investInput}
                    placeholder={`≥${minInvestAmount}`}
                    value={investAmount}
                    status={investAmountError ? 'error' : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d.]/g, '');
                      setInvestAmount(val);
                      if (investAmountError) setInvestAmountError('');
                    }}
                    onBlur={() => {
                      if (investAmount && Number(investAmount) < minInvestAmount) {
                        setInvestAmountError(t('invest-amount-too-low', { min: minInvestAmount }));
                      } else {
                        setInvestAmountError('');
                      }
                    }}
                    suffix="USDT"
                  />
                  {investAmountError && (
                    <div className={styles.inputErrorMsg}>{investAmountError}</div>
                  )}
                </div>
                <div className={styles.balanceRow}>
                  <span className={styles.balanceLabel}>{t('spot-balance-available')}</span>
                  <span className={styles.balanceValue} onClick={handleSwitchAccount}>
                    {spotBalance} USDT <AddIcon />
                  </span>
                </div>
              </div>

              {/* 定投周期 */}
              <div className={styles.sectionGroup}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>{t('dca-cycle')}</span>
                  <div className={styles.cycleToggle} onClick={() => setCycleExpanded(!cycleExpanded)}>
                    <span className={styles.cycleSummary}>{cycleSummary}</span>
                    <ArrowDownIcon className={`${styles.cycleArrow} ${cycleExpanded ? styles.cycleArrowUp : ''}`} />
                  </div>
                </div>

                {cycleExpanded && (
                  <>
                    <div className={styles.cycleTabs}>
                      {(['month', 'week', 'day', 'hour'] as CycleType[]).map(type => (
                        <div
                          key={type}
                          className={`${styles.cycleTab} ${cycleType === type ? styles.cycleTabActive : ''}`}
                          onClick={() => {
                            setCycleType(type);
                            setCycleValue('');
                          }}
                        >
                          {t(`cycle-${type}`)}
                        </div>
                      ))}
                    </div>

                    <div className={styles.cycleFields}>
                      {cycleType === 'month' && (
                        <>
                          <Input
                            className={styles.cycleInput}
                            value={cycleValue}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^\d]/g, '');
                              const num = Number(val);
                              if (num <= 28) setCycleValue(val);
                            }}
                            onFocus={(e) => {
                              const el = e.target;
                              requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
                            }}
                            onClick={(e) => {
                              const el = e.target as HTMLInputElement;
                              requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
                            }}
                            placeholder="1-28"
                            prefix={<span className={styles.cycleInputPrefix}>{t('monthly-period')}</span>}
                          />
                          <div className={styles.cycleTimeRow}>
                            <span className={styles.cycleSelectLabel}>{t('local-time')}</span>
                            <TimePicker
                              className={styles.cycleTimePicker}
                              value={timeValue}
                              onChange={handleTimeChange}
                              format="HH:mm"
                              suffixIcon={<ArrowDownIcon />}
                              allowClear={false}
                              inputReadOnly
                              placement="bottomRight"
                              classNames={{ popup: { root: styles.cycleTimePopup } }}
                            />
                          </div>
                        </>
                      )}

                      {cycleType === 'week' && (
                        <>
                          <div className={styles.cycleSelectRow}>
                            <Select
                              className={styles.cycleSelectFull}
                              value={cycleValue}
                              onChange={setCycleValue}
                              options={weekOptions}
                              suffixIcon={<ArrowDownIcon />}
                              prefix={<span className={styles.cycleSelectLabel}>{t('every')}</span>}
                            />
                          </div>
                          <div className={styles.cycleTimeRow}>
                            <span className={styles.cycleSelectLabel}>{t('local-time')}</span>
                            <TimePicker
                              className={styles.cycleTimePicker}
                              value={timeValue}
                              onChange={handleTimeChange}
                              format="HH:mm"
                              suffixIcon={<ArrowDownIcon />}
                              allowClear={false}
                              inputReadOnly
                              placement="bottomRight"
                              classNames={{ popup: { root: styles.cycleTimePopup } }}
                            />
                          </div>
                        </>
                      )}

                      {cycleType === 'day' && (
                        <>
                          <Input
                            className={styles.cycleInput}
                            value={cycleValue}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^\d]/g, '');
                              const num = Number(val);
                              if (num <= 30) setCycleValue(val);
                            }}
                            onFocus={(e) => {
                              const el = e.target;
                              requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
                            }}
                            onClick={(e) => {
                              const el = e.target as HTMLInputElement;
                              requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
                            }}
                            placeholder="1-30"
                            prefix={<span className={styles.cycleInputPrefix}>{t('every')}</span>}
                            suffix={<span className={styles.cycleInputSuffix}>{t('day-unit')}</span>}
                          />
                          <div className={styles.cycleTimeRow}>
                            <span className={styles.cycleSelectLabel}>{t('local-time')}</span>
                            <TimePicker
                              className={styles.cycleTimePicker}
                              value={timeValue}
                              onChange={handleTimeChange}
                              format="HH:mm"
                              suffixIcon={<ArrowDownIcon />}
                              allowClear={false}
                              inputReadOnly
                              placement="bottomRight"
                              classNames={{ popup: { root: styles.cycleTimePopup } }}
                            />
                          </div>
                        </>
                      )}

                      {cycleType === 'hour' && (
                        <Input
                          className={styles.cycleInput}
                          value={cycleValue}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^\d]/g, '');
                            const num = Number(val);
                            if (num <= 24) setCycleValue(val);
                          }}
                          onFocus={(e) => {
                            const el = e.target;
                            requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
                          }}
                          onClick={(e) => {
                            const el = e.target as HTMLInputElement;
                            requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
                          }}
                          placeholder="1-24"
                          prefix={<span className={styles.cycleInputPrefix}>{t('every')}</span>}
                          suffix={<span className={styles.cycleInputSuffix}>{t('hour-unit')}</span>}
                        />
                      )}
                    </div>

                    <div className={styles.immediateCheck}>
                      <Checkbox
                        checked={executeImmediately}
                        onChange={(e) => setExecuteImmediately(e.target.checked)}
                      >
                        {t('execute-first-immediately')}
                      </Checkbox>
                    </div>
                  </>
                )}
              </div>

              {/* 高级设置 */}
              <div className={styles.advancedSection}>
                <div className={styles.advancedHeader} onClick={() => {
                  const next = !advancedOpen;
                  setAdvancedOpen(next);
                  if (next) {
                    setTimeout(() => {
                      bodySectionRef.current?.scrollTo({ top: bodySectionRef.current.scrollHeight, behavior: 'smooth' });
                    }, 50);
                  }
                }}>
                  <span className={styles.advancedTitle}>{t('advanced-settings')}</span>
                  <ArrowDownIcon className={`${styles.advancedArrow} ${advancedOpen ? styles.advancedArrowOpen : ''}`} />
                </div>
                {advancedOpen && (
                  <div className={styles.advancedBody}>
                    <div className={styles.advancedItem} >
                      <span className={styles.advancedLabel}>{t('dca-plan-name')}</span>
                      <div className={styles.advancedAction} onClick={() => setPlanNameModalOpen(true)}>
                        <span className={styles.advancedValue}>{planName || t('not-set')}</span>
                        <ChevronRightIcon />
                      </div>
                    </div>
                    <div className={styles.advancedItem} >
                      <span className={styles.advancedLabel}>{t('buy-price-range')}</span>
                      <div className={styles.advancedAction} onClick={() => setPriceRangeModalOpen(true)}>
                        <span className={styles.advancedValue}>{priceRangeDisplay}</span>
                        <ChevronRightIcon />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部按钮 */}
            <div className={styles.btnGroup}>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
              >
                {t('create-strategy')}
              </button>
            </div>
          </div>
        </ConfigProvider>
      </Modal>

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
          setPriceConfig(config);
          setPriceRangeModalOpen(false);
        }}
        coinList={coinList.map(c => c.symbol)}
        initialConfig={priceConfig}
      />

      <CoinSelectModal
        open={coinSelectModalOpen}
        onClose={() => setCoinSelectModalOpen(false)}
        onConfirm={handleCoinSelectConfirm}
        selectedSymbols={selectedSymbols}
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

export default CustomParamsModal;
