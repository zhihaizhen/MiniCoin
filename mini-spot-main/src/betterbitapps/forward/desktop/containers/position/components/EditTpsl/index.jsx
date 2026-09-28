import cls from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber, Modal, message } from 'common/antdComponents';
import { If } from 'common/global/tsx-control-statement/index.d';
import {
  ORDER_ACTION,
  ORDER_TYPE,
  TP_SL_FORM_FIELDS,
  TP_SL_MODE,
} from 'common/packages-biz/global-settings/usdt-settings';
import { toThousandsNumberNoZero } from 'common/utils/utils';
import { clampPrecision } from 'common/components/NewTpsl/utils/clamp-precision';
import { buildTpslApiParams } from 'common/components/NewTpsl/utils/build-tpsl-params';
import { normalizeEntrustItem } from 'common/components/NewTpsl/utils/normalize-entrust';
import { getReferencePrice } from 'common/components/NewTpsl/utils/reference-price';
import { validateTpsl } from 'common/components/NewTpsl/utils/tpsl-validator';
import useAllSymbolQuoteStream from 'common/public-ws/stream-hooks/use-allSymbolQuote-stream';
import { updateOrderTpsl, updatePlanOrderTpsl } from '@/services/order.service';
import { useConfigBySymbol } from '@/store-hooks/use-symbol-config';
import Styles from './index.module.less';

// 现货报价单位（触发价/只读信息均以报价币计，PRD 固定 USDT）
const QUOTE_UNIT = 'USDT';

// 触发价合法范围（0.01 ~ 999,999,999.99，含端点）
const TRIGGER_MIN = 0.01;
const TRIGGER_MAX = 999999999.99;

// 触发价是否为空（空字符串 / null / undefined 视为空）
const isEmpty = (value) =>
  value === undefined || value === null || value === '';

// 单侧触发价校验：非空时需为数字且落在 [0.01, 999,999,999.99] 范围内
const isTriggerValid = (value) => {
  if (isEmpty(value)) return true;
  const num = Number(value);
  return Number.isFinite(num) && num >= TRIGGER_MIN && num <= TRIGGER_MAX;
};

/**
 * 编辑「已存在委托单」的止盈止损弹窗（仅当前委托用）。
 *
 * 简化编辑形态（不复用已删除的高级弹窗）：去掉价格类型选择、委托价、委托模式，
 * 仅保留止盈、止损两个「市价」触发价输入框。触发价无论限价/市价还是计划委托，
 * 均映射为接口入参 `profit_price` / `stop_price`（snake_case），按家族提交：
 *  - 计划委托（plan）→ plan_order/update，入参 { symbol_id, plan_order_id, profit_price?, stop_price? }
 *  - 限价/市价（order）→ order/update，入参 { symbol_id, order_id, profit_price?, stop_price? }
 *
 * 交互约束：打开时以委托单现有触发价回填；两侧均可为空且允许提交（用于清除已设置的止盈止损）；
 * 「确定」时仅对非空侧做校验——需为数字且在合法范围内，校验失败阻止提交并保留输入。
 */
