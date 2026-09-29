// @ts-ignore
import { Checkbox, Modal, message, notify } from 'common/antdComponents';
import { Button, Tooltip } from 'antd';
import cls from 'classnames';
import BigNumber from 'bignumber.js';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useImmer } from 'use-immer';
import CoinsIcon from 'common/global/CoinsIcon';
import OrderTypes from 'common/components/OrderTypes';
import { intercept, toThousands } from '@unified/helpers';
import { hidePreCreateSave } from 'common/utils/order';
import { toThousandsNumberNoZero } from 'common/utils/utils';
import {
  transformCcToWc,
  transformWcToCc,
} from 'common/utils/calcWithContractType';
import { OrderCoinSelect } from 'common/global/OrderCoinSelect';
import PriceAssistantInput from 'common/global/PriceAssistantInput';
import OcQtyInput from 'common/global/OcQtyInput';
import QtySlider from 'common/global/QtySlider';
import {
  ORDER_ACTION,
  ORDER_TYPE,
  ORDER_FORM_FIELDS_SPOT,
  ORDER_FORM_FIELDS_SPOT_INIT,
  TP_SL_FORM_INIT,
  TP_SL_FORM_FIELDS,
  TP_SL_MODE,
} from 'common/packages-biz/global-settings/usdt-settings';
import OcTpsl from 'common/components/NewTpsl/OcTpsl';
import { getReferencePrice } from 'common/components/NewTpsl/utils/reference-price';
import { validateTpsl } from 'common/components/NewTpsl/utils/tpsl-validator';
import { buildTpslApiParams } from 'common/components/NewTpsl/utils/build-tpsl-params';
import { resetTpslByTrigger } from 'common/components/NewTpsl/utils/tpsl-reset';
import { CONDITION_ORDER_TIPS_KEY } from 'common/packages-biz/global-settings/localStorageSettings';
import useCurSymbolQuoteStream from 'common/public-ws/stream-hooks/use-instrument-stream';
import useOrderbookStream from 'common/public-ws/stream-hooks/use-orderbook-stream';
import { createOrder, createPlanOrder } from '@/services/order.service';
import useOrderCoinTypeInfo from '@/hooks/use-orderCoinType-info';
import useTrackingParams from '@/hooks/use-tracking-params';
import { getQtyByLotsize } from '@/utils/getQtyByLotsize';
import { handleTransferUrl, handleLoginUrl } from 'common/utils/url';
import useUserStore from '@/store-hooks/use-user-store';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import useAssetStore from '@/store-hooks/use-asset-store';
import { types, useGlobalState } from '@/store';
import { saveDoubleConfirm, trackPush } from '@/services/user.service';
import { qtyPercentSelectionSliders } from 'common/constants/selections';
import { ReactComponent as TransferSvg } from '@/assets/transfer/transfer_new.svg';
import ConditionOrderType from './components/ConditionOrderType';
import OcModalRow from './components/OcModalRow';
import TradeBtns from './TradeBtns';
import ConditionOrderTips from './ConditionOrderTips';
import Styles from './index.module.less';

// 计划委托触发价/委托价合法数值范围（R1.10）：必须为数字、>0 且在 0.01 ~ 999,999,999.99（含端点）内
const PLAN_PRICE_MIN = 0.01;
const PLAN_PRICE_MAX = 999999999.99;

/**
 * 校验计划委托的触发价 / 委托价是否为合法数值（R1.6/1.7/1.10）。
 * 空值视为不合法（必填）；非数字或不在 0.01 ~ 999,999,999.99 范围内（含 >0 约束）视为不合法。
 * @param {*} value
 * @returns {boolean}
 */
function isValidPlanPrice(value) {
  if (value === undefined || value === null || value === '') return false;
  const num = Number(value);
  return Number.isFinite(num) && num >= PLAN_PRICE_MIN && num <= PLAN_PRICE_MAX;
}

/** 止盈/止损触发价是否为空（空串 / null / undefined 视为空） */
function isTpslTriggerEmpty(value) {
  return value === undefined || value === null || value === '';
}

