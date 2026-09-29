/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import Axios, {
  AxiosRequestConfig,
  Method,
  AxiosInstance,
  AxiosResponse
} from 'axios';
import { getApiHost } from '../config';
import { GatewayResponse } from './types';
import { getHeaders, genUrl, RequestError } from './utils';
export type { GatewayResponse };
export { RequestError };

export interface WebReq {
  params?: { [index: string]: any };
  forms?: any;
}

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  contentType?: 'application/json' | 'multipart/form-data' | 'text/plain';
}

export interface Headers {
  'Content-Type': string;
}

export interface Options {
  headers?: Headers;
  config?: CustomAxiosRequestConfig;
}

export class Webapi {
  public axios: AxiosInstance;

  public reqInterceptors: number;

  public resInterceptors: number;

  constructor(options: Options) {
    this.axios = Axios.create(options.config);
    this.reqInterceptors = this.axios.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        config.headers = {
          ...config.headers,
          ...getHeaders(config)
        };
        return config;
      }
    );
    this.resInterceptors = this.axios.interceptors.response.use(
      (response: AxiosResponse<GatewayResponse>) => {
        if (response.data.ret_code === 0) {
          if (response.data.result.status_code) {
            if (response.data.result.status_code === 200) {
              return {
                ...response,
                data: response.data.result
              };
            } else {
              throw new RequestError(
                'gateway error',
                response.data.result.status_code,
                response.data
              );
            }
          } else {
            return {
              ...response,
              data: response.data.result
            };
          }
        } else if (response.data.ret_code === 10007) {
          // TODO: 针对没有登录用户、过期用户的处理，目前这块还不清晰
          // window.location.reload();
          throw new RequestError(
            response.data.ret_msg,
            response.data.ret_code,
            {},
            response.config.url
          );
        } else {
          throw new RequestError(
            response.data.ret_msg,
            response.data.ret_code,
            {},
            response.config.url
          );
        }
      }
    );
  }

  get<T>(url: string, params?: WebReq['params'], config?: AxiosRequestConfig) {
    return this.api<T>(url, { params }, 'get', config);
  }

  delete<T>(url: string, forms?: WebReq['forms'], config?: AxiosRequestConfig) {
    return this.api<T>(url, { forms }, 'delete', config);
  }

  post<T>(url: string, forms?: WebReq['forms'], config?: AxiosRequestConfig) {
    return this.api<T>(url, { forms }, 'post', config);
  }

  put<T>(url: string, forms?: WebReq['forms'], config?: AxiosRequestConfig) {
    return this.api<T>(url, { forms }, 'put', config);
  }

  patch<T>(url: string, forms?: WebReq['forms'], config?: AxiosRequestConfig) {
    return this.api<T>(url, { forms }, 'patch', config);
  }

  api<T>(
    url: string,
    req: WebReq,
    method: Method = 'get',
    config?: AxiosRequestConfig
  ): Promise<T> {
    if (url.match(/:/) || method.match(/get|delete/i)) {
      // 如果路由是带挂参的，先看params再看forms
      url = genUrl(url, req.params || req.forms);
    }
    method = method.toLocaleLowerCase() as Method;

    switch (method) {
      case 'get':
        return this.axios.get(url, config).then((res) => res.data);
      case 'delete':
        return this.axios.delete(url, config).then((res) => res.data);
      case 'post':
        return this.axios
          .post(url, req.forms || req.params, config)
          .then((res) => res.data);
      case 'put':
        return this.axios
          .put(url, req.forms || req.params, config)
          .then((res) => res.data);
      case 'patch':
        return this.axios
          .patch(url, req.forms || req.params, config)
          .then((res) => res.data);
      default:
        return this.axios.get(url, config).then((res) => res.data);
    }
  }
}

export const webapi = new Webapi({
  config: { baseURL: getApiHost(), timeout: 30000, withCredentials: true }
});
