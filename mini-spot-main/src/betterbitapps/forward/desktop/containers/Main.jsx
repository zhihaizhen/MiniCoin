import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  GRID_COLS,
  GRID_GUTTER,
  GRID_ITEMS,
  GRID_ITEM_CFG,
  GRID_ROW_HEIGHT,
  SIDEBAR_WIDTH,
} from '@/constants/layout';
import useGridLayout from '@/hooks/use-grid-layout';
// import NoviceGuide from 'common/components/NoviceGuide';
import Coachmark from 'common/components/Coachmark';
import { ONBOARDING_TOUR_COMPLETED_KEY } from 'common/packages-biz/global-settings/localStorageSettings';
import { eventBus } from 'common/utils/EventBus';
import { storage } from 'by-storage';
import PropTypes from 'prop-types';
import GridLayout from 'react-grid-layout';
import { withSize } from 'react-sizeme';
import { useTranslation } from 'react-i18next';
import {
  Chart,
  ObRtGroup,
  OrderCreate,
  Position,
  TradingAssets,
} from '.';
import useUserStore from '@/store-hooks/use-user-store';
import PreferenceNav from './Preference';
import RiskTips from 'common/components/RiskTips';
import { TransferModalRef, modalRef } from 'betterbit-ui';
import { getOnboardingTourSteps } from '@/constants/onboardingTour.config';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Style from './main.module.less';

