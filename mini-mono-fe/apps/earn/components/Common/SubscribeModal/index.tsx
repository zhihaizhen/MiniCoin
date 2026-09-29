import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Checkbox, Input, message, Modal, Progress, Switch } from 'antd';
import { ITime, ProductDetailProps, ProductGroupProps, ProductProps } from '~/interface';
import Image from 'next/image';
import { getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { getCoinAssets, getProductDetail, getPublicProductDetail, postProductSubscribe } from '~/api';
import { useFm } from '@better-bit-fe/base-hooks';
import { CategoryEnum, PnlTypeEnum, ProductStatusEnum, TagEnum } from '~/enums';
import { ReactComponent as SelectCornIcon } from '~/public/images/select-corner.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/images/arrow-down-solid.svg';
import { ReactComponent as AddIcon } from '~/public/images/add.svg';
import { calcDailyEarning, countdownFormat, formatApr, toThousandsNumberNoZero } from '~/utils';
import SuccessModal from '~/components/Common/SuccessModal';
import AddAssetsModal from '~/components/Common/AddAssetsModal';
import AutoRenewModal from './AutoRenewModal';
import ProductTag from '~/components/Common/ProductTag';
import Timeline from '~/components/Common/Timeline';
import { TIME_FORMAT } from '~/constants';
import dayjs from 'dayjs';
import { useEarnDataRefresh } from '~/context/EarnDataContext';
import { useUserInfo } from '@better-bit-fe/base-provider';
import BigNumber from 'bignumber.js';
import { FormattedMessage } from 'react-intl';
import EarnTooltip from '~/components/Common/EarnTooltip';

interface SubscribeModalProps {
  open: boolean;
  group: ProductGroupProps;
  defaultProductId?: string;
  close: () => void;
}

/**
 * 理财申购弹窗
 */
const SubscribeModal: React.FC<SubscribeModalProps> = ({
                                                         open,
                                                         group,
                                                         defaultProductId,
                                                         close
                                                       }: SubscribeModalProps) => {
  const { isLogin } = useUserInfo();
  const t = useFm();
  const { triggerRefresh } = useEarnDataRefresh();
  const [errorCode, setErrorCode] = useState(0);

  const [loading, setLoading] = useState(false);
  const [productDetail, setProductDetail] = useState<ProductDetailProps>();
  const [selectedProduct, setSelectedProduct] = useState<ProductProps>(
    group?.product_item[0]
  );
  const [checked, setChecked] = useState(false);

  // 申购金额
  const [amount, setAmount] = useState<string>('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [showAutoRenewModal, setShowAutoRenewModal] = useState(false);
  const [pendingAutoRenew, setPendingAutoRenew] = useState(false);
  const [inputStatus, setInputStatus] = useState<'' | 'warning' | 'error'>('');
  const [inputErrorStr, setInputErrorStr] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [coinAsset, setCoinAsset] = useState(0);

  const [isShowModal, setIsShowModal] = useState(open);

  const [time, setTime] = useState<ITime>({
    day: '00',
    hour: '00',
    min: '00',
    sec: '00'
  });

  useEffect(() => {
    setIsShowModal(open);
  }, [open]);

  const precision = useMemo(() => {
    const str = String(productDetail?.precision_digits || '');
    if (!str.includes('.')) return 8;
    return str.split('.')[1].length;
  }, [productDetail?.precision_digits]);

  /**
   * 金额校验逻辑提取
   */
  const validateAmount = (
    value: string,
    detail: ProductDetailProps
  ): {
    status: '' | 'warning' | 'error';
    message: string;
    normalizedValue: string;
  } => {
    let normalizedValue = value;

    if (!normalizedValue) {
      return { status: '', message: '', normalizedValue };
    }
    const numericValue = Number(normalizedValue);
    if (Number.isNaN(numericValue)) {
      return {
        status: 'error',
        message: t('invalidAmount', '金额格式不正确'),
        normalizedValue
      };
    }
    if (numericValue < Number(detail.min_investment_quota)) {
      return {
        status: 'error',
        message: t('miniAmountWarn', {
          min: `${Number(detail.min_investment_quota)} ${detail.coin}`
        }),
        normalizedValue
      };
    }
    if (leftAvailableAmount >= 0 && numericValue > leftAvailableAmount) {
      return {
        status: 'error',
        message: t('overAllow', '剩余可投不足'),
        normalizedValue
      };
    }
    if (numericValue > coinAsset) {
      return {
        status: 'error',
        message: t('overHold', '可用余额不足'),
        normalizedValue
      };
    }

    if (+detail.max_investment_quota >= 0 && numericValue > +detail.max_investment_quota) {
      normalizedValue = String(+detail.max_investment_quota);
    }

    return { status: '', message: '', normalizedValue };
  };


  // 预期收益
  const expectedAmount = useMemo(() => {
    const positionSize = productDetail?.position_size || '0';
    const currentAmount = amount || '0';

    const numericAmount = new BigNumber(positionSize).plus(currentAmount);

    // 检查是否为有效数字
    if (numericAmount.isNaN() || !numericAmount.isFinite()) return '0';

    if (productDetail?.apr_type !== CategoryEnum.FIXED) {
      // 活期阶梯收益计算（calcDailyEarning 内部已使用 BigNumber）
      const result = calcDailyEarning(numericAmount, productDetail?.level_apr);
      return new BigNumber(result).decimalPlaces(precision, BigNumber.ROUND_DOWN).toFormat();
    }

    // 定期收益计算：总金额 * 固定年化 * (天数 / 365)
    const fixedApr = new BigNumber(productDetail.fixed_apr || '0');
    const durationDays = new BigNumber(productDetail.duration_days || 0);

    const expectedEarning = numericAmount
      .multipliedBy(fixedApr)
      .multipliedBy(durationDays.dividedBy(365)).decimalPlaces(precision, BigNumber.ROUND_DOWN).toFormat();
    return expectedEarning;
  }, [
    amount,
    precision,
    productDetail?.position_size,
    productDetail?.apr_type,
    productDetail?.duration_days,
    productDetail?.fixed_apr,
    productDetail?.level_apr
  ]);

  // group 变化时重置当前选中产品
  useEffect(() => {
    if (!group) return;
    if (!defaultProductId) {
      setSelectedProduct(group?.product_item[0]);
      return;
    }
    const product = group?.product_item.find((item) => item.id === defaultProductId);
    setSelectedProduct(product);
  }, [group, defaultProductId]);

  // 打开弹窗或切换产品时拉取产品详情
  useEffect(() => {
    let active = true;
    const fetchProductDetail = async () => {
      if (!isShowModal || !selectedProduct?.id) return;

      const nowTime = dayjs().unix();

      if (nowTime < selectedProduct.subscribe_start_at){
        setProductDetail(null);
        setErrorCode(35900005);
        void message.warning(t('subscribe-start-tip', {date: dayjs(selectedProduct.subscribe_start_at * 1000).format(TIME_FORMAT)}));
        return;
      }
      if (nowTime > selectedProduct.subscribe_end_at) {
        setProductDetail(null);
        void message.warning(t('subscribe-end'));
        return;
      }

      setLoading(true);
      try {
        const fetchFn = isLogin ? getProductDetail : getPublicProductDetail;
        const res = await fetchFn(selectedProduct.id);
        if (active) {
          setProductDetail(res);
          setErrorCode(0);
        }
      } catch (e: any) {
        if (active) {
          setProductDetail(null);
          setErrorCode(e?.code);
          void message.error(t(e?.code || 'unknown-error'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProductDetail();

    return () => {
      active = false;
    };
  }, [selectedProduct, isShowModal, t, isLogin]);

  const onAmountChange = (value: string): void => {
    setAmount(value);
    setInputStatus('');
    setInputErrorStr('');

    if (!productDetail) return;

    const { status, message, normalizedValue } = validateAmount(
      value,
      productDetail
    );
    setAmount(normalizedValue);
    setInputStatus(status);
    setInputErrorStr(message);
  };

  const handleAmountInput = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      // 对于带小数点的情况，限制小数位数
      if (inputValue.includes('.')) {
        const [, decimalPart = ''] = inputValue.split('.');
        // 小数位超过 precision，直接丢弃这次输入（不触发 onAmountChange）
        if (decimalPart.length > precision) {
          return;
        }
      }
      onAmountChange(inputValue);
    }
  };

  const handleAmountBlur = (): void => {
    if (!amount) return;

    let valueTemp = amount;
    if (amount.charAt(amount.length - 1) === '.' || amount === '-') {
      valueTemp = amount.slice(0, -1);
    }
    onAmountChange(valueTemp.replace(/0*(\d+)/, '$1'));
  };

  const handleMaxInput = (): void => {
    if (!productDetail) return;
    const minNumberArray = [
      +leftAvailableAmount,
      +productDetail?.max_investment_quota,
      coinAsset
    ].filter((n) => n >= 0);
    const minValue =
      minNumberArray.length > 0 ? Math.min(...minNumberArray) : 0;
    onAmountChange(String(minValue));
  };

  const handleSelectProduct = (product: ProductProps): void => {
    if (product.id === selectedProduct?.id) return;
    setSelectedProduct(product);
    setAmount('');
    setInputStatus('');
    setInputErrorStr('');
  };


  const handleAutoRenewChange = (checked: boolean) => {
    setPendingAutoRenew(checked);
    setShowAutoRenewModal(true);
  };

  /**
   * 申购
   */
  const handleSubscribe = (): void => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    if (!checked || inputStatus || !amount || !selectedProduct) return;

    const params = {
      product_id: selectedProduct.id,
      purchase_share: amount,
      auto_renew: autoRenew
    };

    setLoading(true);
    postProductSubscribe(params)
      .then(() => {
        setIsShowModal(false);
        setShowSuccessModal(true);
        // 触发数据刷新，更新 OverviewHeader 中的 wallet 数据
        triggerRefresh();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = (): void => {
    setAmount('');
    setAutoRenew(false);
    setInputStatus('');
    setInputErrorStr('');
    setChecked(false);
    setShowSuccessModal(false);
    setShowTimeline(false);
    const product = !defaultProductId ? group?.product_item?.[0] :group?.product_item.find(
      (item) => item.id === defaultProductId
    );
    setSelectedProduct(product);
    close();
  };

  // 抢购产品倒计时
  useEffect(() => {
    const endAt = productDetail?.subscribe_end_at;

    const mapPartsToTime = (parts: { days: string; hours: string; minutes: string; seconds: string }) => ({
      day: parts.days,
      hour: parts.hours,
      min: parts.minutes,
      sec: parts.seconds
    });

    const handleTick = (parts: { days: string; hours: string; minutes: string; seconds: string }) => {
      setTime(mapPartsToTime(parts));
    };

    // 只有抢购的产品才倒计时（非抢购则归零并停止）
    if (productDetail?.product_type !== TagEnum.RUSH) {
      return countdownFormat(null, handleTick);
    }

    return countdownFormat(endAt, handleTick);
  }, [productDetail?.product_type, productDetail?.subscribe_end_at]);

  /**
   * 剩余可投, -1 表示无限制
   */
  const leftAvailableAmount = useMemo(() => {
    if (
      +productDetail?.allow_invest_quota < 0 &&
      +productDetail?.person_allow_quota < 0
    ) {
      return -1;
    }
    if (+productDetail?.allow_invest_quota < 0) {
      return +productDetail?.person_allow_quota;
    }
    if (+productDetail?.person_allow_quota < 0) {
      return +productDetail?.allow_invest_quota;
    }
    return Math.min(
      +productDetail?.person_allow_quota,
      +productDetail?.allow_invest_quota
    );
  }, [productDetail?.allow_invest_quota, productDetail?.person_allow_quota]);

  // 参考年化
  const referApr = useMemo(() => {
    if (!productDetail) return '-';
    if (productDetail?.apr_type === CategoryEnum.FIXED) {
      return formatApr(productDetail?.fixed_apr);
    }
    const maxApr = productDetail?.level_apr?.[0]?.apr;
    const minApr = productDetail?.level_apr?.[productDetail?.level_apr?.length -1]?.apr;
    if (minApr === maxApr) return formatApr(minApr);
    return `${formatApr(minApr)} ~ ${formatApr(maxApr)}`;
  }, [productDetail]);

  useEffect(() => {
    if (!isShowModal || !isLogin) return;
    getCoinAssets().then((res) => {
      const findAsset = res.find(
        (item) => item.tokenName === selectedProduct?.coin
      );
      setCoinAsset(+findAsset?.free || 0);
    });
  }, [isLogin, isShowModal, selectedProduct?.coin]);
  // 产品状态
  const productStatus = useMemo(() => {
    if (
      +time.day === 0 &&
      +time.hour === 0 &&
      +time.min === 0 &&
      +time.sec === 0
    ) {
      return ProductStatusEnum.STOPPED;
    }
    if (
      Number(productDetail?.sold_quota) >= Number(productDetail?.total_quota)
    ) {
      return ProductStatusEnum.COMPLETED;
    }
    return `${toThousandsNumberNoZero(
      (Number(productDetail?.sold_quota) /
        Number(productDetail?.total_quota || 1)) *
        100,
      precision
    )} %`;
  }, [
    precision,
    productDetail?.sold_quota,
    productDetail?.total_quota,
    t,
    time.day,
    time.hour,
    time.min,
    time.sec
  ]);

  const inputDisabled = useMemo(() => {
    if (!productDetail) return true;
    if (productDetail.product_type === TagEnum.RUSH) {
      return productStatus === ProductStatusEnum.COMPLETED || productStatus === ProductStatusEnum.STOPPED
    }
    return false;
  }, [productDetail, productStatus]);

  const handleAddAsset = () => {
    setIsShowModal(false);
    setShowAddAssetsModal(true);
  }

  const handleAssetModalClose = () => {
    setIsShowModal(true);
    setShowAddAssetsModal(false);
  }

  const secondText = 'text-text-secondary text-xs mr-3';
  const secondValue = 'text-text-primary text-xs font-medium';

  return (
    <>
      <AutoRenewModal
        open={showAutoRenewModal}
        checked={pendingAutoRenew}
        coin={selectedProduct?.coin}
        category={selectedProduct?.category}
        onCancel={() => setShowAutoRenewModal(false)}
        onConfirm={() => {
          setAutoRenew(pendingAutoRenew);
          setShowAutoRenewModal(false);
        }}
      />
      <Modal
        open={isShowModal}
        centered
        maskClosable={false}
        onCancel={null}
        closeIcon={null}
        width={600}
        footer={null}
        wrapClassName="custom-modal-wrapper"
      >
        <div className="relative min-h-[460px] py-2">
          <div className="w-full flex items-center justify-between pr-3">
            <div className="flex justify-start items-center gap-2 text-text-primary text-base font-semibold ">
              <Image
                src={
                  selectedProduct?.coin
                    ? getSymbolUrl(selectedProduct.coin)
                    : ''
                }
                alt={selectedProduct?.coin}
                width={28}
                height={28}
                loader={({ src }) => src}
              />
              <span className="flex-1">
                {selectedProduct?.coin}  -{' '}
                {t(`savings-${selectedProduct?.product_type === TagEnum.LIQUID ? 'liquid' : 'fixed'}`)}
              </span>
            </div>
            <div className="cursor-pointer" onClick={handleClose}>
              <CloseIcon />
            </div>
          </div>

          <div className="flex flex-col justify-start items-start mt-6 gap-2 max-h-[534px] pb-4 overflow-y-auto overflow-x-hidden *:shrink-0 pr-3">
            {/* 产品选择 + 金额输入 */}
            <div className="flex justify-between items-center leading-5">
                <div className="text-text-primary font-medium flex items-center gap-2">
                  {t('term')} <ProductTag prd={productDetail} />
                </div>
                {/*<span>*/}
                {/*  {t('earn')} {selectedProduct?.coin}*/}
                {/*</span>*/}
              </div>

            <div className="flex justify-start items-center flex-wrap gap-3">
              {Array.isArray(group?.product_item) &&
                group.product_item.map((item: ProductProps) => (
                  <div
                    key={item.id}
                    className={`relative min-w-[100px] h-[58px] px-2 cursor-pointer flex flex-col items-start justify-center gap-1 border rounded-lg overflow-hidden user-select-none
                      ${
                        item.id === selectedProduct?.id
                          ? 'border-text-brand-default'
                          : 'border-line-border-default'
                      }`}
                    onClick={() => handleSelectProduct(item)}
                  >
                    <div className="text-text-primary text-sm font-medium">
                       {item?.category === CategoryEnum.FIXED
                        ? formatApr(item.fixed_apr)
                        : `${formatApr(item.min_apr)} ~ ${formatApr(item.max_apr)}`}
                    </div>
                    <div className="text-text-secondary text-xs">
                      {item.category === CategoryEnum.LIQUID
                      ? t('liquid')
                      : `${item.duration_days} ${t('day')}`}
                    </div>

                    {item.id === selectedProduct?.id && (
                      <SelectCornIcon className="absolute bottom-0 right-0 w-5 h-5" />
                    )}
                  </div>
                ))}
            </div>

            <div className="w-full flex justify-between items-center mt-2">
              <div className="text-text-primary text-sm font-medium">{t('subsMoney', '申购金额')}</div>

              {
                productDetail && productDetail?.product_type !== TagEnum.RUSH && productDetail?.product_tag !== TagEnum.NEWBIE && (
                  <EarnTooltip
                    title={selectedProduct?.category === CategoryEnum.FIXED ? t('autoRenew-open-tip') : t('autoSub-open-tip')}
                    titleClassName="text-white"
                  >
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-text-primary">{selectedProduct?.category === CategoryEnum.FIXED ? t('autoRenew') : t('autoSub')}</span>
                      <Switch
                        className="custom-small-switch"
                        checked={autoRenew}
                        onChange={handleAutoRenewChange}
                      />
                    </div>
                  </EarnTooltip>
                )
              }

            </div>

            <Input
              className="h-12! bg-fill-input! global-input-style mt-1"
              size="large"
              value={amount}
              placeholder={`≥ ${
                Number(productDetail?.min_investment_quota) ||
                Number(productDetail?.precision_digits) ||
                0.1
              }`}
              status={inputStatus}
              onChange={handleAmountInput}
              onBlur={handleAmountBlur}
              maxLength={50}
              disabled={inputDisabled}
              suffix={
                <div className="flex items-center justify-center gap-2 ">
                  <span className="text-text-primary text-sm font-medium">
                    {selectedProduct?.coin}
                  </span>
                  <div className="w-[0.5px] h-[14px] bg-[#C2C2C2]"/>
                  <div
                    className="text-text-brand-default text-sm cursor-pointer font-medium"
                    onClick={handleMaxInput}
                  >
                    {t('max')}
                  </div>
                </div>
              }
            />
            {inputStatus === 'error' && (
              <div className="text-xs text-text-red">
                {inputErrorStr}
              </div>
            )}

            <div className="flex justify-between items-center leading-6 mt-1">
              <div className={secondText}>
                {t('availabelBalance', '可用余额')}
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className={secondValue}>
                  {toThousandsNumberNoZero(coinAsset, precision)}{' '}
                  {selectedProduct?.coin}
                </div>
                <div className="cursor-pointer" onClick={handleAddAsset}>
                  <AddIcon/>
                </div>

              </div>

            </div>

            <div className="flex justify-between items-center leading-6 ">
              <div className={secondText}>
                {t('alreadyBalance', '已持仓')}
              </div>
              <div className={secondValue}>
                {productDetail
                  ? toThousandsNumberNoZero(
                      Number(productDetail?.position_size),
                      precision
                    )
                  : '-'}{' '}
                {selectedProduct?.coin}
              </div>
            </div>

            <div className="flex justify-between items-center leading-6 ">
              <div className={secondText}>{t('singleMax', '单笔最大')}</div>
              <div className={secondValue}>
                {productDetail
                  ? +productDetail?.max_investment_quota < 0
                    ? t('no-limited')
                    : `${toThousandsNumberNoZero(
                        Number(productDetail?.max_investment_quota),
                        precision
                      )} ${selectedProduct?.coin}`
                  : '-'}{' '}
              </div>
            </div>

            <div className="flex justify-between items-center leading-6 ">
              <div className={`${secondText} flex items-center gap-1`}>
                <EarnTooltip
                  title={
                    <>
                      <span>{t('leftAvalible-tips1')}</span>
                      <span>{t('leftAvalible-tips2')}</span>
                      <span>{t('leftAvalible-tips3')}</span>
                    </>
                  }
                >
                 {t('leftAvalible', '剩余可投')}
                </EarnTooltip>
              </div>
              <div className={secondValue}>
                {productDetail
                  ? leftAvailableAmount < 0
                    ? t('no-limited')
                    : `${toThousandsNumberNoZero(
                        leftAvailableAmount,
                        precision
                      )} ${selectedProduct?.coin}`
                  : '-'}
              </div>
            </div>

            {productDetail?.product_type === TagEnum.RUSH && (
              <>
                <div className="flex justify-start items-center mt-2 text-text-primary text-sm font-medium">
                  {t('currentSubscribe', '当前申购')}
                </div>
                <div className="w-full ">
                  <Progress
                    percent={
                      (Number(productDetail?.sold_quota) /
                        Number(productDetail?.total_quota || 1)) *
                      100
                    }
                    showInfo={false}
                    className="w-full [&>.ant-progress-outer>.ant-progress-inner>.ant-progress-bg]:bg-text-brand-default!  [&>.ant-progress-outer>.ant-progress-inner>.ant-progress-bg-outer]:h-2!"
                  />
                  <div className="w-full flex justify-between items-center leading-6">
                    <span className={secondText}>
                      {`${toThousandsNumberNoZero(
                        Number(productDetail?.sold_quota),
                        precision
                      )} /
                      ${toThousandsNumberNoZero(
                        Number(productDetail?.total_quota),
                        precision
                      )} ${productDetail?.coin}`}
                    </span>
                    <span className="text-text-brand-default text-xs">
                      {productStatus === ProductStatusEnum.COMPLETED
                        ? t('sub-completed')
                        : productStatus === ProductStatusEnum.STOPPED
                        ? t('sub-end')
                        : productStatus}
                    </span>
                  </div>
                </div>

                <div className="w-full flex justify-between items-center leading-6 ">
                  <div className="text-text-primary text-sm font-medium">
                    {t('subscribeTimeEnd', '距申购结束')}
                  </div>
                  <div className="flex justify-end items-center text-text-primary text-sm gap-1.5">
                    <div className="h-6 rounded-md bg-bg-secondary flex justify-center items-center px-1">
                      {time.day}
                    </div>
                    :
                    <div className="h-6 rounded-md bg-bg-secondary flex justify-center items-center px-1">
                      {time.hour}
                    </div>
                    :
                    <div className="h-6 rounded-md bg-bg-secondary flex justify-center items-center px-1">
                      {time.min}
                    </div>
                    :
                    <div className="h-6 rounded-md bg-bg-secondary flex justify-center items-center px-1">
                      {time.sec}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 收益信息 + 时间轴 + 勾选协议 + 按钮 */}
            <div className="text-text-primary text-sm font-medium mt-2"> {t('reference-income')}</div>

            <div className="w-full flex justify-between items-center leading-6 mt-1">
              <div className={secondText}>{t('referApr', '参考年化')}</div>
              <div className={`text-text-brand-default! ${secondValue}`}>
                {referApr}
              </div>
            </div>

            <div className="w-full flex justify-between items-center leading-6 ">
              <div className={secondText}>{t('sendModal', '收益模式')}</div>
              <EarnTooltip
                title={
                  productDetail?.pnl_type === PnlTypeEnum.DAILY
                    ? t('daily_send_tip')
                    : t('t1_send_tip')
                }
                titleClassName="text-white"
              >
                <div
                  className="text-text-primary text-xs cursor-pointer font-medium"
                >
                    {t(productDetail?.pnl_type || ' ')}

                </div>
              </EarnTooltip>
            </div>

            <div className="w-full flex justify-between items-center leading-6 ">
              <div className={secondText}>
                {productDetail?.category === CategoryEnum.LIQUID
                  ? t('expectedDayIncome', '预计每日收益')
                  : t('expectedIncome', '预计总收益')}
              </div>
              <div className={`text-text-brand-default! ${secondValue}`}>
                {expectedAmount} {productDetail?.coin}
              </div>
            </div>

            <div
              className="w-full flex justify-between items-center text-sm text-text-primary mt-2 font-medium cursor-pointer"
              onClick={() => setShowTimeline((prev) => !prev)}
            >
              {t('timeLine')}
              <ArrowDownIcon
                className={`transition-transform ${showTimeline ? 'rotate-180' : ''}`}
              />
            </div>
            {showTimeline && (
              <div className="w-full">
                <Timeline
                  days={productDetail?.duration_days}
                  type={productDetail?.category}
                />
              </div>
            )}

          </div>
          <div className="w-full pt-6 pr-3">
              <div className="flex justify-start items-center gap-1">
                <Checkbox
                  checked={checked}
                  onChange={() => setChecked(!checked)}
                />
                <div className="text-xs text-text-secondary">
                  <FormattedMessage
                    id="checkSubscribeDoc"
                    values={{
                      a: (chunks) => (
                        <a
                          className="cursor-pointer text-text-brand-default! ml-px"
                          href={t('earn-doc') || 'https:/easicoin.zendesk.com/hc/en-us/articles/14511368094735'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {chunks}
                        </a>
                      )
                    }}
                  />
                </div>
              </div>
              <button
                className={`w-full h-10 mt-4 rounded-lg text-sm font-medium cursor-pointer
                  ${
                   isLogin && (!checked || inputStatus || !amount)
                      ? 'bg-fill-button-primary-disabled text-neutral-300'
                      : 'bg-fill-button-primary-default text-text-white hover:bg-fill-button-primary-hover'
                  }`}
                disabled={loading || inputDisabled}
                onClick={handleSubscribe}
              >
                {/*errorCode === 35900005 表示申购不在期限内，才显示开始时间*/}
                {(!checked || inputStatus || !amount) && selectedProduct?.subscribe_start_at && errorCode === 35900005 && selectedProduct?.product_type === TagEnum.RUSH ?
                   t('rush-time-start', {date: dayjs(selectedProduct?.subscribe_start_at * 1000).format('YYYY-MM-DD HH:mm')}) :
                   isLogin ? t('subscribe') : t('login')}
              </button>
            </div>
        </div>
      </Modal>

      <SuccessModal
        open={showSuccessModal}
        prd={productDetail}
        amount={amount}
        autoRenew={autoRenew}
        close={handleClose}
      />

      <AddAssetsModal
        coin={selectedProduct?.coin}
        open={showAddAssetsModal}
        close={handleAssetModalClose}
      />
    </>
  );
};

export default SubscribeModal;
