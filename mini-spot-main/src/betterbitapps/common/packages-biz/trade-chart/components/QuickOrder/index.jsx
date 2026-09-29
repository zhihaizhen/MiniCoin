import { useLocalStorageState } from 'ahooks';
import BigNumber from 'bignumber.js';
import { intercept, toThousands } from '@unified/helpers';
import { QUICK_ORDER_POSITION_KEY } from 'common/packages-biz/global-settings/localStorageSettings';
import { ReactComponent as DragIcon } from 'common/assets/images/quickOrder/drag.svg';
import { ReactComponent as CloseIcon } from 'common/assets/images/quickOrder/close.svg';
import { message, InputNumber } from 'common/antdComponents';
import useOrderCoinTypeInfo from '@/hooks/use-orderCoinType-info';
import useCurSymbolQuoteStream from 'common/public-ws/stream-hooks/use-instrument-stream';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store-hooks/use-user-store';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import { getQtyByLotsize } from '@/utils/getQtyByLotsize';
import { transformWcToCc } from 'common/utils/calcWithContractType';
import styles from './index.module.less';

const initPositionOffset = { x: 0, y: 20 };

const QuickOrder = ({
  leftBtnText,
  rightBtnText,
  bid1,
  ask1,
  precision,
  onBuy,
  onSell,
  needLoading,
  onInputFocus,
  formattedBid1,
  formattedAsk1,
  symbol,
  handleSetShowQuickOrder,
}) => {
  const [t] = useTranslation();

  const [buy1, setBuy1] = useState(bid1);
  const [sell1, setSell1] = useState(ask1);
  const [qty, setQty] = useState(undefined); // 输入框展示的数量

  // mask
  const [QODragging, setQODragging] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [defaultPosition, setDefaultPosition] = useLocalStorageState(
    QUICK_ORDER_POSITION_KEY,
    undefined,
  );
  const { unitFraction, unitTick, unit, isWalletCoinMode } = useOrderCoinTypeInfo();
  const { lastPriceNumber } = useCurSymbolQuoteStream();
  const { orderCoinTypeValue } = useUserStore();
  const {
    minTradeAmount,
    lotSize,
    lotFraction,
  } = useCurSymbolConfig();
  const isInverse = false;


  // 计算最小数量,不分方向
  const minSize = useMemo(() => {
    if (!isWalletCoinMode) {
      const formatRes = transformWcToCc(minTradeAmount, lastPriceNumber, isInverse);
      // 将金额转化为数量，比如计算后数量为0.000077，则向上取整为0.00008
      return new BigNumber(formatRes).toFixed(lotFraction);
    }
    return minTradeAmount; // 最小下单金额
  }, [
    lastPriceNumber,
    orderCoinTypeValue,
    minTradeAmount,
  ]);


  useEffect(() => {
    if (!Number.isNaN(bid1)) {
      setBuy1(bid1);
    }
  }, [bid1]);

  useEffect(() => {
    if (!Number.isNaN(ask1)) {
      setSell1(ask1);
    }
  }, [ask1]);

  useEffect(() => {
    handleQty(undefined);
  }, [symbol, orderCoinTypeValue]);

  const getTransformQtyBySide = () => {
    // 将wc转换为cc
    if (isWalletCoinMode) {
      const value = transformWcToCc(qty, lastPriceNumber, isInverse);
      const afterValue = getQtyByLotsize(lotSize, value, lotFraction); //
      return afterValue;
    }
    return qty;
  };

  const handleQty = (value) => {
    setQty(value);
  };

  const handleBuy = () => {
    if (lotSize > 1 && qty % lotSize !== 0) {
      message.error(
        t('qtyErrorTickTip', { tickSize: toThousands(lotSize, precision) }),
      );
      return;
    }
    if (qty < minSize) {
      message.error(
        t('minOrderQtyRequiredMsg', { value: minSize, unit }),
      );
      return;
    }
    // 如果大于最大值，后端会拦截，前端不处理
    if (needLoading) {
      setBuyLoading(true);
    }
    const newQty = getTransformQtyBySide('Buy');
    onBuy(
      sell1,
      newQty,
      qty,
      () => {
        setBuyLoading(false);
      },
      () => {
        handleQty(undefined);
      },
    );
  };

  const handleSell = () => {
    if (lotSize > 1 && qty % lotSize !== 0) {
      message.error(
        t('qtyErrorTickTip', { tickSize: toThousands(lotSize, precision) }),
      );
      return;
    }

    if (qty < minSize) {
      message.error(
        t('minOrderQtyRequiredMsg', { value: minSize, unit }),
      );
      return;
    }

    if (needLoading) {
      setSellLoading(true);
    }
    const newQty = getTransformQtyBySide('Sell');
    onSell(
      buy1,
      newQty,
      qty,
      () => {
        setSellLoading(false);
      },
      () => {
        handleQty(undefined);
      },
    );
  };

  const handleClose = () => {
    handleSetShowQuickOrder(false);
  };


  return (
    <>
      <div className={QODragging ? styles.dragMask : ''} />
      <Draggable
        handle=".draggable"
        bounds="parent"
        onStart={() => setQODragging(true)}
        onStop={(e, p) => {
          setDefaultPosition({
            x: p.x,
            y: p.y,
          });
          setQODragging(false);
        }}
        positionOffset={initPositionOffset}
        defaultPosition={defaultPosition}
      >
        <div className={`${styles.quickOrder} flex`}>
          <div className={`${styles.dragHandle} draggable`}>
            <DragIcon />
          </div>
          <div
            className={`flex ${styles.orderBtn} ${styles.buyBtn} f-12 nowrap`}
            onClick={handleBuy}
          >
            {buyLoading && (
              <span className="circle-loading icon iconfont icon-loading f-12" />
            )}
            {!buyLoading && (
              <>
                <span className={styles.buyTitle}>{leftBtnText}</span>
                <span>{formattedAsk1}</span>
              </>
            )}
          </div>
          <div className={styles.qtyWrapper}>
            <div className={styles.label}>{`${t('quantity')}(${unit})`}</div>
            <InputNumber
              className={styles.qtyInput}
              textAlign="center"
              min={unitTick}
              value={qty}
              precision={unitFraction}
              placeholder={t('pls_enter_qty')}
              onChange={handleQty}
              onFocus={onInputFocus}
            />
          </div>

          <div
            className={`flex ${styles.orderBtn} ${styles.sellBtn} f-12 nowrap`}
            onClick={handleSell}
          >
            {sellLoading && (
              <span className="circle-loading icon iconfont icon-loading f-12" />
            )}
            {!sellLoading && (
              <>
                <span className={styles.sellTitle}>{rightBtnText}</span>
                <span>{formattedBid1}</span>
              </>
            )}
          </div>
          <div className={`${styles.dragHandle} draggable`} onClick={handleClose}>
            <CloseIcon />
          </div>
        </div>
      </Draggable>
    </>
  );
};
QuickOrder.defaultProps = {
  // maxQty: Infinity,
  needLoading: false,
  onInputFocus: undefined,
  symbol: '',
  precision: 0,
  // lotSize: undefined,
};

QuickOrder.propTypes = {
  leftBtnText: PropTypes.string.isRequired,
  rightBtnText: PropTypes.string.isRequired,
  bid1: PropTypes.number.isRequired,
  ask1: PropTypes.number.isRequired,
  // minQty: PropTypes.number.isRequired,
  // maxQty: PropTypes.number,
  precision: PropTypes.number,
  // lotSize: PropTypes.number,
  onBuy: PropTypes.func.isRequired,
  onSell: PropTypes.func.isRequired,
  onInputFocus: PropTypes.func,
  needLoading: PropTypes.bool,
  formattedBid1: PropTypes.string.isRequired,
  formattedAsk1: PropTypes.string.isRequired,
  symbol: PropTypes.string,
  handleSetShowQuickOrder: PropTypes.func.isRequired,
};

export default React.memo(QuickOrder);
