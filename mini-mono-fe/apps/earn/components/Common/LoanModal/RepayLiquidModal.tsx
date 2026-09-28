import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Input, Modal } from 'antd';
import BigNumber from 'bignumber.js';
import { goPage } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { LoanOrderProp, RepayResultProp } from '~/interface';
import { getCoinAssets } from '~/api';
import { postLoanRepay } from '~/api/loan';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { ReactComponent as AddIcon } from '~/public/images/add.svg';
import {
  toThousandsNumberNoZero,
  toValidBigNumber,
  normalizeAmount,
  formatAmount
} from '~/utils';
import AddAssetsModal from '~/components/Common/AddAssetsModal';
import { useEarnDataRefresh } from '~/context/EarnDataContext';
import EarnTooltip from '~/components/Common/EarnTooltip';
import SuccessModal from '~/components/Common/LoanModal/SuccessModal';
import RepayAmountSlider from '~/components/Common/LoanModal/RepayAmountSlider';

interface LoanModalProps {
  order?: LoanOrderProp | null;
  open: boolean;
  close: () => void;
}

interface CoinAsset {
  tokenName?: string;
  free?: string | number;
}

const REPAY_AMOUNT_PRECISION = 8;
const DECIMAL_AMOUNT_REG = /^\d*(\.\d*)?$/;
const MS_PER_HOUR = 60 * 60 * 1000;

const isValidAmountInput = (value: string, precision: number): boolean => {
  if (!DECIMAL_AMOUNT_REG.test(value)) return false;

  const [, decimalPart = ''] = value.split('.');
  return decimalPart.length <= precision;
};

/**
 * 活期-质押还款弹窗
 */
