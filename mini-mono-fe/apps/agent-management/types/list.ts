export interface IReqList {
  pageSize?: number;
  pageNum?: number;
}

export interface IRespList<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  orders: any[];
  optimizeCountSql: boolean;
  searchCount: boolean;
  countId: number;
  maxLimit: number;
  pages: number;
}
