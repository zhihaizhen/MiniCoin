import React, {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Checkbox, Input, Modal, Select, Switch } from 'antd';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import { FormattedMessage } from 'react-intl';
import { getSymbolUrl, goPage } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import {
  BorrowCallBackProp,
  BorrowCoinConfig,
  LoanBorrowParams,
  PledgeCoinConfig
} from '~/interface';
import { getCoinAssets } from '~/api';
import { postLoanBorrow } from '~/api/loan';
import { toThousandsNumberNoZero, toValidBigNumber, normalizeAmount } from '~/utils';
import { useEarnDataRefresh } from '~/context/EarnDataContext';
import { useLoanCoinData } from '~/context/LoanCoinDataContext';
import SuccessModal from '~/components/Common/LoanModal/SuccessModal';
import AddAssetsModal from '~/components/Common/AddAssetsModal';
import CoinSelectDropDown from '~/components/Common/LoanModal/CoinSelectDropDown';
import LtvSlider from '~/components/Common/LoanModal/LtvSlider';
import AutoAddModal from '~/components/Common/LoanModal/AutoAddModal';
import LtvInfoModal from '~/components/Common/LoanModal/LtvInfoModal';
import EarnTooltip from '~/components/Common/EarnTooltip';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { ReactComponent as AddIcon } from '~/public/images/add.svg';
import { ReactComponent as ArrowDownIcon } from '~/public/images/arrow-down.svg';
import { ReactComponent as CheckIcon } from '~/public/images/check.svg';
import { ReactComponent as CheckRightIcon } from '~/public/images/check-right.svg';

interface LoanModalProps {
  coinConfig: BorrowCoinConfig;
  open: boolean;
  close: () => void;
}

interface CoinAsset {
  tokenName?: string;
  free?: string | number;
}

type AmountField = 'borrow_amount' | 'pledge_amount';

const SECONDARY_TEXT_CLASS = 'text-text-secondary text-sm';
const SECONDARY_VALUE_CLASS = 'text-text-primary text-sm font-medium';
const AMOUNT_INPUT_REG = /^-?\d*(\.\d*)?$/;
const LOAN_DOC_FALLBACK_URL =
  'https://easicoin.zendesk.com/hc/zh-cn/articles/16178979457423-EasiCoin%E5%80%9F%E8%B4%B7%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE';

const getPrecision = (precisionDigits?: number | string) => {
  const str = String(precisionDigits || '');
  if (!str.includes('.')) return +str;

  return str.split('.')[1].length;
};

const sanitizeCalculatedAmount = (amount: BigNumber, precision: number) => {
  if (!amount.isFinite() || amount.isNaN() || amount.lt(0)) return '';

  return amount.decimalPlaces(precision, BigNumber.ROUND_DOWN).toFixed();
};

const isValidAmountInput = (value: string, precision: number): boolean => {
  if (!AMOUNT_INPUT_REG.test(value)) return false;

  const [, decimalPart = ''] = value.split('.');
  return decimalPart.length <= precision;
};

const formatRate = (value?: string | number): string => {
  const rate = toValidBigNumber(value);
  return rate.times(100).toString();
};

const createBorrowParams = (
  borrowCoin: BorrowCoinConfig,
  pledgeCoin?: PledgeCoinConfig
): LoanBorrowParams => ({
  pledge_coin: pledgeCoin?.coin,
  pledge_amount: '',
  borrow_coin: borrowCoin.coin,
  borrow_amount: '',
  duration_type: 'liquid',
  duration_days: '0',
  ltv: pledgeCoin?.initial_pledge_rate || '0',
  automatic_replenishment: 0
});

const getSupportedPledgeCoinList = (
  pledgeCoinList: PledgeCoinConfig[],
  borrowCoin?: BorrowCoinConfig
): PledgeCoinConfig[] => {
  const supportCoins = borrowCoin?.support_pledge_coins;
  if (!Array.isArray(supportCoins) || !supportCoins.length) return [];

  const supportCoinSet = new Set(
    supportCoins.map((coin) => coin.toUpperCase())
  );
  return pledgeCoinList.filter((item) =>
    supportCoinSet.has(item.coin.toUpperCase())
  );
};

