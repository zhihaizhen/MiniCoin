// import i18n from '../components/LinearPositions/utils/i18n';
// import toastErrorMsg from '../components/ReversePositions/utils/toastErrorMsg';
// import { v3CommonLinearPrivateApiPrefix } from '../constants/service';
import { ICommonRespDTO } from '../types/api';
import {
  IGetClosedPnlListReq,
  IGetClosedPnlListRespDTO,
  IGetTpslAllListRespDTO,
  IOrderCancelAllReq,
  IOrderCancelAllRespDTO,
  IOrderCancelReq,
  IOrderCancelRespDTO,
  IOrderCreateReq,
  IOrderCreateRespDTO,
  IReplaceOrderReq,
  IReplaceOrderRespDTO
} from '../types/services/order';
import http from '../utils/http';
import { traceParent } from '../utils/tranceParent';
import { api2Host } from '../utils/routerSwitchEvent';
// import { isDex } from '../utils/env';
// import { createSignMsg } from '../utils/starkwareParse';

// const v3PrivatetOrderApiPrefix = `${v3CommonLinearPrivateApiPrefix}/order`;

export const createOrder = (
  params: IOrderCreateReq,
  event = { sc: 20108, ec: 20109 }
): Promise<IOrderCreateRespDTO> => {
  const isDex = false;
  // const url = isDex?
  //   `${api2Host}/dex-portal-service/gw-trade/private/trade/create`
  // :
  //   `${api2Host}/trade/private/v1/contract/order`;

  const url = `${api2Host}/trade/private/v1/contract/order`;
  let assignParams: any = { ...params };
  //  console.log(assignParams,'assignParams')
  if (isDex) {
    // const { r, s, paramsArg } = createSignMsg(assignParams);
    // const sign_msg = {
    //   vault_sell: paramsArg[0] || '',
    //   vault_buy: paramsArg[1] || '',
    //   amount_sell: paramsArg[2] || '0',
    //   amount_buy: paramsArg[3] || '',
    //   token_sell: paramsArg[4] || '',
    //   token_buy: paramsArg[5] || '',
    //   nonce: paramsArg[6] || '',
    //   expiration_timestamp: paramsArg[7] || '',
    //   fee_token: paramsArg[8] || '',
    //   fee_vault_id: paramsArg[9] || '',
    //   fee_limit: paramsArg[10] || '0',
    //   signature: {
    //     r,
    //     s
    //   },
    //   is_buying_synthetic: assignParams.side === 'Buy',
    //   stark_key: JSON.parse(localStorage.getItem('dex:key') || '{}')?.starkKey
    // };
    // assignParams = { ...assignParams, sign_msg };
  }
  return new Promise((resolve, reject) => {
    http
      .post(url, assignParams, {
        event,
        headers: { 'X-Client-Tag': traceParent() }
      })
      .then(resolve)
      .catch((res: ICommonRespDTO) => {
        handleCreateOrderCatch(res, url);
        reject(res);
      });
  });
};

export const cancelOrder = (
  params: IOrderCancelReq,
  event = {}
): Promise<IOrderCancelRespDTO> => {
  const url = `${api2Host}/trade/private/v1/contract/cancel`;
  return http.post(url, params, {
    event,
    headers: { 'X-Client-Tag': traceParent() }
  });
};

export const cancelAllOrder = (
  params: IOrderCancelAllReq,
  event = {}
): Promise<IOrderCancelAllRespDTO> => {
  const url = `${api2Host}/trade/private/v1/contract/cancel-totally`;
  return http.post(url, params, {
    event,
    headers: { 'X-Client-Tag': traceParent() }
  });
};

/**
 * 活动单/条件单 等止盈止损
 * @param params
 * @param event
 * @returns
 */
export const replaceOrder = (
  params: IReplaceOrderReq,
  event = {}
): Promise<IReplaceOrderRespDTO> => {
  const url = `${api2Host}/trade/private/v1/contract/order-amend`;
  return http.post(url, params, {
    event,
    headers: { 'X-Client-Tag': traceParent() }
  });
};

export const getTpslAllList = (): Promise<IGetTpslAllListRespDTO> => {
  return http.get(
    `${api2Host}/trade/private/v1/contract/tpsl-list?timeStamp=${Date.now()}`
  );
};

export const getClosedPnlList = (
  params: IGetClosedPnlListReq
): Promise<IGetClosedPnlListRespDTO> => {
  const url = `${api2Host}/trade/private/v1/contract/close-pnl`;
  return http.get(
    `${url}?symbol=${params.symbol}&limit=20&timeStamp=${Date.now()}`
  );
};

export const handleCreateOrderCatch = (res: ICommonRespDTO, url: string) => {
  if (res?.code === 9000001) {
    // toastErrorMsg(i18n.t('requestTimeOut'), url);
  } else {
    const data = res?.data ?? res;
    // toastErrorMsg(
    //   {
    //     ...data,
    //     type: 'notify',
    //     title: i18n.t('orderCreateFailureTitle'),
    //   },
    //   url,
    // );
  }
};
