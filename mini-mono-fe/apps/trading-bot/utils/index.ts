/**
 * 格式化价格，保留原始精度（至少 2 位小数）
 */
export const formatPrice = (price: number | string): string => {
  const str = String(price);
  const num = Number(str);
  if (isNaN(num)) return '--';
  const decimalPart = str.includes('.') ? str.split('.')[1] : '';
  const decimals = Math.max(2, decimalPart.length);
  return num.toFixed(decimals);
};

/**
 * 获取终止条件文本
 * @param params 策略参数
 * @param t 国际化函数
 * @returns 终止条件文本
 */
export const getTerminationConditionsText = (
  params: {
    stopTakeProfit?: number | string;
    stopLoss?: number | string;
    stopBreakUpper?: number | string;
    stopBreakLower?: number | string;
    stop_take_profit?: number | string;
    stop_loss?: number | string;
    stop_break_upper?: number | string;
    stop_break_lower?: number | string;
  },
  t: (key: string) => string
): string => {
  // 兼容两种命名方式：驼峰和下划线
  const stopTakeProfit = Number(
    params?.stopTakeProfit ?? params?.stop_take_profit ?? 0
  );
  const stopLoss = Number(params?.stopLoss ?? params?.stop_loss ?? 0);
  const stopBreakUpper = Number(
    params?.stopBreakUpper ?? params?.stop_break_upper ?? 0
  );
  const stopBreakLower = Number(
    params?.stopBreakLower ?? params?.stop_break_lower ?? 0
  );

  const values: string[] = [];

  if (stopTakeProfit > 0) {
    values.push(`${t('take-profit')}：${formatPrice(stopTakeProfit)}`);
  }
  if (stopBreakUpper > 0) {
    values.push(t('break-upper-limit'));
  }
  if (stopLoss > 0) {
    values.push(`${t('stop-loss')}：${formatPrice(stopLoss)}`);
  }
  if (stopBreakLower > 0) {
    values.push(t('break-lower-limit'));
  }

  if (values.length === 0) return '--';
  return values.join(' | ');
};

/**
 * 解析 cron 表达式为可读文案
 * @param cron cron 表达式
 * @param t 国际化函数
 * @returns 可读文案
 */
export const parseCronToText = (
  cron: string,
  t: (key: string) => string
): string => {
  if (!cron) return '';
  const parts = cron.split(' ');
  if (parts.length < 6) return cron;
  const [, minute, hour, dayOfMonth, , dayOfWeek] = parts;

  // 小时类型：hour 字段含 */N（如 */2）
  if (hour.includes('/')) {
    const n = parseInt(hour.split('/')[1], 10) || 1;
    return `${t('every')}${n}${t('hour-unit')}`;
  }

  const timeStr = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

  // 周类型：dayOfWeek 为具体数字
  if (dayOfWeek !== '?' && dayOfWeek !== '*') {
    const weekDays = [
      t('monday'),
      t('tuesday'),
      t('wednesday'),
      t('thursday'),
      t('friday'),
      t('saturday'),
      t('sunday')
    ];
    const dayName = weekDays[Number(dayOfWeek) - 1] || dayOfWeek;
    return `${t('every')}${dayName} ${timeStr}`;
  }

  // 月类型：dayOfMonth 为具体日期数字（不含 /）
  if (dayOfMonth !== '*' && dayOfMonth !== '?' && !dayOfMonth.includes('/')) {
    return `${t('every-month')}${dayOfMonth}${t('month-day-unit')} ${timeStr}`;
  }

  // 天类型：dayOfMonth 含 */N 或为 *
  const n = dayOfMonth.includes('/')
    ? parseInt(dayOfMonth.split('/')[1], 10) || 1
    : 1;
  return `${t('every')}${n}${t('day-unit')} ${timeStr}`;
};

/**
 * 打开划转弹框（资金账户 → 现货账户），替代跳转资产页面
 * 需要在 _app.tsx 中挂载 TransferModalRef
 */
export const openTransferModal = (callback?: () => void) => {
  // @ts-ignore betterbit-ui 从 monorepo 根依赖引入
  import('betterbit-ui').then(({ TransferModal }: any) => {
    TransferModal.show({
      from: 'FUNDING',
      to: 'SPOT',
      callback: () => {
        TransferModal.close();
        callback?.();
      }
    });
  });
};

/**
 * 格式化定投策略运行时长
 *
 * 入参为后端返回的 `strategyInterval`（单位：秒）。
 * - 不传 / null / undefined：返回 fallback（默认 '--'）
 * - 0 ：返回 fallback（默认 '--'）
 * - <60 秒：返回 `XS`
 * - >=60 秒：返回 `XD XH XM`
 *
 * 用于策略列表、详情页和分享弹框等多个场景。
 */
export const formatStrategyRuntime = (
  seconds: number | string | null | undefined,
  fallback = '--'
): string => {
  if (seconds === null || seconds === undefined || seconds === '')
    return fallback;
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  if (total === 0) return fallback;
  if (total < 60) return `${total}S`;
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${days}D ${hours}H ${minutes}M`;
};
