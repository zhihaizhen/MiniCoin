// Coachmark 通用引导浮层组件类型定义
// 与业务解耦，仅描述步骤数据结构与组件对外 Props，供 common/components/Coachmark 内部及业务侧引用

/** 浮层卡片相对 Target_Element 的展示方向，默认 'auto'（组件内部自动计算） */
export type CoachmarkPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * 顶/底 placement 时箭头沿卡片水平对齐方式：
 * - start：贴左（Figma 第一步 beak left:16）
 * - end：贴右（Figma 第二步 beak right:16）
 */
export type CoachmarkArrowAlign = 'start' | 'end';

/** 单个引导步骤的配置项 */
export interface CoachmarkStep {
  /** Target_Element 的 CSS 选择器，如 '[data-coachmark-step="symbol-select"]' */
  targetSelector: string;
  /** 浮层卡片标题 */
  title: string;
  /** 浮层卡片说明文案 */
  description: string;
  /** 浮层卡片相对 target 的展示方向，默认 'auto' */
  placement?: CoachmarkPlacement;
  /** 顶/底箭头水平对齐，默认 'start' */
  arrowAlign?: CoachmarkArrowAlign;
  /**
   * 可选：卡片水平对齐参考元素（CSS 选择器）。
   * 高亮仍用 targetSelector；用于窄锚点（如 checkbox）时让卡片与同列宽元素右对齐。
   */
  alignSelector?: string;
  /** 高亮镂空圆角（px），默认 4 */
  highlightRadius?: number;
  /**
   * 高亮镂空左边额外内缩（px），默认 0。
   * 用于 target 左边缘紧贴容器边界、与浮层卡片左缘错位的场景（如「查看当前委托」步骤），
   * 让高亮框左边与卡片左边对齐，而不是与 target 原始左边界对齐。
   */
  highlightInsetLeft?: number;
}

/** Coachmark 主组件对外 Props */
export interface CoachmarkProps {
  /** 引导步骤数组，由业务侧传入（如 Onboarding_Tour 配置） */
  steps: CoachmarkStep[];
  /** 是否显示引导，由业务侧决定触发时机 */
  active: boolean;
  /** 完成状态存储键，由业务侧传入，用于持久化到 localStorage */
  storageKey: string;
  /** 引导完成/关闭时的回调，业务侧可用于写入其他状态 */
  onFinish?: () => void;
  /** 每次自增触发"从第一步重新开始"，用于"重新观看"等场景 */
  restartSignal?: number;
}
