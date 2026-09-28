// apps/user-login/utils/passkey/silentFailureCounter.ts

export interface SilentFailureState {
  timestamps: number[];
}

export interface SilentFailureStepResult {
  state: SilentFailureState;
  shouldToast: boolean;
}

const WINDOW_MS = 30_000;
const THRESHOLD = 3;

export function createInitialSilentFailureState(): SilentFailureState {
  return { timestamps: [] };
}

/** 记录一次 NotAllowedError 静默失败，返回新状态及是否应展示兜底 toast */
export function recordSilentFailure(
  state: SilentFailureState,
  now: number
): SilentFailureStepResult {
  const last = state.timestamps[state.timestamps.length - 1];
  // 相邻间隔超过 30s：重置窗口，本次计为新窗口第 1 次（Requirement 6.9）
  const timestamps =
    last !== undefined && now - last > WINDOW_MS
      ? [now]
      : [...state.timestamps, now];

  if (timestamps.length >= THRESHOLD) {
    const first = timestamps[0];
    const shouldToast = now - first <= WINDOW_MS;
    // 达到阈值后无论是否触发 toast 都清空计数，避免无限增长；
    // 未触发 toast（首末间隔超过 30s）时也应重置为新窗口（等价于把超出窗口的旧记录丢弃）
    return {
      state: shouldToast ? { timestamps: [] } : { timestamps: [now] },
      shouldToast
    };
  }

  return { state: { timestamps }, shouldToast: false };
}

/** 登录成功 / 离开并返回登录 Tab 时调用，重置计数器（Requirement 6.10/6.11） */
export function resetSilentFailure(): SilentFailureState {
  return createInitialSilentFailureState();
}
