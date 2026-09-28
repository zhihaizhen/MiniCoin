// import pushEvent from '@region/by-gtm';
import { Tooltip, Spin } from 'antd';
import { Select, Option } from 'common/antdComponents';
import cls from 'classnames';
import {
  ORDER_BOOK_TAB_MAP,
  ORDER_BOOK_STATUS,
} from 'common/packages-biz/global-settings/usdt-settings';
import useCurSymbolQuoteStream from 'common/public-ws/stream-hooks/use-instrument-stream';
import useOrderbookStream from 'common/public-ws/stream-hooks/use-orderbook-stream';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import { types, useGlobalState } from '@/store';
import MainOB from './MainOB';
import { getWalletCoinOb, addTotal, addWidth, calcOrderbookHeight } from '@/utils/caclUtils';
import { ReactComponent as OrderAllSvg } from 'common/assets/images/ob/all.svg';
import { ReactComponent as OrderBuySvg } from 'common/assets/images/ob/long.svg';
import { ReactComponent as OrderSellSvg } from 'common/assets/images/ob/short.svg';
import Styles from './order-book.module.less';

const orderBookIconMap = {
  orderAll: OrderAllSvg,
  orderBuy: OrderBuySvg,
  orderSell: OrderSellSvg,
};

const OrderBookTabIcon = ({ iconName }) => {
  const IconComponent = orderBookIconMap[iconName];
  return <IconComponent className={Styles.orderStatusIcon} />;
};

