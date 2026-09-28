// @ts-nocheck
// Coachmark 浮层卡片：纯展示型子组件，不直接管理 currentIndex 状态
// 展示标题/说明文案/步骤计数、按 placement 渲染指向 target 的箭头、渲染导航按钮与关闭按钮
// 按钮展示状态（isFirstStep/isLastStep）由父组件（index.tsx）计算后传入
// 视觉对齐 Figma coachmark：圆形图标前进/后退；最后一步主按钮为「完成」文案
import React from 'react';
import cls from 'classnames';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CloseSvg } from 'common/assets/images/close.svg';
import { ReactComponent as ChevronLeftSvg } from 'common/assets/images/chevron-left.svg';
import { ReactComponent as ChevronRightSvg } from 'common/assets/images/chevron-right.svg';
import { CoachmarkArrowAlign, CoachmarkPlacement } from './types';
import Style from './index.module.less';

/** CoachmarkCard 对外 Props，供 index.tsx 整合时使用 */
export interface CoachmarkCardProps {
  /** 浮层卡片标题 */
  title: string;
  /** 浮层卡片说明文案 */
  description: string;
  /** 当前步骤索引（0-based），用于展示 `${currentIndex + 1}/${totalSteps}` */
  currentIndex: number;
  /** 总步骤数 */
  totalSteps: number;
  /** 卡片相对 target 的展示方向，决定箭头指向；'auto' 时降级为默认方向 */
  placement: CoachmarkPlacement;
  /** 顶/底箭头水平对齐：start 贴左，end 贴右（仅影响卡片定位；箭头位置由 arrowOffset 动态计算） */
  arrowAlign?: CoachmarkArrowAlign;
  /** 顶/底箭头相对卡片左缘的像素偏移；传入后覆盖 arrowAlign 的固定贴边 */
  arrowOffset?: number;
  /** 是否为第一步（决定是否展示"上一步"按钮） */
  isFirstStep: boolean;
  /** 是否为最后一步（决定"下一步"是否替换为"完成"） */
  isLastStep: boolean;
  /** 点击"下一步"回调 */
  onNext: () => void;
  /** 点击"上一步"回调 */
  onPrev: () => void;
  /** 点击"完成"回调 */
  onFinish: () => void;
  /** 点击右上角关闭按钮回调 */
  onClose: () => void;
}

/**
 * placement（卡片相对 target 的方位）与箭头方向的映射：
 * 箭头贴在卡片的哪条边、朝哪个方向，需要与卡片方位相反（箭头始终指向 target）。
 * 例如 placement='bottom' 表示卡片展示在 target 下方，箭头应贴在卡片顶边、指向上方（指回 target）。
 * 'auto' 无法在纯展示组件内计算真实方位，降级为 'bottom' 对应的方向（箭头默认朝上）。
 */
const ARROW_CLASS_MAP: Record<Exclude<CoachmarkPlacement, 'auto'>, string> = {
  top: 'arrowBottom',
  bottom: 'arrowTop',
  left: 'arrowRight',
  right: 'arrowLeft',
};

export const CoachmarkCard = ({
  title,
  description,
  currentIndex,
  totalSteps,
  placement,
  arrowAlign = 'start',
  arrowOffset,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onFinish,
  onClose,
}: CoachmarkCardProps) => {
  const [t] = useTranslation();
  // 'auto' 降级为 'bottom' 对应的箭头方向（不做实际方位计算，具体定位由父组件负责）
  const resolvedPlacement = placement === 'auto' ? 'bottom' : placement;
  const useDynamicArrow =
    arrowOffset != null &&
    (resolvedPlacement === 'bottom' || resolvedPlacement === 'top');
  const arrowClassName = cls(
    Style.arrow,
    Style[ARROW_CLASS_MAP[resolvedPlacement]],
    !useDynamicArrow && arrowAlign === 'end' && Style.arrowAlignEnd,
  );
  const arrowStyle = useDynamicArrow
    ? { left: arrowOffset, right: 'auto' }
    : undefined;

  // 始终渲染 prev + next/finish，避免步骤切换时 React 复用 DOM 导致白底闪烁；
  // 第一步用 hidden 隐藏 prev；最后一步主按钮为「完成」文案（Figma 27544:64737）
  const renderActions = () => (
    <>
      <button
        type="button"
        className={cls(Style.btnSecondary, isFirstStep && Style.btnHidden)}
        aria-label={t('trade-share:coachmarkPrev', { defaultValue: '上一步' })}
        aria-hidden={isFirstStep}
        tabIndex={isFirstStep ? -1 : 0}
        disabled={isFirstStep}
        onClick={onPrev}
      >
        <ChevronLeftSvg />
      </button>
      {isLastStep ? (
        <button
          type="button"
          className={cls(Style.btnPrimary, Style.btnFinish)}
          aria-label={t('completed', { defaultValue: '完成' })}
          onClick={onFinish}
        >
          {t('completed', { defaultValue: '完成' })}
        </button>
      ) : (
        <button
          type="button"
          className={Style.btnPrimary}
          aria-label={t('trade-share:coachmarkNext', { defaultValue: '下一步' })}
          onClick={onNext}
        >
          <ChevronRightSvg />
        </button>
      )}
    </>
  );

  return (
    <div className={Style.card}>
      <div className={arrowClassName} style={arrowStyle} />
      <div className={Style.closeBtn} onClick={onClose}>
        <CloseSvg />
      </div>
      <div className={Style.title}>{title}</div>
      <div className={Style.description}>{description}</div>
      <div className={Style.footer}>
        <span className={Style.stepCount}>{`${
          currentIndex + 1
        }/${totalSteps}`}</span>
        <div className={Style.btnGroup}>{renderActions()}</div>
      </div>
    </div>
  );
};

CoachmarkCard.defaultProps = {
  arrowAlign: 'start',
  arrowOffset: undefined,
};

export default CoachmarkCard;
