import { storage } from 'by-storage';
import { Tooltip, Dropdown, message, Modal } from 'antd';
import { ReactComponent as DownSvg } from './img/down.svg';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  QUICK_OPERATION_CHECKLIST,
  QUICK_OPERATION_STATUS,
} from 'common/packages-biz/global-settings/localStorageSettings';
import { Datafeed } from './Datafeed';
import { useFixStudyCompare_markPrice } from './plugins/fixStudyCompare';
import { SettingsAdapter } from './plugins/settingsAdapter';
import QuickOperationDialog from './components/QuickOperationDialog';
import ResolutionPicker from './components/ResolutionPicker';
import {
  getPinnedResolutions,
  getPinnedResolutionItems,
  getResolutionItemByRes,
} from './components/ResolutionPicker/constants';
import QuickOrder from './components/QuickOrder';
import { useGlobalState, types } from '@/store';
import { useScreenMode } from './hooks/useScreenMode';
import {
  getBrandColor,
  getOverrides,
  getStudiesOverrides,
  long,
  getTvMainBg,
  short,
  getLongColor,
  getShortColor,
} from './tvOverrides';
import {
  SUPPORTED_DRAWING_STEP,
  ADJUST_TIME_WITH_RESOLUTION,
  RESOLUTION_MAP,
} from './constants';
import { ReactComponent as CandleSvg } from './img/klineHeaders/candle.svg';
import { ReactComponent as LineSvg } from './img/klineHeaders/line.svg';
import { ReactComponent as AreaSvg } from './img/klineHeaders/area.svg';
import { ReactComponent as BarSvg } from './img/klineHeaders/bars.svg';
import { ReactComponent as HeikinAshiSvg } from './img/klineHeaders/heikin-ashi.svg';
import { ReactComponent as HollowCandlesSvg } from './img/klineHeaders/hollow-candles.svg';
import { ReactComponent as ColumnsSvg } from './img/klineHeaders/columns.svg';
import { ReactComponent as BaselineSvg } from './img/klineHeaders/baseline.svg';
import { ReactComponent as IndicatorSvg } from './img/klineHeaders/indicator.svg';
import { ReactComponent as DisplayIconSvg } from './img/klineHeaders/displayIcon.svg';
import { ReactComponent as SettingSvg } from './img/klineHeaders/setting.svg';
import { ReactComponent as fullScreenSvg } from './img/klineHeaders/fullScreen.svg';
import { ReactComponent as SnapshotSvg } from './img/klineHeaders/snapshot.svg';
import { ReactComponent as ResetSvg } from './img/klineHeaders/reset.svg';
import { eventBus } from 'common/utils/EventBus';
import { getTradeViewThemeName } from 'common/packages-biz/global-settings';
import styles from './index.module.less';

// TV v27 stores chartproperties as a nested object; applyOverrides requires flat dot-notation keys
function flattenOverrides(obj, prefix = '') {
  const result = {};
  Object.entries(obj).forEach(([key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenOverrides(val, fullKey));
    } else {
      result[fullKey] = val;
    }
  });
  return result;
}

// 这些属性由主题 CSS 变量控制，不应被用户存储的历史值覆盖
const THEME_MANAGED_KEYS = new Set([
  'paneProperties.background',
  'paneProperties.backgroundType',
  'paneProperties.backgroundGradientStartColor',
  'paneProperties.backgroundGradientEndColor',
  'paneProperties.vertGridProperties.color',
  'paneProperties.horzGridProperties.color',
  'paneProperties.separatorColor',
  'scalesProperties.backgroundColor',
  'scalesProperties.lineColor',
  'scalesProperties.textColor',
  // 图表类型由 React state(curChartType) + saveSetting 管理，不应存入 user_customizations
  // 否则 applyUserCustomizations 会把旧图表类型覆盖回来，导致第一次点击切换失效
  'mainSeriesProperties.style',
]);

// 将 chartproperties 中用户真正自定义的属性（排除主题管理项）存入独立 key
// 独立 key 不被 TV 内部的 changeTheme setValue 覆盖
function saveUserCustomizations(storeScope, flatProps) {
  const userCustom = {};
  Object.entries(flatProps).forEach(([k, v]) => {
    if (!THEME_MANAGED_KEYS.has(k)) {
      userCustom[k] = v;
    }
  });
  localStorage.setItem(
    `${storeScope}.user_customizations`,
    JSON.stringify(userCustom),
  );
}

function applyUserCustomizations(widget, storeScope) {
  const raw = localStorage.getItem(`${storeScope}.user_customizations`);
  if (!raw) return;
  try {
    const stored = JSON.parse(raw);
    // 读取时同样过滤 THEME_MANAGED_KEYS，兼容旧版本存储的数据（如 mainSeriesProperties.style）
    const customizations = {};
    Object.entries(stored).forEach(([k, v]) => {
      if (!THEME_MANAGED_KEYS.has(k)) customizations[k] = v;
    });
    if (Object.keys(customizations).length > 0) {
      widget.applyOverrides(customizations);
    }
  } catch (e) {
    console.log('applyUserCustomizations error', e);
  }
}

const CHART_TYPE_ICONS = {
  0: BarSvg,
  1: CandleSvg,
  9: HollowCandlesSvg,
  13: ColumnsSvg,
  2: LineSvg,
  3: AreaSvg,
  10: BaselineSvg,
  8: HeikinAshiSvg,
};

const Widget = window?.TradingView?.widget;
const tvWidgets = {}; // 全局重要

