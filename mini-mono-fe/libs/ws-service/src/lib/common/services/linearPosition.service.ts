// import { v3CommonLinearPrivateApiPrefix } from '../constants/service';
import {
  IAddMarginReq,
  IGetRiskLimitListReq,
  IGetRiskLimitListRespDTO,
  IPositionListReq,
  IPositionListRespDTO,
  ISetAutoAddMarginReq,
  ISetLeverageReq,
  ISetMarginReq,
  ISetRiskLimitReq,
  ISetTpSlTsReq,
  ISwitchIsolatedReq,
  ISwitchPositionModeReq,
  ISwitchTpSlModeReq
} from '../types/services/position';
import http from '../utils/http';
import { api2Host } from '../utils/routerSwitchEvent';

// const v3PrivatetPozApiPrefix = `${v3CommonLinearPrivateApiPrefix}/position`;

export const getPositionList = (
  params: IPositionListReq
): Promise<IPositionListRespDTO> => {
  const url = `${api2Host}/trade/private/v1/position/list-all`;
  return http.get(`${url}?timeStamp=${Date.now()}`, { body: params });
};

export const setAutoAddMargin = (params: ISetAutoAddMarginReq) => {
  // const url = `${api2Host}/gw-trade/private/account/set-auto-add-margin`;
  const url = `${api2Host}/trade/private/v1/position/set-auto-margin`;

  return http.post(url, params);
};

export const setMargin = (params: ISetMarginReq) => {
  // const url = `${v3PrivatetPozApiPrefix}/set-margin`;
  const url = `${api2Host}/trade/private/v1/position/set-margin`;

  return http.post(url, params);
};

export const addMargin = (params: IAddMarginReq) => {
  // const url = `${api2Host}/gw-trade/private/account/add-margin`;
  const url = `${api2Host}/trade/private/v1/position/add-margin`;

  return http.post(url, params);
};

export const setLeverage = (
  params: ISetLeverageReq,
  event = { sc: 10111, ec: 10112 }
) => {
  // const url = `${api2Host}/gw-trade/private/account/set-leverage`;
  const url = `${api2Host}/trade/private/v1/position/set-leverage`;

  return http.post(url, params, {
    event
  });
};

export const switchIsolated = (params: ISwitchIsolatedReq) => {
  // const url = `${api2Host}/gw-trade/private/account/switch-isolated`;
  const url = `${api2Host}/trade/private/v1/position/switch-isolated`;

  return http.post(url, params);
};

export const setTpSlTs = (params: ISetTpSlTsReq, event = {}) => {
  // const url = `${api2Host}/gw-trade/private/account/set-tp-sl-ts`;
  const url = `${api2Host}/trade/private/v1/position/set-tpsl`;

  return http.post(url, params, {
    event
  });
};

export const setRiskLimit = (params: ISetRiskLimitReq) => {
  // const url = `${api2Host}/gw-trade/private/account/set-position-risk`;
  const url = `${api2Host}/trade/private/v1/position/set-risk-limit`;

  return http.post(url, params);
};

export const switchTpSlMode = (params: ISwitchTpSlModeReq, event = {}) => {
  // const url = `${api2Host}/gw-trade/private/account/switch-tpsl-mode`;
  const url = `${api2Host}/trade/private/v1/position/switch-tpsl-mode`;

  return http.post(url, params, {
    event
  });
};

export const switchPositionMode = (
  params: ISwitchPositionModeReq,
  event = {}
) => {
  // const url = `${api2Host}/gw-trade/private/account/switch-position-mode`;
  const url = `${api2Host}/trade/private/v1/position/switch-position-mode`;

  return http.post(url, params, {
    event
  });
};

export const getRiskLimitList = ({
  symbol
}: IGetRiskLimitListReq): Promise<IGetRiskLimitListRespDTO> => {
  // const url = `${api2Host}/gw-trade/private/account/position-risk`;
  const url = `${api2Host}/trade/private/v1/position/risk-limit`;

  return http.get(`${url}?symbol=${symbol}&timeStamp=${Date.now()}`);
};

export const cancelAllPosition = (params: { symbol?: string }, event = {}) => {
  // const url = `${api2Host}/contract/v3/position/close-all?_sp_category=fbu&_sp_business=usdt&_sp_response_format=portugal`;
  const url = `${api2Host}/trade/private/v1/position/close-all`;
  return http.post(url, params, {
    event
  });
};
