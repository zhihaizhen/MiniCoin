import * as Sentry from '@sentry/nextjs';

// 1. 噪声库：定义需要彻底忽略的错误
const IGNORED_ERRORS = [
  // 网络抖动/取消
  'Network Error',
  'Load failed',
  'Request aborted',
  'Failed to fetch',
  // 第三方脚本/插件常见噪声
  'Script error.',
  'Non-Error promise rejection captured',

  '__SENTRY_INSTRUMENTATION_BRIDGE__', // Sentry 内部通信可能产生的日志
  'chrome-extension://',
  'unhandledrejection' // 未捕获的 Promise 异常
];

// 2. 资源/业务过滤规则
const RESOURCE_ERRORS = ['Unable to preload CSS', 'Importing a module script failed', 'ChunkLoadError'];
const BUSINESS_VALIDATION_MESSAGES = ['Please input', 'invalid', 'try again', 'validation failed'];

/**
 * 精细化采样逻辑
 */
const getTracesSampleRate = () => {
  if (process.env.NODE_ENV === 'development') return 1.0;
  // 生产环境仅采样 5%-10%，性能监控非常消耗额度
  return 0.2;
};
if (String(process.env.NEXT_PUBLIC_SENTRY_ENABLE) === '1') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // 环境标记，方便在 Dashboard 筛选
    environment: process.env.NEXT_PUBLIC_ENV || 'production',

    integrations: [
      Sentry.replayIntegration({
        // 敏感数据遮罩
        maskAllText: true,
        blockAllMedia: true
      }),
      // 自动追踪浏览器性能
      Sentry.browserTracingIntegration()
    ],

    // --- 采样控制（防爆量的核心） ---
    tracesSampleRate: getTracesSampleRate(),
    replaysSessionSampleRate: 0.01, // 正常会话仅录制 1%，极省额度
    replaysOnErrorSampleRate: 1.0, // 报错时 100% 录制，方便复现

    // 忽略列表
    ignoreErrors: IGNORED_ERRORS,

    // --- 高级过滤钩子 ---
    beforeSend(event, hint) {
      const exception = event.exception?.values?.[0];
      const value = exception?.value || '';
      const type = exception?.type || '';
      // 1. 过滤掉非本站域名的 JS 错误（防止插件报错占用额度）
      const frames = exception?.stacktrace?.frames;
      if (frames && frames.length > 0) {
        const lastFrame = frames[frames.length - 1];
        const filename = lastFrame?.filename;

        if (filename && filename.startsWith('http')) {
          try {
            const url = new URL(filename);
            const isSameOrigin = url.hostname === window.location.hostname;
            const isWhiteList = [
              'cdn.easicoin.io',
              'www.test.bitrunfinance.com'
            ].includes(url.hostname);

            if (!isSameOrigin && !isWhiteList) {
              return null;
            }
          } catch (e) {
            // URL 解析失败时，保守起见可以不拦截或记录日志
          }
        }
      }

      // 2. 过滤资源加载错误 & 业务校验
      if (
        RESOURCE_ERRORS.some((msg) => value.includes(msg)) ||
        BUSINESS_VALIDATION_MESSAGES.some((msg) =>
          value.toLowerCase().includes(msg.toLowerCase())
        ) ||
        (type === 'UnhandledRejection' && typeof exception?.value === 'string')
      ) {
        return null;
      }

      // 3. 过滤 HTTP 401/403/422 等不需要报警的业务错误
      const statusCode =
        hint?.originalException?.status ||
        hint?.originalException?.response?.status;
      if ([401, 403, 422].includes(statusCode)) {
        return null;
      }

      return event;
    },

    // 发送到 Sentry 的事件的每个字符串属性在被截断之前可以包含的最大字符数。
    maxValueLength: 1000,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
