import toastErrorMsg from 'common/utils/toastErrorMsg';
import i18n from 'common/utils/i18n';
import { ICommonRespDTO } from 'common/types/api';
import {
  IOrderCancelAllRespDTO,
  IOrderCancelReq,
  IOrderCancelRespDTO,
  IOrderCreateReq,
  IOrderCreateRespDTO,
  IPlanOrderCancelReq,
  IPlanOrderCreateReq,
  IReplaceOrderReq,
  IReplaceOrderRespDTO,
} from 'common/types/services/order';
import http from 'common/utils/http';
import { traceParent } from 'common/utils/monitor/traceParent';
import { api2Host } from 'common/utils/routerSwitchEvent';

const privateApiHost = () => `${api2Host}/private`;
const privateApiHostV3 = () => `${api2Host}/v3/private`;

const PRE_CREATE_CONDITION_API = () =>
  `${privateApiHost()}/linear/stop-order/pre-create`;
const CREATE_CONDITION_API = () =>
  `${privateApiHost()}/linear/stop-order/create`;

const ORDER_CANCEL_BATCH_API = () => `${privateApiHostV3()}/order/cancel-batch`;

export const preCreateConditionOrder = (param: any) =>
  http.post(PRE_CREATE_CONDITION_API(), param);

export const createConditionOrder = (param: any) =>
  http.post(CREATE_CONDITION_API(), param, {
    meta: { showOrigin: true },
  } as any);

//
export const getOrderList = (params: any) =>
  http.get(`${privateApiHost()}/linear/tpsl/tpsl-stop-list`, {
    body: { ...params },
  });

export const cancelOrderBatch = (param: any) =>
  http.post(ORDER_CANCEL_BATCH_API(), param);

export const handleCreateOrderCatch = (res: ICommonRespDTO, url: string) => {
  if (res?.code === 9000001) {
    toastErrorMsg(i18n.t('requestTimeOut'), url);
  } else {
    const data = res?.data ?? res;
    toastErrorMsg(
      {
        ...data,
        type: 'notify',
        title: i18n.t('orderCreateFailureTitle'),
      },
      url,
    );
  }
};

export const createOrder = (
  params: IOrderCreateReq,
): Promise<IOrderCreateRespDTO> => {
  const url = `${api2Host}/spot/private/v1/order/create`;

  // 将参数转换为表单数据格式
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  return new Promise((resolve, reject) => {
    http
      .post(url, formData.toString(), {
        headers: {
          'X-Client-Tag': traceParent(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(resolve)
      .catch((res: ICommonRespDTO) => {
        handleCreateOrderCatch(res, url);
        reject(res);
      });
  });
};

// JSON 提交通用封装，复用 createOrder 的错误处理
const postJson = (url: string, params: any) => {
  const body: Record<string, any> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      body[key] = value;
    }
  });
  return new Promise((resolve, reject) => {
    http
      .post(url, body, {
        headers: {
          'X-Client-Tag': traceParent(),
          'Content-Type': 'application/json',
        },
      })
      .then(resolve)
      .catch((res: ICommonRespDTO) => {
        handleCreateOrderCatch(res, url);
        reject(res);
      });
  });
};

// 现货计划委托创建
export const createPlanOrder = (
  params: IPlanOrderCreateReq,
): Promise<IOrderCreateRespDTO> =>
  postJson(
    `${api2Host}/spot/private/v1/plan_order/create`,
    params,
  ) as Promise<IOrderCreateRespDTO>;

// 修改限价/市价委托的止盈止损
export const updateOrderTpsl = (params: any) =>
  postJson(`${api2Host}/spot/private/v1/order/update`, params);

// 修改计划委托的止盈止损
export const updatePlanOrderTpsl = (params: any) =>
  postJson(`${api2Host}/spot/private/v1/plan_order/update`, params);

// 计划委托撤单
export const cancelPlanOrder = (params: IPlanOrderCancelReq) =>
  postJson(`${api2Host}/spot/private/v1/plan_order/cancel`, params);

// 计划委托批量撤单
export const cancelAllPlanOrder = (params: any) =>
  postJson(`${api2Host}/spot/private/v1/plan_order/batch-cancel`, params);

export const cancelOrder = (params: any): Promise<IOrderCancelRespDTO> => {
  // 也是个表单数据
  const url = `${api2Host}/spot/private/v1/order/cancel`;
  const formData = new URLSearchParams();
  const newParams: IOrderCancelReq = {
    ...params,
    client_order_id: new Date().getTime(),
    i: 0,
  };
  Object.entries(newParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  return new Promise((resolve, reject) => {
    http
      .post(url, formData.toString(), {
        headers: {
          'X-Client-Tag': traceParent(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(resolve)
      .catch((res: ICommonRespDTO) => {
        handleCreateOrderCatch(res, url);
        reject(res);
      });
  });
};

export const cancelAllOrder = (): Promise<IOrderCancelAllRespDTO> => {
  const url = `${api2Host}/spot/private/v1/order/batch_cancel`;
  return http.post(
    url,
    {},
    {
      headers: { 'X-Client-Tag': traceParent() },
    },
  );
};

/**
 * 活动单/条件单 等止盈止损
 * @param params
 * @param event
 * @returns
 */
export const replaceOrder = (
  params: IReplaceOrderReq,
  event = {},
): Promise<IReplaceOrderRespDTO> => {
  const url = `${api2Host}/trade/private/v1/contract/order-amend`;
  return http.post(url, params, {
    event,
    headers: { 'X-Client-Tag': traceParent() },
  });
};
