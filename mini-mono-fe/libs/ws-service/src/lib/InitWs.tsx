import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
// import { getCopyTradingAssets } from './common/components/AssetsTransfer/api';
// import { addOrderId } from './common/model/httpAwsTips';
import {
  THEMES,
  TRADE_HEADER_TYPE,
  TRADE_TYPE
} from './common/packages-biz/by-global-settings';
import dynamic from 'next/dynamic';
// import {
//   MessageContainer,
//   notify,
//   NotifyContainer
// } from './common/packages/by-components';

import useAllSymbolQuoteStream from './common/public-ws/stream-hooks/use-allSymbolQuote-stream';
import useWebsocketEventStream from './common/public-ws/stream-hooks/use-wsEvent-stream';
import { getRiskLimitList } from './common/services/linearPosition.service';
// import { getSymbolTags } from './common/services/symbol.service';
// import { tracing } from '@betterbit-library/tools';
import { goSymbol } from './common/utils/symbol';
import { toNonExponential } from './common/utils/utils';

import { getTempCoinList } from './common/services/linearTrade.service';
import useUseStore from './store-hooks/use-user-store';
import { useSymbolConfig } from './store-hooks/use-symbol-config';
import { types, useGlobalState } from './store';
import createPrivateWS from './services/ws.private';
import {
  // getCopyTradingUserInfo,
  // getUserPreferences,
  toGetUserPreferences,
  getUserPrivateDetail,
  getUserPrivatePoz,
  getWsToken,
  getWsPath
} from './services/user.service';
import { exchangeRate, getWalletList } from './services/position.service';

import useMarketDataWs from './hooks/use-market-data-ws';
import useDelayPrice from './hooks/use-delay-price';
// import ByReconnect from '@/components/ByReconnect';

let privateWS: any = null;

