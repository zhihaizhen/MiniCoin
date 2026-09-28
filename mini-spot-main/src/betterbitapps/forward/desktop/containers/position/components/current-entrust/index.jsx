import { Tooltip } from 'antd';
import { message } from 'common/antdComponents';
import { toThousandsNumberNoZero } from 'common/utils/utils';
import { localDateTime } from '@unified/helpers';
import PositionTab from 'common/components/Positions/positions-tab/index';
import { TpSlItem } from 'common/global/TpSlItem';
import {
  normalizeEntrustItem,
  filterSortWaitingPlans,
  filterByCurrentSymbol,
  getTpslEntryText,
} from 'common/components/NewTpsl/utils/normalize-entrust';
import copy from 'copy-to-clipboard';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CancelAll from '../cancel/CancelAll';
import CancelOrder from '../cancel/CancelOrder';
import EditTpsl from '../EditTpsl';
import EntrustFilterTabs from '../EntrustFilterTabs';
import useOrderStore from '@/store-hooks/use-order-store';
import { useGlobalState } from '@/store';
import { filterTabList, TAB_KEY, getPlanOrderStatusText } from '../../constant';
import Styles from '../index.module.less';

// 撤单类型（与 CancelAll/CancelOrder 协调）
const CANCEL_TYPE = {
  [TAB_KEY.LIMIT]: 'Activity',
  [TAB_KEY.TPSL]: 'Tpsl',
  [TAB_KEY.TRIGGER]: 'Plan',
};