const getInterestRate = (
  borrowCoin: BorrowCoinConfig,
  durationType: LoanBorrowParams['duration_type'],
  durationDays?: string
) => {
  if (durationType === 'liquid') {
    return borrowCoin?.liquid_fixed_interest_rate;
  }

  return durationDays === '30'
    ? borrowCoin?.days_30_interest_rate
    : borrowCoin?.days_7_interest_rate;
};

const calculatePledgeAmount = ({
  borrowAmount,
  ltv,
  borrowCoin,
  pledgeCoin,
  precision
}: {
  borrowAmount: string;
  ltv: string;
  borrowCoin: BorrowCoinConfig;
  pledgeCoin?: PledgeCoinConfig;
  precision: number;
}): string => {
  if (!borrowAmount || borrowAmount === '-') return '';

  const amount = new BigNumber(borrowAmount);
  const ltvRate = toValidBigNumber(ltv);
  const borrowPrice = toValidBigNumber(borrowCoin?.price);
  const pledgePrice = toValidBigNumber(pledgeCoin?.price);

  if (
    !amount.isFinite() ||
    !ltvRate.gt(0) ||
    !borrowPrice.gt(0) ||
    !pledgePrice.gt(0)
  ) {
    return '';
  }
  return sanitizeCalculatedAmount(
    amount.multipliedBy(borrowPrice).dividedBy(ltvRate.multipliedBy(pledgePrice)),
    precision
  );
};

const calculateBorrowAmount = ({
  pledgeAmount,
  ltv,
  borrowCoin,
  pledgeCoin,
  precision
}: {
  pledgeAmount: string;
  ltv: string;
  borrowCoin: BorrowCoinConfig;
  pledgeCoin?: PledgeCoinConfig;
  precision: number;
}): string => {
  if (!pledgeAmount || pledgeAmount === '-') return '';

  const amount = new BigNumber(pledgeAmount);
  const ltvRate = toValidBigNumber(ltv);
  const loanPrice = toValidBigNumber(borrowCoin?.price);
  const pledgePrice = toValidBigNumber(pledgeCoin?.price);

  if (
    !amount.isFinite() ||
    !ltvRate.gt(0) ||
    !loanPrice.gt(0) ||
    !pledgePrice.gt(0)
  ) {
    return '';
  }

  return sanitizeCalculatedAmount(
    amount.multipliedBy(ltvRate).multipliedBy(pledgePrice).dividedBy(loanPrice),
    precision
  );
};

const ModalHeader = ({
  title,
  onClose
}: {
  title: ReactNode;
  onClose: () => void;
}) => (
  <div className="w-full flex items-center justify-between pr-3">
    <div className="flex justify-start items-center gap-2 text-lg font-bold">
      {title}
    </div>
    <div className="cursor-pointer" onClick={onClose}>
      <CloseIcon />
    </div>
  </div>
);

const FieldLabel = ({
  title,
  tooltip,
  className = 'text-sm text-text-primary'
}: {
  title: ReactNode;
  tooltip: ReactNode;
  className?: string;
}) => (
  <div className="flex justify-start items-center mt-4">
    <EarnTooltip title={tooltip}>
      <div className={className}>{title}</div>
    </EarnTooltip>
  </div>
);

const InfoRow = ({
  label,
  value,
  tooltip
}: {
  label: ReactNode;
  value: ReactNode;
  tooltip?: ReactNode;
}) => (
  <div className="w-full flex justify-between items-center">
    {tooltip ? (
      <EarnTooltip title={tooltip}>
        <div className={SECONDARY_TEXT_CLASS}>{label}</div>
      </EarnTooltip>
    ) : (
      <div className={SECONDARY_TEXT_CLASS}>{label}</div>
    )}
    <span className={SECONDARY_VALUE_CLASS}>{value}</span>
  </div>
);

const CoinSelector = ({
  coin,
  onClick
}: {
  coin?: string;
  onClick: () => void;
}) => (
  <div
    className="flex items-center justify-center gap-2 cursor-pointer"
    onClick={onClick}
  >
    <Image
      src={getSymbolUrl(coin || '')}
      alt=" "
      width={20}
      height={20}
      loader={({ src }) => src}
    />
    <span className="text-text-primary text-sm">{coin}</span>
    <ArrowDownIcon />
  </div>
);

