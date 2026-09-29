import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConfigProvider, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import executionSound from 'common/assets/audio/excution-sound.mp3';
import AuthFailTips from 'common/components/AuthFailTips/index';
import useAudioHook from 'common/hooks/use-audio-hook';
import useCurSymbolQuoteStream from 'common/public-ws/stream-hooks/use-instrument-stream';
import useAllSymbolQuoteStream from 'common/public-ws/stream-hooks/use-allSymbolQuote-stream';
import { storage } from 'by-storage';
import useGlobalWidget, { getUserInfo } from 'common/hooks/use-global-widget';

import {
  MessageContainer,
  notify,
  NotifyContainer,
} from 'common/antdComponents';
import useWebsocketEventStream from 'common/public-ws/stream-hooks/use-wsEvent-stream';
import { tracing } from '@betterbit-library/tools';
// import { startReportError, startReportPerformance } from 'common/utils/monitor';
import { consoleLog } from 'common/utils/consoleLog';
import { LOCALE_CURRENCY_MAP } from '@/utils/langToCurrency';
import useUseStore from '@/store-hooks/use-user-store';
import { types, useGlobalState } from '@/store';
import {
  getTransferConfig,
  allFiatRate,
  getWalletList,
} from '@/services/assets.service';
import createPrivateWS from '@/services/ws.private';
import {
  toGetUserPreferences,
  getWsToken,
  getPrivateInfo,
  getUserBaseInfo,
  getTradeSectionCategory,
} from '@/services/user.service';
import usePublicWsData from '@/hooks/use-public-ws-data';
import useDelayPrice from '@/hooks/use-delay-price';
import { FILTER_LANGUAGE_MAP } from '@/constants/types';
import Reconnect from '@/components/Reconnect';
import Main from './containers/Main';
import { getColorPreference } from './utils/getColorPreference';
import {
  getTradeTheme,
  setTradeTheme,
} from 'common/packages-biz/global-settings';
import LanguageRouter from 'common/components/LanguageRouter';
import { ensureLanguagePrefix } from './utils/easy-router';
import { PLAN_TYPE } from './containers/position/constant';

// plan_order 家族（计划委托/止盈止损）的终态取值：与 order 家族不同，
// 没有 FILLED，触发成交对应 TRIGGERED；一并列出撤销/过期/失败
const PLAN_ORDER_TERMINAL_STATUSES = [
  'CANCELED',
  'CANCELLED',
  'TRIGGERED',
  'EXPIRED',
  'FAILED',
];

// 判断 WS 推送项 data 是否已存在于 bucket 中（按 orderId 或 plan_order_id/orderKey 命中），
// 用于区分「新增/终态」与「非终态字段级更新（如编辑止盈止损）」，避免重复弹通知
const entrustItemExistedIn = (bucket, data) =>
  (bucket?.data || []).some((item) => {
    if (
      item.orderId != null &&
      data.orderId != null &&
      item.orderId === data.orderId
    ) {
      return true;
    }
    const itemPlanId = item.plan_order_id ?? item.orderKey;
    const dataPlanId = data.plan_order_id ?? data.orderKey;
    return (
      itemPlanId != null &&
      dataPlanId != null &&
      String(itemPlanId) === String(dataPlanId)
    );
  });

let privateWS = null;