// 买卖用同一个pannel, order[ORDER_FORM_FIELDS_SPOT.SIDE]取值都是小写的buy和sell
const OrderCreationPanel = React.forwardRef(({ orderSide }, ref) => {
  const [t] = useTranslation('spot');
  const [t_error] = useTranslation('ztsl_error_code');
  const { lastPriceNumber } = useCurSymbolQuoteStream();
  const [globalState, globalDispatch] = useGlobalState();
  const {
    currentTheme,
    coin,
    symbol,
    symbolAlias,
    symbolFullName,
    quickPrice,
    user: { orderType },
  } = globalState;

  const [order, updateOrder] = useImmer({
    ...ORDER_FORM_FIELDS_SPOT_INIT,
    [ORDER_FORM_FIELDS_SPOT.TYPE]: orderType,
    [ORDER_FORM_FIELDS_SPOT.SIDE]: orderSide.toUpperCase(),
  });
  const [isBuy, setIsBuy] = useState(false);
  const [conditionType, setConditionType] = useState(ORDER_TYPE.MARKET); // 计划委托执行类型，默认市价

  // 止盈止损表单状态（Tpsl_Form_State），由面板持有以便内联组件与高级弹窗共享（设计：状态归属决策）
  const [tpslOrder, updateTpslOrder] = useImmer(TP_SL_FORM_INIT);
  const [tpslChecked, setTpslChecked] = useState(false);
  const [tpslExpanded, setTpslExpanded] = useState(false);
  // 提交前止盈止损校验产生的字段级错误
  const [tpslErrors, setTpslErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderCreating, setOrderCreating] = useState(false);
  const [hidePreCreate, setHideCreateConfirm] = useState(false);
  const [createModalShow, setCreateModalShow] = useState(false);
  const [conditionTipsOpen, setConditionTipsOpen] = useState(false);
  const [qtyValue, setQtyValue] = useState(); // 数量slider值 是否是滑杆模式
  const [avaliableUnit, setAvaliableUnit] = useState({
    unit: '',
    fraction: 0,
  });
  const [maxUnit, setMaxUnit] = useState({
    unit: '',
    fraction: 0,
  });

  const [tipsOpenDetail, settipsOpenDetail] = useState({
    visible: false,
    content: '',
  });
  const [tipsOpenTrigger, settipsOpenTrigger] = useState(false); // 控制是否开始计算是否触发popover打开
  // 计划委托逻辑校验：委托价触发价强提示弹窗
  const [conditionPriceWarnShow, setConditionPriceWarnShow] = useState(false);
  const [conditionPriceWarnText, setConditionPriceWarnText] = useState('');

  const autoPricePendingRef = useRef(true);
  const {
    spotCoin,
    walletCoin,
    walletCoinOrderFraction,
    maxQty,
    minTradeAmount,
    maxTradeAmount,
    lotFraction,
    lotSize,
    priceStep,

    tickSizeFraction,
    tickSize,

    minPrice,
    maxPrice,
    takerBuyFee,
    takerSellFee,
  } = useCurSymbolConfig();

  const {
    orderCoinTypeValue,
    loggedIn,
    baseCoinWallet,
    needPreCreate,
    doubleConfirm,
  } = useUserStore();

  const { qtyInputPH, unitTick, unitFraction, unit, isWalletCoinMode } =
    useOrderCoinTypeInfo();
  const {
    orderbookData: { bid1Price, ask1Price },
  } = useOrderbookStream(); // bid1Price: 买一价   ask1Price: 卖一价

  const needDeposit = useMemo(() => {
    return Math.max(0, baseCoinWallet?.equity) === 0;
  }, [baseCoinWallet?.equity]);

  const isInverse = false;
  const allWalletCoin = useAssetStore(symbol);
  const { avaliableAsset } = allWalletCoin?.[avaliableUnit.unit] || {};

  useEffect(() => {
    const newOrderSide = orderSide.toUpperCase();
    const buy = newOrderSide === ORDER_ACTION.BUY.toUpperCase();
    updateOrder((draft) => {
      draft[ORDER_FORM_FIELDS_SPOT.SIDE] = newOrderSide;
    });
    setIsBuy(buy);
    // 买 walletcoin 卖spotCoin
    const unit = buy ? walletCoin : spotCoin;
    setAvaliableUnit({
      unit,
      fraction: buy ? walletCoinOrderFraction : lotFraction,
    });
    setMaxUnit({
      unit: buy ? spotCoin : walletCoin,
      fraction: buy ? lotFraction : walletCoinOrderFraction,
    });
  }, [orderSide, symbolFullName]);

  //  获取计算价格
  const getCurrentPrice = (side) => {
    const isTypeMarket =
      order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.MARKET;
    const isTypeCondition =
      order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.CONDITION;
    // 计划委托：限价委托取委托价，市价委托取触发价
    if (isTypeCondition) {
      const conditionPrice =
        conditionType === ORDER_TYPE.LIMIT
          ? order[ORDER_FORM_FIELDS_SPOT.PRICE]
          : order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE];
      return conditionPrice || lastPriceNumber;
    }
    if (isTypeMarket) {
      return {
        SELL: bid1Price,
        BUY: ask1Price,
      }[side];
    }
    if (!order[ORDER_FORM_FIELDS_SPOT.PRICE]) {
      return lastPriceNumber;
    }
    return order[ORDER_FORM_FIELDS_SPOT.PRICE];
  };

  const getOrderTypeText = (type) => {
    if (type === ORDER_TYPE.CONDITION) {
      return t('conditionalOrder');
    }
    return t(`${type.toLowerCase()}Order`);
  };

  // 止盈止损参考价（订单委托价）：限价/计划委托(限价)用委托价、市价用最新成交价、计划委托(市价)用触发价
  const tpslReferencePrice = useMemo(
    () =>
      getReferencePrice({
        orderType: order[ORDER_FORM_FIELDS_SPOT.TYPE],
        commissionPrice: order[ORDER_FORM_FIELDS_SPOT.PRICE],
        lastPriceNumber,
        conditionType,
        triggerPrice: order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE],
      }),
    [
      order[ORDER_FORM_FIELDS_SPOT.TYPE],
      order[ORDER_FORM_FIELDS_SPOT.PRICE],
      order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE],
      conditionType,
      lastPriceNumber,
    ],
  );

  // 参考价（订单委托价）暂不可用标记（R3.6/3.7/3.8）：
  // 市价无最新成交价、限价/计划委托(限价)委托价为空、计划委托(市价)触发价为空时，
  // 由 getReferencePrice 推导结果为空即视为不可用。此时 OcTpsl 展示「参考价暂不可用」提示、
  // 保留已输入的止盈止损值不清空，且提交校验走 reference 分支暂停方向约束校验（与 validateTpsl 的 isEmpty 语义一致）。
  const tpslReferenceUnavailable =
    tpslReferencePrice === undefined ||
    tpslReferencePrice === null ||
    tpslReferencePrice === '' ||
    Number.isNaN(Number(tpslReferencePrice));

  // 止盈止损触发价字段写入（R1.6）
  const handleTpslFieldChange = (value, field) => {
    updateTpslOrder((draft) => {
      draft[field] = value;
    });
  };

  // 勾选态变化：常态联动可见态；取消勾选时同时清空触发价/委托价
  const handleTpslCheckedChange = (nextChecked) => {
    setTpslChecked(nextChecked);
    setTpslExpanded(nextChecked);
    if (!nextChecked) {
      updateTpslOrder((draft) => resetTpslByTrigger(draft, 'uncheck'));
      setTpslErrors({});
    }
  };

  // 提交前止盈止损校验：未勾选直接通过；勾选则调用 validateTpsl，
  // 不通过时阻止提交、把字段级错误存入 tpslErrors 交给 OcTpsl 展示，并用 message.warn 提示首个错误；
  // 校验全程不修改 Tpsl_Form_State，保留用户已输入的止盈止损值。
  const validateTpslBeforeSubmit = () => {
    if (!tpslChecked) {
      setTpslErrors({});
      return true;
    }
    const { valid, errors } = validateTpsl({
      checked: tpslChecked,
      side: order[ORDER_FORM_FIELDS_SPOT.SIDE],
      referencePrice: tpslReferencePrice,
      tp: {
        triggerPrice: tpslOrder[TP_SL_FORM_FIELDS.TP_TRIGGER],
        orderPrice: tpslOrder[TP_SL_FORM_FIELDS.TP_ORDER],
        mode: tpslOrder[TP_SL_FORM_FIELDS.TP_MODE],
      },
      sl: {
        triggerPrice: tpslOrder[TP_SL_FORM_FIELDS.SL_TRIGGER],
        orderPrice: tpslOrder[TP_SL_FORM_FIELDS.SL_ORDER],
        mode: tpslOrder[TP_SL_FORM_FIELDS.SL_MODE],
      },
    });
    if (!valid) {
      // errors 的值即为 i18n key（TPSL_ERROR_KEYS）。OcTpsl 直接渲染 errors 文本，
      // 故此处翻译为展示文案再存入 state；message.warn 同样以 t(key) 翻译提示首个错误。
      const translatedErrors = Object.keys(errors).reduce((acc, region) => {
        acc[region] = t(errors[region]);
        return acc;
      }, {});
      setTpslErrors(translatedErrors);
      const firstErrorKey =
        errors.general ||
        errors.reference ||
        errors.takeProfit ||
        errors.stopLoss;
      if (firstErrorKey) {
        message.warn(t(firstErrorKey));
      }
      return false;
    }
    setTpslErrors({});
    return true;
  };

  // 重置订单表单。集中重置止盈止损表单状态（Tpsl_Form_State）为 TP_SL_FORM_INIT
  // 并清空字段级错误（R7.1）。勾选/展开（tpslChecked/tpslExpanded）由各调用点负责：
  // 下单成功不改勾选态（保持用户原选择）；切换上下文则勾选/展开均归位(false)。
  const handleResetOrder = () => {
    updateOrder((draft) => {
      draft[ORDER_FORM_FIELDS_SPOT.QTY] = undefined;
      draft[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE] = undefined;
    });
    setQtyValue(undefined);
    updateTpslOrder(() => ({ ...TP_SL_FORM_INIT })); // R7.1：完整重置止盈止损表单
    setTpslErrors({});
  };

  // 切换交易对 / 买卖方向：重置表单并将勾选/展开归位为初始状态（R7.5）
  useEffect(() => {
    handleResetOrder();
    setTpslChecked(false);
    setTpslExpanded(false);
  }, [symbolFullName, orderSide]);

  useEffect(() => {
    // 切换订单类型时，始终触发一次自动填价
    autoPricePendingRef.current = true;
  }, [order[ORDER_FORM_FIELDS_SPOT.TYPE], symbolFullName]);

  useEffect(() => {
    // 初始化时 or lastPriceNumber 第一次变为有值时，补上自动填价
    if (!autoPricePendingRef.current) return;
    if (!lastPriceNumber) return;
    handleAutoFillByType();
    autoPricePendingRef.current = false;
  }, [lastPriceNumber, order[ORDER_FORM_FIELDS_SPOT.TYPE]]);

  // 监听orderbook价格点击自动更新价格
  useEffect(() => {
    updateOrder((draft) => {
      draft[ORDER_FORM_FIELDS_SPOT.PRICE] = quickPrice;
    });
  }, [quickPrice]);

  // 切换订单类型
  const handleOrderTypeChange = (value, field) => {
    if (value === order[ORDER_FORM_FIELDS_SPOT.TYPE]) {
      return;
    }
    updateOrder((draft) => {
      draft[ORDER_FORM_FIELDS_SPOT.TYPE] = value;
    });
    setConditionType(ORDER_TYPE.MARKET);
    handleResetOrder();
    // 切换下单类型：止盈止损勾选/展开归位为初始状态（R7.5）
    setTpslChecked(false);
    setTpslExpanded(false);
    // 切到计划委托：未勾选「不再提示」时弹出温馨提示
    if (value === ORDER_TYPE.CONDITION) {
      const hidden = localStorage.getItem(CONDITION_ORDER_TIPS_KEY) === 'hide';
      if (!hidden) setConditionTipsOpen(true);
    }
  };

  // 计划委托-执行类型切换（限价委托/市价委托）
  const handleConditionTypeChange = (value) => {
    if (value === conditionType) return;
    setConditionType(value);
    updateOrder((draft) => {
      // 切到限价委托默认带出最新价作为委托价，切到市价委托清空委托价
      draft[ORDER_FORM_FIELDS_SPOT.PRICE] =
        value === ORDER_TYPE.LIMIT ? lastPriceNumber : undefined;
    });
  };

  useImperativeHandle(ref, () => ({
    reset: handleOrderTypeChange,
  }));

  const handleCloseModal = () => {
    setCreateModalShow(false);
  };

  const validateForm = () => {
    let valid = true;
    if (!qtyValue && !order[ORDER_FORM_FIELDS_SPOT.QTY]) {
      valid = false;
    }

    if (
      order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.LIMIT &&
      !order[ORDER_FORM_FIELDS_SPOT.PRICE]
    ) {
      valid = false;
    }

    // 计划委托：触发价必填且为合法数值（>0、0.01~999,999,999.99 范围）；
    // 限价委托时还需委托价合法（R1.6/1.7/1.10）。任一不通过则阻止提交、不调接口、保留其余输入。
    if (order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.CONDITION) {
      if (!isValidPlanPrice(order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE])) {
        valid = false;
      }
      if (
        conditionType === ORDER_TYPE.LIMIT &&
        !isValidPlanPrice(order[ORDER_FORM_FIELDS_SPOT.PRICE])
      ) {
        valid = false;
      }
    }
    return valid;
  };

  /** 进入下单流程（预确认弹窗 or 直接下单） */
  const proceedToOrder = () => {
    if (needPreCreate) {
      setCreateModalShow(true);
    } else {
      handleOrderCreate();
    }
  };

  /** 计划委托强提示弹窗：用户选择「继续下单」 */
  const handleConditionPriceWarnConfirm = () => {
    setConditionPriceWarnShow(false);
    proceedToOrder();
  };

  /** 计划委托强提示弹窗：用户选择「取消」 */
  const handleConditionPriceWarnCancel = () => {
    setConditionPriceWarnShow(false);
  };

  // step1 点击下单，依次执行参数校验 → 金额/数量范围 → 止盈止损 → 计划委托(限价)委托价逻辑强提示
  const handleClickCreate = () => {
    const qty = Number(order[ORDER_FORM_FIELDS_SPOT.QTY]);

    // 1. 参数校验（沿用原有通用提示）
    if (!validateForm()) {
      message.error(t('priceQtyRequiredMsg'));
      return;
    }

    // 2. 最小限制（数量/金额 < 最小值）
    // 备注：minSize 的 useMemo(720 行起),源头是 minTradeAmount(最小下单金额,USDT 单位),但它会跟随当前下单模式换算单位。
    // 金额模式（isWalletCoinMode）下 minSize 即最小交易金额(USDT)，用「最小交易金额」文案；
    // 数量模式下 minSize 为换算后的币种数量，用「最小下单数量」文案。unit 已随模式切换。
    if (qty < Number(minSize)) {
      settipsOpenTrigger(true);
      message.error(
        t(
          isWalletCoinMode
            ? 'minOrderAmountRequiredMsg'
            : 'minOrderQtyRequiredMsg',
          { value: minSize, unit },
        ),
      );
      return;
    }

    // 3. 最大交易金额（仅金额模式，如市价买入按金额下单）：金额 > 最大交易金额。
    // maxTradeAmount（来自 symbol 配置，单位恒为 walletCoin/USDT）；金额模式下 order[QTY] 即 USDT 金额，
    // 两者同单位直接比较；maxTradeAmount 为 0/undefined 时跳过。展示单位用 walletCoin。
    if (isWalletCoinMode && maxTradeAmount && qty > Number(maxTradeAmount)) {
      message.error(
        t('maxOrderAmountRequiredMsg', {
          value: maxTradeAmount,
          unit: walletCoin,
        }),
      );
      return;
    }

    // 4. 最大下单量（数量 > 最大下单数量；maxQty 为 0/undefined 时跳过）
    // 注意单位：maxQty（来自 symbol 配置 maxTradeQuantity）单位恒为基础币（币种）。
    // 而 order[QTY] 在金额模式（isWalletCoinMode）下单位是 walletCoin（USDT），
    // 直接与 maxQty 比较会造成「USDT 金额 vs 币数量」的单位错配。
    // 这里统一取 orderInfo.quantity（即最终提交给接口的下单数量，单位恒为币种，
    // 金额模式下已由 transformWcToCc 换算），与 maxQty 同单位比较；展示单位用 spotCoin。
    const baseQty = Number(orderInfo.quantity);
    if (maxQty && baseQty > Number(maxQty)) {
      message.error(
        t('maxOrderQtyRequiredMsg', { value: maxQty, unit: spotCoin }),
      );
      return;
    }

    // 5. 止盈止损校验
    if (!validateTpslBeforeSubmit()) return;

    // 6. 强提示：计划委托-限价 委托价 vs 触发价（PRD「计划委托逻辑校验」表）
    //    买入：委托价 ≥ 触发价 → 触发后将立即成交；卖出：委托价 ≤ 触发价 → 触发后将立即成交。
    //    命中时展示「是否继续下单？」弹窗，由用户决定是否继续。
    //    仅限价委托参与（市价委托无委托价）。
    if (
      order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.CONDITION &&
      conditionType === ORDER_TYPE.LIMIT
    ) {
      const triggerPrice = Number(order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE]);
      const orderPrice = Number(order[ORDER_FORM_FIELDS_SPOT.PRICE]);
      // 买入：委托价 ≥ 触发价
      if (isBuy && orderPrice >= triggerPrice) {
        setConditionPriceWarnText(t('buyConditionOrderPriceWarnMsg'));
        setConditionPriceWarnShow(true);
        return;
      }
      // 卖出：委托价 ≤ 触发价
      if (!isBuy && orderPrice <= triggerPrice) {
        setConditionPriceWarnText(t('sellConditionOrderPriceWarnMsg'));
        setConditionPriceWarnShow(true);
        return;
      }
    }

    proceedToOrder();
  };

  // step2 下单确认弹窗
  const handleCreateConfirm = () => {
    if (hidePreCreate) {
      const newDoubleConfirm = hidePreCreateSave(doubleConfirm);
      saveDoubleConfirm(newDoubleConfirm).then(() => {
        globalDispatch({
          type: types.UPDATE_ORDER_CONFIRM,
          newDoubleConfirm: newDoubleConfirm.join(','),
        });
      });
    }
    handleOrderCreate();
  };

  // 得到最大可开
  const maxSize = useMemo(() => {
    const orderType = order[ORDER_FORM_FIELDS_SPOT.TYPE];
    let price = order[ORDER_FORM_FIELDS_SPOT.PRICE];
    if (orderType === ORDER_TYPE.MARKET) {
      price = lastPriceNumber;
    } else if (orderType === ORDER_TYPE.CONDITION) {
      // 限价委托取委托价，市价委托取触发价
      price =
        conditionType === ORDER_TYPE.LIMIT
          ? order[ORDER_FORM_FIELDS_SPOT.PRICE]
          : order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE];
    }
    if (!price) {
      return 0;
    }
    if (isBuy) {
      return avaliableAsset / Number(price);
    }
    return avaliableAsset * Number(price);
  }, [
    order[ORDER_FORM_FIELDS_SPOT.PRICE],
    order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE],
    order[ORDER_FORM_FIELDS_SPOT.TYPE],
    conditionType,
    lastPriceNumber,
    avaliableAsset,
  ]);

  const orderInfo = useMemo(() => {
    const qty = order[ORDER_FORM_FIELDS_SPOT.QTY] || 0;
    const side = order[ORDER_FORM_FIELDS_SPOT.SIDE];
    const price = getCurrentPrice(side);
    // 按照币种下单
    let quantity = getQtyByLotsize(lotSize, qty, lotFraction); // 接口传入下单数量,单位永远是币种
    let amount = BigNumber(quantity).multipliedBy(price).toNumber();
    // 按照WalletCoin下单，把usdt转换为btc
    if (isWalletCoinMode) {
      amount = qty;
      const value = transformWcToCc(qty, price, isInverse);
      quantity = getQtyByLotsize(lotSize, value, lotFraction); //
      // 如果是滑杆
      if (qtyValue) {
        const v = isBuy ? maxSize : avaliableAsset;
        quantity = intercept(v * qtyValue, lotFraction);
      }
    }
    const fee = BigNumber(quantity)
      .multipliedBy(isBuy ? takerBuyFee : takerSellFee)
      .toNumber();

    return {
      quantity,
      price,
      side,
      amount,
      fee,
    };
  }, [
    order,
    isWalletCoinMode,
    qtyValue,
    avaliableAsset,
    takerBuyFee,
    conditionType,
  ]);

  // 计划委托下单：组装 plan_order/create 参数并提交真实请求
  const handleConditionOrderCreate = () => {
    if (submitting) return;
    setSubmitting(true);
    const { quantity, side } = orderInfo;
    const isLimitCondition = conditionType === ORDER_TYPE.LIMIT;
    const planParams = {
      symbol_id: symbolAlias, // BTCUSDT
      client_plan_id: String(new Date().getTime()), // 客户端幂等ID（≤64）
      trigger_price: order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE], // 触发价（必填 >0）
      side, // BUY / SELL
      plan_type: 'NORMAL', // 普通计划委托
      type: conditionType.toUpperCase(), // 触发后下单类型 LIMIT / MARKET
      // 限价委托带委托价；市价委托不传 price
      price: isLimitCondition ? order[ORDER_FORM_FIELDS_SPOT.PRICE] : undefined,
      quantity, // 触发后下单数量
    };
    // 拼装止盈止损字段（计划委托接口家族 plan，snake_case profit_price/stop_price）。
    // 已通过 validateTpslBeforeSubmit 校验；未勾选时返回 {}。
    const tpslParams = buildTpslApiParams({
      checked: tpslChecked,
      tpslOrder,
      family: 'plan',
    });
    Object.assign(planParams, tpslParams);

    createPlanOrder(planParams)
      .then(() => {
        setCreateModalShow(false);
        handleResetOrder();
        // 计划委托创建成功提示：与限价/市价 tab 的提示语义不同（多一段「触发价」），
        // 委托价文案：限价委托展示具体委托价，市价委托展示「市价」（触发后按市价成交，无固定价格）。
        const sideT = isBuy ? t('orderBuy') : t('orderSell');
        const orderPriceText = isLimitCondition
          ? `${planParams.price} ${walletCoin}`
          : t('marketOrderShort');
        notify.success(
          t('orderCreateSuccessTitle'),
          t('conditionOrderCreateSuccess', {
            defaultValue:
              '市场价格达到 {{triggerPrice}} {{walletCoin}} 时，将以 {{orderPriceText}} {{side}} {{qty}} {{coin}}。',
            triggerPrice: planParams.trigger_price,
            walletCoin,
            orderPriceText,
            side: sideT,
            qty: quantity,
            coin,
          }),
        );
      })
      .catch(() => {})
      .finally(() => {
        setOrderCreating(false);
        setCreateModalShow(false);
        setHideCreateConfirm(false);
        setTimeout(() => {
          setSubmitting(false);
        }, 1000);
      });
  };

  // step3 真正下单
  const handleOrderCreate = () => {
    if (order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.CONDITION) {
      handleConditionOrderCreate();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    const { quantity, price, side } = orderInfo;
    const finalParams = {
      type: order[ORDER_FORM_FIELDS_SPOT.TYPE].toLowerCase(),
      side,
      price,
      quantity,
      symbol_id: symbolAlias, // BTCUSDT
      client_order_id: new Date().getTime(),
    };

    // 拼装止盈止损字段（老订单接口家族 order，snake_case profit_price/stop_price）。
    // 已通过 validateTpslBeforeSubmit 校验；未勾选时返回 {}。
    const tpslParams = buildTpslApiParams({
      checked: tpslChecked,
      tpslOrder,
      family: 'order',
    });
    Object.assign(finalParams, tpslParams);

    // const type=limit&side=BUY&price=90890.27&quantity=0.001&symbol_id=BTCUSDT&client_order_id=1768209685813
    createOrder(finalParams)
      .then((response) => {
        setCreateModalShow(false);
        // 市价单带止盈止损：成交推送经 plan_order 家族承接，entrustOrderNotify 仅对
        // type==='LIMIT' 弹提示，导致此场景无任何成功提示。这里补一条成交提示，
        // 与「不带止盈止损市价单」由 ws.spot.match 弹出的成交提示保持一致。
        // 仅限「市价 + 勾选止盈止损」触发，避免与限价单（ws.spot.order）/
        // 普通市价单（ws.spot.match）的既有提示重复。
        if (
          order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.MARKET &&
          tpslChecked
        ) {
          notify.success(
            t('orderFillNoticeTitle'),
            t('orderFillNoticeDesc', {
              type: isBuy ? t('BUY') : t('SELL'),
              execQty: orderInfo.quantity,
              symbol: coin,
              price: orderInfo.price,
            }),
          );
        }
        handleResetOrder();
      })
      .catch(() => {})
      .finally(() => {
        setOrderCreating(false);
        setCreateModalShow(false);
        setHideCreateConfirm(false); // 保证每次打开弹窗，都是没有勾选的状态
        setTimeout(() => {
          setSubmitting(false);
        }, 1000);
      });
  };

  // 计算最小数量,不分方向
  const minSize = useMemo(() => {
    let newPrice = order[ORDER_FORM_FIELDS_SPOT.PRICE];
    if (order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.MARKET) {
      newPrice = lastPriceNumber;
    } else if (order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.CONDITION) {
      newPrice =
        conditionType === ORDER_TYPE.LIMIT
          ? order[ORDER_FORM_FIELDS_SPOT.PRICE]
          : order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE];
    }

    if (!isWalletCoinMode) {
      const formatRes = transformWcToCc(minTradeAmount, newPrice, isInverse);
      // 将金额转化为数量，比如计算后数量为0.000077，则向上取整为0.00008
      return new BigNumber(formatRes).toFixed(lotFraction);
    }
    return minTradeAmount; // 最小下单金额
  }, [
    lastPriceNumber,
    order,
    orderCoinTypeValue,
    minTradeAmount,
    conditionType,
  ]);

  const handleFormChange = (value, field) => {
    updateOrder((draft) => {
      draft[field] = value;
    });
  };

  // 自动填入委托价（限价单 / 计划委托-限价委托）
  const handleAutoPrice = () => {
    if (!lastPriceNumber) return;
    handleFormChange(lastPriceNumber, ORDER_FORM_FIELDS_SPOT.PRICE);
  };

  // 自动填入触发价（计划委托）
  const handleAutoTriggerPrice = () => {
    if (!lastPriceNumber) return;
    handleFormChange(lastPriceNumber, ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE);
  };

  // 切换订单类型时按类型自动填价
  const handleAutoFillByType = () => {
    if (!lastPriceNumber) return;
    const type = order[ORDER_FORM_FIELDS_SPOT.TYPE];
    if (type === ORDER_TYPE.LIMIT) {
      handleAutoPrice();
    } else if (type === ORDER_TYPE.CONDITION) {
      handleAutoTriggerPrice();
      if (conditionType === ORDER_TYPE.LIMIT) {
        handleAutoPrice();
      }
    }
  };

  const handlePriceChange = (price, field) => {
    handleFormChange(price, field);
  };

  const handleTriggerPriceChange = (price, field) => {
    handleFormChange(price, field);
  };

  // 数量变化
  const handleQtyChange = (qty, field) => {
    handleFormChange(qty, field);
  };

  const resetQtySelector = () => {
    setQtyValue(false);
  };

  // 滑杆变化-->数量变化
  const handleQtySelect = (percent) => {
    let qty = 0;
    if (isBuy) {
      qty = intercept(maxSize * percent, lotFraction);
      if (isWalletCoinMode) {
        qty = intercept(avaliableAsset * percent, walletCoinOrderFraction);
      }
    } else {
      qty = intercept(avaliableAsset * percent, lotFraction);
      if (isWalletCoinMode) {
        qty = intercept(maxSize * percent, walletCoinOrderFraction);
      }
    }
    setQtyValue(percent);
    handleFormChange(qty, ORDER_FORM_FIELDS_SPOT.QTY);
    settipsOpenTrigger(false);
  };

  // 下单币种变化,清空qty
  const handleCoinChange = () => {
    handleFormChange(undefined, ORDER_FORM_FIELDS_SPOT.QTY);
    setQtyValue(undefined);
  };

  const calcTipAmountByQty = (calcPrice, qty) => {
    if (isWalletCoinMode) {
      const transformRes = transformWcToCc(qty, calcPrice, isInverse);
      return toThousands(transformRes, lotFraction);
    }
    const transformRes = transformCcToWc(qty, calcPrice, isInverse);
    return toThousands(transformRes, walletCoinOrderFraction);
  };

  // 最小下单量提示和下单币种换算 tooltips
  // tooltips要固定 不要随鼠标移入移出变化
  useEffect(() => {
    const qty = order[ORDER_FORM_FIELDS_SPOT.QTY];
    if (qtyValue && tipsOpenTrigger) {
      return;
    }
    if (!qty || !tipsOpenTrigger) {
      settipsOpenDetail({
        visible: false,
        content: '',
      });
      return;
    }
    if (!qty || qty < Number(minSize)) {
      settipsOpenDetail({
        visible: true,
        content: t(
          isWalletCoinMode
            ? 'minOrderAmountRequiredMsg'
            : 'minOrderQtyRequiredMsg',
          { value: minSize, unit },
        ),
      });
      return;
    }
    let calcPrice = lastPriceNumber;
    if (order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.LIMIT) {
      calcPrice = order[ORDER_FORM_FIELDS_SPOT.PRICE];
    } else if (order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.CONDITION) {
      calcPrice =
        conditionType === ORDER_TYPE.LIMIT
          ? order[ORDER_FORM_FIELDS_SPOT.PRICE]
          : order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE];
    }

    // - 市价单根据最新场内价格计算
    const calcAmount = calcTipAmountByQty(calcPrice, qty);
    let calcCoin = walletCoin;
    if (isWalletCoinMode) {
      calcCoin = spotCoin;
    }

    settipsOpenDetail({
      visible: true,
      content: `≈${calcAmount} ${calcCoin}`,
    });
  }, [
    symbolFullName,
    walletCoinOrderFraction,
    coin,
    lastPriceNumber,
    lotFraction,
    minSize,
    order,
    orderCoinTypeValue,
    qtyValue,
    tipsOpenTrigger,
    unit,
    conditionType,
  ]);

  const handleMouseEnter = () => {
    if (!tipsOpenDetail.visible) {
      settipsOpenTrigger(true);
    }
  };

  const handleMouseLeave = () => {
    if (tipsOpenDetail.visible) {
      settipsOpenTrigger(false);
      settipsOpenDetail({
        visible: false,
        content: tipsOpenDetail.content,
      });
    }
  };

  return (
    <>
      <div className="oc__double">
        <div className="oc__row oc__row-top--16">
          <OrderTypes
            name="orderType"
            value={order[ORDER_FORM_FIELDS_SPOT.TYPE]}
            onChange={handleOrderTypeChange}
          />
        </div>

        <div className="oc__group">
          <If
            condition={order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.LIMIT}
          >
            <div className="oc__row-bottom--8  label-input__container">
              {/* 限价-价格输入框 */}
              <PriceAssistantInput
                leftIcon={t('orderPrice')}
                name={ORDER_FORM_FIELDS_SPOT.PRICE}
                className="oc__row-item"
                value={order[ORDER_FORM_FIELDS_SPOT.PRICE]}
                onChange={handlePriceChange}
                tick={priceStep}
                min={minPrice}
                max={maxPrice}
                precision={tickSizeFraction}
                handleAutoPrice={handleAutoPrice}
                rightUnit={walletCoin}
              />
            </div>
          </If>

          {/* 计划委托：触发价格 + 委托类型 */}
          <If
            condition={
              order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.CONDITION
            }
          >
            <div className="oc__row-bottom--8  label-input__container">
              {/* 触发价格-复用限价输入框 */}
              <PriceAssistantInput
                leftIcon={t('triggerPrice')}
                name={ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE}
                className="oc__row-item"
                value={order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE]}
                onChange={handleTriggerPriceChange}
                tick={priceStep}
                min={minPrice}
                max={maxPrice}
                precision={tickSizeFraction}
                handleAutoPrice={handleAutoTriggerPrice}
                rightUnit={walletCoin}
              />
            </div>
            <div className="oc__row-bottom--8  label-input__container">
              {/* 委托类型-下拉切换限价委托/市价委托 */}
              <ConditionOrderType
                name={ORDER_FORM_FIELDS_SPOT.PRICE}
                conditionType={conditionType}
                onConditionTypeChange={handleConditionTypeChange}
                price={order[ORDER_FORM_FIELDS_SPOT.PRICE]}
                onPriceChange={handlePriceChange}
                min={minPrice}
                max={maxPrice}
                precision={tickSizeFraction}
                rightUnit={walletCoin}
              />
            </div>
          </If>

          {/* 数量输入 */}
          <Tooltip
            placement="topRight"
            title={tipsOpenDetail.content}
            open={tipsOpenDetail.visible}
          >
            <div
              className="oc__row-bottom--16 label-input__container"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              data-coachmark-step="order-qty"
            >
              <OcQtyInput
                name={ORDER_FORM_FIELDS_SPOT.QTY}
                onChange={handleQtyChange}
                resetQtySelector={resetQtySelector}
                value={order[ORDER_FORM_FIELDS_SPOT.QTY]}
                min={unitTick}
                tick={unitTick}
                precision={unitFraction}
                leftIcon={<span>{t(qtyInputPH, { unit })}</span>}
                qtyValue={qtyValue}
                rightIcon={<OrderCoinSelect handleChange={handleCoinChange} />}
              />
            </div>
          </Tooltip>
          {/* 滑杆 */}
          <div className="oc__row-bottom--16">
            <QtySlider
              qtyValue={qtyValue}
              handleQtySelect={handleQtySelect}
              sliderSelections={qtyPercentSelectionSliders}
            />
          </div>
        </div>

        {/* 止盈止损：内联区域（数量滑杆下方、买卖按钮上方，R1.1）；三种下单类型共享区域 */}
        <OcTpsl
          tpslOrder={tpslOrder}
          checked={tpslChecked}
          expanded={tpslExpanded}
          onCheckedChange={handleTpslCheckedChange}
          onFieldChange={handleTpslFieldChange}
          referencePriceUnavailable={tpslReferenceUnavailable}
          tickSizeFraction={tickSizeFraction}
          errors={tpslErrors}
        />
      </div>

      {/*  按钮 */}
      <div className="oc__group">
        <TradeBtns loggedIn={loggedIn} needDeposit={needDeposit} />
        {/* 买卖按钮 */}
        <If condition={loggedIn && !needDeposit}>
          <div className="flex oc__row-btn">
            <Button
              className={cls(
                Styles.ocBtn,
                isBuy ? Styles.longBtn : Styles.shortBtn,
              )}
              type="primary"
              onClick={handleClickCreate}
              loading={orderCreating}
              disabled={orderCreating}
            >
              {isBuy ? t('BUY') : t('SELL')}
            </Button>
          </div>

          <div className={Styles.itemContainer}>
            {/* 可用 */}
            <div
              className={Styles.item}
              data-coachmark-step="available-balance"
            >
              <div className={Styles.label}>
                {t('contractAvailableBalance')}
              </div>
              <div className={Styles.value}>
                <span>
                  {' '}
                  {toThousands(avaliableAsset, avaliableUnit.fraction)}{' '}
                  {avaliableUnit.unit}
                </span>
                <TransferSvg
                  className={Styles.transferIcon}
                  onClick={() => handleTransferUrl(t, t_error, loggedIn)}
                />
              </div>
            </div>
            {/* 可买卖 */}
            <div className={Styles.item}>
              <span> {isBuy ? t('maxBuyQty') : t('maxSellQty')}</span>
              <span className={Styles.long}>
                {toThousands(maxSize, maxUnit.fraction)} {maxUnit.unit}
              </span>
            </div>
            {/* 手续费 */}
            <div className={Styles.item}>
              <span> {t('orderFee')}</span>
              <span className={Styles.value}>
                {toThousands(orderInfo.fee, 8)} {maxUnit.unit}
              </span>
            </div>
          </div>
        </If>
      </div>
      {/* 计划委托逻辑校验：委托价 vs 触发价强提示弹窗（用户可选择继续或取消） */}
      {conditionPriceWarnShow && (
        <Modal
          open={conditionPriceWarnShow}
          head={t('hint')}
          innerClass="oc__dialog"
          onClose={handleConditionPriceWarnCancel}
          onConfirm={handleConditionPriceWarnConfirm}
          onCancel={handleConditionPriceWarnCancel}
          confirmText={t('continueOrder')}
          cancelText={t('cancel')}
        >
          <div className="oc__pre-dialog-body">
            <p>{conditionPriceWarnText}</p>
          </div>
        </Modal>
      )}

      {/* 切换到计划委托时的温馨提示 */}
      <ConditionOrderTips
        open={conditionTipsOpen}
        onConfirm={({ dontShowAgain }) => {
          if (dontShowAgain) {
            localStorage.setItem(CONDITION_ORDER_TIPS_KEY, 'hide');
          }
          setConditionTipsOpen(false);
        }}
        onClose={() => setConditionTipsOpen(false)}
      />

      {/* 点击买卖后的弹窗 */}
      {createModalShow && (
        <Modal
          open={createModalShow}
          head={t('confirmOrder')}
          innerClass="oc__dialog"
          onClose={handleCloseModal}
          onConfirm={handleCreateConfirm}
          onCancel={handleCloseModal}
          confirmText={t('confirm')}
          cancelText={t('cancel')}
        >
          <div className="oc__pre-dialog-body">
            <div className="row">
              <CoinsIcon
                size={24}
                coin={coin?.toLowerCase()}
                className="row-icon"
                theme={currentTheme}
              />
              <span className="symbol">{symbolFullName}</span>
              <span className="row-item">
                {getOrderTypeText(order[ORDER_FORM_FIELDS_SPOT.TYPE])}
              </span>
              <span
                className={cls('row-item', {
                  buy: isBuy,
                  sell: !isBuy,
                })}
              >
                {isBuy ? t('BUY') : t('SELL')}
              </span>
            </div>
            <div className="row-grid3">
              <If
                condition={
                  order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.CONDITION
                }
              >
                <OcModalRow
                  label={t('triggerPrice')}
                  value={`${toThousandsNumberNoZero(
                    order[ORDER_FORM_FIELDS_SPOT.TRIGGER_PRICE],
                    tickSizeFraction,
                  )} ${walletCoin}`}
                />
              </If>
              <OcModalRow
                label={t('orderPrice')}
                value={
                  order[ORDER_FORM_FIELDS_SPOT.TYPE] === ORDER_TYPE.MARKET ||
                  (order[ORDER_FORM_FIELDS_SPOT.TYPE] ===
                    ORDER_TYPE.CONDITION &&
                    conditionType === ORDER_TYPE.MARKET)
                    ? t('marketOrderShort')
                    : `${toThousandsNumberNoZero(
                        order[ORDER_FORM_FIELDS_SPOT.PRICE],
                        tickSizeFraction,
                      )} ${walletCoin}`
                }
              />
              <OcModalRow
                label={t('orderQty')}
                value={`${toThousandsNumberNoZero(
                  orderInfo?.quantity,
                  lotFraction,
                )} ${spotCoin}`}
              />

              <OcModalRow
                label={t('orderVolume')}
                value={`${toThousandsNumberNoZero(
                  orderInfo?.amount,
                  walletCoinOrderFraction,
                )} ${walletCoin}`}
              />

              {/* 勾选止盈止损且该侧触发价有值时，动态展示对应触发价/委托价 */}
              <If
                condition={
                  tpslChecked &&
                  !isTpslTriggerEmpty(tpslOrder[TP_SL_FORM_FIELDS.TP_TRIGGER])
                }
              >
                <OcModalRow
                  label={t('tpTriggerPrice', { defaultValue: '止盈触发价' })}
                  value={`${toThousandsNumberNoZero(
                    tpslOrder[TP_SL_FORM_FIELDS.TP_TRIGGER],
                    tickSizeFraction,
                  )} ${walletCoin}`}
                />
                <OcModalRow
                  label={t('tpOrderPrice', { defaultValue: '止盈委托价' })}
                  value={
                    tpslOrder[TP_SL_FORM_FIELDS.TP_MODE] === TP_SL_MODE.MARKET
                      ? t('marketOrderShort')
                      : `${toThousandsNumberNoZero(
                          tpslOrder[TP_SL_FORM_FIELDS.TP_ORDER],
                          tickSizeFraction,
                        )} ${walletCoin}`
                  }
                />
              </If>
              <If
                condition={
                  tpslChecked &&
                  !isTpslTriggerEmpty(tpslOrder[TP_SL_FORM_FIELDS.SL_TRIGGER])
                }
              >
                <OcModalRow
                  label={t('slTriggerPrice', { defaultValue: '止损触发价' })}
                  value={`${toThousandsNumberNoZero(
                    tpslOrder[TP_SL_FORM_FIELDS.SL_TRIGGER],
                    tickSizeFraction,
                  )} ${walletCoin}`}
                />
                <OcModalRow
                  label={t('slOrderPrice', { defaultValue: '止损委托价' })}
                  value={
                    tpslOrder[TP_SL_FORM_FIELDS.SL_MODE] === TP_SL_MODE.MARKET
                      ? t('marketOrderShort')
                      : `${toThousandsNumberNoZero(
                          tpslOrder[TP_SL_FORM_FIELDS.SL_ORDER],
                          tickSizeFraction,
                        )} ${walletCoin}`
                  }
                />
              </If>
            </div>
            <div className="oc__row-top--16">
              <Checkbox
                checked={hidePreCreate}
                onChange={(e) => setHideCreateConfirm(e.target.checked)}
              >
                <span className="oc_dialog-tip">
                  {t('noDoubleConfirmDialog')}
                </span>
              </Checkbox>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
});

export default OrderCreationPanel;
