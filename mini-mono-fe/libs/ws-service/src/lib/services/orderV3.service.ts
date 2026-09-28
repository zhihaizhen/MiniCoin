// import pushEvent from '@region/by-gtm';
import { ORDER_ACTION, ORDER_TYPE } from '../constants/types';
import { transformNum } from '@unified/helpers';
// import i18n from '../common/components/LinearPositions/utils/i18n';
// import { v3CommonLinearPrivateApiPrefix } from '../common/constants/service'; // 已修改
import { neverGotOrderId } from '../common/model/httpAwsTips';
import { message } from 'antd';
import { handleCreateOrderCatch } from '../common/services/linearOrder.service';
import { ICommonRespDTO } from '../common/types/api';
import { IMessage, INotify } from '../common/types/components';
import {
  ICreateOrderErrorResp,
  IOrderCreateReq,
  IOrderCreateRespDTO,
  IOrderPreCreateReq,
  IOrderPreCreateRespDTO
} from '../common/types/services/order';
import http from '../common/utils/http';
import { traceParent } from '../common/utils/tranceParent';
import { getQueryParams } from '../common/utils/tools';
import { api2Host } from '../common/utils/routerSwitchEvent';
// import starkwareCrypto from '@starkware-industries/starkware-crypto-utils';
// import { getLocalStorage } from '../common/utils/storageData';
// import { isDex } from '../common/utils/env';
// import { createSignMsg } from '../common/utils/starkwareParse';

// const v3PrivateOrderApiPrefix = `${v3CommonLinearPrivateApiPrefix}/order`;

export const preCreateOrder = (
  data: IOrderPreCreateReq,
  event = { sc: 20105, ec: 20106 }
): Promise<IOrderPreCreateRespDTO> => {
  const url = `${api2Host}/trade/private/v1/contract/pre-order`;
  return new Promise((resolve, reject) => {
    http
      .post(url, data, {
        event,
        headers: { 'X-Client-Tag': traceParent() }
      })
      .then((res: IOrderPreCreateRespDTO) => {
        resolve(res);
      })
      .catch((res: ICreateOrderErrorResp) => {
        handleCreateOrderCatch(res, url);
        reject(res);
      });
  });
};

export const createOrder = (
  params: IOrderCreateReq,
  event = { sc: 20108, ec: 20109 }
): Promise<IOrderCreateRespDTO> => {
  const isDex = false;
 
  const url = `${api2Host}/trade/private/v1/contract/order`;
  let assignParams: any = { ...params };
  if (isDex) {
    // const { r, s, paramsArg } = createSignMsg(assignParams);
    // const sign_msg = {
    //   vault_sell: paramsArg[0] || '',
    //   vault_buy: paramsArg[1] || '',
    //   amount_sell: paramsArg[2] || '',
    //   amount_buy: paramsArg[3] || '',
    //   token_sell: paramsArg[4] || '',
    //   token_buy: paramsArg[5] || '',
    //   nonce: paramsArg[6] || '',
    //   expiration_timestamp: paramsArg[7] || '',
    //   fee_token: paramsArg[8] || '',
    //   fee_vault_id: paramsArg[9] || '',
    //   fee_limit: paramsArg[10] || '',
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
      .then((res: IOrderCreateRespDTO) => {
        if (res.ext_code === '130149') {
          // 止盈止损设置失败，价格校验未通过
          (message as IMessage).error('ztsl_error_code:130149');
        }
        // http-ws 如果已经存在orderId, 不提示
        // @ts-ignore
        const taskId = getQueryParams()?.taskId;
        // @ts-ignore
        const pageSourceId = getQueryParams()?.pageSourceId;
        if (taskId && pageSourceId) {
          // pushEvent(
          //   'click',
          //   'rewardHub2TradeDone',
          //   `pageSourceId=${pageSourceId},taskId=${taskId}`,
          // );
        }

        if (neverGotOrderId(res?.orderId)) {
          const priceT =
            params.orderType === ORDER_TYPE.MARKET
              ? 'marketPrice'
              : params.price;
          const sideT =
            params.side === ORDER_ACTION.BUY ? 'orderBeBought' : 'orderBeSold';
          // (notify as INotify).success(
          //   i18n.t('orderCreateSuccessTitle'),
          //   i18n.t('orderCreateSuccess', {
          //     side: sideT,
          //     qty: transformNum(params.qtyX, 1e8, 'div'),
          //     coin: params.coin,
          //     symbol: params.symbol,
          //     price: priceT,
          //   }),
          // );
        }
        resolve(res);
      })
      .catch((res: ICommonRespDTO) => {
        handleCreateOrderCatch(res, url);
        reject(res);
      });
  });
};