export interface IInitWsProps {
  children: any;
  appStatus: any;
}
export default function InitWs(props: IInitWsProps) {
  const { children, appStatus } = props;
  const [state, globalDispatch, stateRef] = useGlobalState();
  const { symbol, position } = state;
  const { loggedIn, language, successAudio } = useUseStore();
  const [wsAuthFlag, setWsAuthFlag] = useState(false);
  const allSymbolQuotes = useAllSymbolQuoteStream();
  const [privateWSConnected, changePrivateWSConnected] = useState(false);
  const { delayPrice } = useDelayPrice();

  const { allSymbolConfig, allSymbolList, allTags } = useSymbolConfig();
  const [intervalId, setIntervalId] = useState(null);
  const futuresMap = useMemo(() => {
    return (
      allSymbolList?.[TRADE_TYPE.FUTURE]?.reduce(
        (fMap, { symbol, symbolName }) => {
          return { ...fMap, [symbol]: symbolName };
        },
        {}
      ) || {}
    );
  }, [allSymbolList]);

  // const handleLangChange = (lang) => {
  //   const newLang = FILTER_LANGUAGE_MAP[lang] || lang;
  //   i18n.changeLanguage(newLang, () => {
  //     document.querySelector('html').setAttribute('lang', newLang);
  //   });
  //   globalDispatch({ type: types.RESET_USER_LANGUAGE, lang: newLang });
  // };

  // 强平、自动增加保证金、自动减仓相关 -- 数据格式化
  const positionNotify = useCallback(() => {
    //
  }, []);
  const orderNotify = useCallback(() => {
    //
  }, []);
  const replaceOrderNotify = useCallback(() => {
    //
  }, []);
  /*
  const positionNotify = useCallback(
    (notice = []) => {
      const len = notice.length;
      if (len > 0) {
        for (let i = 0; i < len; i += 1) {
          let title = '';
          let desc = '';
          const {
            type,
            symbol,
            side,
            qty,
            size,
            oldLimit,
            newLimit,
            subQty,
            price,
            execPrice,
            margin
          } = reverseModel.notice(notice[i]);
          const pozSide = side === 'Buy' ? 'pozLong' : 'pozShort';
          const symbolName = futuresMap[symbol] ?? symbol;
          if (type === 'liq') {
            title = 'liqNoticeTit';
            // desc = t('liqNoticeDesc', {
            //   symbol: symbolName,
            //   side: pozSide,
            //   size: toNonExponential(size)
            // });
          } else if (type === 'sub_qty') {
            title = 'subLiqNoticeTit';
            // desc = t('subLiqNoticeDesc', {
            //   price: execPrice,
            //   symbol: symbolName,
            //   side: pozSide,
            //   subQty: toNonExponential(subQty)
            // });
          } else if (type === 'down_risk_id') {
            title = 'downRiskNoticeTit';
            // desc = t('downRiskNoticeDesc', {
            //   symbol: symbolName,
            //   oldLimit,
            //   newLimit
            // });
          } else if (type === 'add_margin') {
            if (state) {
              title = 'addMarginSucNoticeTit';
              // desc = t('addMarginSucNoticeDesc', {
              //   symbol: symbolName,
              //   side: pozSide,
              //   margin
              // });
            } else {
              notify.error('addMarginFailNoticeTit', 'addMarginFailNoticeDesc');
            }
          } else if (type === 'adl') {
            title = 'adlNoticeTit';
            // desc = t('adlNoticeDesc', {
            //   price,
            //   symbol: symbolName,
            //   side: pozSide,
            //   qty: toNonExponential(size ?? qty)
            // });
          }
          if (desc) {
            notify.info(title, desc);
          }
        }
      }
    },
    [language, futuresMap]
  );

  // 委托成交、postOnly被取消、订单被修改 -- 数据格式化及提示
  const orderNotify = useCallback(
    (orders = []) => {
      const ordersLen = orders.length;
      if (ordersLen > 0) {
        for (let i = 0; i < ordersLen; i += 1) {
          let title = '';
          let desc = '';
          const {
            execType,
            orderType,
            leavesQty,
            execQty,
            execPrice,
            symbol,
            orderId,
            side,
            reduceOnly
          } = reverseModel.execution(orders[i]);
          const symbolName = futuresMap[symbol] ?? symbol;
          // 非成交委托没有execType字段
          if (execType === 'Trade') {
            addOrderId(orderId); // 优化http-ws消息显示顺序
            const price =
              orderType === 'Market' ? t('marketLowerCase') : execPrice;
            const type = side === 'Buy' ? t('Bought') : t('Sold');
            // 埋点
            if (leavesQty > 0) {
              title = t('orderPartialFillNoticeTitle');
              desc = t('orderPartialFillNoticeDesc', {
                type,
                execQty,
                symbol: symbolName,
                price,
                leavesQty
              });
            } else {
              title = t('orderFillNoticeTitle');
              desc = t('orderFillNoticeDesc', {
                type,
                execQty,
                symbol: symbolName,
                price
              });
            }
          }
          if (desc) {
            notify.success(title, desc);
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, futuresMap]
  );

  // 委托修改
  const replaceOrderNotify = useCallback(
    (orders = []) => {
      if (orders.length > 0) {
        orders.forEach((order) => {
          let [title, desc] = ['', ''];
          const {
            origPrice,
            origQty,
            origTriggerPrice,
            symbol,
            orderId,
            triggerPrice,
            price,
            qty,
            cxlRejReason,
            side,
            orderType
          } = reverseModel.order(order);
          const symbolName = futuresMap[symbol] ?? symbol;
          if (origPrice && origPrice > 0) {
            title = t('orSuccessTit');
            desc = t('orPriceContent', {
              symbol: symbolName,
              oPrice: origPrice,
              nPrice: price
            });
            addOrderId(orderId); // 优化http-ws消息显示顺序
            notify.success(title, desc);
          } else if (origQty && origQty > 0) {
            title = t('orSuccessTit');
            desc = t('orQtyContent', {
              symbol: symbolName,
              oQty: origQty,
              nQty: qty
            });
            addOrderId(orderId); // 优化http-ws消息显示顺序
            notify.success(title, desc);
          } else if (origTriggerPrice && origTriggerPrice > 0) {
            title = t('orSuccessTit');
            desc = t('orTPriceContent', {
              symbol: symbolName,
              oTPrice: origTriggerPrice,
              nTPrice: triggerPrice
            });
            addOrderId(orderId); // 优化http-ws消息显示顺序
            notify.success(title, desc);
          }
          // 被动委托取消成功提示:
          // 1 k线区修改委托时, 先提示委托修改成功后 再提示取消成功,
          // 2 下单区下单委托时, 提示取消成功
          if (cxlRejReason === 'EC_PostOnlyWillTakeLiquidity') {
            title = t('cancelSuccess');
            desc = t('actPostOnlyOrderCancelDesc', {
              qty,
              symbol: symbolName,
              type: t(side),
              price: orderType === 'Market' ? t('marketPrice') : price
            });
            addOrderId(orderId); // 优化http-ws消息显示顺序
            notify.success(title, desc);
          }
        });
      }
    },
    [futuresMap, t]
  );
*/
  // 初始化private链接
  const initPriWs = () => {
    // ws登录失败
    privateWS.on('login_fail', () => {
      setWsAuthFlag(true);
    });
    privateWS.on('login_success', () => {
      setWsAuthFlag(false);
    });

    privateWS.private('private.position', ({ data }) => {
      globalDispatch({ type: types.UPDATE_POSITION_LIST, list: data });
    });
    privateWS.private('private.order', (res) => {
      const tpslArr = [
        'TakeProfit',
        'StopLoss',
        'PartialTakeProfit',
        'PartialStopLoss'
      ];
      const list = res?.data ?? [];
      if (list.length > 0 && tpslArr.indexOf(list[0].stopOrderType) > -1) {
        // 止盈止损
        globalDispatch({ type: types.UPDATE_POSITION_TP_SL_LIST, list });
      } else {
        globalDispatch({ type: types.UPDATE_POSITION_ORDER_LIST, list });
      }
      replaceOrderNotify(list);
    });
    privateWS.private('private.execution', ({ data }) => {
      globalDispatch({
        type: types.INSERT_MY_DEAL_LIST,
        list: data,
        option: 'update',
        symbol: state.symbol
      });
      orderNotify(data);
    });
    privateWS.private('private.closed_pnl', ({ data }) => {
      globalDispatch({ type: types.INSERT_PROFITLIST, list: data });
    });
    getUserPrivatePoz(stateRef.current.symbol, globalDispatch);
    getWalletList()
      .then((res) => {
        globalDispatch({
          type: types.SET_USER_WALLET,
          payload: res?.list || []
        });
      })
      .finally(() => {
        privateWS.private('private.wallet', ({ data }) => {
          globalDispatch({ type: types.UPDATE_USER_WALLET, payload: data });
        });
      });
    privateWS.private('private.notice', ({ data }) => positionNotify(data));
  };

  const handleLogout = () => {
    globalDispatch({ type: types.CLEAN_USER_INFO });
    globalDispatch({ type: types.RESET_USER_WALLET });
    globalDispatch({ type: types.RESET_MY_POSITION_ORDER_LIST });
  };

  // 初始化获取用户登录信息
  useEffect(() => {
    // console.log('初始化获取用户登录信息');
    const reconnectHandler = () => {
      getUserPrivateDetail(stateRef.current.symbol, globalDispatch);
    };

    async function getUserInfoCallback(res) {
      const payload = res;
      // if(!res){
      //    // 如果用户没有登录，且是从首页跳转过来则展示登录的dialog
      //   const curHomepage = `${window && window.location.origin}/`
      //   const langReg = /([a-z]{2}-[A-Z]{2})/;
      //   if(document.referrer){
      //     const referPage = document.referrer.replace(langReg, '');
      //     if(curHomepage === referPage){
      //       showConnectDialog()
      //     }
      //   }
      globalDispatch({ type: types.SET_USER_INFO, payload });
      if (payload?.currency_code) {
        exchangeRate(payload?.currency_code)
          .then((res) => {
            globalDispatch({
              type: types.SET_EXCHANGE_RATE,
              payload: { rate: res, currencyCode: payload.currency_code }
            });
          })
          .catch(() => { });
      }
      const { websocketPath } = await getWsPath();
      localStorage.setItem('WSPATH', websocketPath);
      const token = await getWsToken();
      const wsPath = `${websocketPath}?v=2&token=${token}`;
      privateWS = createPrivateWS(wsPath);
      privateWS.on('connect', () => {
        changePrivateWSConnected(true);
        privateWS.registerReconnectHandler(reconnectHandler);
      });
    }

    // dex 默认使用深色样式，不能切换主题。避免其他影响，使用的 dark主题跟 theme-dex样式覆盖
    globalDispatch({
      type: types.SET_CURRENT_THEME,
      targetThemeName: THEMES.DARK
    });
    document.getElementsByTagName('html')[0].className = 'theme-dark theme-dex';
    // useGlobalWidget({ handleLangChange, handleLogout });
    // getUserInfo(getUserInfoCallback).finally(() => {
    //   globalDispatch({ type: types.SET_PROFILE_API_LOADED, status: true });
    // });
    return () => {
      if (privateWS) privateWS.unregisterReconnectHandler(reconnectHandler);
    };
  }, []);

  // 初始化获取新的临时币种
  useEffect(() => {
    getTempCoinLists();
    const id = setInterval(async () => {
      getTempCoinLists();
    }, 10000);
    setIntervalId(id);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const getTempCoinLists = async () => {
    const data = await getTempCoinList();
    globalDispatch({ type: types.SET_SYMBOL_TEMP_LIST, data });
  };

  useEffect(() => {
    globalDispatch({
      type: types.SET_SYMBOL_AND_COIN,
      symbolConfig: {
        ...state,
        ...appStatus.initState
      }
    });
  }, [appStatus]);
  // 订阅公共行情数据
  useMarketDataWs();

  // 公共行情ws连接状态
  useWebsocketEventStream();

  // useEffect(() => {
  // tracing.init({
  //   project_type: 'Derivatives',
  //   project_name: 'Trade',
  //   symbol_type: 'usdt_perpetual',
  //   symbol_name: state.symbol
  // });

  // tracing.push('event', 'PageView', {});
  // }, [language, state.symbol]);

  // 私有推送首次连接成功
  useEffect(() => {
    if (privateWSConnected) {
      initPriWs(symbol);
    }
  }, [privateWSConnected, symbol]);

  useEffect(() => {
    if (privateWSConnected && !loggedIn) {
      resetWs();
    }

    if (loggedIn) {
      getRiskLimitList({ symbol }).then((res) => {
        globalDispatch({ type: types.SET_USER_RISK_LIMIT, payload: res?.list });
      });
    }
    globalDispatch({ type: types.RESET_MY_POSITION_ORDER_LIST });
    globalDispatch({ type: types.RESET_USER_WALLET });
    return () => { };
  }, [loggedIn, symbol]);

  useEffect(() => {
    if (loggedIn) {
      // 合并请求
      toGetUserPreferences([
        'showAssets',
        'bookSymbolSequence',
        'closePositionStatus',
        'klineCancelOrderTipStatus',
        'bookSymbolPreferSet',
        'orderBookPreferSet',
        'reverseClickTipStatus'
      ]).then((res) => {
        const { preferences } = res || {};
        const {
          closePositionStatus = 'show',
          klineCancelOrderTipStatus = 'show',
          bookSymbolPreferSet = 'bookSymbolChangeRateSet', // 取值还有bookSymbolLastPriceSet
          reverseClickTipStatus = 'show',
          orderBookPreferSet, // 比较特殊"{\"quickOperate\":\"hide\"}" quickOperate
          showAssets = '1',
          bookSymbolSequence = ''
        } = preferences || {};

        // 资产
        localStorage.setItem('showAssets', showAssets);

        // 获取用户的 收藏symbol
        globalDispatch({
          type: types.SET_BOOK_SYMBOL_LIST,
          data: bookSymbolSequence
        });

        // K线相关
        globalDispatch({
          type: types.SET_CLOSE_POSITION_TIP_STATUS,
          status: closePositionStatus
        }); // setting->Pop-Up Confirmation Windows-> Quick Close
        globalDispatch({
          type: types.SET_CANCEL_ORDER_TIP_STATUS,
          status: klineCancelOrderTipStatus
        }); // setting->Pop-Up Confirmation Windows-> Quick Cancel
        globalDispatch({
          type: types.SET_BOOK_SYMBOL_PREFER_SETTING,
          status: bookSymbolPreferSet
        }); // setting->Favorite Trading Pairs
        globalDispatch({
          type: types.SET_REVERSE_CLICK_TIP_STATUS,
          status: reverseClickTipStatus
        }); // setting->Pop-Up Confirmation Windows-> Quick Reversal
        // 默认关闭不取后端接口
        // globalDispatch({
        //   type: types.SET_ORDER_BOOK_SETTING,
        //   status: orderBookPreferSet,
        // }); // setting->Quick Cancel Active Orders
      });
    }
  }, [loggedIn]);

  useEffect(() => {
    const reconnectHandler = () => {
      globalDispatch({ type: types.NETWORK_CHANGE, show: false });
    };
    const closeHandler = () => {
      globalDispatch({ type: types.NETWORK_CHANGE, show: true });
    };

    if (loggedIn && privateWSConnected) {
      privateWS.on('reconnect', reconnectHandler);
      privateWS.on('close', closeHandler);
    }
    return () => {
      if (loggedIn) {
        privateWS?.off('reconnect', reconnectHandler);
        privateWS?.off('close', closeHandler);
      }
    };
  }, [loggedIn, privateWSConnected]);

  // reset private 链接
  const resetWs = () => {
    privateWS.leave('private.position');
    privateWS.leave('private.wallet');
    privateWS.leave('private.order');
    privateWS.leave('private.execution');
    privateWS.leave('private.closed_pnl');
  };

  useEffect(() => {
    let icon = '';
    if (!allSymbolQuotes[state.symbol]) return;
    const { isLastPricePlus, isLastPriceMinus } = allSymbolQuotes[state.symbol];
    if (isLastPricePlus) icon = '▲';
    else if (isLastPriceMinus) icon = '▼';
    document.title = `${icon} ${delayPrice} | ${'Trade'} ${state.symbol
      } | ${'PerpetualContracts'}`;
  }, [allSymbolQuotes, state.symbol, delayPrice]);

  // 根据路由修改标签
  useEffect(() => {
    const linkArr = document.getElementsByTagName('link');
    for (let i = 0; i < linkArr.length; i += 1) {
      if (linkArr[i].rel === 'canonical') {
        linkArr[i].href = `${window && window.location.origin}${window && window.location.pathname
          }`;
      }
    }
  }, [state.symbol]);

  useEffect(() => {
    const visibilitychange = () => {
      const visibility = !document.hidden;
      globalDispatch({ type: types.VISIBILITY_CHANGE, visibility });
    };
    document.addEventListener('visibilitychange', visibilitychange, false);
    return () => {
      document.removeEventListener('visibilitychange', visibilitychange, false);
    };
  }, []);

  const handleSymbolChange = (s) => {
    // { symbol, symbolName, [quarter: CurQ | NextQ | NNextQ] }
    const symbol = s?.symbol || s;
    const symbolConfig = allSymbolConfig[symbol];
    if (symbolConfig) {
      goSymbol(symbolConfig).then(() =>
        globalDispatch({
          type: types.SET_SYMBOL_AND_COIN,
          symbolConfig
        })
      );
    }
  };

  // wx auth失败提示弹框 点击取消按钮埋点
  const authFailTipsCancel = () => {
    setWsAuthFlag(false);
  };
  // wx auth失败提示弹框 点击成功回调reload
  const authFailTipsConfirm = () => {
    window && window.location.reload();
  };
  return <div>{children}</div>;
}
