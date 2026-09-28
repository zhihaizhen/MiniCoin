// @ts-nocheck
// import pushEvent from '@region/by-gtm';
import { Tooltip } from 'antd';
import { toThousands, transformNum } from '@unified/helpers';
import cls from 'classnames';
import { notify } from 'common/antdComponents';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ORDER_COIN_TYPE } from 'common/packages-biz/global-settings/usdt-settings';
import useOrderCoinTypeInfo from '@/hooks/use-orderCoinType-info';
import useUserStore from '@/store-hooks/use-user-store';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import useOrderStore from '@/store-hooks/use-order-store';
import { useGlobalState } from '@/store';
import { cancelOrderBatch } from '@/services/order.service';
import { ORDER_BOOK_STATUS } from '@/constants/types';
import { getWalletCoinOb } from '@/utils/caclUtils';
import { numberFormat, toNumberZero } from 'common/utils/utils';
import ObQtyRow from './ObQtyRow';
import Style from './order-book.module.less';

// 数据处理
const transNewList = (obList, activityList) => {
  const alist = [];
  obList.forEach((ob, index) => {
    const next = obList[index + 1];
    const obPrice = toNumberZero(ob?.price);
    const nextObPrice = toNumberZero(next?.price);
    activityList.forEach((activity, aIndex) => {
      const activePrice = Number(activity.price);
      if (alist.some((i) => i === aIndex)) return;
      if (
        obPrice === activePrice ||
        (index < obList.length - 1 &&
          activePrice < obPrice &&
          activePrice > nextObPrice)
      ) {
        if (
          Array.isArray(ob.orders) &&
          !ob.orders.some((item) => item === activity.orderId)
        ) {
          ob.orders.push(activity.orderId);
          alist.push(aIndex);
        } else if (!Array.isArray(ob.orders)) {
          ob.orders = [activity.orderId];
          alist.push(aIndex);
        }
      }
    });
  });
  return obList;
};