const RepayLiquidModal: React.FC<LoanModalProps> = ({ order, open, close }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { triggerRefresh } = useEarnDataRefresh();

  const [loading, setLoading] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [isShowModal, setIsShowModal] = useState(open);
  const [coinAssets, setCoinAssets] = useState<CoinAsset[]>([]);
  const [repayAmount, setRepayAmount] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [repaySuccessInfo, setRepaySuccessInfo] = useState<RepayResultProp>(null);

  const loanCoin = order?.borrow_coin || '';
  const totalLoanAmount = useMemo(
    () => new BigNumber(order?.total_borrow_amount || 0),
    [order?.total_borrow_amount]
  );

  const availableAmount = useMemo(() => {
    const asset = coinAssets.find((item) => item?.tokenName === loanCoin);
    return new BigNumber(asset?.free || 0);
  }, [coinAssets, loanCoin]);


  // 剩余利息=总利息-已还利息
  const remainingInterest = useMemo(
    () => {
      const remainingInterest = toValidBigNumber(order?.unpaid_interest);
      const repay = toValidBigNumber(repayAmount);
      const leftInterest = remainingInterest.minus(repay);
      if (leftInterest.lt(0)) return new BigNumber(0);
      return leftInterest;
    },
    [order?.unpaid_interest, repayAmount]
  );

   // 剩余本金=总负债金额-还款总额-剩余利息
  const remainingPrincipal = useMemo(() => {
    const principal = toValidBigNumber(order?.unpaid_principal);
    const repay = toValidBigNumber(repayAmount);
    if (remainingInterest.gt(0)) {
      return principal;
    }
    const leftInterest = toValidBigNumber(order?.unpaid_interest);
    const repayNoInterest = repay.minus(leftInterest);
    const remaining = principal.minus(repayNoInterest);
    return remaining.isLessThan(0) ? new BigNumber(0) : remaining;
  }, [order?.unpaid_interest, order?.unpaid_principal, remainingInterest, repayAmount]);

  const amountErrorMsg = useMemo(() => {
    if (!repayAmount) return '';

    const amount = new BigNumber(repayAmount);
    if (!amount.isFinite() || amount.isNaN() || !amount.gt(0)) {
      return t('loan.amount.error', '请输入有效金额');
    }

    if (amount.gt(availableAmount)) {
      return t('insufficient-balance', '余额不足');
    }

    if (totalLoanAmount.gt(0) && amount.gt(totalLoanAmount)) {
      return t('loan.repay.amount.gt.debt', '还款金额不能大于总负债');
    }

    return '';
  }, [availableAmount, repayAmount, t, totalLoanAmount]);

  const inputStatus = amountErrorMsg ? 'error' : '';
  const isSubmitDisabled = !repayAmount || !!amountErrorMsg || !order;
  const secondText = 'text-text-secondary text-sm';
  const secondValue = 'text-text-primary text-sm font-medium';

  useEffect(() => {
    setIsShowModal(open);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setRepayAmount('');
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
    setRepayAmount(value);
  };

  const handleAmountInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    if (isValidAmountInput(value, REPAY_AMOUNT_PRECISION)) {
      onAmountChange(value);
    }
  };

  const handleAmountBlur = (): void => {
    onAmountChange(normalizeAmount(repayAmount));
  };

  const handleMaxInput = (): void => {
    const minAmount = new BigNumber(Math.min(availableAmount.toNumber(), totalLoanAmount.toNumber()))
        .decimalPlaces(REPAY_AMOUNT_PRECISION, BigNumber.ROUND_DOWN)
        .toFixed()
    onAmountChange(minAmount)
  };

  /**
   * 确认还款
   */
  const onConfirm = (): void => {
    if (!isLogin) {
      goPage('login');
      return;
    }

    const normalizedRepayAmount = normalizeAmount(repayAmount);
    if (isSubmitDisabled || !normalizedRepayAmount || !order) return;

    setLoading(true);
    postLoanRepay({
      repay_amount: normalizedRepayAmount,
      duration_type: order?.duration_type,
      position_id: order?.position_id
    })
      .then((res) => {
        setRepaySuccessInfo(res);
        setShowSuccessModal(true);
        setIsShowModal(false);
        setRepayAmount('');
        triggerRefresh();
        close();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = (): void => {
    setRepayAmount('');
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
              {t('loan.repay', '还款')}
            </div>
            <div className="cursor-pointer" onClick={handleClose}>
              <CloseIcon />
            </div>
          </div>

          <div className="flex flex-col justify-between items-start mt-6 gap-2">
            <div className="flex justify-start items-center mt-4">
              <EarnTooltip title={t('loan.repay.total.tip')}>
                <div className={secondText}>
                  {t('loan.repay.total', '还款总额')}
                </div>
              </EarnTooltip>
            </div>

            <div className="relative w-full">
              <Input
                className="h-10! mt-2 bg-fill-input! global-input-style"
                size="large"
                value={repayAmount}
                placeholder={t('loan.repay.amount.placeholder')}
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
                    {order?.borrow_coin}
                  </div>
                }
              />
              {amountErrorMsg && (
                <div className="text-xs text-text-red h-5 mt-2">
                  {amountErrorMsg}
                </div>
              )}
            </div>

            <div className="w-full flex justify-between items-center">
              <EarnTooltip title={t('availabelBalance.tip')}>
                <div className={secondText}>
                  {t('availabelBalance', '可用余额')}
                </div>
              </EarnTooltip>
              <div className="flex items-center justify-center gap-1">
                <div className={secondValue}>
                  {toThousandsNumberNoZero(
                    availableAmount.toString(),
                    REPAY_AMOUNT_PRECISION
                  )}{' '}
                  {loanCoin}
                </div>
                <div className="cursor-pointer" onClick={handleAddAsset}>
                  <AddIcon />
                </div>
              </div>
            </div>

            <RepayAmountSlider
              value={repayAmount}
              availableAmount={new BigNumber(Math.min(+availableAmount, +order?.total_borrow_amount))}
              precision={REPAY_AMOUNT_PRECISION}
              ariaLabel={t('loan.repay.amount.percent', '还款比例')}
              onChange={onAmountChange}
            />

            <div className="w-full flex justify-between items-center text-text-primary text-sm mt-6">
              <span>
                {t('loan.total', '总负债')}
              </span>
              <span>
                 {formatAmount(order?.total_borrow_amount, order?.borrow_coin_precision_digits)}
              </span>
            </div>

            <div className="w-full p-3 bg-bg-secondary rounded-lg">
              <div className="w-full flex justify-between items-center text-text-primary text-sm">
                <span className="text-text-secondary">
                  {t('left_prencipal', '剩余本金')}
                </span>
                <span>
                   {formatAmount(remainingPrincipal.toString(), order?.borrow_coin_precision_digits)}
                </span>
              </div>
              <div className="w-full flex justify-between items-center text-text-primary text-sm">
                <span className="text-text-secondary">
                  {t('left_interest', '剩余利息')}
                </span>
                <span>
                   {formatAmount(remainingInterest.toString(), order?.borrow_coin_precision_digits)}
                </span>
              </div>

            </div>

            <div className="w-full flex justify-between items-center text-text-primary text-sm mt-6">
              <span>
                {t('loan.rate_after_repayment', '预估还款后质押率')}
              </span>
              <span>
                 {new BigNumber(order?.total_borrow_amount || 0).minus(new BigNumber(repayAmount || 0)).div(new BigNumber(order?.pledge_amount || 1).times(new BigNumber(order?.current_pledge_price || 1))).times(100).toFixed(2)}%
              </span>
            </div>
            <div className="w-full flex justify-between items-center text-text-primary text-sm mt-6">
              <span>
                {t('loan.release_pledege', '预估释放质押物')}
              </span>
              <span>
                {+repayAmount >= +order?.total_borrow_amount ? formatAmount(order?.pledge_amount, order?.pledge_coin_precision_digits) : 0 } {order?.pledge_coin}
              </span>
            </div>
            <div className="w-full flex justify-end items-center text-text-secondary text-xs">{t('back_to_spot')}</div>

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
              {t('sure-repay')}
            </button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        type="repay"
        open={showSuccessModal}
        params={repaySuccessInfo}
        close={() => setShowSuccessModal(false)}
      />

      {loanCoin && (
        <AddAssetsModal
          coin={loanCoin}
          open={showAddAssetsModal}
          close={handleAssetModalClose}
        />
      )}
    </>
  );
};

export default RepayLiquidModal;
