import { Modal } from 'antd';
import { AdjustResultProp, BorrowCallBackProp, RepayResultProp } from '~/interface';
import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import Image from 'next/image';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { formatAmount } from '~/utils';

type SuccessModalProps =
   {
      open: boolean;
      type: 'borrow';
      params: BorrowCallBackProp;
      apr?: string;
      close: () => void;
    }
  | {
      open: boolean;
      type: 'repay';
      params: RepayResultProp;
      close: () => void;
    }
  | {
    open: boolean;
    type: 'adjustLtv';
    params: AdjustResultProp;
    close: () => void;
  };
type InfoRowProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

const InfoRow = ({
  label,
  value,
  className = '',
}: InfoRowProps) => (
  <div className={`w-full flex justify-between items-center leading-6 ${className}`}>
    <div className="text-text-secondary text-sm">{label}</div>
    <div className="text-text-primary text-sm font-medium">{value}</div>
  </div>
);

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  type,
  params,
  close,
  ...rest
}: SuccessModalProps) => {

  const t = useFm();
  const borrowParams = type === 'borrow' ? (params as BorrowCallBackProp) : null;
  const isLiquid = borrowParams?.duration_type === 'liquid';
  const borrowAmountText = borrowParams
    ? `${borrowParams.borrow_amount} ${borrowParams.borrow_coin}`
    : '-';
  const collateralText = borrowParams
    ? `${borrowParams.pledge_amount} ${borrowParams.pledge_coin}`
    : '-';
  const ltvText = borrowParams ? `${(+borrowParams.ltv * 100).toFixed(2)} %` : '-';
  const borrowApr = borrowParams ? `${+borrowParams.year_rate * 100} %` : '-';
  const durationText = borrowParams
    ? isLiquid ? t('liquid', '活期') : `${borrowParams.duration_days}天`
    : '-';
  const expirationTime = borrowParams && !isLiquid
    ? dayjs().add(Number(borrowParams.duration_days), 'day').format('YYYY-MM-DD HH:mm:ss')
    : null;

  const repayParams = type === 'repay' ? (params as RepayResultProp) : null;
  const isFixedRepay = repayParams?.duration_type === 'fixed';
  const repayAmountText = repayParams
    ? `${repayParams.repay_amount} ${repayParams.borrow_coin}`
    : '-';
  const repayPrincipal  = `${repayParams?.repay_principal} ${repayParams?.borrow_coin}`;
  const repayInterest = `${repayParams?.repay_interest} ${repayParams?.borrow_coin}`;
  const releasePledge = `${repayParams?.released_pledge_amount} ${repayParams?.pledge_coin}`;
  const repayInterestFine = `${repayParams?.repay_interest_fine} ${repayParams?.borrow_coin}`;

  const adjustLtvParams = type === 'adjustLtv' ? (params as AdjustResultProp) : null;
  const adjustLtvAmountText = adjustLtvParams
    ? `${new BigNumber(adjustLtvParams.change_pledge_amount).abs().toString()} ${adjustLtvParams.coin}`
    : '-';
  const adjustLtvRateText = adjustLtvParams
    ? `${formatAmount(+adjustLtvParams.current_ltv * 100, 2)} % `
    : '-';

  const handleGoPositionPage = () => {
    goPage(type === 'borrow' ? 'loanPersonal' : type === 'repay' ? 'loanRepayHistory' : 'loanLtvAdjustHistory', `activeKey=inprogressorders&durationType=${ borrowParams?.duration_type}` );
  };

  return (
    <Modal
      open={open}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={440}
      footer={null}
    >
      <div className="w-full flex flex-col items-center">
        <div className="mt-3">
          <Image
            src={`${basePath}/images/complete.png`}
            alt="success"
            width={75}
            height={75}
            loader={({ src }) => src}
          />
        </div>
        <div className="text-lg font-bold mt-2">{type === 'borrow' ? t('loan.success') : type === 'adjustLtv' ? t('loan.adjustLtvSuccess') :
          type === 'repay' ? t('loan.repaySuccess') : t('loan.repaySuccess')}</div>
        {
          type !== 'adjustLtv' &&  <div className="text-base text-text-secondary">{type === 'borrow' ? borrowAmountText : repayAmountText}</div>
        }

        <div className="mt-8 w-full flex flex-col gap-3 p-3 bg-bg-secondary rounded-lg">
          {
           type === 'borrow' &&
            <>
              <InfoRow label={t('loan.pledgeobj', '质押物')} value={collateralText} />
              <InfoRow label={t('loan.ltv', '质押率')} value={ltvText} />
              <InfoRow label={t('loan.apr', '年化利率')} value={borrowApr} />
              <InfoRow label={t('loan.timelimit', '借款期限')} value={durationText} />
              {!isLiquid && (
                <InfoRow label={t('expiration-time', '到期时间')} value={expirationTime} />
              )}
            </>
          }

          { type === 'repay' &&  <>
             <InfoRow label={t('loan.repayprincipal', '归还本金')} value={repayPrincipal} />
             <InfoRow label={t('loan.repayinterest', '支付利息')} value={repayInterest} />
             <InfoRow label={t('loan.releasedpledge', '释放质押')} value={releasePledge} />
             {isFixedRepay && <InfoRow label= {t('loan.repay_interest_fine', '罚息')} value={repayInterestFine} />}

           </>
          }

           { type === 'adjustLtv' &&  <>
             <InfoRow label={adjustLtvParams?.type === 'add' ? t('loan.addpledge', '增加质押物') : t('loan.reducepledge', '减少质押物')} value={adjustLtvAmountText} />
             <InfoRow label={t('loan.adjustedLtv', '调整后质押率')} value={adjustLtvRateText} />
           </>
          }
        </div>

        <div className="w-full flex gap-2 mt-6">
          <button
            className="w-full h-10 mt-4 rounded-lg text-sm font-medium cursor-pointer bg-fill-button-tertiary-default text-text-primary hover:bg-fill-button-tertiary-hover transition-colors"
            onClick={close}
          >
            {t('ok')}
          </button>
          <button
            className="w-full h-10 mt-4 rounded-lg text-sm font-medium cursor-pointer bg-fill-button-primary-default text-text-white hover:bg-fill-button-primary-hover transition-colors"
            onClick={handleGoPositionPage}
          >
            {type === 'borrow' ? t('view.order') : t('view.records')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