const OrderBook = ({ width, height }) => {
  const obAnimateRef = useRef();
  const [t] = useTranslation();
  const [obHeight, setObHeight] = useState(0);
  const [state, dispatchGlobal] = useGlobalState();
  const {
    symbol,
    symbolFullName,
    walletCoin,
    coin,
    obDepthInfo,
    user: { orderCoinType }, 
  } = state;

  const [obStatus, setObStatus] = useState(ORDER_BOOK_STATUS.ALL); // 显示买卖双方ob  'All',  'Buy', 'Sell', 'Horizontal'（去掉了）
  const { orderbookData, loaded, setLoaded } = useOrderbookStream();
  const { formattedClosePrice } = useCurSymbolQuoteStream();
  const { symbolDepths } = useCurSymbolConfig();

  const [depth, setDepth] = useState(symbolDepths?.[0]?.value);
  const [sellList, setSellList] = useState([]);
  const [buyList, setBuyList] = useState([]);
  const [highlightRef, setHighlightRef] = useState(null);

  useEffect(() => {
    const current = symbolDepths?.[0] || {};
    setDepth(current?.value);
    dispatchGlobal({ type: types.SET_ORDER_BOOK_LEVEL, depthInfo: current?.meta
    });
  }, [symbolFullName]);

  useEffect(() => {
    if (!loaded) return;
    if (obAnimateRef.current) cancelAnimationFrame(obAnimateRef.current);
    obAnimateRef.current = window.requestAnimationFrame(() => {
      const {
        rxBuyList,
        rxSellList,
      } = orderbookData;

      let [slicedBuyList, slicedSellList] = [rxBuyList, rxSellList];
      const [calculatedHeight, showLevel] = calcOrderbookHeight(height, false);
      const showTmpLevel = showLevel > 40 ? 40 : showLevel;
      switch (obStatus) {
        case ORDER_BOOK_STATUS.BUY:
          slicedBuyList = slicedBuyList.slice(0, showTmpLevel * 2);
          slicedSellList = [];
          break;
        case ORDER_BOOK_STATUS.SELL:
          slicedBuyList = [];
          slicedSellList = slicedSellList.slice(-showTmpLevel * 2);
          break;
        default:
          // ALL
          slicedBuyList = slicedBuyList.slice(0, showTmpLevel);
          slicedSellList = slicedSellList.slice(-showTmpLevel);
          break;
      }
      //  给数据增加total 字段
      const sellListHasTotal = slicedSellList.reduceRight((p, c) => addTotal(p, c), []).reverse();
      const buyListHasTotal = slicedBuyList.reduce((p, c) => addTotal(p, c), []);

      // console.log("ob1-slicedSellList:", [...slicedSellList], "ob-sellListHasTotal", sellListHasTotal);
      // console.log("ob1-slicedBuyList:", [...slicedBuyList], "ob-buyListHasTotal:", buyListHasTotal);

      //  给数据增加width 字段，用于样式展示
      const sellMax = sellListHasTotal.length > 0 ? sellListHasTotal[0].total : 0;
      const buyMax = buyListHasTotal.length > 0 ? buyListHasTotal[buyListHasTotal.length - 1].total : 0;
      const maxSize = Math.max(buyMax, sellMax);

      let resultSellList = addWidth(sellListHasTotal, maxSize);
      let resultBuyList = addWidth(buyListHasTotal, maxSize);
      //  u下单的时候，需要把btc换算成usdt
        if (orderCoinType?.[symbolFullName] === walletCoin) {
        resultSellList = getWalletCoinOb(false, 'SELL', resultSellList);
        resultBuyList = getWalletCoinOb(false, 'BUY', resultBuyList);
      }
      setObHeight(calculatedHeight);
      setBuyList(resultBuyList);
      setSellList(resultSellList);
    });
  }, [symbol, orderbookData, height, loaded, obStatus]);

  const handlePriceSelect = (price) => () =>
    dispatchGlobal({ type: types.SET_QUICK_PRICE, price });

  const handleDepthChange = (value, option) => {
    // console.log('step1,修改步长value, option', value, option);
    if (obDepthInfo?.value === value) return;
    setLoaded(false);
    dispatchGlobal({ type: types.SET_ORDER_BOOK_LEVEL, depthInfo: option.meta });
    setDepth(value);
  };

  const guideHighlightRef = useCallback((node) => {
    if (node !== null) {
      setHighlightRef(node);
    }
  }, []);

  const LastPriceAndMarkPriceDom = (
    <div ref={guideHighlightRef} className={Styles.ob__current}>
      <span className={Styles['ob__market-price-bg']}>
        <span
          className={cls(`bold ${Styles['ob__market-price']}`)}
        >
          {formattedClosePrice ?? '--'}
        </span>
      </span>
    </div>
  );

  return (
    <div className={Styles['order-book-container']}>
      <Choose>
        <When condition={loaded}>
          <div className={`flex ${Styles.ob_table_filter_head} space-between`}>
            {/* icon */}
            <div className={`${Styles.ob_table_filter} flex space-between`}>
              <For each="item" of={ORDER_BOOK_TAB_MAP}>
                <Tooltip key={item.type} title={t(item.desc)}>
                  <span
                    key={item.type}
                    className={cls(
                      `${Styles.orderStatus}`,
                      `${Styles[`${obStatus === item.type ? 'on' : ''}`]}`,
                    )}
                    onClick={() => {
                      if (obStatus === item.type) return;
                      setObStatus(item.type);
                    }}
                  >
                    <OrderBookTabIcon iconName={item.iconName} />
                  </span>
                </Tooltip>
              </For>
            </div>
            {/* 步长选择 */}
            <Select
              className={cls(Styles['ob-step-wrapper'], {
                [Styles['ob-head__depth-small']]: width <= 2,
              })}
              value={depth}
              onChange={handleDepthChange}
              suffixIcon={<span className="icon iconfont icon-xia" />}
              options={symbolDepths}
            />
          </div>
          <MainOB
            buyList={buyList}
            sellList={sellList}
            // obHeight={obHeight}
            obStatus={obStatus}
            handlePriceSelect={handlePriceSelect}
            LastPriceAndMarkPriceDom={LastPriceAndMarkPriceDom}
          />
        </When>
        <Otherwise>
          <div className={`flex ${Styles['ob-loading']}`}>
            <Spin />
          </div>
        </Otherwise>
      </Choose>
    </div>
  );
};

OrderBook.defaultProps = {
  width: 2,
  height: 12,
};

OrderBook.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default OrderBook;
