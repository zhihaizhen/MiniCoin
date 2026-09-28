import { clamp } from '@unified/helpers';
import { LAYOUT_STORAGE_KEY_LINEAR } from 'common/packages-biz/by-global-settings';

/**
 * Min width for this project
 */
export const VIEW_PORT_MIN_WIDTH = 1440;

/**
 * Side bar width 300 + 4 + 4
 */
export const SIDEBAR_WIDTH = 320;

/**
 * Navbar height + PreferenceBar height
 */
// export const TOP_HEIGHT = 104;
export const TOP_HEIGHT = 92;

/**
 * Footer height
 */
export const BOTTOM_HEIGHT = 48;

/**
 * Min/Max height for this project
 */
export const VIEW_PORT_MIN_HEIGHT = 800;
export const VIEW_PORT_MAX_HEIGHT = 1600;

/**
 * Row height setting for React grid layout
 */
export const GRID_ROW_HEIGHT = 44;

/**
 * Every spacing between every items in grid layout
 */
export const GRID_GUTTER = 4;

/**
 * Every ob level remain height
 */
export const LEVEL_HEIGHT = 24; // orderbook每一行数据的高度

/**
 * title height for OB
 */
export const OB_TITLE_HEIGHT = 24;
export const OB_HEAD_HEIGHT = 40;
/**
 * 40 + 24 + 8
 */
export const OB_LARGE_REMAIN_HEIGHT = 72; // orderbook最大的高度？？？

/**
 * Remained head
 *  - head: 40
 *  - thead: 20 + 4 bottom space = 24
 *  - body: 4 top space + 4 bottom space = 8
 *  - current block: 4 top space + 32 + 4 bottom space = 40
 *
 *  total = 40 + OB_TITLE_HEIGHT(24) + 8 + 42 = 112
 */
export const REMAIN_HEIGHT = 136;

/**
 * Default chart / ob = 8 / 3
 * So use cols 11.
 */
export const GRID_COLS = 12;

// 设置最小值
export const GRID_ITEM_CFG = {
  BOOKED: { minH: 1, minW: 6 },
  NAV: { minH: 1.4, minW: 6 },
  CHART: { minH: 13, minW: 6 },
  OB: { minH: 13, minW: 2 },
  POZ: { minH: 4, minW: 8 }
};

export const VIEW_MIN_ROW_HEIGHT_NUM = 20; // 设置中间区域可用高度，最小20份

export const GRID_ITEMS = {
  BOOKED: 'booked',
  NAV: 'nav',
  CHART: 'chart',
  OB: 'orderbook',
  POZ: 'position'
};

// 默认布局
export const DEFAULT_LAYOUT = [
  {
    i: GRID_ITEMS.BOOKED,
    x: 0,
    y: 0,
    w: 9,
    h: 1,
    ...GRID_ITEM_CFG.BOOKED
  }, // 收藏列表,在515的布局中干掉了
  {
    i: GRID_ITEMS.NAV,
    x: 0,
    y: 1,
    w: 12,
    h: 1.4,
    ...GRID_ITEM_CFG.NAV // 币种信息，全宽
  },
  {
    i: GRID_ITEMS.CHART,
    x: 0,
    y: 2.5,
    w: 9,
    h: 18,
    ...GRID_ITEM_CFG.CHART // 图表
  },
  {
    i: GRID_ITEMS.OB,
    x: 10,
    y: 2.5,
    w: 3,
    h: 18,
    ...GRID_ITEM_CFG.OB // ordebook
  },
  {
    i: GRID_ITEMS.POZ,
    x: 0,
    y: 15,
    w: 12,
    h: 8,
    ...GRID_ITEM_CFG.POZ
  }
];

/**
 * Calculate full height rows and every cards' default rows
 */

let savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY_LINEAR);
try {
  savedLayout = JSON.parse(savedLayout);
} catch (err) {
  // eslint-disable-next-line
  console.warn("Layout can't be loaded!");
}
// 判断布局里面是否有最近成交
const usePreLayout = () => {
  if (Array.isArray(savedLayout)) {
    const hasRecent = savedLayout.find((it) => it.i === 'recentTrade');
    return !hasRecent;
  }
  return false;
};

savedLayout = usePreLayout() ? savedLayout : undefined;

export const INIT_LAYOUT = savedLayout ?? DEFAULT_LAYOUT;
export const IS_DEFAULT_LAYOUT = !savedLayout;

export const getAdjustedHeight = (height) =>
  clamp(height, VIEW_PORT_MIN_HEIGHT, VIEW_PORT_MAX_HEIGHT);

const innerHeight = getAdjustedHeight(document.documentElement.clientHeight);
const girdHeight = innerHeight - TOP_HEIGHT - BOTTOM_HEIGHT - GRID_GUTTER; // 可利用的布局区域
const calcHeightRows = Math.round(girdHeight / (GRID_ROW_HEIGHT + GRID_GUTTER));

export const TOTAL_HEIGHT_ROWS = Math.max(
  calcHeightRows
  // VIEW_MIN_ROW_HEIGHT_NUM,
);

const DEFAULT_OB_ROWS = TOTAL_HEIGHT_ROWS - GRID_ITEM_CFG.POZ.minH;
// 重置的布局的高度
export const FIXED_BOOKED_ROWS = 1;
export const FIXED_NAV_ROWS = 1.4; // 会取代DEFAULT_LAYOUT的h

export const FIXED_OB_ROWS = clamp(
  DEFAULT_OB_ROWS,
  GRID_ITEM_CFG.OB.minH,
  GRID_ITEM_CFG.OB.maxH
);

export const FIXED_CHART_ROWS = FIXED_OB_ROWS;
export const KLINE_DIALOG_WIDTH = 320;
export const KLINE_DIALOG_WIDTH_PRIZE = 500;
