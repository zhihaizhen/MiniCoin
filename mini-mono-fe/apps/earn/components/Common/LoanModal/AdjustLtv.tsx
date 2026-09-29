import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Input, Modal, Select, Space } from 'antd';
import BigNumber from 'bignumber.js';
import { goPage } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { AdjustResultProp, LoanOrderProp } from '~/interface';
import { getCoinAssets } from '~/api';
import { postChangeCollateral } from '~/api/loan';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { ReactComponent as AddIcon } from '~/public/images/add.svg';
import { ReactComponent as WarnIcon } from '~/public/images/warn.svg';
import {
  toThousandsNumberNoZero,
  toValidBigNumber,
  normalizeAmount,
  formatAmount,
  formatRateToPercent
} from '~/utils';
import AddAssetsModal from '~/components/Common/AddAssetsModal';
import { useEarnDataRefresh } from '~/context/EarnDataContext';
import EarnTooltip from '~/components/Common/EarnTooltip';
import SuccessModal from '~/components/Common/LoanModal/SuccessModal';
import LtvRiskSlider from '~/components/Common/LoanModal/LtvRiskSlider';
import { ReactComponent as ArrowDownIcon } from '~/public/images/arrow-down.svg';

interface LoanModalProps {
  order?: LoanOrderProp | null;
  open: boolean;
  close: () => void;
}

interface CoinAsset {
  tokenName?: string;
  free?: string | number;
}

const AMOUNT_PRECISION = 8;
const DECIMAL_AMOUNT_REG = /^\d*(\.\d*)?$/;
type LtvType = 'add' | 'reduce';

const isValidAmountInput = (value: string, precision: number): boolean => {
  if (!DECIMAL_AMOUNT_REG.test(value)) return false;

  const [, decimalPart = ''] = value.split('.');
  return decimalPart.length <= precision;
};

/**
 * 调整质押率
 */
