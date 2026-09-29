import { Modal } from 'antd';
import { ProductDetailProps } from '~/interface';
import React, { useMemo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { CategoryEnum, PnlTypeEnum, TagEnum } from '~/enums';
import { formatApr } from '~/utils';
import Timeline from '~/components/Common/Timeline';
import { basePath, goPage } from '@better-bit-fe/base-utils';
import Image from 'next/image';
import EarnTooltip from '~/components/Common/EarnTooltip';

interface SuccessModalProps {
  open: boolean;
  prd: ProductDetailProps;
  amount: string;
  autoRenew?: boolean;
  close: () => void;
}

/**
 * 申购成功
 * @param open
 * @param prd
 * @param close
 * @param amount
 * @param autoRenew
 * @constructor
 */
const InfoRow = ({
  label,
  value,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={`w-full flex justify-between items-center leading-6 ${className}`}>
    <div className="text-text-secondary text-sm">{label}</div>
    <div className="text-text-primary text-sm font-medium">{value}</div>
  </div>
);

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  prd,
  amount,
  autoRenew,
  close,
}: SuccessModalProps) => {
  const t = useFm();

  const isStake = useMemo(
    () => prd?.product_type === TagEnum.DEFI || prd?.product_type === TagEnum.POS,
    [prd?.product_type]
  );
  const isFixed = prd?.category === CategoryEnum.FIXED;

  const aprText = useMemo(() => {
    if (prd?.product_type === TagEnum.DEFI) {
      return formatApr(prd?.defi_reference_apr);
    }
    if (isStake || isFixed) {
      return formatApr(prd?.fixed_apr);
    }
    if (prd?.category === CategoryEnum.LIQUID) {
      const levels = prd?.level_apr || [];
      if (levels.length === 0) return '-';
      return `${formatApr(levels[levels.length - 1]?.apr)} ~ ${formatApr(levels[0]?.apr)}`;
    }
    return '-';
  }, [prd, isStake, isFixed]);

  const handleGoPostionPage = () => {
    if (isStake) {
      goPage('financeAcc', 'tab=STAKING_ONCHAIN');
    } else {
      goPage('financeAcc');
    }
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
          <Image src={`${basePath}/images/complete.png`} alt="success" width={75} height={75}  loader={({ src }) => src} />
        </div>
        <div className="text-2xl font-semibold mt-4">
          {amount} {prd?.coin}
        </div>
        <span className="text-text-primary text-sm mt-1">
          {isStake ? t('stake-success') : t('subscribeSuccess')}
        </span>

        <div className="mt-8 w-full flex flex-col gap-2">
          {!isStake && (
            <>
              <InfoRow label={t('productType', '产品类型')} value={t(prd?.product_type || '-')} />
              <InfoRow
                label={t('productTerm', '产品期限')}
                value={isFixed ? `${prd?.duration_days}${t('day')}` : t('no-limited')}
              />
            </>
          )}

          <div className="w-full flex justify-between items-center leading-6">
            <div className="text-text-secondary text-sm">{t('sendModal', '收益模式')}</div>
            <EarnTooltip
              title={prd?.pnl_type === PnlTypeEnum.DAILY ? t('daily_send_tip') : t('t2_send_tip')}
              titleClassName="text-white"
            >
              <div className="text-text-primary text-sm font-medium">
                {t(prd?.pnl_type || ' ')}
              </div>
            </EarnTooltip>
          </div>

          <InfoRow
            label={t('referApr', '参考年化')}
            value={<span className="text-text-brand-default!">{aprText}</span>}
          />

          {!isStake && prd?.product_tag !== TagEnum.NEWBIE && prd?.product_type !== TagEnum.RUSH &&
            <InfoRow
              label={isFixed ? t('autoRenew') : t('autoSub')}
              value={autoRenew ? t('auto-enabled') : t('no-open')}
            />
          }
        </div>

        <div className="w-full mt-8">
          <Timeline days={prd?.duration_days} type={prd?.category} tag={prd?.product_type} />
        </div>

        <div className="w-full flex gap-2 mt-6">
          <button
            className="w-full h-10 mt-4 rounded-lg text-sm font-medium cursor-pointer bg-fill-button-tertiary-default text-text-primary hover:bg-fill-button-tertiary-hover transition-colors"
            onClick={handleGoPostionPage}
          >
            {t('viewAsset')}
          </button>
          <button
            className="w-full h-10 mt-4 rounded-lg text-sm font-medium cursor-pointer bg-fill-button-primary-default text-text-white hover:bg-fill-button-primary-hover transition-colors"
            onClick={close}
          >
            {isStake ? t('goon-stake') : t('goonSubscribe')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