const loadChartConfig = (saveKey, chartType, containerId) => {
  const chartConfig = JSON.parse(storage.get(saveKey))?.charts;
  return chartConfig || null;
};
const savedConfig = loadChartConfig();
const saveSetting = (saveKey, chartType, containerId) => {
  if (saveKey) {
    const charts = JSON.parse(storage.get(saveKey))?.charts || [];
    tvWidgets[containerId].save((e) => {
      const c = e.charts[0];
      let paneIndex = 0;
      for (let i = 0, len = c.panes.length; i < len; i += 1) {
        const { sources } = c.panes[i];
        for (let j = 0, lenJ = sources.length; j < lenJ; j += 1) {
          if (sources[j].type === 'MainSeries') {
            paneIndex = i;
            break;
          }
        }
        if (paneIndex > 0) {
          break;
        }
      }
      if (chartType !== null) {
        // 避免用户切换到分时线状态之后，通过（刷新）等操作，重绘tv出现状态异常。
        c.panes[paneIndex].sources[0].state.style = chartType;
      }
      const index = charts.findIndex(
        (chart) =>
          chart.containerId === containerId ||
          (containerId === 'tvSpot_chart_container' && !chart.containerId),
      );
      const newChart = {
        panes: c.panes,
        timeScale: c.timeScale,
        containerId,
      };
      if (index > -1) {
        charts[index] = newChart;
      } else {
        charts.push(newChart);
      }
      const data = {
        charts,
      };
      storage.set(saveKey, JSON.stringify(data));
    });
  }
};

// 创建标记价格线，用于比较。先判断是否存在，已存在直接跳过，不存在则创建
const createFPStudy = (mainPane, fpSymbol, tvWidget) => {
  let has = false;
  // let hasStudies = false;
  if (mainPane !== -1) {
    const storageSources = tvWidget?.chart().createStudyTemplate({
      saveInterval: false,
    }).panes[mainPane].sources;
    storageSources
      .filter((stu) => stu.type === 'study_Compare')
      .forEach((cstu) => {
        if (cstu.state.inputs.symbol !== fpSymbol) {
          tvWidget?.chart().removeEntity(cstu.id);
        } else {
          has = true;
        }
      });
  }
  if (!has) {
    // tvWidget
    //   .chart()
    //   .createStudy('Compare', false, false, ['close', fpSymbol], {
    //     'Plot.linewidth': 2,
    //     'Plot.color': getBrandColor(),
    //   })
    //   .then(() => {
    //     // getRightPriceScales 表示获取右侧价格刻度实例
    //     // setMode 表示对价格刻度设置新模式，对应的枚举值如下：
    //     // 0: 价格刻度的正常模式
    //     // 1: 价格刻度的对数模式
    //     // 2: 价格刻度的百分比模式
    //     // 3: 索引到价格刻度的 100 模式
    //     tvWidget.chart().getPanes()[0].getRightPriceScales()[0].setMode(0);
    //   });
  }
};

/* eslint-disable */
const Qe = (e, t, n) => {
  const i = t.split('.');
  const iLen = i.length;
  let tmp = e;
  for (let r = 0; r < iLen - 1; r += 1) {
    tmp = tmp[i[r]];
    // console.log(e, i, r, tmp[i[r]]);
  }
  tmp[i[iLen - 1]] = n;
};

const getStoreData = ({ saveKey, containerId, mainPane, fpSymbol }) => {
  let storeState = null;
  let currentChart = null;
  let storeInterval = null;
  if (saveKey) {
    storeState = JSON.parse(storage.get(saveKey));
  }
  if (storeState && storeState.charts) {
    currentChart = storeState.charts.find(
      (chart) =>
        chart.containerId === containerId ||
        (containerId === 'tvSpot_chart_container' && !chart.containerId),
    );
    if (currentChart) {
      for (let x = 0, len = currentChart.panes.length; x < len; x += 1) {
        const { sources } = currentChart.panes[x];
        const i = sources.findIndex((source) => source.type === 'MainSeries');
        if (i !== -1) {
          storeInterval = sources[i].state.interval;
          try {
            const pane = currentChart.panes[x];
            currentChart.panes[x].sources = pane.sources.reduce(
              (prev, source) => {
                if (
                  source.type === 'study_Compare' &&
                  source.state.inputs.symbol !== fpSymbol
                )
                  return prev;
                return [...prev, source];
              },
              [],
            );
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          }
          mainPane.current = x;
          break;
        }
      }
    }
  }
  return {
    storeState,
    currentChart,
    storeInterval,
  };
};

let curShapes = {};
let curContainerId = 'tvSpot_chart_container';
let curChartReady = false;
let curSelectedChartType = 1;
// 记录划的mark的 shapeId和Item信息
let curDrawMarks = new Map();
let curDrawBuyMarks = new Map();
let curDrawSellMarks = new Map();
let markGroupId = 'brandGroups';

function getStoreCheckList() {
  let storeCheckList = storage.get(QUICK_OPERATION_CHECKLIST);
  storeCheckList = storeCheckList
    ? JSON.parse(storeCheckList)
    : {
        trade: 'show',
        position: 'show',
        entrust: 'show',
        orderHistory: 'show',
      };
  return storeCheckList;
}

function getGuestChecklist() {
  const stored = getStoreCheckList();
  return {
    trade: stored.trade === 'hide' ? 'hide' : 'show',
    entrust: 'hide',
  };
}

// 重置 bar 间距为默认值，恢复初始 bar 宽度分布
function setInitialVisibleBars(chart) {
  try {
    chart.setBarSpacing(8);
    chart.scrollToRealtime();
    chart.resetDataScale(); // Y轴恢复自动缩放
  } catch (e) {
    console.warn('[Chart] setInitialVisibleBars failed', e);
  }
}

export function adjustLocationByTime(trData) {
  const { execTimeE3, createdAtE3, updatedAtE3 } = trData;
  const timeDest = execTimeE3 || updatedAtE3 || createdAtE3;
  const tvWidget = tvWidgets[curContainerId];
  const curResolution = storage.get('resolution') || 15;
  const timeOffset = ADJUST_TIME_WITH_RESOLUTION[curResolution] || 0;
  const timeFrom = String(timeDest).slice(0, 10) - timeOffset;
  const timeTo = String(timeDest).slice(0, 10) * 1;
  const curActiveChart = tvWidget.activeChart();
  curActiveChart.setVisibleRange({ from: timeFrom, to: timeTo }).then(() => {
    setTimeout(() => {
      const priceScale = curActiveChart.getPanes()[0].getMainSourcePriceScale();
      priceScale.setAutoScale(true);
      // tvWidget.activeChart().setAutoScale(true);
    }, 0);
    console.log('New visible range is applied');
  });
}