const CurrentEntrust = (props) => {
  const { tab, showCurSymbol, filterType } = props;
  const [state] = useGlobalState();
  const { balanceFraction, position } = state;
  const [t] = useTranslation();
  const { currentEntrustList } = useOrderStore();
  const { currentPlanList, currentTpslList } = position;

  const [tabValue, setTabValue] = useState(TAB_KEY.LIMIT);
  const [editData, setEditData] = useState(null); // 编辑止盈止损弹窗数据

  const handleFilterTabChange = (e) => {
    setTabValue(e.target.value);
  };

  // 接口原始来源（接口未就绪时为 undefined，下方归一化对其健壮，不抛异常
  const orderSource = currentEntrustList?.data; // order/open_orders（family 'order'）
  // plan_order/open_orders 合集前端按 plan_type 拆桶：NORMAL → plan，PROFIT_OR_STOP → tpsl
  const planSource = currentPlanList?.data;
  const tpslSource = currentTpslList?.data;

  // 三子 tab 统一读取 normalizeEntrustItem 产出的内部字段（takeProfit/stopLoss/orderKey/isPlan）
  const normalizedMap = useMemo(() => {
    const orderList = Array.isArray(orderSource) ? orderSource : [];
    const planList = Array.isArray(planSource) ? planSource : [];
    const tpslList = Array.isArray(tpslSource) ? tpslSource : [];

    // 限价/市价：order/open_orders 归一化（family 'order'）
    const limit = orderList.map((it) => normalizeEntrustItem(it, 'order'));

    // 计划委托：合集中 plan_type=NORMAL，仅 WAITING 且按 plan_order_id 数值倒序
    const trigger = filterSortWaitingPlans(planList).map((it) =>
      normalizeEntrustItem(it, 'plan'),
    );

    // 止盈/止损：合集中 plan_type=PROFIT_OR_STOP
    const tpsl = filterSortWaitingPlans(tpslList).map((it) =>
      normalizeEntrustItem(it, 'plan'),
    );

    return {
      [TAB_KEY.LIMIT]: limit,
      [TAB_KEY.TPSL]: tpsl,
      [TAB_KEY.TRIGGER]: trigger,
    };
  }, [orderSource, planSource, tpslSource]);

  // 「仅当前交易对」开关：filterType 为空时视为关闭，展示全集
  const onlyCurrent = Boolean(showCurSymbol && filterType);

  // 子 tab 数量（徽标与列表渲染保持同一口径：均按「仅当前交易对」过滤后计数，
  // 避免徽标显示全量数、而 data 是过滤后的数据，导致数量与实际展示不一致）
  const getTabNum = useMemo(
    () => ({
      [TAB_KEY.LIMIT]: filterByCurrentSymbol(
        normalizedMap[TAB_KEY.LIMIT],
        filterType,
        onlyCurrent,
      ).length,
      [TAB_KEY.TPSL]: filterByCurrentSymbol(
        normalizedMap[TAB_KEY.TPSL],
        filterType,
        onlyCurrent,
      ).length,
      [TAB_KEY.TRIGGER]: filterByCurrentSymbol(
        normalizedMap[TAB_KEY.TRIGGER],
        filterType,
        onlyCurrent,
      ).length,
    }),
    [normalizedMap, filterType, onlyCurrent],
  );

  // 当前子 tab 数据（含「仅当前交易对」勾选过滤）
  const data = useMemo(() => {
    const list = normalizedMap[tabValue] || [];
    return filterByCurrentSymbol(list, filterType, onlyCurrent);
  }, [normalizedMap, tabValue, filterType, onlyCurrent]);

  const handleCopyOrderId = async (id) => {
    copy(id);
    message.success(t('copied'));
  };

  // 编辑止盈止损（当前委托可编辑）
  const openEditTpsl = (trData) => {
    // 计划委托且状态不为 WAITING 时不提供编辑入口
    if (trData?.isPlan && trData?.status !== 'WAITING') return;
    setEditData({ ...trData });
  };

  // 止盈止损列（限价市价子tab专用，可编辑）：双边上下两行，单边一行
  const tpslColumn = {
    name: t('tpsl'),
    key: 'takeProfit',
    render: (trData) => {
      const { takeProfit, stopLoss, isPlan, status } = trData;
      const family = isPlan ? 'plan' : 'order';
      const hasTpslValue = !!(Number(takeProfit) || Number(stopLoss));
      const tpNum = Number(takeProfit)
        ? toThousandsNumberNoZero(takeProfit)
        : '--';
      const slNum = Number(stopLoss) ? toThousandsNumberNoZero(stopLoss) : '--';
      // 计划委托且状态不为 WAITING：不渲染编辑入口（只读展示）
      // 止盈止损子 tab：止盈止损价不可编辑（只读展示）
      const canEdit =
        !(isPlan && status !== 'WAITING') && tabValue !== TAB_KEY.TPSL;
      // 入口文案（添加 / 编辑）
      const entryText = t(getTpslEntryText(trData, family));
      const tpslItem = (
        <TpSlItem
          hasTpsl={hasTpslValue}
          tpNum={tpNum}
          slNum={slNum}
          readonly={!canEdit}
          onAdd={() => openEditTpsl(trData)}
          onEdit={() => openEditTpsl(trData)}
        />
      );
      // 可编辑时以 tooltip 呈现「添加 / 编辑」入口文案
      return canEdit ? (
        <Tooltip title={entryText}>{tpslItem}</Tooltip>
      ) : (
        tpslItem
      );
    },
  };

  // 订单状态列（计划委托子 tab；当前委托均为待触发）
  const statusColumn = {
    name: t('orderStatusColumn'),
    key: 'status',
    render: (trData) => t(getPlanOrderStatusText(trData.status)),
  };

  // 订单状态列（止盈止损子 tab）：当前委托列表理应只含 WAITING（待触发）项，
  // 但 WS 推送触发/撤销等终态时是原地更新 status 字段、不保证一定先移出列表，
  // 读取真实 status 而非硬编码「待触发」，避免终态更新后 UI 无变化看起来像没订阅
  const tpslStatusColumn = {
    name: t('orderStatusColumn'),
    key: 'status',
    render: (trData) => t(getPlanOrderStatusText(trData.status)),
  };

  // 批量撤单列
  const cancelColumn = {
    name: (
      <CancelAll
        type={CANCEL_TYPE[tabValue]}
        list={data}
        filterValue={showCurSymbol ? filterType : ''}
      />
    ),
    key: 'options',
    class: 'fixLastColumn',
    tdStyle: { paddingRight: '23px' },
    render: (trData) => (
      <CancelOrder
        type={trData.type || 'activity'}
        orderKind={tabValue}
        trData={trData}
      />
    ),
  };

  // 列定义：按子 tab 组合不同列
  const trs = useMemo(() => {
    // 币对
    const symbolColumn = {
      name: t('Symbol'),
      key: 'symbolName',
      style: { whiteSpace: 'nowrap' },
      class: 'fixfirstColumn',
      render: (trData) => (
        <span>
          {trData.baseTokenName}/{trData.quoteTokenName}
        </span>
      ),
    };
    // 订单时间
    const timeColumn = {
      name: t('orderTime'),
      key: 'time',
      render: (trData) => <span>{localDateTime(Number(trData.time))}</span>,
    };
    // 方向
    const sideColumn = {
      name: t('tradeSide'),
      key: 'side',
      style: {
        width: '8%',
      },
      render: (trData) => (
        <span className={Styles[trData.side]}>{t(trData.side)}</span>
      ),
    };
    // 成交均价（止盈止损：接口 avg_price → normalize 后 avgPrice）
    const avgPriceColumn = {
      name: t('tradeAvgPrice'),
      key: 'avgPrice',
      render: ({ avgPrice, quoteTokenName }) => (
        <span>
          {toThousandsNumberNoZero(avgPrice)} {quoteTokenName}
        </span>
      ),
    };
    // 委托价格：
    // - 限价市价 / 计划委托：单行，市价展示「市价」，限价展示「价格 + 单位」
    // - 止盈止损子 tab：固定上下两行；止盈 = profit_price_type + profit_price，
    //   止损 = stop_price_type + stop_price；空侧用 --（与设计图对齐）
    const priceColumn = {
      name: t('orderPrice'),
      key: 'price',
      render: (trData) => {
        const {
          price,
          type,
          quoteTokenName,
          triggerProfitPrice,
          triggerStopPrice,
          takeProfit,
          stopLoss,
          profit_price_type: profitPriceType,
          stop_price_type: stopPriceType,
        } = trData;
        const isMarket =
          String(type).toUpperCase() === 'MARKET' || !Number(price);
        const plainPrice = isMarket
          ? t('marketType')
          : `${toThousandsNumberNoZero(price)} ${quoteTokenName || ''}`.trim();

        // 计划委托 / 限价市价：单行
        if (tabValue !== TAB_KEY.TPSL) {
          return <span>{plainPrice}</span>;
        }

        // 委托价与触发价对齐：无对应触发价时该侧委托价也展示 --
        const hasTp = !!Number(triggerProfitPrice);
        const hasSl = !!Number(triggerStopPrice);
        const formatSidePrice = (priceType, sidePrice) => {
          if (String(priceType || '').toUpperCase() === 'MARKET') {
            return t('marketType');
          }
          if (Number(sidePrice)) return toThousandsNumberNoZero(sidePrice);
          if (Number(price)) return toThousandsNumberNoZero(price);
          // 无分侧类型时回退订单 type（兼容旧数据）
          if (isMarket) return t('marketType');
          return '--';
        };
        if (!hasTp && !hasSl) return <span>{plainPrice}</span>;
        return (
          <span className={`${Styles.tpslStack} ${Styles.textPrimary}`}>
            <span>
              {hasTp
                ? `${t('takeProfit')} ${formatSidePrice(
                    profitPriceType,
                    takeProfit,
                  )}`
                : '--'}
            </span>
            <span>
              {hasSl
                ? `${t('stopLoss')} ${formatSidePrice(stopPriceType, stopLoss)}`
                : '--'}
            </span>
          </span>
        );
      },
    };
    // 已成交
    const executedColumn = {
      name: t('orderStatusFilled'),
      key: 'executedQty',
      render: ({ executedQty, baseTokenName }) => (
        <span>
          {toThousandsNumberNoZero(executedQty)} {baseTokenName}
        </span>
      ),
    };
    // 委托数量
    const qtyColumn = {
      name: t('entrustQty'),
      key: 'origQty',
      render: ({ origQty, baseTokenName }) => (
        <span>{`${toThousandsNumberNoZero(origQty)} ${baseTokenName}`}</span>
      ),
    };
    // 触发价（计划委托子 tab：单一触发价）
    const triggerPriceColumn = {
      name: t('triggerPrice'),
      key: 'triggerPrice',
      render: ({ triggerPrice, quoteTokenName }) => (
        <span>
          {toThousandsNumberNoZero(triggerPrice)} {quoteTokenName}
        </span>
      ),
    };
    // 触发价（止盈止损子 tab 专用）：trigger_profit_price / trigger_stop_price，
    // 固定上下两行（止盈绿 / 止损红），空侧用 --
    const tpslTriggerPriceColumn = {
      name: t('triggerPrice'),
      key: 'tpslTriggerPrice',
      render: (trData) => {
        const { triggerProfitPrice, triggerStopPrice, quoteTokenName } = trData;
        const unit = quoteTokenName || '';
        const tpNum = Number(triggerProfitPrice)
          ? `${toThousandsNumberNoZero(triggerProfitPrice)} ${unit}`.trim()
          : '--';
        const slNum = Number(triggerStopPrice)
          ? `${toThousandsNumberNoZero(triggerStopPrice)} ${unit}`.trim()
          : '--';
        return (
          <span className={Styles.tpslStack}>
            <span className={Styles.tpslTp}>{tpNum}</span>
            <span className={Styles.tpslSl}>{slNum}</span>
          </span>
        );
      },
    };
    // 委托价值
    const amountColumn = {
      name: t('entrustAmount'),
      key: 'origQtyAmount',
      render: ({ origQty, quoteTokenName, price }) => (
        <span>{`${toThousandsNumberNoZero(
          origQty * price,
          balanceFraction,
        )} ${quoteTokenName}`}</span>
      ),
    };
    // 委托类型
    const typeColumn = {
      name: t('orderType'),
      key: 'type',
      render: ({ type }) => (
        <span>{t(`${String(type).toLowerCase()}Order`)}</span>
      ),
    };
    // 订单号
    const orderIdColumn = {
      name: t('orderId'),
      key: 'orderId',
      render: (trData) => (
        <span
          className={Styles.orderId}
          onClick={() => handleCopyOrderId(trData.orderId)}
        >
          {String(trData.orderId).substr(-8)}
          <span className={Styles.copyImg} />
        </span>
      ),
    };

    // 列注册表：统一维护所有可用列，按子 tab 布局按需引用
    const columnMap = {
      symbol: symbolColumn,
      time: timeColumn,
      side: sideColumn,
      avgPrice: avgPriceColumn,
      price: priceColumn,
      executed: executedColumn,
      qty: qtyColumn,
      triggerPrice: triggerPriceColumn,
      tpslTriggerPrice: tpslTriggerPriceColumn,
      amount: amountColumn,
      type: typeColumn,
      tpsl: tpslColumn,
      tpslStatus: tpslStatusColumn,
      status: statusColumn,
      orderId: orderIdColumn,
      cancel: cancelColumn,
    };

    // 各子 tab 列布局：从左到右的列顺序（改动列时只需维护此处）
    const columnLayout = {
      // 限价市价：币对/时间/方向/委托价/已成交/委托数量/委托价值/委托类型/止盈止损/订单号/批量撤单
      [TAB_KEY.LIMIT]: [
        'symbol',
        'time',
        'side',
        'price',
        'executed',
        'qty',
        'amount',
        'type',
        'tpsl',
        'orderId',
        'cancel',
      ],
      // 止盈止损：币对/时间/方向/委托数量/触发价(止盈/止损两条)/委托价值/止盈止损/状态(待触发)/批量撤单
      [TAB_KEY.TPSL]: [
        'symbol',
        'time',
        'side',
        'qty',
        'tpslTriggerPrice',
        'price',
        'tpslStatus',
        'cancel',
      ],
      // 计划委托：币对/时间/方向/委托数量/触发价/委托价值/止盈止损/状态/批量撤单
      [TAB_KEY.TRIGGER]: [
        'symbol',
        'time',
        'side',
        'price',
        'qty',
        'triggerPrice',
        'status',
        'cancel',
      ],
    };

    const layout = columnLayout[tabValue] || columnLayout[TAB_KEY.LIMIT];
    return layout.map((key) => columnMap[key]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, balanceFraction, tabValue, data, showCurSymbol, filterType]);

  return (
    <div className={Styles.dataWrapper}>
      <EntrustFilterTabs
        tabList={filterTabList}
        value={tabValue}
        onChange={handleFilterTabChange}
        getTabNum={getTabNum}
      />
      <PositionTab
        tab={{ trs, ...tab }}
        data={data}
        innerClass={Styles['current-entrust']}
      />
      {/* 编辑止盈止损弹窗 */}
      <EditTpsl editData={editData} onClose={() => setEditData(null)} />
    </div>
  );
};

CurrentEntrust.propTypes = {
  tab: PropTypes.object.isRequired,
};
export default CurrentEntrust;
