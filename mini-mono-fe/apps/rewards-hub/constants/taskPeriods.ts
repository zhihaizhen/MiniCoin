export type TaskPeriodKey = '7d' | '30d' | '90d';

export type TagVariant = 'green' | 'yellow' | 'orange';

export interface TaskPeriod {
  key: TaskPeriodKey;
  days: number;
  tagKey: string;
  tagVariant: TagVariant;
  showTypeFilter: boolean;
}

// 一级活动周期 tab 的多语言 key，文案模板为 "{days}天"，
// 所有周期共用同一个 key，渲染时传入插值参数：t(PERIOD_LABEL_KEY, { days: period.days })
export const PERIOD_LABEL_KEY = 'period-days-tab';

// 非新人限时任务卡片标签的多语言 key，文案模板为 "{days}天限时任务"，
// 30d/90d 共用同一个 key，渲染时传入插值参数：t(PERIOD_TAG_KEY, { days: period.days })
// 7天为新人专属文案（newUserTask），不走此模板
export const PERIOD_TAG_KEY = 'period-days-tag';

// 一级活动周期 tab 的完整配置源（按天数索引），实际展示的 tab 由接口返回的
// valid_days_list 通过 getPeriodsByValidDays 过滤生成
export const TASK_PERIODS: TaskPeriod[] = [
  {
    key: '7d',
    days: 7,
    tagKey: 'newUserTask',
    tagVariant: 'green',
    showTypeFilter: true
  },
  {
    key: '30d',
    days: 30,
    tagKey: PERIOD_TAG_KEY,
    tagVariant: 'yellow',
    showTypeFilter: false
  },
  {
    key: '90d',
    days: 90,
    tagKey: PERIOD_TAG_KEY,
    tagVariant: 'orange',
    showTypeFilter: false
  }
];

// 根据 get-campaign-detail 返回的 valid_days_list 生成实际展示的周期 tab。
// 顺序跟随 valid_days_list，未在配置中命中的天数忽略；列表为空时回退到全量配置。
export const getPeriodsByValidDays = (
  validDaysList?: number[]
): TaskPeriod[] => {
  if (!Array.isArray(validDaysList) || validDaysList.length === 0) {
    return TASK_PERIODS;
  }
  return validDaysList
    .map((days) => TASK_PERIODS.find((p) => p.days === days))
    .filter((p): p is TaskPeriod => Boolean(p));
};

// 二级类型筛选 tab（原先重复定义在 PC/H5 组件内，统一收敛到此处）
export const TASK_TYPES = [
  {
    key: 'task-type-all-l',
    type: [] as string[],
    showNew: false
  },
  {
    key: 'task-type-deposit',
    type: ['Asset'],
    showNew: false
  },
  {
    key: 'task-type-futures',
    type: ['Future', 'CopyTrading'],
    showNew: false
  },
  {
    key: 'task-type-wealth',
    type: ['Wealth'],
    showNew: false
  },
  // {
  //   key: 'task-type-block-trade',
  //   type: ['BlockTrade'],
  //   showNew: true
  // },
  {
    key: 'task-type-spot',
    type: ['Spot'],
    showNew: false
  }
];

// 进度条任务（product_type:task_event）
export const PROGRESS_TASK_KEYS = new Set([
  'Asset:token_user_deposit',
  'Future:token_user_trade',
  'Spot:token_start_spot_grid'
]);
