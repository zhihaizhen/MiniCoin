import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useFm } from '@better-bit-fe/base-hooks';
import { getSymbolUrl } from '@better-bit-fe/base-utils';
import { message, Segmented, Spin, Switch } from 'antd';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { getActiveOrders, postAutomaticReplenishment } from '~/api/loan';
import { LoanOrderProp } from '~/interface';
import { ReactComponent as ArrowDownIcon } from '~/public/images/down.svg';
import EarnTooltip from '~/components/Common/EarnTooltip';
import EmptyState from '~/components/Common/EmptyState';
import { OrderStatusEnum } from '~/enums';
import LoanLtvGauge from '~/components/Loan/InprogressOrders/LoanLtvGauge';
import RepayFixedModal from '~/components/Common/LoanModal/RepayFixedModal';
import RepayLiquidModal from '~/components/Common/LoanModal/RepayLiquidModal';
import AutoAddModal from '~/components/Common/LoanModal/AutoAddModal';
import AdjustLtvModal from '~/components/Common/LoanModal/AdjustLtv';
import { formatAmount } from '~/utils';

const DURATION_TYPES = ['liquid', 'fixed'] as const;
type DurationType = typeof DURATION_TYPES[number];

const formatRate = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return '-';

  const rate = new BigNumber(+value);
  if (!rate.isFinite()) return '-';

  const percent = rate.abs().lte(1) ? rate.times(100) : rate;
  return `${percent.toFixed(2)}%`;
};

/**
 * 计息时间 = 计息开始时间到当前时间的小时数，不足一小时按一小时算
 * @param interestStartCalcAt
 * @param maturityAt 定期质押，还款中或者已强平，要用maturityAt
 * @param t
 */
const formatInterestDuration = (
  interestStartCalcAt?: number,
  maturityAt?: number,
  t?: (key: string, defaultMessage?: string) => string
) => {
  const SECONDS_IN_HOUR = 3600000;
  const startAt = new BigNumber(interestStartCalcAt)
    .div(SECONDS_IN_HOUR)
    .integerValue(BigNumber.ROUND_FLOOR)
    .multipliedBy(SECONDS_IN_HOUR);

  let endAtSt = Date.now();
  if (maturityAt !== undefined && maturityAt > 0) { // 定期质押，还款中或者已强平，要用maturityAt
    endAtSt = Math.min(endAtSt, maturityAt);
  }
  const endAt = new BigNumber(endAtSt)
    .div(SECONDS_IN_HOUR)
    .integerValue(BigNumber.ROUND_UP)
    .multipliedBy(SECONDS_IN_HOUR);

  if (!startAt.gt(0)) return '-';

  const durationHours = endAt.minus(startAt).div(SECONDS_IN_HOUR).integerValue(BigNumber.ROUND_UP);
  if (!durationHours.gte(0)) return '-';

  const days = durationHours.div(24).integerValue(BigNumber.ROUND_FLOOR);
  const hours = durationHours.mod(24);

  return `${days.toString()}${t('day')}${hours.toString()}${t('hour')}`;
};

