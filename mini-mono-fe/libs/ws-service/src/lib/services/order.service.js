import i18n from '../common/components/LinearPositions/utils/i18n';
import toastErrorMsg from '../common/components/LinearPositions/utils/toastErrorMsg';
import http from '../common/utils/http';
import { api2Host } from '../common/utils/routerSwitchEvent';

const privateApiHost = () => `${api2Host}/private`;
const privateApiHostV3 = () => `${api2Host}/v3/private`;

const PRE_CREATE_CONDITION_API = () =>
  `${privateApiHost()}/linear/stop-order/pre-create`;
const PRE_CREATE_API = () => `${privateApiHost()}/linear/order/pre-create`;
const CREATE_CONDITION_API = () =>
  `${privateApiHost()}/linear/stop-order/create`;

const ORDER_CANCEL_BATCH_API = () => `${privateApiHostV3()}/order/cancel-batch`;

export const preCreateConditionOrder = (param) =>
  http.post(PRE_CREATE_CONDITION_API(), param);

export const createConditionOrder = (param) =>
  http.post(CREATE_CONDITION_API(), param, {
    meta: { showOrigin: true }
  });

export const preCreateOrder = (param, event = { sc: 20105, ec: 20106 }) =>
  new Promise((resolve, reject) => {
    http
      .post(PRE_CREATE_API(), param, {
        event
      })
      .then(resolve)
      .catch((res) => {
        if (res?.code === 9000001) {
          toastErrorMsg(i18n.t('requestTimeOut'), PRE_CREATE_API());
        } else {
          const data = res?.data ?? res;
          toastErrorMsg(
            {
              ...data,
              type: 'notify',
              title: i18n.t('orderCreateFailureTitle')
            },
            PRE_CREATE_API()
          );
        }
        reject(res);
      });
  });

// 委托列表
export const getOrderList = (params) =>
  http.get(`${privateApiHost()}/linear/tpsl/tpsl-stop-list`, {
    body: { ...params }
  });

export const cancelOrderBatch = (param) =>
  http.post(ORDER_CANCEL_BATCH_API(), param);
