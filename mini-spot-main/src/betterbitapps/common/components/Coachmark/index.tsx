// @ts-nocheck
// Coachmark 主组件：浮层 + 四块镂空遮罩 + 步骤导航 + 完成态持久化
// 与业务解耦，不依赖交易页 Store / 容器；步骤内容由业务侧通过 steps 传入
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { storage } from 'by-storage';
import { CoachmarkCard } from './CoachmarkCard';
import useTargetRect, { TargetRect } from './useTargetRect';
import { CoachmarkArrowAlign, CoachmarkPlacement, CoachmarkProps, CoachmarkStep } from './types';
import Style from './index.module.less';

const CARD_WIDTH = 340;
const CARD_EST_HEIGHT = 140;
const GAP = 12;
/** 顶/底箭头相对卡片近端的视觉中心（Figma beak inset + 半宽） */
const ARROW_INSET = 20;
/** start 对齐时箭头相对卡片左缘的偏移（与 CSS .arrowTop left 一致） */
const ARROW_START_LEFT = 16;
/** 高亮镂空相对 target 的外扩边距 */
const HIGHLIGHT_PADDING = 4;
/** target 暂不可见时，等待后再判定跳过，避免首屏渲染竞态 */
const SKIP_DELAY_MS = 280;
/** 判定 scrollIntoView 动画已结束所需的连续静止帧数（rect 不再变化） */
const SCROLL_STABLE_FRAMES = 3;
/** 滚动确认的兜底超时：网格布局尺寸未就绪等极端情况下，超时后仍放行展示，避免引导流程卡死 */
const SCROLL_SETTLE_TIMEOUT_MS = 1200;

/** target 是否已完整落在视口内（水平 + 垂直），用于判断是否需要/是否已完成滚动 */
const isRectInViewport = (rect: DOMRect): boolean =>
  rect.top >= 0 &&
  rect.left >= 0 &&
  rect.bottom <= window.innerHeight &&
  rect.right <= window.innerWidth;

type ResolvedPlacement = Exclude<CoachmarkPlacement, 'auto'>;

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** 根据视口空间，将 auto/指定 placement 解析为最终方向 */
const resolvePlacement = (
  rect: TargetRect,
  preferred: CoachmarkPlacement | undefined,
): ResolvedPlacement => {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const candidates: ResolvedPlacement[] =
    preferred && preferred !== 'auto'
      ? [preferred, 'bottom', 'top', 'right', 'left']
      : ['bottom', 'top', 'right', 'left'];

  const fits = (p: ResolvedPlacement): boolean => {
    if (p === 'bottom') {
      return rect.bottom + GAP + CARD_EST_HEIGHT <= viewportH;
    }
    if (p === 'top') {
      return rect.top - GAP - CARD_EST_HEIGHT >= 0;
    }
    if (p === 'right') {
      return rect.right + GAP + CARD_WIDTH <= viewportW;
    }
    return rect.left - GAP - CARD_WIDTH >= 0;
  };

  return candidates.find(fits) || 'bottom';
};

/** 计算浮层卡片 fixed 定位
 * alignBox：可选的水平对齐参考（如全宽输入行）；缺省时与 highlight 相同
 */
