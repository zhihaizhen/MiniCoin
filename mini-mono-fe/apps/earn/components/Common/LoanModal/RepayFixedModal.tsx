import React, { useEffect, useMemo, useState } from 'react';
import {  Modal } from 'antd';
import BigNumber from 'bignumber.js';
import { goPage } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { LoanOrderProp, RepayResultProp } from '~/interface';
import { getCoinAssets } from '~/api';
import { postLoanRepay } from '~/api/loan';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { ReactComponent as AddIcon } from '~/public/images/add.svg';
import { toThousandsNumberNoZero, toValidBigNumber, formatAmount } from '~/utils';
import AddAssetsModal from '~/components/Common/AddAssetsModal';
import { useEarnDataRefresh } from '~/context/EarnDataContext';
import EarnTooltip from '~/components/Common/EarnTooltip';
import SuccessModal from '~/components/Common/LoanModal/SuccessModal';

interface LoanModalProps {
  order?: LoanOrderProp | null;
  open: boolean;
  close: () => void;
}

interface CoinAsset {
  tokenName?: string;
  free?: string | number;
}

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * 定期-质押还款弹窗
 */
const RepayFixedModal: React.FC<LoanModalProps> = ({ order, open, close }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { triggerRefresh } = useEarnDataRefresh();

  const [loading, setLoading] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [isShowModal, setIsShowModal] = useState(open);
  const [coinAssets, setCoinAssets] = useState<CoinAsset[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [repaySuccessInfo, setRepaySuccessInfo] = useState<RepayResultProp>(null);

  const loanCoin = order?.borrow_coin || '';

  const availableAmount = useMemo(() => {
    const asset = coinAssets.find((item) => item?.tokenName === loanCoin);
    return new BigNumber(asset?.free || 0).toString();
  }, [coinAssets, loanCoin]);

  /**
   * 罚息=本金 * 小时数 * 年利率 / 365 / 24
   */
  const repayInterestFine = useMemo(() => {
    if (order?.duration_type !== 'fixed') return new BigNumber(0);

    const remainingHours = toValidBigNumber(order?.maturity_at)
      .minus(toValidBigNumber(order?.interest_last_calc_at))
      .div(MS_PER_HOUR)
      .integerValue(BigNumber.ROUND_FLOOR);

    if (!remainingHours.gt(0)) return new BigNumber(0);

    return toValidBigNumber(order?.unpaid_principal)
      .times(toValidBigNumber(order?.current_borrow_price))
      .times(remainingHours)
      .times(toValidBigNumber(order?.year_rate))
      .div(365)
      .div(24);
  }, [
    order?.current_borrow_price,
    order?.duration_type,
    order?.interest_last_calc_at,
    order?.maturity_at,
    order?.unpaid_principal,
    order?.year_rate
  ]);

  const repayTotalAmount = useMemo(
    () => toValidBigNumber(order?.total_borrow_amount).plus(repayInterestFine).toString(),
    [order?.total_borrow_amount, repayInterestFine]
  );

  useEffect(() => {
    setIsShowModal(open);
  }, [open]);

  useEffect(() => {
    if (!open) {
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

  /**
   * 确认还款
   */
  const onConfirm = (): void => {
    if (!isLogin) {
      goPage('login');
      return;
    }

    if (!order) return;

    setLoading(true);
    postLoanRepay({
      repay_amount: repayTotalAmount,
      duration_type: order?.duration_type,
      position_id: order?.position_id
    })
      .then((res) => {
        setRepaySuccessInfo({ ...res, duration_type: 'fixed' });
        setShowSuccessModal(true);
        setIsShowModal(false);
        triggerRefresh();
        close();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = (): void => {
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

  useEffect(() => {
    console.log('order →', order);
  }, [order]);

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

          <div className="flex flex-col justify-between items-start mt-6 gap-2  p-3 bg-bg-secondary rounded-lg">

            <div className="w-full flex justify-between items-center">
              <EarnTooltip title={t('loan.repay.total.tip')}>
                <div className="text-text-primary text-sm">
                  {t('loan.repay.total', '还款总额')}
                </div>
              </EarnTooltip>
              <div className={'text-text-primary text-sm font-medium'}>
                {formatAmount(repayTotalAmount, order?.borrow_coin_precision_digits)} {order?.borrow_coin}
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <EarnTooltip title={t('availabelBalance.tip')}>
                <div className={`text-xs text-text-secondary`}>
                  {t('availabelBalance', '可用余额')}
                </div>
              </EarnTooltip>
              <div className="flex items-center justify-center gap-1">
                <div className={`text-text-primary font-medium text-xs`}>
                  {formatAmount(availableAmount, order?.borrow_coin_precision_digits)}
                  {loanCoin}
                </div>
                <div className="cursor-pointer" onClick={handleAddAsset}>
                  <AddIcon />
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-line-divider-primary my-4" />
            <div className="w-full flex justify-between items-center text-text-primary text-sm">
              <span>
                {t('loan.total', '总负债')}
              </span>
              <span>
                 {formatAmount(order?.total_borrow_amount, order?.borrow_coin_precision_digits)}
              </span>
            </div>
            <div className="w-full flex justify-between items-center text-text-primary text-xs">
              <span className="text-text-secondary">
                {t('left_prencipal', '剩余本金')}
              </span>
              <span className="text-text-primary font-medium">
                 {formatAmount(order?.unpaid_principal, order?.borrow_coin_precision_digits)}
              </span>
            </div>
            <div className="w-full flex justify-between items-center text-text-primary text-xs">
              <span className="text-text-secondary">
                {t('left_interest', '剩余利息')}
              </span>
              <span className="text-text-primary font-medium">
                 {formatAmount(order?.unpaid_interest, order?.borrow_coin_precision_digits)}
              </span>
            </div>
           <div className="w-full h-px bg-line-divider-primary my-4" />
            {
              order?.duration_type === 'fixed' && (
                <>
                  <div className="w-full flex justify-between items-center text-text-primary text-sm">
                    <EarnTooltip title={t('loan.repay_interest_fin.tip')}>
                      <span>
                        {t('loan.repay_interest_fine', '罚息')}
                      </span>
                    </EarnTooltip>
                    <span>
                      {formatAmount(repayInterestFine.toString(), order?.borrow_coin_precision_digits)}
                    </span>
                  </div>
                  <div className="w-full h-px bg-line-divider-primary my-4" />
                </>
              )
            }
            <div className="w-full flex justify-between items-center text-text-primary text-sm">
              <span>
                {t('loan.rate_after_repayment', '预估还款后质押率')}
              </span>
              <span>
                 0%
              </span>
            </div>
            <div className="w-full h-px bg-line-divider-primary my-4" />
            <div className="w-full flex justify-between items-center text-text-primary text-sm">
              <span>
                {t('loan.release_pledege', '预估释放质押物')}
              </span>
              <span>
                 {formatAmount(order?.pledge_amount, order?.pledge_coin_precision_digits)} {order?.pledge_coin}
              </span>
            </div>
            <div className="w-full flex justify-end items-center text-text-secondary text-xs">{t('back_to_spot')}</div>
          </div>
          <button
            className={`w-full h-10 mt-4 rounded-lg text-sm font-medium cursor-pointer
              bg-fill-button-primary-default text-text-white hover:bg-fill-button-primary-hover`}
            disabled={loading}
            onClick={onConfirm}
          >
            {t('sure-repay')}
          </button>
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

export default RepayFixedModal;