const App = () => {
  const [state, globalDispatch, stateRef] = useGlobalState();
  const { symbol } = state;
  const { loggedIn, language, playSuccessAudio } = useUseStore();
  const [wsAuthFlag, setWsAuthFlag] = useState(false);
  const [privateWSConnected, changePrivateWSConnected] = useState(false);
  // const { delayPrice } = useDelayPrice();
  const { formattedClosePrice } = useCurSymbolQuoteStream();
  const allSymbolQuotes = useAllSymbolQuoteStream();
  const [t, i18n] = useTranslation();
  const successAudioRef = useRef(null);
  successAudioRef.current = playSuccessAudio;
  const audio = useAudioHook(executionSound);
  const shapeTimersRef = useRef([]);

  const resetRootClassName = useCallback(() => {
    const colorPreference = getColorPreference();
    const tradeTheme = getTradeTheme();
    document.getElementsByTagName(
      'html',
    )[0].className = `${tradeTheme} theme-trade ${colorPreference}`;
  }, []);

  const handleLangChange = (lang) => {
    const newLang = FILTER_LANGUAGE_MAP[lang] || lang;
    i18n.changeLanguage(newLang, () => {
      document.querySelector('html').setAttribute('lang', newLang);
    });
    resetRootClassName();
    globalDispatch({ type: types.RESET_USER_LANGUAGE, lang: newLang });
    const v = LOCALE_CURRENCY_MAP[newLang] || 'USD';
    globalDispatch({
      type: types.SET_EXCHANGE_RATE,
      payload: {
        currencyCode: v,
      },
    });
  };

  const handleThemeChange = (theme) => {
    setTradeTheme(theme);
    resetRootClassName();
    globalDispatch({ type: types.SET_CURRENT_THEME, targetThemeName: theme });
  };

  // 委托订单提示
  const entrustOrderNotify = useCallback(
    (orders = []) => {
      if (!Array.isArray(orders)) return;
      const ordersLen = orders.length;
      if (ordersLen > 0) {
        for (let i = 0; i < ordersLen; i += 1) {
          const {
            baseTokenName,
            price,
            type,
            side,
            status,
            origQty,
            executedQty,
          } = orders[i];
          //  limit委托单 ，通知委托下单成功，委托取消成功，
          if (type === 'LIMIT') {
            if (status === 'NEW') {
              // 委托创建成功
              // 将以 {{price}} 价格 {{side}} {{qty}} {{coin}}。
              const titleKey = 'orderCreateSuccessTitle';
              const descKey = 'orderCreateSuccess';
              const sideT = side === 'BUY' ? t('orderBuy') : t('orderSell');
              notify.success(
                t(titleKey),
                t(descKey, {
                  price,
                  side: sideT,
                  qty: origQty,
                  coin: baseTokenName,
                }),
              );
            } else {
              notify.success(t('orderCreateCancelTitle'));
            }
          }
        }
      }
    },
    [language],
  );

  // 成交订单提示
  const dealOrderNotify = useCallback(
    (orders = []) => {
      if (!Array.isArray(orders)) return;
      const ordersLen = orders.length;
      if (ordersLen > 0) {
        for (let i = 0; i < ordersLen; i += 1) {
          const { baseTokenName, price, side, quantity } = orders[i];
          // 订单已成交
          // 以{{price}}价格{{type}}{{execQty}} {{symbol}}，订单已全部成交。
          const title = t('orderFillNoticeTitle');
          // orderPartialFillNoticeTitle 订单部分成交
          const desc = t('orderFillNoticeDesc', {
            type: t(side),
            execQty: quantity,
            symbol: baseTokenName,
            price,
          });
          notify.success(t(title), t(desc));
          // 播放已成交提示音
          if (successAudioRef.current === true) {
            audio?.play().catch(() => {});
          }
        }
      }
    },
    [language],
  );

  // Update resetWs to be more thorough
  const resetWs = () => {
    if (privateWS) {
      consoleLog('Resetting WebSocket subscriptions');
      try {
        privateWS.leave('ws.spot.balance');
        privateWS.leave('ws.spot.order');
        privateWS.leave('ws.spot.plan_order');
        privateWS.leave('ws.spot.match');
        // Remove auth event listeners
        privateWS.removeAllListeners('login_fail');
        privateWS.removeAllListeners('login_success');
      } catch (err) {
        console.error('Error resetting WebSocket subscriptions:', err);
      }
    }
  };

  // Update initWs to include better error handling
  const initWs = () => {
    try {
      consoleLog('Initializing WebSocket subscriptions');
      privateWS.on('login_fail', () => {
        consoleLog('WebSocket login failed');
        setWsAuthFlag(true);
      });

      privateWS.on('login_success', () => {
        consoleLog('WebSocket login successful');
        setWsAuthFlag(false);
      });

      // 创建、取消、完成订单，以及编辑止盈止损（字段级更新，WS 已支持带上最新
      // profitPrice/stopPrice）时都会推送；仅处理限价/市价（order 家族），
      // 计划委托与止盈止损改由下方 ws.spot.plan_order 频道承接
      privateWS.private('ws.spot.order', (res) => {
        const list = res?.data ?? [];
        if (list.length > 0) {
          const first = list[0];
          const isTerminal =
            first.status === 'CANCELED' || first.status === 'FILLED';
          // 已在当前列表中的 orderId 再次推送、且非终态：视为编辑止盈止损等
          // 字段级更新，reducer 会原地合并而不是当成新单插入，这里也不重复弹提示
          const existed = entrustItemExistedIn(
            stateRef.current?.position?.currentEntrustList,
            first,
          );
          // 插入/原地合并/移除统一交给 reducer 按 orderId 命中判断
          globalDispatch({ type: types.UPDATE_CURRENT_ENTRUST_LIST, list });
          if (isTerminal) {
            // 保证限价的撤销/成交在历史委托中展示
            globalDispatch({ type: types.UPDATE_HISTORY_ENTRUST_LIST, list });
          }
          if (!existed || isTerminal) {
            entrustOrderNotify(list);
          }
        }
      });

      // 计划委托与止盈止损（plan_order 家族）：新增/取消/触发，以及编辑止盈止损（字段级
      // 更新）时都会推送；按 plan_type 分流到各自子 tab 的桶
      // （NORMAL → 计划委托 currentPlanList/historyPlanList，
      //  PROFIT_OR_STOP → 止盈止损 currentTpslList/historyTpslList）
      // 终态判断：plan_order 家族的 status 取值与 order 家族不同（无 FILLED，
      // 成交/触发对应 TRIGGERED），此前只判断 CANCELED/FILLED 导致 TRIGGERED
      // 被当成「非终态字段级更新」原地合并，成交后既不会从当前列表移除，
      // 也不会写入历史列表。这里补齐 plan 家族全部终态取值。
      privateWS.private('ws.spot.plan_order', (res) => {
        const list = res?.data ?? [];
        if (list.length === 0) return;
        const first = list[0];
        const isTpsl = first.plan_type === PLAN_TYPE.PROFIT_OR_STOP;
        const isTerminal = PLAN_ORDER_TERMINAL_STATUSES.includes(first.status);
        const currentType = isTpsl
          ? types.UPDATE_CURRENT_TPSL_LIST
          : types.UPDATE_CURRENT_PLAN_LIST;
        const historyType = isTpsl
          ? types.UPDATE_HISTORY_TPSL_LIST
          : types.UPDATE_HISTORY_PLAN_LIST;
        const currentBucket = isTpsl
          ? stateRef.current?.position?.currentTpslList
          : stateRef.current?.position?.currentPlanList;
        const existed = entrustItemExistedIn(currentBucket, first);
        // 插入/原地合并/移除统一交给 reducer 按 plan_order_id 命中判断
        globalDispatch({ type: currentType, list });
        if (isTerminal) {
          globalDispatch({ type: historyType, list });
        }
        if (!existed || isTerminal) {
          entrustOrderNotify(list);
        }
      });

      // 现货成交明细
      privateWS.private('ws.spot.match', ({ data }) => {
        globalDispatch({
          type: types.UPDATE_MY_DEAL_LIST,
          list: data,
          symbol: state.symbol,
        });
        dealOrderNotify(data);
      });

      // Refresh wallet data
      getWalletList()
        .then((res) => {
          globalDispatch({
            type: types.SET_USER_WALLET,
            payload: res || [],
          });
        })
        .finally(() => {
          privateWS?.private('ws.spot.balance', ({ data }) => {
            globalDispatch({ type: types.UPDATE_USER_WALLET, payload: data });
          });
        });
      consoleLog('WebSocket subscriptions initialized successfully');
    } catch (err) {
      console.error('Error initializing WebSocket subscriptions:', err);
    }
  };

  // Restore handleLogout function
  const handleLogout = () => {
    globalDispatch({ type: types.CLEAN_USER_INFO });
    globalDispatch({ type: types.RESET_USER_WALLET });
    globalDispatch({ type: types.RESET_MY_POSITION_ORDER_LIST });
  };

  // Modified WebSocket initialization
  const initializePrivateWS = async () => {
    if (privateWS) {
      consoleLog('WebSocket already exists, skipping initialization');
      return;
    }
    try {
      const token = await getWsToken();
      console.log('initializePrivateWS token', token);
      const wsPath = `stream/private?v=1&token=${token}`;
      consoleLog('Initializing new WebSocket connection');
      privateWS = createPrivateWS(wsPath);

      // Add handler for token refresh
      privateWS.on('before_reconnect', async () => {
        try {
          consoleLog('Refreshing WebSocket token before reconnection');
          const { websocketPath } = await getPrivateInfo();
          const newToken = await getWsToken();
          const newWsPath = `stream/private?v=1&token=${newToken}`;
          privateWS.changeUrl(newWsPath);
        } catch (err) {
          console.error('Failed to refresh WebSocket token:', err);
        }
      });

      // Add handler for successful connection
      privateWS.on('connect', () => {
        consoleLog('WS Connected, initializing subscriptions');
        changePrivateWSConnected(true);
        // Clear any existing subscriptions first
        resetWs();
        // Re-initialize all subscriptions
        initWs();
      });

      privateWS.on('close', () => {
        consoleLog('WS Closed');
        changePrivateWSConnected(false);
      });
    } catch (err) {
      console.error('Failed to initialize WebSocket:', err);
    }
  };

  // Initial setup effect
  useEffect(() => {
    resetRootClassName();
    // 确保URL包含语言前缀
    ensureLanguagePrefix();
    // Set theme
    // globalDispatch({
    //   type: types.SET_CURRENT_THEME,
    //   targetThemeName: getTradeTheme(),
    // });

    const returnPageUrl = '/spot/exchange/BTC/USDT';
    useGlobalWidget({
      handleLangChange,
      handleThemeChange,
      handleLogout,
      returnPageUrl,
    });

    async function getUserInfoCallback(res) {
      const payload = res;
      globalDispatch({ type: types.SET_USER_INFO, payload });

      // Handle exchange rate
      try {
        const rateRes = await allFiatRate();
        const currencyCode = localStorage.getItem('CURRENCY_CODE');
        const lang = localStorage.getItem('LANG_KEY');
        const v = currencyCode || LOCALE_CURRENCY_MAP[lang] || 'USD';
        globalDispatch({
          type: types.SET_EXCHANGE_RATE,
          payload: {
            fiatList: rateRes?.list,
            currencyCode: v,
            // currencyCode: payload.currency_code, //改成本地存储
          },
        });
      } catch (err) {
        console.error('Failed to get fiat rate:', err);
      }

      // Initialize WebSocket if logged in
      if (loggedIn && !privateWS) {
        consoleLog('Initializing WebSocket on first load');
        await initializePrivateWS();
      }
    }

    getTradeSectionCategory().then((res) => {
      globalDispatch({ type: types.SET_SPOT_SECTION_CATEGORY, data: res });
    });

    // Get user info and initialize
    getUserInfo(getUserInfoCallback).finally(() => {
      globalDispatch({ type: types.SET_PROFILE_API_LOADED, status: true });
    });

    return () => {
      if (privateWS) {
        privateWS.destroy();
        privateWS = null;
      }
      // 清理所有未完成的 setTimeout
      shapeTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      shapeTimersRef.current = [];
    };
  }, []);

  // 订阅公共行情数据
  usePublicWsData();
  // 公共行情ws连接状态
  useWebsocketEventStream();

  useEffect(() => {
    tracing.init({
      project_type: 'Spot',
      project_name: 'TradePage',
      symbol_type: 'spot',
      symbol_name: state.symbol,
    });

    tracing.push('event', 'PageView', {});
  }, [language, state.symbol]);

  useEffect(() => {
    if (privateWSConnected && !loggedIn) {
      resetWs();
    }
    return () => {};
  }, [loggedIn, symbol]);

  // TODO Keep the existing effects for initialization and network state
  useEffect(() => {
    if (loggedIn && !privateWS) {
      consoleLog(
        'Attempting to initialize WebSocket due to login state change',
      );
      initializePrivateWS();
    }

    if (loggedIn) {
      getTransferConfig(globalDispatch);
      getUserBaseInfo().then((res) => {
        globalDispatch({ type: types.SET_USER_BASE_INFO, userInfo: res });
      });

      // 合并请求
      toGetUserPreferences([
        'showAssets',
        'spotBookSymbolSequence',
        'closePositionStatus',
        'klineCancelOrderTipStatus',
        'bookSymbolPreferSet',
        'orderBookPreferSet',
      ]).then((res) => {
        const { preferences } = res || {};
        const {
          closePositionStatus = 'show',
          klineCancelOrderTipStatus = 'show',
          bookSymbolPreferSet = 'bookSymbolChangeRateSet', // 取值还有bookSymbolLastPriceSet
          orderBookPreferSet, // 比较特殊"{\"quickOperate\":\"hide\"}" quickOperate
          showAssets = '1',
          spotBookSymbolSequence = '',
        } = preferences || {};

        // 资产
        storage.set('showAssets', showAssets);
        // 获取用户的 收藏symbol
        globalDispatch({
          type: types.SET_BOOK_SYMBOL_LIST,
          data: spotBookSymbolSequence,
        });

        // K线相关
        globalDispatch({
          type: types.SET_CLOSE_POSITION_TIP_STATUS,
          status: closePositionStatus,
        }); // setting->Pop-Up Confirmation Windows-> Quick Close
        globalDispatch({
          type: types.SET_CANCEL_ORDER_TIP_STATUS,
          status: klineCancelOrderTipStatus,
        }); // setting->Pop-Up Confirmation Windows-> Quick Cancel
        globalDispatch({
          type: types.SET_BOOK_SYMBOL_PREFER_SETTING,
          status: bookSymbolPreferSet,
        }); // setting->Favorite Trading Pairs
      });
    }
  }, [loggedIn]);

  // Modify the network state effect
  useEffect(() => {
    const handleOnline = async () => {
      consoleLog(
        'Network state changed - online:',
        window.navigator.onLine,
        'privateWS:',
        privateWS ? 'exists' : 'null',
        'connected:',
        privateWSConnected,
      );

      if (window.navigator.onLine && loggedIn) {
        try {
          if (!privateWS) {
            consoleLog('Creating new WebSocket connection');
            await initializePrivateWS();
          } else if (!privateWSConnected) {
            consoleLog('Reinitializing existing WebSocket');
            const token = await getWsToken();
            const wsPath = `stream/private?v=1&token=${token}`;
            privateWS.changeUrl(wsPath);
          }
        } catch (err) {
          console.error('Failed to handle network recovery:', err);
        }
      }
    };

    const handleOffline = () => {
      consoleLog('Network offline');
      if (privateWS) {
        resetWs();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loggedIn, privateWSConnected]);

  useEffect(() => {
    const brand = process.env.MARVEL_APP_TITLE;
    document.title = ` ${formattedClosePrice || ''} | ${
      state.symbolFullName
    } | ${brand} `;
  }, [t, formattedClosePrice, state.symbolFullName]);

  useEffect(() => {
    const linkArr = document.getElementsByTagName('link');
    for (let i = 0; i < linkArr.length; i += 1) {
      if (linkArr[i].rel === 'canonical') {
        linkArr[
          i
        ].href = `${window.location.origin}${window.location.pathname}`;
      }
    }
  }, [symbol]);

  // wx auth失败提示弹框 点击取消按钮埋点
  const authFailTipsCancel = () => {
    setWsAuthFlag(false);
  };
  // wx auth失败提示弹框 点击成功回调reload
  const authFailTipsConfirm = () => {
    window.location.reload();
  };

  return (
    <LanguageRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#55B169',
          },
        }}
      >
        <div className="app-container">
          <MessageContainer />
          <NotifyContainer />
          <AuthFailTips
            onCancel={authFailTipsCancel}
            onConfirm={authFailTipsConfirm}
          />
          <Main />
          <Reconnect />
        </div>
      </ConfigProvider>
    </LanguageRouter>
  );
};

export default App;