const getCardPosition = (
  highlight: HighlightBox,
  placement: ResolvedPlacement,
  arrowAlign: CoachmarkArrowAlign = 'start',
  alignBox?: HighlightBox | null,
): { top: number; left: number } => {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const hAlign = alignBox || highlight;
  let top = 0;
  let left = 0;

  if (placement === 'bottom' || placement === 'top') {
    top =
      placement === 'bottom'
        ? highlight.top + highlight.height + GAP
        : highlight.top - GAP - CARD_EST_HEIGHT;
    if (arrowAlign === 'end') {
      // 箭头贴右：卡片右缘对齐参考元素右缘（与第三步同列右对齐）
      left = hAlign.left + hAlign.width - CARD_WIDTH;
    } else {
      // 箭头贴左：箭头最左侧对准高亮最左侧（cardLeft + ARROW_START_LEFT = highlight.left）
      left = highlight.left - ARROW_START_LEFT;
    }
  } else if (placement === 'right') {
    top = highlight.top + highlight.height / 2 - ARROW_INSET;
    left = highlight.left + highlight.width + GAP;
  } else {
    top = highlight.top + highlight.height / 2 - ARROW_INSET;
    left = highlight.left - GAP - CARD_WIDTH;
  }

  // 约束在视口内，避免卡片溢出
  left = Math.max(8, Math.min(left, viewportW - CARD_WIDTH - 8));
  top = Math.max(8, Math.min(top, viewportH - CARD_EST_HEIGHT - 8));

  return { top, left };
};

/** 顶/底箭头相对卡片左缘的水平偏移，使箭头中心对准高亮中心 */
const getArrowOffsetX = (
  highlight: HighlightBox,
  cardLeft: number,
): number => {
  const targetCenterX = highlight.left + highlight.width / 2;
  const raw = targetCenterX - cardLeft - 4; // 4 = 箭头半宽
  return Math.max(ARROW_START_LEFT, Math.min(raw, CARD_WIDTH - 16 - 8));
};

