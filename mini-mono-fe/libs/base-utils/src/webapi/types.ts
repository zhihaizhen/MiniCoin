/** service response */
export interface ServiceResponse {
  /** service status code, successful if it's 200 */
  status_code: number;
  /** data */
  [key: string]: any;
}

export interface GatewayResponse {
  /** gateway result code, successful if it's 0 */
  ret_code: number;
  /** gateway result message */
  ret_msg: string;
  /** service result */
  result: ServiceResponse;
}