const RateCell = ({ value }: { value?: string | number }) => (
  <>{value ? `${formatRate(value)}%` : '-'}</>
);

const LtvRateTable = ({
  pledgeCoin,
  t
}: {
  pledgeCoin?: PledgeCoinConfig;
  t: ReturnType<typeof useFm>;
}) => (
  <div className="w-full mt-2 border border-line-border-default overflow-hidden">
    <div className="min-h-10 grid grid-cols-3 bg-bg-secondary text-center text-sm text-text-secondary border-b border-line-border-default font-normal">
      <div className="py-2 px-2 border-r border-line-border-default">
        {t('loan.initial_pledge_rate', '最大初始质押率')}
      </div>
      <div className="py-2 px-2 border-r border-line-border-default">
        {t('loan.early_warning_pledge_rate', '预警质押率')}
      </div>
      <div className="py-2 px-2">
        {t('loan.force_liquidate_pledge_rate', '强平质押率')}
      </div>
    </div>
    <div className="min-h-10 grid grid-cols-3 text-center text-sm text-text-primary">
      <div className="py-2 px-2 border-r border-line-border-default">
        <RateCell value={pledgeCoin?.initial_pledge_rate} />
      </div>
      <div className="py-2 px-2 border-r border-line-border-default">
        <RateCell value={pledgeCoin?.early_warning_pledge_rate} />
      </div>
      <div className="py-2 px-2">
        <RateCell value={pledgeCoin?.force_liquidate_pledge_rate} />
      </div>
    </div>
  </div>
);

/**
 * 质押借贷弹窗
 */
