import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Checkbox, Input, message, Modal } from 'antd';
import { DefiAprProps, ProductDetailProps, ProductGroupProps, ProductProps } from '~/interface';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import { basePath, getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { getCoinAssets, getProductDetail, getPublicProductDetail, postChainStaking } from '~/api';
import { useFm } from '@better-bit-fe/base-hooks';
import { CategoryEnum, PnlTypeEnum, ProductStatusEnum, TagEnum } from '~/enums';
import { ReactComponent as CheckRightIcon } from '~/public/images/check-right.svg';
import { ReactComponent as AddIcon } from '~/public/images/add.svg';
import { calcDailyEarning, formatApr, toThousandsNumberNoZero } from '~/utils';
import SuccessModal from '~/components/Common/SuccessModal';
import AddAssetsModal from '~/components/Common/AddAssetsModal';
import Timeline from '~/components/Common/Timeline';
import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';
import StakeNotes from './StakeNotes';
import { useEarnDataRefresh } from '~/context/EarnDataContext';
import { useUserInfo } from '@better-bit-fe/base-provider';
import EarnTooltip from '~/components/Common/EarnTooltip';
import { ReactComponent as ArrowDownIcon } from '~/public/images/arrow-down-solid.svg';

interface SubscribeModalProps {
  open: boolean;
  group: ProductGroupProps;
  defaultProductId?: string;
  close: () => void;
}

/**
 * 链上赚币质押弹窗
 */
const SubscribeModal: React.FC<SubscribeModalProps> = ({
                                                         open,
                                                         group,
                                                         defaultProductId,
                                                         close
                                                       }: SubscribeModalProps) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { triggerRefresh } = useEarnDataRefresh();

  const [loading, setLoading] = useState(false);
  const [productDetail, setProductDetail] = useState<ProductDetailProps>();
  const [selectedProduct, setSelectedProduct] = useState<ProductProps>(
    group?.product_item[0]
  );
  const [checked, setChecked] = useState(false);

  // 申购金额
  const [amount, setAmount] = useState<string>('');
  const [inputStatus, setInputStatus] = useState<'' | 'warning' | 'error'>('');
  const [inputErrorStr, setInputErrorStr] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [coinAsset, setCoinAsset] = useState('0');

  const [isShowModal, setIsShowModal] = useState(open);
  const [showTimeline, setShowTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'rules'>('notes');

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
    const numericValue = new BigNumber(normalizedValue);
    if (numericValue.isNaN()) {
      return {
        status: 'error',
        message: t('invalidAmount', '金额格式不正确'),
        normalizedValue
      };
    }
    if (numericValue.lt(detail.min_investment_quota)) {
      return {
        status: 'error',
        message: t('miniAmountWarn', {
          min: `${new BigNumber(detail.min_investment_quota).toString()} ${detail.coin}`
        }),
        normalizedValue
      };
    }
    if (new BigNumber(leftAvailableAmount).gte(0) && numericValue.gt(leftAvailableAmount)) {
      return {
        status: 'error',
        message: t('overAllow', '剩余可投不足'),
        normalizedValue
      };
    }
    if (numericValue.gt(coinAsset || 0)) {
      return {
        status: 'error',
        message: t('overHold', '可用余额不足'),
        normalizedValue
      };
    }

    if (new BigNumber(detail.max_investment_quota).gte(0) && numericValue.gt(detail.max_investment_quota)) {
      normalizedValue = new BigNumber(detail.max_investment_quota).toString();
    }

    return { status: '', message: '', normalizedValue };
  };


  // 预期收益
  const expectedAmount = useMemo(() => {
    if (!productDetail) return '0';

    const numericAmount = new BigNumber(productDetail?.position_size || 0).plus(amount || 0);
    if (numericAmount.isNaN()) return '0';

    // 质押defi
    if (productDetail.product_type === TagEnum.DEFI) {
      const defiAprObj: DefiAprProps = productDetail.defi_apr;
      const myExpectedAmount = numericAmount
        .multipliedBy(productDetail.defi_apr?.apr || 0)
        .dividedBy(365);
      const rewardRadio = numericAmount.dividedBy(productDetail.min_investment_quota);
      const rewardAmount = new BigNumber(defiAprObj.reward_amount || 0).multipliedBy(rewardRadio)
        .multipliedBy(defiAprObj.reward_apr || 0)
        .dividedBy(365);
      return myExpectedAmount.plus(rewardAmount).decimalPlaces(precision, BigNumber.ROUND_DOWN).toFormat();
    }
    // 质押pos
    if (productDetail.product_type === TagEnum.POS) {
      return numericAmount
        .multipliedBy(productDetail.fixed_apr || 0)
        .dividedBy(365).decimalPlaces(precision, BigNumber.ROUND_DOWN).toFormat();
    }
    // 活期
    if (productDetail.apr_type !== CategoryEnum.FIXED) {
      const result = calcDailyEarning(numericAmount, productDetail.level_apr);
      return new BigNumber(result).decimalPlaces(precision, BigNumber.ROUND_DOWN).toFormat();
    }
    // 定期
    return numericAmount
      .multipliedBy(productDetail.fixed_apr || 0)
      .multipliedBy(new BigNumber(productDetail.duration_days || 0).dividedBy(365)).decimalPlaces(precision, BigNumber.ROUND_DOWN).toFormat();
  }, [
    amount,
    precision,
    productDetail
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

      setLoading(true);
      try {
        const fetchFn = isLogin ? getProductDetail : getPublicProductDetail;
        const res = await fetchFn(selectedProduct.id);
        if (active) {
          setProductDetail(res);
        }
      } catch (e: any) {
        if (active) {
          setProductDetail(null);
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
  }, [selectedProduct?.id, isShowModal, t, isLogin]);

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
      new BigNumber(leftAvailableAmount),
      new BigNumber(productDetail?.max_investment_quota || -1),
      new BigNumber(coinAsset || 0)
    ].filter((n) => n.gte(0));

    const minValue =
      minNumberArray.length > 0 ? BigNumber.min(...minNumberArray) : new BigNumber(0);
    onAmountChange(minValue.toString());
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
      purchase_share: amount
    };

    setLoading(true);
    postChainStaking(params)
      .then(() => {
        setIsShowModal(false);
        setShowSuccessModal(true);
        // 触发数据刷新，更新 OnchainHeader 中的 position 数据
        triggerRefresh();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = (): void => {
    setAmount('');
    setInputStatus('');
    setInputErrorStr('');
    setChecked(false);
    setShowSuccessModal(false);
    setShowTimeline(false);
    const product = !defaultProductId ? group?.product_item?.[0] : group?.product_item.find(
      (item) => item.id === defaultProductId
    );
    setSelectedProduct(product);
    close();
  };

  /**
   * 剩余可投, -1 表示无限制
   */
  const leftAvailableAmount = useMemo(() => {
    // @ts-ignore
    const allowInvest = new BigNumber(productDetail?.allow_invest_quota ?? -1).isNaN() || productDetail?.allow_invest_quota === ''
      ? new BigNumber(0)
      : new BigNumber(productDetail?.allow_invest_quota);
    const personAllow = new BigNumber(productDetail?.person_allow_quota ?? -1).isNaN() || productDetail?.person_allow_quota === ''
      ? new BigNumber(0)
      : new BigNumber(productDetail?.person_allow_quota);

    if (allowInvest.lt(0) && personAllow.lt(0)) {
      return -1;
    }
    if (allowInvest.lt(0)) {
      return personAllow.toNumber();
    }
    if (personAllow.lt(0)) {
      return allowInvest.toNumber();
    }
    return BigNumber.min(personAllow, allowInvest).toNumber();
  }, [productDetail?.allow_invest_quota, productDetail?.person_allow_quota]);

  // 参考年化
  const referApr = useMemo(() => {
    if (!productDetail) return '-';
    if (productDetail?.product_type === TagEnum.DEFI) {
      return formatApr(productDetail?.defi_reference_apr);
    }
    if (productDetail?.apr_type === CategoryEnum.FIXED) {
      return formatApr(productDetail?.fixed_apr);
    }
    const maxApr = productDetail?.level_apr?.[0]?.apr;
    const minApr = productDetail?.level_apr?.[productDetail?.level_apr?.length - 1]?.apr;
    if (minApr === maxApr) return formatApr(minApr);
    return `${formatApr(minApr)} ~ ${formatApr(maxApr)}`;
  }, [productDetail]);

  useEffect(() => {
    if (!isShowModal) return;
    getCoinAssets().then((res) => {
      const findAsset = res.find(
        (item) => item.tokenName === selectedProduct?.coin
      );
      setCoinAsset(findAsset?.free || '0');
    });
  }, [isShowModal, selectedProduct?.coin]);

  // 产品状态
  const productStatus = useMemo(() => {
    const sold = new BigNumber(productDetail?.sold_quota || 0);
    const total = new BigNumber(productDetail?.total_quota || 1);

    if (sold.gte(total)) {
      return ProductStatusEnum.COMPLETED;
    }

    const progress = sold.dividedBy(total).multipliedBy(100);

    return `${toThousandsNumberNoZero(
      progress.toString(),
      precision
    )} %`;
  }, [
    precision,
    productDetail?.sold_quota,
    productDetail?.total_quota
  ]);

  const inputDisabled = useMemo(() => {
    if (!productDetail) return true;
    if (productDetail.product_type === TagEnum.RUSH) {
      return productStatus === ProductStatusEnum.COMPLETED || productStatus === ProductStatusEnum.STOPPED;
    }
    return false;
  }, [productDetail, productStatus]);

  const handleAddAsset = () => {
    setIsShowModal(false);
    setShowAddAssetsModal(true);
  };

  const handleAssetModalClose = () => {
    setIsShowModal(true);
    setShowAddAssetsModal(false);
  };

  const secondText = 'text-text-secondary text-xs mr-3';
  const secondValue = 'text-text-primary text-xs font-medium';

  return (
    <>
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
                {t('stake')} {selectedProduct?.coin}
              </span>
            </div>
            <div className="cursor-pointer" onClick={handleClose}>
              <CloseIcon />
            </div>
          </div>

          <div className="flex flex-col justify-start items-start mt-6 gap-2 max-h-[534px] pb-4 overflow-y-scroll overflow-x-hidden *:shrink-0 pr-3">
            {/* 产品选择 + 金额输入 */}
            {
              productDetail?.product_type === TagEnum.DEFI &&
              <>
                <div className="w-full flex justify-between items-center leading-5">
                  <div className="text-text-primary text-sm font-medium">
                    {t('defi-doc', 'DeFi 协议')}
                  </div>
                  <EarnTooltip title={t('defi-doc-tip')}>
                    <div className={`${secondText}`}>
                      {t('defi-doc-source', '协议收益来源')}
                    </div>
                  </EarnTooltip>
                </div>
                <div className="h-12 w-full flex justify-start items-center bg-fill-input rounded-lg px-3 gap-1 mt-1">
                  <Image src={`${basePath}/images/defi/morpho.png`} alt="morpho" width={20} height={20}
                         loader={({ src }) => src} />
                  <span
                    className={'text-text-primary text-sm font-medium'}> {productDetail?.product_defi_name || 'Morpho (Aribitrum)'}</span>
                </div>
              </>
            }

            <div className="flex justify-start items-center mt-1">
              <div className="text-text-primary text-sm font-medium">{t('stake-num', '质押数量')}</div>
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
                  <div className="w-px h-[14px] bg-[#C2C2C2]" />
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
              <div className="text-xs text-text-red h-5">
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
                  <AddIcon />
                </div>
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

            <div className="flex justify-between items-center leading-6 ">
              <div className={secondText}>
                {t('already-stake', '已质押')}
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

            {/*  时间轴 + 勾选协议 + 按钮 */}
            <div className="w-full flex justify-between items-center leading-6 mt-2">
              <div className="text-text-primary text-sm font-medium">
                {t('expectedDayIncome', '预计每日收益')}
              </div>
              {
                productDetail?.product_type === TagEnum.DEFI &&
                <EarnTooltip
                  title={
                    <FormattedMessage
                      id={'grant-rule-content'}
                      values={{
                        p: chunks => <p className="mb-1">{chunks}</p>
                      }}
                    />
                  }
                  titleClassName="text-white"
                >
                  <div className={`${secondText} mr-0! flex items-center justify-end gap-1`}>
                    {t('grant-rule')}
                    <CheckRightIcon />
                  </div>
                </EarnTooltip>
              }

            </div>

            <div className="w-full flex justify-between items-center leading-6 ">
              <div className={secondText}>{t('referApr', '参考年化')}</div>
              <div className={`text-text-brand-default! ${secondValue}`}>
                {referApr}
              </div>
            </div>

            {
              productDetail?.product_type !== TagEnum.DEFI ? <>
                <div className="w-full flex justify-between items-center leading-6 ">
                  <div className={secondText}>{t('sendModal', '收益模式')}</div>
                  <div
                    className="text-text-primary text-xs cursor-pointer font-medium"
                  >
                    <EarnTooltip
                      title={
                        productDetail?.pnl_type === PnlTypeEnum.DAILY
                          ? t('daily_send_tip')
                          : t('t1_send_tip')
                      }
                      titleClassName="text-white"
                    >
                      {t(productDetail?.pnl_type || ' ')}
                    </EarnTooltip>
                  </div>
                </div>

                <div className="w-full flex justify-between items-center leading-6 ">
                  <div className={secondText}>
                    {productDetail?.pnl_type === PnlTypeEnum.DAILY
                      ? t('expectedDayIncome', '预计每日收益')
                      : t('expectedIncome', '预计总收益')}
                  </div>
                  <div className={`text-text-brand-default! ${secondValue}`}>
                    {expectedAmount} {productDetail?.coin}
                  </div>
                </div>
              </> : <>
                <div className="w-full flex justify-between items-center gap-2 text-sm font-medium ">
                  <div className="flex justify-start items-center gap-1">
                    <Image
                      src={
                        selectedProduct?.coin
                          ? getSymbolUrl(selectedProduct.coin)
                          : ''
                      }
                      alt={selectedProduct?.coin}
                      width={18}
                      height={18}
                      loader={({ src }) => src}
                    />
                    <span className="flex-1">
                      {selectedProduct?.coin}
                    </span>
                  </div>
                  <div>
                    {expectedAmount}
                  </div>
                </div>
              </>
            }

            <StakeNotes
              productType={productDetail?.product_type || ''}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

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
              <Timeline
                tag={productDetail?.product_type}
                days={productDetail?.duration_days}
                type={productDetail?.category}
              />
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
                  id="checkStakeDoc"
                  values={{
                    a: (chunks) => (
                      <a
                        className="cursor-pointer text-text-brand-default! ml-px"
                        href={t('earn-onchain-doc') || 'https:/easicoin.zendesk.com/hc/en-us/articles/15604868261903'}
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
              {(!checked || inputStatus || !amount) && selectedProduct?.product_type === TagEnum.RUSH ?
                t('rush-time-start', dayjs(selectedProduct.subscribe_start_at * 1000).format('YYYY-MM-DD HH:mm')) :
                isLogin ? t('stake-now') : t('login')}
            </button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        open={showSuccessModal}
        prd={productDetail}
        amount={amount}
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