const Main = ({ size }) => {
  const [t] = useTranslation();
  const { loggedIn } = useUserStore();
  const [curLayout, setcurLayout] = useState({
    layout: [],
    width: 0,
  });
  // Onboarding_Tour：仅登录后生效——未完成则首次进入弹出；已完成不弹出。不记忆中断步骤。
  const [onboardingActive, setOnboardingActive] = useState(
    () => !storage.get(ONBOARDING_TOUR_COMPLETED_KEY),
  );
  const [restartSignal, setRestartSignal] = useState(0);
  const onboardingSteps = useMemo(() => getOnboardingTourSteps(t), [t]);

  useEffect(() => {
    const handleRestart = () => {
      if (!loggedIn) {
        return;
      }
      setRestartSignal((n) => n + 1);
      setOnboardingActive(true);
    };
    eventBus.on('onboardingTour:restart', handleRestart);
    return () => {
      eventBus.off('onboardingTour:restart', handleRestart);
    };
  }, [loggedIn]);

  // 拖拽 -- start
  const {
    orderBookSetting,
    chartSetting,
    layout,
    updateLayout,
    resetToDefaultLayout,
    gridHeightRows,
    onGridItemFullScreen,
    onGridItemCancelFullScreen,
  } = useGridLayout();
  const GridItemsMap = {
    [GRID_ITEMS.CHART]: {
      component: Chart,
      className: Style.chartPanel,
      props: {
        resize: chartSetting,
        onFullScreen: onGridItemFullScreen,
        onFullScreenCancel: onGridItemCancelFullScreen,
      },

    },
    [GRID_ITEMS.OB]: {
      component: ObRtGroup,
      className: Style.orderBookPanel,
      props: {
        width: orderBookSetting.w,
        height: orderBookSetting.h,
        totalHeight: gridHeightRows,
        onFullScreen: onGridItemFullScreen,
        onFullScreenCancel: onGridItemCancelFullScreen,
      },
    },
    [GRID_ITEMS.POZ]: {
      component: Position,
      className: Style.positionPanel,
    },
  };

  function initLayout() {
    const lay = layout.map((item) => ({ ...item }));
    const chartIndex = layout.findIndex((item) => item.i === GRID_ITEMS.CHART);
    const obIndex = layout.findIndex((item) => item.i === GRID_ITEMS.OB);

    const bookedIndex = layout.findIndex(
      (item) => item.i === GRID_ITEMS.BOOKED,
    );
    const navIndex = layout.findIndex((item) => item.i === GRID_ITEMS.NAV);
    // 响应式
    if (size.width < 1280) {
      lay[chartIndex] =
        layout[chartIndex]?.w === 9
          ? { ...layout[chartIndex], w: 8 }
          : layout[chartIndex];

      if (bookedIndex > -1) {
        lay[bookedIndex] =
          layout[bookedIndex]?.w === 9
            ? { ...layout[bookedIndex], w: 8 }
            : { ...layout[bookedIndex] };
      }
      if (navIndex > -1) {
        lay[navIndex] =
          layout[navIndex]?.w === 9
            ? { ...layout[navIndex], w: 8 }
            : { ...layout[navIndex] };
      }
      if (obIndex > -1) {
        lay[obIndex] =
          layout[obIndex]?.w === 3
            ? { ...layout[obIndex], x: 8, w: 4, minW: 4 }
            : { ...layout[obIndex], minW: 3 };
      }
    }
    // orderbook 的布局，加上了最小宽度
    if (size.width >= 1280 && obIndex > -1) {
      lay[obIndex] = { ...layout[obIndex], minW: GRID_ITEM_CFG.OB.minW };
    }

    setcurLayout({
      layout: lay,
      width: size.width - SIDEBAR_WIDTH,
    });
  }

  useEffect(() => {
    if (size.width) {
      initLayout();
    }
  }, [size.width]);

  //  新手引导隐藏
  // useEffect(() => {
  //   dispatchGlobal({
  //     type: types.SET_GUIDANCE_SWITCH,
  //     status: guidanceSwitchKey,
  //   });
  // }, [dispatchGlobal, guidanceSwitchKey]);

  // useEffect(() => {
  //   const guidanceSequenceKey =
  //     Number(storage.get(GUIDANCE_CURRENT_STEP_KEY)) || 1;
  //   dispatchGlobal({
  //     type: types.SET_GUIDANCE_CURRENT_STEP,
  //     status: guidanceSequenceKey,
  //   });
  // }, [dispatchGlobal, loggedIn]);

  return (
    <main className={Style.main}>
      {loggedIn && <TransferModalRef ref={modalRef} />}

      <RiskTips />
      {/* nav */}
      <div className={Style.symbolHeader}>
        <PreferenceNav />
      </div>

      {/* 下部分 */}
      <div className={Style.contentLayout}>
        <div className={Style.marketGridArea}>
          <GridLayout
            layout={curLayout.layout}
            width={curLayout.width}
            rowHeight={GRID_ROW_HEIGHT}
            margin={[GRID_GUTTER, GRID_GUTTER]}
            draggableHandle=".re-draggable"
            onResizeStop={updateLayout}
            onDragStop={updateLayout}
            cols={GRID_COLS}
          >
            <For
              each="it"
              of={curLayout.layout.filter(
                (item) =>
                  item.i !== GRID_ITEMS.BOOKED &&
                  item.i !== GRID_ITEMS.NAV &&
                  !!GridItemsMap[item.i]?.component,
              )}
            >
              {/* 可拖拽组件内部的内容 z-index 高于遮罩, 也不显示, 需要父组件zIndex也同级. */}
              <div
                key={it.i}
                className={GridItemsMap[it.i]?.className || ''}
              >
                {React.createElement(
                  GridItemsMap[it.i]?.component,
                  GridItemsMap[it.i]?.props,
                )}
              </div>
            </For>
          </GridLayout>
        </div>
        <div className={Style.tradeSidebar}>
          <OrderCreate />
          <div className={Style.assetsPanel}>
            <TradingAssets />
          </div>
        </div>
      </div>

      {/* Onboarding_Tour：通用 Coachmark + 现货侧步骤配置；仅登录后展示 */}
      <Coachmark
        steps={onboardingSteps}
        active={onboardingActive && loggedIn}
        storageKey={ONBOARDING_TOUR_COMPLETED_KEY}
        restartSignal={restartSignal}
        onFinish={() => setOnboardingActive(false)}
      />
    </main>
  );
};

Main.defaultProps = {
  size: { width: 1024 },
};

Main.propTypes = {
  size: PropTypes.object,
};

export default withSize({
  refreshMode: 'debounce',
  refreshRate: 100,
})(Main);