const LoanModal: React.FC<LoanModalProps> = ({ coinConfig, open, close }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { triggerRefresh } = useEarnDataRefresh();
  const { sourceBorrowCoinList, sourcePledgeCoinList } = useLoanCoinData();

  const defaultPledgeCoin = getSupportedPledgeCoinList(
    sourcePledgeCoinList,
    coinConfig
  )[0];
  const [borrowCoin, setBorrowCoin] = useState<BorrowCoinConfig>(coinConfig);
  const [pledgeCoin, setPledgeCoin] = useState<PledgeCoinConfig | undefined>(defaultPledgeCoin);
  const [borrowParams, setBorrowParams] = useState<LoanBorrowParams>(
    createBorrowParams(coinConfig, defaultPledgeCoin)
  );

  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [isShowModal, setIsShowModal] = useState(open);
  const [showBorrowCoinDropDown, setShowBorrowCoinDropDown] = useState(false);
  const [showPledgeCoinDropDown, setShowPledgeCoinDropDown] = useState(false);
  const [showAutoAddModal, setShowAutoAddModal] = useState(false);
  const [showLtvModal, setShowLtvModal] = useState(false);
  const [coinAssets, setCoinAssets] = useState<CoinAsset[]>([]);

  const [borrowCompleteInfo, setBorrowCompleteInfo] = useState<BorrowCallBackProp | null>(null)

  const supportedPledgeCoinList = useMemo(
    () => getSupportedPledgeCoinList(sourcePledgeCoinList, borrowCoin),
    [borrowCoin, sourcePledgeCoinList]
  );

  const borrowPrecision = useMemo(
    () => getPrecision(borrowCoin?.precision_digits),
    [borrowCoin?.precision_digits]
  );

  const pledgePrecision = useMemo(
    () => getPrecision(pledgeCoin?.precision_digits),
    [pledgeCoin?.precision_digits]
  );

  const availablePledgeAmount = useMemo(() => {
    const asset = coinAssets.find(
      (item) => item?.tokenName === pledgeCoin?.coin
    );
    return +asset?.free || 0;
  }, [coinAssets, pledgeCoin?.coin]);

  const displayInterestRate = useMemo(
    () =>
      formatRate(
        getInterestRate(
          borrowCoin,
          borrowParams.duration_type,
          borrowParams.duration_days
        )
      ),
    [borrowParams.duration_days, borrowParams.duration_type, borrowCoin]
  );

  const hourInterestRate = useMemo(() => {
    const annualRate = toValidBigNumber(
      getInterestRate(
        borrowCoin,
        borrowParams.duration_type,
        borrowParams.duration_days
      )
    );
    return annualRate.div(365).div(24);
  }, [borrowParams.duration_days, borrowParams.duration_type, borrowCoin]);

  /**
   * Calculate the estimated interest for a given borrow amount and duration
   */
  const estimatedHourInterest = useMemo(() => {
    const borrowAmount = toValidBigNumber(borrowParams.borrow_amount);
    return borrowAmount
      .times(hourInterestRate)
      .decimalPlaces(borrowPrecision, BigNumber.ROUND_DOWN)
      .toString();
  }, [borrowParams.borrow_amount, borrowPrecision, hourInterestRate]);

  const borrowErrorMsg = useMemo(() => {
    const value = borrowParams.borrow_amount;

    if (+borrowCoin.is_delivery === 1) {
      return t('loan.delivery');
    }
    if (!value || value === '-') return '';

    if (new BigNumber(value).lt(new BigNumber(borrowCoin?.min_investment_quota))) {
      return t('loan.min_investment_quota', {
        min: `${borrowCoin?.min_investment_quota} ${borrowCoin?.coin}`
      });
    }
    if (new BigNumber(value).gt(new BigNumber(borrowCoin?.individual_cap))) {
      return t('loan.max_investment_quota', {
        max: `${borrowCoin?.individual_cap} ${borrowCoin?.coin}`
      });
    }
    return '';
  }, [borrowParams.borrow_amount, borrowCoin, t]);

  const pledgeErrorMsg = useMemo(() => {
    const value = borrowParams.pledge_amount;

    if (+pledgeCoin?.is_delivery === 1) {
      return t('loan.delivery');
    }
    if (!value || value === '-') return '';

    if (new BigNumber(value).gt(new BigNumber(availablePledgeAmount))) {
      return t('loan.max_collateral_quota', {
        max: `${toThousandsNumberNoZero(
          availablePledgeAmount,
          pledgePrecision
        )} ${pledgeCoin?.coin}`
      });
    }
    if (new BigNumber(value).gt(new BigNumber(pledgeCoin?.individual_cap))) {
      return t('loan.max_collateral_quota', {
        max: `${toThousandsNumberNoZero(
          pledgeCoin?.individual_cap,
          pledgePrecision
        )} ${pledgeCoin?.coin}`
      });
    }

    return '';
  }, [
    availablePledgeAmount,
    borrowParams.pledge_amount,
    pledgeCoin?.coin,
    pledgeCoin?.individual_cap,
    pledgeCoin?.is_delivery,
    pledgePrecision,
    t
  ]);

  const isSubmitDisabled =
    loading ||
    !checked ||
    !!borrowErrorMsg ||
    !!pledgeErrorMsg ||
    !borrowParams.borrow_amount ||
    !borrowParams.pledge_amount ||
    !borrowParams.pledge_coin;

  const automaticReplenishment = borrowParams.automatic_replenishment === 1;

  useEffect(() => {
    setIsShowModal(open);
  }, [open]);

  useEffect(() => {
    setBorrowCoin(coinConfig);
    setBorrowParams((prev) => ({
      ...prev,
      borrow_coin: coinConfig.coin,
      borrow_amount: '',
      pledge_amount: ''
    }));
  }, [coinConfig]);

  useEffect(() => {
    const nextPledgeCoin =
      supportedPledgeCoinList.find(
        (item) => item.coin.toUpperCase() === pledgeCoin?.coin?.toUpperCase()
      ) ||
      supportedPledgeCoinList[0];

    setPledgeCoin(nextPledgeCoin);
    setBorrowParams((prev) => {
      const hasPledgeCoinChanged = prev.pledge_coin !== nextPledgeCoin?.coin;
      return {
        ...prev,
        pledge_coin: nextPledgeCoin?.coin,
        ltv: hasPledgeCoinChanged
          ? nextPledgeCoin?.initial_pledge_rate || '0'
          : prev.ltv || nextPledgeCoin?.initial_pledge_rate || '0',
        borrow_amount: hasPledgeCoinChanged ? '' : prev.borrow_amount,
        pledge_amount: hasPledgeCoinChanged ? '' : prev.pledge_amount
      };
    });
  }, [pledgeCoin?.coin, supportedPledgeCoinList]);

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

  const resetAmounts = (nextParams?: Partial<LoanBorrowParams>): void => {
    setBorrowParams((prev) => ({
      ...prev,
      ...nextParams,
      borrow_amount: '',
      pledge_amount: ''
    }));
  };

  const getNextPledgeAmount = (borrowAmount: string, ltv = borrowParams.ltv) =>
    calculatePledgeAmount({
      borrowAmount,
      ltv,
      borrowCoin,
      pledgeCoin,
      precision: pledgePrecision
    });

  const getNextBorrowAmount = (pledgeAmount: string, ltv = borrowParams.ltv) =>
    calculateBorrowAmount({
      pledgeAmount,
      ltv,
      borrowCoin,
      pledgeCoin,
      precision: borrowPrecision
    });

  const onBorrowAmountChange = (value: string): void => {

    setBorrowParams((prev) => ({
      ...prev,
      borrow_amount: value,
      pledge_amount: getNextPledgeAmount(value, prev.ltv)
    }));
  };

  const onPledgeAmountChange = (value: string): void => {

    setBorrowParams((prev) => ({
      ...prev,
      pledge_amount: value,
      borrow_amount: getNextBorrowAmount(value, prev.ltv)
    }));
  };

  const handleLtvChange = (value: number): void => {
    const nextLtv = new BigNumber(value).div(100).toString();

    setBorrowParams((prev) => {
      return {
        ...prev,
        ltv: nextLtv,
        borrow_amount: getNextBorrowAmount(prev.pledge_amount, nextLtv)
      };
    });
  };

  const handleAmountInput = (
    field: AmountField,
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = e.target;
    const precision =
      field === 'borrow_amount' ? borrowPrecision : pledgePrecision;

    if (!isValidAmountInput(value, precision)) return;

    if (field === 'borrow_amount') {
      onBorrowAmountChange(value);
      return;
    }

    onPledgeAmountChange(value);
  };

  const handleAmountBlur = (field: AmountField): void => {
    const value = borrowParams[field];
    if (!value) return;

    const normalizedValue = normalizeAmount(value);
    if (field === 'borrow_amount') {
      onBorrowAmountChange(normalizedValue);
      return;
    }

    onPledgeAmountChange(normalizedValue);
  };

  const handleMaxInput = (): void => {
    onPledgeAmountChange(
      new BigNumber(availablePledgeAmount)
        .decimalPlaces(pledgePrecision, BigNumber.ROUND_DOWN)
        .toFixed()
    );
  };

  /**
   * 确认借贷
   */
  const onConfirm = (): void => {
    if (!isLogin) {
      goPage('login');
      return;
    }
    if (isSubmitDisabled) return;

    setLoading(true);
    postLoanBorrow(borrowParams)
      .then((res:BorrowCallBackProp) => {
        setBorrowCompleteInfo({ ...res, duration_days: borrowParams.duration_days })
        setIsShowModal(false);
        setShowSuccessModal(true);
        triggerRefresh();
      }).catch(() => {
        setBorrowCompleteInfo(null)
      }).finally(() => {
        setLoading(false);
      });
  };

  const handleClose = (): void => {
    setBorrowParams((prev) => ({
      ...prev,
      borrow_amount: '',
      pledge_amount: '',
      ltv: pledgeCoin?.initial_pledge_rate || '0',
      automatic_replenishment: 0
    }));
    setChecked(false);
    setShowSuccessModal(false);
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

  const handleAutoAddConfirm = (): void => {
    setBorrowParams((prev) => ({
      ...prev,
      automatic_replenishment: prev.automatic_replenishment === 1 ? 0 : 1
    }));
    setShowAutoAddModal(false);
  };

  const handleBorrowCoinSelect = (coin: BorrowCoinConfig): void => {
    setBorrowCoin(coin);
    setShowBorrowCoinDropDown(false);
    resetAmounts({ borrow_coin: coin?.coin });
  };

  const handlePledgeCoinSelect = (coin: PledgeCoinConfig): void => {

    setPledgeCoin(coin);
    setShowPledgeCoinDropDown(false);
    resetAmounts({
      pledge_coin: coin?.coin,
      ltv: coin?.initial_pledge_rate || '0'
    });
  };

  const handleDurationChange = (value: string): void => {
    setBorrowParams((prev) => ({
      ...prev,
      duration_days: value,
      duration_type: value === '0' ? 'liquid' : 'fixed'
    }));
  };

  return (
    <>
      <Modal
        open={isShowModal}
        centered
        maskClosable={false}
        onCancel={undefined}
        closeIcon={null}
        width={440}
        footer={null}
        wrapClassName="custom-modal-wrapper"
      >
        <div className="relative py-2">
          <ModalHeader title={t('loan.buy')} onClose={handleClose} />

          <div className="flex flex-col justify-between items-start mt-6 gap-2 max-h-[534px] overflow-y-auto overflow-x-hidden *:shrink-0 pr-3">
            <FieldLabel
              title={t('loan.duration', '借款期限')}
              tooltip={t('loan.duration.tip')}
            />

            <Select
              className="global-select-style w-full h-10! bg-fill-input! rounded-lg"
              value={borrowParams.duration_days}
              onChange={handleDurationChange}
              popupMatchSelectWidth={false}
              menuItemSelectedIcon={<CheckIcon />}
              suffixIcon={<ArrowDownIcon />}
              options={[
                { label: t('loan_days_0'), value: '0', className: 'h-11 flex items-center' },
                { label: t('loan_days_7'), value: '7', className: 'h-11 flex items-center' },
                { label: t('loan_days_30'), value: '30', className: 'h-11 flex items-center' }
              ]}
            />

            <InfoRow
              label={t('loan.apr', '年化利率')}
              tooltip={borrowParams.duration_type === 'fixed' ? t('loan.fixed.apr.tip') : t('loan.apr.tip')}
              value={`${displayInterestRate} %`}
            />
            <InfoRow
              label={t('loan.hourInterest', '预估小时利息')}
              value={`${estimatedHourInterest} ${borrowCoin.coin.toLocaleUpperCase()}`}
            />

            <FieldLabel
              title={t('loan.amount', '借贷金额')}
              tooltip={t('loan.amount.tip')}
            />
            <div className="relative w-full">
              <Input
                className="h-10! bg-fill-input! global-input-style [&_input::placeholder]:text-sm"
                size="large"
                value={borrowParams.borrow_amount}
                placeholder={t('loan.borrow.amount.placeholder')}
                status={borrowErrorMsg ? 'error' : ''}
                onChange={(e) => handleAmountInput('borrow_amount', e)}
                onBlur={() => handleAmountBlur('borrow_amount')}
                maxLength={50}
                suffix={
                  <CoinSelector
                    coin={borrowCoin?.coin}
                    onClick={() => setShowBorrowCoinDropDown(true)}
                  />
                }
              />
              {borrowErrorMsg && (
                <div className="text-xs text-text-red h-5 mt-2">
                  {borrowErrorMsg}
                </div>
              )}
              <CoinSelectDropDown
                visible={showBorrowCoinDropDown}
                optionsList={sourceBorrowCoinList}
                selectedCoin={borrowCoin.coin}
                onSelect={handleBorrowCoinSelect}
                onClose={() => setShowBorrowCoinDropDown(false)}
              />
            </div>

            <FieldLabel
              title={t('loan.pledgeobj', '质押物')}
              tooltip={t('loan.pledgeobj.tip')}
            />
            <div className="relative w-full">
              <Input
                className="h-10! bg-fill-input! global-input-style [&_input::placeholder]:text-sm"
                size="large"
                value={borrowParams.pledge_amount}
                placeholder={t('loan.collateral.amount.placeholder')}
                status={pledgeErrorMsg ? 'error' : ''}
                onChange={(e) => handleAmountInput('pledge_amount', e)}
                onBlur={() => handleAmountBlur('pledge_amount')}
                maxLength={50}
                suffix={
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="text-text-brand-default text-xs cursor-pointer"
                      onClick={handleMaxInput}
                    >
                      {t('max')}
                    </div>
                    <CoinSelector
                      coin={pledgeCoin?.coin}
                      onClick={() => setShowPledgeCoinDropDown(true)}
                    />
                  </div>
                }
              />
              {pledgeErrorMsg && (
                <div className="text-xs text-text-red h-5 mt-2">
                  {pledgeErrorMsg}
                </div>
              )}
              <CoinSelectDropDown
                visible={showPledgeCoinDropDown}
                optionsList={supportedPledgeCoinList}
                selectedCoin={pledgeCoin?.coin}
                onSelect={handlePledgeCoinSelect}
                onClose={() => setShowPledgeCoinDropDown(false)}
              />
            </div>

            <div className="w-full flex justify-between items-center">
              <EarnTooltip title={t('availabelBalance.tip')}>
                <div className={SECONDARY_TEXT_CLASS}>
                  {t('availabelBalance', '可用余额')}
                </div>
              </EarnTooltip>
              <div className="flex items-center justify-center gap-1">
                <div className={SECONDARY_VALUE_CLASS}>
                  {toThousandsNumberNoZero(
                    availablePledgeAmount,
                    pledgePrecision
                  )}{' '}
                  {pledgeCoin?.coin}
                </div>
                <div className="cursor-pointer" onClick={handleAddAsset}>
                  <AddIcon />
                </div>
              </div>
            </div>

            <div className="relative w-full mt-4">
              <div className="text-sm text-text-primary mb-2">
                {t('loan.ajustltv', '调整质押率')}
              </div>
              <div className="w-full px-2">
                <LtvSlider
                  value={toValidBigNumber(borrowParams.ltv)
                    .times(100)
                    .dp(0, BigNumber.ROUND_DOWN)
                    .toNumber()}
                  onChange={handleLtvChange}
                  min={0}
                  max={toValidBigNumber(pledgeCoin?.initial_pledge_rate)
                    .times(100)
                    .dp(0, BigNumber.ROUND_DOWN)
                    .toNumber()}
                  step={1}
                />
              </div>
            </div>

            <div
              className="cursor-pointer flex justify-start items-center mt-4"
              onClick={() => setShowLtvModal(true)}
            >
              {t('loan.ltv', '质押率')}
              <CheckRightIcon className="text-text-brand-default" />
            </div>

            <LtvRateTable pledgeCoin={pledgeCoin} t={t} />

            <div className="w-full mt-4 flex justify-between items-center text-sm text-text-primary">
              <div>{t('loan.autoadd', '自动补仓')}</div>
              <Switch
                className="custom-small-switch"
                checked={automaticReplenishment}
                onChange={() => setShowAutoAddModal(true)}
              />
            </div>
            <div className="text-xs text-text-secondary leading-4 mt-2 text-left font-normal">
              {t('loan.autoadd.tip')}
            </div>

          </div>
          <div className="flex justify-start items-center gap-1 pt-6 pr-3">
            <Checkbox
              checked={checked}
              onChange={() => setChecked((prev) => !prev)}
            />
            <div className="text-xs text-text-secondary">
              <FormattedMessage
                id="checkLoanDoc"
                values={{
                  a: (chunks) => (
                    <a
                      className="cursor-pointer text-text-brand-default! ml-px"
                      href={t('earn-loan-doc') || LOAN_DOC_FALLBACK_URL}
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

          <div className="w-full pr-3">
            <button
              className={`w-full h-10 mt-4 rounded-lg text-sm font-medium cursor-pointer
                ${
                  isLogin && isSubmitDisabled
                    ? 'bg-fill-button-primary-disabled text-neutral-300'
                    : 'bg-fill-button-primary-default text-text-white hover:bg-fill-button-primary-hover'
                }`}
              disabled={isSubmitDisabled}
              onClick={onConfirm}
            >
              {t('sure-loan')}
            </button>
          </div>

        </div>
      </Modal>

      <SuccessModal
        type="borrow"
        open={showSuccessModal}
        params={borrowCompleteInfo}
        close={handleClose}
      />

      <AddAssetsModal
        coin={pledgeCoin?.coin}
        open={showAddAssetsModal}
        close={handleAssetModalClose}
      />

      <AutoAddModal
        isClose={automaticReplenishment}
        open={showAutoAddModal}
        onCancel={() => setShowAutoAddModal(false)}
        onConfirm={handleAutoAddConfirm}
      />

      <LtvInfoModal
        open={showLtvModal}
        onCancel={() => setShowLtvModal(false)}
      />
    </>
  );
};

export default LoanModal;