const EditTpsl = ({ editData, onClose }) => {
  const [t] = useTranslation('spot');

  const order = editData || {};
  const isPlan = !!order.isPlan;
  const family = isPlan ? 'plan' : 'order';

  // 归一化产出内部统一字段（takeProfit/stopLoss/orderKey 等）
  const normalized = useMemo(
    () => normalizeEntrustItem(order, family),
    [order, family],
  );
  const {
    baseTokenName,
    quoteTokenName,
    side,
    type,
    price,
    origQty,
    takeProfit,
    stopLoss,
    triggerPrice,
  } = normalized;

  const { tickSizeFraction } = useConfigBySymbol(baseTokenName) || {};

  // 按「委托单所属币对」取最新价，而非当前页面选中的交易对：
  // 全量行情流以 symbolAlias（baseTokenName+quoteTokenName）为 key，覆盖所有币对，
  // 避免持仓/委托币对与页面当前交易对不一致时，「当前价格」显示成页面当前币对的行情。
  const allSymbolQuoteData = useAllSymbolQuoteStream();
  const orderSymbolAlias =
    baseTokenName && quoteTokenName
      ? `${baseTokenName}${quoteTokenName}`
      : undefined;
  const { closePrice: lastPriceNumber } =
    (orderSymbolAlias && allSymbolQuoteData[orderSymbolAlias]) || {};

  // order/plan 家族 type 大小写不统一（Market vs MARKET），归一到 ORDER_TYPE 再推导参考价
  const normalizedExecType = useMemo(() => {
    const upper = String(type || '').toUpperCase();
    if (upper === 'MARKET') return ORDER_TYPE.MARKET;
    if (upper === 'LIMIT') return ORDER_TYPE.LIMIT;
    return type;
  }, [type]);

  // 止盈止损方向校验参考价（与下单面板一致，走 getReferencePrice）：
  // 限价 → 委托价；市价 → 最新价；计划委托限价 → 委托价；计划委托市价 → 触发价
  const referencePrice = useMemo(() => {
    if (isPlan) {
      return getReferencePrice({
        orderType: ORDER_TYPE.CONDITION,
        commissionPrice: price,
        lastPriceNumber,
        conditionType: normalizedExecType,
        triggerPrice,
      });
    }
    return getReferencePrice({
      orderType: normalizedExecType,
      commissionPrice: price,
      lastPriceNumber,
    });
  }, [isPlan, normalizedExecType, price, lastPriceNumber, triggerPrice]);

  // 弹窗草稿：仅两个触发价，编辑只作用于草稿，确定校验通过才提交
  const [draft, setDraft] = useState({ tp: undefined, sl: undefined });

  const [errors, setErrors] = useState({});

  const open = !!editData;
  const isBuy = String(side).toUpperCase() === ORDER_ACTION.BUY.toUpperCase();

  // 打开（false→true）时以委托单现有触发价回填草稿（0/空回填为空）
  const prevOpenRef = useRef(false);
  useEffect(() => {
    const prevOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (open && !prevOpen) {
      setDraft({
        tp: Number(takeProfit) ? takeProfit : undefined,
        sl: Number(stopLoss) ? stopLoss : undefined,
      });
      setErrors({});
    }
  }, [open, takeProfit, stopLoss]);

  // 触发价输入：限制小数位后写回草稿，并清除该侧错误
  const handleTriggerChange = (value, key) => {
    const clamped = isEmpty(value)
      ? value
      : clampPrecision(value, tickSizeFraction);
    setDraft((d) => ({ ...d, [key]: clamped }));
    setErrors((prev) => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // 「确定」：先做单侧数值范围校验，再复用下单弹框的方向性校验（止盈/止损相对委托价的大小关系），
  // 校验通过后按家族拼参提交（order/plan 均为 snake_case）
  const handleConfirm = () => {
    const { tp, sl } = draft;
    const nextErrors = {};
    if (!isTriggerValid(tp)) nextErrors.tp = t('tpslTriggerInvalid');
    if (!isTriggerValid(sl)) nextErrors.sl = t('tpslTriggerInvalid');
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // 复用下单弹框的止盈止损方向性校验：买入需止盈 > 委托价 > 止损，卖出反之
    const { valid, errors: dirErrors } = validateTpsl({
      checked: true,
      side,
      referencePrice,
      tp: { triggerPrice: tp, mode: TP_SL_MODE.MARKET },
      sl: { triggerPrice: sl, mode: TP_SL_MODE.MARKET },
    });
    if (!valid) {
      const translated = {};
      if (dirErrors.takeProfit) translated.tp = t(dirErrors.takeProfit);
      if (dirErrors.stopLoss) translated.sl = t(dirErrors.stopLoss);
      if (dirErrors.reference || dirErrors.general) {
        // 参考价不可用等通用错误：两侧一并提示，阻止提交
        const generalMsg = t(dirErrors.reference || dirErrors.general);
        translated.tp = translated.tp || generalMsg;
        translated.sl = translated.sl || generalMsg;
      }
      setErrors(translated);
      return;
    }

    const apiParams = buildTpslApiParams({
      checked: true,
      tpslOrder: {
        [TP_SL_FORM_FIELDS.TP_TRIGGER]: isEmpty(tp) ? undefined : tp,
        [TP_SL_FORM_FIELDS.SL_TRIGGER]: isEmpty(sl) ? undefined : sl,
      },
      family,
    });

    // 两家族共用 symbol_id，仅主键字段（plan_order_id/order_id）不同
    const symbolId =
      baseTokenName && quoteTokenName
        ? `${baseTokenName}${quoteTokenName}`
        : undefined;
    const idParams = isPlan
      ? { plan_order_id: order.plan_order_id ?? order.orderKey }
      : { order_id: order.orderId ?? order.orderKey };
    const params = { symbol_id: symbolId, ...idParams, ...apiParams };

    const submit = isPlan ? updatePlanOrderTpsl : updateOrderTpsl;
    submit(params)
      .then(() => {
        message.success(t('setTpSuccess'));
        onClose();
        // WS 已支持在 ws.spot.order 推送里带上最新 profitPrice/stopPrice，
        // 列表会自动原地合并更新，这里不再需要手动拉取接口刷新
      })
      .catch(() => {
        // 失败：保持弹窗打开、保留输入
      });
  };

  // 「取消」/关闭：清空错误并关闭
  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!editData) return null;

  const symbolFullName = baseTokenName
    ? `${baseTokenName}/${quoteTokenName}`
    : '';
  const orderType = isPlan ? ORDER_TYPE.CONDITION : type;
  // 下单类型标签（计划委托单独文案，限价/市价用 ${type}Order，空值兜底空字符串）
  const getOrderTypeText = () => {
    if (orderType === ORDER_TYPE.CONDITION) return t('conditionalOrder');
    if (!orderType) return '';
    return t(`${String(orderType).toLowerCase()}Order`);
  };
  const orderTypeText = getOrderTypeText();

  // 委托单执行类型是否为市价（来自 order_type，plan 家族已由 normalize 映射为 type）；
  // 市价委托（含计划委托的市价执行类型）无委托价，接口固定返回 0，委托价格需展示「市价」而非 0 USDT。
  // order 家族 type 为 'Market'（首字母大写），plan 家族 order_type 为 'MARKET'（全大写），
  // 大小写不统一，转大写后与 ORDER_TYPE.MARKET.toUpperCase() 比较以兼容两种家族。
  const isMarketOrder =
    String(type).toUpperCase() === ORDER_TYPE.MARKET.toUpperCase();

  // 价格展示（截断到报价精度，空值显示占位）
  const formatPrice = (value) =>
    value == null || value === ''
      ? '--'
      : `${toThousandsNumberNoZero(value, tickSizeFraction)} ${QUOTE_UNIT}`;

  // 止盈/止损对称区块：标题（市价）+ 触发价输入 + 错误提示
  const renderBlock = ({ title, fieldKey }) => (
    <div className={Styles.tpslBlock}>
      <div className={Styles.blockTitle}>
        {`${title}(${t('marketOrderShort')})`}
      </div>
      <div className={Styles.inputRow}>
        <div className={Styles.priceCell}>
          <InputNumber
            value={draft[fieldKey]}
            min={0}
            precision={tickSizeFraction}
            placeholder={title}
            addonAfter={QUOTE_UNIT}
            onChange={(value) => handleTriggerChange(value, fieldKey)}
          />
        </div>
      </div>
      <If condition={!!errors[fieldKey]}>
        <div className={Styles.blockError}>{errors[fieldKey]}</div>
      </If>
    </div>
  );

  return (
    <Modal
      head={t('editTpsl')}
      open={open}
      className={Styles.takeProfitSettingWrapper}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmText={t('confirm')}
      cancelText={t('cancel')}
    >
      <div className={Styles.tpslContent}>
        {/* 标题区：交易对 + 买卖方向 + 下单类型 */}
        <div className={Styles.tpslBasic}>
          <div className={Styles.tpslFirstRow}>
            <span className={Styles.symbol}>{symbolFullName}</span>
            <span
              className={cls(Styles.tag, {
                [Styles.buy]: isBuy,
                [Styles.sell]: !isBuy,
              })}
            >
              {isBuy ? t('BUY') : t('SELL')}
            </span>
            <span className={Styles.tag}>{orderTypeText}</span>
          </div>

          {/* 只读信息区：最新价格 / 委托价格 / 委托数量 */}
          <div className={Styles.tpslRow}>
            <div className={Styles.tpslRowTitle}>{t('current-price')}</div>
            <div>{formatPrice(lastPriceNumber)}</div>
          </div>
          <div className={Styles.tpslRow}>
            <div className={Styles.tpslRowTitle}>{t('orderPrice')}</div>
            <div>
              {isMarketOrder ? t('marketOrderShort') : formatPrice(price)}
            </div>
          </div>
          <div className={Styles.tpslRow}>
            <div className={Styles.tpslRowTitle}>{t('entrustQty')}</div>
            <div>{origQty == null || origQty === '' ? '--' : origQty}</div>
          </div>
        </div>

        {renderBlock({ title: t('takeProfit'), fieldKey: 'tp' })}
        {renderBlock({ title: t('stopLoss'), fieldKey: 'sl' })}
      </div>
    </Modal>
  );
};

EditTpsl.propTypes = {
  editData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

EditTpsl.defaultProps = {
  editData: null,
};

export default EditTpsl;