const InprogressOrders: React.FC = () => {
  const t = useFm();
  const router = useRouter();
  const [durationType, setDurationType] = useState<DurationType>('liquid');
  const [orderList, setOrderList] = useState<LoanOrderProp[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<number>();
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [showFixedRepayModal, setShowFixedRepayModal] = useState(false);
  const [showLiquidRepayModal, setShowLiquidRepayModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<LoanOrderProp | null>(
    null
  );
  const [showAutoAddModal, setShowAutoAddModal] = useState(false);
  const [showAdjustLtvModal, setShowAdjustLtvModal] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const queryDurationType = router.query.durationType;
    const nextDurationType = Array.isArray(queryDurationType)
      ? queryDurationType[0]
      : queryDurationType;

    if (DURATION_TYPES.includes(nextDurationType as DurationType)) {
      setDurationType(nextDurationType as DurationType);
    }
  }, [router.isReady, router.query.durationType]);

  const handleDurationTypeChange = (value: DurationType) => {
    setDurationType(value);
  };

  const refreshOrderList = useCallback(() => {
    setListLoading(true);
    return getActiveOrders({ duration_type: durationType })
      .then((res) => {
        setOrderList(Array.isArray(res) ? res : []);
      })
      .finally(() => {
        setListLoading(false);
      });
  }, [durationType]);

  useEffect(() => {
    void refreshOrderList();
  }, [refreshOrderList]);

  const getStatusText = (status: OrderStatusEnum) => {
    const statusMap: Record<OrderStatusEnum, string> = {
      [OrderStatusEnum.ACTIVE]: t('in-progress', '进行中'),
      [OrderStatusEnum.REPAYING]: t('loan.status.repaying', '还款中'),
      [OrderStatusEnum.REPAID]: t('loan.status.repaid', '已还款'),
      [OrderStatusEnum.OVERDUE]: t('loan.status.overdue', '已逾期'),
      [OrderStatusEnum.LIQUIDATED]: t('loan.status.liquidated', '已强平')
    };

    return statusMap[status] || status;
  };

  const getMaturityText = (order: LoanOrderProp) => {
    if (!order.maturity_at) return t('liquid', '活期');

    const duration = order.duration_days
      ? `${order.duration_days}${t('day')}`
      : '';

    return `${dayjs(order.maturity_at).format('YYYY-MM-DD HH:mm')} ${duration}`;
  };

  const handleAutoReplenishment = async (order: LoanOrderProp) => {
    setSelectedOrder(order);
    setSwitchingId(order.position_id);
    setShowAutoAddModal(true);
  };

  const handleToggleDetail = (positionId: number) => {
    setExpandedOrderIds((ids) =>
      ids.includes(positionId)
        ? ids.filter((id) => id !== positionId)
        : [...ids, positionId]
    );
  };

  const onRepay = (order: LoanOrderProp) => () => {
    setSelectedOrder(order);
    if (order.duration_type === 'liquid') setShowLiquidRepayModal(true);
    else setShowFixedRepayModal(true);
  };

  const onAdjustLtv = (order: LoanOrderProp) => () => {
    setSelectedOrder(order);
    setShowAdjustLtvModal(true);
  };

  const handleAutoAddConfirm = async () => {
    setShowAutoAddModal(false);
    try {
      if (!selectedOrder) return;

      const checked = selectedOrder?.automatic_replenishment === 0;
      await postAutomaticReplenishment({
        duration_type: selectedOrder.duration_type,
        position_id: selectedOrder.position_id,
        automatic_replenishment: checked ? 1 : 0
      });

      await refreshOrderList();
      void message.success(t('operationSuccess', '操作成功'));
    } finally {
      setSwitchingId(undefined);
      setSelectedOrder(null);
    }
  };
  const handleAutoAddCancel = () => {
    setSwitchingId(undefined);
    setShowAutoAddModal(false);
    setSelectedOrder(null);
    void refreshOrderList();
  };
  const handleFixedRepayClose = () => {
    setShowFixedRepayModal(false);
    setSelectedOrder(null);
    void refreshOrderList();
  };
  const handleLiquidRepayClose = () => {
    setShowLiquidRepayModal(false);
    setSelectedOrder(null);
    void refreshOrderList();
  };
  const handleAdjustLtvClose = () => {
    setShowAdjustLtvModal(false);
    setSelectedOrder(null);
    void refreshOrderList();
  };
  return (
    <div className="w-full">
      <Segmented
        value={durationType}
        style={{ marginBottom: 24 }}
        onChange={(value) => handleDurationTypeChange(value as DurationType)}
        options={[
          { label: t('liquid', '活期'), value: 'liquid' },
          { label: t('fixed', '定期'), value: 'fixed' }
        ]}
      />

      <Spin spinning={listLoading}>
        <div className="flex min-h-[160px] flex-col gap-4">
          {!listLoading && !orderList.length ? (
            <EmptyState />
          ) : (
            orderList.map((order) => {
            const isExpanded = expandedOrderIds.includes(order.position_id);

            return (
              <div
                key={order.position_id}
                className="rounded-2xl border border-line-border-default bg-bg-primary p-6 text-sm"
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.5fr_2fr_1fr_124px] md:items-start md:gap-8 text-sm leading-5 py-4">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                      <Image
                        src={getSymbolUrl(order.borrow_coin || '')}
                        alt={order.borrow_coin}
                        width={24}
                        height={24}
                        loader={({ src }) => src}
                      />
                      <div>
                        <EarnTooltip title={t('loan.total.tip')}>
                          <div className="text-text-secondary">
                            {t('loan.total', '总负债')} ({order.borrow_coin})
                          </div>
                        </EarnTooltip>

                      <div className="font-medium text-text-primary">
                        {formatAmount(order.total_borrow_amount)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Image
                      src={getSymbolUrl(order.pledge_coin)}
                      alt={order.pledge_coin}
                      width={24}
                      height={24}
                      loader={({ src }) => src}
                    />
                    <div>
                      <div className="text-text-secondary">
                        {t('loan.pledgeobj', '质押物')} ({order.pledge_coin})
                      </div>
                      <div className="font-medium text-text-primary">
                        {formatAmount(order.pledge_amount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-text-secondary">
                      {t('loan.remaining_principal_interest', '剩余本金/利息')}{' '}
                      ({order.borrow_coin})
                    </div>
                    <div className="font-medium text-text-primary">
                      {formatAmount(
                        order.unpaid_principal,
                        order.pledge_coin_precision_digits
                      )}{' '}
                      /{' '}
                      {formatAmount(
                        order.unpaid_interest,
                        order.pledge_coin_precision_digits
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-text-secondary">
                      {t('loan.maturity_duration', '到期时间 (期限)')}
                    </div>
                    <div className="font-medium text-text-primary">
                      {getMaturityText(order)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-text-secondary">
                      {t('status', '状态')}
                    </div>
                    <div className={`font-medium ${
                        order.order_status === OrderStatusEnum.REPAYING
                          ? 'text-yellow-500'
                            : order.order_status === OrderStatusEnum.OVERDUE ||order.order_status === OrderStatusEnum.LIQUIDATED
                              ? 'text-function-red'
                              : 'text-text-brand-default-web'
                    }`}>
                      {getStatusText(order.order_status)}
                    </div>
                  </div>

                  <div>
                    <EarnTooltip title={t('loan.ltv.tip')}>
                      <span className="text-text-secondary">
                        {t('loan.ltv', '质押率')}
                      </span>
                    </EarnTooltip>
                    <div className={`font-medium   ${order.risk_level === 'liquidation' ? 'text-function-red' :
                      order.risk_level === 'warning' ? 'text-yellow-500' : 'text-text-brand-default-web'}`}>
                      {formatRate(order.current_ltv)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-4 md:items-end">
                  <button
                    type="button"
                    onClick={onRepay(order)}
                    className="h-10 min-w-[92px] rounded-lg bg-fill-button-brand-default px-5 text-sm font-medium text-text-primary cursor-pointer"
                  >
                    {t('loan.repay', '还款')}
                  </button>
                  <button
                    type="button"
                    onClick={onAdjustLtv(order)}
                    className="h-10 min-w-[92px] rounded-lg bg-bg-secondary px-4 text-sm font-medium text-text-primary cursor-pointer"
                  >
                    {t('loan.ajustltv', '调整质押率')}
                  </button>
                  <div className="flex items-center gap-2">
                    <EarnTooltip title={t('loan.autoadd.tip')}>
                      <div className="text-text-primary">
                        {t('loan.autoadd', '自动补仓')}
                      </div>
                    </EarnTooltip>
                    <Switch
                      className="custom-small-switch"
                      checked={order.automatic_replenishment === 1}
                      loading={switchingId === order.position_id}
                      onChange={() => handleAutoReplenishment(order)}
                    />
                  </div>
                </div>
              </div>

              <div
                className="mt-3 flex items-center justify-center gap-1 text-xs text-text-secondary cursor-pointer"
                onClick={() => handleToggleDetail(order.position_id)}
              >
                {isExpanded
                  ? t('loan.hide_detail', '收起详情')
                  : t('loan.expand_detail', '展开详情')}
                <ArrowDownIcon
                  className={`transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>

              <div
                className={`${
                  isExpanded ? 'grid' : 'hidden'
                } grid-cols-1 gap-4 md:grid-cols-[1.5fr_2fr_1fr_220px] md:items-start md:gap-8 text-sm leading-5 p-4 bg-bg-secondary rounded-lg mt-4`}
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-text-secondary">
                      {t('loan.time', '借款时间')} ({order.borrow_coin})
                    </div>
                    <div className="font-medium text-text-primary">
                      {dayjs(order.created_at).format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                  </div>

                  <div>
                    <div className="text-text-secondary">
                      {t('loan.interesttime', '计息时间')}
                    </div>
                    <div className="font-medium text-text-primary">

                      {formatInterestDuration(order.interest_start_at, order.maturity_at, t)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <EarnTooltip title={t('hour-rate-tip')}>
                      <span className="text-text-secondary">
                        {t('hour-rate', '小时/年化利率')}
                      </span>
                    </EarnTooltip>

                    <div className="font-medium text-text-primary">
                      {formatAmount(+order.hour_rate * 100, 4)} % /{' '}
                      {formatAmount(+order.year_rate * 100, 4)} %
                    </div>
                  </div>

                  <div>
                    <div className="text-text-secondary">
                      {t('loan.forceprice', '强平质押率/强平价')}
                    </div>
                    <div className="font-medium text-text-primary">
                      {formatAmount(+order.liquidation_ltv * 100, 4)} % /{' '}
                      {formatAmount(
                        order.liquidation_price,
                        order.pledge_coin_precision_digits
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <EarnTooltip title={t('loan.warnprice.tip')}>
                      <span className="text-text-secondary">
                        {t('loan.warnprice', '预警质押率/预警价')} (
                        {order.borrow_coin})
                      </span>
                    </EarnTooltip>
                    <div className="font-medium text-text-primary">
                      {formatAmount(+order.warning_ltv * 100, 4)} % /{' '}
                      {formatAmount(
                        order.warning_price,
                        order.pledge_coin_precision_digits
                      )}
                    </div>
                  </div>
                </div>
                <LoanLtvGauge
                  level={order.risk_level}
                  progress={new BigNumber(order.current_ltv)
                    .div(order.liquidation_ltv)
                    .toNumber()}
                  centerNumber={formatRate(order.current_ltv)}
                  footer={
                    <div className="flex items-baseline gap-2 whitespace-nowrap text-sm">
                      <span className="text-text-secondary">
                        {order.borrow_coin}/{order.pledge_coin}
                      </span>
                      <span className="font-medium text-text-primary">
                        {order.current_pledge_price}
                      </span>
                    </div>
                  }
                />
              </div>
            </div>
          );
            })
          )}
        </div>
      </Spin>
      <RepayFixedModal
        order={selectedOrder}
        open={showFixedRepayModal}
        close={handleFixedRepayClose}
      />
      <RepayLiquidModal
        order={selectedOrder}
        open={showLiquidRepayModal}
        close={handleLiquidRepayClose}
      />
      <AutoAddModal
        isClose={selectedOrder?.automatic_replenishment === 1}
        open={showAutoAddModal}
        onCancel={handleAutoAddCancel}
        onConfirm={handleAutoAddConfirm}
      />
      <AdjustLtvModal
        order={selectedOrder}
        open={showAdjustLtvModal}
        close={handleAdjustLtvClose}
      />
    </div>
  );
};

export default InprogressOrders;
