/** 单根 K 线数据（标记价格历史 / 指数价格 K 线共用字段结构） */
export interface KlineItem {
  startAt: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

/** K 线列表接口统一响应结构 */
export interface KlineListResponse {
  list: KlineItem[];
  /**
   * 后端标记：本次响应已命中历史数据访问范围上限（例如未登录场景下的可查询区间边界）。
   * true 表示继续往前翻页也不会再拿到更早的数据，前端应停止对同一 symbol/resolution 的补拉。
   */
  enableCache: boolean;
  serviceTime?: number;
}

/** getPriceList / getIndexKlineList 公共入参 */
export interface GetKlineParams {
  symbol: string;
  resolution: string;
  from: number;
  to: number;
}

/** getIndexKlineList 额外支持 limit */
export interface GetIndexKlineParams extends GetKlineParams {
  limit?: number;
}

/** useKlineChart 接收的数据获取函数签名 */
export type FetchKline = (params: GetKlineParams) => Promise<KlineListResponse>;
