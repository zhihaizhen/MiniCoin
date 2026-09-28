import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 请求配置选项
 */
export interface UseRequestOptions<TData, TParams> {
  /** 是否立即执行请求，默认 true */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: TData;
  /** 请求成功回调 */
  onSuccess?: (data: TData) => void;
  /** 请求失败回调 */
  onError?: (error: any) => void;
  /** 数据转换函数 */
  formatResult?: (res: any) => TData;
  /** 依赖项数组，当依赖变化时重新请求 */
  deps?: any[];
  /** 默认请求参数 */
  defaultParams?: TParams;
}

/**
 * 请求返回结果
 */
export interface UseRequestResult<TData, TParams> {
  /** 响应数据 */
  data: TData;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: any;
  /** 手动触发请求 */
  run: (params?: TParams) => Promise<any>;
  /** 刷新请求（使用上次的参数） */
  refresh: () => Promise<any>;
  /** 修改 data */
  mutate: (data: TData | ((prevData: TData) => TData)) => void;
}

/**
 * 通用请求 Hook
 * 
 * @template TData - 返回数据类型
 * @template TParams - 请求参数类型
 * 
 * @param requestFn - 请求函数
 * @param options - 配置选项
 * 
 * @example
 * ```tsx
 * // 基础用法
 * const { data, loading, error, run } = useRequest(getUserInfo);
 * 
 * // 带参数
 * const { data, loading } = useRequest(
 *   getUserList,
 *   { 
 *     defaultParams: { page: 1, size: 10 },
 *     formatResult: (res) => res.records || []
 *   }
 * );
 * 
 * // 手动触发
 * const { data, run } = useRequest(updateUser, { immediate: false });
 * // 调用：await run({ name: 'test' });
 * ```
 */
export function useRequest<TData = any, TParams = any>(
  requestFn: (params?: TParams) => Promise<any>,
  options: UseRequestOptions<TData, TParams> = {}
): UseRequestResult<TData, TParams> {
  const {
    immediate = true,
    initialData = undefined as TData,
    onSuccess,
    onError,
    formatResult,
    deps = [],
    defaultParams
  } = options;

  const [data, setData] = useState<TData>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<any>(null);
  
  // 保存最后一次请求的参数，用于 refresh
  const lastParamsRef = useRef<TParams | undefined>(defaultParams);

  /**
   * 执行请求
   */
  const run = useCallback(async (params?: TParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // 保存本次请求参数
      lastParamsRef.current = params;
      
      const res = await requestFn(params);
      const formattedData = formatResult ? formatResult(res) : res;
      
      setData(formattedData);
      onSuccess?.(formattedData);
      
      // 返回原始响应，方便调用方获取完整数据
      return res;
    } catch (err) {
      console.error('Request failed:', err);
      setError(err);
      onError?.(err);
      throw err; // 重新抛出错误，让调用方可以捕获
    } finally {
      setLoading(false);
    }
  }, [requestFn, formatResult, onSuccess, onError]);

  /**
   * 刷新请求（使用上次的参数）
   */
  const refresh = useCallback(async () => {
    return run(lastParamsRef.current);
  }, [run]);

  /**
   * 手动修改数据
   */
  const mutate = useCallback((newData: TData | ((prevData: TData) => TData)) => {
    setData(newData);
  }, []);

  // 自动请求
  useEffect(() => {
    if (immediate) {
      run(defaultParams);
    }
  }, deps);

  return {
    data,
    loading,
    error,
    run,
    refresh,
    mutate
  };
}

