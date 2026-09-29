import { storage } from 'by-storage';
import { LAYOUT_STORAGE_KEY_SPOT } from 'common/packages-biz/global-settings';

import { useCallback, useEffect } from 'react';
import { useImmer } from 'use-immer';
import {
  DEFAULT_LAYOUT,
  FIXED_BOOKED_ROWS,
  FIXED_CHART_ROWS,
  FIXED_NAV_ROWS,
  FIXED_OB_ROWS,
  GRID_COLS,
  GRID_ITEMS,
  INIT_LAYOUT,
  IS_DEFAULT_LAYOUT,
  TOTAL_HEIGHT_ROWS,
} from '@/constants/layout';

const findItem =
  (item) =>
  ({ i }) =>
    i === item;

let oldLayout = [];
let isFullScreenMode = false;

const useGridLayout = () => {
  const [layout, setLayout] = useImmer(INIT_LAYOUT);
  const orderBookSetting = layout.find(findItem(GRID_ITEMS.OB)) || {};
  const chartSetting = layout.find(findItem(GRID_ITEMS.CHART)) || {};

  const updateLayout = (layoutNew) => {
    setLayout(() => layoutNew);
    if (!isFullScreenMode)
      storage.set(LAYOUT_STORAGE_KEY_SPOT, JSON.stringify(layoutNew));
  };

  // 重置布局的setting
  const resetToDefaultLayout = () => {
    storage.remove(LAYOUT_STORAGE_KEY_SPOT);
    const layout = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));

    resetLayoutRows(layout);

    if (isFullScreenMode) {
      oldLayout = layout;
      storage.set(LAYOUT_STORAGE_KEY_SPOT, JSON.stringify(layout));
    } else {
      setLayout(() => layout);
    }
  };

  const onGridItemFullScreen = (item) => {
    oldLayout = layout;
    isFullScreenMode = true;
    setLayout(() => [
      {
        i: item,
        x: 0,
        y: 0,
        w: GRID_COLS,
        minH: 3,
        minW: GRID_COLS,
        maxW: GRID_COLS,
        h: TOTAL_HEIGHT_ROWS,
      },
    ]);
  };

  const onGridItemCancelFullScreen = (item) => {
    isFullScreenMode = false;
    setLayout(() => oldLayout);
  };

  const setRowWithName = useCallback((layout, name, rows) => {
    const item = layout.find((item) => item.i === name) || {};
    item.h = rows;
  }, []);

  const resetLayoutRows = useCallback(
    (layout) => {
      // setRowWithName(layout, GRID_ITEMS.BOOKED, FIXED_BOOKED_ROWS);
      // setRowWithName(layout, GRID_ITEMS.NAV, FIXED_NAV_ROWS);
      setRowWithName(layout, GRID_ITEMS.CHART, FIXED_CHART_ROWS);
      setRowWithName(layout, GRID_ITEMS.OB, FIXED_OB_ROWS);
    },
    [setRowWithName],
  );

  /**
   * Update height layout or saved layout 1 time.
   */
  useEffect(() => {
    if (IS_DEFAULT_LAYOUT) {
      setLayout((draft) => {
        resetLayoutRows(draft);
      });
    }
  }, [setLayout, resetLayoutRows]);

  return {
    layout,
    updateLayout,
    resetToDefaultLayout,
    orderBookSetting,
    gridHeightRows: TOTAL_HEIGHT_ROWS,
    onGridItemFullScreen,
    onGridItemCancelFullScreen,
    chartSetting,
  };
};

export default useGridLayout;