// Function to clear all shapes
async function clearMarks(shapeId) {
  return;
  if (shapeId === 'ALL') {
    // tvWidgets[curContainerId].chart().removeAllShapes();
    curDrawMarks.clear();
    curDrawBuyMarks.clear();
    curDrawSellMarks.clear();
    const allshapes = tvWidgets[curContainerId].activeChart().getAllShapes();
    allshapes.forEach((item) => {
      if (item.name === 'arrow_up' || item.name === 'arrow_down') {
        tvWidgets[curContainerId]?.chart().removeEntity(item.id);
      }
    });
    console.log('clear all shapes');
    // await tvWidgets[curContainerId].chart().removeAllShapes();
    window.curShape = null;
    return;
  }
  if (shapeId) {
    tvWidgets[curContainerId]?.chart().removeEntity(shapeId);
  } else {
    if (curShapes.buy) {
      tvWidgets[curContainerId]?.chart().removeEntity(curShapes.buy);
    }
    if (curShapes.sell) {
      tvWidgets[curContainerId]?.chart().removeEntity(curShapes.sell);
    }
    curShapes = {}; // Clear the shapes array
  }
}

const ByTradingview = ({
  symbols,
  getBars,
  getMarks,
  symbol,
  interval,
  // supportedResolutions,
  subscribeBars,
  unsubscribeBars,
  containerId,
  locale,
  libraryPath,
  // disabledFeatures,
  // enabledFeatures,
  // chartsStorageUrl,
  // clientId,
  // userId,
  fullscreen,
  theme,
  autosize,
  // studiesOverrides,
  showLeftToolbar,
  leftToolbarLocalKey,

  // orderLines,
  activeOrderLines,

  loggedIn,
  quickOrderProps,
  saveKey,
  hasMarkPriceLine,
  cRef,
  disabledFeatures,
  handlePushEvent,
  chartPropertiesKey,
}) => {
  const loadingResolutionRef = useRef(false);
  const [storedInverval, setStoredInverval] = useState('');

  const [themeVersion, setThemeVersion] = useState(0);
  const [currentStatus, setcurrentStatus] = useState({
    symbol: '',
    resolution: storage.get('resolution') || 15,
    lineType: 1,
  });
  const [globalState, globalDispatch] = useGlobalState();
  const { user } = globalState;

  const fpSymbol = useMemo(
    () => Object.keys(symbols).find((s) => s.indexOf('.') === 0),
    [symbols],
  );
  const mainPane = useRef(-1);
  const [t] = useTranslation();

  const klineContainerRef = useRef(null);
  const [pinnedResolutions, setPinnedResolutions] =
    useState(getPinnedResolutions);
  const [resolutionPickerOpen, setResolutionPickerOpen] = useState(false);
  const [curChartType, setcurChartType] = useState(1);
  // kline chart Ready
  const [chartReady, setChartReady] = useState(false);

  // 快捷操作 复选项状态
  const [quickOperationChecklistStatus, setQuickOperationChecklistStatus] =
    useState(() => (loggedIn ? getStoreCheckList() : getGuestChecklist()));

  const usedTheme = useRef(theme);
  const settingsAdapterRef = useRef(null);
  // changeTheme 执行期间 TV 内部会调用 setValue 写入新主题默认值，需跳过 saveUserCustomizations
  const isSwitchingTheme = useRef(false);
  // 当前使用的locale
  const usedLocale = useRef(locale);
  const activeOrderLine = useRef({});

  useEffect(() => {
    if (loggedIn) {
      setQuickOperationChecklistStatus(getStoreCheckList());
      return;
    }
    setQuickOperationChecklistStatus(getGuestChecklist());
  }, [loggedIn]);

  const chartItems = [
    {
      label: (
        <div className={styles.labelContainer}>
          <BarSvg />
          <span>{t('bars')}</span>
        </div>
      ),
      key: 0,
    },
    {
      label: (
        <div className={styles.labelContainer}>
          <CandleSvg />
          <span>{t('candles')}</span>
        </div>
      ),
      key: 1,
    },
    {
      label: (
        <div className={styles.labelContainer}>
          <HollowCandlesSvg />
          <span>{t('hollow-candles')}</span>
        </div>
      ),
      key: 9,
    },
    {
      label: (
        <div className={styles.labelContainer}>
          <HeikinAshiSvg />
          <span>{t('heikinAshi')}</span>
        </div>
      ),
      key: 8,
    },
    {
      label: (
        <div className={styles.labelContainer}>
          <ColumnsSvg />
          <span>{t('columns')}</span>
        </div>
      ),
      key: 13,
    },
    {
      label: (
        <div className={styles.labelContainer}>
          <LineSvg />
          <span>{t('line')}</span>
        </div>
      ),
      key: 2,
    },
    {
      label: (
        <div className={styles.labelContainer}>
          <AreaSvg />
          <span>{t('area')}</span>
        </div>
      ),
      key: 3,
    },
    {
      label: (
        <div className={styles.labelContainer}>
          <BaselineSvg />
          <span>{t('baseline')}</span>
        </div>
      ),
      key: 10,
    },
  ];
  const middleConent = [
    {
      key: 'insertIndicator',
      icon: IndicatorSvg,
      title: t('indicatorSettingsTips'),
    },
    {
      key: 'displayIcon',
      icon: DisplayIconSvg,
      title: t('displaySettingsTips'),
    },
    {
      key: 'chartProperties',
      icon: SettingSvg,
      title: t('chartSettingsTips'),
    },
    {
      key: 'snapshot',
      icon: SnapshotSvg,
      title: t('klineSnapshotTips'),
    },
    {
      key: 'reset',
      icon: ResetSvg,
      title: '',
    },
  ];
  const endContent = [
    {
      key: 'fullScreen',
      icon: fullScreenSvg,
    },
  ];

  const { toggleFullScreen, fullScreen } = useScreenMode(klineContainerRef);

  curContainerId = containerId;

  // 自定义调用tradingview的api
  const handleTvSettingAction = (key) => {
    if (['insertIndicator', 'chartProperties'].includes(key)) {
      /*
      @key
       "chartProperties" | "compareOrAdd" | "scalesProperties" | "paneObjectTree" |
      "insertIndicator" | "symbolSearch" | "changeInterval" | "timeScaleReset" | 
      "chartReset" | "seriesHide" | "studyHide" | "lineToggleLock" | "lineHide" |
      "scaleSeriesOnly" | "drawingToolbarAction" | "stayInDrawingModeAction" | 
      "hideAllMarks" | "showCountdown" | "showSeriesLastValue" | "showSymbolLabelsAction" | 
      "showStudyLastValue" | "showStudyPlotNamesAction" | "undo" | "redo" | 
      "paneRemoveAllStudiesDrawingTools" | "showSymbolInfoDialog"
    */
      if (tvWidgets[containerId]) {
        tvWidgets[containerId]?.chart().executeActionById(key);
      }
    }

    if (key === 'fullScreen') {
      toggleFullScreen();
    }

    if (key === 'snapshot') {
      takeSnapshot();
    }

    if (key === 'reset') {
      if (tvWidgets[containerId]) {
        setInitialVisibleBars(tvWidgets[containerId].activeChart());
      }
    }
  };

  // 是否显示快捷操作
  const getNeedShowQuickOperation = useCallback((checklist) => {
    return Object.entries(checklist).some(
      (item) => item[1] === QUICK_OPERATION_STATUS.SHOW,
    );
  }, []);

  // 订单线
  const drawOrderLines = useCallback((orderLines = [], isActiveOrder) => {
    const cacheLinesObj = activeOrderLine.current;
    Object.keys(cacheLinesObj).forEach((cacheLineId) => {
      const isOverageOrderline =
        orderLines.findIndex((orderLine) => orderLine.id === cacheLineId) ===
        -1;
      if (isOverageOrderline) {
        cacheLinesObj[cacheLineId].remove();
        delete cacheLinesObj[cacheLineId];
      }
    });
    orderLines.forEach((order) => {
      const { id, text, size, price, side, onCancel, onMove } = order;
      const color =
        side?.toLowerCase() === 'buy' ? getLongColor() : getShortColor();
      const quantityColor = '#000';
      if (cacheLinesObj[id]) {
        cacheLinesObj[id]
          .onCancel(onCancel)
          .onMove(() => {
            cacheLinesObj[id].setText('Amending...');
            // eslint-disable-next-line no-underscore-dangle
            onMove(cacheLinesObj[id]?._line?._points[0]?.price);
          })
          .setText(text)
          .setQuantity(size)
          .setPrice(price)
          .setLineStyle(2)
          .setLineColor(color)
          .setBodyBorderColor(color)
          .setBodyTextColor(color)
          .setBodyFont('500 11px sans-serif')
          .setBodyBackgroundColor(getTvMainBg())
          .setQuantityTextColor(quantityColor)
          .setQuantityFont('500 11px sans-serif')
          .setQuantityBorderColor(color)
          .setQuantityBackgroundColor(color)
          .setCancelButtonBorderColor(color)
          .setCancelButtonBackgroundColor(getTvMainBg())
          .setCancelButtonIconColor(color);
      } else {
        try {
          cacheLinesObj[id] = tvWidgets[containerId]
            ?.chart()
            .createOrderLine()
            .onCancel(onCancel)
            .onMove(() => {
              cacheLinesObj[id].setText('Amending...');
              // eslint-disable-next-line no-underscore-dangle
              onMove(cacheLinesObj[id]?._line?._points[0]?.price);
            })
            .setLineLength(88)
            .setText(text)
            .setQuantity(size)
            .setPrice(price)
            .setLineStyle(2)
            .setLineColor(color)
            .setBodyBorderColor(color)
            .setBodyTextColor(color)
            .setBodyFont('500 11px sans-serif')
            .setBodyBackgroundColor(getTvMainBg())
            .setQuantityTextColor(quantityColor)
            .setQuantityFont('500 11px sans-serif')
            .setQuantityBorderColor(color)
            .setQuantityBackgroundColor(color)
            .setCancelButtonBorderColor(color)
            .setCancelButtonBackgroundColor(getTvMainBg())
            .setCancelButtonIconColor(color);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      }
    });
  }, []);

  const removePositionAndOrderLines = (cacheLinesObj) => {
    Object.keys(cacheLinesObj).forEach((cacheLineId) => {
      cacheLinesObj[cacheLineId].remove();
      delete cacheLinesObj[cacheLineId];
    });
  };

  const changeTheme = useCallback(
    (nt) => {
      // nt 格式为 'theme-dark' / 'theme-light'，转为 TV 接受的 'dark' / 'light'
      const tvTheme = nt === 'theme-light' ? 'light' : 'dark';

      // 在调用 TV changeTheme 之前先更新 settingsAdapterRef，
      // 确保 TV 在主题切换过程中回调 settings_adapter.setValue 时，
      settingsAdapterRef.current = new SettingsAdapter(chartPropertiesKey, nt);
      // 标记主题切换中：阻止 TV 内部 setValue 覆盖用户自定义存储
      isSwitchingTheme.current = true;

      if (
        tvWidgets[containerId] &&
        typeof tvWidgets[containerId].changeTheme === 'function'
      ) {
        tvWidgets[containerId].changeTheme(tvTheme).then(() => {
          isSwitchingTheme.current = false;
          if (tvWidgets[containerId]) {
            // 主图颜色（背景、网格、十字线等）
            tvWidgets[containerId].applyOverrides(getOverrides());
            // 恢复用户自定义属性（排除主题管理的背景/格线颜色，避免覆盖新主题底色）
            applyUserCustomizations(
              tvWidgets[containerId],
              settingsAdapterRef.current.storeScope,
            );

            // Volume 指标颜色更新：
            // applyStudiesOverrides 只对"新创建"的指标实例生效，对已渲染的 Volume 无效。
            // 必须先删除现有 Volume，重建后再 applyStudiesOverrides，新主题颜色才能生效。
            const chart = tvWidgets[containerId].activeChart();
            const studies = chart.getAllStudies();
            studies
              .filter((study) => study.name === 'Volume')
              .forEach((study) => chart.removeEntity(study.id));
            chart.createStudy('Volume', false, false);
            const studiesColors = getStudiesOverrides();
            if (studiesColors) {
              tvWidgets[containerId].applyStudiesOverrides(studiesColors);
            }
          }
          // 主题切换完成后，递增版本号触发持仓线/委托线用新主题色立即重绘
          setThemeVersion((v) => v + 1);
        });
      } else {
        isSwitchingTheme.current = false;
      }
      usedTheme.current = nt;
    },
    [chartPropertiesKey, containerId],
  );

  // 提供父组件reset 方法
  useImperativeHandle(
    cRef,
    () => ({
      resetOrderLines: (type) => {
        if (
          !chartReady ||
          !getNeedShowQuickOperation(quickOperationChecklistStatus)
        )
          return;
        drawOrderLines(activeOrderLines, true);
      },
    }),
    [chartReady, quickOperationChecklistStatus, activeOrderLines],
  );

  // Function to take snapshot
  async function takeSnapshot() {
    const screenshotCanvas = await tvWidgets[
      containerId
    ].takeClientScreenshot();
    const linkElement = document.createElement('a');
    linkElement.download = 'screenshot';
    linkElement.href = screenshotCanvas.toDataURL(); // Alternatively, use `toBlob` which is a better API
    linkElement.dataset.downloadurl = [
      'image/png',
      linkElement.download,
      linkElement.href,
    ].join(':');
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  }

  const updateIntervalDisplay = (interval) => {
    //只有首次渲染 并且 chartReady会调用
    clearMarks('ALL');
    const chart = tvWidgets[containerId].activeChart();
    if (interval === '1' && currentStatus?.resolution === 'Time') {
      chart.setChartType(2); // Set to Line chart
    } else {
      chart.setChartType(curChartType); // Set to Candlestick chart for other intervals
    }
  };

  const widgetReady = (
    showLeftToolbar,
    mainPane,
    fpSymbol,
    saveKey,
    hasMarkPriceLine,
    chartType,
    settingsAdapterInstance,
  ) => {
    let hasLocalLeftBarStatus;
    if (leftToolbarLocalKey) {
      hasLocalLeftBarStatus = storage.get(leftToolbarLocalKey);
    }
    const needOpenDrawingBar = showLeftToolbar
      ? hasLocalLeftBarStatus
        ? hasLocalLeftBarStatus !== '1'
        : false
      : false;

    if (showLeftToolbar && leftToolbarLocalKey) {
      // 画图工具边栏开关事件
      tvWidgets[containerId].subscribe('toggle_sidebar', (isClosed) => {
        storage.set(leftToolbarLocalKey, isClosed ? '0' : '1');
      });
    }
    if (needOpenDrawingBar) {
      tvWidgets[containerId]?.chart().executeActionById('drawingToolbarAction');
    }
    saveSetting(saveKey, chartType, containerId);
    // 存储
    tvWidgets[containerId].subscribe('onAutoSaveNeeded', () => {
      saveSetting(saveKey, chartType, containerId);
    });

    tvWidgets[containerId]
      ?.chart()
      .onIntervalChanged()
      .subscribe(null, (intervalCur) => {
        saveSetting(saveKey, chartType, containerId);
        setInitialVisibleBars(tvWidgets[containerId]?.activeChart());
        // updateIntervalDisplay(intervalCur);
        // if (handlePushEvent) {
        //   handlePushEvent(
        //     'click',
        //     'trade_commenchart_time',
        //     `trading_pair=${symbol},time=${intervalCur}`,
        //   );
        // }
      });
    if (hasMarkPriceLine) {
      // 判断当前是否已有需要的币种标记价格线，没有的话展示标记价格线
      createFPStudy(mainPane, fpSymbol, tvWidgets[containerId]);
    }

    // Initial interval display and chart type
    updateIntervalDisplay(tvWidgets[containerId]?.chart().resolution());
    // tvWidgets[containerId].subscribe('onMarkClick', (markId) => {
    //   console.log(markId, 'markId');
    // });
  };

  // 修复 标记线分离后 切换币对 标记线显示错误
  useFixStudyCompare_markPrice(saveKey, Object.keys(symbols)[1]);

  const changeResolition = async (n, force) => {
    const storeCheckList = getStoreCheckList();
    if (!force && n.res === currentStatus.resolution) return;
    if (
      storeCheckList.orderHistory === 'show' &&
      loadingResolutionRef.current &&
      loggedIn
    )
      return;
    loadingResolutionRef.current = true;
    setTimeout(() => {
      loadingResolutionRef.current = false;
    }, 1000);
    await clearMarks('ALL');
    setcurrentStatus((prev) => ({
      ...prev,
      resolution: n.res,
    }));
    const curResolution = RESOLUTION_MAP[n.resolution] || n.resolution;
    tvWidgets[containerId]?.chart().setResolution(curResolution);

    globalDispatch({
      type: types.SET_Current_Resolution,
      data: n.resolution,
    });

    // if (n.res == 'Time') {
    //   tvWidgets[containerId].chart().setChartType(2);
    // } else {
    //   tvWidgets[containerId].chart().setChartType(curChartType);
    // }
    storage.set('resolution', n.res);
  };

  const generateKlineBtns = (item) => {
    return (
      <span
        className={
          item.res === currentStatus?.resolution ? styles.selected : ''
        }
        key={item.res}
        onClick={() => changeResolition(item)}
      >
        {locale.includes('zh') ? item.full : item.slug}
      </span>
    );
  };

  const pinnedResolutionItems = useMemo(
    () => getPinnedResolutionItems(pinnedResolutions),
    [pinnedResolutions],
  );

  const currentResolutionItem = useMemo(
    () => getResolutionItemByRes(currentStatus?.resolution),
    [currentStatus?.resolution],
  );

  const isCurrentInPinned = useMemo(
    () =>
      pinnedResolutionItems.some(
        (item) => item.res === currentStatus?.resolution,
      ),
    [pinnedResolutionItems, currentStatus?.resolution],
  );

  const renderKlineBtns = useMemo(
    () => (
      <div className={styles.intervalsContainer}>
        {pinnedResolutionItems.map((item) => generateKlineBtns(item))}
        <ResolutionPicker
          currentResolution={currentStatus?.resolution}
          pinnedResolutions={pinnedResolutions}
          onSelect={changeResolition}
          onPinnedChange={setPinnedResolutions}
          onVisibleChange={setResolutionPickerOpen}
          getPopupContainer={() => klineContainerRef.current}
        >
          <div
            className={`${styles.headerItem} ${
              resolutionPickerOpen ? styles.headerItemActive : ''
            }`}
          >
            {!isCurrentInPinned && currentResolutionItem && (
              <span className={styles.selected}>
                {locale.includes('zh')
                  ? currentResolutionItem.full
                  : currentResolutionItem.slug}
              </span>
            )}
            <DownSvg />
          </div>
        </ResolutionPicker>
      </div>
    ),
    [
      currentStatus?.resolution,
      pinnedResolutions,
      pinnedResolutionItems,
      isCurrentInPinned,
      currentResolutionItem,
      resolutionPickerOpen,
    ],
  );

  const handleLineTypeClick = ({ key }) => {
    if (!curChartReady) return;
    setcurChartType(Number(key));
    curSelectedChartType = Number(key);
    globalDispatch({
      type: types.SET_Current_ChartType,
      data: Number(key),
    });
    tvWidgets[containerId].activeChart().setChartType(Number(key));
  };

  const handleSetShowQuickOrder = (show) => {
    let storeCheckList = getStoreCheckList();
    storeCheckList.trade = show ? 'show' : 'hide';
    setQuickOperationChecklistStatus(storeCheckList);
    storage.set(QUICK_OPERATION_CHECKLIST, JSON.stringify(storeCheckList));
  };

  const handleSetChecklistStatus = (list) => {
    setQuickOperationChecklistStatus(list);
    const showQuickOrder = list.trade === 'show';
    setTimeout(() => {
      tvWidgets[containerId]?.chart?.()?.refreshMarks?.();
    }, 0);
    handleSetShowQuickOrder(showQuickOrder);
  };

  const handleColorPreferenceChange = useCallback(async () => {
    try {
      if (!chartReady) {
        console.log('[Chart] Chart not ready');
        return;
      }
      const chart = tvWidgets[containerId].activeChart();
      // 应用主图表样式
      chart.applyOverrides(getOverrides());
      // 恢复用户自定义属性（排除主题管理的背景/格线颜色，避免覆盖新主题底色）
      applyUserCustomizations(
        tvWidgets[containerId],
        settingsAdapterRef.current.storeScope,
      );
      // 移除并重新创建 volume 指标
      const studies = chart.getAllStudies();
      await Promise.all(
        studies
          .filter((study) => study.name === 'Volume')
          .map((study) => {
            chart.removeEntity(study.id);
          }),
      );

      // const shapes = chart.getAllShapes();
      // await Promise.all(
      //   shapes.map((shape) => {
      //     chart.removeEntity(shape.id);
      //   }),
      // );
      // 重新创建shape
      await Promise.all(
        Array.from(curDrawBuyMarks.values()).map((item) => {
          return chart.createShape(item.p1, {
            ...item.p2,
            overrides: {
              ...item.p2.overrides,
              arrowColor: getLongColor(),
              color: getLongColor(),
            },
          });
        }),
      );

      await Promise.all(
        Array.from(curDrawSellMarks.values()).map((item) => {
          return chart.createShape(item.p1, {
            ...item.p2,
            overrides: {
              ...item.p2.overrides,
              arrowColor: getShortColor(),
              color: getShortColor(),
            },
          });
        }),
      );
      // 创建volume指标
      chart.createStudy('Volume', false, false);
      const volumeColors = getStudiesOverrides();
      if (volumeColors) {
        tvWidgets[containerId].applyStudiesOverrides(volumeColors);
      }

      if (
        activeOrderLine.current &&
        quickOperationChecklistStatus.entrust === QUICK_OPERATION_STATUS.HIDE
      ) {
        removePositionAndOrderLines(activeOrderLine.current);
      }

      setTimeout(() => {
        // 更新订单线颜色
        if (cRef?.current?.resetOrderLines) {
          cRef.current.resetOrderLines('ALL');
        }
      }, 100);
    } catch (error) {
      console.error('[Chart] Error in handleColorPreferenceChange:', error);
    }
  }, [chartReady, quickOperationChecklistStatus.position]);

  // 监听颜色偏好
  useEffect(() => {
    eventBus.on('colorPreferenceChange', handleColorPreferenceChange);
    return () => {
      eventBus.off('colorPreferenceChange', handleColorPreferenceChange);
    };
  }, [handleColorPreferenceChange]);

  useEffect(() => {
    if (chartReady) {
      if (currentStatus?.resolution == 'Time') {
        tvWidgets[containerId]?.chart().setChartType(2);
      } else {
        tvWidgets[containerId]?.chart().setChartType(curChartType);
      }
      handleColorPreferenceChange();
    }
  }, [curChartType, currentStatus?.resolution, chartReady]);

  useEffect(() => {
    if (chartReady && storedInverval) {
      if (storedInverval !== currentStatus?.resolution) {
        const item = changeResolition(
          {
            res: currentStatus?.resolution,
            resolution:
              currentStatus?.resolution === 'Time'
                ? '1'
                : currentStatus?.resolution,
          },
          true,
        );
      }
    }
  }, [chartReady, storedInverval]);

  useEffect(() => {
    setcurrentStatus({
      symbol,
      resolution: storage.get('resolution') || 15,
    });
  }, [symbol]);

  // tvWidget 初始化
  useEffect(() => {
    const { symbol } = currentStatus;
    if (!tvWidgets[containerId] && symbol) {
      const { storeState, currentChart, storeInterval } = getStoreData({
        saveKey,
        containerId,
        mainPane,
        fpSymbol,
      });
      const initInterval = storeInterval || interval;
      setStoredInverval(initInterval);
      const disabled_features = disabledFeatures || [
        'header_widget',
        // 'header_widget_dom_node',
        'header_symbol_search',
        'symbol_search_hot_key',
        // 'header_resolutions',
        // 'header_interval_dialog_button',
        'show_interval_dialog_on_key_press',
        'edit_buttons_in_legend',
        // 'header_chart_type',
        // 'header_indicators',
        'header_compare',
        // 'header_undo_redo',
        // 'header_screenshot',
        // 'header_settings',
        // 'header_fullscreen_button',
        'border_around_the_chart',
        'header_saveload',
        // 'control_bar', // 底部工具栏
        // 'timeframes_toolbar',
        // 'legend_widget',
        // 'use_localstorage_for_settings',
        'remove_library_container_border',
        // 'go_to_date',
        'volume_force_overlay',
        // 'show_chart_property_page',
        // 'context_menus',
      ];

      const settingsAdapterInstance = new SettingsAdapter(
        chartPropertiesKey,
        // theme,
        usedTheme.current,
      );
      // 将实例挂到 ref，供 changeTheme 时更新，以及 settings_adapter.setValue 闭包通过 ref 间接访问
      settingsAdapterRef.current = settingsAdapterInstance;
      const widgetOptions = {
        symbol,
        // BEWARE: no trailing slash is expected in feed URL
        // 数据获取
        datafeed: new Datafeed({
          symbols,
          getBars,
          subscribeBars,
          unsubscribeBars,
          getMarks,

          clearMarks,
        }),
        interval: initInterval,
        container: containerId,
        // tradingview lib路径
        library_path: libraryPath,
        locale,
        allow_symbol_change: false,
        disabled_features,
        enabled_features: [
          'items_favoriting',
          'side_toolbar_in_fullscreen_mode',
          'header_in_fullscreen_mode',
          'show_dom_first_time',
          'left_toolbar',
          // 'hide_last_na_study_output',
        ],
        // charts_storage_url: chartsStorageUrl,
        // charts_storage_api_version: chartsStorageApiVersion,
        // client_id: clientId,
        // user_id: userId,

        fullscreen,
        autosize,
        theme: getTradeViewThemeName(),
        // toolbar_bg: getTvMainBg(), //左边和底部工具栏背景色，不用设置，让 TV 通过自身主题系统管理工具栏背景色
        custom_css_url: '/static/common/trade/custom.css',

        loading_screen: {
          backgroundColor: getTvMainBg(),
          foregroundColor: getBrandColor(),
        },
        timezone: 'UTC',
        time_frames: [],
        // 自定义图表背景等样式
        overrides: getOverrides(),
        studies: [
          // 'Moving Average@tv-basicstudies', // Default 9-period MA
          // 'Moving Average@tv-basicstudies', // Add a second MA if needed
        ],
        // 自定义线条样式
        studies_overrides: getStudiesOverrides(),
        saved_data: currentChart ? { charts: [currentChart] } : storeState,
        settings_adapter: {
          initialSettings: {
            ...settingsAdapterInstance.getInitialSettings(),
            'ChartDrawingToolbarWidget.visible': true,
          },
          setValue: (key, value) => {
            // TV初始化会自动调用 此处 setValue方法，使用tvWidgets[containerId]._ready排查自动调用。
            // 通过 settingsAdapterRef.current 而非捕获的 settingsAdapterInstance，
            // 确保主题切换后写入正确的 scope（changeTheme 会提前更新 ref）。
            if (tvWidgets[containerId] && tvWidgets[containerId]._ready) {
              settingsAdapterRef.current.setValue(key, value);
              if (key === 'chartproperties' && !isSwitchingTheme.current) {
                try {
                  saveUserCustomizations(
                    settingsAdapterRef.current.storeScope,
                    flattenOverrides(JSON.parse(value)),
                  );
                } catch (e) {
                  console.log('[Chart] Error saving user customizations:', e);
                }
              }
            }
          },
          removeValue: (key) => settingsAdapterRef.current.removeValue(key),
        },
        favorites: {
          intervals: ['1', '3', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
          chartTypes: ['Candles'],
        },
        auto_save_delay: 1,
      };
      // init widget
      tvWidgets[containerId] = new Widget(widgetOptions);
      tvWidgets[containerId].onChartReady((f) => {
        widgetReady(
          showLeftToolbar,
          mainPane.current,
          fpSymbol,
          saveKey,
          hasMarkPriceLine,
          curChartType,
          settingsAdapterInstance,
        );
        curChartReady = true;
        setChartReady(true);
        // 首次加载完成后滚动到最新位置，恢复默认 bar 宽度分布
        setTimeout(
          () => setInitialVisibleBars(tvWidgets[containerId].activeChart()),
          0,
        );
      });
    }
    return () => {
      delete tvWidgets[containerId];
      setChartReady(false);
      curChartReady = false;

      activeOrderLine.current = {};
    };
  }, [currentStatus.symbol, loggedIn]);

  // 快捷下单
  const hasQuickOrder = useMemo(() => {
    return (
      loggedIn &&
      quickOperationChecklistStatus.trade === QUICK_OPERATION_STATUS.SHOW
    );
  }, [loggedIn, quickOperationChecklistStatus.trade]);

  // 更新活动委托线
  useEffect(() => {
    if (
      chartReady &&
      quickOperationChecklistStatus.entrust === QUICK_OPERATION_STATUS.SHOW
    ) {
      drawOrderLines(activeOrderLines, true);
    }
  }, [
    chartReady,
    quickOperationChecklistStatus.entrust,
    activeOrderLines,
    themeVersion,
  ]);

  // 切换语言
  useEffect(() => {
    if (locale !== usedLocale.current) {
      usedLocale.current = locale;
    }
  }, [locale]);

  // 更换皮肤
  useEffect(() => {
    if (theme !== usedTheme.current) {
      changeTheme(theme);
    }
  }, [theme]);

  return (
    <div style={{ height: '100%' }} ref={klineContainerRef}>
      <div className={styles.chartHeader}>
        {/* 周期 */}
        <>{renderKlineBtns}</>
        {/* 分割线 */}
        <div className={styles.leftMiddleSeparator} />

        {/* 功能按钮 */}
        <div className={styles.middleContent}>
          <Dropdown
            menu={{ items: chartItems, onClick: handleLineTypeClick }}
            trigger="hover"
            getPopupContainer={() => klineContainerRef.current}
            overlayClassName={styles.chartTypeDropdown}
          >
            <div className={styles.headerMiddleItem}>
              {React.createElement(CHART_TYPE_ICONS[curChartType], {
                width: '24',
                height: '24',
              })}
            </div>
          </Dropdown>

          {middleConent.map((item) => {
            if (item.key === 'displayIcon') {
              return (
                <div key={item.key}>
                  <span>
                    <QuickOperationDialog
                      loggedIn={loggedIn}
                      handleSetChecklistStatus={handleSetChecklistStatus}
                      getPopupContainer={() => klineContainerRef.current}
                    >
                      <div className={styles.headerMiddleItem}>
                        <Tooltip title={item.title} placement="top">
                          {React.createElement(item.icon, {
                            width: '24',
                            height: '24',
                          })}
                        </Tooltip>
                      </div>
                    </QuickOperationDialog>
                  </span>
                </div>
              );
            }
            return (
              <div key={item.key}>
                <span>
                  <div
                    className={styles.headerMiddleItem}
                    onClick={() => handleTvSettingAction(item.key)}
                  >
                    <Tooltip title={item.title} placement="top">
                      {React.createElement(item.icon, {
                        width: '24',
                        height: '24',
                      })}
                    </Tooltip>
                  </div>
                </span>
              </div>
            );
          })}
        </div>
        <div className={styles.endContent}>
          {endContent.map((item) => (
            <div
              className={styles.headerItem}
              key={item.key}
              onClick={() => handleTvSettingAction(item.key)}
            >
              <Tooltip title={t(item.key)} placement="top">
                {React.createElement(item.icon, { width: '24', height: '24' })}
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
      <div id={containerId} className={styles.chartContainer} />
      <If condition={hasQuickOrder && Object.keys(quickOrderProps).length}>
        <QuickOrder
          {...quickOrderProps}
          handleSetShowQuickOrder={handleSetShowQuickOrder}
        />
      </If>
    </div>
  );
};

ByTradingview.defaultProps = {
  interval: '30',
  subscribeBars: () => {},
  unsubscribeBars: () => {},
  containerId: 'tvSpot_chart_container',
  fullscreen: false,
  autosize: true,
  theme: 'dark',
  showLeftToolbar: true,
  leftToolbarLocalKey: '',
  locale: 'en',

  activeOrderLines: [],
  // clientId: 'exchange_spot',

  loggedIn: false,
  saveKey: '',
  quickOrderProps: {},
  hasMarkPriceLine: true,
  cRef: null,
  disabledFeatures: undefined,
  handlePushEvent: undefined,
  chartPropertiesKey: '',
};

ByTradingview.propTypes = {
  symbols: PropTypes.object.isRequired,
  getBars: PropTypes.func.isRequired,
  getMarks: PropTypes.func.isRequired,
  symbol: PropTypes.string.isRequired,
  interval: PropTypes.string,
  // supportedResolutions: PropTypes.array,
  subscribeBars: PropTypes.func,
  unsubscribeBars: PropTypes.func,
  containerId: PropTypes.string,
  locale: PropTypes.string,
  libraryPath: PropTypes.string.isRequired,
  fullscreen: PropTypes.bool,
  autosize: PropTypes.bool,
  // studiesOverrides: PropTypes.any,
  theme: PropTypes.string,
  showLeftToolbar: PropTypes.bool,
  leftToolbarLocalKey: PropTypes.string,
  saveKey: PropTypes.string,
  activeOrderLines: PropTypes.array,

  loggedIn: PropTypes.bool,
  // quickOrderProps: PropTypes.objectOf(PropTypes.shape({
  //   bid1: PropTypes.number,
  //   ask1: PropTypes.number,
  //   priceStep: PropTypes.number,
  //   minQty: PropTypes.number,
  //   maxQty: PropTypes.number,
  //   needLoading: PropTypes.bool,
  //   onBuy: PropTypes.func,
  //   onSell: PropTypes.func,
  // })),
  quickOrderProps: PropTypes.object,
  hasMarkPriceLine: PropTypes.bool,
  cRef: PropTypes.object,
  disabledFeatures: PropTypes.array,
  handlePushEvent: PropTypes.func,
  chartPropertiesKey: PropTypes.string,
};

export default React.memo(ByTradingview);
