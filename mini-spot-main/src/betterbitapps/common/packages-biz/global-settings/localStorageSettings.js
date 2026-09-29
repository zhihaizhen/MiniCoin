export const QUICK_ORDER_POSITION_KEY = 'tvSpot.quick_order.position';
export const SETTING_BAR_POSITION_KEY = 'settingSpot.bar.position';
export const DRAWING_TOOLS_KEY = 'tvSpot.drawing.sidebar';

// 本地时间修改，K线接口返回时间戳对比，提示弹框
export const SESSION_SHOW_LOCALTIM_TIPS = 'tvSpot.show_localtime_tips';

// 计划委托温馨提示：值为 'hide' 时不再弹出
export const CONDITION_ORDER_TIPS_KEY = 'spot.condition_order_tips';

export const TV_CHART_PROPERTIES = 'spot.chart_properties';

export const TV_CHART_PROPERTIES_MUL = 'multipleSpot.chart_properties';

// status of control order line and quick order.
export const QUICK_OPERATION_CHECKLIST = 'spot.chart_quick_operation_checklist'; // 用到了

// 触发多视图之前的trade-url 对应的 localstorage key
export const LAST_TRADE_URL = 'brandSpot_l_t_u';
export const QUICK_OPERATION_STATUS = {
  SHOW: 'show',
  HIDE: 'hide',
};

export const KLINE_PINNED_RESOLUTIONS_KEY = 'spot.kline_pinned_resolutions';

export const kline_btns = [
  // {
  //   slug: 'Time', // 窄屏展示
  //   resolution: '1', // 传给K线的参数
  //   chartType: 3, // 图表类型
  //   res: 'Time', // 区分分时与1m
  //   full: 'Time', // 宽屏展示
  // },
  {
    slug: '1m',
    resolution: '1',
    res: '1',
    option: [
      {
        resolution: '1',
        slug: '1m',
        full: '1m',
        res: '1',
      },
      {
        resolution: '3',
        slug: '3m',
        full: '3m',
        res: '3',
      },
      {
        resolution: '5',
        slug: '5m',
        full: '5m',
        res: '5',
      },
      {
        resolution: '15',
        slug: '15m',
        full: '15m',
        res: '15',
      },
      {
        resolution: '30',
        slug: '30m',
        full: '30m',
        res: '30',
      },
    ],
  },
  {
    slug: '1H',
    resolution: '60',
    res: '60',
    option: [
      {
        resolution: '60',
        slug: '1H',
        full: '1H',
        res: '60',
      },
      {
        resolution: '120',
        slug: '2H',
        full: '2H',
        res: '120',
      },
      {
        resolution: '240',
        slug: '4H',
        full: '4H',
        res: '240',
      },
      {
        resolution: '360',
        slug: '6H',
        full: '6H',
        res: '360',
      },
      {
        resolution: '720',
        slug: '12H',
        full: '12H',
        res: '720',
      },
    ],
  },
  {
    slug: '1D',
    resolution: '1440',
    res: '1440',
    full: '1D',
  },
  {
    slug: '1W',
    resolution: '10080',
    res: '10080',
    full: '1W',
  },
  {
    slug: '1M',
    resolution: '44640',
    res: '44640',
    full: '1M',
  },
];

// Coachmark 新手引导（Onboarding_Tour）；现货前缀与合约 trade_onboarding_* 区分
export const ONBOARDING_TOUR_COMPLETED_KEY = 'spot_onboarding_tour_completed';
export const ONBOARDING_TOUR_ENTRY_VIEWED_KEY =
  'spot_onboarding_tour_entry_viewed';