const MainOB = ({
  buyList,
  sellList,
  obHeight,
  obStatus,
  handlePriceSelect,
  LastPriceAndMarkPriceDom,
}) => {
  const [t] = useTranslation();
  const [state] = useGlobalState();
  const {
    coin,
    user: { orderBookSetting },
    walletCoin,
    contractType,
  } = state;
  const showQuickOperate = orderBookSetting?.quickOperate !== 'hide';
  const { lotFraction, walletCoinOrderFraction, priceFraction } =
    useCurSymbolConfig();
  const { unit } = useOrderCoinTypeInfo();
  const { needObAnimation, loggedIn } = useUserStore();
  const { buyActivityList, sellActivityList } = useOrderStore();
  // 数据设置
  const [orderBuyList, setOrderBuyList] = useState(buyList);
  const [orderSellList, setOrderSellList] = useState(sellList);
  const [cancelLoad, updateCancelLoading] = useState();

  const handlerCancelOrder = useCallback(
    ({ Id, orders }) => {
      if (cancelLoad) return;
      updateCancelLoading(Id);
      cancelOrderBatch({
        symbol: state.symbol,
        orderIds: orders,
      })
        .then(({ orderIds }) => {
          const title = t('cancelSuccess');
          let desc = '';
          if (Array.isArray(orderIds)) {
            if (orderIds.length === orders.length) {
              desc = t('cancelBatchSuccess', { size: orderIds.length });
            } else {
              desc = t('cancelBatchPartialSuccess', {
                size: orderIds.length,
                failSize: orders.length - orderIds.length,
              });
            }
          }
          notify.success(title, desc);
        })
        .catch(() => {
          const title = t('CancelFailure');
          notify.error(title, '');
        })
        .finally(() => {
          updateCancelLoading();
        });
    },
    [cancelLoad, state.symbol, t],
  );

  useEffect(() => {
    if (obStatus === ORDER_BOOK_STATUS.HOR) return;
    if (!buyActivityList || !sellActivityList) return;
    const list_buy = buyList;
    const list_sell = sellList;

    // let list_buy = transNewList(buyList, [...buyActivityList]);
    // let list_sell = transNewList(sellList, [...sellActivityList])
    // console.log("ob-list_buy:", list_buy);
    switch (obStatus) {
      case ORDER_BOOK_STATUS.BUY:
        setOrderBuyList(list_buy);
        break;
      case ORDER_BOOK_STATUS.SELL:
        setOrderSellList(list_sell);
        break;
      case ORDER_BOOK_STATUS.ALL:
        setOrderBuyList(list_buy);
        setOrderSellList(list_sell);
        break;
      default:
        break;
    }
  }, [buyList, sellList, buyActivityList, sellActivityList, obStatus, unit]);

  return (
    <>
      {/* indexprice 为Buy的时候展示 */}
      <If condition={obStatus === ORDER_BOOK_STATUS.BUY}>
        {LastPriceAndMarkPriceDom}
      </If>
      <div
        className={cls(
          { [Style['hide-ob-animation']]: loggedIn && !needObAnimation },
          `f-12 ${Style.ob__table}`,
        )}
      >
        {/* 头部 price qty total */}
        <div className={cls(Style.head)}>
          <div className={Style['ob__table-price']}>{t('price')}</div>
          <div className={Style['ob__table-qty']}>{`${t(
            'quantity',
          )}(${unit})`}</div>
          <div className={Style['ob__table-total']}>
            {`${t('cumulative')}(${unit})`}
          </div>
        </div>
        {/* sell list  */}
        <If condition={obStatus !== ORDER_BOOK_STATUS.BUY}>
          <div
            className={cls(Style['ob__table-record'], Style['ob__table-sell'])}
          >
            <For each="it" index="i" of={orderSellList}>
              <div
                key={i}
                className={cls(Style['ob__table-row'], {
                  hasOrder: it.orders && showQuickOperate,
                })}
                onClick={handlePriceSelect(it.price)}
              >
                <div
                  className={cls(Style.ob__bg, Style['ob__bg-short'])}
                  style={{ width: it.width }}
                />
                {/* 价格 */}
                <div className={`${Style['ob__table-price']} short`}>
                  {toThousands(it.price, priceFraction)}
                </div>
                {/* showQuickOperate 没用到 */}
                {/* <div className={Style["ob__table-order"]}>
                  <If condition={it.orders && showQuickOperate}>
                    <Tooltip
                      title={t('orderCancelTips', { size: it.orders.length })}
                    >
                      <span
                        className={cls('icon iconfont f-10', {
                          'icon-refresh animate-circle': cancelLoad,
                          'icon-close': !cancelLoad,
                        })}
                        onClick={() => handlerCancelOrder(it)}
                      />
                    </Tooltip>
                  </If>
                </div> */}
                {/* 数量 */}
                <div className={Style['ob__table-qty-container']}>
                  <ObQtyRow
                    size={
                      unit === walletCoin
                        ? numberFormat(it.turnSize, 2)
                        : numberFormat(it.size, lotFraction)
                    }
                    inc={it.inc}
                  />
                </div>

                {/* 累计 = 当前数量*当前价格 + 上一个累计值 */}
                <div className={Style['ob__table-total']}>
                  <div>
                    {unit === walletCoin
                      ? numberFormat(it.turnTotal, 2)
                      : numberFormat(it.total, lotFraction)}
                  </div>
                </div>
              </div>
            </For>
          </div>
        </If>
        {/* 中间indexprice  */}
        <If condition={obStatus !== ORDER_BOOK_STATUS.BUY}>
          {LastPriceAndMarkPriceDom}
        </If>
        {/* buy list */}
        <If condition={obStatus !== ORDER_BOOK_STATUS.SELL}>
          <div
            className={cls(Style['ob__table-record'], Style['ob__table-buy'])}
          >
            <For each="it" index="i" of={orderBuyList}>
              <div
                key={it.Id}
                className={cls(Style['ob__table-row'], {
                  hasOrder: it.orders && showQuickOperate,
                })}
                onClick={handlePriceSelect(it.price)}
              >
                <div
                  className={cls(Style.ob__bg, Style['ob__bg-long'])}
                  style={{ width: it.width }}
                />
                <div className={`${Style['ob__table-price']} long`}>
                  {toThousands(it.price, priceFraction)}
                </div>
                {/* <div className={Style["ob__table-order"]}>
                  <If condition={it.orders && showQuickOperate}>
                    <Tooltip
                      title={t('orderCancelTips', { size: it.orders.length })}
                    >
                      <span
                        className={cls(
                          'icon iconfont icon-close f-10',
                        )}
                        onClick={() => handlerCancelOrder(it)}
                      />
                    </Tooltip>
                  </If>
                </div> */}
                {/* 数量 */}
                <div className={Style['ob__table-qty-container']}>
                  <ObQtyRow
                    size={
                      unit === walletCoin
                        ? numberFormat(it.turnSize, 2)
                        : numberFormat(it.size, lotFraction)
                    }
                    inc={it.inc}
                  />
                </div>

                {/* 累计 */}
                <div className={Style['ob__table-total']}>
                  <div>
                    {unit === walletCoin
                      ? numberFormat(it.turnTotal, 2)
                      : numberFormat(it.total, lotFraction)}
                  </div>
                </div>
              </div>
            </For>
          </div>
        </If>
      </div>
    </>
  );
};

MainOB.defaultProps = {
  obHeight: 0,
  buyList: [],
  sellList: [],
  obStatus: undefined,
  handlePriceSelect: undefined,
  LastPriceAndMarkPriceDom: undefined,
};

MainOB.propTypes = {
  obHeight: PropTypes.number,
  buyList: PropTypes.array,
  sellList: PropTypes.array,
  obStatus: PropTypes.string,
  handlePriceSelect: PropTypes.func,
  LastPriceAndMarkPriceDom: PropTypes.element,
};

export default MainOB;
