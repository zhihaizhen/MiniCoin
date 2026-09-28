import { message } from 'common/antdComponents';
import { toThousandsNumberNoZero } from 'common/utils/utils';
import { localDateTime } from '@unified/helpers';
import PositionTab from 'common/components/Positions/positions-tab/index';
import copy from 'copy-to-clipboard';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EntrustFilterTabs from '../EntrustFilterTabs';
import useOrderStore from '@/store-hooks/use-order-store';
import { useGlobalState } from '@/store';
import {
  normalizeEntrustItem,
  filterByCurrentSymbol,
} from 'common/components/NewTpsl/utils/normalize-entrust';
import { filterTabList, TAB_KEY, getPlanOrderStatusText } from '../../constant';
import Styles from '../index.module.less';

// 展示兜底去重：同一笔订单可能被后端多次推送终态，导致同一 orderKey/orderId
// 在历史列表出现多条。按订单标识去重，保留首个（列表首项为最新状态）。
// 无有效标识（缺失 / 0）的记录不参与去重，原样保留，避免误合并。
const dedupeByOrderKey = (list) => {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).filter((item) => {
    const rawKey = item?.orderKey ?? item?.orderId;
    if (rawKey == null || rawKey === '' || String(rawKey) === '0') return true;
    const key = String(rawKey);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const HistoryEntrust = (props) => {
  const { tab, showCurSymbol, filterType } = props;
  const [state] = useGlobalState();
  const { position } = state;
  const [t] = useTranslation();
  // 限价/市价历史：order 家族（camelCase profitPrice/stopPrice）
  const { historyEntrustList } = useOrderStore();
  // 计划委托 / 止盈止损历史：plan_order/history_orders 合集按 plan_type 拆桶
  const { historyPlanList, historyTpslList } = position;

  const [tabValue, setTabValue] = useState(TAB_KEY.LIMIT);

  const isPlanTab = tabValue === TAB_KEY.TRIGGER;
  const isTpslTab = tabValue === TAB_KEY.TPSL;

  const handleFilterTabChange = (e) => {
    setTabValue(e.target.value);
  };

  // 「仅当前交易对」开关：filterType 为空时视为关闭，展示全集
  const onlyCurrent = Boolean(showCurSymbol && filterType);

  // 三子 tab 归一化数据（统一读取内部字段 takeProfit/stopLoss/orderKey/status 等）：
  // - 限价/市价：order 家族；
  // - 计划委托 / 止盈止损：plan 家族合集，按 plan_type（NORMAL / PROFIT_OR_STOP）拆桶后归一化。
  const normalizedMap = useMemo(() => {
    const orderList = historyEntrustList?.data || [];
    const planList = historyPlanList?.data || [];
    const tpslList = historyTpslList?.data || [];
    return {
      [TAB_KEY.LIMIT]: dedupeByOrderKey(
        orderList.map((it) => normalizeEntrustItem(it, 'order')),
      ),
      [TAB_KEY.TRIGGER]: dedupeByOrderKey(
        planList.map((it) => normalizeEntrustItem(it, 'plan')),
      ),
      [TAB_KEY.TPSL]: dedupeByOrderKey(
        tpslList.map((it) => normalizeEntrustItem(it, 'plan')),
      ),
    };
  }, [historyEntrustList, historyPlanList, historyTpslList]);

  // 子 tab 数量徽标：按「仅当前交易对」过滤后的记录条数同步（R8.7/8.10）
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

  const data = useMemo(
    () =>
      filterByCurrentSymbol(
        normalizedMap[tabValue] || [],
        filterType,
        onlyCurrent,
      ),
    [normalizedMap, tabValue, filterType, onlyCurrent],
  );

  const handleCopyOrderId = async (id) => {
    copy(id);
    message.success(t('copied'));
  };

  // 止盈止损列（限价市价子 tab，只读；order/history_orders）：
  // - 两侧都没值 → 单个「--」
  // - 单侧没值 → 该行仅「--」（不带止盈/止损前缀）
  // - 为 0 →「止盈/止损 市价」；其他 →「止盈/止损 {价格}」
  const tpslColumn = {
    name: t('tpsl'),
    key: 'takeProfit',
    render: (trData) => {
      // order 家族：接口 camelCase profitPrice/stopPrice；normalize 后另有 takeProfit/stopLoss
      const tp = trData.profitPrice ?? trData.takeProfit;
      const sl = trData.stopPrice ?? trData.stopLoss;
      const isEmptySide = (value) => value == null || value === '';
      const formatSide = (labelKey, value) => {
        if (isEmptySide(value)) return '--';
        if (Number(value) === 0) {
          return `${t(labelKey)} ${t('marketType')}`;
        }
        return `${t(labelKey)} ${toThousandsNumberNoZero(value)}`;
      };
      if (isEmptySide(tp) && isEmptySide(sl)) {
        return <span>--</span>;
      }
      return (
        <span className={Styles.tpslStack}>
          <span className={isEmptySide(tp) ? undefined : Styles.tpslTp}>
            {formatSide('takeProfit', tp)}
          </span>
          <span className={isEmptySide(sl) ? undefined : Styles.tpslSl}>
            {formatSide('stopLoss', sl)}
          </span>
        </span>
      );
    },
  };

  // 状态列：限价市价沿用后端 status；止盈止损/计划委托映射为中文状态文案，
  // 未知状态值经 getPlanOrderStatusText 回退为空字符串，不中断渲染
  // 已触发（TRIGGERED）用绿色强调
  const statusColumn = {
    name: isTpslTab || isPlanTab ? t('orderStatusColumn') : t('status'),
    key: 'status',
    render: ({ status }) =>
      isTpslTab || isPlanTab ? (
        <span
          className={
            status === 'TRIGGERED' ? Styles.statusTriggered : undefined
          }
        >
          {t(getPlanOrderStatusText(status))}
        </span>
      ) : (
        <span>{t(status)}</span>
      ),
  };
 
  // 总的列注册表：统一维护所有可用列，按子 tab 布局按需引用
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
      render: (trData) => (
        <span className={Styles[trData.side]}>{t(trData.side)}</span>
      ),
    };
    // 成交均价（限价市价）
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
    // - 止盈止损：止盈 = profit_price_type + profit_price，止损 = stop_price_type + stop_price；
    //   type=MARKET 时后端价格为 0，前端展示「市价」；否则展示对应价格；空侧用 --
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

        if (tabValue !== TAB_KEY.TPSL) {
          return <span>{plainPrice}</span>;
        }

        // 委托价与触发价对齐：无对应触发价时该侧委托价也展示 --
        const hasTp = !!Number(triggerProfitPrice);
        const hasSl = !!Number(triggerStopPrice);
        // MARKET →「市价」（后端价格为 0）；否则展示该侧价格
        const formatSidePrice = (priceType, sidePrice) => {
          if (String(priceType || '').toUpperCase() === 'MARKET') {
            return t('marketType');
          }
          if (Number(sidePrice)) return toThousandsNumberNoZero(sidePrice);
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
    // 已成交（限价市价）
    const executedColumn = {
      name: t('orderStatusFilled'),
      key: 'executedQty',
      render: ({ executedQty, baseTokenName }) => (
        <span>
          {toThousandsNumberNoZero(executedQty)} {baseTokenName}
        </span>
      ),
    };
    // 限价市价：已成交价值（filledAmount）；止盈止损 / 计划委托：实际委托价值（actualOrderAmount）
    const executedAmountColumn = {
      name:
        isTpslTab || isPlanTab ? t('actualOrderAmount') : t('filledAmount'),
      key: 'executedAmount',
      render: ({ executedAmount, quoteTokenName }) => (
        <span>
          {toThousandsNumberNoZero(executedAmount)} {quoteTokenName}
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
    // 触发价（止盈止损子 tab）：trigger_profit_price / trigger_stop_price，双边上下两行
    const tpslTriggerPriceColumn = {
      name: t('triggerPrice'),
      key: 'tpslTriggerPrice',
      render: ({ triggerProfitPrice, triggerStopPrice, quoteTokenName }) => {
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
    // 实际触发方向（止盈止损历史：plan_type_detail）
    // TAKE_PROFIT → 止盈；STOP_LOSS → 止损；NORMAL / 其他 → --
    const actualTriggerDirectionColumn = {
      name: t('actualTriggerDirection'),
      key: 'planTypeDetail',
      render: ({ planTypeDetail }) => {
        if (planTypeDetail === 'TAKE_PROFIT') {
          return <span className={Styles.tpslTp}>{t('takeProfit')}</span>;
        }
        if (planTypeDetail === 'STOP_LOSS') {
          return <span className={Styles.tpslSl}>{t('stopLoss')}</span>;
        }
        return <span>--</span>;
      },
    };
    // 委托价值（限价/市价：quoteAmount；计划/止盈止损历史：entrusted_value → quoteAmount）
    const quoteAmountColumn = {
      name: t('entrustAmount'),
      key: 'quoteAmount',
      render: ({ quoteAmount, quoteTokenName, origQty, price }) => {
        const value =
          quoteAmount != null && quoteAmount !== ''
            ? quoteAmount
            : Number(origQty) * Number(price);
        return (
          <span>{`${toThousandsNumberNoZero(value)} ${quoteTokenName}`}</span>
        );
      },
    };
    // 委托类型
    const typeColumn = {
      name: t('orderType'),
      key: 'type',
      render: ({ type }) => (
        <span>{t(`${String(type).toLowerCase()}Order`)}</span>
      ),
    };
    // 委托编号（限价市价用 orderId；止盈止损 plan 家族优先 orderId，缺失时回退 orderKey）
    const orderIdColumn = {
      name: t('orderId'),
      key: 'orderId',
      render: (trData) => {
        const id = trData.orderId || trData.orderKey;
        if (!id || String(id) === '0') return <span>--</span>;
        return (
          <span
            className={Styles.orderId}
            onClick={() => handleCopyOrderId(id)}
          >
            {String(id).substr(-8)}
            <span className={Styles.copyImg} />
          </span>
        );
      },
    };
    // 实际委托价（计划委托历史：submit_price）
    // 市价计划委托的 submit_price 后端恒为 0（未修复），故限价单直接取 submit_price 展示；
    // 市价单在「已触发」状态下按「市价」展示，其余状态（未触发/已撤销/已过期/已失败）
    // 因没有实际成交价参考，仍展示 --。
    const actualPriceColumn = {
      name: t('actualOrderPrice'),
      key: 'actualPrice',
      render: ({ actualPrice, quoteTokenName, type, status }) => {
        const isMarket = String(type).toUpperCase() === 'MARKET';
        if (isMarket) {
          return <span>{status === 'TRIGGERED' ? t('marketType') : '--'}</span>;
        }
        if (!Number(actualPrice)) return <span>--</span>;
        return (
          <span>
            {toThousandsNumberNoZero(actualPrice)} {quoteTokenName}
          </span>
        );
      },
    };
    // 实际委托数量（计划委托历史：submit_quantity）
    const actualQtyColumn = {
      name: t('actualOrderQty'),
      key: 'actualQty',
      render: ({ actualQty, baseTokenName }) => {
        if (!Number(actualQty)) return <span>--</span>;
        return (
          <span>
            {toThousandsNumberNoZero(actualQty)} {baseTokenName}
          </span>
        );
      },
    };

    // 列注册表：统一维护所有可用列，按子 tab 布局按需引用
    const columnMap = {
      symbol: symbolColumn,
      time: timeColumn,
      side: sideColumn,
      avgPrice: avgPriceColumn,
      price: priceColumn,
      executed: executedColumn,
      executedAmount: executedAmountColumn,
      qty: qtyColumn,
      triggerPrice: triggerPriceColumn,
      tpslTriggerPrice: tpslTriggerPriceColumn,
      quoteAmount: quoteAmountColumn,
      actualTriggerDirection: actualTriggerDirectionColumn,
      actualPrice: actualPriceColumn,
      actualQty: actualQtyColumn,
      type: typeColumn,
      tpsl: tpslColumn,
      orderId: orderIdColumn,
      status: statusColumn,
    };

    // 各子 tab 列布局：从左到右的列顺序（改动列时只需维护此处）
    const columnLayout = {
      // 限价市价：币对/时间/方向/成交均价/委托价/已成交/已成交价值/委托数量/委托价值/委托类型/止盈止损/订单号/状态
      [TAB_KEY.LIMIT]: [
        'symbol',
        'time',
        'side',
        'avgPrice',
        'price',
        'executed',
        'executedAmount',
        'qty',
        'quoteAmount',
        'type',
        'tpsl',
        'orderId',
        'status',
      ],
      // 止盈止损：币对/订单时间/方向/委托数量/触发价/委托价/委托价值/实际触发方向/实际委托价/实际委托数量/实际委托价值/订单状态
      [TAB_KEY.TPSL]: [
        'symbol',
        'time',
        'side',
        'qty',
        'tpslTriggerPrice',
        'price',
        'quoteAmount',
        'actualTriggerDirection',
        'actualPrice',
        'actualQty',
        'executedAmount',
        'status',
      ],
      // 计划委托：币对/订单时间/方向/委托数量/触发价/委托价格/委托价值/实际委托价/实际委托数量/实际委托价值/订单状态
      [TAB_KEY.TRIGGER]: [
        'symbol',
        'time',
        'side',
        'qty',
        'triggerPrice',
        'price',
        'quoteAmount',
        'actualPrice',
        'actualQty',
        'executedAmount',
        'status',
      ],
    };

    const layout = columnLayout[tabValue] || columnLayout[TAB_KEY.LIMIT];
    return layout.map((key) => columnMap[key]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, tabValue]);

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
        innerClass={Styles['history-entrust']}
      />
    </div>
  );
};

HistoryEntrust.propTypes = {
  tab: PropTypes.object.isRequired,
};
export default HistoryEntrust;