const Coachmark = ({
  steps,
  active,
  storageKey,
  onFinish,
  restartSignal,
}: CoachmarkProps) => {
  const [visible, setVisible] = useState(Boolean(active));
  const [currentIndex, setCurrentIndex] = useState(0);
  // Target_Element 是否已确认滚动到位（完整落入视口）；为 false 时不渲染浮层，
  // 避免「元素还在可视区域外，教程卡片却已经出现」
  const [scrollReady, setScrollReady] = useState(false);
  // 记录上一次处理过的 restartSignal，避免初始化时误触发
  const lastRestartRef = useRef<number | undefined>(restartSignal);

  const safeSteps: CoachmarkStep[] = Array.isArray(steps) ? steps : [];
  const currentStep = safeSteps[currentIndex];
  const targetRect = useTargetRect(
    visible && currentStep ? currentStep.targetSelector : undefined,
  );
  // 水平对齐参考（如第四步用全宽 order-qty 行与第三步右对齐）
  const alignRect = useTargetRect(
    visible && currentStep?.alignSelector
      ? currentStep.alignSelector
      : undefined,
  );

  // 外部 active 变化时同步可见态；首次进入未完成则显示
  useEffect(() => {
    setVisible(Boolean(active));
    if (active) {
      setCurrentIndex(0);
    }
  }, [active]);

  // 教程展示时取消底层焦点，避免键盘仍可操作 input / Tab
  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    const el = document.activeElement;
    if (el instanceof HTMLElement) {
      el.blur();
    }
    const blockFocus = (e) => {
      const { target } = e;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest('[data-coachmark-card]')) {
        return;
      }
      e.preventDefault();
      if (target instanceof HTMLElement) {
        target.blur();
      }
    };
    document.addEventListener('focusin', blockFocus, true);
    return () => {
      document.removeEventListener('focusin', blockFocus, true);
    };
  }, [visible]);

  // restartSignal 自增 → 强制从第 1 步重新开始
  useEffect(() => {
    if (restartSignal === undefined) {
      return;
    }
    if (lastRestartRef.current === undefined) {
      lastRestartRef.current = restartSignal;
      return;
    }
    if (restartSignal === lastRestartRef.current) {
      return;
    }
    lastRestartRef.current = restartSignal;
    setCurrentIndex(0);
    setVisible(true);
  }, [restartSignal]);

  const markCompletedAndClose = useCallback(() => {
    try {
      if (storageKey) {
        storage.set(storageKey, '1');
      }
    } catch (e) {
      // storage 不可用时静默忽略，不阻断关闭
    }
    setVisible(false);
    onFinish?.();
  }, [storageKey, onFinish]);

  const handleNext = useCallback(() => {
    setCurrentIndex((idx) => {
      if (idx >= safeSteps.length - 1) {
        return idx;
      }
      return idx + 1;
    });
  }, [safeSteps.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((idx) => Math.max(0, idx - 1));
  }, []);

  // 步骤切换时先同步置为未就绪，避免上一步的高亮/卡片残留一帧后才被隐藏
  // （用 useLayoutEffect 保证在浏览器绘制前完成重置，不产生可见闪烁）
  useLayoutEffect(() => {
    setScrollReady(false);
  }, [visible, currentIndex, currentStep]);

  // 步骤切换时，Target_Element 可能位于滚动容器的不可视区域（如第四步 order-tabs 需下滚才可见）。
  // 此前的实现只是"发起一次 scrollIntoView 就不再理会"：滚动容器（.main）此时的可滚动高度
  // 可能还未稳定（如 react-grid-layout 布局/数据刚变化），一旦这一次计算的滚动距离不够，
  // 后面没有任何重试或校验，教程卡片就会先于目标滚入视口而展示，出现"元素还在视口外，
  // 教程却已经弹出"的偶现问题。
  // 这里改为：发起滚动后持续轮询 target 的 rect，直到其完整落入视口且连续多帧不再变化
  // （视为滚动动画已结束），才允许渲染浮层；并设置兜底超时，防止极端情况下卡住整个引导流程。
  useEffect(() => {
    if (!visible || !currentStep) {
      return undefined;
    }

    const target = document.querySelector(currentStep.targetSelector);
    if (!(target instanceof Element)) {
      // 目标不存在，交给下方的自动跳过逻辑处理，不阻塞展示
      setScrollReady(true);
      return undefined;
    }

    const initialRect = target.getBoundingClientRect();
    if (isRectInViewport(initialRect)) {
      // 已经完整可见，无需滚动，直接放行，不引入多余延迟
      setScrollReady(true);
      return undefined;
    }

    target.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'smooth',
    });

    let cancelled = false;
    let rafId = 0;
    let stableCount = 0;
    let lastTop: number | null = null;
    const startedAt = performance.now();

    const poll = () => {
      if (cancelled) {
        return;
      }
      const rect = target.getBoundingClientRect();
      const isStable = lastTop !== null && Math.abs(rect.top - lastTop) < 0.5;
      stableCount = isStable ? stableCount + 1 : 0;
      lastTop = rect.top;

      const settled = stableCount >= SCROLL_STABLE_FRAMES;
      const timedOut = performance.now() - startedAt > SCROLL_SETTLE_TIMEOUT_MS;
      if (settled || timedOut) {
        setScrollReady(true);
        return;
      }
      rafId = window.requestAnimationFrame(poll);
    };
    rafId = window.requestAnimationFrame(poll);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [visible, currentIndex, currentStep]);

  // target 不可见时自动跳到下一步；最后一步则直接完成
  useEffect(() => {
    if (!visible || !currentStep) {
      return undefined;
    }
    if (targetRect) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (currentIndex >= safeSteps.length - 1) {
        markCompletedAndClose();
      } else {
        setCurrentIndex((idx) => idx + 1);
      }
    }, SKIP_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    visible,
    currentStep,
    targetRect,
    currentIndex,
    safeSteps.length,
    markCompletedAndClose,
  ]);

  const highlight = useMemo<HighlightBox | null>(() => {
    if (!targetRect) {
      return null;
    }
    // 部分 target 左边缘紧贴容器边界，会导致高亮框左边比浮层卡片左边更靠左而错位；
    // 通过 highlightInsetLeft 让高亮框左边额外向内收，与卡片左边对齐（右/上/下边不受影响）
    const insetLeft = Math.max(0, currentStep?.highlightInsetLeft || 0);
    const left = Math.max(0, targetRect.left - HIGHLIGHT_PADDING + insetLeft);
    return {
      top: Math.max(0, targetRect.top - HIGHLIGHT_PADDING),
      left,
      width: Math.max(0, targetRect.width + HIGHLIGHT_PADDING * 2 - insetLeft),
      height: targetRect.height + HIGHLIGHT_PADDING * 2,
    };
  }, [targetRect, currentStep?.highlightInsetLeft]);

  const placement = useMemo<ResolvedPlacement>(() => {
    if (!targetRect) {
      return 'bottom';
    }
    return resolvePlacement(targetRect, currentStep?.placement);
  }, [targetRect, currentStep?.placement]);

  const arrowAlign: CoachmarkArrowAlign =
    currentStep?.arrowAlign === 'end' ? 'end' : 'start';

  const alignBox = useMemo<HighlightBox | null>(() => {
    if (!alignRect) {
      return null;
    }
    return {
      top: alignRect.top,
      left: alignRect.left,
      width: alignRect.width,
      height: alignRect.height,
    };
  }, [alignRect]);

  const cardPos = useMemo(() => {
    if (!highlight) {
      return null;
    }
    return getCardPosition(highlight, placement, arrowAlign, alignBox);
  }, [highlight, placement, arrowAlign, alignBox]);

  if (
    !visible ||
    !safeSteps.length ||
    !currentStep ||
    !scrollReady ||
    !highlight ||
    !cardPos
  ) {
    return null;
  }

  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === safeSteps.length - 1;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  // 仅当卡片水平对齐参考 ≠ 高亮目标时（如第四步），动态把箭头对准高亮中心；
  // 其余 end 步骤用 CSS 固定贴右（避免第三步全宽 target 时箭头落到中间）
  const arrowOffset =
    arrowAlign === 'end' &&
    currentStep.alignSelector &&
    (placement === 'bottom' || placement === 'top')
      ? getArrowOffsetX(highlight, cardPos.left)
      : undefined;

  // React 16 createPortal 顶层用单一 DOM。
  // 注意：不要在容器上写 aria-hidden——站点全局 CSS 会对 [aria-hidden] 设 display:none，
  // 导致蒙层/卡片全部不可见（此前 Fragment 方案里只有无 aria-hidden 的卡片能显示）。
  const overlay = (
    <div
      className={Style.layer}
      style={{ width: viewportW, height: viewportH }}
    >
      <div
        className={Style.mask}
        style={{
          top: 0,
          left: 0,
          width: viewportW,
          height: Math.max(0, highlight.top),
        }}
      />
      <div
        className={Style.mask}
        style={{
          top: highlight.top + highlight.height,
          left: 0,
          width: viewportW,
          height: Math.max(
            0,
            viewportH - (highlight.top + highlight.height),
          ),
        }}
      />
      <div
        className={Style.mask}
        style={{
          top: highlight.top,
          left: 0,
          width: Math.max(0, highlight.left),
          height: highlight.height,
        }}
      />
      <div
        className={Style.mask}
        style={{
          top: highlight.top,
          left: highlight.left + highlight.width,
          width: Math.max(
            0,
            viewportW - (highlight.left + highlight.width),
          ),
          height: highlight.height,
        }}
      />
      <div
        className={Style.spotlight}
        style={{
          top: highlight.top,
          left: highlight.left,
          width: highlight.width,
          height: highlight.height,
          borderRadius:
            typeof currentStep.highlightRadius === 'number'
              ? currentStep.highlightRadius
              : undefined,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      <div
        className={Style.cardWrap}
        data-coachmark-card
        style={{ top: cardPos.top, left: cardPos.left }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <CoachmarkCard
          title={currentStep.title}
          description={currentStep.description}
          currentIndex={currentIndex}
          totalSteps={safeSteps.length}
          placement={placement}
          arrowAlign={arrowAlign}
          arrowOffset={arrowOffset}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onFinish={markCompletedAndClose}
          onClose={markCompletedAndClose}
        />
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default Coachmark;
export type { CoachmarkProps, CoachmarkStep };