const AdjustLtvModal: React.FC<LoanModalProps> = ({ order, open, close }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { triggerRefresh } = useEarnDataRefresh();

  const [loading, setLoading] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [isShowModal, setIsShowModal] = useState(open);
  const [coinAssets, setCoinAssets] = useState<CoinAsset[]>([]);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [ltvValue, setLtvValue] = useState(+order?.current_ltv || 0);
  const [ltvType, setLtvType] = useState<LtvType>('add');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [adjustSuccessInfo, setAdjustSuccessInfo] =
    useState<AdjustResultProp>(null);

  const totalLoanAmount = useMemo(
    () => toValidBigNumber(order?.total_borrow_amount),
    [order?.total_borrow_amount]
  );

  const borrowCoinPrice = useMemo(
    () => toValidBigNumber(order?.current_borrow_price),
    [order?.current_borrow_price]
  );

  const pledgeCoinPrice = useMemo(
    () => toValidBigNumber(order?.current_pledge_price),
    [order?.current_pledge_price]
  );

  const currentPledgeAmount = useMemo(
    () => toValidBigNumber(order?.pledge_amount),
    [order?.pledge_amount]
  );

  const currentLtv = useMemo(
    () => toValidBigNumber(order?.current_ltv),
    [order?.current_ltv]
  );

  const initialLtv = useMemo(
    () => toValidBigNumber(order?.initial_ltv),
    [order?.initial_ltv]
  );

  const availableAmount = useMemo(() => {
    const asset = coinAssets.find(
      (item) => item?.tokenName === order?.pledge_coin
    );
    return new BigNumber(asset?.free || 0);
  }, [coinAssets, order?.pledge_coin]);

  const debtValue = useMemo(
    () => totalLoanAmount.times(borrowCoinPrice),
    [borrowCoinPrice, totalLoanAmount]
  );

  // 按目标 LTV 反推调整后应有的总质押物数量。
  const getTargetPledgeAmount = useCallback(
    (nextLtv: BigNumber): BigNumber | null => {
      const denominator = nextLtv.times(pledgeCoinPrice);
      if (!debtValue.gt(0) || !denominator.gt(0)) return null;

      return debtValue.div(denominator);
    },
    [debtValue, pledgeCoinPrice]
  );

  const maxReducePledgeAmount = useMemo(() => {
    // 计算分母：初始质押率 × 质押币价格
    const denominator = initialLtv.times(pledgeCoinPrice);
    // 如果负债价值或分母无效，返回 0
    if (!debtValue.gt(0) || !denominator.gt(0)) return new BigNumber(0);

    // 计算达到初始质押率所需的目标质押数量
    // 公式：目标质押数量 = 负债价值 / (初始质押率 × 质押币价格)
    const targetPledgeAmount = debtValue.div(denominator);
    // 计算最大可减少的质押数量 = 当前质押数量 - 目标质押数量
    const maxReduceAmount = currentPledgeAmount.minus(targetPledgeAmount);
    // 如果计算结果大于 0 则返回该值，否则返回 0
    return maxReduceAmount.gt(0) ? maxReduceAmount : new BigNumber(0);
  }, [currentPledgeAmount, debtValue, initialLtv, pledgeCoinPrice]);

  const maxAddPledgeAmount = useMemo(() => {
    const minLtv = new BigNumber(0.01);
    const targetPledgeAmount = getTargetPledgeAmount(minLtv);
    const maxAddAmount = targetPledgeAmount
      ? targetPledgeAmount.minus(currentPledgeAmount)
      : new BigNumber(0);

    return maxAddAmount.gt(0) ? maxAddAmount : new BigNumber(0);
  }, [currentPledgeAmount, getTargetPledgeAmount]);

  // 滑块变更 LTV 时，计算需要增加或减少的质押数量。
  const calculatePledgeAmountByLtv = (
    nextLtvValue: number
  ): { type: LtvType; amount: string } | null => {
    const nextLtv = toValidBigNumber(nextLtvValue);
    const targetPledgeAmount = getTargetPledgeAmount(nextLtv);
    if (!targetPledgeAmount) return null;

    const type: LtvType = nextLtv.gt(currentLtv) ? 'reduce' : 'add';
    const amount =
      type === 'reduce'
        ? currentPledgeAmount.minus(targetPledgeAmount)
        : targetPledgeAmount.minus(currentPledgeAmount);

    if (!amount.gt(0)) {
      return {
        type,
        amount: ''
      };
    }

    return {
      type,
      amount: amount
        .decimalPlaces(AMOUNT_PRECISION, BigNumber.ROUND_DOWN)
        .toFixed()
    };
  };

  // 手动输入质押数量时，按当前调整类型反推新的 LTV。
  const calculateLtvByPledgeAmount = (
    amountValue: string,
    type: LtvType
  ): number | null => {
    const amount = new BigNumber(amountValue);
    if (!amount.isFinite() || amount.isNaN() || !amount.gt(0)) return null;

    const nextPledgeAmount =
      type === 'add'
        ? currentPledgeAmount.plus(amount)
        : currentPledgeAmount.minus(amount);

    const denominator = nextPledgeAmount.times(pledgeCoinPrice);
    if (!debtValue.gt(0) || !denominator.gt(0)) return null;

    return debtValue
      .div(denominator)
      .decimalPlaces(2, BigNumber.ROUND_DOWN)
      .toNumber();
  };

  const amountErrorMsg = useMemo(() => {
    if (!pledgeAmount) return '';

    const amount = new BigNumber(pledgeAmount);
    if (!amount.isFinite() || amount.isNaN() || !amount.gt(0)) {
      console.log('amount →', amount.toString());
      return t('loan.amount.error', '请输入有效金额');
    }

    if (ltvType === 'reduce' && (amount.gte(currentPledgeAmount) || amount.gt(maxReducePledgeAmount))) {
      return t(
        'loan.maxReduce.error',
        '移除质押物需确保最终质押率不超过初始质押率'
      );
    }

    if (ltvType === 'add' && amount.gt(availableAmount)) {
      return t('overHold', '余额不足');
    }

    if (ltvType === 'add' && amount.gt(maxAddPledgeAmount)) {
      return t('loan.maxAdd.error', '增加质押物需确保最终质押率不低于1%');
    }

    return '';
  }, [
    availableAmount,
    currentPledgeAmount,
    ltvType,
    maxAddPledgeAmount,
    maxReducePledgeAmount,
    pledgeAmount,
    t
  ]);

  const inputStatus = amountErrorMsg ? 'error' : '';
  const isSubmitDisabled = !pledgeAmount || !!amountErrorMsg || !order;

  const ltvRates = useMemo<[number, number, number]>(
    () => [
      formatRateToPercent(order?.initial_ltv, 0),
      formatRateToPercent(order?.warning_ltv, 80),
      formatRateToPercent(order?.liquidation_ltv, 100)
    ],
    [order?.initial_ltv, order?.liquidation_ltv, order?.warning_ltv]
  );

  useEffect(() => {
    setIsShowModal(open);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPledgeAmount('');
      setShowAddAssetsModal(false);
    }
  }, [open]);

  useEffect(() => {
    if (!isShowModal || !isLogin) return;

    let isActive = true;
    getCoinAssets().then((res) => {
      if (isActive && Array.isArray(res)) {
        setCoinAssets(res);
      }
    });

    return () => {
      isActive = false;
    };
  }, [isLogin, isShowModal]);

  const onAmountChange = (value: string): void => {
    setPledgeAmount(value);

    const nextLtvValue = calculateLtvByPledgeAmount(value, ltvType);
    if (nextLtvValue !== null) {
      setLtvValue(nextLtvValue);
    }
  };

  const handleAmountInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    if (isValidAmountInput(value, AMOUNT_PRECISION)) {
      onAmountChange(value);
    }
  };

  const handleAmountBlur = (): void => {
    onAmountChange(normalizeAmount(pledgeAmount));
  };

  const handleMaxInput = (): void => {
    let maxAmount = new BigNumber(0);

    if (ltvType === 'add') {
      maxAmount = BigNumber.minimum(
        maxAddPledgeAmount,
        availableAmount.gt(0) ? availableAmount : new BigNumber(0)
      );
      setLtvValue(0.01);
    } else if (new BigNumber(ltvValue).lt(initialLtv)) {
      maxAmount = maxReducePledgeAmount;
      setLtvValue(initialLtv.decimalPlaces(2, BigNumber.ROUND_DOWN).toNumber());
    }

    setPledgeAmount(
      maxAmount.decimalPlaces(AMOUNT_PRECISION, BigNumber.ROUND_DOWN).toFixed()
    );
  };

  /**
   * 确认调整
   */
  const onConfirm = (): void => {
    if (!isLogin) {
      goPage('login');
      return;
    }

    const normalizedpledgeAmount = normalizeAmount(pledgeAmount);
    if (isSubmitDisabled || !normalizedpledgeAmount || !order) return;

    setLoading(true);
    postChangeCollateral({
      type: ltvType,
      amount: normalizedpledgeAmount,
      duration_type: order?.duration_type,
      position_id: order?.position_id
    })
      .then((res) => {
        setAdjustSuccessInfo({ coin: order?.pledge_coin, type: ltvType, ...res });
        setShowSuccessModal(true);
        setIsShowModal(false);
        setPledgeAmount('');
        triggerRefresh();
        close();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = (): void => {
    setPledgeAmount('');
    setShowAddAssetsModal(false);
    close();
  };

  const handleAddAsset = (): void => {
    setIsShowModal(false);
    setShowAddAssetsModal(true);
  };

  const handleAssetModalClose = (): void => {
    setIsShowModal(true);
    setShowAddAssetsModal(false);
  };

  // 切换增加/减少类型时，清空已输入金额并恢复当前 LTV。
  const handleLtvTypeChange = (value: LtvType): void => {
    setLtvType(value);
    setPledgeAmount('');
    setLtvValue(currentLtv.decimalPlaces(2, BigNumber.ROUND_DOWN).toNumber());
  };

  // 调整滑块时，同步更新 LTV 类型和质押数量输入框。
  const onLtvChange = (val: number): void => {
    const nextLtvValue = val / 100;
    setLtvValue(nextLtvValue);

    const nextPledge = calculatePledgeAmountByLtv(nextLtvValue);
    if (nextPledge) {
      setLtvType(nextPledge.type);
      setPledgeAmount(nextPledge.amount);
    }
  };

  useEffect(() => {
    setLtvValue(
      new BigNumber(order?.current_ltv)
        .decimalPlaces(2, BigNumber.ROUND_DOWN)
        .toNumber() || 0
    );
  }, [order?.current_ltv]);

  return (
    <>
      <Modal
        open={isShowModal}
        centered
        maskClosable={false}
        onCancel={handleClose}
        closeIcon={null}
        width={440}
        footer={null}
      >
        <div className="relative py-2">
          <div className="w-full flex items-center justify-between">
            <div className="flex justify-start items-center gap-2 text-lg font-bold">
              {t('loan.ajustltv', '调整质押率')}
            </div>
            <div className="cursor-pointer" onClick={handleClose}>
              <CloseIcon />
            </div>
          </div>

          <div className="flex flex-col justify-between items-start mt-6 gap-2">
            <div className="w-full flex justify-between items-center text-text-primary text-sm">
              <span className="text-text-secondary">
                {t('loan.total', '总负债')}
              </span>
              <span>
                {formatAmount(order?.total_borrow_amount)} {order?.borrow_coin}
              </span>
            </div>
            <div className="w-full flex justify-between items-center text-text-primary text-sm">
              <span className="text-text-secondary">
                {t('loan.pledgeobj', '质押物')}
              </span>
              <span>
                {formatAmount(order?.pledge_amount)} {order?.pledge_coin}
              </span>
            </div>

            <div className="w-full mt-6">
              <LtvRiskSlider
                value={ltvValue * 100}
                rates={ltvRates}
                onChange={onLtvChange}
                step={1}
                labels={{
                  lowRate: t('loan.initial_pledge_rate'),
                  warningRate: t('loan.early_warning_pledge_rate'),
                  liquidationRate: t('loan.force_liquidate_pledge_rate'),
                  lowRisk: t('loan.low_risk', '低风险'),
                  mediumRisk: t('loan.medium_risk', '中风险'),
                  highRisk: t('loan.high_risk', '高风险')
                }}
              />
            </div>

            <div className="relative w-full mt-6">
              <EarnTooltip title={t('loan.stake-num.tip')}>
                <span className="text-text-primary text-sm">
                  {t('loan.stake-num', '质押数量')}
                </span>
              </EarnTooltip>
              <Space.Compact className="w-full mt-2">
                <Select
                  className="global-select-style h-10! bg-fill-input!"
                  value={ltvType}
                  onChange={handleLtvTypeChange}
                  popupMatchSelectWidth={false}
                  suffixIcon={<ArrowDownIcon />}
                  options={[
                    {
                      value: 'add',
                      label: t('add', '增加')
                    },
                    {
                      value: 'reduce',
                      label: t('reduce', '移除')
                    }
                  ]}
                />
                <div className="w-0.5 h-full bg-gray-200"></div>
                <Input
                  className="h-10! bg-fill-input! global-input-style"
                  size="large"
                  value={pledgeAmount}
                  placeholder={t('loan.collateral.amount.placeholder')}
                  status={inputStatus}
                  onChange={handleAmountInput}
                  onBlur={handleAmountBlur}
                  maxLength={50}
                  suffix={
                    <div className="flex items-center justify-center gap-2 text-text-primary">
                      <div
                        className="text-text-brand-default text-sm cursor-pointer"
                        onClick={handleMaxInput}
                      >
                        {t('max')}
                      </div>
                      {order?.pledge_coin}
                    </div>
                  }
                />
              </Space.Compact>
              {amountErrorMsg && amountErrorMsg !== t('loan.maxReduce.error') && amountErrorMsg !== t('loan.maxAdd.error')
                && (
                <div className="text-xs text-text-red h-5 mt-2">
                  {amountErrorMsg}
                </div>
              )}
            </div>
            {
              ltvType === 'add' ?
                <div className="w-full flex justify-start items-center gap-1">
                  <EarnTooltip title={t('availabelBalance.tip')}>
                    <div className="text-text-secondary text-sm">
                      {t('availabelBalance', '可用余额')}:
                    </div>
                  </EarnTooltip>
                  <div className="flex items-center justify-center gap-1">
                    <div className="text-text-primary text-sm font-medium">
                      {toThousandsNumberNoZero(
                        availableAmount.toString(),
                        AMOUNT_PRECISION
                      )}{' '}
                      {order?.pledge_coin}
                    </div>
                    <div className="cursor-pointer" onClick={handleAddAsset}>
                      <AddIcon />
                    </div>
                  </div>
                </div> :
                <div className="w-full flex justify-start items-center gap-1">
                  <div className="text-text-secondary text-sm">
                    {t('loan.maxRemove', '最大可移除')}:
                  </div>
                  <div className="flex items-center justify-center gap-1 text-text-primary text-sm font-medium">
                    {toThousandsNumberNoZero(
                     maxReducePledgeAmount.toString(),
                     AMOUNT_PRECISION
                    )}{' '}
                    {order?.pledge_coin}
                  </div>
                </div>
            }

            <div className="w-full h-[34px] flex justify-start items-center gap-2 px-2 mt-6
              border-[0.5px] border-(--function-orange) rounded-lg  text-function-orange text-xs bg-(--fill-tag-orange)">
              <WarnIcon />
              {ltvType === 'reduce' ? t('loan.maxReduce.error','移除质押物需确保最终质押率不超过初始质押率') : t('loan.maxAdd.error', '增加质押物需确保最终质押率不低于1%')}
            </div>
            <button
              className={`w-full h-10 mt-4 rounded-lg text-sm font-medium cursor-pointer
                ${
                  isLogin && isSubmitDisabled
                    ? 'bg-fill-button-primary-disabled text-neutral-300'
                    : 'bg-fill-button-primary-default text-text-white hover:bg-fill-button-primary-hover'
                }`}
              disabled={loading || (isLogin && isSubmitDisabled)}
              onClick={onConfirm}
            >
              {t('sure-adjust')}
            </button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        type="adjustLtv"
        open={showSuccessModal}
        params={adjustSuccessInfo}
        close={() => setShowSuccessModal(false)}
      />

      <AddAssetsModal
        coin={order?.pledge_coin}
        open={showAddAssetsModal}
        close={handleAssetModalClose}
      />
    </>
  );
};

export default AdjustLtvModal;
