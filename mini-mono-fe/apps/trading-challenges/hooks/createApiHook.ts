import { useRequest, UseRequestOptions, UseRequestResult } from './useRequest';

/**
 * 创建 API Hook 工厂函数
 * 快速为 API 创建自定义 hook，减少重复代码
 * 
 * @example
 * ```tsx
 * // 定义一次
 * export const useDepositData = createApiHook(getUserDepositList, {
 *   initialData: [],
 *   formatResult: (res) => res.records || []
 * });
 * 
 * // 在组件中使用
 * const { data, loading } = useDepositData();
 * ```
 */
export function createApiHook<TData = any, TParams = any>(
  requestFn: (params?: TParams) => Promise<any>,
  defaultOptions?: Omit<UseRequestOptions<TData, TParams>, 'deps'>
) {
  return function useApiHook(
    runtimeOptions?: UseRequestOptions<TData, TParams>
  ): UseRequestResult<TData, TParams> {
    return useRequest<TData, TParams>(requestFn, {
      ...defaultOptions,
      ...runtimeOptions
    });
  };
}

/**
 * 创建列表类 API Hook（常见的 records 格式）
 * 
 * @example
 * ```tsx
 * export const useDepositList = createListApiHook(getUserDepositList);
 * export const useTaskList = createListApiHook(getUserTaskInfo, { formatResult: (res) => res });
 * ```
 */
export function createListApiHook<TData = any, TParams = any>(
  requestFn: (params?: TParams) => Promise<any>,
  options?: {
    formatResult?: (res: any) => TData[];
    defaultParams?: TParams;
  }
) {
  return createApiHook<TData[], TParams>(requestFn, {
    initialData: [],
    formatResult: options?.formatResult || ((res) => res?.records || []),
    defaultParams: options?.defaultParams
  });
}

/**
 * 创建详情类 API Hook（单个对象）
 * 
 * @example
 * ```tsx
 * export const useUserProfile = createDetailApiHook(getUserProfile);
 * ```
 */
export function createDetailApiHook<TData = any, TParams = any>(
  requestFn: (params?: TParams) => Promise<any>,
  options?: {
    formatResult?: (res: any) => TData;
    defaultParams?: TParams;
  }
) {
  return createApiHook<TData, TParams>(requestFn, {
    initialData: null as TData,
    formatResult: options?.formatResult,
    defaultParams: options?.defaultParams
  });
}

/**
 * 创建操作类 API Hook（不立即执行）
 * 
 * @example
 * ```tsx
 * export const useDeleteUser = createMutationHook(deleteUserAPI);
 * 
 * // 在组件中
 * const { run: deleteUser, loading } = useDeleteUser({
 *   onSuccess: () => message.success('删除成功')
 * });
 * ```
 */
export function createMutationHook<TData = any, TParams = any>(
  requestFn: (params?: TParams) => Promise<any>,
  defaultOptions?: Omit<UseRequestOptions<TData, TParams>, 'immediate' | 'deps'>
) {
  return function useMutationHook(
    runtimeOptions?: Omit<UseRequestOptions<TData, TParams>, 'immediate'>
  ): UseRequestResult<TData, TParams> {
    return useRequest<TData, TParams>(requestFn, {
      ...defaultOptions,
      ...runtimeOptions,
      immediate: false
    });
  };
}

